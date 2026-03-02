package crawler

import (
	"crypto/sha256"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"monitoring-service/apps/detector"
	"monitoring-service/apps/site"
	"monitoring-service/internal/config"

	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/extensions"
)

const (
	sysUserID     = "00000000-0000-0000-0000-000000000001"
	maxConcurrent = 3
)

type Service interface {
	// CreateJob creates a crawl job record (queued status)
	CreateJob(req CreateJobRequest, triggeredBy string) (*CrawlJob, error)
	// RunJob executes the job immediately (blocks until done)
	RunJob(jobID int) error
	// TriggerFull queues + runs a full crawl for all active sites (called by scheduler)
	TriggerFull(triggeredBy string) error
	// ListJobs returns paginated crawl jobs
	ListJobs(f JobFilter) ([]*CrawlJob, int, error)
	// GetJob returns a single crawl job with its sessions
	GetJob(id int) (*CrawlJob, error)
	// ListSessions returns sessions for a job
	ListSessions(jobID int) ([]*CrawlSession, error)
	// Stats returns aggregated crawler statistics
	Stats() (*CrawlStats, error)
}

type service struct {
	repo    Repository
	siteSvc site.Service
	det     *detector.Detector
	cfg     *config.Config
}

func NewService(repo Repository, siteSvc site.Service, det *detector.Detector, cfg *config.Config) Service {
	return &service{repo: repo, siteSvc: siteSvc, det: det, cfg: cfg}
}

func (s *service) CreateJob(req CreateJobRequest, triggeredBy string) (*CrawlJob, error) {
	now := time.Now()
	job := &CrawlJob{
		SiteID:      req.SiteID,
		JobType:     req.JobType,
		Status:      "queued",
		TriggeredBy: triggeredBy,
		Notes:       req.Notes,
		CreateDate:  now,
		IDCreator:   triggeredBy,
		LastUpdate:  now,
	}
	id, err := s.repo.InsertJob(job)
	if err != nil {
		return nil, err
	}
	return s.repo.GetJobByID(id)
}

func (s *service) GetJob(id int) (*CrawlJob, error) {
	return s.repo.GetJobByID(id)
}

func (s *service) ListJobs(f JobFilter) ([]*CrawlJob, int, error) {
	return s.repo.ListJobs(f)
}

func (s *service) ListSessions(jobID int) ([]*CrawlSession, error) {
	return s.repo.ListSessionsByJob(jobID)
}

func (s *service) Stats() (*CrawlStats, error) {
	return s.repo.Stats()
}

func (s *service) TriggerFull(triggeredBy string) error {
	job, err := s.CreateJob(CreateJobRequest{JobType: "full"}, triggeredBy)
	if err != nil {
		return err
	}
	go func() {
		if err := s.RunJob(job.ID); err != nil {
			log.Printf("⚠️  Crawler: job %d failed: %v", job.ID, err)
		}
	}()
	return nil
}

func (s *service) RunJob(jobID int) error {
	job, err := s.repo.GetJobByID(jobID)
	if err != nil {
		return fmt.Errorf("job not found: %w", err)
	}

	if err := s.repo.UpdateJobStarted(jobID); err != nil {
		return err
	}

	// Reload keywords before starting
	s.det.ReloadKeywords()

	// Load sites
	var sites []*site.Site
	if job.SiteID != nil {
		// Single site
		sv, err := s.siteSvc.GetByID(*job.SiteID)
		if err != nil {
			return s.failJob(jobID, fmt.Sprintf("site not found: %v", err))
		}
		sites = []*site.Site{sv}
	} else {
		// All active sites
		sites, err = s.siteSvc.ListActive()
		if err != nil {
			return s.failJob(jobID, fmt.Sprintf("failed to load sites: %v", err))
		}
	}

	log.Printf("🕷️  Crawler job %d: crawling %d sites", jobID, len(sites))

	// Semaphore for max concurrent
	sem := make(chan struct{}, maxConcurrent)
	var wg sync.WaitGroup

	for _, sv := range sites {
		sv := sv
		wg.Add(1)
		sem <- struct{}{}
		go func() {
			defer wg.Done()
			defer func() { <-sem }()
			s.crawlSite(jobID, sv)
		}()
	}
	wg.Wait()

	return s.repo.UpdateJobFinished(jobID, "done", nil)
}

