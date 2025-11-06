package riwayat_pekerjaan

import (
	"database/sql"
	"time"
)

// RwyPekerjaan represents pdrd.rwy_pekerjaan table
type RwyPekerjaan struct {
	// Primary Key
	IDRwyKerja string `json:"id_rwy_kerja" db:"id_rwy_kerja"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDSDM       string  `json:"id_sdm" db:"id_sdm"`             // uniqueidentifier, FK to pdrd.sdm, NOT NULL
	IDDudi      *string `json:"id_dudi" db:"id_dudi"`           // uniqueidentifier, FK to pdrd.dudi, nullable
	IDPekerjaan int     `json:"id_pekerjaan" db:"id_pekerjaan"` // int, FK to ref.pekerjaan, NOT NULL
	IDKBLI      *int    `json:"id_kbli" db:"id_kbli"`           // numeric(7), FK to ref.kbli, nullable

	// Data Fields
	NmJabatan       string     `json:"nm_jabatan" db:"nm_jabatan"`             // varchar(150), NOT NULL
	DeskripsiKerja  *string    `json:"deskripsi_kerja" db:"deskripsi_kerja"`   // varchar(500), nullable
	Instansi        *string    `json:"instansi" db:"instansi"`                 // varchar(100), nullable
	Divisi          *string    `json:"divisi" db:"divisi"`                     // varchar(100), nullable
	MulaiBekerja    time.Time  `json:"mulai_bekerja" db:"mulai_bekerja"`       // date, NOT NULL
	SelesaiBekerja  *time.Time `json:"selesai_bekerja" db:"selesai_bekerja"`   // date, nullable
	ALuarNegeri     int        `json:"a_ln" db:"a_ln"`                         // numeric(1), NOT NULL, default 0

	// Audit Fields
	CreateDate  time.Time  `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator   string     `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater   *string    `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete  int        `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// Dokumen represents dok.dokumen table
type Dokumen struct {
	// Primary Key
	IDDok string `json:"id_dok" db:"id_dok"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDJnsDok *int `json:"id_jns_dok" db:"id_jns_dok"` // int, FK to ref.jenis_dokumen, nullable

	// Data Fields
	NmDok      *string    `json:"nm_dok" db:"nm_dok"`           // varchar(60), nullable
	KetDok     *string    `json:"ket_dok" db:"ket_dok"`         // varchar(200), nullable
	FileDok    []byte     `json:"-" db:"file_dok"`              // varbinary(max), nullable - NOT STORED from Sister API
	WktUnggah  time.Time  `json:"wkt_unggah" db:"wkt_unggah"`   // datetime, NOT NULL
	URL        *string    `json:"url" db:"url"`                 // varchar(256), nullable
	MediaType  *string    `json:"media_type" db:"media_type"`   // varchar(250), nullable
	FileName   *string    `json:"file_name" db:"file_name"`     // varchar(500), nullable

	// Audit Fields
	CreateDate  time.Time  `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator   string     `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater   *string    `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete  int        `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// DokRwyPekerjaan represents dok.dok_rwy_pekerjaan junction table
type DokRwyPekerjaan struct {
	IDRwyKerja  string     `json:"id_rwy_kerja" db:"id_rwy_kerja"` // uniqueidentifier, PRIMARY KEY
	IDDok       string     `json:"id_dok" db:"id_dok"`             // uniqueidentifier, PRIMARY KEY

	CreateDate  time.Time  `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator   string     `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater   *string    `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete  int        `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// Sister API Response structures
// SisterRiwayatPekerjaanListItem represents item in GET /riwayat_pekerjaan response
type SisterRiwayatPekerjaanListItem struct {
	ID              string  `json:"id"`               // UUID, id_rwy_kerja
	JenisPekerjaan  string  `json:"jenis_pekerjaan"`  // Display name
	NamaJabatan     string  `json:"nama_jabatan"`     // varchar(150)
	Instansi        string  `json:"instansi"`         // varchar(100)
	Divisi          string  `json:"divisi"`           // varchar(100)
	MulaiBekerja    string  `json:"mulai_bekerja"`    // date format "2020-06-01"
	SelesaiBekerja  *string `json:"selesai_bekerja"`  // date format, nullable
	LuarNegeri      bool    `json:"luar_negeri"`      // boolean
	BidangUsaha     string  `json:"bidang_usaha"`     // Display name
}

// SisterRiwayatPekerjaanDetail represents GET /riwayat_pekerjaan/{id} response
type SisterRiwayatPekerjaanDetail struct {
	SisterRiwayatPekerjaanListItem                       // Embed list item fields

	IDSDM            string                    `json:"id_sdm"`             // UUID
	IDBidangUsaha    int                       `json:"id_bidang_usaha"`    // Integer, maps to id_kbli
	IDJenisPekerjaan int                       `json:"id_jenis_pekerjaan"` // Integer, maps to id_pekerjaan
	DeskripsiKerja   *string                   `json:"deskripsi_kerja"`    // varchar(500), nullable
	Dokumen          []SisterDokumenRwyKerja   `json:"dokumen"`            // Array of dokumen
}

// SisterDokumenRwyKerja represents dokumen in riwayat pekerjaan detail response
type SisterDokumenRwyKerja struct {
	ID             string  `json:"id"`              // UUID, id_dok
	Nama           string  `json:"nama"`            // Nama dokumen
	JenisDokumen   string  `json:"jenis_dokumen"`   // Jenis dokumen (display name)
	NamaFile       string  `json:"nama_file"`       // Nama file
	JenisFile      string  `json:"jenis_file"`      // MIME type
	TanggalUpload  string  `json:"tanggal_upload"`  // Tanggal upload "2022-02-25 10:41:38"
	Tautan         *string `json:"tautan"`          // URL, nullable
	Keterangan     *string `json:"keterangan"`      // Keterangan, nullable
}

// RiwayatPekerjaanListResult represents paginated list result
type RiwayatPekerjaanListResult struct {
	Data       []*RwyPekerjaanWithDetail `json:"data"`
	Total      int                       `json:"total"`
	Page       int                       `json:"page"`
	Limit      int                       `json:"limit"`
	TotalPages int                       `json:"total_pages"`
}

// RwyPekerjaanWithDetail combines rwy_pekerjaan with related data for display
type RwyPekerjaanWithDetail struct {
	RwyPekerjaan

	// Related display fields
	NamaDosen          sql.NullString `json:"nama_dosen" db:"nama_dosen"`
	NIDN               sql.NullString `json:"nidn" db:"nidn"`
	JenisPekerjaanName sql.NullString `json:"jenis_pekerjaan_name" db:"jenis_pekerjaan_name"`
	BidangUsahaName    sql.NullString `json:"bidang_usaha_name" db:"bidang_usaha_name"`
}

// RiwayatPekerjaanStats represents statistics for riwayat pekerjaan sync
type RiwayatPekerjaanStats struct {
	TotalRiwayat       int        `json:"total_riwayat" db:"total_riwayat"`
	TotalDalamNegeri   int        `json:"total_dalam_negeri" db:"total_dalam_negeri"`
	TotalLuarNegeri    int        `json:"total_luar_negeri" db:"total_luar_negeri"`
	LastSyncDate       *time.Time `json:"last_sync_date" db:"last_sync_date"`
}
