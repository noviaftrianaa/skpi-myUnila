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
type SisterProfil struct {
	NamaSDM      string `json:"nm_sdm"`
	JenisKelamin string `json:"jk"`
	TempatLahir  string `json:"tmpt_lahir"`
	TanggalLahir string `json:"tgl_lahir"`
	NIDN         string `json:"nidn"`
	Telepon      string `json:"telepon"`
	Handphone    string `json:"handphone"`
	Email        string `json:"email"`
}

// SisterKependudukan from /data_pribadi/kependudukan/{id_sdm}
type SisterKependudukan struct {
	NIK             string `json:"nik"`
	IDAgama         string `json:"id_agama"`
	Kewarganegaraan string `json:"a_kewarga"`
}

// SisterKeluarga from /data_pribadi/keluarga/{id_sdm}
type SisterKeluarga struct {
	StatusKawin   string `json:"stat_kawin"`
	NamaPasangan  string `json:"nm_pasangan"`
	NIPPasangan   string `json:"nip_pasangan"`
	TanggalNikah  string `json:"tgl_nikah"`
	PekerjaanPsgn string `json:"pekerjaan_psgn"`
}

// SisterAlamat from /data_pribadi/alamat/{id_sdm}
type SisterAlamat struct {
	Jalan         string `json:"jalan"`
	RT            string `json:"rt"`
	RW            string `json:"rw"`
	Dusun         string `json:"dusun"`
	DesaKelurahan string `json:"ds_kel"`
	KodePos       string `json:"kode_pos"`
	IDWilayah     string `json:"id_wil"`
}

// SisterKepegawaian from /data_pribadi/kepegawaian/{id_sdm}
type SisterKepegawaian struct {
	IDJenisSDM          string `json:"id_jns_sdm"`
	IDStatusAktif       string `json:"id_stat_aktif"`
	NIP                 string `json:"nip"`
	NIPY                string `json:"nipy"`
	NUPTK               string `json:"nuptk"`
	TanggalMasuk        string `json:"tgl_msk_pegawai"`
	TanggalKeluar       string `json:"tgl_klr_pegawai"`
	TanggalCPNS         string `json:"tgl_cpns"`
	NomorSKCPNS         string `json:"no_sk_cpns"`
	TanggalSKCPNS       string `json:"tgl_sk_cpns"`
	TanggalPengangkatan string `json:"tgl_diangkat"`
	NomorSKPengangkatan string `json:"no_sk_pengangkatan"`
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

// DosenStats represents dosen statistics
type DosenStats struct {
	TotalDosen      int                    `json:"total_dosen"`
	TotalAktif      int                    `json:"total_aktif"`
	TotalTidakAktif int                    `json:"total_tidak_aktif"`
	ByJenisSDM      []map[string]interface{} `json:"by_jenis_sdm"`
	ByStatusAktif   []map[string]interface{} `json:"by_status_aktif"`
	LastSync        *time.Time             `json:"last_sync"`
}
