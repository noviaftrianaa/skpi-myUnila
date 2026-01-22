package monitoring

import "time"

// SyncProgress represents the progress of a sync operation
type SyncProgress struct {
	ID            string    `json:"id"`
	EndpointName  string    `json:"endpoint_name"`
	EndpointKey   string    `json:"endpoint_key"`
	SyncType      string    `json:"sync_type"` // 'manual', 'batch', 'scheduled'
	Status        string    `json:"status"`    // 'running', 'completed', 'failed'
	Progress      int       `json:"progress"`  // 0-100%
	CurrentRecord int       `json:"current_record"`
	TotalRecords  int       `json:"total_records"`
	StartedAt     time.Time `json:"started_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Message       string    `json:"message"`
	Error         string    `json:"error,omitempty"`
	SyncedBy      string    `json:"synced_by"`
}

// MonitoringStats represents monitoring statistics
type MonitoringStats struct {
	ActiveSyncs    int       `json:"active_syncs"`
	CompletedToday int       `json:"completed_today"`
	FailedToday    int       `json:"failed_today"`
	TotalDuration  int64     `json:"total_duration_ms"`
	LastSyncAt     time.Time `json:"last_sync_at,omitempty"`
}

// MonitoringListResponse represents the response for active syncs
type MonitoringListResponse struct {
	ActiveSyncs []SyncProgress  `json:"active_syncs"`
	Stats       MonitoringStats `json:"stats"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
