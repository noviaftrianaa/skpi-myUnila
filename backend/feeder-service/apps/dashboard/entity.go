package dashboard

import "time"

// DashboardStats represents the overall dashboard statistics
type DashboardStats struct {
	TotalRecordsSynced int64           `json:"total_records_synced"`
	TotalEndpoints     int             `json:"total_endpoints"`
	SyncedEndpoints    int             `json:"synced_endpoints"`
	SuccessRate        float64         `json:"success_rate"`
	LastSyncTime       *time.Time      `json:"last_sync_time"`
	APIStatus          string          `json:"api_status"` // healthy, degraded, offline
	ModuleStats        []ModuleStat    `json:"module_stats"`
	RecentSyncs        []RecentSync    `json:"recent_syncs"`
	QuickStats         QuickStats      `json:"quick_stats"`
}

// ModuleStat represents statistics for a single module
type ModuleStat struct {
	Name        string     `json:"name"`
	Key         string     `json:"key"`
	Description string     `json:"description"`
	TotalCount  int64      `json:"total_count"`
	LastSync    *time.Time `json:"last_sync"`
	Status      string     `json:"status"` // active, inactive, error
	Href        string     `json:"href"`
}

// RecentSync represents a recent sync activity
type RecentSync struct {
	ID           int64      `json:"id"`
	EndpointName string     `json:"endpoint_name"`
	EndpointKey  string     `json:"endpoint_key"`
	Status       string     `json:"status"`
	TotalRecords int        `json:"total_records"`
	SyncedCount  int        `json:"synced_count"`
	FailedCount  int        `json:"failed_count"`
	DurationMs   *int       `json:"duration_ms"`
	SyncedBy     string     `json:"synced_by"`
	SyncedAt     time.Time  `json:"synced_at"`
}

// QuickStats represents quick statistics summary
type QuickStats struct {
	TotalMahasiswa       int64 `json:"total_mahasiswa"`
	TotalMahasiswaAktif  int64 `json:"total_mahasiswa_aktif"`
	TotalKelasKuliah     int64 `json:"total_kelas_kuliah"`
	TotalNilaiPerkuliahan int64 `json:"total_nilai_perkuliahan"`
	TotalTranskripNilai  int64 `json:"total_transkrip_nilai"`
	TotalPrestasi        int64 `json:"total_prestasi"`
	TotalAktivitas       int64 `json:"total_aktivitas"`
	TotalMatkul          int64 `json:"total_matkul"`
}
