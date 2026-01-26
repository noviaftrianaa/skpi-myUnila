package tingkat

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetTingkatKerjasama(ctx context.Context, params types.PaginationParams) ([]TingkatKerjasama, int64, error)
	GetTingkatPenghargaan(ctx context.Context, params types.PaginationParams) ([]TingkatPenghargaan, int64, error)
	GetTingkatPrestasi(ctx context.Context, params types.PaginationParams) ([]TingkatPrestasi, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// TingkatKerjasama
// ============================================================================

func (r *repository) GetTingkatKerjasama(ctx context.Context, params types.PaginationParams) ([]TingkatKerjasama, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_tingkat_kerjasama", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.tingkat_kerjasama",
			Select:      `id_tingkat_kerjasama, nm_tingkat_kerjasama, create_date, last_update, expired_date`,
			DefaultSort: "id_tingkat_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (TingkatKerjasama, error) {
			var t TingkatKerjasama
			err := rows.Scan(
				&t.IDTingkatKerjasama,
				&t.NmTingkatKerjasama,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// TingkatPenghargaan
// ============================================================================

func (r *repository) GetTingkatPenghargaan(ctx context.Context, params types.PaginationParams) ([]TingkatPenghargaan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_tkt_penghargaan", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.tingkat_penghargaan",
			Select:      `id_tkt_penghargaan, nm_tkt_penghargaan, create_date, last_update, expired_date`,
			DefaultSort: "id_tkt_penghargaan",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (TingkatPenghargaan, error) {
			var t TingkatPenghargaan
			err := rows.Scan(
				&t.IDTktPenghargaan,
				&t.NmTktPenghargaan,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// TingkatPrestasi
// ============================================================================

func (r *repository) GetTingkatPrestasi(ctx context.Context, params types.PaginationParams) ([]TingkatPrestasi, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_tkt_prestasi", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.tingkat_prestasi",
			Select:      `id_tkt_prestasi, nm_tkt_prestasi, create_date, last_update, expired_date`,
			DefaultSort: "id_tkt_prestasi",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (TingkatPrestasi, error) {
			var t TingkatPrestasi
			err := rows.Scan(
				&t.IDTktPrestasi,
				&t.NmTktPrestasi,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}
