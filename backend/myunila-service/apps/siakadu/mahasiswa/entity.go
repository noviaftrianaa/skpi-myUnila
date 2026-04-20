package mahasiswa

import (
	"time"
)

// MahasiswaListItem - Mahasiswa for list view (from api-siakadu /mahasiswa/list)
type MahasiswaListItem struct {
	NIM        string     `db:"nim" json:"nim"`
	Nama       string     `db:"nama" json:"nama"`
	Angkatan   *string    `db:"angkatan" json:"angkatan"`
	JK         *string    `db:"jk" json:"jk"`
	IdUnit     *string    `db:"id_unit" json:"id_unit"`
	Fakultas   *string    `db:"nm_fakultas" json:"nm_fakultas"`
	Jurusan    *string    `db:"nm_jurusan" json:"nm_jurusan"`
	Prodi      *string    `db:"nm_prodi" json:"nm_prodi"`
	Semester   *string    `db:"semester" json:"semester"`
	IPK        *float64   `db:"ipk" json:"ipk"`
	SKSTotal   *int       `db:"sks_total" json:"sks_total"`
	SKSLulus   *int       `db:"sks_lulus" json:"sks_lulus"`
	Status     *string    `db:"id_status_mhs" json:"status"`
	StatusName *string    `db:"status_mahasiswa" json:"status_mahasiswa"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// MahasiswaDetail - Full mahasiswa detail (from api-siakadu /mahasiswa/detail)
// Matches siakadu.mahasiswa v2.0 table + keluarga
type MahasiswaDetail struct {
	// Core identity
	NIM           string  `db:"nim" json:"nim"`
	Nama          string  `db:"nama" json:"nama"`
	Angkatan      *string `db:"angkatan" json:"angkatan"`
	GelarDepan    *string `db:"gelar_depan" json:"gelar_depan"`
	GelarBelakang *string `db:"gelar_belakang" json:"gelar_belakang"`
	JK            *string `db:"jk" json:"jk"`
	TmptLahir     *string `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir      *string `db:"tgl_lahir" json:"tgl_lahir"`
	StatusNikah   *string `db:"status_nikah" json:"status_nikah"`

	// Documents
	NIK      *string `db:"nik" json:"nik"`
	Nokk     *string `db:"nokk" json:"nokk"`
	NISN     *string `db:"nisn" json:"nisn"`
	NUPN     *string `db:"nupn" json:"nupn"`
	NoKPS    *string `db:"no_kps" json:"no_kps"`
	NPSN     *string `db:"npsn" json:"npsn"`
	NomorTes *string `db:"nomor_tes" json:"nomor_tes"`
	NoSkdo   *string `db:"no_skdo" json:"no_skdo"`
	PtNim    *string `db:"pt_nim" json:"pt_nim"`

	// Contact
	Alamat      *string `db:"alamat" json:"alamat"`
	Telepon     *string `db:"telepon" json:"telepon"`
	HP          *string `db:"hp" json:"hp"`
	HP2         *string `db:"hp2" json:"hp2"`
	Email       *string `db:"email" json:"email"`
	EmailKampus *string `db:"email_kampus" json:"email_kampus"`
	EmailOrtu   *string `db:"email_ortu" json:"email_ortu"`
	KodePos     *string `db:"kode_pos" json:"kode_pos"`

	// Address detail
	IdKota      *string `db:"id_kota" json:"id_kota"`
	NamaKota    *string `db:"nama_kota" json:"nama_kota"`
	IdKecamatan *string `db:"id_kecamatan" json:"id_kecamatan"`
	Kecamatan   *string `db:"kecamatan" json:"kecamatan"`
	RT          *string `db:"rt" json:"rt"`
	RW          *string `db:"rw" json:"rw"`
	Dusun       *string `db:"dusun" json:"dusun"`
	Desa        *string `db:"desa" json:"desa"`

	// Academic
	IdUnit          *string  `db:"id_unit" json:"id_unit"`
	NmFakultas      *string  `db:"nm_fakultas" json:"nm_fakultas"`
	NmJurusan       *string  `db:"nm_jurusan" json:"nm_jurusan"`
	NmProdi         *string  `db:"nm_prodi" json:"nm_prodi"`
	NmBidangStudi   *string  `db:"nm_bidang_studi" json:"nm_bidang_studi"`
	IdKurikulum     *string  `db:"id_kurikulum" json:"id_kurikulum"`
	Semester        *string  `db:"semester" json:"semester"`
	IPK             *float64 `db:"ipk" json:"ipk"`
	SKSTotal        *int     `db:"sks_total" json:"sks_total"`
	SKSLulus        *int     `db:"sks_lulus" json:"sks_lulus"`
	IdPeriode       *string  `db:"id_periode" json:"id_periode"`
	IdStatusMhs     *string  `db:"id_status_mhs" json:"id_status_mhs"`
	StatusMahasiswa *string  `db:"status_mahasiswa" json:"status_mahasiswa"`
	IdSistemKuliah  *int     `db:"id_sistem_kuliah" json:"id_sistem_kuliah"`
	NmSistemKuliah  *string  `db:"nm_sistem_kuliah" json:"nm_sistem_kuliah"`
	IdPeriodeMax    *string  `db:"id_periode_max" json:"id_periode_max"`
	PeriodeTerakhir *string  `db:"periode_terakhir" json:"periode_terakhir"`
	NamaKelas       *string  `db:"nama_kelas" json:"nama_kelas"`

	// Socio-economic
	IdAgama        *int    `db:"id_agama" json:"id_agama"`
	NamaAgama      *string `db:"nama_agama" json:"nama_agama"`
	NamaNegara     *string `db:"nama_negara" json:"nama_negara"`
	JenisTinggal   *string `db:"jenis_tinggal" json:"jenis_tinggal"`
	NamaTransport  *string `db:"nama_transport" json:"nama_transport"`
	NamaPekerjaan  *string `db:"nama_pekerjaan" json:"nama_pekerjaan"`
	NamaPenghasilan *string `db:"nama_penghasilan" json:"nama_penghasilan"`
	IdSuku         *int    `db:"id_suku" json:"id_suku"`
	NamaSuku       *string `db:"nama_suku" json:"nama_suku"`
	GolDarah       *string `db:"gol_darah" json:"gol_darah"`
	BeratBadan     *string `db:"berat_badan" json:"berat_badan"`
	TinggiBadan    *string `db:"tinggi_badan" json:"tinggi_badan"`
	NamaHobi       *string `db:"nama_hobi" json:"nama_hobi"`
	NamaMinat      *string `db:"nama_minat" json:"nama_minat"`

	// Admission
	IdJalurPendaftaran  *int     `db:"id_jalur_pendaftaran" json:"id_jalur_pendaftaran"`
	JalurPendaftaran    *string  `db:"jalur_pendaftaran" json:"jalur_pendaftaran"`
	IdJenisPendaftaran  *int     `db:"id_jenis_pendaftaran" json:"id_jenis_pendaftaran"`
	TglDaftar           *string  `db:"tgl_daftar" json:"tgl_daftar"`
	IdGelombang         *int     `db:"id_gelombang" json:"id_gelombang"`
	Gelombang           *string  `db:"gelombang" json:"gelombang"`
	NilaiTpa            *float64 `db:"nilai_tpa" json:"nilai_tpa"`
	NilaiKesehatan      *float64 `db:"nilai_kesehatan" json:"nilai_kesehatan"`
	NilaiPsikotes       *float64 `db:"nilai_psikotes" json:"nilai_psikotes"`
	NilaiWawancara      *float64 `db:"nilai_wawancara" json:"nilai_wawancara"`
	IsBeasiswa          *string  `db:"is_beasiswa" json:"is_beasiswa"`

	// Transfer
	IsTransfer          *string  `db:"is_transfer" json:"is_transfer"`
	JenisTransfer       *int     `db:"jenis_transfer" json:"jenis_transfer"`
	IdPeriodeTransfer   *string  `db:"id_periode_transfer" json:"id_periode_transfer"`
	TglTransfer         *string  `db:"tgl_transfer" json:"tgl_transfer"`
	NimLama             *string  `db:"nim_lama" json:"nim_lama"`
	UnivAsal            *string  `db:"univ_asal" json:"univ_asal"`
	IpkAsal             *float64 `db:"ipk_asal" json:"ipk_asal"`
	SksAsal             *float64 `db:"sks_asal" json:"sks_asal"`
	IdPendidikanAsal    *string  `db:"id_pendidikan_asal" json:"id_pendidikan_asal"`
	TkPendidikanAsal    *string  `db:"tingkat_pendidikan_asal" json:"tingkat_pendidikan_asal"`
	FileTranskripAsal   *string  `db:"file_transkrip_asal" json:"file_transkrip_asal"`
	FileSuratPindah     *string  `db:"file_surat_pindah" json:"file_surat_pindah"`
	IdUnitAsal          *string  `db:"id_unit_asal" json:"id_unit_asal"`
	IdKurikulumAsal     *string  `db:"id_kurikulum_asal" json:"id_kurikulum_asal"`
	IpkUnivAsal         *float64 `db:"ipk_univ_asal" json:"ipk_univ_asal"`
	ProdiAsal           *string  `db:"prodi_asal" json:"prodi_asal"`
	Instansi            *string  `db:"instansi" json:"instansi"`

	// High school
	AsalSmu         *string  `db:"asal_smu" json:"asal_smu"`
	AlamatSmu       *string  `db:"alamat_smu" json:"alamat_smu"`
	IdKotaSmu       *string  `db:"id_kota_smu" json:"id_kota_smu"`
	TelpSmu         *string  `db:"telp_smu" json:"telp_smu"`
	NoIjazahSmu     *string  `db:"no_ijazah_smu" json:"no_ijazah_smu"`
	JurusanSekolah  *string  `db:"jurusan_sekolah" json:"jurusan_sekolah"`
	Nem             *float64 `db:"nem" json:"nem"`
	ThnLulusSekolah *int     `db:"thn_lulus_sekolah" json:"thn_lulus_sekolah"`

	// Finance
	KategoriUkt *string `db:"kategori_ukt" json:"kategori_ukt"`

	// Integration
	EdlinkStudentID *int `db:"edlink_student_id" json:"edlink_student_id"`

	// UUID mapping (bridging ke pdrd / PDDIKTI)
	IdPd    *string `db:"id_pd" json:"id_pd"`
	IdRegPd *string `db:"id_reg_pd" json:"id_reg_pd"`
	IdSms   *string `db:"id_sms" json:"id_sms"`

	// Ref FK
	IdStatMhs    *string `db:"id_stat_mhs" json:"id_stat_mhs"`
	IdJenjDidik  *int    `db:"id_jenj_didik" json:"id_jenj_didik"`
	IdJnsKeluar  *string `db:"id_jns_keluar" json:"id_jns_keluar"`
	IdJnsDaftar  *int    `db:"id_jns_daftar" json:"id_jns_daftar"`
	IdJalurDaftar *int   `db:"id_jalur_daftar" json:"id_jalur_daftar"`
	IdSmtMasuk   *string `db:"id_smt_masuk" json:"id_smt_masuk"`
	TglKeluar    *string `db:"tgl_keluar" json:"tgl_keluar"`
	KetKeluar    *string `db:"ket_keluar" json:"ket_keluar"`

	// Audit
	CreateDate time.Time  `db:"create_date" json:"create_date"`
	LastUpdate time.Time  `db:"last_update" json:"last_update"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
	SoftDelete int        `db:"soft_delete" json:"soft_delete"`
	UpdateUser *string    `db:"update_user" json:"update_user,omitempty"`

	// Nested
	Keluarga []Keluarga `json:"keluarga,omitempty"`
}

// Keluarga - Family member data (from api-siakadu MahasiswaDetail.Keluarga)
type Keluarga struct {
	NIM            string     `db:"nim" json:"nim"`
	StatusKeluarga *string    `db:"status_keluarga" json:"status_keluarga"`
	Nama           *string    `db:"nama" json:"nama"`
	StatusOrtu     *string    `db:"status_ortu" json:"status_ortu"`
	KondisiOrtu    *string    `db:"kondisi_ortu" json:"kondisi_ortu"`
	PendAkhir      *string    `db:"pend_akhir" json:"pend_akhir"`
	IdPekerjaan    *int       `db:"id_pekerjaan" json:"id_pekerjaan"`
	Pekerjaan      *string    `db:"pekerjaan" json:"pekerjaan"`
	IdPenghasilan  *int       `db:"id_penghasilan" json:"id_penghasilan"`
	Penghasilan    *string    `db:"penghasilan" json:"penghasilan"`
	Alamat         *string    `db:"alamat" json:"alamat"`
	Telepon        *string    `db:"telepon" json:"telepon"`
	TglLahir       *string    `db:"tgl_lahir" json:"tgl_lahir"`
	Email          *string    `db:"email" json:"email"`
	NIK            *string    `db:"nik" json:"nik"`
	Instansi       *string    `db:"instansi" json:"instansi"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync,omitempty"`
	UpdateUser     *string    `db:"update_user" json:"-"`
}

