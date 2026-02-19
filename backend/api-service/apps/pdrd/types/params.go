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
