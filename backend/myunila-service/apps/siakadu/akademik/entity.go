package akademik

import (
	"time"
)

// ========================================
// Kelas Entities
// ========================================

// KelasListItem - Kelas for list view
type KelasListItem struct {
	IDKelas        int        `db:"id_kelas" json:"id_kelas"`
	IdSemester     *string    `db:"id_semester" json:"id_semester"`
	NamaKelas      *string    `db:"nama_kelas" json:"nama_kelas"`
	NamaMataKuliah *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	SKS            *int       `db:"sks" json:"sks"`
	DayaTampung    *int       `db:"daya_tampung" json:"daya_tampung"`
	JumlahPeserta  *int       `db:"jumlah_peserta" json:"jumlah_peserta"`
	IdUnit         *string    `db:"id_unit" json:"id_unit"`
	Prodi          *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Kurikulum Entities
// ========================================

// KurikulumListItem - Kurikulum for list view
type KurikulumListItem struct {
	IDKurikulum    int        `db:"id_kurikulum" json:"id_kurikulum"`
	Semester       *int       `db:"semester" json:"semester"`
	IdMataKuliah   *string    `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	SKS            *int       `db:"sks" json:"sks"`
	JenisMK        *string    `db:"jenis_mk" json:"jenis_mk"`
	IdUnit         *string    `db:"id_unit" json:"id_unit"`
	Prodi          *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// MataKuliah Entities
// ========================================

// MatakuliahListItem - MataKuliah for list view
type MatakuliahListItem struct {
	IdMataKuliah   string     `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah string     `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	SKS            *int       `db:"sks" json:"sks"`
	IdKurikulum    *int       `db:"id_kurikulum" json:"id_kurikulum"`
	IdJenisMK      *string    `db:"id_jenis_mk" json:"id_jenis_mk"`
	IdUnit         *string    `db:"id_unit" json:"id_unit"`
	Prodi          *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Jadwal Entities
// ========================================

// JadwalListItem - Jadwal for list view
type JadwalListItem struct {
	IDJadwal       int        `db:"id_jadwal" json:"id_jadwal"`
	IDKelas        *int       `db:"id_kelas" json:"id_kelas"`
	PertemuanKe    *int       `db:"pertemuan_ke" json:"pertemuan_ke"`
	JenisPertemuan *string    `db:"jenis_pertemuan" json:"jenis_pertemuan"`
	TglJadwal      *string    `db:"tgl_jadwal" json:"tgl_jadwal"`
	WaktuMulai     *string    `db:"waktu_mulai" json:"waktu_mulai"`
	WaktuSelesai   *string    `db:"waktu_selesai" json:"waktu_selesai"`
	IdUnit         *string    `db:"id_unit" json:"id_unit"`
	Prodi          *string    `db:"nm_prodi" json:"nm_prodi"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
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

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IdSemester    string `json:"id_semester"`
	IdUnit        string `json:"id_unit"`
	ThnKurikulum  int    `json:"thn_kurikulum"`
	Page          int    `json:"page"`
	PageSize      int    `json:"page_size"`
	ForceSync     bool   `json:"force_sync,omitempty"`
	SyncType      string `json:"sync_type,omitempty"`
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
