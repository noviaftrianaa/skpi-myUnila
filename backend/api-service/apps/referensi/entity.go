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
	Level          *int    `query:"level"`           // 1=provinsi, 2=kab/kota, 3=kecamatan, 4=kelurahan
	IDIndukWilayah *string `query:"id_induk_wilayah"` // filter berdasarkan induk
	IDNegara       *string `query:"id_negara"`        // filter berdasarkan negara
}

// SemesterParams untuk parameter khusus semester
type SemesterParams struct {
	PaginationParams
	TahunAjaran   *int `query:"tahun_ajaran"`
	PeriodeAktif  *int `query:"periode_aktif"` // 1=aktif, 0=tidak aktif
}

// TahunAjaranParams untuk parameter khusus tahun ajaran
type TahunAjaranParams struct {
	PaginationParams
	PeriodeAktif *int `query:"periode_aktif"` // 1=aktif, 0=tidak aktif
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
