package threats

import "time"

// DetectedThreat maps to monitoring.detected_threats
type DetectedThreat struct {
	ID              int        `json:"id"               db:"id"`
	SiteID          string     `json:"site_id"          db:"site_id"`
	CrawlPageID     *int       `json:"crawl_page_id"    db:"crawl_page_id"`
	PageURL         string     `json:"page_url"         db:"page_url"`
	PageTitle       *string    `json:"page_title"       db:"page_title"`
	MatchedKeywords string     `json:"matched_keywords" db:"matched_keywords"`
	ThreatScore     int        `json:"threat_score"     db:"threat_score"`
	Category        string     `json:"category"         db:"category"`
	Snippet         *string    `json:"snippet"          db:"snippet"`
	Status          string     `json:"status"           db:"status"`
	DetectedAt      time.Time  `json:"detected_at"      db:"detected_at"`
	ConfirmedAt     *time.Time `json:"confirmed_at"     db:"confirmed_at"`
	ConfirmedBy     *string    `json:"confirmed_by"     db:"confirmed_by"`
	ResolvedAt      *time.Time `json:"resolved_at"      db:"resolved_at"`
	ResolvedBy      *string    `json:"resolved_by"      db:"resolved_by"`
	Notes           *string    `json:"notes"            db:"notes"`
	// Audit
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-"            db:"soft_delete"`

	// Joined
	SiteName      *string `json:"site_name,omitempty"      db:"-"`
	SiteURL       *string `json:"site_url,omitempty"       db:"-"`
	AdminName     *string `json:"admin_name,omitempty"     db:"-"`
	AdminEmail    *string `json:"admin_email,omitempty"    db:"-"`
	AdminWhatsApp *string `json:"admin_whatsapp,omitempty" db:"-"`
}

type UpdateStatusRequest struct {
	Status string  `json:"status" validate:"required"` // confirmed / false_positive / resolved
	Notes  *string `json:"notes"`
}

type ThreatFilter struct {
	Status   string `query:"status"`
	SiteID   string `query:"site_id"`
	Category string `query:"category"`
	MinScore int    `query:"min_score"`
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
}

type ThreatStats struct {
	Total         int                      `json:"total"`
	Pending       int                      `json:"pending"`
	Confirmed     int                      `json:"confirmed"`
	FalsePositive int                      `json:"false_positive"`
	Resolved      int                      `json:"resolved"`
	ByCategory    []map[string]interface{} `json:"by_category"`
	TopSites      []map[string]interface{} `json:"top_sites"`
	TopFakultas   []map[string]interface{} `json:"top_fakultas"`
}

// AlertNotification maps to monitoring.alert_notifications
type AlertNotification struct {
	ThreatID   *int      `db:"threat_id"`
	Channel    string    `db:"channel"`
	Recipient  string    `db:"recipient"`
	Subject    string    `db:"subject"`
	Body       *string   `db:"body"`
	IsSent     int       `db:"is_sent"`
	CreateDate time.Time `db:"create_date"`
	IDCreator  string    `db:"id_creator"`
	LastUpdate time.Time `db:"last_update"`
}
