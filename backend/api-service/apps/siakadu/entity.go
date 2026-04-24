// Package siakadu — endpoint untuk data SIAKADU (schema siakadu di pdut).
// Source: siakadu.mahasiswa, sdm, wisuda, nilai, kehadiran, ukt/spp, dll.
// Data dipopulate oleh myunila-service dari SIAKADU WS via scheduler/command sync.
//
// Pattern di ws-api: READ-ONLY (GET) + enrich dengan pdrd UUID/nama kalau perlu.
// Write TETAP via myunila-service supaya single-writer invariant terjaga.
package siakadu

import (
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 11a — Mahasiswa + SDM + Wisuda
// ============================================================================

// Mahasiswa — ringkas list view
type Mahasiswa struct {
	Nim              string           `db:"nim" json:"nim"`
	Nama             string           `db:"nama" json:"nama"`
	Angkatan         *string          `db:"angkatan" json:"angkatan"`
	GelarDepan       *string          `db:"gelar_depan" json:"gelar_depan"`
	GelarBelakang    *string          `db:"gelar_belakang" json:"gelar_belakang"`
	Jk               *string          `db:"jk" json:"jk"`
	TmptLahir        *string          `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir         *pk.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	IdUnit           *string          `db:"id_unit" json:"id_unit"`
	NmFakultas       *string          `db:"nm_fakultas" json:"nm_fakultas"`
	NmJurusan        *string          `db:"nm_jurusan" json:"nm_jurusan"`
	NmProdi          *string          `db:"nm_prodi" json:"nm_prodi"`
	Semester         *string          `db:"semester" json:"semester"`
	Ipk              *float64         `db:"ipk" json:"ipk"`
	SksTotal         *int             `db:"sks_total" json:"sks_total"`
	SksLulus         *int             `db:"sks_lulus" json:"sks_lulus"`
	IdStatusMhs      *string          `db:"id_status_mhs" json:"id_status_mhs"`
	StatusMahasiswa  *string          `db:"status_mahasiswa" json:"status_mahasiswa"`
	// UUID bridging pdrd
	IDPd    utils.NullUUID `db:"id_pd" json:"id_pd"`
	IDRegPd utils.NullUUID `db:"id_reg_pd" json:"id_reg_pd"`
	IDSms   utils.NullUUID `db:"id_sms" json:"id_sms"`
	// Audit
	LastSync *pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// MahasiswaDetail — full view (v2.0 siakadu.mahasiswa)
type MahasiswaDetail struct {
	Mahasiswa
	// Dokumen
	Nik       *string `db:"nik" json:"nik"`
	Nokk      *string `db:"nokk" json:"nokk"`
	Nisn      *string `db:"nisn" json:"nisn"`
	Nupn      *string `db:"nupn" json:"nupn"`
	NoKps     *string `db:"no_kps" json:"no_kps"`
	Npsn      *string `db:"npsn" json:"npsn"`
	NomorTes  *string `db:"nomor_tes" json:"nomor_tes"`
	NoSkdo    *string `db:"no_skdo" json:"no_skdo"`
	PtNim     *string `db:"pt_nim" json:"pt_nim"`
	// Kontak
	Alamat      *string `db:"alamat" json:"alamat"`
	Telepon     *string `db:"telepon" json:"telepon"`
	Hp          *string `db:"hp" json:"hp"`
	Hp2         *string `db:"hp2" json:"hp2"`
	Email       *string `db:"email" json:"email"`
	EmailKampus *string `db:"email_kampus" json:"email_kampus"`
	EmailOrtu   *string `db:"email_ortu" json:"email_ortu"`
	KodePos     *string `db:"kode_pos" json:"kode_pos"`
	// Address
	IdKota       *string `db:"id_kota" json:"id_kota"`
	NamaKota     *string `db:"nama_kota" json:"nama_kota"`
	IdKecamatan  *string `db:"id_kecamatan" json:"id_kecamatan"`
	Kecamatan    *string `db:"kecamatan" json:"kecamatan"`
	Rt           *string `db:"rt" json:"rt"`
	Rw           *string `db:"rw" json:"rw"`
	Dusun        *string `db:"dusun" json:"dusun"`
	Desa         *string `db:"desa" json:"desa"`
	// Socio
	IdAgama         *int    `db:"id_agama" json:"id_agama"`
	NamaAgama       *string `db:"nama_agama" json:"nama_agama"`
	NamaNegara      *string `db:"nama_negara" json:"nama_negara"`
	JenisTinggal    *string `db:"jenis_tinggal" json:"jenis_tinggal"`
	NamaTransport   *string `db:"nama_transport" json:"nama_transport"`
	NamaPekerjaan   *string `db:"nama_pekerjaan" json:"nama_pekerjaan"`
	NamaPenghasilan *string `db:"nama_penghasilan" json:"nama_penghasilan"`
	NamaSuku        *string `db:"nama_suku" json:"nama_suku"`
	GolDarah        *string `db:"gol_darah" json:"gol_darah"`
	// Admission
	JalurPendaftaran *string  `db:"jalur_pendaftaran" json:"jalur_pendaftaran"`
	TglDaftar        *string  `db:"tgl_daftar" json:"tgl_daftar"`
	NilaiTpa         *float64 `db:"nilai_tpa" json:"nilai_tpa"`
	IsBeasiswa       *string  `db:"is_beasiswa" json:"is_beasiswa"`
	// Transfer
	IsTransfer  *string  `db:"is_transfer" json:"is_transfer"`
	NimLama     *string  `db:"nim_lama" json:"nim_lama"`
	UnivAsal    *string  `db:"univ_asal" json:"univ_asal"`
	IpkAsal     *float64 `db:"ipk_asal" json:"ipk_asal"`
	SksAsal     *float64 `db:"sks_asal" json:"sks_asal"`
	// High school
	AsalSmu         *string  `db:"asal_smu" json:"asal_smu"`
	NoIjazahSmu     *string  `db:"no_ijazah_smu" json:"no_ijazah_smu"`
	Nem             *float64 `db:"nem" json:"nem"`
	ThnLulusSekolah *int     `db:"thn_lulus_sekolah" json:"thn_lulus_sekolah"`
	// Finance
	KategoriUkt *string `db:"kategori_ukt" json:"kategori_ukt"`
}

type KeluargaMhs struct {
	Nim            string            `db:"nim" json:"nim"`
	StatusKeluarga string            `db:"status_keluarga" json:"status_keluarga"` // Ayah/Ibu/Wali
	Nama           *string           `db:"nama" json:"nama"`
	StatusOrtu     *string           `db:"status_ortu" json:"status_ortu"`
	KondisiOrtu    *string           `db:"kondisi_ortu" json:"kondisi_ortu"`
	PendAkhir      *string           `db:"pend_akhir" json:"pend_akhir"`
	Pekerjaan      *string           `db:"pekerjaan" json:"pekerjaan"`
	Penghasilan    *string           `db:"penghasilan" json:"penghasilan"`
	NoHp           *string           `db:"no_hp" json:"no_hp"`
	Alamat         *string           `db:"alamat" json:"alamat"`
	TglLahir       *pk.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	Nik            *string           `db:"nik" json:"nik"`
	LastSync       *pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type Sdm struct {
	IDSDM       utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM       string            `db:"nm_sdm" json:"nm_sdm"`
	Jk          string            `db:"jk" json:"jk"`
	TmptLahir   string            `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir    pk.SQLServerTime  `db:"tgl_lahir" json:"tgl_lahir"`
	Nik         string            `db:"nik" json:"nik"`
	NiyNigk     *string           `db:"niy_nigk" json:"niy_nigk"`
	Nuptk       *string           `db:"nuptk" json:"nuptk"`
	Nidn        *string           `db:"nidn" json:"nidn"`
	Nsdmi       *string           `db:"nsdmi" json:"nsdmi"`
	IDJnsSDM    int               `db:"id_jns_sdm" json:"id_jns_sdm"` // 12=Dosen, 13=Tendik
	Email       *string           `db:"email" json:"email"`
	NoHp        *string           `db:"no_hp" json:"no_hp"`
	Nip         *string           `db:"nip" json:"nip"`
	TmtPns      *pk.SQLServerTime `db:"tmt_pns" json:"tmt_pns"`
	Npwp        *string           `db:"npwp" json:"npwp"`
	NmWp        *string           `db:"nm_wp" json:"nm_wp"`
	LastSync    pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type RegPtk struct {
	IDRegPtk      utils.UUID        `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDSDM         utils.NullUUID    `db:"id_sdm" json:"id_sdm"`
	NmSDM         *string           `db:"nm_sdm" json:"nm_sdm"`
	Nip           *string           `db:"nip" json:"nip"`
	IDSp          utils.NullUUID    `db:"id_sp" json:"id_sp"`
	IDSms         utils.NullUUID    `db:"id_sms" json:"id_sms"`
	NmSms         *string           `db:"nm_sms" json:"nm_sms"`
	IDStatPegawai int               `db:"id_stat_pegawai" json:"id_stat_pegawai"`
	IDIkatanKerja string            `db:"id_ikatan_kerja" json:"id_ikatan_kerja"`
	IDJnsKeluar   *string           `db:"id_jns_keluar" json:"id_jns_keluar"`
	Nidn          *string           `db:"nidn" json:"nidn"`
	NoSrtTgs      *string           `db:"no_srt_tgs" json:"no_srt_tgs"`
	TglSrtTgs     *pk.SQLServerTime `db:"tgl_srt_tgs" json:"tgl_srt_tgs"`
	TmtSrtTgs     *pk.SQLServerTime `db:"tmt_srt_tgs" json:"tmt_srt_tgs"`
	TglPtkKeluar  *pk.SQLServerTime `db:"tgl_ptk_keluar" json:"tgl_ptk_keluar"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type PeriodeWisuda struct {
	IDPeriodeWisuda string            `db:"id_periode_wisuda" json:"id_periode_wisuda"`
	NmPeriode       *string           `db:"nm_periode" json:"nm_periode"`
	TglWisuda       *pk.SQLServerTime `db:"tgl_wisuda" json:"tgl_wisuda"`
	IDThnAjaran     *int              `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	Smt             *int              `db:"smt" json:"smt"`
	TglMulai        *pk.SQLServerTime `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai      *pk.SQLServerTime `db:"tgl_selesai" json:"tgl_selesai"`
	Keterangan      *string           `db:"keterangan" json:"keterangan"`
	AAktif          int               `db:"a_aktif" json:"a_aktif"`
}

type WisudaMahasiswa struct {
	IDYudisium      int               `db:"id_yudisium" json:"id_yudisium"`
	IDPeriodeWisuda string            `db:"id_periode_wisuda" json:"id_periode_wisuda"`
	NmPeriode       *string           `db:"nm_periode" json:"nm_periode"`
	IDRegPd         utils.NullUUID    `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd            *string           `db:"nipd" json:"nipd"`
	NmMahasiswa     *string           `db:"nm_mahasiswa" json:"nm_mahasiswa"`
	NoSkYudisium    *string           `db:"no_sk_yudisium" json:"no_sk_yudisium"`
	TglSkYudisium   *pk.SQLServerTime `db:"tgl_sk_yudisium" json:"tgl_sk_yudisium"`
	NoIjasah        *string           `db:"no_ijasah" json:"no_ijasah"`
	IsWisuda        *string           `db:"is_wisuda" json:"is_wisuda"`
	IsHadirWisuda   *int              `db:"is_hadir_wisuda" json:"is_hadir_wisuda"`
	IsValidWisuda   *int              `db:"is_valid_wisuda" json:"is_valid_wisuda"`
	IpkLulusan      *float64          `db:"ipk_lulusan" json:"ipk_lulusan"`
	IDSms           utils.NullUUID    `db:"id_sms" json:"id_sms"`
	NmSms           *string           `db:"nm_sms" json:"nm_sms"`
	Keterangan      *string           `db:"keterangan" json:"keterangan"`
	LastSync        pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Batch 11b — Nilai + Kehadiran + Kinerja
// ============================================================================

type NilaiSmtMhs struct {
	IDRegPd     utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd        *string          `db:"nipd" json:"nipd"`
	NmMhs       *string          `db:"nm_mhs" json:"nm_mhs"`
	IDKls       utils.UUID       `db:"id_kls" json:"id_kls"`
	NmKls       *string          `db:"nm_kls" json:"nm_kls"`
	KodeMk      *string          `db:"kode_mk" json:"kode_mk"`
	NmMk        *string          `db:"nm_mk" json:"nm_mk"`
	IDSmt       *string          `db:"id_smt" json:"id_smt"`
	NilaiAngka  *float64         `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf  *string          `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks *float64         `db:"nilai_indeks" json:"nilai_indeks"`
	LastSync    pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type NilaiTranskrip struct {
	IDRegPd     utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd        *string          `db:"nipd" json:"nipd"`
	NmMhs       *string          `db:"nm_mhs" json:"nm_mhs"`
	IDMk        utils.UUID       `db:"id_mk" json:"id_mk"`
	KodeMk      *string          `db:"kode_mk" json:"kode_mk"`
	NmMk        *string          `db:"nm_mk" json:"nm_mk"`
	IDKls       utils.NullUUID   `db:"id_kls" json:"id_kls"`
	NilaiAngka  *float64         `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf  *string          `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks *float64         `db:"nilai_indeks" json:"nilai_indeks"`
	SmtKe       int              `db:"smt_ke" json:"smt_ke"`
	SksMk       float64          `db:"sks_mk" json:"sks_mk"`
	LastSync    pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type KehadiranMhs struct {
	IDRegPtk      utils.UUID        `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDKls         utils.UUID        `db:"id_kls" json:"id_kls"`
	IDHadirMhs    utils.UUID        `db:"id_hadir_mhs" json:"id_hadir_mhs"`
	TglHadir      *pk.SQLServerTime `db:"tgl_hadir" json:"tgl_hadir"`
	WaktuPresensi *pk.SQLServerTime `db:"waktu_presensi" json:"waktu_presensi"`
	StatHadir     string            `db:"stat_hadir" json:"stat_hadir"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type KehadiranSdm struct {
	IDKehadiranSdm   utils.UUID        `db:"id_kehadiran_sdm" json:"id_kehadiran_sdm"`
	IDSDM            utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM            *string           `db:"nm_sdm" json:"nm_sdm"`
	Nip              *string           `db:"nip" json:"nip"`
	TglHadir         pk.SQLServerTime  `db:"tgl_hadir" json:"tgl_hadir"`
	WaktuPresensi    *pk.SQLServerTime `db:"waktu_presensi" json:"waktu_presensi"`
	LokasiPresensi   *string           `db:"lokasi_presensi" json:"lokasi_presensi"`
	WaktuPulang      *pk.SQLServerTime `db:"waktu_pulang" json:"waktu_pulang"`
	LokasiPulang     *string           `db:"lokasi_pulang" json:"lokasi_pulang"`
	RencanaHariIni   *string           `db:"rencana_hari_ini" json:"rencana_hari_ini"`
	RealisasiHariIni *string           `db:"realisasi_hari_ini" json:"realisasi_hari_ini"`
	LastSync         pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type KinerjaDosen struct {
	IDRegPtk    utils.UUID        `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDSDM       utils.NullUUID    `db:"id_sdm" json:"id_sdm"`
	NmSDM       *string           `db:"nm_sdm" json:"nm_sdm"`
	IDSmt       string            `db:"id_smt" json:"id_smt"`
	IDJabfung   *int              `db:"id_jabfung" json:"id_jabfung"`
	StatTugas   *string           `db:"stat_tugas" json:"stat_tugas"`
	StatBelajar *string           `db:"stat_belajar" json:"stat_belajar"`
	LastSync    *pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Batch 11c — Keuangan + Status Kuliah + Unit
// ============================================================================

type SppMhs struct {
	IDSppMhs       utils.UUID       `db:"id_spp_mhs" json:"id_spp_mhs"`
	IDRegPd        utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	Nim            *string          `db:"nim" json:"nim"`
	IDSmt          string           `db:"id_smt" json:"id_smt"`
	NmSmt          *string          `db:"nm_smt" json:"nm_smt"`
	IDKelasUkt     utils.NullUUID   `db:"id_kelas_ukt" json:"id_kelas_ukt"`
	NmKelasUkt     *string          `db:"nm_kelas_ukt" json:"nm_kelas_ukt"`
	IDDaftarUkt    utils.NullUUID   `db:"id_daftar_ukt" json:"id_daftar_ukt"`
	TglBayar       pk.SQLServerTime `db:"tgl_bayar" json:"tgl_bayar"`
	Nominal        float64          `db:"nominal" json:"nominal"`
	TotalTagihan   *float64         `db:"total_tagihan" json:"total_tagihan"`
	JumlahSpi      *float64         `db:"jumlah_spi" json:"jumlah_spi"`
	JumlahDenda    *float64         `db:"jumlah_denda" json:"jumlah_denda"`
	JumlahLainnya  *float64         `db:"jumlah_lainnya" json:"jumlah_lainnya"`
	SisaTagihan    *float64         `db:"sisa_tagihan" json:"sisa_tagihan"`
	ACicil         *int             `db:"a_cicil" json:"a_cicil"`
	CicilanKe      *int             `db:"cicilan_ke" json:"cicilan_ke"`
	KodePembayaran *string          `db:"kode_pembayaran" json:"kode_pembayaran"`
	Ket            *string          `db:"ket" json:"ket"`
	LastSync       *pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type DaftarUkt struct {
	IDDaftarUkt      utils.UUID       `db:"id_daftar_ukt" json:"id_daftar_ukt"`
	IDProdiSimpedam  utils.UUID       `db:"id_prodi_simpedam" json:"id_prodi_simpedam"`
	NamaProdi        string           `db:"nama_prodi" json:"nama_prodi"`
	Tahun            int              `db:"tahun" json:"tahun"`
	KodeFakultas     string           `db:"kode_fakultas" json:"kode_fakultas"`
	NamaFakultas     string           `db:"nama_fakultas" json:"nama_fakultas"`
	KodeKelas        string           `db:"kode_kelas" json:"kode_kelas"`
	NamaKelas        string           `db:"nama_kelas" json:"nama_kelas"`
	Nominal          float64          `db:"nominal" json:"nominal"`
	KodeStrata       int              `db:"kode_strata" json:"kode_strata"`
	IDSms            utils.NullUUID   `db:"id_sms" json:"id_sms"`
	IDJenjDidik      *int             `db:"id_jenj_didik" json:"id_jenj_didik"`
	LastSync         pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type KelasUkt struct {
	IDKelasUkt  utils.UUID       `db:"id_kelas_ukt" json:"id_kelas_ukt"`
	NmKelasUkt  string           `db:"nm_kelas_ukt" json:"nm_kelas_ukt"`
	NominalUkt  float64          `db:"nominal_ukt" json:"nominal_ukt"`
	LastSync    pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type KuliahMhs struct {
	IDRegPd      utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	Nim          *string          `db:"nim" json:"nim"`
	NmMhs        *string          `db:"nm_mhs" json:"nm_mhs"`
	IDSmt        string           `db:"id_smt" json:"id_smt"`
	NmSmt        *string          `db:"nm_smt" json:"nm_smt"`
	IDPembiayaan *int             `db:"id_pembiayaan" json:"id_pembiayaan"`
	IDStatMhs    string           `db:"id_stat_mhs" json:"id_stat_mhs"`
	Ips          *float64         `db:"ips" json:"ips"`
	SksSemester  *float64         `db:"sks_semester" json:"sks_semester"`
	Ipk          *float64         `db:"ipk" json:"ipk"`
	TotalSks     *float64         `db:"total_sks" json:"total_sks"`
	BiayaSmt     *float64         `db:"biaya_smt" json:"biaya_smt"`
	LastSync     pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type PimpinanUnit struct {
	IDPimpinan utils.UUID        `db:"id_pimpinan" json:"id_pimpinan"`
	IDUnit     string            `db:"id_unit" json:"id_unit"`
	IDSDM      utils.NullUUID    `db:"id_sdm" json:"id_sdm"`
	Nip        *string           `db:"nip" json:"nip"`
	Nama       *string           `db:"nama" json:"nama"`
	Jabatan    *string           `db:"jabatan" json:"jabatan"`
	TglMulai   *pk.SQLServerTime `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai *pk.SQLServerTime `db:"tgl_selesai" json:"tgl_selesai"`
	LastSync   *pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Query parameters (all GET-only)
// ============================================================================

type BaseParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"`
}

func (p *BaseParams) Normalize() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	if p.Order == "" {
		p.Order = "ASC"
	}
}
func (p *BaseParams) Offset() int { return (p.Page - 1) * p.Limit }

type MahasiswaParams struct {
	BaseParams
	Nim         *string `query:"nim"`
	IDPd        *string `query:"id_pd"`
	IDRegPd     *string `query:"id_reg_pd"`
	IDSms       *string `query:"id_sms"`
	Angkatan    *string `query:"angkatan"`
	IdUnit      *string `query:"id_unit"`
	IdStatusMhs *string `query:"id_status_mhs"`
}

type KeluargaMhsParams struct {
	BaseParams
	Nim            *string `query:"nim"`
	StatusKeluarga *string `query:"status_keluarga"`
}

type SdmParams struct {
	BaseParams
	IDSDM    *string `query:"id_sdm"`
	IDJnsSDM *int    `query:"id_jns_sdm"` // 12=Dosen, 13=Tendik
	Nip      *string `query:"nip"`
	Nidn     *string `query:"nidn"`
	Jk       *string `query:"jk"`
}

type RegPtkParams struct {
	BaseParams
	IDRegPtk      *string `query:"id_reg_ptk"`
	IDSDM         *string `query:"id_sdm"`
	IDSms         *string `query:"id_sms"`
	IDStatPegawai *int    `query:"id_stat_pegawai"`
	IDJnsKeluar   *string `query:"id_jns_keluar"` // null=aktif
	OnlyAktif     *bool   `query:"only_aktif"`
}

type WisudaParams struct {
	BaseParams
	IDYudisium      *int    `query:"id_yudisium"`
	IDPeriodeWisuda *string `query:"id_periode_wisuda"`
	IDRegPd         *string `query:"id_reg_pd"`
	IDSms           *string `query:"id_sms"`
	Nipd            *string `query:"nipd"`
	IsWisuda        *string `query:"is_wisuda"`
}

type PeriodeWisudaParams struct {
	BaseParams
	IDPeriodeWisuda *string `query:"id_periode_wisuda"`
	IDThnAjaran     *int    `query:"id_thn_ajaran"`
	AAktif          *int    `query:"a_aktif"`
}

type NilaiSmtParams struct {
	BaseParams
	IDRegPd *string `query:"id_reg_pd"`
	IDKls   *string `query:"id_kls"`
	IDSmt   *string `query:"id_smt"`
	Nipd    *string `query:"nipd"`
}

type NilaiTranskripParams struct {
	BaseParams
	IDRegPd *string `query:"id_reg_pd"`
	IDMk    *string `query:"id_mk"`
	SmtKe   *int    `query:"smt_ke"`
	Nipd    *string `query:"nipd"`
}

type KehadiranMhsParams struct {
	BaseParams
	IDRegPtk   *string `query:"id_reg_ptk"`
	IDKls      *string `query:"id_kls"`
	IDHadirMhs *string `query:"id_hadir_mhs"`
	StatHadir  *string `query:"stat_hadir"`
}

type KehadiranSdmParams struct {
	BaseParams
	IDKehadiranSdm *string `query:"id_kehadiran_sdm"`
	IDSDM          *string `query:"id_sdm"`
	TglFrom        *string `query:"tgl_from"` // YYYY-MM-DD
	TglTo          *string `query:"tgl_to"`
}

type KinerjaDosenParams struct {
	BaseParams
	IDRegPtk    *string `query:"id_reg_ptk"`
	IDSmt       *string `query:"id_smt"`
	IDJabfung   *int    `query:"id_jabfung"`
	StatTugas   *string `query:"stat_tugas"`
	StatBelajar *string `query:"stat_belajar"`
}

type SppMhsParams struct {
	BaseParams
	IDSppMhs *string `query:"id_spp_mhs"`
	IDRegPd  *string `query:"id_reg_pd"`
	Nim      *string `query:"nim"`
	IDSmt    *string `query:"id_smt"`
}

type DaftarUktParams struct {
	BaseParams
	IDDaftarUkt *string `query:"id_daftar_ukt"`
	IDSms       *string `query:"id_sms"`
	Tahun       *int    `query:"tahun"`
	KodeStrata  *int    `query:"kode_strata"`
}

type KelasUktParams struct {
	BaseParams
	IDKelasUkt *string `query:"id_kelas_ukt"`
}

type KuliahMhsParams struct {
	BaseParams
	IDRegPd   *string `query:"id_reg_pd"`
	Nim       *string `query:"nim"`
	IDSmt     *string `query:"id_smt"`
	IDStatMhs *string `query:"id_stat_mhs"`
}

type PimpinanUnitParams struct {
	BaseParams
	IDPimpinan *string `query:"id_pimpinan"`
	IDUnit     *string `query:"id_unit"`
	IDSDM      *string `query:"id_sdm"`
	Nip        *string `query:"nip"`
}
