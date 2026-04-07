package crawler

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"monitoring-service/apps/detector"
	"monitoring-service/apps/site"
	"monitoring-service/internal/config"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/extensions"
)

const (
	sysUserID     = "00000000-0000-0000-0000-000000000001"
	maxConcurrent = 3
	googlebotUA   = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
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
	// DeleteJob soft-deletes a job and its related sessions/pages
	DeleteJob(id int) error
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

func (s *service) DeleteJob(id int) error {
	return s.repo.SoftDeleteJob(id)
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

// redirectEntry represents one hop in a redirect chain
type redirectEntry struct {
	StatusCode int    `json:"status"`
	From       string `json:"from"`
	To         string `json:"to"`
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

	// Per-URL redirect chain tracking (populated by redirect handler)
	redirectChains := sync.Map{} // map[string][]redirectEntry

	// Ensure URL has scheme
	siteURL := sv.URL
	if !strings.HasPrefix(siteURL, "http://") && !strings.HasPrefix(siteURL, "https://") {
		siteURL = "https://" + siteURL
	}

	// Extract domain from URL for AllowedDomains
	domain := extractDomain(siteURL)

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

	// Track redirect chains
	c.SetRedirectHandler(func(req *http.Request, via []*http.Request) error {
		if len(via) >= 10 {
			return fmt.Errorf("stopped after 10 redirects")
		}
		if len(via) > 0 {
			origin := via[0].URL.String()
			entry := redirectEntry{
				From: req.Response.Request.URL.String(),
				To:   req.URL.String(),
			}
			if req.Response != nil {
				entry.StatusCode = req.Response.StatusCode
			}
			val, _ := redirectChains.LoadOrStore(origin, []redirectEntry{})
			chain := val.([]redirectEntry)
			chain = append(chain, entry)
			redirectChains.Store(origin, chain)
		}
		return nil
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

		// Scan for threats (normal UA)
		result := s.det.ScanPage(titleAndH1, bodyText)

		hasThreat := 0
		if result.IsTheat {
			hasThreat = 1
			result.Snippet = extractEvidence(e, result.MatchedKeywords)
		}

		// Build redirect chain info for this page
		var redirectChainJSON *string
		hasExtRedirect := 0
		if val, ok := redirectChains.Load(pageURL); ok {
			chain := val.([]redirectEntry)
			if len(chain) > 0 {
				for _, hop := range chain {
					if extractDomain(hop.To) != domain {
						hasExtRedirect = 1
						break
					}
				}
				if b, err := json.Marshal(chain); err == nil {
					s := string(b)
					redirectChainJSON = &s
				}
			}
		}

		// Deep scan: cloaking detection (Googlebot UA comparison)
		isCloaked := 0
		cloakingScore := 0
		googlebotThreatScore := 0
		var cloakResult *detector.PageResult

		if s.cfg.Crawler.CloakingEnabled {
			log.Printf("🔍 Deep scan [cloaking]: %s", pageURL)
			cloakResult, cloakingScore = s.cloakingScan(pageURL, bodyText, titleAndH1, result)
			if cloakResult != nil {
				googlebotThreatScore = cloakResult.Score
				log.Printf("🔍 Deep scan [cloaking] result: %s normal_score=%d googlebot_score=%d diff=%d%%",
					pageURL, result.Score, cloakResult.Score, cloakingScore)
				if cloakResult.IsTheat && !result.IsTheat {
					// Googlebot sees threat but normal UA doesn't → CLOAKING
					isCloaked = 1
					hasThreat = 1
					log.Printf("🕵️ Cloaking detected: %s (normal=%d, googlebot=%d, diff=%d%%)",
						pageURL, result.Score, cloakResult.Score, cloakingScore)
				}
			}
		}

		// Deep scan: AMP page detection
		var ampURL *string
		ampThreatScore := 0
		if s.cfg.Crawler.AMPScanEnabled {
			log.Printf("🔍 Deep scan [AMP]: %s", pageURL)
			ampURL, ampThreatScore = s.ampScan(e, pageURL)
		}

		// Save crawl page
		pageNow := time.Now()
		var titlePtr *string
		if titleText != "" {
			titlePtr = &titleText
		}
		cp := &CrawlPage{
			SessionID:            sessID,
			SiteID:               sv.ID,
			PageURL:              pageURL,
			PageTitle:            titlePtr,
			HTTPCode:             e.Response.StatusCode,
			ContentHash:          hashPtr,
			HasThreat:            hasThreat,
			ThreatScore:          result.Score,
			RedirectChain:        redirectChainJSON,
			HasExternalRedirect:  hasExtRedirect,
			IsCloaked:            isCloaked,
			CloakingScore:        cloakingScore,
			GooglebotThreatScore: googlebotThreatScore,
			AMPUrl:               ampURL,
			AMPThreatScore:       ampThreatScore,
			CrawledAt:            pageNow,
			CreateDate:           pageNow,
			IDCreator:            sysUserID,
			LastUpdate:           pageNow,
		}
		pageID, err := s.repo.InsertPage(cp)
		if err != nil {
			log.Printf("⚠️  Crawler: failed to save page %s: %v", pageURL, err)
			return
		}

		// Report threat: normal scan found it
		extra := &detector.ThreatExtra{
			IsCloaked:     isCloaked == 1,
			RedirectChain: redirectChainJSON,
		}
		if result.IsTheat {
			pageIDPtr := &pageID
			if s.det.ReportIfThreat(sv.ID, pageIDPtr, pageURL, titleText, result, extra) {
				mu.Lock()
				threatCount++
				mu.Unlock()
			}
		}

		// Report cloaking threat (Googlebot-only detection)
		if isCloaked == 1 && cloakResult != nil && cloakResult.IsTheat && !result.IsTheat {
			cloakResult.Snippet = "[CLOAKED] Content only visible to Googlebot"
			pageIDPtr := &pageID
			if s.det.ReportIfThreat(sv.ID, pageIDPtr, pageURL, titleText, cloakResult, extra) {
				mu.Lock()
				threatCount++
				mu.Unlock()
			}
		}
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Printf("⚠️  Crawler: error on %s: %v", r.Request.URL, err)
	})

	if err := c.Visit(siteURL); err != nil {
		log.Printf("⚠️  Crawler: failed to visit %s: %v", siteURL, err)
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

// cloakingScan fetches the same URL with Googlebot UA and compares content.
// Returns the Googlebot scan result and a similarity difference score (0-100).
func (s *service) cloakingScan(pageURL, normalBody, normalTitle string, normalResult *detector.PageResult) (*detector.PageResult, int) {
	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("GET", pageURL, nil)
	if err != nil {
		return nil, 0
	}
	req.Header.Set("User-Agent", googlebotUA)

	resp, err := client.Do(req)
	if err != nil {
		return nil, 0
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024)) // max 2MB
	if err != nil {
		return nil, 0
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(bodyBytes)))
	if err != nil {
		return nil, 0
	}

	// Extract text from Googlebot response
	titleText := doc.Find("title").First().Text()
	h1Text := doc.Find("h1").First().Text()
	gbTitleAndH1 := titleText + " " + h1Text

	var sb strings.Builder
	doc.Find("p, h1, h2, h3, h4, h5, h6, li, td, th, span, div, article, section, a").Each(func(_ int, sel *goquery.Selection) {
		txt := strings.TrimSpace(sel.Text())
		if txt != "" {
			sb.WriteString(txt)
			sb.WriteString(" ")
		}
	})
	gbBody := strings.TrimSpace(sb.String())

	// Calculate content similarity (Jaccard-like on word sets)
	diffScore := contentDifference(normalBody, gbBody)

	// Scan Googlebot content for threats
	gbResult := s.det.ScanPage(gbTitleAndH1, gbBody)

	// If content differs significantly or Googlebot sees threats → flag
	threshold := int(s.cfg.Crawler.CloakingSimilarityThreshold * 100)
	if diffScore >= threshold || (gbResult.IsTheat && !normalResult.IsTheat) {
		return gbResult, diffScore
	}

	return gbResult, diffScore
}

// contentDifference calculates a difference score (0-100) between two texts.
// 0 = identical, 100 = completely different.
func contentDifference(a, b string) int {
	wordsA := wordSet(a)
	wordsB := wordSet(b)

	if len(wordsA) == 0 && len(wordsB) == 0 {
		return 0
	}

	intersection := 0
	for w := range wordsA {
		if wordsB[w] {
			intersection++
		}
	}

	union := len(wordsA) + len(wordsB) - intersection
	if union == 0 {
		return 0
	}

	similarity := float64(intersection) / float64(union)
	return int((1 - similarity) * 100)
}

func wordSet(text string) map[string]bool {
	words := strings.Fields(strings.ToLower(text))
	set := make(map[string]bool, len(words))
	for _, w := range words {
		if len(w) > 2 { // skip very short words
			set[w] = true
		}
	}
	return set
}

// ampScan checks if the page has an AMP version and scans it for threats.
// Returns the AMP URL (if found) and its threat score.
func (s *service) ampScan(e *colly.HTMLElement, pageURL string) (*string, int) {
	// Check for <link rel="amphtml" href="..."> in the page
	ampHref := ""
	e.ForEach("link[rel='amphtml']", func(_ int, el *colly.HTMLElement) {
		if ampHref == "" {
			ampHref = el.Attr("href")
		}
	})

	// If no explicit AMP link, try Google AMP cache URL
	if ampHref == "" {
		u, err := url.Parse(pageURL)
		if err != nil {
			return nil, 0
		}
		ampHref = fmt.Sprintf("https://cdn.ampproject.org/c/s/%s%s", u.Host, u.Path)
	}

	// Fetch AMP page
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", ampHref, nil)
	if err != nil {
		return nil, 0
	}
	req.Header.Set("User-Agent", googlebotUA)

	resp, err := client.Do(req)
	if err != nil {
		return nil, 0
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, 0
	}

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024))
	if err != nil {
		return nil, 0
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(bodyBytes)))
	if err != nil {
		return nil, 0
	}

	titleText := doc.Find("title").First().Text()
	h1Text := doc.Find("h1").First().Text()
	ampTitle := titleText + " " + h1Text

	var sb strings.Builder
	doc.Find("p, h1, h2, h3, h4, h5, h6, li, td, th, span, div, article, section, a").Each(func(_ int, sel *goquery.Selection) {
		txt := strings.TrimSpace(sel.Text())
		if txt != "" {
			sb.WriteString(txt)
			sb.WriteString(" ")
		}
	})
	ampBody := strings.TrimSpace(sb.String())

	if ampBody == "" {
		return nil, 0
	}

	ampResult := s.det.ScanPage(ampTitle, ampBody)
	if ampResult.Score > 0 {
		return &ampHref, ampResult.Score
	}

	return nil, 0
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

