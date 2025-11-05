package pendidikan

import "time"

// RwyPendFormal represents a formal education record from SISTER
type RwyPendFormal struct {
	IDRwyDidikFormal  string     `db:"id_rwy_didik_formal" json:"id_rwy_didik_formal"`
	IDSMS             *string    `db:"id_sms" json:"id_sms"`                         // id_program_studi from API
	IDKatgiat         int        `db:"id_katgiat" json:"id_katgiat"`                 // -1 if undefined
	IDSDM             string     `db:"id_sdm" json:"id_sdm"`                         // Required
	IDJenjDidik       *int       `db:"id_jenj_didik" json:"id_jenj_didik"`           // id_jenjang_pendidikan
	IDBidStudi        *int       `db:"id_bid_studi" json:"id_bid_studi"`             // id_bidang_studi
	IDGelarAkad       *int       `db:"id_gelar_akad" json:"id_gelar_akad"`           // id_gelar_akademik
	NmSpFormal        *string    `db:"nm_sp_formal" json:"nm_sp_formal"`             // nama_perguruan_tinggi
	Fak               *string    `db:"fak" json:"fak"`                               // nullable, leave empty
	AKependidikan     int        `db:"a_kependidikan" json:"a_kependidikan"`         // default 0
	ThnMasuk          *int       `db:"thn_masuk" json:"thn_masuk"`                   // tahun_masuk
	ThnLulus          *int       `db:"thn_lulus" json:"thn_lulus"`                   // tahun_lulus
	NIPD              *string    `db:"nipd" json:"nipd"`                             // nomor_induk
	StatKul           string     `db:"stat_kul" json:"stat_kul"`                     // 'L' if tahun_lulus exists, else '1'
	Smt               *int       `db:"smt" json:"smt"`                               // jumlah_semester
	SksLulus          *int       `db:"sks_lulus" json:"sks_lulus"`                   // jumlah_sks
	IPK               *float64   `db:"ipk" json:"ipk"`                               // ipk
	SkSetara          *string    `db:"sk_setara" json:"sk_setara"`                   // sk_penyetaraan
	TglSkSetara       *time.Time `db:"tgl_sk_setara" json:"tgl_sk_setara"`           // tanggal_sk_penyetaraan
	NoIjazah          *string    `db:"no_ijazah" json:"no_ijazah"`                   // nomor_ijazah
	JudulTesis        *string    `db:"judul_tesis" json:"judul_tesis"`               // judul_tugas_akhir
	TglLulus          *time.Time `db:"tgl_lulus" json:"tgl_lulus"`                   // tanggal_lulus
	CreateDate        time.Time  `db:"create_date" json:"create_date"`
	IDCreator         string     `db:"id_creator" json:"id_creator"`
	LastUpdate        time.Time  `db:"last_update" json:"last_update"`
	IDUpdater         *string    `db:"id_updater" json:"id_updater"`
	SoftDelete        int        `db:"soft_delete" json:"soft_delete"`
	LastSync          *time.Time `db:"last_sync" json:"last_sync"`
}

// Sister API response structures

// SisterPendidikanFormalListItem represents a pendidikan formal item from Sister API list endpoint
type SisterPendidikanFormalListItem struct {
	ID                    string  `json:"id"`
	JenjangPendidikan     string  `json:"jenjang_pendidikan"`
	GelarAkademik         string  `json:"gelar_akademik"`
	BidangStudi           string  `json:"bidang_studi"`
	NamaPerguruanTinggi   string  `json:"nama_perguruan_tinggi"`
	TahunLulus            *int    `json:"tahun_lulus"`
	JenisAjuan            *string `json:"jenis_ajuan"`
}

