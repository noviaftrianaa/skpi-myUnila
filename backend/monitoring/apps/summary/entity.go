package summary

import "time"

// DailySummary maps to monitoring.daily_summary
type DailySummary struct {
	ID                   int       `json:"id"                     db:"id"`
	SummaryDate          string    `json:"summary_date"           db:"summary_date"` // date as string YYYY-MM-DD
	TotalSitesMonitored  int       `json:"total_sites_monitored"  db:"total_sites_monitored"`
	SitesOnline          int       `json:"sites_online"           db:"sites_online"`
	SitesOffline         int       `json:"sites_offline"          db:"sites_offline"`
	SitesCompromised     int       `json:"sites_compromised"      db:"sites_compromised"`
	NewThreatsCount      int       `json:"new_threats_count"      db:"new_threats_count"`
	ResolvedThreatsCount int       `json:"resolved_threats_count" db:"resolved_threats_count"`
	ActiveThreatsCount   int       `json:"active_threats_count"   db:"active_threats_count"`
	OverallStatus        string    `json:"overall_status"         db:"overall_status"` // aman / waspada / bahaya
	TopThreatCategories  *string   `json:"top_threat_categories"  db:"top_threat_categories"` // JSON string
	CreateDate           time.Time `json:"-"                      db:"create_date"`
	IDCreator            string    `json:"-"                      db:"id_creator"`
	LastUpdate           time.Time `json:"-"                      db:"last_update"`
	IDUpdater            *string   `json:"-"                      db:"id_updater"`
	SoftDelete           int       `json:"-"                      db:"soft_delete"`
}

// PublicStatus is the response for GET /v1/public/status
type PublicStatus struct {
	Status          string    `json:"status"`           // aman / waspada / bahaya
	LastScan        *string   `json:"last_scan"`        // last site_checks time
	SitesMonitored  int       `json:"sites_monitored"`
	ActiveThreats   int       `json:"active_threats"`
	SitesOnline     int       `json:"sites_online"`
	SitesOffline    int       `json:"sites_offline"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// PublicStats is the response for GET /v1/public/stats
type PublicStats struct {
	TotalSites       int                      `json:"total_sites"`
	ActiveSites      int                      `json:"active_sites"`
	TotalKeywords    int                      `json:"total_keywords"`
	TotalThreats     int                      `json:"total_threats"`
	ActiveThreats    int                      `json:"active_threats"`
	ResolvedThreats  int                      `json:"resolved_threats"`
	ThreatsByCategory []map[string]interface{} `json:"threats_by_category"`
}
