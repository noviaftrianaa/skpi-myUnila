package peta

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type PetaKatgiatJabfung struct {
	IDKatgiat   int                 `db:"id_katgiat" json:"id_katgiat"`
	IDJabfung   int                 `db:"id_jabfung" json:"id_jabfung"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type PetaKatgiatJnsdok struct {
	IDKatgiat   int                 `db:"id_katgiat" json:"id_katgiat"`
	IDJnsDok    int                 `db:"id_jns_dok" json:"id_jns_dok"`
	AWajib      int                 `db:"a_wajib" json:"a_wajib"`
	NoUrut      int                 `db:"no_urut" json:"no_urut"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type PetaKatgiatJnspub struct {
	IDKatgiat   int                 `db:"id_katgiat" json:"id_katgiat"`
	IDJnsPub    int                 `db:"id_jns_pub" json:"id_jns_pub"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
