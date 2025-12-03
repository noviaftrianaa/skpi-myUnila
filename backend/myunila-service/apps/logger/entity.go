package logger

import "time"

// SyncLog represents a synchronization log entry
type SyncLog struct {
	ID           int64      `json:"id" db:"id"`
	EndpointName string     `json:"endpoint_name" db:"endpoint_name"`
	EndpointKey  string     `json:"endpoint_key" db:"endpoint_key"`
	SyncType     string     `json:"sync_type" db:"sync_type"` // 'manual', 'batch', 'scheduled'
	Status       string     `json:"status" db:"status"`       // 'success', 'failed', 'partial'
	APICode      string     `json:"api_code" db:"api_code"`   // API source identifier (SIKEP)

	// Record counts
	TotalRecords  int `json:"total_records" db:"total_records"`
	InsertedCount int `json:"inserted_count" db:"inserted_count"`
	UpdatedCount  int `json:"updated_count" db:"updated_count"`
	FailedCount   int `json:"failed_count" db:"failed_count"`
	SkippedCount  int `json:"skipped_count" db:"skipped_count"`

	// Performance
	DurationMs *int `json:"duration_ms,omitempty" db:"duration_ms"`

	// Error handling
	ErrorMessage *string `json:"error_message,omitempty" db:"error_message"`
	ErrorDetails *string `json:"error_details,omitempty" db:"error_details"`

	// Audit trail
	SyncedBy string    `json:"synced_by" db:"synced_by"`
	SyncedAt time.Time `json:"synced_at" db:"synced_at"`
}

// CreateSyncLogRequest represents a request to create a sync log entry
type CreateSyncLogRequest struct {
	EndpointName  string  `json:"endpoint_name" validate:"required"`
	EndpointKey   string  `json:"endpoint_key" validate:"required"`
	SyncType      string  `json:"sync_type" validate:"required,oneof=manual batch scheduled"`
	Status        string  `json:"status" validate:"required,oneof=success failed partial"`
	APICode       string  `json:"api_code"`
	TotalRecords  int     `json:"total_records"`
	InsertedCount int     `json:"inserted_count"`
	UpdatedCount  int     `json:"updated_count"`
	FailedCount   int     `json:"failed_count"`
	SkippedCount  int     `json:"skipped_count"`
	DurationMs    *int    `json:"duration_ms,omitempty"`
	ErrorMessage  *string `json:"error_message,omitempty"`
	ErrorDetails  *string `json:"error_details,omitempty"`
	SyncedBy      string  `json:"synced_by" validate:"required"`
}

// SyncLogFilter represents filter options for querying sync logs
type SyncLogFilter struct {
	EndpointName *string    `json:"endpoint_name,omitempty"`
	EndpointKey  *string    `json:"endpoint_key,omitempty"`
	Status       *string    `json:"status,omitempty"`
	SyncType     *string    `json:"sync_type,omitempty"`
	APICode      *string    `json:"api_code,omitempty"`
	DateFrom     *time.Time `json:"date_from,omitempty"`
	DateTo       *time.Time `json:"date_to,omitempty"`
	Limit        int        `json:"limit"`
	Offset       int        `json:"offset"`
}

// SyncLogResponse represents paginated response for sync logs
type SyncLogResponse struct {
	Data       []SyncLog `json:"data"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"total_pages"`
}
