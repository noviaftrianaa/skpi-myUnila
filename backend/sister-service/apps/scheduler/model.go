package scheduler

import "time"

// ScheduledSync represents a scheduled sync job
type ScheduledSync struct {
	ID             int       `db:"id" json:"id"`
	Name           string    `db:"name" json:"name"`
	Description    string    `db:"description" json:"description"`
	SyncType       string    `db:"sync_type" json:"sync_type"`         // 'referensi', 'dosen', 'dosen_foto', 'dosen_dokumen', 'penugasan', 'penelitian', 'pengabdian', 'pendidikan', 'publikasi', 'riwayat_pekerjaan', 'riwayat_fungsional', 'jabatan_fungsional', 'jabatan_struktural', 'tugas_tambahan', 'sertifikasi_dosen', 'bidang_ilmu'
	EndpointKey    *string   `db:"endpoint_key" json:"endpoint_key"`   // For referensi only
	CronExpression string    `db:"cron_expression" json:"cron_expression"`
	ScheduleTime   *time.Time `db:"schedule_time" json:"schedule_time"` // User-friendly time display
	IsActive       bool      `db:"is_active" json:"is_active"`
	LastRunAt      *time.Time `db:"last_run_at" json:"last_run_at"`
	NextRunAt      *time.Time `db:"next_run_at" json:"next_run_at"`
	CreatedBy      string    `db:"created_by" json:"created_by"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at" json:"updated_at"`
}

// CreateScheduledSyncRequest is the request to create a scheduled sync
type CreateScheduledSyncRequest struct {
	Name         string  `json:"name" validate:"required"`
	Description  string  `json:"description"`
	SyncType     string  `json:"sync_type" validate:"required,oneof=referensi dosen dosen_foto dosen_dokumen penugasan penelitian pengabdian pendidikan publikasi riwayat_pekerjaan riwayat_fungsional jabatan_fungsional jabatan_struktural tugas_tambahan sertifikasi_dosen bidang_ilmu"`
	EndpointKey  *string `json:"endpoint_key"`
	ScheduleDate string  `json:"schedule_date" validate:"required"` // Format: YYYY-MM-DD
	ScheduleTime string  `json:"schedule_time" validate:"required"` // Format: HH:mm
	IsActive     bool    `json:"is_active"`
	CreatedBy    string  `json:"created_by" validate:"required"`
}

// UpdateScheduledSyncRequest is the request to update a scheduled sync
type UpdateScheduledSyncRequest struct {
	Name         *string `json:"name"`
	Description  *string `json:"description"`
	ScheduleDate *string `json:"schedule_date"` // Format: YYYY-MM-DD
	ScheduleTime *string `json:"schedule_time"` // Format: HH:mm
	IsActive     *bool   `json:"is_active"`
}

// ScheduledSyncListResponse represents the list response
type ScheduledSyncListResponse struct {
	Data       []ScheduledSync `json:"data"`
	Total      int             `json:"total"`
	Page       int             `json:"page"`
	Limit      int             `json:"limit"`
	TotalPages int             `json:"total_pages"`
}
