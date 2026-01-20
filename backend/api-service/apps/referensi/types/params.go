package types

// ============================================================================
// Query Parameters
// ============================================================================

// PaginationParams untuk parameter pagination standar
type PaginationParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"` // asc atau desc
}

// WilayahParams untuk parameter khusus wilayah
type WilayahParams struct {
	PaginationParams
	Level          *int    `query:"level"`            // 1=provinsi, 2=kab/kota, 3=kecamatan, 4=kelurahan
	IDIndukWilayah *string `query:"id_induk_wilayah"` // filter berdasarkan induk
	IDNegara       *string `query:"id_negara"`        // filter berdasarkan negara
}

// SemesterParams untuk parameter khusus semester
type SemesterParams struct {
	PaginationParams
	TahunAjaran  *int `query:"tahun_ajaran"`
	PeriodeAktif *int `query:"periode_aktif"` // 1=aktif, 0=tidak aktif
}

// TahunAjaranParams untuk parameter khusus tahun ajaran
type TahunAjaranParams struct {
	PaginationParams
	PeriodeAktif *int `query:"periode_aktif"` // 1=aktif, 0=tidak aktif
}

// BentukPendidikanParams untuk parameter khusus bentuk pendidikan
type BentukPendidikanParams struct {
	PaginationParams
	JenjangPaud   *int `query:"jenjang_paud"`   // Filter by jenjang paud
	JenjangTk     *int `query:"jenjang_tk"`     // Filter by jenjang tk
	JenjangSd     *int `query:"jenjang_sd"`     // Filter by jenjang sd
	JenjangSmp    *int `query:"jenjang_smp"`    // Filter by jenjang smp
	JenjangSma    *int `query:"jenjang_sma"`    // Filter by jenjang sma
	JenjangTinggi *int `query:"jenjang_tinggi"` // Filter by jenjang tinggi
	Aktif         *int `query:"aktif"`          // Filter by aktif
}

// BidangStudiParams untuk parameter khusus bidang studi
type BidangStudiParams struct {
	PaginationParams
	IDIndukBidangStudi *int `query:"id_induk_bidang_studi"` // Filter by id_induk_bidang_studi
	Kelompok           *int `query:"kelompok"`              // Filter by kelompok
	JenjangPaud        *int `query:"jenjang_paud"`          // Filter by jenjang paud
	JenjangTk          *int `query:"jenjang_tk"`            // Filter by jenjang tk
	JenjangSd          *int `query:"jenjang_sd"`            // Filter by jenjang sd
	JenjangSmp         *int `query:"jenjang_smp"`           // Filter by jenjang smp
	JenjangSma         *int `query:"jenjang_sma"`           // Filter by jenjang sma
	JenjangTinggi      *int `query:"jenjang_tinggi"`        // Filter by jenjang tinggi
}

// GelarAkademikParams untuk parameter khusus gelar akademik
type GelarAkademikParams struct {
	PaginationParams
	PosisiGelar *int `query:"posisi_gelar"` // Filter by posisi_gelar
}

type JabTgsParams struct {
	PaginationParams
	IDKelProf        *int `query:"id_kel_prof"`
	JabatanUtamaSek  *int `query:"jabatan_utama_sek"`
	JabatanUtamaPt   *int `query:"jabatan_utama_pt"`
	JabatanUtamaLpnk *int `query:"jabatan_utama_lpnk"`
	JabatanUtamaLpk  *int `query:"jabatan_utama_lpk"`
}

type JabFungParams struct {
	PaginationParams
	IDKelProf   *int `query:"id_kel_prof"`
	AngkaKredit *int `query:"angka_kredit"`
}

type JenisAktMhsParams struct {
	PaginationParams
	KegiatanKampusMerdeka *int `query:"kegiatan_kampus_merdeka"`
}

type JenisBeasiswaParams struct {
	PaginationParams
	IDSumberDana *int `query:"id_sumber_dana"`
	UPd          *int `query:"u_pd"`
	UPtk         *int `query:"u_ptk"`
	UNonCa       *int `query:"u_non_ca"`
	KatBeasiswa  *int `query:"kat_beasiswa"`
}

type JenisDiklatParams struct {
	PaginationParams
	UGuru     *int `query:"u_guru"`
	UDosen    *int `query:"u_dosen"`
	UTendik   *int `query:"u_tendik"`
	AValidasi *int `query:"a_validasi"`
}

type JenisKeluarParams struct {
	PaginationParams
	APd       *int `query:"a_pd"`
	APtk      *int `query:"a_ptk"`
	ASdmIptek *int `query:"a_sdm_iptek"`
}

type JenisKeuanganParams struct {
	PaginationParams
	Pengeluaran *int `query:"pengeluaran"`
	Pemasukan   *int `query:"pemasukan"`
}

type JenisLembagaParams struct {
	PaginationParams
	Sp                  *int `query:"sp"`
	LembAkred           *int `query:"lemb_akred"`
	PengelolaPendidikan *int `query:"pengelola_pendidikan"`
	Sms                 *int `query:"sms"`
	TmptPengawas        *int `query:"tmpt_pengawas"`
	LembIptek           *int `query:"lemb_iptek"`
	Smi                 *int `query:"smi"`
}

// ============================================================================
// Default Values
// ============================================================================

const (
	DefaultPage  = 1
	DefaultLimit = 20
	MaxLimit     = 100
)

// NormalizePagination memastikan nilai pagination valid
func (p *PaginationParams) NormalizePagination() {
	if p.Page < 1 {
		p.Page = DefaultPage
	}
	if p.Limit < 1 {
		p.Limit = DefaultLimit
	}
	if p.Limit > MaxLimit {
		p.Limit = MaxLimit
	}
	if p.Order != "asc" && p.Order != "desc" {
		p.Order = "asc"
	}
}

// Offset menghitung offset untuk query
func (p *PaginationParams) Offset() int {
	return (p.Page - 1) * p.Limit
}
