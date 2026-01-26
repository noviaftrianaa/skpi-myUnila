package sumber

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type SumberAir struct {
	IDSumberAir int                 `db:"id_sumber_air" json:"id_sumber_air"`
	NmSumberAir string              `db:"nm_sumber_air" json:"nm_sumber_air"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type SumberDana struct {
	IDSumberDana int                 `db:"id_sumber_dana" json:"id_sumber_dana"`
	NmSumberDana string              `db:"nm_sumber_dana" json:"nm_sumber_dana"`
	UBlockgrant  int                 `db:"u_blockgrant" json:"u_blockgrant"`
	UBeasiswa    int                 `db:"u_beasiswa" json:"u_beasiswa"`
	ULit         int                 `db:"u_lit" json:"u_lit"`
	UUnitUsaha   int                 `db:"u_unit_usaha" json:"u_unit_usaha"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type SumberGaji struct {
	IDSumberGaji int                 `db:"id_sumber_gaji" json:"id_sumber_gaji"`
	NmSumberGaji string              `db:"nm_sumber_gaji" json:"nm_sumber_gaji"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type SumberListrik struct {
	IDSumberListrik int                 `db:"id_sumber_listrik" json:"id_sumber_listrik"`
	NmSumberListrik string              `db:"nm_sumber_listrik" json:"nm_sumber_listrik"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}
