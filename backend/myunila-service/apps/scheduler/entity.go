package scheduler

import "time"

// ScheduledSync represents a scheduled sync job
type ScheduledSync struct {
	ID             int        `db:"id" json:"id"`
	Name           string     `db:"name" json:"name"`
	Description    string     `db:"description" json:"description"`
	SyncType       string     `db:"sync_type" json:"sync_type"`         // 'pegawai'
	EndpointKey    *string    `db:"endpoint_key" json:"endpoint_key"`   // Optional filter key
	CronExpression string     `db:"cron_expression" json:"cron_expression"`
	ScheduleTime   *time.Time `db:"schedule_time" json:"schedule_time"` // User-friendly time display
	IsActive       bool       `db:"is_active" json:"is_active"`
	LastRunAt      *time.Time `db:"last_run_at" json:"last_run_at"`
	NextRunAt      *time.Time `db:"next_run_at" json:"next_run_at"`
	CreatedBy      string     `db:"created_by" json:"created_by"`
	CreatedAt      time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at" json:"updated_at"`
}

// CreateScheduledSyncRequest is the request to create a scheduled sync
type CreateScheduledSyncRequest struct {
	Name         string  `json:"name" validate:"required"`
	Description  string  `json:"description"`
	SyncType     string  `json:"sync_type" validate:"required,oneof=pegawai unit_organisasi siakadu_mahasiswa siakadu_kelas siakadu_kurikulum siakadu_matakuliah siakadu_khs siakadu_kuliah"`
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

// SyncTypeInfo represents info about a sync type
type SyncTypeInfo struct {
	Type        string `json:"type"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// GetSyncTypes returns available sync types
func GetSyncTypes() []SyncTypeInfo {
	return []SyncTypeInfo{
		{
			Type:        "pegawai",
			Name:        "Pegawai SIKEP",
			Description: "Sinkronisasi data pegawai dari SIKEP",
		},
		{
			Type:        "unit_organisasi",
			Name:        "Unit Organisasi SMS",
			Description: "Sinkronisasi data unit organisasi dari SMS ke Manakses",
		},
		{
			Type:        "siakadu_mahasiswa",
			Name:        "Mahasiswa SIAKADU",
			Description: "Sinkronisasi data mahasiswa dari SIAKADU",
		},
		{
			Type:        "siakadu_kelas",
			Name:        "Kelas SIAKADU",
			Description: "Sinkronisasi data kelas dari SIAKADU",
		},
		{
			Type:        "siakadu_kurikulum",
			Name:        "Kurikulum SIAKADU",
			Description: "Sinkronisasi kurikulum dari SIAKADU",
		},
		{
			Type:        "siakadu_matakuliah",
			Name:        "Mata Kuliah SIAKADU",
			Description: "Sinkronisasi mata kuliah dari SIAKADU",
		},
		{
			Type:        "siakadu_khs",
			Name:        "KHS SIAKADU",
			Description: "Sinkronisasi nilai KHS dari SIAKADU",
		},
		{
			Type:        "siakadu_kuliah",
			Name:        "Status Kuliah SIAKADU",
			Description: "Sinkronisasi status kuliah dari SIAKADU",
		},
	}
}
