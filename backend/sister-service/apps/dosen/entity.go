package dosen

import "time"

// Dosen represents the dosen entity in pdrd.sdm table
type Dosen struct {
	// Primary Key
	IDSDM string `json:"id_sdm" db:"id_sdm"`

	// Data Pribadi
	NamaSDM      string     `json:"nama_sdm" db:"nm_sdm"`
	JK           string     `json:"jenis_kelamin" db:"jk"` // L/P/*
	TempatLahir  string     `json:"tempat_lahir" db:"tmpt_lahir"`
	TanggalLahir *time.Time `json:"tanggal_lahir" db:"tgl_lahir"`

	// Identitas
	NIK             string  `json:"nik" db:"nik"` // char(20), NOT NULL
	NIYIGK          *string `json:"niy_nigk" db:"niy_nigk"`
	NUPTK           *string `json:"nuptk" db:"nuptk"`
	NIDN            *string `json:"nidn" db:"nidn"`
	NSDMI           *string `json:"nsdmi" db:"nsdmi"`
	NIP             *string `json:"nip" db:"nip"`

	// Status Pernikahan
	StatKawin      *int    `json:"status_kawin" db:"stat_kawin"` // numeric(1)
	NamaSuamiIstri *string `json:"nama_suami_istri" db:"nm_suami_istri"`
	NIPSuamiIstri  *string `json:"nip_suami_istri" db:"nip_suami_istri"`

	// Alamat
	Jalan     *string `json:"jalan" db:"jln"`
	RT        *int    `json:"rt" db:"rt"`        // numeric(3)
	RW        *int    `json:"rw" db:"rw"`        // numeric(3)
	NamaDusun *string `json:"nama_dusun" db:"nm_dsn"`
	DesaKel   *string `json:"desa_kelurahan" db:"ds_kel"`
	KodePos   *string `json:"kode_pos" db:"kode_pos"`

	// Kontak
	NoTelRumah *string `json:"no_tel_rmh" db:"no_tel_rmh"`
	NoHP       *string `json:"no_hp" db:"no_hp"`
	Email      *string `json:"email" db:"email"`

	// Kepegawaian
	TMTPNS     *time.Time `json:"tmt_pns" db:"tmt_pns"`
	SKCPNS     *string    `json:"sk_cpns" db:"sk_cpns"`
	TglSKCPNS  *time.Time `json:"tgl_sk_cpns" db:"tgl_sk_cpns"`
	SKAngkat   *string    `json:"sk_angkat" db:"sk_angkat"`
	TMTSKAngkat *time.Time `json:"tmt_sk_angkat" db:"tmt_sk_angkat"`

	// Pajak
	NPWP *string `json:"npwp" db:"npwp"`
	NmWP *string `json:"nm_wp" db:"nm_wp"`

	// Lainnya
	StatData      *int    `json:"stat_data" db:"stat_data"`
	AktaIjinAjar  *string `json:"akta_ijin_ajar" db:"akta_ijin_ajar"` // char(1)
	NIRA          *string `json:"nira" db:"nira"`
	JnsReg        *string `json:"jns_reg" db:"jns_reg"`
	Kewarganegaraan string  `json:"kewarganegaraan" db:"kewarganegaraan"` // char(2), NOT NULL

	// Foreign Keys (REQUIRED - NOT NULL)
	IDJenisSDM         int    `json:"id_jenis_sdm" db:"id_jns_sdm"`             // numeric(2), NOT NULL
	IDWilayah          string `json:"id_wilayah" db:"id_wil"`                   // char(8), NOT NULL
	IDStatusAktif      int    `json:"id_status_aktif" db:"id_stat_aktif"`       // numeric(2), NOT NULL
	IDAgama            int    `json:"id_agama" db:"id_agama"`                   // smallint, NOT NULL
	IDKeahlianLab      *int   `json:"id_keahlian_lab" db:"id_keahlian_lab"`     // smallint, nullable
	IDPekerjaanSuamiIstri int `json:"id_pekerjaan_suami_istri" db:"id_pekerjaan_suami_istri"` // int, NOT NULL
	IDLembagaAngkat    int    `json:"id_lembaga_angkat" db:"id_lemb_angkat"`    // numeric(2), NOT NULL
	IDSumberGaji       *int   `json:"id_sumber_gaji" db:"id_sumber_gaji"`       // numeric(2), nullable

	// Audit Fields (REQUIRED - NOT NULL)
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1), NOT NULL, default 0
	LastSync   time.Time  `json:"last_sync" db:"last_sync"`     // datetime, NOT NULL
}

