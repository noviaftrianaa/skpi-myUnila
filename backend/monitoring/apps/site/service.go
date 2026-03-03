package site

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
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
	CheckAll(checkerID string) (total, ok, fail int)
	IsCheckAllRunning() bool
	HealthHistory(siteID string, days int) ([]*SiteCheck, error)
	Stats() (*SiteStats, error)
	ListPublic() ([]*PublicSite, error)
	ListSMSUnits() ([]*SMSUnit, error)
	// called by scheduler
	RunHealthChecks() error
	// called by crawler
	ListActive() ([]*Site, error)
}

type service struct {
	repo            Repository
	httpClient      *http.Client
	checkAllRunning int32
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
		IDSMS:           req.IDSMS,
		AdminName:       req.AdminName,
		AdminEmail:      req.AdminEmail,
		AdminPhone:      req.AdminPhone,
		AdminWhatsApp:   req.AdminWhatsApp,
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

func (s *service) ListSMSUnits() ([]*SMSUnit, error) {
	return s.repo.ListSMSUnits()
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

func (s *service) CheckAll(checkerID string) (total, ok, fail int) {
	if !atomic.CompareAndSwapInt32(&s.checkAllRunning, 0, 1) {
		return 0, 0, 0 // already running
	}
	defer atomic.StoreInt32(&s.checkAllRunning, 0)

	sites, err := s.repo.ListAllSites()
	if err != nil {
		log.Printf("CheckAll: failed to list sites: %v", err)
		return 0, 0, 0
	}

	total = len(sites)
	log.Printf("🔍 CheckAll: checking %d sites...", total)

	var okCount, failCount int32
	var wg sync.WaitGroup
	sem := make(chan struct{}, 20) // max 20 concurrent checks

	for _, site := range sites {
		wg.Add(1)
		go func(st *Site) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			if _, err := s.doCheck(st, checkerID); err != nil {
				atomic.AddInt32(&failCount, 1)
			} else {
				atomic.AddInt32(&okCount, 1)
			}
		}(site)
	}

	wg.Wait()
	ok = int(okCount)
	fail = int(failCount)
	log.Printf("✅ CheckAll done: %d total, %d ok, %d fail", total, ok, fail)

	// Best-effort auto-mapping id_sms for sites that don't have one yet
	go s.autoMapSMS(sites)

	return
}

func (s *service) IsCheckAllRunning() bool {
	return atomic.LoadInt32(&s.checkAllRunning) == 1
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

	// Ensure URL has scheme
	siteURL := site.URL
	if !strings.HasPrefix(siteURL, "http://") && !strings.HasPrefix(siteURL, "https://") {
		siteURL = "https://" + siteURL
	}

	start := time.Now()
	req, err := http.NewRequest(http.MethodHead, siteURL, nil)
	if err != nil {
		// Try GET if HEAD fails
		req, err = http.NewRequest(http.MethodGet, siteURL, nil)
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

// autoMapSMS tries to match sites (without id_sms) to pdrd.sms units by domain or name.
func (s *service) autoMapSMS(sites []*Site) {
	units, err := s.repo.ListSMSUnits()
	if err != nil || len(units) == 0 {
		return
	}

	mapped := 0
	for _, st := range sites {
		if st.IDSMS != nil && *st.IDSMS != "" {
			continue // already mapped
		}

		siteDomain := extractDomain(st.URL)
		siteNameLower := strings.ToLower(st.Name)

		for _, u := range units {
			// Match by domain
			if u.Website != nil && *u.Website != "" {
				unitDomain := extractDomain(*u.Website)
				if unitDomain != "" && siteDomain != "" && unitDomain == siteDomain {
					idSms := u.IDSMS
					_ = s.repo.Update(st.ID, UpdateSiteRequest{IDSMS: &idSms}, sysUserID)
					mapped++
					break
				}
			}
			// Match by singkatan (abbreviation) in site name
			if u.Singkatan != nil && *u.Singkatan != "" {
				abbr := strings.ToLower(*u.Singkatan)
				if len(abbr) >= 3 && strings.Contains(siteNameLower, abbr) {
					idSms := u.IDSMS
					_ = s.repo.Update(st.ID, UpdateSiteRequest{IDSMS: &idSms}, sysUserID)
					mapped++
					break
				}
			}
		}
	}

	if mapped > 0 {
		log.Printf("🔗 AutoMapSMS: mapped %d sites to pdrd.sms units", mapped)
	}
}

// extractDomain returns the hostname from a URL string.
func extractDomain(rawURL string) string {
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	return strings.ToLower(u.Hostname())
}