// SisterPendidikanFormalDetail represents detailed pendidikan formal data from Sister API
type SisterPendidikanFormalDetail struct {
	ID                      string                      `json:"id"`
	KategoriKegiatan        string                      `json:"kategori_kegiatan"`
	JenjangPendidikan       string                      `json:"jenjang_pendidikan"`
	GelarAkademik           string                      `json:"gelar_akademik"`
	IDSDM                   string                      `json:"id_sdm"`
	IDGelarAkademik         int                         `json:"id_gelar_akademik"`
	IDProgramStudi          *string                     `json:"id_program_studi"`
	BidangStudi             string                      `json:"bidang_studi"`
	NamaProgramStudi        *string                     `json:"nama_program_studi"`
	NamaPerguruanTinggi     string                      `json:"nama_perguruan_tinggi"`
	TahunMasuk              int                         `json:"tahun_masuk"`
	TahunLulus              int                         `json:"tahun_lulus"`
	TanggalLulus            *string                     `json:"tanggal_lulus"`
	NomorInduk              string                      `json:"nomor_induk"`
	JumlahSemester          int                         `json:"jumlah_semester"`
	JumlahSKS               int                         `json:"jumlah_sks"`
	IPK                     float64                     `json:"ipk"`
	SkPenyetaraan           *string                     `json:"sk_penyetaraan"`
	IDBidangStudi           int                         `json:"id_bidang_studi"`
	IDJenjangPendidikan     int                         `json:"id_jenjang_pendidikan"`
	TanggalSkPenyetaraan    *string                     `json:"tanggal_sk_penyetaraan"`
	NomorIjazah             *string                     `json:"nomor_ijazah"`
	JudulTugasAkhir         *string                     `json:"judul_tugas_akhir"`
	JenisAjuan              *string                     `json:"jenis_ajuan"`
	Dokumen                 []SisterPendidikanDokumen   `json:"dokumen"`
}

// SisterPendidikanDokumen represents a document in the Sister API response
type SisterPendidikanDokumen struct {
	ID            string  `json:"id"`
	Nama          string  `json:"nama"`
	JenisDokumen  string  `json:"jenis_dokumen"`
	JenisFile     string  `json:"jenis_file"`
	NamaFile      string  `json:"nama_file"`
	Tautan        *string `json:"tautan"`
	Keterangan    *string `json:"keterangan"`
}

// Sync result structures

// PendidikanFormalSyncResult represents the result of syncing one pendidikan formal
type PendidikanFormalSyncResult struct {
	IDRwyDidikFormal string `json:"id_rwy_didik_formal"`
	NamaPerguruanTinggi string `json:"nama_perguruan_tinggi"`
	Success          bool   `json:"success"`
	Error            string `json:"error,omitempty"`
}

// BatchPendidikanFormalSyncResult represents the result of syncing all pendidikan formal for one dosen
type BatchPendidikanFormalSyncResult struct {
	TotalProcessed int                          `json:"total_processed"`
	TotalSuccess   int                          `json:"total_success"`
	TotalFailed    int                          `json:"total_failed"`
	Duration       string                       `json:"duration"`
	Results        []PendidikanFormalSyncResult `json:"results"`
	SyncedBy       string                       `json:"synced_by"`
}

// BatchAllSyncResult represents the result of batch sync all dosen
type BatchAllSyncResult struct {
	TotalDosen            int      `json:"total_dosen"`
	TotalSuccess          int      `json:"total_success"`
	TotalFailed           int      `json:"total_failed"`
	TotalPendidikanFormal int      `json:"total_pendidikan_formal"`
	Duration              string   `json:"duration"`
	SyncedBy              string   `json:"synced_by"`
	FailedDosen           []string `json:"failed_dosen,omitempty"`
}

// Statistics and list structures

// PendidikanFormalStats represents pendidikan formal statistics
type PendidikanFormalStats struct {
	TotalPendidikanFormal int       `json:"total_pendidikan_formal" db:"total_pendidikan_formal"`
	TotalS1               int       `json:"total_s1" db:"total_s1"`
	TotalS2               int       `json:"total_s2" db:"total_s2"`
	TotalS3               int       `json:"total_s3" db:"total_s3"`
	LastSync              *time.Time `json:"last_sync" db:"last_sync"`
}

// PendidikanFormalListItem represents a pendidikan formal item with additional fields for list view
type PendidikanFormalListItem struct {
	RwyPendFormal
	JenjangPendidikanNama *string `json:"jenjang_pendidikan_nama" db:"jenjang_pendidikan_nama"`
	BidangStudiNama       *string `json:"bidang_studi_nama" db:"bidang_studi_nama"`
	GelarAkademikNama     *string `json:"gelar_akademik_nama" db:"gelar_akademik_nama"`
	NamaProgramStudi      *string `json:"nama_program_studi" db:"nama_program_studi"`
	NamaDosen             *string `json:"nama_dosen" db:"nama_dosen"`
}

// PendidikanFormalListResult represents paginated pendidikan formal list
type PendidikanFormalListResult struct {
	Data       []*PendidikanFormalListItem `json:"data"`
	Total      int                         `json:"total"`
	Page       int                         `json:"page"`
	Limit      int                         `json:"limit"`
	TotalPages int                         `json:"total_pages"`
}
