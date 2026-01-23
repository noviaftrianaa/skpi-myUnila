package tingkat

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

type TingkatKerjasama struct {
	IDTingkatKerjasama int                 `db:"id_tingkat_kerjasama" json:"id_tingkat_kerjasama"`
	NmTingkatKerjasama string              `db:"nm_tingkat_kerjasama" json:"nm_tingkat_kerjasama"`
	CreateDate         types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate         types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate        *time.Time          `db:"expired_date" json:"-"`
}

type TingkatPenghargaan struct {
	IDTktPenghargaan int                 `db:"id_tkt_penghargaan" json:"id_tkt_penghargaan"`
	NmTktPenghargaan string              `db:"nm_tkt_penghargaan" json:"nm_tkt_penghargaan"`
	CreateDate       types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate       types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate      *time.Time          `db:"expired_date" json:"-"`
}

type TingkatPrestasi struct {
	IDTktPrestasi int                 `db:"id_tkt_prestasi" json:"id_tkt_prestasi"`
	NmTktPrestasi string              `db:"nm_tkt_prestasi" json:"nm_tkt_prestasi"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}
