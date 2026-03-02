package site

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

const sysUserID = "00000000-0000-0000-0000-000000000001"

type Service interface {
	List(filter SiteListFilter) ([]*Site, int, error)
	GetByID(id string) (*Site, error)
	Create(req CreateSiteRequest, creatorID string) (*Site, error)
	Update(id string, req UpdateSiteRequest, updaterID string) (*Site, error)
	Delete(id, updaterID string) error
	CheckNow(id, checkerID string) (*SiteCheck, error)
	HealthHistory(siteID string, days int) ([]*SiteCheck, error)
	Stats() (*SiteStats, error)
	ListPublic() ([]*PublicSite, error)
	// called by scheduler
	RunHealthChecks() error
	// called by crawler
	ListActive() ([]*Site, error)
}

type service struct {
	repo       Repository
	httpClient *http.Client
}

func NewService(repo Repository) Service {
	// HTTP client: follow redirects, 15s timeout, skip TLS verify for monitoring
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{
		Timeout:   15 * time.Second,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}
	return &service{repo: repo, httpClient: client}
}

func (s *service) List(f SiteListFilter) ([]*Site, int, error) {
	return s.repo.List(f)
}

func (s *service) GetByID(id string) (*Site, error) {
	return s.repo.GetByID(id)
}

func (s *service) Create(req CreateSiteRequest, creatorID string) (*Site, error) {
	if req.SyncIntervalMin <= 0 {
		req.SyncIntervalMin = 15
	}
	now := time.Now()
	site := &Site{
		ID:              uuid.New().String(),
		URL:             req.URL,
		Name:            req.Name,
		Platform:        req.Platform,
		PlatformVersion: req.PlatformVersion,
		BloggerBlogID:   req.BloggerBlogID,
		BloggerAPIKey:   req.BloggerAPIKey,
		SyncIntervalMin: req.SyncIntervalMin,
		Status:          "active",
		IsActive:        1,
		FakultasID:      req.FakultasID,
		UnitID:          req.UnitID,
		AdminName:       req.AdminName,
		AdminEmail:      req.AdminEmail,
		AdminPhone:      req.AdminPhone,
		Notes:           req.Notes,
		IsBehindKong:    req.IsBehindKong,
		IsSSOEnabled:    req.IsSSOEnabled,
		CreateDate:      now,
		IDCreator:       creatorID,
		LastUpdate:      now,
	}
	if err := s.repo.Create(site); err != nil {
		return nil, err
	}
	return site, nil
}

func (s *service) Update(id string, req UpdateSiteRequest, updaterID string) (*Site, error) {
	if err := s.repo.Update(id, req, updaterID); err != nil {
		return nil, err
	}
	return s.repo.GetByID(id)
}

func (s *service) Delete(id, updaterID string) error {
	return s.repo.SoftDelete(id, updaterID)
}

func (s *service) CheckNow(id, checkerID string) (*SiteCheck, error) {
	site, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("site not found")
	}
	return s.doCheck(site, checkerID)
}

func (s *service) HealthHistory(siteID string, days int) ([]*SiteCheck, error) {
	if days <= 0 || days > 90 {
		days = 30
	}
	return s.repo.HealthHistory(siteID, days)
}

func (s *service) Stats() (*SiteStats, error) {
	return s.repo.Stats()
}

func (s *service) ListPublic() ([]*PublicSite, error) {
	return s.repo.ListPublic()
}

func (s *service) ListActive() ([]*Site, error) {
	return s.repo.ListActive()
}

func (s *service) RunHealthChecks() error {
	sites, err := s.repo.ListActive()
	if err != nil {
		return fmt.Errorf("fetch active sites: %w", err)
	}

	log.Printf("🔍 Health check: %d active sites", len(sites))
	ok, fail := 0, 0

	for _, site := range sites {
		if _, err := s.doCheck(site, sysUserID); err != nil {
			log.Printf("  ✗ %s: %v", site.URL, err)
			fail++
		} else {
			ok++
		}
	}

	log.Printf("✅ Health check done: %d ok, %d fail", ok, fail)
	return nil
}

// doCheck performs the actual HTTP health check for a site
func (s *service) doCheck(site *Site, checkerID string) (*SiteCheck, error) {
	now := time.Now()
	check := &SiteCheck{
		SiteID:     site.ID,
		CheckedAt:  now,
		CreateDate: now,
		IDCreator:  checkerID,
		LastUpdate: now,
	}

	start := time.Now()
	req, err := http.NewRequest(http.MethodHead, site.URL, nil)
	if err != nil {
		// Try GET if HEAD fails
		req, err = http.NewRequest(http.MethodGet, site.URL, nil)
		if err != nil {
			check.IsUp = 0
			check.HTTPCode = 0
			errMsg := err.Error()
			check.ErrorMsg = &errMsg
			_ = s.repo.InsertCheck(check)
			return check, nil
		}
	}
	req.Header.Set("User-Agent", "MyUnila-WebMon/1.0 (+https://my.unila.ac.id/webmon)")

	resp, err := s.httpClient.Do(req)
	elapsed := int(time.Since(start).Milliseconds())
	check.ResponseTimeMs = elapsed

	if err != nil {
		check.IsUp = 0
		check.HTTPCode = 0
		errMsg := err.Error()
		if len(errMsg) > 500 {
			errMsg = errMsg[:500]
		}
		check.ErrorMsg = &errMsg
	} else {
		defer resp.Body.Close()
		check.HTTPCode = resp.StatusCode

		// Consider up if 2xx, 3xx, 4xx (site is responding)
		if resp.StatusCode >= 200 && resp.StatusCode < 600 && resp.StatusCode != 502 && resp.StatusCode != 503 {
			check.IsUp = 1
		} else {
			check.IsUp = 0
		}

		// Check SSL if HTTPS
		if resp.TLS != nil && len(resp.TLS.PeerCertificates) > 0 {
			cert := resp.TLS.PeerCertificates[0]
			expiresIn := int(time.Until(cert.NotAfter).Hours() / 24)
			sslValid := 1
			if time.Now().After(cert.NotAfter) {
				sslValid = 0
			}
			check.SSLValid = &sslValid
			check.SSLExpiryDays = &expiresIn
		}
	}

	// Persist check
	if err := s.repo.InsertCheck(check); err != nil {
		log.Printf("  ⚠ InsertCheck failed for %s: %v", site.URL, err)
	}

	// Auto-update site status if consistently down
	if check.IsUp == 0 {
		consecutiveDown, err := s.repo.CountConsecutiveDown(site.ID)
		if err == nil && consecutiveDown >= 3 && site.Status == "active" {
			_ = s.repo.UpdateStatus(site.ID, "inactive", sysUserID)
		}
	} else if check.IsUp == 1 && site.Status == "inactive" {
		// Recovered → set back to active
		_ = s.repo.UpdateStatus(site.ID, "active", sysUserID)
	}

	return check, nil
}
