package kkn

import "time"

// ============================================================================
// Base Params
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
}

// ============================================================================
// Query Param Structs
// ============================================================================

type PesertaParams struct {
	BaseParams
	NPM       *string `query:"npm"`
	IDRegPd   *string `query:"id_reg_pd"`
	IDSms     *string `query:"id_sms"`
	Angkatan  *int    `query:"angkatan"`
	IDPeriode *string `query:"id_periode"`
	Status    *string `query:"status"`
}

type KelompokParams struct {
	BaseParams
	IDKelompok *string `query:"id_kelompok"`
	IDPeriode  *string `query:"id_periode"`
	IDLokasi   *string `query:"id_lokasi"`
	Status     *string `query:"status"`
}

type DPLParams struct {
	BaseParams
	NIP       *string `query:"nip"`
	NIDN      *string `query:"nidn"`
	IDDosen   *string `query:"id_dosen"`
	IDPeriode *string `query:"id_periode"`
	Peran     *string `query:"peran"`
}

type NilaiParams struct {
	BaseParams
	NPM       *string `query:"npm"`
	IDPeriode *string `query:"id_periode"`
	Source    *string `query:"source"`
}

type PeriodeParams struct {
	BaseParams
	Tahun *string `query:"tahun"`
}

type LokasiParams struct {
	BaseParams
	Kabupaten *string `query:"kabupaten"`
	Kecamatan *string `query:"kecamatan"`
}

// ============================================================================
// Response Entities — enriched with pdrd UUIDs and denormalized names
// ============================================================================

type PesertaKKN struct {
	// KKN fields
	IDRegistrasi    string  `json:"id_registrasi" db:"id_registrasi"`
	NomorRegistrasi string  `json:"nomor_registrasi" db:"nomor_registrasi"`
	NPM             string  `json:"npm" db:"npm"`
	NmMahasiswa     string  `json:"nm_mahasiswa" db:"nm_mahasiswa"`
	JenisKelamin    string  `json:"jenis_kelamin" db:"jenis_kelamin"`
	TempatLahir     string  `json:"tempat_lahir" db:"tempat_lahir"`
	TglLahir        *string `json:"tgl_lahir" db:"tgl_lahir"`
	Angkatan        *int    `json:"angkatan" db:"angkatan"`
	IPK             float64 `json:"ipk" db:"ipk"`
	SKSLulus         int     `json:"sks_lulus" db:"sks_lulus"`
	Email           string  `json:"email" db:"email"`
	NoHP            string  `json:"no_hp" db:"no_hp"`
	Status          string  `json:"status" db:"status"`
	TglDiajukan     *string `json:"tgl_diajukan" db:"tgl_diajukan"`

	// Periode
	NmPeriode string `json:"nm_periode" db:"nm_periode"`

	// Enrichment: pdrd UUIDs
	IDRegPd *string `json:"id_reg_pd" db:"id_reg_pd"`
	IDSms   *string `json:"id_sms" db:"id_sms"`
	IDPd    *string `json:"id_pd" db:"id_pd"`

	// Enrichment: denormalized names from pdrd
	NmProdi    string `json:"nm_prodi" db:"nm_prodi"`
	NmFakultas string `json:"nm_fakultas" db:"nm_fakultas"`
	NmJenjang  string `json:"nm_jenjang" db:"nm_jenjang"`

	// Kelompok assignment
	NmKelompok *string `json:"nm_kelompok" db:"nm_kelompok"`
	NmDesa     *string `json:"nm_desa" db:"nm_desa"`
}

type DetailPesertaKKN struct {
	PesertaKKN

	// Extended kelompok info
	KodeKelompok *string `json:"kode_kelompok" db:"kode_kelompok"`
	NmKecamatan  *string `json:"nm_kecamatan" db:"nm_kecamatan"`
	NmKabupaten  *string `json:"nm_kabupaten" db:"nm_kabupaten"`

	// Nilai
	NilaiDPL  *float64 `json:"nilai_dpl" db:"nilai_dpl"`
	NilaiKDPL *float64 `json:"nilai_kdpl" db:"nilai_kdpl"`
}

