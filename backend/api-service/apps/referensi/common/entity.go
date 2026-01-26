package common

import (
	"time"

	"github.com/myunila/api-service/apps/diklat"
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
	KodeNomenklatur *string             `db:"kode_nomenklatur" json:"kode_nomenklatur"`
	USma            int                 `db:"u_sma" json:"u_sma"`
	USmk            int                 `db:"u_smk" json:"u_smk"`
	UPt             int                 `db:"u_pt" json:"u_pt"`
	USlb            int                 `db:"u_slb" json:"u_slb"`
	IdIndukJurusan  *string             `db:"id_induk_jurusan" json:"id_induk_jurusan"`
	IDJenjDidik     int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	IDKelBidang     diklat.UUID         `db:"id_kel_bidang" json:"id_kel_bidang"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type Kbli struct {
	IDKbli      int                 `db:"id_kbli" json:"id_kbli"`
	IDIndukKbli *int                `db:"id_induk_kbli" json:"id_induk_kbli"`
	Kategori    string              `db:"kategori" json:"kategori"`
	Kode        string              `db:"kode" json:"kode"`
	Judul       string              `db:"judul" json:"judul"`
	LvKbli      int                 `db:"lv_kbli" json:"lv_kbli"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type KeahlianLab struct {
	IDKeahlianLab string              `db:"id_keahlian_lab" json:"id_keahlian_lab"`
	NmKeahlianLab string              `db:"nm_keahlian_lab" json:"nm_keahlian_lab"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type KebutuhanKhusus struct {
	IDKk        int                 `db:"id_kk" json:"id_kk"`
	NmKk        string              `db:"nm_kk" json:"nm_kk"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type KriteriaMitra struct {
	IDKriteriaMitra int                 `db:"id_kriteria_mitra" json:"id_kriteria_mitra"`
	NmKriteriaMitra string              `db:"nm_kriteria_mitra" json:"nm_kriteria_mitra"`
	Ket             *string             `db:"ket" json:"ket"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type LevelWilayah struct {
	IDLevelWil     int                 `db:"id_level_wil" json:"id_level_wil"`
	NmLevelWilayah string              `db:"nm_level_wilayah" json:"nm_level_wilayah"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type MediaPublikasi struct {
	IDMediaPub     diklat.UUID         `db:"id_media_pub" json:"id_media_pub"`
	IDJnsMedia     int                 `db:"id_jns_media" json:"id_jns_media"`
	IDKelBidang    diklat.UUID         `db:"id_kel_bidang" json:"id_kel_bidang"`
	IDSp           diklat.NullUUID     `db:"id_sp" json:"id_sp"`
	IDNegara       string              `db:"id_negara" json:"id_negara"`
	NmMediaPub     string              `db:"nm_media_pub" json:"nm_media_pub"`
	BentukMediaPub *string             `db:"bentuk_media_pub" json:"bentuk_media_pub"`
	GradeSinta     *string             `db:"grade_sinta" json:"grade_sinta"`
	JnsPenerbit    *string             `db:"jns_penerbit" json:"jns_penerbit"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type Negara struct {
	IDNegara    string              `db:"id_negara" json:"id_negara"`
	NmNegara    string              `db:"nm_negara" json:"nm_negara"`
	ALn         int                 `db:"a_ln" json:"a_ln"`
	Benua       int                 `db:"benua" json:"benua"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type NilaiAkred struct {
	IDAkred     int                 `db:"id_akred" json:"id_akred"`
	NmAkred     string              `db:"nm_akred" json:"nm_akred"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type PangkatGolongan struct {
	IDPangkatGol int                 `db:"id_pangkat_gol" json:"id_pangkat_gol"`
	KodeGol      string              `db:"kode_gol" json:"kode_gol"`
	NmPangkat    string              `db:"nm_pangkat" json:"nm_pangkat"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type Pembiayaan struct {
	IDPembiayaan int                 `db:"id_pembiayaan" json:"id_pembiayaan"`
	NmPembiayaan string              `db:"nm_pembiayaan" json:"nm_pembiayaan"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type Penghasilan struct {
	IDPenghasilan int                 `db:"id_penghasilan" json:"id_penghasilan"`
	NmPenghasilan string              `db:"nm_penghasilan" json:"nm_penghasilan"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type Satuan struct {
	KdSatuan    string              `db:"kd_satuan" json:"kd_satuan"`
	NmSatuan    string              `db:"nm_satuan" json:"nm_satuan"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type TahunAnggaran struct {
	IDTahunAnggaran int                 `db:"id_tahun_anggaran" json:"id_tahun_anggaran"`
	NmTahunAnggaran string              `db:"nm_tahun_anggaran" json:"nm_tahun_anggaran"`
	APeriodeAktif   int                 `db:"a_periode_aktif" json:"a_periode_aktif"`
	TglMulai        time.Time           `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai      time.Time           `db:"tgl_selesai" json:"tgl_selesai"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type Tse struct {
	IDTse       int                 `db:"id_tse" json:"id_tse"`
	KodeTse     string              `db:"kode_tse" json:"kode_tse"`
	NmTse       string              `db:"nm_tse" json:"nm_tse"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type SkimKegiatan struct {
	IDSkim               diklat.UUID         `db:"id_skim" json:"id_skim"`
	IDJenjDidik          *int                `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmSkim               string              `db:"nm_skim" json:"nm_skim"`
	NmSingkatSkim        *string             `db:"nm_singkat_skim" json:"nm_singkat_skim"`
	KdSkim               *string             `db:"kd_skim" json:"kd_skim"`
	TstSkim              *time.Time          `db:"tst_skim" json:"tst_skim"`
	JmlMinPersonil       int                 `db:"jml_min_personil" json:"jml_min_personil"`
	JmlMaksPersonil      int                 `db:"jml_maks_personil" json:"jml_maks_personil"`
	JmlMaksKeikutsertaan *int                `db:"jml_maks_keikutsertaan" json:"jml_maks_keikutsertaan"`
	JmlMaksSbgKetua      *int                `db:"jml_maks_sbg_ketua" json:"jml_maks_sbg_ketua"`
	DanaMinThnBerjalan   *float64            `db:"dana_min_thn_berjalan" json:"dana_min_thn_berjalan"`
	DanaMaksThnBerjalan  float64             `db:"dana_maks_thn_berjalan" json:"dana_maks_thn_berjalan"`
	KetSkim              *string             `db:"ket_skim" json:"ket_skim"`
	DeviasiNilai         float64             `db:"deviasi_nilai" json:"deviasi_nilai"`
	PassingGrade         float64             `db:"passing_grade" json:"passing_grade"`
	CreateDate           types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate           types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate          *time.Time          `db:"expired_date" json:"-"`
}
