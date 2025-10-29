package synclog

import "time"

// SyncLog represents a sync operation log entry
type SyncLog struct {
	ID            int64     `json:"id" db:"id"`
	EndpointName  string    `json:"endpoint_name" db:"endpoint_name"`
	EndpointKey   string    `json:"endpoint_key" db:"endpoint_key"`
	SyncType      string    `json:"sync_type" db:"sync_type"`           // manual, batch, scheduled
	Status        string    `json:"status" db:"status"`                 // success, failed, partial
	TotalRecords  int       `json:"total_records" db:"total_records"`   // Total dari API
	InsertedCount int       `json:"inserted_count" db:"inserted_count"` // Baru insert
	UpdatedCount  int       `json:"updated_count" db:"updated_count"`   // Data update
	FailedCount   int       `json:"failed_count" db:"failed_count"`     // Gagal
	SkippedCount  int       `json:"skipped_count" db:"skipped_count"`   // Di-skip
	DurationMs    int       `json:"duration_ms" db:"duration_ms"`       // Duration in milliseconds
	ErrorMessage  *string   `json:"error_message,omitempty" db:"error_message"`
	ErrorDetails  *string   `json:"error_details,omitempty" db:"error_details"`
	SyncedBy      string    `json:"synced_by" db:"synced_by"`
	SyncedAt      time.Time `json:"synced_at" db:"synced_at"`
}

// SyncLogStats represents statistics for sync logs
type SyncLogStats struct {
	TotalSyncs     int `json:"total_syncs" db:"total_syncs"`
	SuccessCount   int `json:"success_count" db:"success_count"`
	FailedCount    int `json:"failed_count" db:"failed_count"`
	PartialCount   int `json:"partial_count" db:"partial_count"`
	TotalRecords   int `json:"total_records" db:"total_records"`
	TotalInserted  int `json:"total_inserted" db:"total_inserted"`
	TotalUpdated   int `json:"total_updated" db:"total_updated"`
	TotalFailed    int `json:"total_failed" db:"total_failed"`
	AvgDurationMs  int `json:"avg_duration_ms" db:"avg_duration_ms"`
	LastSyncAt     *time.Time `json:"last_sync_at,omitempty" db:"last_sync_at"`
}

// SyncLogListRequest for pagination and filtering
type SyncLogListRequest struct {
	Page         int    `query:"page"`
	Limit        int    `query:"limit"`
	Status       string `query:"status"`        // success, failed, partial
	EndpointKey  string `query:"endpoint_key"`  // agama, negara, etc
	SyncType     string `query:"sync_type"`     // manual, batch, scheduled
	Search       string `query:"search"`        // search in endpoint_name or synced_by
}

// SyncLogListResponse for paginated results
type SyncLogListResponse struct {
	Data       []SyncLog `json:"data"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"total_pages"`
}
