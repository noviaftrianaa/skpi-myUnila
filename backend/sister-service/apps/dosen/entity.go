package dosen

import "time"

// Dosen represents the dosen entity in sdm.dosen table
type Dosen struct {
	IDSDM           string     `json:"id_sdm" db:"id_sdm"`
	NamaSDM         string     `json:"nama_sdm" db:"nm_sdm"`
	JenisKelamin    string     `json:"jenis_kelamin" db:"jns_kelamin"`
	TempatLahir     string     `json:"tempat_lahir" db:"tmpt_lahir"`
	TanggalLahir    *time.Time `json:"tanggal_lahir" db:"tgl_lahir"`
	IDJenisSDM      *int       `json:"id_jenis_sdm" db:"id_jns_sdm"`
	NIK             *string    `json:"nik" db:"nik"`
	NIDN            *string    `json:"nidn" db:"nidn"`
	NIP             *string    `json:"nip" db:"nip"`
	NUPTK           *string    `json:"nuptk" db:"nuptk"`
	IDAgama         *string    `json:"id_agama" db:"id_agama"`
	IDStatusAktif   *string    `json:"id_status_aktif" db:"id_stat_aktif"`
	Kewarganegaraan *string    `json:"kewarganegaraan" db:"kewarganegaraan"`
	StatusKawin     *string    `json:"status_kawin" db:"stat_kawin"`
	NamaPasangan    *string    `json:"nama_pasangan" db:"nm_pasangan"`
	NIPPasangan     *string    `json:"nip_pasangan" db:"nip_pasangan"`
	TanggalNikah    *time.Time `json:"tanggal_nikah" db:"tgl_nikah"`
	PekerjaanPsgn   *string    `json:"pekerjaan_pasangan" db:"pekerjaan_psgn"`
	Alamat          *string    `json:"alamat" db:"jalan"`
	RT              *string    `json:"rt" db:"rt"`
	RW              *string    `json:"rw" db:"rw"`
	Dusun           *string    `json:"dusun" db:"dusun"`
	DesaKelurahan   *string    `json:"desa_kelurahan" db:"ds_kel"`
	KodePos         *string    `json:"kode_pos" db:"kode_pos"`
	IDWilayah       *string    `json:"id_wilayah" db:"id_wil"`
	Telepon         *string    `json:"telepon" db:"telepon"`
	Handphone       *string    `json:"handphone" db:"handphone"`
	Email           *string    `json:"email" db:"email"`
	IDLembagaPengangkat *int   `json:"id_lembaga_pengangkat" db:"id_lemb_angkat"`
	NIPY            *string    `json:"nipy" db:"nipy"`
	TanggalMasuk    *time.Time `json:"tanggal_masuk" db:"tgl_msk_pegawai"`
	TanggalKeluar   *time.Time `json:"tanggal_keluar" db:"tgl_klr_pegawai"`
	TanggalCPNS     *time.Time `json:"tanggal_cpns" db:"tgl_cpns"`
	NomorSKCPNS     *string    `json:"nomor_sk_cpns" db:"no_sk_cpns"`
	TanggalSKCPNS   *time.Time `json:"tanggal_sk_cpns" db:"tgl_sk_cpns"`
	TanggalPengangkatan *time.Time `json:"tanggal_pengangkatan" db:"tgl_diangkat"`
	TMTPNS          *time.Time `json:"tmt_pns" db:"tmt_pns"`
	NomorSKPengangkatan *string `json:"nomor_sk_pengangkatan" db:"no_sk_pengangkatan"`
	NPWP            *string    `json:"npwp" db:"npwp"`
	CreateDate      *time.Time `json:"create_date,omitempty" db:"create_date"`
	LastUpdate      *time.Time `json:"last_update,omitempty" db:"last_update"`
	LastSync        *time.Time `json:"last_sync,omitempty" db:"last_sync"`
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
