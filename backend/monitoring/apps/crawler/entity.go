package crawler

import "time"

// CrawlJob represents a crawl job request (monitoring.crawl_jobs)
type CrawlJob struct {
	ID          int        `json:"id"           db:"id"`
	SiteID      *string    `json:"site_id"      db:"site_id"`   // NULL = all active sites
	JobType     string     `json:"job_type"     db:"job_type"`  // full / incremental / single
	Status      string     `json:"status"       db:"status"`    // queued / running / done / failed
	TriggeredBy string     `json:"triggered_by" db:"triggered_by"`
	StartedAt   *time.Time `json:"started_at"   db:"started_at"`
	FinishedAt  *time.Time `json:"finished_at"  db:"finished_at"`
	ErrorMsg    *string    `json:"error_msg"    db:"error_msg"`
	Notes       *string    `json:"notes"        db:"notes"`
	// Audit
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-"           db:"soft_delete"`
}

// CrawlSession represents one crawl run for one site (monitoring.crawl_sessions)
type CrawlSession struct {
	ID            int        `json:"id"              db:"id"`
	JobID         int        `json:"job_id"          db:"job_id"`
	SiteID        string     `json:"site_id"         db:"site_id"`
	Status        string     `json:"status"          db:"status"`
	TotalPages    int        `json:"total_pages"     db:"total_pages"`
	ThreatCount   int        `json:"threat_count"    db:"threat_count"`
	StartedAt     *time.Time `json:"started_at"      db:"started_at"`
	FinishedAt    *time.Time `json:"finished_at"     db:"finished_at"`
	ErrorMsg      *string    `json:"error_msg"       db:"error_msg"`
	// Audit
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-"           db:"soft_delete"`
}

// CrawlPage represents a single crawled page (monitoring.crawl_pages)
type CrawlPage struct {
	ID        int     `json:"id"           db:"id"`
	SessionID int     `json:"session_id"   db:"session_id"`
	SiteID    string  `json:"site_id"      db:"site_id"`
	PageURL   string  `json:"page_url"     db:"page_url"`
	PageTitle *string `json:"page_title"   db:"page_title"`
	HTTPCode  int     `json:"http_code"    db:"http_code"`
	ContentHash *string `json:"content_hash" db:"content_hash"`
	HasThreat   int     `json:"has_threat"   db:"has_threat"`
	ThreatScore int     `json:"threat_score" db:"threat_score"`
	// Redirect chain tracking
	RedirectChain       *string `json:"redirect_chain,omitempty"  db:"redirect_chain"`
	HasExternalRedirect int     `json:"has_external_redirect"     db:"has_external_redirect"`
	// Cloaking detection
	IsCloaked            int `json:"is_cloaked"             db:"is_cloaked"`
	CloakingScore        int `json:"cloaking_score"         db:"cloaking_score"`
	GooglebotThreatScore int `json:"googlebot_threat_score" db:"googlebot_threat_score"`
	// AMP scan
	AMPUrl         *string `json:"amp_url,omitempty"  db:"amp_url"`
	AMPThreatScore int     `json:"amp_threat_score"   db:"amp_threat_score"`

	CrawledAt  time.Time `json:"crawled_at" db:"crawled_at"`
	// Audit
	CreateDate time.Time `json:"-" db:"create_date"`
	IDCreator  string    `json:"-" db:"id_creator"`
	LastUpdate time.Time `json:"-" db:"last_update"`
	IDUpdater  *string   `json:"-" db:"id_updater"`
	SoftDelete int       `json:"-" db:"soft_delete"`
}

// CreateJobRequest is the body for POST /api/v1/crawl/jobs
type CreateJobRequest struct {
	SiteID  *string `json:"site_id"`  // NULL = crawl all
	JobType string  `json:"job_type"` // full / incremental / single
	Notes   *string `json:"notes"`
}

// JobFilter for GET /api/v1/crawl/jobs
type JobFilter struct {
	Status string `query:"status"`
	SiteID string `query:"site_id"`
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
}

// CrawlStats summary
type CrawlStats struct {
	TotalJobs     int `json:"total_jobs"`
	RunningJobs   int `json:"running_jobs"`
	TotalSessions int `json:"total_sessions"`
	TotalPages    int `json:"total_pages"`
	TotalThreats  int `json:"total_threats"`
}
