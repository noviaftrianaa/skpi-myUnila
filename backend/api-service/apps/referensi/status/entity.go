package status

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type StatusKepegawaian struct {
	IDStatPegawai int                 `db:"id_stat_pegawai" json:"id_stat_pegawai"`
	NmStatPegawai string              `db:"nm_stat_pegawai" json:"nm_stat_pegawai"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type StatusKepemilikan struct {
	IDStatMilik int                 `db:"id_stat_milik" json:"id_stat_milik"`
	NmStatMilik string              `db:"nm_stat_milik" json:"nm_stat_milik"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type StatusKerjasama struct {
	IDStatKerjasama int                 `db:"id_stat_kerjasama" json:"id_stat_kerjasama"`
	NmStatKerjasama string              `db:"nm_stat_kerjasama" json:"nm_stat_kerjasama"`
	Ket             string              `db:"ket" json:"ket"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type StatusMahasiswa struct {
	IDStatMhs   string              `db:"id_stat_mhs" json:"id_stat_mhs"`
	NmStatMhs   string              `db:"nm_stat_mhs" json:"nm_stat_mhs"`
	KetStatMhs  *string             `db:"ket_stat_mhs" json:"ket_stat_mhs"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type StatusMilikSarpras struct {
	IDStatMilikSarpras int                 `db:"id_stat_milik_sarpras" json:"id_stat_milik_sarpras"`
	NmStatMilikSarpras string              `db:"nm_stat_milik_sarpras" json:"nm_stat_milik_sarpras"`
	CreateDate         types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate         types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate        *time.Time          `db:"expired_date" json:"-"`
}

type StatusAnak struct {
	IDStatAnak  int                 `db:"id_stat_anak" json:"id_stat_anak"`
	NmStatAnak  string              `db:"nm_stat_anak" json:"nm_stat_anak"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type StatusKeaktifanPegawai struct {
	IDStatAktif int                 `db:"id_stat_aktif" json:"id_stat_aktif"`
	NmStatAktif string              `db:"nm_stat_aktif" json:"nm_stat_aktif"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
