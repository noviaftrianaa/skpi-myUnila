package tugas_tambahan

import (
	"database/sql"
	"time"
)

// TugasTambahan represents pdrd.tugas_tambahan table
type TugasTambahan struct {
	// Primary Key
	IDTgsTambah string `json:"id_tgs_tambah" db:"id_tgs_tambah"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDSDM      string  `json:"id_sdm" db:"id_sdm"`           // uniqueidentifier, FK to pdrd.sdm, NOT NULL
	IDJabTgs   int     `json:"id_jab_tgs" db:"id_jab_tgs"`   // numeric(5,0), FK to ref.jab_tgs, NOT NULL
	IDKatGiat  int     `json:"id_katgiat" db:"id_katgiat"`   // int, FK to ref.kategori_kegiatan, NOT NULL
	IDSMS      *string `json:"id_sms" db:"id_sms"`           // uniqueidentifier, FK to pdrd.sms, nullable
	IDSP       *string `json:"id_sp" db:"id_sp"`             // uniqueidentifier, FK to pdrd.satuan_pendidikan, nullable

	// Data Fields
	JmlJam         *int       `json:"jml_jam" db:"jml_jam"`                   // numeric(4,0), nullable
	SKTugasTambah  *string    `json:"sk_tugas_tambah" db:"sk_tugas_tambah"`  // varchar(80), nullable
	TmtSKTambah    time.Time  `json:"tmt_sk_tambah" db:"tmt_sk_tambah"`      // date, NOT NULL
	TstSKTambah    *time.Time `json:"tst_sk_tambah" db:"tst_sk_tambah"`      // date, nullable

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator  string    `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate time.Time `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync   time.Time `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// Dokumen represents dok.dokumen table
type Dokumen struct {
	// Primary Key
	IDDok string `json:"id_dok" db:"id_dok"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDJnsDok *int `json:"id_jns_dok" db:"id_jns_dok"` // int, FK to ref.jenis_dokumen, nullable

	// Data Fields
	NmDok     *string   `json:"nm_dok" db:"nm_dok"`           // varchar(60), nullable
	KetDok    *string   `json:"ket_dok" db:"ket_dok"`         // varchar(200), nullable
	FileDok   []byte    `json:"-" db:"file_dok"`              // varbinary(max), nullable - NOT STORED from Sister API
	WktUnggah time.Time `json:"wkt_unggah" db:"wkt_unggah"`   // datetime, NOT NULL
	URL       *string   `json:"url" db:"url"`                 // varchar(256), nullable
	MediaType *string   `json:"media_type" db:"media_type"`   // varchar(250), nullable
	FileName  *string   `json:"file_name" db:"file_name"`     // varchar(500), nullable

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator  string    `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate time.Time `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync   time.Time `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// DokTugTam represents dok.dok_tugtam junction table
type DokTugTam struct {
	IDTgsTambah string    `json:"id_tgs_tambah" db:"id_tgs_tambah"` // uniqueidentifier, PRIMARY KEY
	IDDok       string    `json:"id_dok" db:"id_dok"`               // uniqueidentifier, PRIMARY KEY
	CreateDate  time.Time `json:"create_date" db:"create_date"`     // datetime, NOT NULL
	IDCreator   string    `json:"id_creator" db:"id_creator"`       // uniqueidentifier, NOT NULL
	LastUpdate  time.Time `json:"last_update" db:"last_update"`     // datetime, NOT NULL
	IDUpdater   *string   `json:"id_updater" db:"id_updater"`       // uniqueidentifier, nullable
	SoftDelete  int       `json:"soft_delete" db:"soft_delete"`     // numeric(1), NOT NULL, default 0
	LastSync    time.Time `json:"last_sync" db:"last_sync"`         // datetime, NOT NULL
}

// Sister API Response structures

// SisterTugasTambahanListItem represents item in GET /tugas_tambahan response
type SisterTugasTambahanListItem struct {
	ID                   string  `json:"id"`                      // UUID, id_tgs_tambah
	JenisTugas           string  `json:"jenis_tugas"`             // Display name
	UnitKerja            string  `json:"unit_kerja"`              // Display name
	PerguruanTinggi      string  `json:"perguruan_tinggi"`        // Display name
	IDKategoriKegiatan   int     `json:"id_kategori_kegiatan"`    // Integer
	TanggalMulaiTugas    string  `json:"tanggal_mulai_tugas"`     // date format "2024-01-29"
	TanggalSelesaiTugas  *string `json:"tanggal_selesai_tugas"`   // date format, nullable
}

// SisterTugasTambahanDetail represents GET /tugas_tambahan/{id} response
type SisterTugasTambahanDetail struct {
	SisterTugasTambahanListItem                               // Embed list item fields

	IDSDM               string                `json:"id_sdm"`                // UUID
	IDJenisTugas        int                   `json:"id_jenis_tugas"`        // Integer, maps to id_jab_tgs
	IDUnitKerja         string                `json:"id_unit_kerja"`         // UUID, maps to id_sms
	IDPerguruanTinggi   string                `json:"id_perguruan_tinggi"`   // UUID, maps to id_sp
	SKPenugasan         *string               `json:"sk_penugasan"`          // varchar(80), nullable
	JumlahJam           *int                  `json:"jumlah_jam"`            // Integer, nullable
	KategoriKegiatan    string                `json:"kategori_kegiatan"`     // Display name
	Dokumen             []SisterDokumenTugTam `json:"dokumen"`               // Array of dokumen
}

// SisterDokumenTugTam represents dokumen in tugas tambahan detail response
type SisterDokumenTugTam struct {
	ID            string  `json:"id"`              // UUID, id_dok
	Nama          string  `json:"nama"`            // Nama dokumen
	JenisDokumen  string  `json:"jenis_dokumen"`   // Jenis dokumen (display name)
	NamaFile      string  `json:"nama_file"`       // Nama file
	JenisFile     string  `json:"jenis_file"`      // MIME type
	TanggalUpload string  `json:"tanggal_upload"`  // Tanggal upload "2024-06-27 09:17:57"
	Tautan        *string `json:"tautan"`          // URL, nullable
	Keterangan    *string `json:"keterangan"`      // Keterangan, nullable
}

// TugasTambahanListResult represents paginated list result
type TugasTambahanListResult struct {
	Data       []*TugasTambahanWithDetail `json:"data"`
	Total      int                        `json:"total"`
	Page       int                        `json:"page"`
	Limit      int                        `json:"limit"`
	TotalPages int                        `json:"total_pages"`
}

// TugasTambahanWithDetail combines tugas_tambahan with related data for display
type TugasTambahanWithDetail struct {
	TugasTambahan

	// Related display fields
	NamaDosen          sql.NullString `json:"nama_dosen" db:"nama_dosen"`
	NIDN               sql.NullString `json:"nidn" db:"nidn"`
	JenisTugasName     sql.NullString `json:"jenis_tugas_name" db:"jenis_tugas_name"`
	UnitKerjaName      sql.NullString `json:"unit_kerja_name" db:"unit_kerja_name"`
	PerguruanTinggiName sql.NullString `json:"perguruan_tinggi_name" db:"perguruan_tinggi_name"`
	KategoriKegiatanName sql.NullString `json:"kategori_kegiatan_name" db:"kategori_kegiatan_name"`
}

// TugasTambahanStats represents statistics for tugas tambahan sync
type TugasTambahanStats struct {
	TotalTugas     int        `json:"total_tugas" db:"total_tugas"`
	TotalAktif     int        `json:"total_aktif" db:"total_aktif"`
	TotalSelesai   int        `json:"total_selesai" db:"total_selesai"`
	LastSyncDate   *time.Time `json:"last_sync_date" db:"last_sync_date"`
}