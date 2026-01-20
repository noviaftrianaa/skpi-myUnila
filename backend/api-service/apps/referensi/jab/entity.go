package jab

import "time"

type JabTgs struct {
	IDJabTgs      int        `db:"id_jab_tgs" json:"id_jab_tgs"`
	IDKelProf     int        `db:"id_kel_prof" json:"id_kel_prof"`
	NmJabTgs      string     `db:"nm_jab_tgs" json:"nm_jab_tgs"`
	AJabUtamaSek  int        `db:"a_jab_utama_sek" json:"a_jab_utama_sek"`
	AJabUtamaPt   int        `db:"a_jab_utama_pt" json:"a_jab_utama_pt"`
	AJabUtamaLpnk int        `db:"a_jab_utama_lpnk" json:"a_jab_utama_lpnk"`
	AJabUtamaLpk  int        `db:"a_jab_utama_lpk" json:"a_jab_utama_lpk"`
	JmlJamDiakui  int        `db:"jml_jam_diakui" json:"jml_jam_diakui"`
	CreateDate    time.Time  `db:"create_date" json:"-"`
	LastUpdate    time.Time  `db:"last_update" json:"-"`
	ExpiredDate   *time.Time `db:"expired_date" json:"-"`
}

type JabFung struct {
	IDJabFung   int        `db:"id_jab_fung" json:"id_jab_fung"`
	IDKelProf   int        `db:"id_kel_prof" json:"id_kel_prof"`
	NmJabFung   string     `db:"nm_jab_fung" json:"nm_jab_fung"`
	AngkaKredit int        `db:"angka_kredit" json:"angka_kredit"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}
