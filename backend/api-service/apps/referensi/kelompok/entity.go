package kelompok

import (
	"time"

	parse "github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/types"
)

type KelompokBidang struct {
	IDKelBidang   parse.UUID          `db:"id_kel_bidang" json:"id_kel_bidang"`
	KodeKelBidang string              `db:"kode_kel_bidang" json:"kode_kel_bidang"`
	NmKelBidang   *string             `db:"nm_kel_bidang" json:"nm_kel_bidang"`
	USma          int                 `db:"u_sma" json:"u_sma"`
	USmk          int                 `db:"u_smk" json:"u_smk"`
	UPt           int                 `db:"u_pt" json:"u_pt"`
	UIptek        int                 `db:"u_iptek" json:"u_iptek"`
	UKepakaran    int                 `db:"u_kepakaran" json:"u_kepakaran"`
	KatKel        *string             `db:"kat_kel" json:"kat_kel"`
	KetKelBidang  *string             `db:"ket_kel_bidang" json:"ket_kel_bidang,omitempty"`
	ALeafNode     int                 `db:"a_leaf_node" json:"a_leaf_node"`
	IDIndukBidang parse.NullUUID      `db:"id_induk_bidang" json:"id_induk_bidang,omitempty"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type KelompokMk struct {
	IDKelMk     string              `db:"id_kel_mk" json:"id_kel_mk"`
	NmKelMk     string              `db:"nm_kel_mk" json:"nm_kel_mk"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type KelompokProfesi struct {
	IDKelProf   int                 `db:"id_kel_prof" json:"id_kel_prof"`
	NmKelProf   string              `db:"nm_kel_prof" json:"nm_kel_prof"`
	KetKelProf  *string             `db:"ket_kel_prof" json:"ket_kel_prof"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type KelompokUsaha struct {
	IDKelUsaha  string              `db:"id_kel_usaha" json:"id_kel_usaha"`
	NmKelUsaha  string              `db:"nm_kel_usaha" json:"nm_kel_usaha"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
