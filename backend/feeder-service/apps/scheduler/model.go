package scheduler

import "time"

// ScheduledSync represents a scheduled sync job for mahasiswa
type ScheduledSync struct {
	ID             int        `db:"id" json:"id"`
	Name           string     `db:"name" json:"name"`
	Description    string     `db:"description" json:"description"`
	SyncType       string     `db:"sync_type" json:"sync_type"`           // 'mahasiswa' for feeder
	EndpointKey    *string    `db:"endpoint_key" json:"endpoint_key"`     // JSON config: {"angkatan":["2023"],"id_prodi":"xxx"}
	CronExpression string     `db:"cron_expression" json:"cron_expression"`
	ScheduleTime   *time.Time `db:"schedule_time" json:"schedule_time"`   // User-friendly time display
	IsActive       bool       `db:"is_active" json:"is_active"`
	LastRunAt      *time.Time `db:"last_run_at" json:"last_run_at"`
	NextRunAt      *time.Time `db:"next_run_at" json:"next_run_at"`
	CreatedBy      string     `db:"created_by" json:"created_by"`
	CreatedAt      time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at" json:"updated_at"`

	// Helper fields (not stored in DB, parsed from endpoint_key)
	Angkatan       *string    `db:"-" json:"angkatan,omitempty"`         // Comma-separated: "2023,2024"
	IDProdi        *string    `db:"-" json:"id_prodi,omitempty"`         // Single prodi ID
}

// CreateScheduledSyncRequest represents request to create a scheduled sync
type CreateScheduledSyncRequest struct {
	Name         string  `json:"name" validate:"required"`
	Description  string  `json:"description"`
	ScheduleDate string  `json:"schedule_date" validate:"required"` // Format: YYYY-MM-DD
	ScheduleTime string  `json:"schedule_time" validate:"required"` // Format: HH:mm
	Angkatan     *string `json:"angkatan"`                          // Comma-separated: "2023,2024"
	IDProdi      *string `json:"id_prodi"`                          // Single prodi ID
	IsActive     bool    `json:"is_active"`
	CreatedBy    string  `json:"created_by" validate:"required"`
}

// UpdateScheduledSyncRequest represents request to update a scheduled sync
type UpdateScheduledSyncRequest struct {
	Name         *string `json:"name"`
	Description  *string `json:"description"`
	ScheduleDate *string `json:"schedule_date"` // Format: YYYY-MM-DD
	ScheduleTime *string `json:"schedule_time"` // Format: HH:mm
	Angkatan     *string `json:"angkatan"`      // Comma-separated
	IDProdi      *string `json:"id_prodi"`
	IsActive     *bool   `json:"is_active"`
}

// ScheduledSyncListResponse represents paginated list of scheduled syncs
type ScheduledSyncListResponse struct {
	Data       []ScheduledSync `json:"data"`
	Total      int             `json:"total"`
	Page       int             `json:"page"`
	Limit      int             `json:"limit"`
	TotalPages int             `json:"total_pages"`
}
