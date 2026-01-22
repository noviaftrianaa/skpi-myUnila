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

type JenisPendaftaranParams struct {
	PaginationParams
	DaftarSekolah *int `query:"daftar_sekolah"`
	DaftarRombel  *int `query:"daftar_rombel"`
}

type JenisPenghargaanParams struct {
	PaginationParams
	Lembaga *int `query:"lembaga"`
}

type JenisSaranaParams struct {
	PaginationParams
	Penempatan *int `query:"penempatan"`
}

type JenisSdmParams struct {
	PaginationParams
	GuruKelas     *int  `query:"guru_kelas"`
	GuruMapel     *int  `query:"guru_mapel"`
	GuruBk        *int  `query:"guru_bk"`
	GuruInklusi   *int  `query:"guru_inklusi"`
	PengawasSp    *int  `query:"pengawas_sp"`
	PengawasPlb   *int  `query:"pengawas_plb"`
	PengawasMapel *int  `query:"pengawas_mapel"`
	PengawasBid   *int  `query:"pengawas_bid"`
	Tas           *int  `query:"tas"`
	Formal        *int  `query:"formal"`
	Dosen         *int  `query:"dosen"`
	Peneliti      *int  `query:"peneliti"`
	Perekayasa    *int  `query:"perekayasa"`
	PranataLevel  []int `query:"pranata_level"`
}

type JenisSertParams struct {
	PaginationParams
	ProfGuru  *int `query:"prof_guru"`
	Kepsek    *int `query:"kepsek"`
	Laboran   *int `query:"laboran"`
	ProfDosen *int `query:"prof_dosen"`
	Lembaga   *int `query:"lembaga"`
}

type JenisTesParams struct {
	PaginationParams
	NilaiMaks *int `query:"nilai_maks"`
}

type KategoriKegiatanParams struct {
	PaginationParams
	IDIndukKatGiat *int    `query:"id_induk_kat_giat"`
	IDJenisSdm     *int    `query:"id_jenis_sdm"`
	KodeKatPak     *string `query:"kode_kat_pak"`
	KodeKatBkd     *string `query:"kode_kat_bkd"`
	TeksJudul      *string `query:"teks_judul"`
	TeksSk         *string `query:"teks_sk"`
	TeksTanggalSk  *string `query:"teks_tanggal_sk"`
	TeksLokasi     *string `query:"teks_lokasi"`
	LevelKat       *int    `query:"level_kat"`
	Judul          *int    `query:"judul"`
	Bkd            *int    `query:"bkd"`
	Pak            *int    `query:"pak"`
}

type KategoriTabelParams struct {
	PaginationParams
	IDKatGiat   *int    `query:"id_kat_giat"`
	NmSchema    *string `query:"nm_schema"`
	KonfigKolom *string `query:"konfig_kolom"`
}

// JenjangPendidikanParams untuk parameter khusus jenjang pendidikan
type JenjangPendidikanParams struct {
	PaginationParams
	UJenjLemb *int `query:"u_jenj_lemb"` // Flag untuk lembaga
	UJenjOrg  *int `query:"u_jenj_org"`  // Flag untuk organisasi
}

// JurusanParams untuk parameter khusus jurusan
type JurusanParams struct {
	PaginationParams
	IDJenjDidik     *int    `query:"id_jenj_didik"`    // Filter by jenjang pendidikan
	IDKelBidang     *string `query:"id_kel_bidang"`    // Filter by kelompok bidang
	KodeNomenklatur *string `query:"kode_nomenklatur"` // Filter by kode nomenklatur
	USma            *int    `query:"u_sma"`            // Flag untuk SMA
	USmk            *int    `query:"u_smk"`            // Flag untuk SMK
	UPt             *int    `query:"u_pt"`             // Flag untuk PT
	USlb            *int    `query:"u_slb"`            // Flag untuk SLB
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
