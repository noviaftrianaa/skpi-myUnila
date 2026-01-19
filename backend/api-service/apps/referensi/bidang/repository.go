package bidang

import (
	"context"
	"database/sql"
	"fmt"

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

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_bid_kerjasama LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bidang_kerjasama",
			Select:      "id_bid_kerjasama, nm_bid_kerjasama, create_date, last_update, expired_date",
			DefaultSort: "id_bid_kerjasama",
		},
		params,
		conditions,
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

	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_bid_kerja LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

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

	conds := []string{}
	args := []interface{}{}
	p := 1

	if params.IDIndukBidangStudi != nil {
		conds = append(conds, fmt.Sprintf("id_induk_bidang_studi = @p%d", p))
		args = append(args, *params.IDIndukBidangStudi)
		p++
	}
	if params.Kelompok != nil {
		conds = append(conds, fmt.Sprintf("a_kel = @p%d", p))
		args = append(args, *params.Kelompok)
		p++
	}
	if params.JenjangPaud != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_paud = @p%d", p))
		args = append(args, *params.JenjangPaud)
		p++
	}
	if params.JenjangTk != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_tk = @p%d", p))
		args = append(args, *params.JenjangTk)
		p++
	}
	if params.JenjangSd != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_sd = @p%d", p))
		args = append(args, *params.JenjangSd)
		p++
	}
	if params.JenjangSmp != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_smp = @p%d", p))
		args = append(args, *params.JenjangSmp)
		p++
	}
	if params.JenjangSma != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_sma = @p%d", p))
		args = append(args, *params.JenjangSma)
		p++
	}
	if params.JenjangTinggi != nil {
		conds = append(conds, fmt.Sprintf("a_jenj_tinggi = @p%d", p))
		args = append(args, *params.JenjangTinggi)
		p++
	}

	if params.Search != "" {
		conds = append(conds, fmt.Sprintf("nm_bid_studi LIKE @p%d", p))
		args = append(args, "%"+params.Search+"%")
	}

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

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_bu LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bidang_usaha",
			Select:      "id_bu, nm_bu, create_date, last_update, expired_date",
			DefaultSort: "id_bu",
		},
		params,
		conditions,
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
