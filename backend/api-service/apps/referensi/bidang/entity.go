package bidang

import (
	"time"

	"github.com/myunila/api-service/internal/types"
)

// BidangKerjasama adalah entity dari tabel ref.bidang_kerjasama
type BidangKerjasama struct {
	IDBidKerjasama int                 `db:"id_bid_kerjasama" json:"id_bid_kerjasama"`
	NmBidKerjasama string              `db:"nm_bid_kerjasama" json:"nm_bid_kerjasama"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

// BidangPekerjaan adalah entity dari tabel ref.bidang_pekerjaan
type BidangPekerjaan struct {
	IDBidKerja  int                 `db:"id_bid_kerja" json:"id_bid_kerja"`
	NmBidKerja  string              `db:"nm_bid_kerja" json:"nm_bid_kerja"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

// BidangStudi adalah entity dari tabel ref.bidang_studi
type BidangStudi struct {
	IDBidStudi         int                 `db:"id_bid_studi" json:"id_bid_studi"`
	IDIndukBidangStudi *int                `db:"id_induk_bidang_studi" json:"id_induk_bidang_studi"`
	KodeBidStudi       string              `db:"kode_bid_studi" json:"kode_bid_studi"`
	NmBidStudi         string              `db:"nm_bid_studi" json:"nm_bid_studi"`
	AKel               int                 `db:"a_kel" json:"a_kel"`
	AJenjPaud          int                 `db:"a_jenj_paud" json:"a_jenj_paud"`
	AJenjTk            int                 `db:"a_jenj_tk" json:"a_jenj_tk"`
	AJenjSd            int                 `db:"a_jenj_sd" json:"a_jenj_sd"`
	AJenjSmp           int                 `db:"a_jenj_smp" json:"a_jenj_smp"`
	AJenjSma           int                 `db:"a_jenj_sma" json:"a_jenj_sma"`
	AJenjTinggi        int                 `db:"a_jenj_tinggi" json:"a_jenj_tinggi"`
	CreateDate         types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate         types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate        *time.Time          `db:"expired_date" json:"-"`
}

// BidangUsaha adalah entity dari tabel ref.bidang_usaha
type BidangUsaha struct {
	IDBu        string              `db:"id_bu" json:"id_bu"`
	NmBu        string              `db:"nm_bu" json:"nm_bu"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}
