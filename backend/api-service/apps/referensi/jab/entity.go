package jab

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/shopspring/decimal"
)

type JabTgs struct {
	IDJabTgs      int                  `db:"id_jab_tgs" json:"id_jab_tgs"`
	IDKelProf     int                  `db:"id_kel_prof" json:"id_kel_prof"`
	NmJabTgs      string               `db:"nm_jab_tgs" json:"nm_jab_tgs"`
	AJabUtamaSek  int                  `db:"a_jab_utama_sek" json:"a_jab_utama_sek"`
	AJabUtamaPt   int                  `db:"a_jab_utama_pt" json:"a_jab_utama_pt"`
	AJabUtamaLpnk int                  `db:"a_jab_utama_lpnk" json:"a_jab_utama_lpnk"`
	AJabUtamaLpk  int                  `db:"a_jab_utama_lpk" json:"a_jab_utama_lpk"`
	JmlJamDiakui  *int                 `db:"jml_jam_diakui" json:"jml_jam_diakui"`
	CreateDate    types.SQLServerTime  `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime  `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *types.SQLServerTime `db:"expired_date" json:"-"`
}

type JabFung struct {
	IDJabfung   int                  `db:"id_jabfung" json:"id_jabfung"`
	IDKelProf   int                  `db:"id_kel_prof" json:"id_kel_prof"`
	NmJabfung   string               `db:"nm_jabfung" json:"nm_jabfung"`
	AngkaKredit *decimal.Decimal     `db:"angka_kredit" json:"angka_kredit"`
	CreateDate  types.SQLServerTime  `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime  `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *types.SQLServerTime `db:"expired_date" json:"-"`
}
