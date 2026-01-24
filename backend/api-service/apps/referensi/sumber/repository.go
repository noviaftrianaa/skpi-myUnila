package sumber

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetSumberAir(ctx context.Context, params types.PaginationParams) ([]SumberAir, int64, error)
	GetSumberDana(ctx context.Context, params types.SumberDanaParams) ([]SumberDana, int64, error)
	GetSumberGaji(ctx context.Context, params types.PaginationParams) ([]SumberGaji, int64, error)
	GetSumberListrik(ctx context.Context, params types.PaginationParams) ([]SumberListrik, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// SumberAir
// ============================================================================

func (r *repository) GetSumberAir(ctx context.Context, params types.PaginationParams) ([]SumberAir, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_sumber_air", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.sumber_air",
			Select:      `id_sumber_air, nm_sumber_air, create_date, last_update, expired_date`,
			DefaultSort: "id_sumber_air",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (SumberAir, error) {
			var s SumberAir
			err := rows.Scan(
				&s.IDSumberAir,
				&s.NmSumberAir,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// SumberDana
// ============================================================================

func (r *repository) GetSumberDana(ctx context.Context, params types.SumberDanaParams) ([]SumberDana, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("u_blockgrant", params.UBlockgrant)
	cb.AppendInt("u_beasiswa", params.UBeasiswa)
	cb.AppendInt("u_lit", params.ULit)
	cb.AppendInt("u_unit_usaha", params.UUnitUsaha)
	cb.Like("nm_sumber_dana", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.sumber_dana",
			Select:      `id_sumber_dana, nm_sumber_dana, u_blockgrant, u_beasiswa, u_lit, u_unit_usaha, create_date, last_update, expired_date`,
			DefaultSort: "id_sumber_dana",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (SumberDana, error) {
			var s SumberDana
			err := rows.Scan(
				&s.IDSumberDana,
				&s.NmSumberDana,
				&s.UBlockgrant,
				&s.UBeasiswa,
				&s.ULit,
				&s.UUnitUsaha,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// SumberGaji
// ============================================================================

func (r *repository) GetSumberGaji(ctx context.Context, params types.PaginationParams) ([]SumberGaji, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_sumber_gaji", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.sumber_gaji",
			Select:      `id_sumber_gaji, nm_sumber_gaji, create_date, last_update, expired_date`,
			DefaultSort: "id_sumber_gaji",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (SumberGaji, error) {
			var s SumberGaji
			err := rows.Scan(
				&s.IDSumberGaji,
				&s.NmSumberGaji,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// SumberListrik
// ============================================================================

func (r *repository) GetSumberListrik(ctx context.Context, params types.PaginationParams) ([]SumberListrik, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_sumber_listrik", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.sumber_listrik",
			Select:      `id_sumber_listrik, nm_sumber_listrik, create_date, last_update, expired_date`,
			DefaultSort: "id_sumber_listrik",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (SumberListrik, error) {
			var s SumberListrik
			err := rows.Scan(
				&s.IDSumberListrik,
				&s.NmSumberListrik,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}
