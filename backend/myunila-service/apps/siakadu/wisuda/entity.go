package wisuda

import (
	"time"
)

// WisudaPeriode - Periode wisuda from siakadu.periode_wisuda
type WisudaPeriode struct {
	IdPeriodeWisuda string     `db:"id_periode_wisuda" json:"id_periode_wisuda"`
	IdSmt           *string    `db:"id_smt" json:"id_smt"`
	NmPeriode       *string    `db:"nm_periode" json:"nm_periode"`
	TglYudisium     *time.Time `db:"tgl_yudisium" json:"tgl_yudisium"`
	TglAwalDaftar   *time.Time `db:"tgl_awal_daftar" json:"tgl_awal_daftar"`
	TglAkhirDaftar  *time.Time `db:"tgl_akhir_daftar" json:"tgl_akhir_daftar"`
	CreateDate      time.Time  `db:"create_date" json:"create_date"`
	LastUpdate      time.Time  `db:"last_update" json:"last_update"`
	SoftDelete      int        `db:"soft_delete" json:"soft_delete"`
	LastSync        *time.Time `db:"last_sync" json:"last_sync"`
}

// WisudaPeserta - Wisuda participant (wisuda_mahasiswa joined with mahasiswa for nama/prodi)
type WisudaPeserta struct {
	IdYudisium      int        `db:"id_yudisium" json:"id_yudisium"`
	IdPeriodeWisuda *string    `db:"id_periode_wisuda" json:"id_periode_wisuda"`
	NmPeriode       *string    `db:"nm_periode" json:"nm_periode"`
	NIM             *string    `db:"nipd" json:"nim"`
	NmMahasiswa     *string    `db:"nm_mahasiswa" json:"nm_mahasiswa"`
	NmProdi         *string    `db:"nm_prodi" json:"nm_prodi"`
	Angkatan        *string    `db:"angkatan" json:"angkatan"`
	NoSkYudisium    *string    `db:"no_sk_yudisium" json:"no_sk_yudisium"`
	TglSkYudisium   *time.Time `db:"tgl_sk_yudisium" json:"tgl_sk_yudisium"`
	NoIjasah        *string    `db:"no_ijasah" json:"no_ijasah"`
	IsWisuda        *string    `db:"is_wisuda" json:"is_wisuda"`
	IsHadirWisuda   *int       `db:"is_hadir_wisuda" json:"is_hadir_wisuda"`
	IsValidWisuda   *int       `db:"is_valid_wisuda" json:"is_valid_wisuda"`
	Keterangan      *string    `db:"keterangan" json:"keterangan"`
	IpkLulusan      *float64   `db:"ipk_lulusan" json:"ipk_lulusan"`
	LastSync        *time.Time `db:"last_sync" json:"last_sync"`
}

// WisudaListFilter - Filter params for wisuda list
type WisudaListFilter struct {
	Page      int
	Limit     int
	Search    string
	IdPeriode string
	IdUnit    string
	Angkatan  string
	SortBy    string
	SortOrder string
}

// WisudaPaginatedResult - Paginated list result
type WisudaPaginatedResult struct {
	Data       []*WisudaPeserta `json:"data"`
	Total      int              `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"total_pages"`
}

// WisudaStats - Sync statistics
type WisudaStats struct {
	TotalPeserta int        `json:"total_peserta"`
	TotalPeriode int        `json:"total_periode"`
	LastSync     *time.Time `json:"last_sync"`
}

// WisudaFilterOptions - Available filter options for wisuda list
type WisudaFilterOptions struct {
	Periode  []PeriodeOption `json:"periode"`
	Prodi    []ProdiOption   `json:"prodi"`
	Angkatan []string        `json:"angkatan"`
}

// PeriodeOption - Periode option for filter dropdown
type PeriodeOption struct {
	IdPeriodeWisuda string  `db:"id_periode_wisuda" json:"id_periode_wisuda"`
	NmPeriode       *string `db:"nm_periode" json:"nm_periode"`
}

// ProdiOption - Prodi option for filter dropdown
type ProdiOption struct {
	IdUnit  string `db:"id_unit" json:"id_unit"`
	NmProdi string `db:"nm_prodi" json:"nm_prodi"`
}

// SyncResult - Result for wisuda sync
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalInserted int    `json:"total_inserted"`
	TotalUpdated  int    `json:"total_updated"`
	TotalSkipped  int    `json:"total_skipped"`
	TotalErrors   int    `json:"total_errors"`
	Duration      string `json:"duration"`
	SyncedBy      string `json:"synced_by"`
}