// extractEvidence finds HTML elements containing matched keywords and returns their
// outer HTML as evidence. This shows hidden spam links, injected anchors, etc.
// Max 30 evidence items, max 8KB total.
func extractEvidence(e *colly.HTMLElement, matchedKeywords []string) string {
	if len(matchedKeywords) == 0 {
		return ""
	}

	// Build lowercase keyword list for matching
	kwLower := make([]string, len(matchedKeywords))
	for i, kw := range matchedKeywords {
		kwLower[i] = strings.ToLower(kw)
	}

	var evidence []string
	seen := map[string]bool{}
	maxItems := 30
	maxTotalBytes := 8192

	// Search through link elements first (most relevant for hidden spam)
	e.DOM.Find("a, li, p, h1, h2, h3, span").Each(func(_ int, sel *goquery.Selection) {
		if len(evidence) >= maxItems {
			return
		}
		text := strings.ToLower(strings.TrimSpace(sel.Text()))
		if text == "" {
			return
		}

		for _, kw := range kwLower {
			if !strings.Contains(text, kw) {
				continue
			}

			html, err := goquery.OuterHtml(sel)
			if err != nil || html == "" {
				continue
			}
			html = strings.TrimSpace(html)

			// Skip very large elements (likely wrapper divs)
			if len(html) > 500 {
				continue
			}
			// Deduplicate
			if seen[html] {
				continue
			}
			seen[html] = true
			evidence = append(evidence, html)
			break
		}
	})

	result := strings.Join(evidence, "\n")
	if len(result) > maxTotalBytes {
		result = result[:maxTotalBytes]
	}
	return result
}
