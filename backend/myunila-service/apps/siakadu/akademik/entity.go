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
	NmProdi    *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// KelasListFilter - Filter params for kelas list
type KelasListFilter struct {
	Page      int
	Limit     int
	Search    string
	IdSmt     string
	IdUnit    string
	SortBy    string
	SortOrder string
}

// KelasStats - Stats for kelas
type KelasStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// KelasFilterOptions - Available filter options for kelas
type KelasFilterOptions struct {
	Semester []string               `json:"semester"`
	Prodi    []KurikulumProdiOption `json:"prodi"`
}

// ========================================
// Kurikulum Entities
// ========================================

// KurikulumListItem - Kurikulum for list view
type KurikulumListItem struct {
	IDKurikulum    *string    `db:"id_kurikulum" json:"id_kurikulum"`
	ThnKurikulum   *int       `db:"thn_kurikulum" json:"thn_kurikulum"`
	Semester       *int       `db:"semester" json:"semester"`
	IdMataKuliah   *string    `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	KodeMK         *string    `db:"kode_mk" json:"kode_mk"`
	SKS            *float64   `db:"sks" json:"sks"`
	JenisMK        *string    `db:"jenis_mk" json:"jenis_mk"`
	NmProdi        *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// KurikulumListFilter - Filter params for kurikulum list
type KurikulumListFilter struct {
	Page      int
	Limit     int
	Search    string
	JenisMK   string
	IdUnit    string // prodi filter (id_unit from ref_unit)
	SortBy    string
	SortOrder string
}

// KurikulumStats - Stats for kurikulum
type KurikulumStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// KurikulumProdiOption - Prodi option for kurikulum filter
type KurikulumProdiOption struct {
	IdUnit  string `db:"id_unit" json:"id_unit"`
	NmProdi string `db:"nm_prodi" json:"nm_prodi"`
}

// KurikulumFilterOptions - Available filter options for kurikulum
type KurikulumFilterOptions struct {
	Prodi   []KurikulumProdiOption `json:"prodi"`
	JenisMK []string               `json:"jenis_mk"`
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
	JenisMK        *string    `db:"jenis_mk" json:"jenis_mk"`
	NmProdi        *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// MatakuliahListFilter - Filter params for matakuliah list
type MatakuliahListFilter struct {
	Page      int
	Limit     int
	Search    string
	JenisMK   string
	IdUnit    string
	SortBy    string
	SortOrder string
}

// MatakuliahStats - Stats for matakuliah
type MatakuliahStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// MatakuliahFilterOptions - Available filter options for matakuliah
type MatakuliahFilterOptions struct {
	Prodi   []KurikulumProdiOption `json:"prodi"`
	JenisMK []string               `json:"jenis_mk"`
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
