package site

import "time"

// Site represents a monitored web site (monitoring.sites table)
type Site struct {
	ID              string     `json:"id"               db:"id"`
	URL             string     `json:"url"              db:"url"`
	Name            string     `json:"name"             db:"name"`
	Platform        string     `json:"platform"         db:"platform"`
	PlatformVersion *string    `json:"platform_version" db:"platform_version"`
	BloggerBlogID   *string    `json:"blogger_blog_id"  db:"blogger_blog_id"`
	BloggerAPIKey   *string    `json:"blogger_api_key,omitempty" db:"blogger_api_key"`
	SyncIntervalMin int        `json:"sync_interval_min" db:"sync_interval_min"`
	LastSyncedAt    *time.Time `json:"last_synced_at"   db:"last_synced_at"`
	Status          string     `json:"status"           db:"status"`
	IsActive        int        `json:"is_active"        db:"is_active"`
	FakultasID      *string    `json:"fakultas_id"      db:"fakultas_id"`
	UnitID          *string    `json:"unit_id"          db:"unit_id"`
	AdminName       *string    `json:"admin_name"       db:"admin_name"`
	AdminEmail      *string    `json:"admin_email"      db:"admin_email"`
	AdminPhone      *string    `json:"admin_phone"      db:"admin_phone"`
	Notes           *string    `json:"notes"            db:"notes"`
	IsBehindKong    int        `json:"is_behind_kong"   db:"is_behind_kong"`
	IsSSOEnabled    int        `json:"is_sso_enabled"   db:"is_sso_enabled"`
	// Audit
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-"            db:"soft_delete"`

	// Joined: latest check
	LastCheck *SiteCheckSummary `json:"last_check,omitempty" db:"-"`
}

// SiteCheck represents a single health check record (monitoring.site_checks)
type SiteCheck struct {
	ID             int        `json:"id"              db:"id"`
	SiteID         string     `json:"site_id"         db:"site_id"`
	CheckedAt      time.Time  `json:"checked_at"      db:"checked_at"`
	HTTPCode       int        `json:"http_code"       db:"http_code"`
	ResponseTimeMs int        `json:"response_time_ms" db:"response_time_ms"`
	IsUp           int        `json:"is_up"           db:"is_up"`
	SSLValid       *int       `json:"ssl_valid"       db:"ssl_valid"`
	SSLExpiryDays  *int       `json:"ssl_expiry_days" db:"ssl_expiry_days"`
	ErrorMsg       *string    `json:"error_msg"       db:"error_msg"`
	// Audit
	CreateDate time.Time `json:"-" db:"create_date"`
	IDCreator  string    `json:"-" db:"id_creator"`
	LastUpdate time.Time `json:"-" db:"last_update"`
	IDUpdater  *string   `json:"-" db:"id_updater"`
	SoftDelete int       `json:"-" db:"soft_delete"`
}

// SiteCheckSummary is a lightweight check summary for embedding in Site
type SiteCheckSummary struct {
	CheckedAt      time.Time `json:"checked_at"`
	HTTPCode       int       `json:"http_code"`
	ResponseTimeMs int       `json:"response_time_ms"`
	IsUp           int       `json:"is_up"`
	SSLExpiryDays  *int      `json:"ssl_expiry_days"`
}

// CreateSiteRequest is the request body for POST /api/v1/sites
type CreateSiteRequest struct {
	URL             string  `json:"url"              validate:"required,url"`
	Name            string  `json:"name"             validate:"required,max=200"`
	Platform        string  `json:"platform"         validate:"required"`
	PlatformVersion *string `json:"platform_version"`
	BloggerBlogID   *string `json:"blogger_blog_id"`
	BloggerAPIKey   *string `json:"blogger_api_key"`
	SyncIntervalMin int     `json:"sync_interval_min"`
	FakultasID      *string `json:"fakultas_id"`
	UnitID          *string `json:"unit_id"`
	AdminName       *string `json:"admin_name"`
	AdminEmail      *string `json:"admin_email"`
	AdminPhone      *string `json:"admin_phone"`
	Notes           *string `json:"notes"`
	IsBehindKong    int     `json:"is_behind_kong"`
	IsSSOEnabled    int     `json:"is_sso_enabled"`
}

// UpdateSiteRequest is the request body for PUT /api/v1/sites/:id
type UpdateSiteRequest struct {
	URL             *string `json:"url"`
	Name            *string `json:"name"`
	Platform        *string `json:"platform"`
	PlatformVersion *string `json:"platform_version"`
	BloggerBlogID   *string `json:"blogger_blog_id"`
	BloggerAPIKey   *string `json:"blogger_api_key"`
	SyncIntervalMin *int    `json:"sync_interval_min"`
	Status          *string `json:"status"`
	IsActive        *int    `json:"is_active"`
	FakultasID      *string `json:"fakultas_id"`
	UnitID          *string `json:"unit_id"`
	AdminName       *string `json:"admin_name"`
	AdminEmail      *string `json:"admin_email"`
	AdminPhone      *string `json:"admin_phone"`
	Notes           *string `json:"notes"`
	IsBehindKong    *int    `json:"is_behind_kong"`
	IsSSOEnabled    *int    `json:"is_sso_enabled"`
}

// SiteListFilter is the query filter for GET /api/v1/sites
type SiteListFilter struct {
	Status     string `query:"status"`
	Platform   string `query:"platform"`
	FakultasID string `query:"fakultas_id"`
	Search     string `query:"search"`
	Page       int    `query:"page"`
	Limit      int    `query:"limit"`
}

// SiteStats is the aggregate stats response
type SiteStats struct {
	Total        int                      `json:"total"`
	Active       int                      `json:"active"`
	Inactive     int                      `json:"inactive"`
	Compromised  int                      `json:"compromised"`
	Maintenance  int                      `json:"maintenance"`
	OnlineNow    int                      `json:"online_now"`
	OfflineNow   int                      `json:"offline_now"`
	ByPlatform   []map[string]interface{} `json:"by_platform"`
	ByFakultas   []map[string]interface{} `json:"by_fakultas"`
}

// PublicSite is the public-facing minimal site info
type PublicSite struct {
	ID         string  `json:"id"          db:"id"`
	URL        string  `json:"url"         db:"url"`
	Name       string  `json:"name"        db:"name"`
	Status     string  `json:"status"      db:"status"`
	FakultasID *string `json:"fakultas_id" db:"fakultas_id"`
}
