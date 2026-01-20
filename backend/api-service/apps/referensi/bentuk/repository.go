package bentuk

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data referensi
type Repository interface {

	// Bentuk Kegiatan Kerjasama
	GetBentukKegiatanKerjasama(ctx context.Context, params types.PaginationParams) ([]BentukKegiatanKerjasama, int64, error)

	// Bentuk Pendidikan
	GetBentukPendidikan(ctx context.Context, params types.BentukPendidikanParams) ([]BentukPendidikan, int64, error)
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
// Bentuk Kegiatan Kerjasama
// ============================================================================

func (r *repository) GetBentukKegiatanKerjasama(ctx context.Context, params types.PaginationParams) ([]BentukKegiatanKerjasama, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_bntk_giat_kerjasama", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bentuk_kegiatan_kerjasama",
			Select:      "id_bntk_giat_kerjasama, nm_bntk_giat_kerjasama, ket, create_date, last_update, expired_date",
			DefaultSort: "id_bntk_giat_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BentukKegiatanKerjasama, error) {
			var a BentukKegiatanKerjasama
			err := rows.Scan(
				&a.IDBntkGiatKerjasama,
				&a.NmBntkGiatKerjasama,
				&a.Ket,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Bentuk Pendidikan
// ============================================================================

func (r *repository) GetBentukPendidikan(ctx context.Context, params types.BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_jenj_paud", params.JenjangPaud)
	cb.AppendInt("a_jenj_tk", params.JenjangTk)
	cb.AppendInt("a_jenj_sd", params.JenjangSd)
	cb.AppendInt("a_jenj_smp", params.JenjangSmp)
	cb.AppendInt("a_jenj_sma", params.JenjangSma)
	cb.AppendInt("a_jenj_tinggi", params.JenjangTinggi)
	cb.AppendInt("a_aktif", params.Aktif)
	cb.Like("nm_bp", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.bentuk_pendidikan",
			Select: `id_bp, nm_bp, a_jenj_paud, a_jenj_tk, a_jenj_sd, 
				a_jenj_smp, a_jenj_sma, a_jenj_tinggi, dir_bina, a_aktif, create_date, last_update, expired_date`,
			DefaultSort: "id_bp",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (BentukPendidikan, error) {
			var a BentukPendidikan
			err := rows.Scan(
				&a.IDBp,
				&a.NmBp,
				&a.AJenjPaud,
				&a.AJenjTk,
				&a.AJenjSd,
				&a.AJenjSmp,
				&a.AJenjSma,
				&a.AJenjTinggi,
				&a.DirBina,
				&a.AAktif,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}
