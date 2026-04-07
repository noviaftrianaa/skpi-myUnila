package kelompok

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetKelompokBidang(ctx context.Context, params types.KelompokBidangParams) ([]KelompokBidang, int64, error)
	GetKelompokMk(ctx context.Context, params types.PaginationParams) ([]KelompokMk, int64, error)
	GetKelompokProfesi(ctx context.Context, params types.PaginationParams) ([]KelompokProfesi, int64, error)
	GetKelompokUsaha(ctx context.Context, params types.PaginationParams) ([]KelompokUsaha, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// KelompokBidang
// ============================================================================

func (r *repository) GetKelompokBidang(ctx context.Context, params types.KelompokBidangParams) ([]KelompokBidang, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendString("kode_kel_bidang", params.KodeKelBidang)
	cb.AppendString("nm_kel_bidang", params.NmKelBidang)
	cb.AppendUUID("id_induk_bidang", params.IDIndukBidang)
	cb.AppendInt("u_sma", params.USma)
	cb.AppendInt("u_smk", params.USmk)
	cb.AppendInt("u_pt", params.UPt)
	cb.AppendInt("u_iptek", params.UIptek)
	cb.AppendInt("u_kepakaran", params.UKepakaran)
	cb.AppendInt("a_leaf_node", params.ALeafNode)
	cb.Like("nm_kel_bidang", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kelompok_bidang",
			Select:      `id_kel_bidang, kode_kel_bidang, nm_kel_bidang, u_sma, u_smk, u_pt, u_iptek, u_kepakaran, kat_kel, ket_kel_bidang, a_leaf_node, id_induk_bidang, create_date, last_update, expired_date`,
			DefaultSort: "id_kel_bidang",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (KelompokBidang, error) {
			var k KelompokBidang
			err := rows.Scan(
				&k.IDKelBidang,
				&k.KodeKelBidang,
				&k.NmKelBidang,
				&k.USma,
				&k.USmk,
				&k.UPt,
				&k.UIptek,
				&k.UKepakaran,
				&k.KatKel,
				&k.KetKelBidang,
				&k.ALeafNode,
				&k.IDIndukBidang,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KelompokMk
// ============================================================================

func (r *repository) GetKelompokMk(ctx context.Context, params types.PaginationParams) ([]KelompokMk, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kel_mk", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kelompok_mk",
			Select:      `id_kel_mk, nm_kel_mk, create_date, last_update, expired_date`,
			DefaultSort: "id_kel_mk",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KelompokMk, error) {
			var k KelompokMk
			err := rows.Scan(
				&k.IDKelMk,
				&k.NmKelMk,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KelompokProfesi
// ============================================================================

func (r *repository) GetKelompokProfesi(ctx context.Context, params types.PaginationParams) ([]KelompokProfesi, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kel_prof", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kelompok_profesi",
			Select:      `id_kel_prof, nm_kel_prof, ket_kel_prof, create_date, last_update, expired_date`,
			DefaultSort: "id_kel_prof",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KelompokProfesi, error) {
			var k KelompokProfesi
			err := rows.Scan(
				&k.IDKelProf,
				&k.NmKelProf,
				&k.KetKelProf,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KelompokUsaha
// ============================================================================

func (r *repository) GetKelompokUsaha(ctx context.Context, params types.PaginationParams) ([]KelompokUsaha, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kel_usaha", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kelompok_usaha",
			Select:      `id_kel_usaha, nm_kel_usaha, create_date, last_update, expired_date`,
			DefaultSort: "id_kel_usaha",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KelompokUsaha, error) {
			var k KelompokUsaha
			err := rows.Scan(
				&k.IDKelUsaha,
				&k.NmKelUsaha,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}
