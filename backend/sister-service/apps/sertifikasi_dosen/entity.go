package sertifikasi_dosen

import (
	"database/sql"
	"time"
)

// RwySertifikasi represents the pdrd.rwy_sertifikasi table
type RwySertifikasi struct {
	IDRwySert   string         `db:"id_rwy_sert" json:"id_rwy_sert"`     // Primary key from API id
	IDJnsSert   sql.NullInt32  `db:"id_jns_sert" json:"id_jns_sert"`     // Foreign key to ref.jenis_sert (lookup from jenis_sertifikasi)
	IDBidStudi  sql.NullInt32  `db:"id_bid_studi" json:"id_bid_studi"`   // Foreign key to ref.bidang_studi (from id_bidang_studi)
	IDLembSert  sql.NullInt32  `db:"id_lemb_sert" json:"id_lemb_sert"`   // Foreign key to ref.lembaga_sertifikasi (from id_lemb_sert)
	IDSDM       string         `db:"id_sdm" json:"id_sdm"`               // Foreign key to pdrd.sdm
	ThnSert     sql.NullInt32  `db:"thn_sert" json:"thn_sert"`           // tahun_sertifikasi
	SKSert      sql.NullString `db:"sk_sert" json:"sk_sert"`             // sk_sertifikasi
	Nrg         sql.NullString `db:"nrg" json:"nrg"`                     // nomor_registrasi
	NoPeserta   sql.NullString `db:"no_peserta" json:"no_peserta"`       // nomor_peserta
	TmtSert     sql.NullTime   `db:"tmt_sert" json:"tmt_sert"`           // tmt_sert
	TstSert     sql.NullTime   `db:"tst_sert" json:"tst_sert"`           // tst_sert
	CreateDate  sql.NullTime   `db:"create_date" json:"create_date"`
	IDCreator   sql.NullString `db:"id_creator" json:"id_creator"`
	LastUpdate  sql.NullTime   `db:"last_update" json:"last_update"`
	IDUpdater   sql.NullString `db:"id_updater" json:"id_updater"`
	SoftDelete  int            `db:"soft_delete" json:"soft_delete"`
	LastSync    sql.NullTime   `db:"last_sync" json:"last_sync"`
}

// Dokumen represents the dok.dokumen table for sertifikasi documents
type Dokumen struct {
	IDDok      string     `db:"id_dok" json:"id_dok"`
	IDJnsDok   *int       `db:"id_jns_dok" json:"id_jns_dok"` // From jenis_dokumen lookup
	NmDok      *string    `db:"nm_dok" json:"nm_dok"`
	KetDok     *string    `db:"ket_dok" json:"ket_dok"`
	WktUnggah  time.Time  `db:"wkt_unggah" json:"wkt_unggah"`
	URL        *string    `db:"url" json:"url"`
	MediaType  *string    `db:"media_type" json:"media_type"`
	FileName   *string    `db:"file_name" json:"file_name"`
	IDCreator  string     `db:"id_creator" json:"id_creator"`
	CreateDate time.Time  `db:"create_date" json:"create_date"`
	LastUpdate time.Time  `db:"last_update" json:"last_update"`
	IDUpdater  *string    `db:"id_updater" json:"id_updater"`
	SoftDelete int        `db:"soft_delete" json:"soft_delete"`
	LastSync   time.Time  `db:"last_sync" json:"last_sync"`
}

// SertifikasiDosenListItem represents summary data from /sertifikasi_dosen API
type SertifikasiDosenListItem struct {
	ID                 string  `json:"id"`
	JenisSertifikasi   string  `json:"jenis_sertifikasi"`
	BidangStudi        string  `json:"bidang_studi"`
	SKSertifikasi      string  `json:"sk_sertifikasi"`
	IDLembSert         *int    `json:"id_lemb_sert"`
	NmLembSert         *string `json:"nm_lemb_sert"`
	TmtSert            *string `json:"tmt_sert"`
	TstSert            *string `json:"tst_sert"`
	NomorRegistrasi    string  `json:"nomor_registrasi"`
	TahunSertifikasi   int     `json:"tahun_sertifikasi"`
}