type KelompokKKN struct {
	IDKelompok    string `json:"id_kelompok" db:"id_kelompok"`
	KodeKelompok  string `json:"kode_kelompok" db:"kode_kelompok"`
	NmKelompok    string `json:"nm_kelompok" db:"nm_kelompok"`
	NmPeriode     string `json:"nm_periode" db:"nm_periode"`
	TahunAkademik string `json:"tahun_akademik" db:"tahun_akademik"`
	NmDesa        string `json:"nm_desa" db:"nm_desa"`
	NmKecamatan   string `json:"nm_kecamatan" db:"nm_kecamatan"`
	NmKabupaten   string `json:"nm_kabupaten" db:"nm_kabupaten"`
	Kuota         int    `json:"kuota" db:"kuota"`
	JumlahAnggota int    `json:"jumlah_anggota" db:"jumlah_anggota"`
	Status        string `json:"status" db:"status"`
}

type DPLKKN struct {
	IDDPL      string  `json:"id_dpl" db:"id_dpl"`
	NmDosen    string  `json:"nm_dosen" db:"nm_dosen"`
	NIP        string  `json:"nip" db:"nip"`
	NIDN       string  `json:"nidn" db:"nidn"`
	Peran      string  `json:"peran" db:"peran"`
	NoHP       string  `json:"no_hp" db:"no_hp"`
	NmKelompok string  `json:"nm_kelompok" db:"nm_kelompok"`
	NmPeriode  string  `json:"nm_periode" db:"nm_periode"`
	NmDesa     string  `json:"nm_desa" db:"nm_desa"`
	IDDosen    *string `json:"id_dosen" db:"id_dosen"`
}

type NilaiKKN struct {
	IDNilai     string  `json:"id_nilai" db:"id_nilai"`
	NPM         string  `json:"npm" db:"npm"`
	NmMahasiswa string  `json:"nm_mahasiswa" db:"nm_mahasiswa"`
	NmProdi     string  `json:"nm_prodi" db:"nm_prodi"`
	NmKelompok  string  `json:"nm_kelompok" db:"nm_kelompok"`
	NmPeriode   string  `json:"nm_periode" db:"nm_periode"`
	Nilai       float64 `json:"nilai" db:"nilai"`
	Source      string  `json:"source" db:"legacy_source"`
	TglPenilaian *string `json:"tgl_penilaian" db:"tgl_penilaian"`
	IDRegPd     *string `json:"id_reg_pd" db:"id_reg_pd"`
	IDSms       *string `json:"id_sms" db:"id_sms"`
}

type PeriodeKKN struct {
	IDPeriode          string  `json:"id_periode_kkn" db:"id_periode_kkn"`
	KodePeriode        string  `json:"kode_periode" db:"kode_periode"`
	NmPeriode          string  `json:"nm_periode" db:"nm_periode"`
	TahunAkademik      string  `json:"tahun_akademik" db:"tahun_akademik"`
	Gelombang          int     `json:"gelombang" db:"gelombang"`
	DurasiHari         int     `json:"durasi_hari" db:"durasi_hari"`
	JumlahPeserta      int     `json:"jumlah_peserta" db:"jumlah_peserta"`
	JumlahKelompok     int     `json:"jumlah_kelompok" db:"jumlah_kelompok"`
}

type LokasiKKN struct {
	IDLokasi    string `json:"id_lokasi" db:"id_lokasi"`
	KodeLokasi  string `json:"kode_lokasi" db:"kode_lokasi"`
	NmDesa      string `json:"nm_desa" db:"nm_desa"`
	NmKecamatan string `json:"nm_kecamatan" db:"nm_kecamatan"`
	NmKabupaten string `json:"nm_kabupaten" db:"nm_kabupaten"`
	NmProvinsi  string `json:"nm_provinsi" db:"nm_provinsi"`
}

// SQLServerTime for timestamp handling
type SQLServerTime struct {
	time.Time
}
