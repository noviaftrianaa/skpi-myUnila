package detector

import (
	"log"
	"regexp"
	"strings"
	"sync"
	"time"
	"unicode"

	"monitoring-service/apps/keywords"
	"monitoring-service/apps/threats"
)

const (
	ThreatScoreThreshold = 5
	TitleMultiplier      = 1.5 // title/H1 match = 1.5x weight
	sysUserID            = "00000000-0000-0000-0000-000000000001"
)

// compiledKeyword holds a keyword with its compiled regex for fast matching
type compiledKeyword struct {
	ID       int
	Keyword  string
	Category string
	Weight   int
	Re       *regexp.Regexp
}

// Detector is responsible for scanning page content for threat keywords
type Detector struct {
	mu       sync.RWMutex
	patterns []*compiledKeyword
	kwSvc    keywords.Service
	thrSvc   threats.Service
}

func New(kwSvc keywords.Service, thrSvc threats.Service) *Detector {
	d := &Detector{kwSvc: kwSvc, thrSvc: thrSvc}
	d.reload()
	return d
}

// reload fetches active keywords from DB and recompiles patterns
func (d *Detector) reload() {
	kws, err := d.kwSvc.ListActive()
	if err != nil {
		log.Printf("⚠️  Detector: failed to load keywords: %v", err)
		return
	}

	compiled := make([]*compiledKeyword, 0, len(kws))
	for _, kw := range kws {
		// Build word-boundary-aware regex (case insensitive, unicode)
		// Use \b for ASCII boundaries; for Indonesian text also match spaces
		pattern := `(?i)(\b|[\s\.,!\?])` + regexp.QuoteMeta(kw.Keyword) + `(\b|[\s\.,!\?]|$)`
		re, err := regexp.Compile(pattern)
		if err != nil {
			// fallback: simple case-insensitive contains
			re = regexp.MustCompile(`(?i)` + regexp.QuoteMeta(kw.Keyword))
		}
		compiled = append(compiled, &compiledKeyword{
			ID:       kw.ID,
			Keyword:  kw.Keyword,
			Category: kw.Category,
			Weight:   kw.Weight,
			Re:       re,
		})
	}

	d.mu.Lock()
	d.patterns = compiled
	d.mu.Unlock()
	log.Printf("✅ Detector: loaded %d active keywords", len(compiled))
}

// ReloadKeywords refreshes patterns from DB (called periodically or after keyword update)
func (d *Detector) ReloadKeywords() {
	d.reload()
}

// PageResult holds the result of scanning a single page
type PageResult struct {
	Score           int
	Category        string // dominant category
	MatchedKeywords []string
	IsTheat         bool
	Snippet         string // HTML evidence of matched keywords
}

// ScanPage scans a page's content and title for threat keywords.
// titleAndH1 is concatenated title+H1 text (weighted higher).
// bodyText is the full visible page text.
func (d *Detector) ScanPage(titleAndH1, bodyText string) *PageResult {
	d.mu.RLock()
	patterns := d.patterns
	d.mu.RUnlock()

	titleNorm := normalizeText(titleAndH1)
	bodyNorm := normalizeText(bodyText)

	score := 0
	catScore := map[string]int{}
	matched := []string{}
	seen := map[string]bool{}

	for _, p := range patterns {
		kwStr := strings.ToLower(p.Keyword)

		// Check title/H1 match (1.5x weight)
		inTitle := p.Re.MatchString(titleNorm)
		inBody := p.Re.MatchString(bodyNorm)

		if !inTitle && !inBody {
			continue
		}
		if seen[kwStr] {
			continue
		}
		seen[kwStr] = true
		matched = append(matched, p.Keyword)

		pts := p.Weight
		if inTitle {
			pts = int(float64(pts) * TitleMultiplier)
		}
		score += pts
		catScore[p.Category] += pts
	}

	// Determine dominant category
	dominant := "generic"
	maxCat := 0
	for cat, s := range catScore {
		if s > maxCat {
			maxCat = s
			dominant = cat
		}
	}

	return &PageResult{
		Score:           score,
		Category:        dominant,
		MatchedKeywords: matched,
		IsTheat:         score >= ThreatScoreThreshold,
	}
}

// ReportIfThreat checks scan result and inserts a detected_threat if threshold exceeded.
// Returns true if threat was reported.
func (d *Detector) ReportIfThreat(
	siteID string,
	crawlPageID *int,
	pageURL, pageTitle string,
	result *PageResult,
) bool {
	if !result.IsTheat {
		return false
	}

	now := time.Now()
	var snippetPtr *string
	if result.Snippet != "" {
		snippetPtr = &result.Snippet
	}
	threat := &threats.DetectedThreat{
		SiteID:          siteID,
		CrawlPageID:     crawlPageID,
		PageURL:         pageURL,
		PageTitle:       &pageTitle,
		MatchedKeywords: strings.Join(result.MatchedKeywords, ", "),
		ThreatScore:     result.Score,
		Category:        result.Category,
		Snippet:         snippetPtr,
		Status:          "pending",
		DetectedAt:      now,
		CreateDate:      now,
		IDCreator:       sysUserID,
		LastUpdate:      now,
	}

	id, err := d.thrSvc.Report(threat)
	if err != nil {
		log.Printf("⚠️  Detector: failed to report threat for %s: %v", pageURL, err)
		return false
	}
	if id > 0 {
		log.Printf("🚨 Threat detected: %s (score=%d, cat=%s, keywords=%s)",
			pageURL, result.Score, result.Category, strings.Join(result.MatchedKeywords, ","))
	}
	return id > 0
}

// normalizeText lowercases and collapses whitespace for consistent matching
func normalizeText(s string) string {
	s = strings.ToLower(s)
	// Replace non-printable / non-letter chars with space
	var sb strings.Builder
	prevSpace := false
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == '_' {
			sb.WriteRune(r)
			prevSpace = false
		} else {
			if !prevSpace {
				sb.WriteRune(' ')
			}
			prevSpace = true
		}
	}
	return strings.TrimSpace(sb.String())
}
