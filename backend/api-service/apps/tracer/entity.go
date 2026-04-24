// Package tracer — endpoint tracer study (alumni survey).
// Schema `tracer` di pdut. Full CRUD untuk hasil_tracer_study + hasil_tracer_atasan,
// GET-only untuk umr_wilayah (reference).
//
// Source data: aplikasi tracer eksternal (web survey alumni) POST ke endpoint ini
// untuk sync hasil survey ke pdut.
package tracer

import (
	"time"

	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Entities (DB row shape)
// ============================================================================

type HasilTracerStudy struct {
	IDHasilTracerStudy   utils.UUID        `db:"id_hasil_tracer_study" json:"id_hasil_tracer_study"`
	IDThnAjaran          int               `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran          *string           `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	IDBidKerja           *int              `db:"id_bid_kerja" json:"id_bid_kerja"`
	IDWil                *string           `db:"id_wil" json:"id_wil"`
	NmWil                *string           `db:"nm_wil" json:"nm_wil"`
	IDRegPd              utils.UUID        `db:"id_reg_pd" json:"id_reg_pd"`
	IDPd                 utils.NullUUID    `db:"id_pd" json:"id_pd"`
	NmPd                 *string           `db:"nm_pd" json:"nm_pd"`
	Nipd                 *string           `db:"nipd" json:"nipd"`
	IDSms                utils.NullUUID    `db:"id_sms" json:"id_sms"`
	NmSms                *string           `db:"nm_sms" json:"nm_sms"`
	IDSmt                *string           `db:"id_smt" json:"id_smt"`
	IDJnsJalurKerja      *int              `db:"id_jns_jalur_kerja" json:"id_jns_jalur_kerja"`
	WktPengisian         pk.SQLServerTime  `db:"wkt_pengisian" json:"wkt_pengisian"`
	WktTunggu            *int              `db:"wkt_tunggu" json:"wkt_tunggu"`
	StatusLulusan        int               `db:"status_lulusan" json:"status_lulusan"`
	JnsTmptBekerja       *string           `db:"jns_tmpt_bekerja" json:"jns_tmpt_bekerja"`
	NmTmptBekerja        *string           `db:"nm_tmpt_bekerja" json:"nm_tmpt_bekerja"`
	IncomePerBln         *float64          `db:"income_per_bln" json:"income_per_bln"`
	TotalInstansiDilamar *int              `db:"total_instansi_dilamar" json:"total_instansi_dilamar"`
	HubBidangKerja       *int              `db:"hub_bidang_kerja" json:"hub_bidang_kerja"`
	TktKesesuaian        *int              `db:"tkt_kesesuaian" json:"tkt_kesesuaian"`
	AlasanTidakSesuai    *string           `db:"alasan_tidak_sesuai" json:"alasan_tidak_sesuai"`
	AKerjaSblmLulus      *int              `db:"a_kerja_sblm_lulus" json:"a_kerja_sblm_lulus"`
	Ket                  *string           `db:"ket" json:"ket"`
	LevelPerusahaan      *string           `db:"level_perusahaan" json:"level_perusahaan"`
	StatusJabatan        *string           `db:"status_jabatan" json:"status_jabatan"`
	NmPtLnjt             *string           `db:"nm_pt_lnjt" json:"nm_pt_lnjt"`
	NmProdiLnjt          *string           `db:"nm_prodi_lnjt" json:"nm_prodi_lnjt"`
	WktMasuk             *pk.SQLServerTime `db:"wkt_masuk" json:"wkt_masuk"`
	CreateDate           pk.SQLServerTime  `db:"create_date" json:"create_date"`
	LastUpdate           pk.SQLServerTime  `db:"last_update" json:"last_update"`
	LastSync             pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type HasilTracerAtasan struct {
	IDHasilTracerAtasan utils.UUID       `db:"id_hasil_tracer_atasan" json:"id_hasil_tracer_atasan"`
	IDHasilTracerStudy  utils.UUID       `db:"id_hasil_tracer_study" json:"id_hasil_tracer_study"`
	IDNegara            *string          `db:"id_negara" json:"id_negara"`
	IDWil               *string          `db:"id_wil" json:"id_wil"`
	EmailAtasan         *string          `db:"email_atasan" json:"email_atasan"`
	NmAtasan            *string          `db:"nm_atasan" json:"nm_atasan"`
	JabatanAtasan       *string          `db:"jabatan_atasan" json:"jabatan_atasan"`
	NmTmptBekerja       *string          `db:"nm_tmpt_bekerja" json:"nm_tmpt_bekerja"`
	BidangTempatBekerja *string          `db:"bidang_tempat_bekerja" json:"bidang_tempat_bekerja"`
	Saran               *string          `db:"saran" json:"saran"`
	Harapan             *string          `db:"harapan" json:"harapan"`
	CreateDate          pk.SQLServerTime `db:"create_date" json:"create_date"`
	LastUpdate          pk.SQLServerTime `db:"last_update" json:"last_update"`
	LastSync            pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type UmrWilayah struct {
	IDUmrWil        utils.UUID       `db:"id_umr_wil" json:"id_umr_wil"`
	IDWil           string           `db:"id_wil" json:"id_wil"`
	NmWil           *string          `db:"nm_wil" json:"nm_wil"`
	IDTahunAnggaran int              `db:"id_tahun_anggaran" json:"id_tahun_anggaran"`
	BesaranUmr      float64          `db:"besaran_umr" json:"besaran_umr"`
	LastSync        pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Query params (list / filter)
// ============================================================================

type HasilTracerParams struct {
	IDHasilTracerStudy *string `query:"id_hasil_tracer_study"`
	IDRegPd            *string `query:"id_reg_pd"`
	IDPd               *string `query:"id_pd"`
	IDSms              *string `query:"id_sms"`
	IDThnAjaran        *int    `query:"id_thn_ajaran"`
	StatusLulusan      *int    `query:"status_lulusan"`
	TktKesesuaian      *int    `query:"tkt_kesesuaian"`
	HubBidangKerja     *int    `query:"hub_bidang_kerja"`
	Page               int     `query:"page"`
	Limit              int     `query:"limit"`
	Search             string  `query:"search"` // nm_tmpt_bekerja / nipd
	SortBy             string  `query:"sort_by"`
	Order              string  `query:"order"`
}

type HasilTracerAtasanParams struct {
	IDHasilTracerAtasan *string `query:"id_hasil_tracer_atasan"`
	IDHasilTracerStudy  *string `query:"id_hasil_tracer_study"`
	Page                int     `query:"page"`
	Limit               int     `query:"limit"`
	Search              string  `query:"search"` // nm_atasan / email_atasan
	SortBy              string  `query:"sort_by"`
	Order               string  `query:"order"`
}

type UmrWilayahParams struct {
	IDUmrWil        *string `query:"id_umr_wil"`
	IDWil           *string `query:"id_wil"`
	IDTahunAnggaran *int    `query:"id_tahun_anggaran"`
	Page            int     `query:"page"`
	Limit           int     `query:"limit"`
	SortBy          string  `query:"sort_by"`
	Order           string  `query:"order"`
}

func normT(page, limit *int, order *string) {
	if *page < 1 {
		*page = 1
	}
	if *limit < 1 {
		*limit = 10
	}
	if *limit > 100 {
		*limit = 100
	}
	if *order == "" {
		*order = "ASC"
	}
}

// ============================================================================
// Create / Update DTO (untuk POST + PUT)
// ============================================================================

// HasilTracerCreate — body POST /hasil_tracer
// Wajib: id_reg_pd, id_thn_ajaran, wkt_pengisian (ISO8601), status_lulusan, id_creator.
type HasilTracerCreate struct {
	IDHasilTracerStudy   *string    `json:"id_hasil_tracer_study"` // optional, auto-generate kalau kosong
	IDRegPd              string     `json:"id_reg_pd" validate:"required"`
	IDThnAjaran          int        `json:"id_thn_ajaran" validate:"required"`
	IDBidKerja           *int       `json:"id_bid_kerja"`
	IDWil                *string    `json:"id_wil"`
	IDSmt                *string    `json:"id_smt"`
	IDJnsJalurKerja      *int       `json:"id_jns_jalur_kerja"`
	WktPengisian         time.Time  `json:"wkt_pengisian" validate:"required"`
	WktTunggu            *int       `json:"wkt_tunggu"`
	StatusLulusan        int        `json:"status_lulusan" validate:"required"`
	JnsTmptBekerja       *string    `json:"jns_tmpt_bekerja"`
	NmTmptBekerja        *string    `json:"nm_tmpt_bekerja"`
	IncomePerBln         *float64   `json:"income_per_bln"`
	TotalInstansiDilamar *int       `json:"total_instansi_dilamar"`
	HubBidangKerja       *int       `json:"hub_bidang_kerja"`
	TktKesesuaian        *int       `json:"tkt_kesesuaian"`
	AlasanTidakSesuai    *string    `json:"alasan_tidak_sesuai"`
	AKerjaSblmLulus      *int       `json:"a_kerja_sblm_lulus"`
	Ket                  *string    `json:"ket"`
	LevelPerusahaan      *string    `json:"level_perusahaan"`
	StatusJabatan        *string    `json:"status_jabatan"`
	NmPtLnjt             *string    `json:"nm_pt_lnjt"`
	NmProdiLnjt          *string    `json:"nm_prodi_lnjt"`
	WktMasuk             *time.Time `json:"wkt_masuk"`
	IDCreator            string     `json:"id_creator" validate:"required"`
}

// HasilTracerUpdate — body PUT /hasil_tracer/:id (semua field optional, update jika ada)
type HasilTracerUpdate struct {
	IDThnAjaran          *int       `json:"id_thn_ajaran"`
	IDBidKerja           *int       `json:"id_bid_kerja"`
	IDWil                *string    `json:"id_wil"`
	IDSmt                *string    `json:"id_smt"`
	IDJnsJalurKerja      *int       `json:"id_jns_jalur_kerja"`
	WktPengisian         *time.Time `json:"wkt_pengisian"`
	WktTunggu            *int       `json:"wkt_tunggu"`
	StatusLulusan        *int       `json:"status_lulusan"`
	JnsTmptBekerja       *string    `json:"jns_tmpt_bekerja"`
	NmTmptBekerja        *string    `json:"nm_tmpt_bekerja"`
	IncomePerBln         *float64   `json:"income_per_bln"`
	TotalInstansiDilamar *int       `json:"total_instansi_dilamar"`
	HubBidangKerja       *int       `json:"hub_bidang_kerja"`
	TktKesesuaian        *int       `json:"tkt_kesesuaian"`
	AlasanTidakSesuai    *string    `json:"alasan_tidak_sesuai"`
	AKerjaSblmLulus      *int       `json:"a_kerja_sblm_lulus"`
	Ket                  *string    `json:"ket"`
	LevelPerusahaan      *string    `json:"level_perusahaan"`
	StatusJabatan        *string    `json:"status_jabatan"`
	NmPtLnjt             *string    `json:"nm_pt_lnjt"`
	NmProdiLnjt          *string    `json:"nm_prodi_lnjt"`
	WktMasuk             *time.Time `json:"wkt_masuk"`
	IDUpdater            string     `json:"id_updater" validate:"required"`
}

// HasilTracerAtasanCreate — body POST /hasil_tracer_atasan
type HasilTracerAtasanCreate struct {
	IDHasilTracerAtasan *string `json:"id_hasil_tracer_atasan"`
	IDHasilTracerStudy  string  `json:"id_hasil_tracer_study" validate:"required"`
	IDNegara            *string `json:"id_negara"`
	IDWil               *string `json:"id_wil"`
	EmailAtasan         *string `json:"email_atasan"`
	NmAtasan            *string `json:"nm_atasan"`
	JabatanAtasan       *string `json:"jabatan_atasan"`
	NmTmptBekerja       *string `json:"nm_tmpt_bekerja"`
	BidangTempatBekerja *string `json:"bidang_tempat_bekerja"`
	Saran               *string `json:"saran"`
	Harapan             *string `json:"harapan"`
	IDCreator           string  `json:"id_creator" validate:"required"`
}

type HasilTracerAtasanUpdate struct {
	IDNegara            *string `json:"id_negara"`
	IDWil               *string `json:"id_wil"`
	EmailAtasan         *string `json:"email_atasan"`
	NmAtasan            *string `json:"nm_atasan"`
	JabatanAtasan       *string `json:"jabatan_atasan"`
	NmTmptBekerja       *string `json:"nm_tmpt_bekerja"`
	BidangTempatBekerja *string `json:"bidang_tempat_bekerja"`
	Saran               *string `json:"saran"`
	Harapan             *string `json:"harapan"`
	IDUpdater           string  `json:"id_updater" validate:"required"`
}

// DeleteBody — body DELETE (untuk trace id_updater)
type DeleteBody struct {
	IDUpdater string `json:"id_updater" validate:"required"`
}
