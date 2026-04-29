package referensi

import "time"

// RefUnit represents a unit/prodi from SIAKADU.
// Extended fields via 01-extend-unit-pimpinan.sql.
type RefUnit struct {
	IdUnit       string     `db:"id_unit" json:"id_unit"`
	IdParentUnit *string    `db:"id_parent_unit" json:"id_parent_unit"`
	JnsUnit      string     `db:"jns_unit" json:"jns_unit"`
	NmUnit       *string    `db:"nm_unit" json:"nm_unit"`
	NmSingkat    *string    `db:"nm_singkat" json:"nm_singkat"`
	NmUniten     *string    `db:"nm_uniten" json:"nm_uniten,omitempty"`
	IdJenjang    *string    `db:"id_jenjang" json:"id_jenjang"`
	Akreditasi   *string    `db:"akreditasi" json:"akreditasi"`
	SkAkreditasi *string    `db:"sk_akreditasi" json:"sk_akreditasi,omitempty"`
	SksLulusMin  *int       `db:"sks_lulus_min" json:"sks_lulus_min,omitempty"`
	Gelar        *string    `db:"gelar" json:"gelar,omitempty"`
	DeskGelar    *string    `db:"desk_gelar" json:"desk_gelar,omitempty"`
	IpkLulusMin  *float64   `db:"ipk_lulus_min" json:"ipk_lulus_min,omitempty"`
	IsAktif      *string    `db:"is_aktif" json:"is_aktif"`
	Alamat       *string    `db:"alamat" json:"alamat,omitempty"`
	Telepon      *string    `db:"telepon" json:"telepon,omitempty"`
	IdSms        *string    `db:"id_sms" json:"id_sms,omitempty"`
	PimpinanJSON *string    `db:"pimpinan_json" json:"pimpinan_json,omitempty"`
	LastUpdate   *time.Time `db:"last_update" json:"last_update"`
	LastSync     *time.Time `db:"last_sync" json:"last_sync,omitempty"`
}

// UnitListFilter — filter untuk paginated list endpoint
type UnitListFilter struct {
	Page    int
	Limit   int
	Search  string
	JnsUnit string
	IsAktif string
}

// UnitListResult — paginated response
type UnitListResult struct {
	Items []RefUnit `json:"items"`
	Total int       `json:"total"`
	Page  int       `json:"page"`
	Limit int       `json:"limit"`
}

// UnitStats — agregate stats
type UnitStats struct {
	Total         int                      `json:"total"`
	Aktif         int                      `json:"aktif"`
	ByJenis       []map[string]interface{} `json:"by_jenis"`
	TotalPimpinan int                      `json:"total_pimpinan"`
	LastSync      *string                  `json:"last_sync,omitempty"`
}

// PimpinanUnit represents a pimpinan of a unit (relational table)
type PimpinanUnit struct {
	IdUnit string  `db:"id_unit" json:"id_unit"`
	Nip    string  `db:"nip" json:"nip"`
	Nama   string  `db:"nama" json:"nama"`
	Peran  string  `db:"peran" json:"peran"`
	IdSdm  *string `db:"id_sdm" json:"id_sdm,omitempty"`
}

// SyncResult represents sync operation results
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalInserted int    `json:"total_inserted"`
	TotalUpdated  int    `json:"total_updated"`
	TotalErrors   int    `json:"total_errors"`
	Duration      string `json:"duration"`
}
