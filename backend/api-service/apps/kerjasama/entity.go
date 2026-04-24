// Package kerjasama — endpoint LP2M/Kerjasama (MOU, SMS_Kerjasama, DUDI).
// Schema `kerjasama` di pdut + `pdrd.dudi`. Full CRUD untuk mendukung aplikasi
// LP2M / Bagian Kerjasama. Write tetap aman karena data user-generated, bukan
// data sync PDDIKTI.
package kerjasama

import (
	"time"

	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Entities
// ============================================================================

type Mou struct {
	IDMou          utils.UUID        `db:"id_mou" json:"id_mou"`
	IDSp           utils.UUID        `db:"id_sp" json:"id_sp"`
	NmSp           *string           `db:"nm_sp" json:"nm_sp"`
	IDAktKerjasama *int              `db:"id_akt_kerjasama" json:"id_akt_kerjasama"`
	NmAktKerjasama *string           `db:"nm_akt_kerjasama" json:"nm_akt_kerjasama"`
	IDDudi         utils.NullUUID    `db:"id_dudi" json:"id_dudi"`
	NmLembDudi     *string           `db:"nm_lemb_dudi" json:"nm_lemb_dudi"`
	SkMou          string            `db:"sk_mou" json:"sk_mou"`
	JudulMou       string            `db:"judul_mou" json:"judul_mou"`
	UraianMou      *string           `db:"uraian_mou" json:"uraian_mou"`
	TglMulai       pk.SQLServerTime  `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai     pk.SQLServerTime  `db:"tgl_selesai" json:"tgl_selesai"`
	NmDudi         string            `db:"nm_dudi" json:"nm_dudi"`
	NpwpDudi       *string           `db:"npwp_dudi" json:"npwp_dudi"`
	NmBu           string            `db:"nm_bu" json:"nm_bu"`
	TelKantor      *string           `db:"tel_kantor" json:"tel_kantor"`
	Fax            *string           `db:"fax" json:"fax"`
	Cp             *string           `db:"cp" json:"cp"`
	TelCp          *string           `db:"tel_cp" json:"tel_cp"`
	JabCp          *string           `db:"jab_cp" json:"jab_cp"`
	CreateDate     pk.SQLServerTime  `db:"create_date" json:"create_date"`
	LastUpdate     pk.SQLServerTime  `db:"last_update" json:"last_update"`
	LastSync       pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type SmsKerjasama struct {
	IDSmsKerjasama       utils.UUID       `db:"id_sms_kerjasama" json:"id_sms_kerjasama"`
	IDSms                utils.UUID       `db:"id_sms" json:"id_sms"`
	NmSms                *string          `db:"nm_sms" json:"nm_sms"`
	IDMou                utils.UUID       `db:"id_mou" json:"id_mou"`
	JudulMou             *string          `db:"judul_mou" json:"judul_mou"`
	SkMou                *string          `db:"sk_mou" json:"sk_mou"`
	IDTingkatKerjasama   int              `db:"id_tingkat_kerjasama" json:"id_tingkat_kerjasama"`
	NmTingkatKerjasama   *string          `db:"nm_tingkat_kerjasama" json:"nm_tingkat_kerjasama"`
	IDSumberDana         *int             `db:"id_sumber_dana" json:"id_sumber_dana"`
	IDStatKerjasama      *int             `db:"id_stat_kerjasama" json:"id_stat_kerjasama"`
	NmStatKerjasama      *string          `db:"nm_stat_kerjasama" json:"nm_stat_kerjasama"`
	IDBidKerjasama       *int             `db:"id_bid_kerjasama" json:"id_bid_kerjasama"`
	NmBidKerjasama       *string          `db:"nm_bid_kerjasama" json:"nm_bid_kerjasama"`
	IDKriteriaMitra      *int             `db:"id_kriteria_mitra" json:"id_kriteria_mitra"`
	NmKriteriaMitra      *string          `db:"nm_kriteria_mitra" json:"nm_kriteria_mitra"`
	IDBntkGiatKerjasama  *int             `db:"id_bntk_giat_kerjasama" json:"id_bntk_giat_kerjasama"`
	NmBntkGiatKerjasama  *string          `db:"nm_bntk_giat_kerjasama" json:"nm_bntk_giat_kerjasama"`
	HslProdBrg           *string          `db:"hsl_prod_brg" json:"hsl_prod_brg"`
	HslProdJasa          *string          `db:"hsl_prod_jasa" json:"hsl_prod_jasa"`
	OmzetBarangPerBulan  *float64         `db:"omzet_barang_per_bulan" json:"omzet_barang_per_bulan"`
	OmzetJasaPerBulan    *float64         `db:"omzet_jasa_per_bulan" json:"omzet_jasa_per_bulan"`
	PrestasiPenghargaan  *string          `db:"prestasi_penghargaan" json:"prestasi_penghargaan"`
	PangsaPsrBrg         *string          `db:"pangsa_psr_brg" json:"pangsa_psr_brg"`
	PangsaPsrJasa        *string          `db:"pangsa_psr_jasa" json:"pangsa_psr_jasa"`
	BesaranKerjasama     *float64         `db:"besaran_kerjasama" json:"besaran_kerjasama"`
	CreateDate           pk.SQLServerTime `db:"create_date" json:"create_date"`
	LastUpdate           pk.SQLServerTime `db:"last_update" json:"last_update"`
	LastSync             pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type Dudi struct {
	IDDudi             utils.UUID       `db:"id_dudi" json:"id_dudi"`
	NmLemb             string           `db:"nm_lemb" json:"nm_lemb"`
	NmWp               *string          `db:"nm_wp" json:"nm_wp"`
	Jln                *string          `db:"jln" json:"jln"`
	Rt                 *int             `db:"rt" json:"rt"`
	Rw                 *int             `db:"rw" json:"rw"`
	NmDsn              *string          `db:"nm_dsn" json:"nm_dsn"`
	DsKel              *string          `db:"ds_kel" json:"ds_kel"`
	KodePos            *string          `db:"kode_pos" json:"kode_pos"`
	Lintang            *float64         `db:"lintang" json:"lintang"`
	Bujur              *float64         `db:"bujur" json:"bujur"`
	NoTel              *string          `db:"no_tel" json:"no_tel"`
	NoFax              *string          `db:"no_fax" json:"no_fax"`
	Email              *string          `db:"email" json:"email"`
	Website            *string          `db:"website" json:"website"`
	Npwp               *string          `db:"npwp" json:"npwp"`
	Kip                *string          `db:"kip" json:"kip"`
	AlamatKanpus       *string          `db:"alamat_kanpus" json:"alamat_kanpus"`
	EmailKanpus        *string          `db:"email_kanpus" json:"email_kanpus"`
	TelpKanpus         *string          `db:"telp_kanpus" json:"telp_kanpus"`
	FaxKanpus          *string          `db:"fax_kanpus" json:"fax_kanpus"`
	WebsiteKanpus      *string          `db:"website_kanpus" json:"website_kanpus"`
	JmlTmptTidur       *int             `db:"jml_tmpt_tidur" json:"jml_tmpt_tidur"`
	JmlPasienRawatInap *int             `db:"jml_pasien_rawat_inap" json:"jml_pasien_rawat_inap"`
	JmlPasienRawatJln  *int             `db:"jml_pasien_rawat_jln" json:"jml_pasien_rawat_jln"`
	VariasiKasus       *string          `db:"variasi_kasus" json:"variasi_kasus"`
	IDWil              string           `db:"id_wil" json:"id_wil"`
	NmWil              *string          `db:"nm_wil" json:"nm_wil"`
	IDBu               string           `db:"id_bu" json:"id_bu"`
	CreateDate         pk.SQLServerTime `db:"create_date" json:"create_date"`
	LastUpdate         pk.SQLServerTime `db:"last_update" json:"last_update"`
	LastSync           pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Query params
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

type MouParams struct {
	BaseParams
	IDMou          *string `query:"id_mou"`
	IDSp           *string `query:"id_sp"`
	IDAktKerjasama *int    `query:"id_akt_kerjasama"`
	IDDudi         *string `query:"id_dudi"`
	SkMou          *string `query:"sk_mou"`
}

type SmsKerjasamaParams struct {
	BaseParams
	IDSmsKerjasama      *string `query:"id_sms_kerjasama"`
	IDSms               *string `query:"id_sms"`
	IDMou               *string `query:"id_mou"`
	IDTingkatKerjasama  *int    `query:"id_tingkat_kerjasama"`
	IDStatKerjasama     *int    `query:"id_stat_kerjasama"`
	IDBidKerjasama      *int    `query:"id_bid_kerjasama"`
	IDBntkGiatKerjasama *int    `query:"id_bntk_giat_kerjasama"`
	IDKriteriaMitra     *int    `query:"id_kriteria_mitra"`
}

type DudiParams struct {
	BaseParams
	IDDudi *string `query:"id_dudi"`
	IDWil  *string `query:"id_wil"`
	IDBu   *string `query:"id_bu"`
	Npwp   *string `query:"npwp"`
}

// ============================================================================
// Create / Update DTO
// ============================================================================

type MouCreate struct {
	IDMou          *string   `json:"id_mou"` // optional, auto-generate
	IDSp           string    `json:"id_sp" validate:"required"`
	IDAktKerjasama *int      `json:"id_akt_kerjasama"`
	IDDudi         *string   `json:"id_dudi"`
	SkMou          string    `json:"sk_mou" validate:"required"`
	JudulMou       string    `json:"judul_mou" validate:"required"`
	UraianMou      *string   `json:"uraian_mou"`
	TglMulai       time.Time `json:"tgl_mulai" validate:"required"`
	TglSelesai     time.Time `json:"tgl_selesai" validate:"required"`
	NmDudi         string    `json:"nm_dudi" validate:"required"`
	NpwpDudi       *string   `json:"npwp_dudi"`
	NmBu           string    `json:"nm_bu" validate:"required"`
	TelKantor      *string   `json:"tel_kantor"`
	Fax            *string   `json:"fax"`
	Cp             *string   `json:"cp"`
	TelCp          *string   `json:"tel_cp"`
	JabCp          *string   `json:"jab_cp"`
	IDCreator      string    `json:"id_creator" validate:"required"`
}

type MouUpdate struct {
	IDSp           *string    `json:"id_sp"`
	IDAktKerjasama *int       `json:"id_akt_kerjasama"`
	IDDudi         *string    `json:"id_dudi"`
	SkMou          *string    `json:"sk_mou"`
	JudulMou       *string    `json:"judul_mou"`
	UraianMou      *string    `json:"uraian_mou"`
	TglMulai       *time.Time `json:"tgl_mulai"`
	TglSelesai     *time.Time `json:"tgl_selesai"`
	NmDudi         *string    `json:"nm_dudi"`
	NpwpDudi       *string    `json:"npwp_dudi"`
	NmBu           *string    `json:"nm_bu"`
	TelKantor      *string    `json:"tel_kantor"`
	Fax            *string    `json:"fax"`
	Cp             *string    `json:"cp"`
	TelCp          *string    `json:"tel_cp"`
	JabCp          *string    `json:"jab_cp"`
	IDUpdater      string     `json:"id_updater" validate:"required"`
}

type SmsKerjasamaCreate struct {
	IDSmsKerjasama      *string  `json:"id_sms_kerjasama"`
	IDSms               string   `json:"id_sms" validate:"required"`
	IDMou               string   `json:"id_mou" validate:"required"`
	IDTingkatKerjasama  int      `json:"id_tingkat_kerjasama" validate:"required"`
	IDSumberDana        *int     `json:"id_sumber_dana"`
	IDStatKerjasama     *int     `json:"id_stat_kerjasama"`
	IDBidKerjasama      *int     `json:"id_bid_kerjasama"`
	IDKriteriaMitra     *int     `json:"id_kriteria_mitra"`
	IDBntkGiatKerjasama *int     `json:"id_bntk_giat_kerjasama"`
	HslProdBrg          *string  `json:"hsl_prod_brg"`
	HslProdJasa         *string  `json:"hsl_prod_jasa"`
	OmzetBarangPerBulan *float64 `json:"omzet_barang_per_bulan"`
	OmzetJasaPerBulan   *float64 `json:"omzet_jasa_per_bulan"`
	PrestasiPenghargaan *string  `json:"prestasi_penghargaan"`
	PangsaPsrBrg        *string  `json:"pangsa_psr_brg"`
	PangsaPsrJasa       *string  `json:"pangsa_psr_jasa"`
	BesaranKerjasama    *float64 `json:"besaran_kerjasama"`
	IDCreator           string   `json:"id_creator" validate:"required"`
}

type SmsKerjasamaUpdate struct {
	IDSms               *string  `json:"id_sms"`
	IDMou               *string  `json:"id_mou"`
	IDTingkatKerjasama  *int     `json:"id_tingkat_kerjasama"`
	IDSumberDana        *int     `json:"id_sumber_dana"`
	IDStatKerjasama     *int     `json:"id_stat_kerjasama"`
	IDBidKerjasama      *int     `json:"id_bid_kerjasama"`
	IDKriteriaMitra     *int     `json:"id_kriteria_mitra"`
	IDBntkGiatKerjasama *int     `json:"id_bntk_giat_kerjasama"`
	HslProdBrg          *string  `json:"hsl_prod_brg"`
	HslProdJasa         *string  `json:"hsl_prod_jasa"`
	OmzetBarangPerBulan *float64 `json:"omzet_barang_per_bulan"`
	OmzetJasaPerBulan   *float64 `json:"omzet_jasa_per_bulan"`
	PrestasiPenghargaan *string  `json:"prestasi_penghargaan"`
	PangsaPsrBrg        *string  `json:"pangsa_psr_brg"`
	PangsaPsrJasa       *string  `json:"pangsa_psr_jasa"`
	BesaranKerjasama    *float64 `json:"besaran_kerjasama"`
	IDUpdater           string   `json:"id_updater" validate:"required"`
}

type DudiCreate struct {
	IDDudi        *string  `json:"id_dudi"`
	NmLemb        string   `json:"nm_lemb" validate:"required"`
	NmWp          *string  `json:"nm_wp"`
	Jln           *string  `json:"jln"`
	Rt            *int     `json:"rt"`
	Rw            *int     `json:"rw"`
	NmDsn         *string  `json:"nm_dsn"`
	DsKel         *string  `json:"ds_kel"`
	KodePos       *string  `json:"kode_pos"`
	Lintang       *float64 `json:"lintang"`
	Bujur         *float64 `json:"bujur"`
	NoTel         *string  `json:"no_tel"`
	NoFax         *string  `json:"no_fax"`
	Email         *string  `json:"email"`
	Website       *string  `json:"website"`
	Npwp          *string  `json:"npwp"`
	Kip           *string  `json:"kip"`
	AlamatKanpus  *string  `json:"alamat_kanpus"`
	EmailKanpus   *string  `json:"email_kanpus"`
	TelpKanpus    *string  `json:"telp_kanpus"`
	FaxKanpus     *string  `json:"fax_kanpus"`
	WebsiteKanpus *string  `json:"website_kanpus"`
	IDWil         string   `json:"id_wil" validate:"required"`
	IDBu          string   `json:"id_bu" validate:"required"`
	IDCreator     string   `json:"id_creator" validate:"required"`
}

type DudiUpdate struct {
	NmLemb        *string  `json:"nm_lemb"`
	NmWp          *string  `json:"nm_wp"`
	Jln           *string  `json:"jln"`
	Rt            *int     `json:"rt"`
	Rw            *int     `json:"rw"`
	NmDsn         *string  `json:"nm_dsn"`
	DsKel         *string  `json:"ds_kel"`
	KodePos       *string  `json:"kode_pos"`
	Lintang       *float64 `json:"lintang"`
	Bujur         *float64 `json:"bujur"`
	NoTel         *string  `json:"no_tel"`
	NoFax         *string  `json:"no_fax"`
	Email         *string  `json:"email"`
	Website       *string  `json:"website"`
	Npwp          *string  `json:"npwp"`
	Kip           *string  `json:"kip"`
	AlamatKanpus  *string  `json:"alamat_kanpus"`
	EmailKanpus   *string  `json:"email_kanpus"`
	TelpKanpus    *string  `json:"telp_kanpus"`
	FaxKanpus     *string  `json:"fax_kanpus"`
	WebsiteKanpus *string  `json:"website_kanpus"`
	IDWil         *string  `json:"id_wil"`
	IDBu          *string  `json:"id_bu"`
	IDUpdater     string   `json:"id_updater" validate:"required"`
}

type DeleteBody struct {
	IDUpdater string `json:"id_updater" validate:"required"`
}
