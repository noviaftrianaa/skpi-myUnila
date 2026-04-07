package google_gsc

import "time"

// GSCRemovalLog maps to monitoring.gsc_removal_logs
type GSCRemovalLog struct {
	ID           int64      `json:"id"            db:"id"`
	ThreatID     int        `json:"threat_id"     db:"threat_id"`
	URL          string     `json:"url"           db:"url"`
	Action       string     `json:"action"        db:"action"`     // URL_DELETED / URL_UPDATED
	GSCRequestID *string    `json:"gsc_request_id,omitempty" db:"gsc_request_id"`
	Status       string     `json:"status"        db:"status"`     // submitted / success / failed / rate_limited / skipped
	SubmittedBy  *string    `json:"submitted_by"  db:"submitted_by"`
	SubmittedAt  time.Time  `json:"submitted_at"  db:"submitted_at"`
	ErrorMessage *string    `json:"error_message,omitempty" db:"error_message"`
	CreateDate   time.Time  `json:"-"             db:"create_date"`
	IDCreator    string     `json:"-"             db:"id_creator"`
	LastUpdate   time.Time  `json:"-"             db:"last_update"`
	IDUpdater    *string    `json:"-"             db:"id_updater"`
	SoftDelete   int        `json:"-"             db:"soft_delete"`
}

// RemoveURLRequest is the body for POST /api/v1/gsc/remove
type RemoveURLRequest struct {
	ThreatID int    `json:"threat_id" validate:"required"`
	URL      string `json:"url"       validate:"required"`
	Action   string `json:"action"`   // URL_DELETED (default) atau URL_UPDATED
}

// QuotaStatus tracks daily API usage
type QuotaStatus struct {
	DailyLimit     int    `json:"daily_limit"`
	UsedToday      int    `json:"used_today"`
	Remaining      int    `json:"remaining"`
	ResetAt        string `json:"reset_at"` // next midnight
	QuotaExceeded  bool   `json:"quota_exceeded"`
}

// LogFilter for GET /api/v1/gsc/logs
type LogFilter struct {
	ThreatID int    `query:"threat_id"`
	Status   string `query:"status"`
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
}
