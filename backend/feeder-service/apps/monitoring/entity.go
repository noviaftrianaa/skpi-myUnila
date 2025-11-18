package monitoring

import "time"

// SyncProgress represents a sync operation in progress
type SyncProgress struct {
	ID            string    `json:"id"`              // Unique ID untuk tracking
	EndpointName  string    `json:"endpoint_name"`   // Nama endpoint yang di-sync
	EndpointKey   string    `json:"endpoint_key"`    // Key endpoint (mahasiswa, dll)
	SyncType      string    `json:"sync_type"`       // manual, batch, scheduled
	Status        string    `json:"status"`          // running, completed, failed
	Progress      int       `json:"progress"`        // 0-100 percentage
	CurrentRecord int       `json:"current_record"`  // Record ke berapa yang sedang diproses
	TotalRecords  int       `json:"total_records"`   // Total records yang akan diproses
	StartedAt     time.Time `json:"started_at"`      // Kapan dimulai
	UpdatedAt     time.Time `json:"updated_at"`      // Kapan terakhir update
	Message       string    `json:"message"`         // Status message
	SyncedBy      string    `json:"synced_by"`       // Siapa yang melakukan sync
	Error         string    `json:"error,omitempty"` // Error message jika ada
}

// MonitoringStats represents overall monitoring statistics
type MonitoringStats struct {
	ActiveSyncs    int       `json:"active_syncs"`    // Jumlah sync yang sedang berjalan
	CompletedToday int       `json:"completed_today"` // Selesai hari ini
	FailedToday    int       `json:"failed_today"`    // Gagal hari ini
	TotalDuration  int64     `json:"total_duration"`  // Total durasi dalam ms
	LastSyncAt     time.Time `json:"last_sync_at"`    // Sync terakhir
}

// MonitoringListResponse for API response
type MonitoringListResponse struct {
	ActiveSyncs []SyncProgress  `json:"active_syncs"`
	Stats       MonitoringStats `json:"stats"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