// crawlSite runs a colly crawl for one site and saves results to DB
func (s *service) crawlSite(jobID int, sv *site.Site) {
	now := time.Now()
	sess := &CrawlSession{
		JobID:      jobID,
		SiteID:     sv.ID,
		Status:     "queued",
		CreateDate: now,
		IDCreator:  sysUserID,
		LastUpdate: now,
	}
	sessID, err := s.repo.InsertSession(sess)
	if err != nil {
		log.Printf("⚠️  Crawler: failed to insert session for %s: %v", sv.URL, err)
		return
	}
	if err := s.repo.UpdateSessionStarted(sessID); err != nil {
		log.Printf("⚠️  Crawler: failed to start session %d: %v", sessID, err)
	}

	maxDepth := s.cfg.Crawler.MaxDepth
	maxPages := s.cfg.Crawler.MaxPages
	rateMs := s.cfg.Crawler.RateLimitMs

	pageCount := 0
	threatCount := 0
	var mu sync.Mutex

	// Extract domain from URL for AllowedDomains
	domain := extractDomain(sv.URL)

	c := colly.NewCollector(
		colly.MaxDepth(maxDepth),
		colly.AllowedDomains(domain),
		colly.Async(false),
	)

	extensions.RandomUserAgent(c)
	c.UserAgent = "MyUnila-WebMon/1.0 (+https://my.unila.ac.id/webmon)"

	// Rate limit: 1 request per rateMs milliseconds per domain
	_ = c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Delay:       time.Duration(rateMs) * time.Millisecond,
		RandomDelay: 200 * time.Millisecond,
	})

	c.OnHTML("html", func(e *colly.HTMLElement) {
		mu.Lock()
		if pageCount >= maxPages {
			mu.Unlock()
			return
		}
		pageCount++
		mu.Unlock()

		pageURL := e.Request.URL.String()

		// Extract title and H1
		titleText := e.ChildText("title")
		h1Text := e.ChildText("h1")
		titleAndH1 := titleText + " " + h1Text

		// Extract visible body text (exclude script/style)
		bodyText := extractVisibleText(e)

		// Compute content hash for dedup
		hash := fmt.Sprintf("%x", sha256.Sum256([]byte(bodyText)))
		var hashPtr *string
		if hash != "" {
			hashPtr = &hash
		}

		// Scan for threats
		result := s.det.ScanPage(titleAndH1, bodyText)

		hasThreat := 0
		if result.IsTheat {
			hasThreat = 1
		}

		// Save crawl page
		pageNow := time.Now()
		var titlePtr *string
		if titleText != "" {
			titlePtr = &titleText
		}
		cp := &CrawlPage{
			SessionID:   sessID,
			SiteID:      sv.ID,
			PageURL:     pageURL,
			PageTitle:   titlePtr,
			HTTPCode:    e.Response.StatusCode,
			ContentHash: hashPtr,
			HasThreat:   hasThreat,
			ThreatScore: result.Score,
			CrawledAt:   pageNow,
			CreateDate:  pageNow,
			IDCreator:   sysUserID,
			LastUpdate:  pageNow,
		}
		pageID, err := s.repo.InsertPage(cp)
		if err != nil {
			log.Printf("⚠️  Crawler: failed to save page %s: %v", pageURL, err)
			return
		}

		// Report threat if detected
		if result.IsTheat {
			pageIDPtr := &pageID
			if s.det.ReportIfThreat(sv.ID, pageIDPtr, pageURL, titleText, result) {
				mu.Lock()
				threatCount++
				mu.Unlock()
			}
		}
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Printf("⚠️  Crawler: error on %s: %v", r.Request.URL, err)
	})

	if err := c.Visit(sv.URL); err != nil {
		log.Printf("⚠️  Crawler: failed to visit %s: %v", sv.URL, err)
	}
	c.Wait()

	mu.Lock()
	pages := pageCount
	threats := threatCount
	mu.Unlock()

	if err := s.repo.UpdateSessionFinished(sessID, pages, threats, "done", nil); err != nil {
		log.Printf("⚠️  Crawler: failed to finish session %d: %v", sessID, err)
	}
	log.Printf("✅ Crawler: site=%s pages=%d threats=%d", sv.URL, pages, threats)
}

func (s *service) failJob(jobID int, msg string) error {
	errMsg := msg
	_ = s.repo.UpdateJobFinished(jobID, "failed", &errMsg)
	return fmt.Errorf("%s", msg)
}

// extractDomain strips scheme and path from URL, returns bare domain
func extractDomain(rawURL string) string {
	u := rawURL
	u = strings.TrimPrefix(u, "https://")
	u = strings.TrimPrefix(u, "http://")
	if idx := strings.Index(u, "/"); idx >= 0 {
		u = u[:idx]
	}
	return u
}

// extractVisibleText collects visible text from HTML (excludes script/style)
func extractVisibleText(e *colly.HTMLElement) string {
	var sb strings.Builder
	e.ForEach("p, h1, h2, h3, h4, h5, h6, li, td, th, span, div, article, section, a", func(_ int, el *colly.HTMLElement) {
		txt := strings.TrimSpace(el.Text)
		if txt != "" {
			sb.WriteString(txt)
			sb.WriteString(" ")
		}
	})
	return strings.TrimSpace(sb.String())
}
