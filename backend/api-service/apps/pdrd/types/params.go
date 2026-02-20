package types

// ============================================================================
// Query Parameters for PDRD Module
// ============================================================================

// PaginationParams untuk parameter pagination standar
type PaginationParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"` // asc atau desc
}

// NormalizePagination set default values untuk pagination
func (p *PaginationParams) NormalizePagination() {
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

// Offset menghitung offset untuk query pagination
func (p *PaginationParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

type RegPdParams struct {
	PaginationParams
	IDRegPd       string  `query:"id_reg_pd"`       // Filter by ID registrasi mahasiswa
	IDSP          *string `query:"id_sp"`           // Filter by ID sekolah/instansi
	IDSms         *string `query:"id_sms"`          // Filter
	IDPd          *string `query:"id_pd"`           // Filter by ID peserta didik
	IDJnsDaftar   *int    `query:"id_jns_daftar"`   // Filter by jenis pendaftaran
	IDJalurDaftar *int    `query:"id_jalur_daftar"` // Filter by jalur pendaftaran
	IDPembiayaan  *int    `query:"id_pembiayaan"`   // Filter by pembiayaan
	IDSmt         *int    `query:"id_smt"`          // Filter by semester
	IDPtAsal      *string `query:"id_pt_asal"`      // Filter by ID perguruan tinggi asal
	IDProdiAsal   *string `query:"id_prodi_asal"`   // Filter by ID prodi asal
	IDJnsKeluar   *string `query:"id_jns_keluar"`   // Filter by jenis keluar
}

type PesertaDidikDetailParams struct {
	PaginationParams
	IDPd              *string `query:"id_pd"`              // Filter by ID peserta didik
	IDKkAyah          *string `query:"id_kk_ayah"`         // Filter by ID KK ayah
	IDKkIbu           *string `query:"id_kk_ibu"`          // Filter by ID KK ibu
	IDKk              *string `query:"id_kk"`              // Filter by ID KK
	IDStatMhs         *string `query:"id_stat_mhs"`        // Filter by ID status mahasiswa
	IDAgama           *string `query:"id_agama"`           // Filter by ID agama
	IDKewarganegaraan *string `query:"id_kewarganegaraan"` // Filter by ID kewarganegaraan
	IDJnsTinggal      *string `query:"id_jns_tinggal"`     // Filter by ID jenis tinggal
	IDAlatTransport   *string `query:"id_alat_transport"`  // Filter by ID alat transport
	IDWil             *string `query:"id_wil"`             // Filter by ID wilayah
}

// ListRegisMahasiswaParams untuk endpoint /mahasiswa/list_regis
type ListRegisMahasiswaParams struct {
	PaginationParams
	IDJnsDaftar *int    `query:"id_jns_daftar"` // Filter by jenis pendaftaran
	IDProdi     *string `query:"id_prodi"`      // Filter by prodi
	TahunMasuk  *int    `query:"tahun_masuk"`   // Filter by tahun masuk
}

// ListStatusMahasiswaParams untuk endpoint /mahasiswa/list_status
type ListStatusMahasiswaParams struct {
	PaginationParams
	IDStatMhs *string `query:"id_stat_mhs"` // Filter by status mahasiswa
	IDProdi   *string `query:"id_prodi"`    // Filter by prodi
	IDSmt     *string `query:"id_smt"`      // Filter by semester
}

// SemesterKeaktifanParams untuk endpoint /mahasiswa/smt_keaktifan
type SemesterKeaktifanParams struct {
	IDRegPd string `query:"id_reg_pd"` // Required: ID registrasi mahasiswa
}

// DetailMahasiswaParams untuk endpoint /mahasiswa/detail
type DetailMahasiswaParams struct {
	IDPd    *string `query:"id_pd"`     // Filter by ID peserta didik
	IDRegPd *string `query:"id_reg_pd"` // Filter by ID registrasi
	NIPD    *string `query:"nipd"`      // Filter by NIPD
}

// ListAlumniParams untuk endpoint /mahasiswa/list_alumni
type ListAlumniParams struct {
	PaginationParams
	TahunLulus *int    `query:"tahun_lulus"` // Filter by tahun lulus
	IDProdi    *string `query:"id_prodi"`    // Filter by prodi
	Bulan      *int    `query:"bulan"`       // Filter by bulan lulus (1-12)
}

// LuarPTParams untuk endpoint /mahasiswa/luar_pt
type LuarPTParams struct {
	PaginationParams
	IDProdi       *string `query:"id_prodi"`        // Filter by prodi
	IDPeriodeMbkm *string `query:"id_periode_mbkm"` // Filter by periode MBKM
}
