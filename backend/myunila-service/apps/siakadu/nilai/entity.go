package nilai

import "time"

// KHSListItem
type KHSListItem struct {
	NIM            string     `db:"nim" json:"nim"`
	NamaMahasiswa  string     `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NmProdi        *string    `db:"nm_prodi" json:"nm_prodi"`
	Angkatan       *string    `db:"angkatan" json:"angkatan"`
	IdSemester     *string    `db:"id_semester" json:"id_semester"`
	KodeMK         string     `db:"kode_mk" json:"kode_mk"`
	NamaMK         string     `db:"nama_mk" json:"nama_mk"`
	SKSMK          *float64   `db:"sks_mk" json:"sks_mk"`
	NilaiHuruf     *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiAngka     *float64   `db:"nilai_angka" json:"nilai_angka"`
	NilaiIndex     *float64   `db:"nilai_index" json:"nilai_index"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// KHSListFilter - Filter params for KHS list
type KHSListFilter struct {
	Page      int
	Limit     int
	Search    string
	IdSmt     string
	NIM       string
	IdUnit    string
	Angkatan  string
	SortBy    string
	SortOrder string
}

// KHSStats - Stats for KHS data
type KHSStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// KHSFilterOptions - Available filter options for KHS list
type KHSFilterOptions struct {
	Semester []string            `json:"semester"`
	Prodi    []KuliahProdiOption `json:"prodi"`
	Angkatan []string            `json:"angkatan"`
}

// TranskripListItem
type TranskripListItem struct {
	NIM           *string    `db:"nim" json:"nim"`
	NamaMahasiswa *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NmProdi       *string    `db:"nm_prodi" json:"nm_prodi"`
	Angkatan      *string    `db:"angkatan" json:"angkatan"`
	KodeMK        *string    `db:"kode_mk" json:"kode_mk"`
	NamaMK        *string    `db:"nama_mk" json:"nama_mk"`
	SKSMK         *float64   `db:"sks_mk" json:"sks_mk"`
	NilaiHuruf    *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndex    *float64   `db:"nilai_index" json:"nilai_index"`
	SmtKe         *int       `db:"smt_ke" json:"smt_ke"`
	LastSync      *time.Time `db:"last_sync" json:"last_sync"`
}

// TranskripListFilter - Filter params for transkrip list
type TranskripListFilter struct {
	Page      int
	Limit     int
	Search    string
	NIM       string
	IdUnit    string
	Angkatan  string
	SortBy    string
	SortOrder string
}

// TranskripStats - Stats for transkrip data
type TranskripStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// TranskripFilterOptions - Available filter options for transkrip list
type TranskripFilterOptions struct {
	Prodi    []KuliahProdiOption `json:"prodi"`
	Angkatan []string            `json:"angkatan"`
}

// KuliahListItem
type KuliahListItem struct {
	NIM           string     `db:"nim" json:"nim"`
	NamaMahasiswa string     `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NmProdi       *string    `db:"nm_prodi" json:"nm_prodi"`
	Angkatan      *string    `db:"angkatan" json:"angkatan"`
	IdSemester    string     `db:"id_semester" json:"id_semester"`
	StatusKuliah  *string    `db:"status_kuliah" json:"status_kuliah"`
	IPS           *float64   `db:"ips" json:"ips"`
	SKSSMT        *float64   `db:"sks_smt" json:"sks_smt"`
	IPK           *float64   `db:"ipk" json:"ipk"`
	TotalSKS      *float64   `db:"total_sks" json:"total_sks"`
	LastSync      *time.Time `db:"last_sync" json:"last_sync"`
}

// KuliahListFilter - Filter params for kuliah list
type KuliahListFilter struct {
	Page      int
	Limit     int
	Search    string
	IdSmt     string
	IdUnit    string
	Angkatan  string
	Status    string
	SortBy    string
	SortOrder string
}

// KuliahStats - Stats for kuliah data
type KuliahStats struct {
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
}

// KuliahProdiOption - Prodi option for kuliah filter dropdown
type KuliahProdiOption struct {
	IdUnit  string `db:"id_unit" json:"id_unit"`
	NmProdi string `db:"nm_prodi" json:"nm_prodi"`
}

// KuliahFilterOptions - Available filter options for kuliah list
type KuliahFilterOptions struct {
	Semester []string             `json:"semester"`
	Prodi    []KuliahProdiOption  `json:"prodi"`
	Angkatan []string             `json:"angkatan"`
	Status   []string             `json:"status"`
}

// PaginatedResult
type PaginatedResult struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// SyncFilter
type SyncFilter struct {
	IdSemester string `json:"id_semester"`
	NPM        string `json:"npm"`
	IdUnit     string `json:"id_unit"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	ForceSync  bool   `json:"force_sync,omitempty"`
	SyncType   string `json:"sync_type,omitempty"`
}

// SyncResult
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalInserted int    `json:"total_inserted"`
	TotalUpdated  int    `json:"total_updated"`
	TotalSkipped  int    `json:"total_skipped"`
	TotalErrors   int    `json:"total_errors"`
	Duration      string `json:"duration"`
	SyncedBy      string `json:"synced_by"`
}
