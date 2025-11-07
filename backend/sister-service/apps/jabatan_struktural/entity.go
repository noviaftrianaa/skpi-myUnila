package jabatan_struktural

import (
	"database/sql"
	"time"
)

// RwyStruktural represents pdrd.rwy_struktural table
type RwyStruktural struct {
	IDRwyJabStruk string       `db:"id_rwy_jabstruk"` // uniqueidentifier
	IDSDM         string       `db:"id_sdm"`          // uniqueidentifier
	IDKatGiat     sql.NullInt32 `db:"id_katgiat"`      // int
	IDJabTgs      sql.NullInt64 `db:"id_jab_tgs"`      // numeric(5,0)
	SKJabStruk    sql.NullString `db:"sk_jabstruk"`     // varchar(80)
	TmtSKJabStruk sql.NullTime  `db:"tmt_sk_jabstruk"` // date
	TstSKJabStruk sql.NullTime  `db:"tst_sk_jabstruk"` // date
	LokasiTugas   sql.NullString `db:"lokasi_tugas"`    // varchar(80)
	CreateDate    sql.NullTime  `db:"create_date"`
	IDCreator     sql.NullString `db:"id_creator"`
	LastUpdate    sql.NullTime  `db:"last_update"`
	IDUpdater     sql.NullString `db:"id_updater"`
	SoftDelete    int           `db:"soft_delete"` // numeric(1,0)
	LastSync      sql.NullTime  `db:"last_sync"`
}

// SisterJabatanStruktural represents data from SISTER API
type SisterJabatanStruktural struct {
	ID                   string  `json:"id"`
	Jabatan              string  `json:"jabatan"`
	SKJabatan            string  `json:"sk_jabatan"`
	TanggalMulaiJabatan  string  `json:"tanggal_mulai_jabatan"`
	TanggalSelesaiJabatan *string `json:"tanggal_selesai_jabatan"`
	IDSDM                string  `json:"id_sdm"`
	IDJabatanNegara      int     `json:"id_jabatan_negara"`
	Lokasi               string  `json:"lokasi"`
	KategoriKegiatan     string  `json:"kategori_kegiatan"`
	IDKategoriKegiatan   int     `json:"id_kategori_kegiatan"`
}

// RwyStrukturalWithDetail for list view with JOINed data
type RwyStrukturalWithDetail struct {
	IDRwyJabStruk      string         `json:"id_rwy_jabstruk" db:"id_rwy_jabstruk"`
	IDSDM              string         `json:"id_sdm" db:"id_sdm"`
	SKJabStruk         sql.NullString `json:"sk_jabstruk" db:"sk_jabstruk"`
	TmtSKJabStruk      sql.NullTime   `json:"tmt_sk_jabstruk" db:"tmt_sk_jabstruk"`
	TstSKJabStruk      sql.NullTime   `json:"tst_sk_jabstruk" db:"tst_sk_jabstruk"`
	LokasiTugas        sql.NullString `json:"lokasi_tugas" db:"lokasi_tugas"`
	LastSync           sql.NullTime   `json:"last_sync" db:"last_sync"`
	NamaDosen          sql.NullString `json:"nama_dosen" db:"nama_dosen"`
	NIDN               sql.NullString `json:"nidn" db:"nidn"`
	NamaJabatan        sql.NullString `json:"nama_jabatan" db:"nama_jabatan"`
	KategoriKegiatan   sql.NullString `json:"kategori_kegiatan" db:"kategori_kegiatan"`
}

// JabatanStrukturalStats for statistics
type JabatanStrukturalStats struct {
	TotalJabatan int        `json:"total_jabatan" db:"total_jabatan"`
	TotalAktif   int        `json:"total_aktif" db:"total_aktif"`
	TotalSelesai int        `json:"total_selesai" db:"total_selesai"`
	LastSyncDate *time.Time `json:"last_sync_date" db:"last_sync_date"`
}

// JabatanStrukturalListResult for paginated results
type JabatanStrukturalListResult struct {
	Data       []*RwyStrukturalWithDetail `json:"data"`
	Total      int                        `json:"total"`
	Page       int                        `json:"page"`
	Limit      int                        `json:"limit"`
	TotalPages int                        `json:"total_pages"`
}
