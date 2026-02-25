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

type StatusKuliahMahasiswaParams struct {
	PaginationParams
	IDRegPd   string  `query:"id_reg_pd"`   // Filter by ID registrasi mahasiswa
	IDSmt     *int    `query:"id_smt"`      // Filter by semester
	IDStatMhs *string `query:"id_stat_mhs"` // Filter by ID status mahasiswa
}
