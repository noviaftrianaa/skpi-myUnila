package bentuk

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

// Wilayah adalah entity dari tabel ref.bentuk_kegiatan_kerjasama
type BentukKegiatanKerjasama struct {
	IDBntkGiatKerjasama int                 `db:"id_bntk_giat_kerjasama" json:"id_bntk_giat_kerjasama"`
	NmBntkGiatKerjasama string              `db:"nm_bntk_giat_kerjasama" json:"nm_bntk_giat_kerjasama"`
	Ket                 *string             `db:"ket" json:"ket"`
	CreateDate          types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate          types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate         *time.Time          `db:"expired_date" json:"-"`
}

// Wilayah adalah entity dari tabel ref.bentuk_pendidikan
type BentukPendidikan struct {
	IDBp        int                 `db:"id_bp" json:"id_bp"`
	NmBp        string              `db:"nm_bp" json:"nm_bp"`
	AJenjPaud   int                 `db:"a_jenj_paud" json:"a_jenj_paud"`
	AJenjTk     int                 `db:"a_jenj_tk" json:"a_jenj_tk"`
	AJenjSd     int                 `db:"a_jenj_sd" json:"a_jenj_sd"`
	AJenjSmp    int                 `db:"a_jenj_smp" json:"a_jenj_smp"`
	AJenjSma    int                 `db:"a_jenj_sma" json:"a_jenj_sma"`
	AJenjTinggi int                 `db:"a_jenj_tinggi" json:"a_jenj_tinggi"`
	DirBina     string              `db:"dir_bina" json:"dir_bina"`
	AAktif      int                 `db:"a_aktif" json:"a_aktif"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
