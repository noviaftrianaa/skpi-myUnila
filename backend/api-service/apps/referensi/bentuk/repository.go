package bentuk

import (
	"context"
	"database/sql"
	"fmt"

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

	// Build conditions
	conditions := []string{}
	args := []interface{}{}
	argIndex := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_bntk_giat_kerjasama LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.bentuk_kegiatan_kerjasama",
			Select:      "id_bntk_giat_kerjasama, nm_bntk_giat_kerjasama, ket, create_date, last_update, expired_date",
			DefaultSort: "id_bntk_giat_kerjasama",
		},
		params,
		conditions,
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

	// Build conditions
	conditions := []string{}
	args := []interface{}{}
	p := 1

	if params.JenjangPaud != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_paud = @p%d", p))
		args = append(args, *params.JenjangPaud)
		p++
	}
	if params.JenjangTk != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_tk = @p%d", p))
		args = append(args, *params.JenjangTk)
		p++
	}
	if params.JenjangSd != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_sd = @p%d", p))
		args = append(args, *params.JenjangSd)
		p++
	}
	if params.JenjangSmp != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_smp = @p%d", p))
		args = append(args, *params.JenjangSmp)
		p++
	}
	if params.JenjangSma != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_sma = @p%d", p))
		args = append(args, *params.JenjangSma)
		p++
	}
	if params.JenjangTinggi != nil {
		conditions = append(conditions, fmt.Sprintf("a_jenj_tinggi = @p%d", p))
		args = append(args, *params.JenjangTinggi)
		p++
	}
	if params.Aktif != nil {
		conditions = append(conditions, fmt.Sprintf("a_aktif = @p%d", p))
		args = append(args, *params.Aktif)
		p++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_bp LIKE @p%d", p))
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.bentuk_pendidikan",
			Select: `id_bp, nm_bp, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, 
				a_jenj_tinggi, dir_bina, a_aktif, create_date, last_update, expired_date`,
			DefaultSort: "id_bp",
		},
		params.PaginationParams,
		conditions,
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
