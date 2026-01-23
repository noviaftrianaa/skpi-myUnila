package lembaga

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type LembagaAkred struct {
	IDLembAkred        string              `db:"id_lemb_akred" json:"id_lemb_akred"`
	NmLemb             string              `db:"nm_lemb" json:"nm_lemb"`
	Jln                string              `db:"jln" json:"jln"`
	Rt                 int                 `db:"rt" json:"rt"`
	Rw                 int                 `db:"rw" json:"rw"`
	NmDsn              string              `db:"nm_dsn" json:"nm_dsn"`
	DsKel              string              `db:"ds_kel" json:"ds_kel"`
	KodePos            string              `db:"kode_pos" json:"kode_pos"`
	Lintang            float64             `db:"lintang" json:"lintang"`
	Bujur              float64             `db:"bujur" json:"bujur"`
	NoTel              string              `db:"no_tel" json:"no_tel"`
	NoFax              string              `db:"no_fax" json:"no_fax"`
	Email              string              `db:"email" json:"email"`
	Website            string              `db:"website" json:"website"`
	KdKl               string              `db:"kd_kl" json:"kd_kl"`
	KdSatker           string              `db:"kd_satker" json:"kd_satker"`
	TglMulaiBeroperasi *time.Time          `db:"tgl_mulai_beroperasi" json:"tgl_mulai_beroperasi"`
	Ket                string              `db:"ket" json:"ket"`
	TargetAkred        string              `db:"target_akred" json:"target_akred"`
	CreateDate         types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate         types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate        *time.Time          `db:"expired_date" json:"-"`
}

type LembagaPengangkat struct {
	IDLembAngkat int                 `db:"id_lemb_angkat" json:"id_lemb_angkat"`
	NmLembAngkat string              `db:"nm_lemb_angkat" json:"nm_lemb_angkat"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type LembagaSertifikasi struct {
	IDLembSert  int                 `db:"id_lemb_sert" json:"id_lemb_sert"`
	NmLembSert  string              `db:"nm_lemb_sert" json:"nm_lemb_sert"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
