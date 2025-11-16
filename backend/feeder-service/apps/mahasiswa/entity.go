package mahasiswa

import "time"

// PesertaDidik - Main entity for student data (pdrd.peserta_didik)
type PesertaDidik struct {
	// Primary Key
	IDPD string `json:"id_pd" db:"id_pd"`

	// Personal Information
	NamaPD      string     `json:"nama_pd" db:"nm_pd"`
	JK          string     `json:"jenis_kelamin" db:"jk"`
	NIK         *string    `json:"nik" db:"nik"`
	NISN        *string    `json:"nisn" db:"nisn"`
	TempatLahir *string    `json:"tempat_lahir" db:"tmpt_lahir"`
	TglLahir    *time.Time `json:"tanggal_lahir" db:"tgl_lahir"`

	// Address Information
	Jalan      *string `json:"jalan" db:"jln"`
	RT         *string `json:"rt" db:"rt"`
	RW         *string `json:"rw" db:"rw"`
	NamaDusun  *string `json:"nama_dusun" db:"nm_dsn"`
	Kelurahan  *string `json:"kelurahan" db:"ds_kel"`
	KodePos    *string `json:"kode_pos" db:"kode_pos"`
	TeleponRumah *string `json:"telepon_rumah" db:"tlpn_rumah"`
	TeleponHP  *string `json:"telepon_hp" db:"tlpn_hp"`
	Email      *string `json:"email" db:"email"`

	// Parent Information - Wali
	NamaWali          *string    `json:"nama_wali" db:"nm_wali"`
	TglLahirWali      *time.Time `json:"tanggal_lahir_wali" db:"tgl_lahir_wali"`
	IDPekerjaanWali   *int       `json:"id_pekerjaan_wali" db:"id_pekerjaan_wali"`
	IDPenghasilanWali *int       `json:"id_penghasilan_wali" db:"id_penghasilan_wali"`
	IDPendidikanWali  *int       `json:"id_pendidikan_wali" db:"id_pendidikan_wali"`

	// Parent Information - Ibu
	NamaIbu          *string    `json:"nama_ibu_kandung" db:"nm_ibu_kandung"`
	TglLahirIbu      *time.Time `json:"tanggal_lahir_ibu" db:"tgl_lahir_ibu"`
	NIKIbu           *string    `json:"nik_ibu" db:"nik_ibu"`
	IDPekerjaanIbu   *int       `json:"id_pekerjaan_ibu" db:"id_pekerjaan_ibu"`
	IDPenghasilanIbu *int       `json:"id_penghasilan_ibu" db:"id_penghasilan_ibu"`
	IDPendidikanIbu  *int       `json:"id_pendidikan_ibu" db:"id_pendidikan_ibu"`
	IDKKIbu          *int       `json:"id_kebutuhan_khusus_ibu" db:"id_kk_ibu"`

	// Parent Information - Ayah
	NamaAyah          *string    `json:"nama_ayah" db:"nm_ayah"`
	TglLahirAyah      *time.Time `json:"tanggal_lahir_ayah" db:"tgl_lahir_ayah"`
	NIKAyah           *string    `json:"nik_ayah" db:"nik_ayah"`
	IDPekerjaanAyah   *int       `json:"id_pekerjaan_ayah" db:"id_pekerjaan_ayah"`
	IDPenghasilanAyah *int       `json:"id_penghasilan_ayah" db:"id_penghasilan_ayah"`
	IDPendidikanAyah  *int       `json:"id_pendidikan_ayah" db:"id_pendidikan_ayah"`
	IDKKAyah          *int       `json:"id_kebutuhan_khusus_ayah" db:"id_kk_ayah"`

	// Assistance & Support
	ATerimaKPS       *int    `json:"penerima_kps" db:"a_terima_kps"`
	NoKPS            *string `json:"nomor_kps" db:"no_kps"`
	IDKK             *int    `json:"id_kebutuhan_khusus" db:"id_kk"`
	IDAlatTransport *int    `json:"id_alat_transportasi" db:"id_alat_transport"`

	// Reference Foreign Keys
	IDKewarganegaraan *string `json:"id_kewarganegaraan" db:"id_kewarganegaraan"`
	IDAgama           *int    `json:"id_agama" db:"id_agama"`
	IDJenisTinggal    *int    `json:"id_jenis_tinggal" db:"id_jns_tinggal"`
	IDWilayah         *string `json:"id_wilayah" db:"id_wil"`
	IDStatMhs         *string `json:"id_status_mahasiswa" db:"id_stat_mhs"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// RegPd - Registration data (pdrd.reg_pd)
type RegPd struct {
	// Primary Key
	IDRegPd string `json:"id_reg_pd" db:"id_reg_pd"`

	// Foreign Keys
	IDSP   string `json:"id_sp" db:"id_sp"`
	IDSMS  string `json:"id_sms" db:"id_sms"`
	IDPD   string `json:"id_pd" db:"id_pd"`

	// Registration Info
	IDJenisDaftar   *int       `json:"id_jenis_daftar" db:"id_jns_daftar"`
	IDJalurDaftar   *int       `json:"id_jalur_daftar" db:"id_jalur_daftar"`
	IDPembiayaan    *int       `json:"id_pembiayaan" db:"id_pembiayaan"`
	IDSemesterMasuk string     `json:"id_semester_masuk" db:"id_semester_masuk"`
	IDJenisKeluar   *int       `json:"id_jenis_keluar" db:"id_jns_keluar"`
	NIPD            *string    `json:"nim" db:"nipd"`
	TglMasukSP      *time.Time `json:"tanggal_masuk" db:"tgl_masuk_sp"`

	// Transfer Credits
	SKSDiakui    *int    `json:"sks_diakui" db:"sks_diakui"`
	IDPTAsal     *string `json:"id_pt_asal" db:"id_pt_asal"`
	NamaPTAsal   *string `json:"nama_pt_asal" db:"nm_pt_asal"`
	IDProdiAsal  *string `json:"id_prodi_asal" db:"id_prodi_asal"`
	NamaProdiAsal *string `json:"nama_prodi_asal" db:"nm_prodi_asal"`

	// Graduate/DO Information
	TglKeluar       *time.Time `json:"tanggal_keluar" db:"tgl_keluar"`
	Keterangan      *string    `json:"keterangan" db:"ket"`
	SKYudisium      *string    `json:"sk_yudisium" db:"sk_yudisium"`
	TglSKYudisium   *time.Time `json:"tanggal_sk_yudisium" db:"tgl_sk_yudisium"`
	IPK             *float64   `json:"ipk" db:"ipk"`
	NoSeriIjazah    *string    `json:"nomor_ijazah" db:"no_seri_ijazah"`
	JalurSkripsi    *int       `json:"jalur_skripsi" db:"jalur_skripsi"`
	JudulSkripsi    *string    `json:"judul_skripsi" db:"judul_skripsi"`
	BlnAwalBimbingan *string   `json:"bulan_awal_bimbingan" db:"bln_awal_bimbingan"`
	BlnAkhirBimbingan *string  `json:"bulan_akhir_bimbingan" db:"bln_akhir_bimbingan"`
	AsalDataIjazah  *int       `json:"asal_data_ijazah" db:"asal_data_ijazah"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// KuliahMhs - Semester activity data (pdrd.kuliah_mhs)
type KuliahMhs struct {
	// Composite Primary Key
	IDRegPd string `json:"id_reg_pd" db:"id_reg_pd"`
	IDSmt   string `json:"id_semester" db:"id_smt"`

	// Activity Data
	IDStatMhs    *string  `json:"id_status_mahasiswa" db:"id_stat_mhs"`
	IPS          *float64 `json:"ips" db:"ips"`
	IPK          *float64 `json:"ipk" db:"ipk"`
	SKSSemester  *int     `json:"sks_semester" db:"sks_semester"`
	TotalSKS     *int     `json:"total_sks" db:"total_sks"`
	BiayaSemester *int64  `json:"biaya_kuliah_semester" db:"biaya_smt"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// --- DTOs for Feeder API Responses ---

// FeederMahasiswaData - Response from GetDataLengkapMahasiswaProdi
type FeederMahasiswaData struct {
	IDMahasiswa             string  `json:"id_mahasiswa"`
	IDRegistrasiMahasiswa   string  `json:"id_registrasi_mahasiswa"`
	IDProdi                 string  `json:"id_prodi"`
	NamaMahasiswa           string  `json:"nama_mahasiswa"`
	NamaStatusMahasiswa     string  `json:"nama_status_mahasiswa"`
	JenisKelamin            string  `json:"jenis_kelamin"`
	NISN                    *string `json:"nisn"`
	NIK                     *string `json:"nik"`
	TempatLahir             *string `json:"tempat_lahir"`
	TanggalLahir            *string `json:"tanggal_lahir"`

	// Address
	Jalan                   *string `json:"jalan"`
	RT                      *string `json:"rt"`
	RW                      *string `json:"rw"`
	Dusun                   *string `json:"dusun"`
	Kelurahan               *string `json:"kelurahan"`
	KodePos                 *string `json:"kode_pos"`
	Telepon                 *string `json:"telepon"`
	Handphone               *string `json:"handphone"`
	Email                   *string `json:"email"`

	// Parents - Wali
	NamaWali                *string `json:"nama_wali"`
	TanggalLahirWali        *string `json:"tanggal_lahir_wali"`
	IDPekerjaanWali         *int    `json:"id_pekerjaan_wali"`
	IDPenghasilanWali       *int    `json:"id_penghasilan_wali"`
	IDPendidikanWali        *int    `json:"id_pendidikan_wali"`

	// Parents - Ibu
	NamaIbuKandung          *string `json:"nama_ibu_kandung"`
	TanggalLahirIbu         *string `json:"tanggal_lahir_ibu"`
	NIKIbu                  *string `json:"nik_ibu"`
	IDPekerjaanIbu          *int    `json:"id_pekerjaan_ibu"`
	IDPenghasilanIbu        *int    `json:"id_penghasilan_ibu"`
	IDPendidikanIbu         *int    `json:"id_pendidikan_ibu"`
	IDKebutuhanKhususIbu    *int    `json:"id_kebutuhan_khusus_ibu"`

	// Parents - Ayah
	NamaAyah                *string `json:"nama_ayah"`
	TanggalLahirAyah        *string `json:"tanggal_lahir_ayah"`
	NIKAyah                 *string `json:"nik_ayah"`
	IDPekerjaanAyah         *int    `json:"id_pekerjaan_ayah"`
	IDPenghasilanAyah       *int    `json:"id_penghasilan_ayah"`
	IDPendidikanAyah        *int    `json:"id_pendidikan_ayah"`
	IDKebutuhanKhususAyah   *int    `json:"id_kebutuhan_khusus_ayah"`

	// Assistance
	PenerimaKPS             *int    `json:"penerima_kps"`
	NomorKPS                *string `json:"nomor_kps"`
	IDKebutuhanKhususMahasiswa *int `json:"id_kebutuhan_khusus_mahasiswa"`
	IDAlatTransportasi      *int    `json:"id_alat_transportasi"`

	// References
	IDNegara                *string `json:"id_negara"`
	IDAgama                 *int    `json:"id_agama"`
	IDJenisTinggal          *int    `json:"id_jenis_tinggal"`
	IDWilayah               *string `json:"id_wilayah"`
}

// FeederRiwayatPendidikan - Response from GetListRiwayatPendidikanMahasiswa
type FeederRiwayatPendidikan struct {
	IDRegistrasiMahasiswa string  `json:"id_registrasi_mahasiswa"`
	NIM                   *string `json:"nim"`
	IDJenisDaftar         *int    `json:"id_jenis_daftar"`
	IDJalurDaftar         *int    `json:"id_jalur_daftar"`
	IDPembiayaan          *int    `json:"id_pembiayaan"`
	IDPeriodeMasuk        string  `json:"id_periode_masuk"`
	IDJenisKeluar         *int    `json:"id_jenis_keluar"`
	TanggalDaftar         *string `json:"tanggal_daftar"`
	SKSDiakui             *int    `json:"sks_diakui"`
	IDPerguruanTinggiAsal *string `json:"id_perguruan_tinggi_asal"`
	NamaPerguruanTinggiAsal *string `json:"nama_perguruan_tinggi_asal"`
	IDProdiAsal           *string `json:"id_prodi_asal"`
	NamaProgramStudiAsal  *string `json:"nama_program_studi_asal"`
}

// FeederMahasiswaLulusDO - Response from GetDetailMahasiswaLulusDO
type FeederMahasiswaLulusDO struct {
	IDJenisKeluar       *int     `json:"id_jenis_keluar"`
	TanggalKeluar       *string  `json:"tanggal_keluar"`
	Keterangan          *string  `json:"keterangan"`
	NomorSKYudisium     *string  `json:"nomor_sk_yudisium"`
	TanggalSKYudisium   *string  `json:"tanggal_sk_yudisium"`
	IPK                 *float64 `json:"ipk"`
	NomorIjazah         *string  `json:"nomor_ijazah"`
	JalurSkripsi        *int     `json:"jalur_skripsi"`
	JudulSkripsi        *string  `json:"judul_skripsi"`
	BulanAwalBimbingan  *string  `json:"bulan_awal_bimbingan"`
	BulanAkhirBimbingan *string  `json:"bulan_akhir_bimbingan"`
	AsalIjazah          *int     `json:"asal_ijazah"`
}

// FeederPerkuliahanMahasiswa - Response from GetListPerkuliahanMahasiswa
type FeederPerkuliahanMahasiswa struct {
	IDRegistrasiMahasiswa string   `json:"id_registrasi_mahasiswa"`
	IDSemester            string   `json:"id_semester"`
	IDStatusMahasiswa     *string  `json:"id_status_mahasiswa"`
	IPS                   *float64 `json:"ips"`
	IPK                   *float64 `json:"ipk"`
	SKSSemester           *int     `json:"sks_semester"`
	SKSTotal              *int     `json:"sks_total"`
	BiayaKuliahSemester   *int64   `json:"biaya_kuliah_smt"`
}

// --- Sync Result DTOs ---

// MahasiswaSyncResult - Result for single mahasiswa sync
type MahasiswaSyncResult struct {
	IDPD    string `json:"id_pd"`
	Nama    string `json:"nama"`
	NPM     string `json:"npm"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// BatchMahasiswaSyncResult - Result for batch sync
type BatchMahasiswaSyncResult struct {
	TotalProcessed int                    `json:"total_processed"`
	TotalSuccess   int                    `json:"total_success"`
	TotalFailed    int                    `json:"total_failed"`
	Duration       string                 `json:"duration"`
	Results        []MahasiswaSyncResult  `json:"results,omitempty"`
	SyncedBy       string                 `json:"synced_by"`
	Filter         *SyncFilter            `json:"filter,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	Angkatan   []string `json:"angkatan"` // WAJIB - format: ["2021", "2022"], support multiple angkatan
	IDProdi    *string  `json:"id_prodi,omitempty"` // Optional
	IDSemester *string  `json:"id_semester,omitempty"` // Optional
}

// --- List & Pagination DTOs ---

// MahasiswaListItem - Mahasiswa with calculated fields for list view
type MahasiswaListItem struct {
	IDPD              string     `json:"id_pd"`
	Nama              string     `json:"nama"`
	NPM               *string    `json:"npm"`
	Angkatan          *string    `json:"angkatan"` // Extracted from id_semester_masuk
	NamaJalurMasuk    *string    `json:"jalur_masuk"`
	NamaJenisDaftar   *string    `json:"jenis_pendaftaran"`
	SemesterSekarang  *int       `json:"semester_sekarang"` // COUNT from kuliah_mhs
	NamaStatusMhs     *string    `json:"status_mahasiswa"`
	NamaJenisKeluar   *string    `json:"jenis_keluar,omitempty"`
	LastSync          *time.Time `json:"last_sync"`
	IDProdi           *string    `json:"id_prodi"`
	NamaProdi         *string    `json:"nama_prodi"`
}

// MahasiswaListResult - Paginated list result
type MahasiswaListResult struct {
	Data       []*MahasiswaListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// --- Statistics DTOs ---

// MahasiswaStats - Statistics for dashboard
type MahasiswaStats struct {
	TotalMahasiswa      int                      `json:"total_mahasiswa"`
	TotalAktif          int                      `json:"total_aktif"`
	TotalTidakAktif     int                      `json:"total_tidak_aktif"`
	TotalLulus          int                      `json:"total_lulus"`
	ByAngkatan          []map[string]interface{} `json:"by_angkatan"`
	ByProdi             []map[string]interface{} `json:"by_prodi"`
	ByStatusMahasiswa   []map[string]interface{} `json:"by_status_mahasiswa"`
	LastSync            *time.Time               `json:"last_sync"`
}
