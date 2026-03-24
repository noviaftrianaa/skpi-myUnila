package akademik

import (
	"time"
)

// ========================================
// Kelas Entities
// ========================================

// KelasListItem - Kelas for list view
type KelasListItem struct {
	IDKelas    string     `db:"id_kelas" json:"id_kelas"`
	IdSemester *string    `db:"id_semester" json:"id_semester"`
	NamaKelas  *string    `db:"nama_kelas" json:"nama_kelas"`
	IdMK       *string    `db:"id_mk" json:"id_mk"`
	NamaMK     *string    `db:"nama_mk" json:"nama_mk"`
	SKSMK      *float64   `db:"sks_mk" json:"sks_mk"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Kurikulum Entities
// ========================================

// KurikulumListItem - Kurikulum for list view
type KurikulumListItem struct {
	IDKurikulum    *string    `db:"id_kurikulum" json:"id_kurikulum"`
	Semester       *int       `db:"semester" json:"semester"`
	IdMataKuliah   *string    `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	KodeMK         *string    `db:"kode_mk" json:"kode_mk"`
	SKS            *float64   `db:"sks" json:"sks"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// MataKuliah Entities
// ========================================

// MatakuliahListItem - MataKuliah for list view
type MatakuliahListItem struct {
	IdMataKuliah   string     `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah string     `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	KodeMK         string     `db:"kode_mk" json:"kode_mk"`
	SKS            *float64   `db:"sks" json:"sks"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Jadwal Entities
// ========================================

// JadwalListItem - Jadwal for list view
type JadwalListItem struct {
	IDJadwal     string     `db:"id_jadwal" json:"id_jadwal"`
	IDKelas      *string    `db:"id_kelas" json:"id_kelas"`
	IdSemester   *string    `db:"id_semester" json:"id_semester"`
	PertemuanKe  *int       `db:"pertemuan_ke" json:"pertemuan_ke"`
	TglJadwal    *time.Time `db:"tgl_jadwal" json:"tgl_jadwal"`
	WaktuMulai   *string    `db:"waktu_mulai" json:"waktu_mulai"`
	WaktuSelesai *string    `db:"waktu_selesai" json:"waktu_selesai"`
	Lokasi       *string    `db:"lokasi" json:"lokasi"`
	LastSync     *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Common Entities
// ========================================

// PaginatedResult - Generic paginated list result
type PaginatedResult struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// ProdiInfo for batch operations
type ProdiInfo struct {
	IdUnit string  `db:"id_unit" json:"id_unit"`
	NmUnit *string `db:"nm_unit" json:"nm_unit"`
}

// ProdiAkademikSyncResult per-prodi result
type ProdiAkademikSyncResult struct {
	IdUnit    string      `json:"id_unit"`
	NmUnit    string      `json:"nm_unit"`
	Matakuliah *SyncResult `json:"matakuliah,omitempty"`
	Kurikulum  *SyncResult `json:"kurikulum,omitempty"`
	Kelas      *SyncResult `json:"kelas,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IdSemester   string `json:"id_semester"`
	IdUnit       string `json:"id_unit"`
	ThnKurikulum int    `json:"thn_kurikulum"`
	Page         int    `json:"page"`
	PageSize     int    `json:"page_size"`
	ForceSync    bool   `json:"force_sync,omitempty"`
	SyncType     string `json:"sync_type,omitempty"`
}

// SyncResult - Result for sync
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalInserted int    `json:"total_inserted"`
	TotalUpdated  int    `json:"total_updated"`
	TotalSkipped  int    `json:"total_skipped"`
	TotalErrors   int    `json:"total_errors"`
	Duration      string `json:"duration"`
	SyncedBy      string `json:"synced_by"`
}
