package common

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

// Semester adalah entity dari tabel ref.semester
type Semester struct {
	IDSmt         string              `db:"id_smt" json:"id_smt"`
	IDThnAjaran   int                 `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmSmt         string              `db:"nm_smt" json:"nm_smt"`
	Smt           int                 `db:"smt" json:"smt"`
	APeriodeAktif *int                `db:"a_periode_aktif" json:"a_periode_aktif"`
	TglMulai      time.Time           `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai    time.Time           `db:"tgl_selesai" json:"tgl_selesai"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

// TahunAjaran adalah entity dari tabel ref.tahun_ajaran
type TahunAjaran struct {
	IDThnAjaran   int                 `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran   string              `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	APeriodeAktif *int                `db:"a_periode_aktif" json:"a_periode_aktif"`
	TglMulai      time.Time           `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai    time.Time           `db:"tgl_selesai" json:"tgl_selesai"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

// Agama adalah entity dari tabel ref.agama
type Agama struct {
	IDAgama     int                 `db:"id_agama" json:"id_agama"`
	NmAgama     string              `db:"nm_agama" json:"nm_agama"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.wilayah
type Wilayah struct {
	IDWil          string              `db:"id_wil" json:"id_wil"`
	IDNegara       string              `db:"id_negara" json:"id_negara"`
	NmWil          string              `db:"nm_wil" json:"nm_wil"`
	AsalWil        *string             `db:"asal_wil" json:"asal_wil,omitempty"`
	KodeBps        *string             `db:"kode_bps" json:"kode_bps,omitempty"`
	KodeDagri      *string             `db:"kode_dagri" json:"kode_dagri,omitempty"`
	KodeKeu        *string             `db:"kode_keu" json:"kode_keu,omitempty"`
	IDIndukWilayah *string             `db:"id_induk_wilayah" json:"id_induk_wilayah,omitempty"`
	IDLevelWil     int                 `db:"id_level_wil" json:"id_level_wil"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

// AktifitasKerjasama adalah entity dari tabel ref.aktifitas_kerjasama
type AktifitasKerjasama struct {
	IDAktKerjasama int                 `db:"id_akt_kerjasama" json:"id_akt_kerjasama"`
	NmAktKerjasama string              `db:"nm_akt_kerjasama" json:"nm_akt_kerjasama"`
	Ket            *string             `db:"ket" json:"ket"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

// BasisEvaluasi adalah entity dari tabel ref.basis_evaluasi
type BasisEvaluasi struct {
	IDBasisEvaluasi int                 `db:"id_basis_evaluasi" json:"id_basis_evaluasi"`
	NmBasisEvaluasi string              `db:"nm_basis_evaluasi" json:"nm_basis_evaluasi"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

// FungsiLab adalah entity dari tabel ref.fungsi_lab
type FungsiLab struct {
	IDFungsiLab string              `db:"id_fungsi_lab" json:"id_fungsi_lab"`
	NmFungsiLab string              `db:"nm_fungsi_lab" json:"nm_fungsi_lab"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

// GelarAkademik adalah entity dari tabel ref.gelar_akademik
type GelarAkademik struct {
	IDGelarAkad  int                 `db:"id_gelar_akad" json:"id_gelar_akad"`
	SingkatGelar string              `db:"singkat_gelar" json:"singkat_gelar"`
	NmGelarAkad  string              `db:"nm_gelar_akad" json:"nm_gelar_akad"`
	PosisiGelar  int                 `db:"posisi_gelar" json:"posisi_gelar"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

// IkatanKerjaSdm adalah entity dari tabel ref.ikatan_kerja_sdm
type IkatanKerjaSdm struct {
	IDIkatanKerja  string              `db:"id_ikatan_kerja" json:"id_ikatan_kerja"`
	NmIkatanKerja  string              `db:"nm_ikatan_kerja" json:"nm_ikatan_kerja"`
	KetIkatanKerja string              `db:"ket_ikatan_kerja" json:"ket_ikatan_kerja"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type JalurDaftar struct {
	IDJalurDaftar int                 `db:"id_jalur_daftar" json:"id_jalur_daftar"`
	NmJalurDaftar string              `db:"nm_jalur_daftar" json:"nm_jalur_daftar"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

// belum implemnted

type JenjangPendidikan struct {
	IDJenjDidik int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik string              `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	UJenjLemb   int                 `db:"u_jenj_lemb" json:"u_jenj_lemb"`
	UJenjOrg    int                 `db:"u_jenj_org" json:"u_jenj_org"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type Jurusan struct {
	IDJur           string              `db:"id_jur" json:"id_jur"`
	NmJur           string              `db:"nm_jur" json:"nm_jur"`
	NmIntlJur       *string             `db:"nm_intl_jur" json:"nm_intl_jur,omitempty"`
	KodeNomenklatur string              `db:"kode_nomenklatur" json:"kode_nomenklatur"`
	USma            int                 `db:"u_sma" json:"u_sma"`
	USmk            int                 `db:"u_smk" json:"u_smk"`
	UPt             int                 `db:"u_pt" json:"u_pt"`
	USlb            int                 `db:"u_slb" json:"u_slb"`
	IdIndukJurusan  string              `db:"id_induk_jurusan" json:"id_induk_jurusan"`
	IDJenjDidik     int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	IDKelBidang     string              `db:"id_kel_bidang" json:"id_kel_bidang"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}
