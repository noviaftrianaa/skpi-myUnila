package bidang

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data bidang
type Repository interface {
	GetBidangKerjasama(ctx context.Context, params types.PaginationParams) ([]BidangKerjasama, int64, error)
	GetBidangPekerjaan(ctx context.Context, params types.PaginationParams) ([]BidangPekerjaan, int64, error)
	GetBidangStudi(ctx context.Context, params types.BidangStudiParams) ([]BidangStudi, int64, error)
	GetBidangUsaha(ctx context.Context, params types.PaginationParams) ([]BidangUsaha, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(DB *sqlx.DB) Repository {
	return &repository{
		db: DB,
	}
}

// ============================================================================
// Bidang Kerjasama
// ============================================================================

func (r *repository) GetBidangKerjasama(ctx context.Context, params types.PaginationParams) ([]BidangKerjasama, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_bid_kerjasama", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bidang_kerjasama",
			Select:      "id_bid_kerjasama, nm_bid_kerjasama, create_date, last_update, expired_date",
			DefaultSort: "id_bid_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BidangKerjasama, error) {
			var a BidangKerjasama
			err := rows.Scan(
				&a.IDBidKerjasama,
				&a.NmBidKerjasama,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Bidang Pekerjaan
// ============================================================================

func (r *repository) GetBidangPekerjaan(
	ctx context.Context,
	params types.PaginationParams,
) ([]BidangPekerjaan, int64, error) {

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_bid_kerja", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bidang_pekerjaan",
			Select:      "id_bid_kerja, nm_bid_kerja, create_date, last_update, expired_date",
			DefaultSort: "id_bid_kerja",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BidangPekerjaan, error) {
			var a BidangPekerjaan
			err := rows.Scan(
				&a.IDBidKerja,
				&a.NmBidKerja,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Bidang Studi
// ============================================================================

func (r *repository) GetBidangStudi(
	ctx context.Context,
	params types.BidangStudiParams,
) ([]BidangStudi, int64, error) {

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_induk_bidang_studi", params.IDIndukBidangStudi)
	cb.AppendInt("a_kel", params.Kelompok)
	cb.AppendInt("a_jenj_paud", params.JenjangPaud)
	cb.AppendInt("a_jenj_tk", params.JenjangTk)
	cb.AppendInt("a_jenj_sd", params.JenjangSd)
	cb.AppendInt("a_jenj_smp", params.JenjangSmp)
	cb.AppendInt("a_jenj_sma", params.JenjangSma)
	cb.AppendInt("a_jenj_tinggi", params.JenjangTinggi)
	cb.Like("nm_bid_studi", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.bidang_studi",
			Select: `
				id_bid_studi, id_induk_bidang_studi, kode_bid_studi, nm_bid_studi,
				a_kel, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma,
				a_jenj_tinggi, create_date, last_update, expired_date`,
			DefaultSort: "id_bid_studi",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (BidangStudi, error) {
			var a BidangStudi
			err := rows.Scan(
				&a.IDBidStudi,
				&a.IDIndukBidangStudi,
				&a.KodeBidStudi,
				&a.NmBidStudi,
				&a.AKel,
				&a.AJenjPaud,
				&a.AJenjTk,
				&a.AJenjSd,
				&a.AJenjSmp,
				&a.AJenjSma,
				&a.AJenjTinggi,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Bidang Usaha
// ============================================================================

func (r *repository) GetBidangUsaha(ctx context.Context, params types.PaginationParams) ([]BidangUsaha, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_bu", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bidang_usaha",
			Select:      "id_bu, nm_bu, create_date, last_update, expired_date",
			DefaultSort: "id_bu",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BidangUsaha, error) {
			var a BidangUsaha
			err := rows.Scan(
				&a.IDBu,
				&a.NmBu,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}
