package referensi

import "time"

// ============================================================================
// Database Entities - Schema ref.*
// ============================================================================

// Semester adalah entity dari tabel ref.semester
type Semester struct {
	IDSmt         string     `db:"id_smt" json:"id_smt"`
	IDThnAjaran   int        `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmSmt         string     `db:"nm_smt" json:"nm_smt"`
	Smt           int        `db:"smt" json:"smt"`
	APeriodeAktif *int       `db:"a_periode_aktif" json:"a_periode_aktif"`
	TglMulai      time.Time  `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai    time.Time  `db:"tgl_selesai" json:"tgl_selesai"`
	CreateDate    time.Time  `db:"create_date" json:"-"`
	LastUpdate    time.Time  `db:"last_update" json:"-"`
	ExpiredDate   *time.Time `db:"expired_date" json:"-"`
}

// TahunAjaran adalah entity dari tabel ref.tahun_ajaran
type TahunAjaran struct {
	IDThnAjaran   int        `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran   string     `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	APeriodeAktif *int       `db:"a_periode_aktif" json:"a_periode_aktif"`
	TglMulai      time.Time  `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai    time.Time  `db:"tgl_selesai" json:"tgl_selesai"`
	CreateDate    time.Time  `db:"create_date" json:"-"`
	LastUpdate    time.Time  `db:"last_update" json:"-"`
	ExpiredDate   *time.Time `db:"expired_date" json:"-"`
}

// Agama adalah entity dari tabel ref.agama
type Agama struct {
	IDAgama     int        `db:"id_agama" json:"id_agama"`
	NmAgama     string     `db:"nm_agama" json:"nm_agama"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.wilayah
type Wilayah struct {
	IDWil          string     `db:"id_wil" json:"id_wil"`
	IDNegara       string     `db:"id_negara" json:"id_negara"`
	NmWil          string     `db:"nm_wil" json:"nm_wil"`
	AsalWil        *string    `db:"asal_wil" json:"asal_wil,omitempty"`
	KodeBps        *string    `db:"kode_bps" json:"kode_bps,omitempty"`
	KodeDagri      *string    `db:"kode_dagri" json:"kode_dagri,omitempty"`
	KodeKeu        *string    `db:"kode_keu" json:"kode_keu,omitempty"`
	IDIndukWilayah *string    `db:"id_induk_wilayah" json:"id_induk_wilayah,omitempty"`
	IDLevelWil     int        `db:"id_level_wil" json:"id_level_wil"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	ExpiredDate    *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.aktifitas_kerjasama
type AktifitasKerjasama struct {
	IDAktKerjasama int        `db:"id_akt_kerjasama" json:"id_akt_kerjasama"`
	NmAktKerjasama string     `db:"nm_akt_kerjasama" json:"nm_akt_kerjasama"`
	Ket            *string    `db:"ket" json:"ket"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	ExpiredDate    *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.basis_evaluasi
type BasisEvaluasi struct {
	IDBasisEvaluasi int        `db:"id_basis_evaluasi" json:"id_basis_evaluasi"`
	NmBasisEvaluasi string     `db:"nm_basis_evaluasi" json:"nm_basis_evaluasi"`
	CreateDate      time.Time  `db:"create_date" json:"-"`
	LastUpdate      time.Time  `db:"last_update" json:"-"`
	ExpiredDate     *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bentuk_kegiatan_kerjasama
type BentukKegiatanKerjasama struct {
	IDBntkGiatKerjasama int        `db:"id_bntk_giat_kerjasama" json:"id_bntk_giat_kerjasama"`
	NmBntkGiatKerjasama string     `db:"nm_bntk_giat_kerjasama" json:"nm_bntk_giat_kerjasama"`
	Ket                 *string    `db:"ket" json:"ket"`
	CreateDate          time.Time  `db:"create_date" json:"-"`
	LastUpdate          time.Time  `db:"last_update" json:"-"`
	ExpiredDate         *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bentuk_pendidikan
type BentukPendidikan struct {
	IDBp        int        `db:"id_bp" json:"id_bp"`
	NmBp        string     `db:"nm_bp" json:"nm_bp"`
	AJenjPaud   int        `db:"a_jenj_paud" json:"a_jenj_paud"`
	AJenjTk     int        `db:"a_jenj_tk" json:"a_jenj_tk"`
	AJenjSd     int        `db:"a_jenj_sd" json:"a_jenj_sd"`
	AJenjSmp    int        `db:"a_jenj_smp" json:"a_jenj_smp"`
	AJenjSma    int        `db:"a_jenj_sma" json:"a_jenj_sma"`
	AJenjTinggi int        `db:"a_jenj_tinggi" json:"a_jenj_tinggi"`
	DirBina     string     `db:"dir_bina" json:"dir_bina"`
	AAktif      int        `db:"a_aktif" json:"a_aktif"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bidang_kerjasama
type BidangKerjasama struct {
	IDBidKerjasama int        `db:"id_bid_kerjasama" json:"id_bid_kerjasama"`
	NmBidKerjasama string     `db:"nm_bid_kerjasama" json:"nm_bid_kerjasama"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	ExpiredDate    *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bidang_pekerjaan
type BidangPekerjaan struct {
	IDBidKerja  int        `db:"id_bid_kerja" json:"id_bid_kerja"`
	NmBidKerja  string     `db:"nm_bid_kerja" json:"nm_bid_kerja"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bidang_studi
type BidangStudi struct {
	IDBidStudi         int        `db:"id_bid_studi" json:"id_bid_studi"`
	IDIndukBidangStudi *int       `db:"id_induk_bidang_studi" json:"id_induk_bidang_studi"`
	KodeBidStudi       string     `db:"kode_bid_studi" json:"kode_bid_studi"`
	NmBidStudi         string     `db:"nm_bid_studi" json:"nm_bid_studi"`
	AKel               int        `db:"a_kel" json:"a_kel"`
	AJenjPaud          int        `db:"a_jenj_paud" json:"a_jenj_paud"`
	AJenjTk            int        `db:"a_jenj_tk" json:"a_jenj_tk"`
	AJenjSd            int        `db:"a_jenj_sd" json:"a_jenj_sd"`
	AJenjSmp           int        `db:"a_jenj_smp" json:"a_jenj_smp"`
	AJenjSma           int        `db:"a_jenj_sma" json:"a_jenj_sma"`
	AJenjTinggi        int        `db:"a_jenj_tinggi" json:"a_jenj_tinggi"`
	CreateDate         time.Time  `db:"create_date" json:"-"`
	LastUpdate         time.Time  `db:"last_update" json:"-"`
	ExpiredDate        *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bidang_usaha
type BidangUsaha struct {
	IDBu        string     `db:"id_bu" json:"id_bu"`
	NmBu        string     `db:"nm_bu" json:"nm_bu"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.fungsi_lab
type FungsiLab struct {
	IDFungsiLab string     `db:"id_fungsi_lab" json:"id_fungsi_lab"`
	NmFungsiLab string     `db:"nm_fungsi_lab" json:"nm_fungsi_lab"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.gelar_akademik
type GelarAkademik struct {
	IDGelarAkad  int        `db:"id_gelar_akad" json:"id_gelar_akad"`
	SingkatGelar string     `db:"singkat_gelar" json:"singkat_gelar"`
	NmGelarAkad  string     `db:"nm_gelar_akad" json:"nm_gelar_akad"`
	PosisiGelar  int        `db:"posisi_gelar" json:"posisi_gelar"`
	CreateDate   time.Time  `db:"create_date" json:"-"`
	LastUpdate   time.Time  `db:"last_update" json:"-"`
	ExpiredDate  *time.Time `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.ikatan_kerja_sdm
type IkatanKerjaSdm struct {
	IDIkatanKerja  string     `db:"id_ikatan_kerja" json:"id_ikatan_kerja"`
	NmIkatanKerja  string     `db:"nm_ikatan_kerja" json:"nm_ikatan_kerja"`
	KetIkatanKerja string     `db:"ket_ikatan_kerja" json:"ket_ikatan_kerja"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	ExpiredDate    *time.Time `db:"expired_date" json:"-"`
}

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
