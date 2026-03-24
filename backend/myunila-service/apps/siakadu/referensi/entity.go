package referensi

import "time"

// RefUnit represents a unit/prodi from SIAKADU
type RefUnit struct {
	IdUnit        string     `db:"id_unit" json:"id_unit"`
	IdParentUnit  *string    `db:"id_parent_unit" json:"id_parent_unit"`
	JnsUnit       string     `db:"jns_unit" json:"jns_unit"`
	NmUnit        *string    `db:"nm_unit" json:"nm_unit"`
	NmSingkat     *string    `db:"nm_singkat" json:"nm_singkat"`
	IdJenjang     *string    `db:"id_jenjang" json:"id_jenjang"`
	Akreditasi    *string    `db:"akreditasi" json:"akreditasi"`
	IsAktif       *string    `db:"is_aktif" json:"is_aktif"`
	PimpinanJSON  *string    `db:"pimpinan_json" json:"pimpinan_json,omitempty"`
	LastUpdate    *time.Time `db:"last_update" json:"last_update"`
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