// MahasiswaListFilter - Filter params for mahasiswa list
type MahasiswaListFilter struct {
	Page      int
	Limit     int
	Search    string
	IdUnit    string
	Angkatan  string
	Status    string
	SortBy    string
	SortOrder string
}

// PaginatedResult - Paginated list result
type PaginatedResult struct {
	Data       []*MahasiswaListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// FilterOptions - Available filter options for mahasiswa list
type FilterOptions struct {
	Prodi    []ProdiOption  `json:"prodi"`
	Angkatan []string       `json:"angkatan"`
	Status   []string       `json:"status"`
}

// ProdiOption - Prodi option for filter dropdown
type ProdiOption struct {
	IdUnit  string `db:"id_unit" json:"id_unit"`
	NmProdi string `db:"nm_prodi" json:"nm_prodi"`
}

// SyncStats - Sync statistics
type SyncStats struct {
	TotalMahasiswa int        `json:"total_mahasiswa"`
	TotalAktif     int        `json:"total_aktif"`
	TotalNonAktif  int        `json:"total_non_aktif"`
	LastSync       *time.Time `json:"last_sync"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	Page      int    `json:"page"`
	PageSize  int    `json:"page_size"`
	IdUnit    string `json:"id_unit"`
	ForceSync bool   `json:"force_sync,omitempty"`
	SyncType  string `json:"sync_type,omitempty"`
}

// SyncResult - Result for mahasiswa sync
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalInserted int    `json:"total_inserted"`
	TotalUpdated  int    `json:"total_updated"`
	TotalSkipped  int    `json:"total_skipped"`
	TotalErrors   int    `json:"total_errors"`
	Duration      string `json:"duration"`
	SyncedBy      string `json:"synced_by"`
}

// ProdiSyncResult - Result per prodi for SyncAllProdi
type ProdiSyncResult struct {
	IdUnit string `json:"id_unit"`
	NmUnit string `json:"nm_unit"`
	*SyncResult
}

// SyncFullResult - Combined result for full sync (list + detail enrichment)
type SyncFullResult struct {
	ListSync      *SyncResult `json:"list_sync"`
	DetailSync    *SyncResult `json:"detail_sync"`
	TotalDuration string      `json:"total_duration"`
}

// SyncLogEntry - Entry for sync log
type SyncLogEntry struct {
	EndpointName  string
	EndpointKey   string
	SyncType      string
	Status        string
	APICode       string
	TotalRecords  int
	InsertedCount int
	UpdatedCount  int
	FailedCount   int
	SkippedCount  int
	DurationMs    int
	ErrorMessage  *string
	ErrorDetails  *string
	SyncedBy      string
}

// ProdiInfo for GetAllProdiIDs
type ProdiInfo struct {
	IdUnit string  `db:"id_unit"`
	NmUnit *string `db:"nm_unit"`
}
