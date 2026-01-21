package kategori

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type KategoriCapaianIuran struct {
	IDKatCapaian int                 `db:"id_kat_capaian" json:"id_kat_capaian"`
	NmKatCapaian string              `db:"nm_kat_capaian" json:"nm_kat_capaian"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type KategoriKegiatan struct {
	IDKatGiat      int                 `db:"id_kat_giat" json:"id_kat_giat"`
	IDIndukKatGiat int                 `db:"id_induk_kat_giat" json:"id_induk_kat_giat,omitempty"`
	IDJnsSdm       int                 `db:"id_jns_sdm" json:"id_jns_sdm"`
	KodeKatPak     string              `db:"kode_kat_pak" json:"kode_kat_pak"`
	KodeKatBkd     string              `db:"kode_kat_bkd" json:"kode_kat_bkd"`
	NmKat          string              `db:"nm_kat" json:"nm_kat"`
	KatUnsur       string              `db:"kat_unsur" json:"kat_unsur"`
	TeksJudul      string              `db:"teks_judul" json:"teks_judul"`
	TeksSk         string              `db:"teks_sk" json:"teks_sk"`
	TeksTglSk      string              `db:"teks_tgl_sk" json:"teks_tgl_sk"`
	TeksLokasi     string              `db:"teks_lokasi" json:"teks_lokasi"`
	LevelKat       int                 `db:"level_kat" json:"level_kat"`
	SksBkd         int                 `db:"sks_bkd" json:"sks_bkd"`
	Ak             int                 `db:"ak" json:"ak"`
	AkMaks         int                 `db:"ak_maks" json:"ak_maks"`
	SatuanNilai    string              `db:"satuan_nilai" json:"satuan_nilai"`
	Ket            string              `db:"ket" json:"ket"`
	AAktif         int                 `db:"a_aktif" json:"a_aktif"`
	AAnakBimb      int                 `db:"a_anak_bimb" json:"a_anak_bimb"`
	AJudul         int                 `db:"a_judul" json:"a_judul"`
	ASk            int                 `db:"a_sk" json:"a_sk"`
	APeerReview    int                 `db:"a_peer_review" json:"a_peer_review"`
	AcuanWaktu     string              `db:"acuan_waktu" json:"acuan_waktu"`
	UBkd           int                 `db:"u_bkd" json:"u_bkd"`
	UPak           int                 `db:"u_pak" json:"u_pak"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type KategoriTabel struct {
	IDKatTabel  string              `db:"id_kat_tabel" json:"id_kat_tabel"`
	IDKatGiat   int                 `db:"id_kat_giat" json:"id_kat_giat"`
	NmSchema    string              `db:"nm_schema" json:"nm_schema"`
	NmTbl       string              `db:"nm_tbl" json:"nm_tbl"`
	KonfigKolom string              `db:"konfig_kolom" json:"konfig_kolom"`
	Ket         string              `db:"ket" json:"ket"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
