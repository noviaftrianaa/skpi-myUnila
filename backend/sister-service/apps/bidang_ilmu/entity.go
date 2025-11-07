package bidang_ilmu

import (
	"database/sql"
	"time"
)

// MapSDMBidang represents the pdrd.map_sdm_bidang table
type MapSDMBidang struct {
	IDSDM       string         `db:"id_sdm" json:"id_sdm"`
	IDKelBidang string         `db:"id_kel_bidang" json:"id_kel_bidang"`
	Urutan      int            `db:"urutan" json:"urutan"`
	CreateDate  time.Time      `db:"create_date" json:"create_date"`
	IDCreator   string         `db:"id_creator" json:"id_creator"`
	LastUpdate  time.Time      `db:"last_update" json:"last_update"`
	IDUpdater   sql.NullString `db:"id_updater" json:"id_updater"`
	SoftDelete  int            `db:"soft_delete" json:"soft_delete"`
	LastSync    time.Time      `db:"last_sync" json:"last_sync"`
}

// Sister API response structures

// SisterBidangIlmuItem represents a bidang ilmu item from Sister API
type SisterBidangIlmuItem struct {
	Urutan           string `json:"urutan"`
	IDKelompokBidang string `json:"id_kelompok_bidang"`
	KelompokBidang   string `json:"kelompok_bidang"` // Format: [code] Name
}

// BidangIlmuStats represents statistics for bidang ilmu data
type BidangIlmuStats struct {
	TotalDosen       int            `db:"total_dosen" json:"total_dosen"`
	TotalBidangIlmu  int            `db:"total_bidang_ilmu" json:"total_bidang_ilmu"`
	LastSyncDate     sql.NullTime   `db:"last_sync_date" json:"last_sync_date"`
}

// BidangIlmuListItem represents a bidang ilmu item for list display
type BidangIlmuListItem struct {
	IDSDM          string         `db:"id_sdm" json:"id_sdm"`
	NamaDosen      sql.NullString `db:"nama_dosen" json:"nama_dosen"`
	NIDN           sql.NullString `db:"nidn" json:"nidn"`
	IDKelBidang    string         `db:"id_kel_bidang" json:"id_kel_bidang"`
	KodeBidang     sql.NullString `db:"kode_bidang" json:"kode_bidang"`
	NamaBidang     sql.NullString `db:"nama_bidang" json:"nama_bidang"`
	Urutan         int            `db:"urutan" json:"urutan"`
	LastSync       time.Time      `db:"last_sync" json:"last_sync"`
}

// BidangIlmuListResult represents paginated list result
type BidangIlmuListResult struct {
	Data       []BidangIlmuListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// BatchSyncResult represents the result of batch syncing all dosen
type BatchSyncResult struct {
	TotalDosen   int      `json:"total_dosen"`
	TotalSuccess int      `json:"total_success"`
	TotalFailed  int      `json:"total_failed"`
	Duration     string   `json:"duration"`
	SyncedBy     string   `json:"synced_by"`
	FailedDosen  []string `json:"failed_dosen,omitempty"`
}
