package nilai

import (
	"time"
)

// ========================================
// KHS Entities
// ========================================

// KHSListItem - KHS for list view
type KHSListItem struct {
	IdKelas        *int       `db:"id_kelas" json:"id_kelas"`
	IdSemester     *string    `db:"id_semester" json:"id_semester"`
	NIM            *string    `db:"nim" json:"nim"`
	NamaMahasiswa  *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	IdMataKuliah   *string    `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	SKS            *int       `db:"sks" json:"sks"`
	NilaiHuruf     *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndex     *float64   `db:"nilai_index" json:"nilai_index"`
	NilaiAngka     *float64   `db:"nilai_angka" json:"nilai_angka"`
	StatusLulus    *string    `db:"status_lulus" json:"status_lulus"`
	IdUnit         *string    `db:"id_unit" json:"id_unit"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Transkrip Entities
// ========================================

// TranskripListItem - Transkrip for list view
type TranskripListItem struct {
	IdSemester      *string    `db:"id_semester" json:"id_semester"`
	NamaSemester    *string    `db:"nama_semester" json:"nama_semester"`
	NIM             *string    `db:"nim" json:"nim"`
	NamaMahasiswa   *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	IdMataKuliah    *string    `db:"id_mata_kuliah" json:"id_mata_kuliah"`
	NamaMataKuliah  *string    `db:"nama_mata_kuliah" json:"nama_mata_kuliah"`
	SKS             *int       `db:"sks" json:"sks"`
	NilaiHuruf      *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndex      *float64   `db:"nilai_index" json:"nilai_index"`
	NilaiBobot      *float64   `db:"nilai_bobot" json:"nilai_bobot"`
	StatusLulus     *string    `db:"status_lulus" json:"status_lulus"`
	LastSync        *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Kuliah Entities
// ========================================

// KuliahListItem - Status kuliah for list view
type KuliahListItem struct {
	NIM            *string    `db:"nim" json:"nim"`
	IdSemester     *string    `db:"id_semester" json:"id_semester"`
	NamaPeriode    *string    `db:"nama_periode" json:"nama_periode"`
	SemesterKuliah *string    `db:"semester_kuliah" json:"semester_kuliah"`
	StatusKuliah   *string    `db:"status_kuliah" json:"status_kuliah"`
	SKSSemester    *int       `db:"sks_semester" json:"sks_semester"`
	IPS            *float64   `db:"ips" json:"ips"`
	TotalSKS       *int       `db:"total_sks" json:"total_sks"`
	IPK            *float64   `db:"ipk" json:"ipk"`
	SKSLulus       *int       `db:"sks_lulus" json:"sks_lulus"`
	DosenWali      *string    `db:"dosen_wali" json:"dosen_wali"`
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
	IdSemester string `json:"id_semester"`
	NIM        string `json:"nim"`
	IdUnit     string `json:"id_unit"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	ForceSync  bool   `json:"force_sync,omitempty"`
	SyncType   string `json:"sync_type,omitempty"`
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
