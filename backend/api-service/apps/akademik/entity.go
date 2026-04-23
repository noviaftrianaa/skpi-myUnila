// Package akademik — endpoint akademik dari pdrd: matkul, kelas_kuliah,
// jadwal_kelas, kurikulum_sp.
package akademik

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// Matkul — list ringkas
type Matkul struct {
	IDMk        utils.UUID           `db:"id_mk" json:"id_mk"`
	IDSms       utils.NullUUID       `db:"id_sms" json:"id_sms"`
	KodeMk      *string              `db:"kode_mk" json:"kode_mk"`
	NmMk        string               `db:"nm_mk" json:"nm_mk"`
	SksMk       *float64             `db:"sks_mk" json:"sks_mk"`
	SksTm       *float64             `db:"sks_tm" json:"sks_tm"`
	SksPrak     *float64             `db:"sks_prak" json:"sks_prak"`
	SksPrakLap  *float64             `db:"sks_prak_lap" json:"sks_prak_lap"`
	SksSim      *float64             `db:"sks_sim" json:"sks_sim"`
	JnsMk       *string              `db:"jns_mk" json:"jns_mk"`
	KelMk       *string              `db:"kel_mk" json:"kel_mk"`
	IDJnsMk     *int                 `db:"id_jns_mk" json:"id_jns_mk"`
	IDKelMk     *int                 `db:"id_kel_mk" json:"id_kel_mk"`
	IDJenjDidik *int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	TglMulai    *types.SQLServerTime `db:"tgl_mulai_efektif" json:"tgl_mulai_efektif"`
	TglAkhir    *types.SQLServerTime `db:"tgl_akhir_efektif" json:"tgl_akhir_efektif"`
	LastSync    types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// MatkulDetail — join ref (jenis_mk, kelompok_mk, jenjang_pendidikan) + prodi
type MatkulDetail struct {
	IDMk        utils.UUID           `db:"id_mk" json:"id_mk"`
	IDSms       utils.NullUUID       `db:"id_sms" json:"id_sms"`
	NmSms       *string              `db:"nm_sms" json:"nm_sms"`
	KodeMk      *string              `db:"kode_mk" json:"kode_mk"`
	NmMk        string               `db:"nm_mk" json:"nm_mk"`
	SksMk       *float64             `db:"sks_mk" json:"sks_mk"`
	SksTm       *float64             `db:"sks_tm" json:"sks_tm"`
	SksPrak     *float64             `db:"sks_prak" json:"sks_prak"`
	SksPrakLap  *float64             `db:"sks_prak_lap" json:"sks_prak_lap"`
	SksSim      *float64             `db:"sks_sim" json:"sks_sim"`
	JnsMk       *string              `db:"jns_mk" json:"jns_mk"`
	KelMk       *string              `db:"kel_mk" json:"kel_mk"`
	IDJnsMk     *int                 `db:"id_jns_mk" json:"id_jns_mk"`
	NmJnsMk     *string              `db:"nm_jns_mk" json:"nm_jns_mk"`
	IDKelMk     *int                 `db:"id_kel_mk" json:"id_kel_mk"`
	NmKelMk     *string              `db:"nm_kel_mk" json:"nm_kel_mk"`
	IDJenjDidik *int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik *string              `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	MetodePelks *string              `db:"metode_pelaksanaan_kuliah" json:"metode_pelaksanaan_kuliah"`
	ASap        *int                 `db:"a_sap" json:"a_sap"`
	ASilabus    *int                 `db:"a_silabus" json:"a_silabus"`
	ABahanAjar  *int                 `db:"a_bahan_ajar" json:"a_bahan_ajar"`
	TglMulai    *types.SQLServerTime `db:"tgl_mulai_efektif" json:"tgl_mulai_efektif"`
	TglAkhir    *types.SQLServerTime `db:"tgl_akhir_efektif" json:"tgl_akhir_efektif"`
	LastSync    types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// KelasKuliah — list + join matkul/prodi/semester
type KelasKuliah struct {
	IDKls       utils.UUID           `db:"id_kls" json:"id_kls"`
	NmKls       *string              `db:"nm_kls" json:"nm_kls"`
	IDSmt       *int                 `db:"id_smt" json:"id_smt"`
	NmSmt       *string              `db:"nm_smt" json:"nm_smt"`
	IDSms       utils.NullUUID       `db:"id_sms" json:"id_sms"`
	NmSms       *string              `db:"nm_sms" json:"nm_sms"`
	IDMk        utils.UUID           `db:"id_mk" json:"id_mk"`
	KodeMk      *string              `db:"kode_mk" json:"kode_mk"`
	NmMk        *string              `db:"nm_mk" json:"nm_mk"`
	SksMk       *float64             `db:"sks_mk" json:"sks_mk"`
	SksTm       *float64             `db:"sks_tm" json:"sks_tm"`
	SksPrak     *float64             `db:"sks_prak" json:"sks_prak"`
	BahasanCase *string              `db:"bahasan_case" json:"bahasan_case"`
	LingkupKls  *string              `db:"lingkup_kelas" json:"lingkup_kelas"`
	ModeKuliah  *string              `db:"mode_kuliah" json:"mode_kuliah"`
	KuotaPditt  *int                 `db:"kuota_pditt" json:"kuota_pditt"`
	KodeVclass  *string              `db:"kode_vclass" json:"kode_vclass"`
	UrlVclass   *string              `db:"url_vclass" json:"url_vclass"`
	LastSync    types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// JadwalKelas
type JadwalKelas struct {
	IDJdwlKls    utils.UUID           `db:"id_jdwl_kls" json:"id_jdwl_kls"`
	IDKls        utils.UUID           `db:"id_kls" json:"id_kls"`
	NmKls        *string              `db:"nm_kls" json:"nm_kls"`
	KodeMk       *string              `db:"kode_mk" json:"kode_mk"`
	NmMk         *string              `db:"nm_mk" json:"nm_mk"`
	IDSmt        *int                 `db:"id_smt" json:"id_smt"`
	NmSmt        *string              `db:"nm_smt" json:"nm_smt"`
	Pertemuan    *int                 `db:"pertemuan" json:"pertemuan"`
	TglJadwal    *types.SQLServerTime `db:"tgl_jadwal" json:"tgl_jadwal"`
	WaktuMulai   *string              `db:"waktu_mulai" json:"waktu_mulai"`
	WaktuSelesai *string              `db:"waktu_selesai" json:"waktu_selesai"`
	Lokasi       *string              `db:"lokasi" json:"lokasi"`
	Status       *string              `db:"status" json:"status"`
	LastSync     types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// Kurikulum (pdrd.kurikulum_sp)
type Kurikulum struct {
	IDKurikulumSp   utils.UUID           `db:"id_kurikulum_sp" json:"id_kurikulum_sp"`
	NmKurikulumSp   *string              `db:"nm_kurikulum_sp" json:"nm_kurikulum_sp"`
	IDJenjDidik     *int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik     *string              `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	IDSmt           *int                 `db:"id_smt" json:"id_smt"`
	NmSmt           *string              `db:"nm_smt" json:"nm_smt"`
	IDSms           utils.NullUUID       `db:"id_sms" json:"id_sms"`
	NmSms           *string              `db:"nm_sms" json:"nm_sms"`
	JmlhSmtNormal   *int                 `db:"jmlh_smt_normal" json:"jmlh_smt_normal"`
	ADigunakan      *int                 `db:"a_digunakan" json:"a_digunakan"`
	JmlhSksLulus    *int                 `db:"jmlh_sks_lulus" json:"jmlh_sks_lulus"`
	JmlhSksWajib    *int                 `db:"jmlh_sks_wajib" json:"jmlh_sks_wajib"`
	JmlhSksPilihan  *int                 `db:"jmlh_sks_pilihan" json:"jmlh_sks_pilihan"`
	JmlhSksMkWajib  *int                 `db:"jmlh_sks_mk_wajib" json:"jmlh_sks_mk_wajib"`
	JmlhSksMkPilih  *int                 `db:"jmlh_sks_mk_pilih" json:"jmlh_sks_mk_pilih"`
	LastSync        types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}