// SertifikasiDosenDetail represents detailed data from /sertifikasi_dosen/{id} API
type SertifikasiDosenDetail struct {
	ID                 string                 `json:"id"`
	IDSDM              string                 `json:"id_sdm"`
	JenisSertifikasi   string                 `json:"jenis_sertifikasi"`
	BidangStudi        string                 `json:"bidang_studi"`
	IDBidangStudi      int                    `json:"id_bidang_studi"`
	SKSertifikasi      string                 `json:"sk_sertifikasi"`
	NomorRegistrasi    string                 `json:"nomor_registrasi"`
	TahunSertifikasi   int                    `json:"tahun_sertifikasi"`
	NomorPeserta       string                 `json:"nomor_peserta"`
	TmtSert            *string                `json:"tmt_sert"`
	TstSert            *string                `json:"tst_sert"`
	IDLembSert         *int                   `json:"id_lemb_sert"`
	IDSumberData       *string                `json:"id_sumber_data"`
	NmSumberData       *string                `json:"nm_sumber_data"`
	NmLembSert         *string                `json:"nm_lemb_sert"`
	Dokumen            []SertifikasiDokumen   `json:"dokumen"`
}

// SertifikasiDokumen represents document in sertifikasi detail
type SertifikasiDokumen struct {
	ID             string  `json:"id"`
	Nama           string  `json:"nama"`
	JenisDokumen   string  `json:"jenis_dokumen"`
	NamaFile       string  `json:"nama_file"`
	JenisFile      string  `json:"jenis_file"`
	TanggalUpload  string  `json:"tanggal_upload"`
	Tautan         *string `json:"tautan"`
	Keterangan     *string `json:"keterangan"`
}

// RwySertifikasiWithDetail represents sertifikasi with display data for frontend
type RwySertifikasiWithDetail struct {
	IDRwySert          string         `db:"id_rwy_sert" json:"id_rwy_sert"`
	IDSDM              string         `db:"id_sdm" json:"id_sdm"`
	ThnSert            sql.NullInt32  `db:"thn_sert" json:"thn_sert"`
	SKSert             sql.NullString `db:"sk_sert" json:"sk_sert"`
	Nrg                sql.NullString `db:"nrg" json:"nrg"`
	NoPeserta          sql.NullString `db:"no_peserta" json:"no_peserta"`
	TmtSert            sql.NullTime   `db:"tmt_sert" json:"tmt_sert"`
	TstSert            sql.NullTime   `db:"tst_sert" json:"tst_sert"`
	LastSync           sql.NullTime   `db:"last_sync" json:"last_sync"`
	NamaDosen          sql.NullString `db:"nama_dosen" json:"nama_dosen"`
	NIDN               sql.NullString `db:"nidn" json:"nidn"`
	JenisSertifikasi   sql.NullString `db:"jenis_sertifikasi" json:"jenis_sertifikasi"`
	BidangStudi        sql.NullString `db:"bidang_studi" json:"bidang_studi"`
	LembagaSertifikasi sql.NullString `db:"lembaga_sertifikasi" json:"lembaga_sertifikasi"`
}

// SertifikasiListResult represents paginated list result
type SertifikasiListResult struct {
	Data       []*RwySertifikasiWithDetail `json:"data"`
	Total      int                         `json:"total"`
	Page       int                         `json:"page"`
	Limit      int                         `json:"limit"`
	TotalPages int                         `json:"total_pages"`
}

// SertifikasiStats represents statistics
type SertifikasiStats struct {
	TotalSertifikasi int          `db:"total_sertifikasi" json:"total_sertifikasi"`
	TotalAktif       int          `db:"total_aktif" json:"total_aktif"`
	TotalKadaluarsa  int          `db:"total_kadaluarsa" json:"total_kadaluarsa"`
	LastSyncDate     sql.NullTime `db:"last_sync_date" json:"last_sync_date"`
}

// SyncResult represents the result of syncing a single dosen's sertifikasi
type SyncResult struct {
	IDSDM   string
	Success int
	Failed  int
	Message string
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