// SisterDosenData represents combined data from Sister API
type SisterDosenData struct {
	IDSDM        string
	Profil       *SisterProfil
	Kependudukan *SisterKependudukan
	Keluarga     *SisterKeluarga
	Alamat       *SisterAlamat
	Kepegawaian  *SisterKepegawaian
	Lain         *SisterLain
}

// SisterProfil from /data_pribadi/profil/{id_sdm}
// Response actual: {"nama":" HARTONO ","jenis_kelamin":"L","tempat_lahir":"PRINGKUMPUL","tanggal_lahir":"1971-10-10"}
type SisterProfil struct {
	Nama         string `json:"nama"`          // Note: lowercase, not nm_sdm
	JenisKelamin string `json:"jenis_kelamin"` // Note: jenis_kelamin, not jk
	TempatLahir  string `json:"tempat_lahir"`  // Note: tempat_lahir, not tmpt_lahir
	TanggalLahir string `json:"tanggal_lahir"` // Note: tanggal_lahir, not tgl_lahir
}

// SisterKependudukan from /data_pribadi/kependudukan/{id_sdm}
// Response actual: {"nik":"1871101010710005","id_agama":1,"agama":"Islam","kode_negara":"ID","kewarganegaraan":"Indonesia"}
type SisterKependudukan struct {
	NIK             string `json:"nik"`
	IDAgama         int    `json:"id_agama"`         // Note: int, not string
	Agama           string `json:"agama"`            // Nama agama
	KodeNegara      string `json:"kode_negara"`      // Note: kode_negara, not a_kewarga
	Kewarganegaraan string `json:"kewarganegaraan"`  // Nama kewarganegaraan
}

// SisterKeluarga from /data_pribadi/keluarga/{id_sdm}
// Response actual: {"id_status_kawin":1,"nama_pasangan":"LUSIATI","nip_pasangan":"198108222009022006","id_pekerjaan_pasangan":5,"pekerjaan_pasangan":"PNS/TNI/Polri","status_kawin":"Kawin"}
type SisterKeluarga struct {
	IDStatusKawin       int    `json:"id_status_kawin"`        // Note: int, not string
	StatusKawin         string `json:"status_kawin"`           // Nama status kawin
	NamaPasangan        string `json:"nama_pasangan"`
	NIPPasangan         string `json:"nip_pasangan"`
	IDPekerjaanPasangan int    `json:"id_pekerjaan_pasangan"`  // Note: int, not string
	PekerjaanPasangan   string `json:"pekerjaan_pasangan"`     // Nama pekerjaan
}

// SisterAlamat from /data_pribadi/alamat/{id_sdm}
// Response actual: {"alamat":"Mess Unila...","rt":3,"rw":1,"dusun":null,"kelurahan":"GEDONG MENENG","id_kota_kabupaten":"999999  ","kota_kabupaten":"tidak ada","kode_pos":"35145","telepon_rumah":"081540828489","telepon_hp":"085360010963","email":"mrtono1010@yahoo.com"}
type SisterAlamat struct {
	Alamat           string `json:"alamat"`             // Note: "alamat", not "jalan"
	RT               int    `json:"rt"`                 // Note: int, not string
	RW               int    `json:"rw"`                 // Note: int, not string
	Dusun            string `json:"dusun"`
	Kelurahan        string `json:"kelurahan"`          // Note: "kelurahan", not "ds_kel"
	IDKotaKabupaten  string `json:"id_kota_kabupaten"`
	KotaKabupaten    string `json:"kota_kabupaten"`
	KodePos          string `json:"kode_pos"`
	TeleponRumah     string `json:"telepon_rumah"`      // New field
	TeleponHP        string `json:"telepon_hp"`         // New field
	Email            string `json:"email"`              // New field
}

// SisterKepegawaian from /data_pribadi/kepegawaian/{id_sdm}
// Response actual: {"nidn":"0010107106","nip":"197110102002121001","nuptk":"7342749650130233","sk_cpns":"1469/J26/KP/2003","tanggal_sk_cpns":"2003-04-28","sk_tmmd":null,"tmmd":"2002-12-01","id_sumber_gaji":1,"sumber_gaji":"APBN"}
type SisterKepegawaian struct {
	NIDN            string `json:"nidn"`
	NIP             string `json:"nip"`
	NUPTK           string `json:"nuptk"`
	SKCPNS          string `json:"sk_cpns"`            // Note: sk_cpns, not no_sk_cpns
	TanggalSKCPNS   string `json:"tanggal_sk_cpns"`
	SKTMMD          string `json:"sk_tmmd"`
	TMMD            string `json:"tmmd"`               // TMT (Terhitung Mulai Tanggal)
	IDSumberGaji    int    `json:"id_sumber_gaji"`     // Note: int
	SumberGaji      string `json:"sumber_gaji"`        // Nama sumber gaji
}

// SisterLain from /data_pribadi/lain/{id_sdm}
type SisterLain struct {
	NPWP string `json:"npwp"`
}

// DosenSyncResult represents the result of syncing a single dosen
type DosenSyncResult struct {
	IDSDM   string `json:"id_sdm"`
	Nama    string `json:"nama"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// BatchDosenSyncResult represents the result of batch sync
type BatchDosenSyncResult struct {
	TotalProcessed int                `json:"total_processed"`
	TotalSuccess   int                `json:"total_success"`
	TotalFailed    int                `json:"total_failed"`
	Duration       string             `json:"duration"`
	Results        []DosenSyncResult  `json:"results,omitempty"`
	SyncedBy       string             `json:"synced_by"`
}

// DosenListResult represents paginated dosen list response
type DosenListResult struct {
	Data       []*Dosen `json:"data"`
	Total      int      `json:"total"`
	Page       int      `json:"page"`
	Limit      int      `json:"limit"`
	TotalPages int      `json:"total_pages"`
}

// PhotoSyncResult represents the result of syncing a single dosen photo
type PhotoSyncResult struct {
	IDSDM       string `json:"id_sdm"`
	Nama        string `json:"nama"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
	FileSize    int    `json:"file_size,omitempty"`
	ContentType string `json:"content_type,omitempty"`
	MinIOPath   string `json:"minio_path,omitempty"`
}

// BatchPhotoSyncResult represents the result of batch photo sync
type BatchPhotoSyncResult struct {
	TotalProcessed int               `json:"total_processed"`
	TotalSuccess   int               `json:"total_success"`
	TotalFailed    int               `json:"total_failed"`
	TotalSkipped   int               `json:"total_skipped"`
	Duration       string            `json:"duration"`
	SyncedBy       string            `json:"synced_by"`
	Results        []PhotoSyncResult `json:"results,omitempty"`
}

// DosenIDName represents a simple dosen ID and name pair for photo sync
type DosenIDName struct {
	IDSDM string `db:"id_sdm"`
	Nama  string `db:"nm_sdm"`
}

// DokumenSyncItem represents a single document to be synced from SISTER to MinIO
type DokumenSyncItem struct {
	IDSDM      string `json:"id_sdm"`
	IDDok      string `json:"id_dok"`
	IDJnsDok   int    `json:"id_jns_dok"`
	NmJnsDok   string `json:"nm_jns_dok"`
	NmDok      string `json:"nm_dok"`
	NmFile     string `json:"nm_file"`
	JenisFile  string `json:"jenis_file"`
	Keterangan string `json:"keterangan"`
	WktUnggah  string `json:"wkt_unggah"`
	MinioPath  string `json:"minio_path,omitempty"`
}

// DokumenSyncResult represents the result of syncing documents for a single dosen
type DokumenSyncResult struct {
	IDSDM   string `json:"id_sdm"`
	Total   int    `json:"total"`
	Success int    `json:"success"`
	Skipped int    `json:"skipped"`
	Failed  int    `json:"failed"`
}

// BatchDokumenSyncResult represents the aggregate result of syncing all dosen documents
type BatchDokumenSyncResult struct {
	TotalDosen   int    `json:"total_dosen"`
	TotalDokumen int    `json:"total_dokumen"`
	TotalSuccess int    `json:"total_success"`
	TotalSkipped int    `json:"total_skipped"`
	TotalFailed  int    `json:"total_failed"`
	Duration     string `json:"duration"`
	SyncedBy     string `json:"synced_by"`
}

// DosenStats represents dosen statistics
type DosenStats struct {
	TotalDosen      int                    `json:"total_dosen"`
	TotalAktif      int                    `json:"total_aktif"`
	TotalTidakAktif int                    `json:"total_tidak_aktif"`
	ByJenisSDM      []map[string]interface{} `json:"by_jenis_sdm"`
	ByStatusAktif   []map[string]interface{} `json:"by_status_aktif"`
	LastSync        *time.Time             `json:"last_sync"`
}
