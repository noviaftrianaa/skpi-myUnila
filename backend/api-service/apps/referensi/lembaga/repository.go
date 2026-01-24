package lembaga

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetLembagaAkred(ctx context.Context, params types.LembagaAkredParams) ([]LembagaAkred, int64, error)
	GetLembagaPengangkat(ctx context.Context, params types.PaginationParams) ([]LembagaPengangkat, int64, error)
	GetLembagaSertifikasi(ctx context.Context, params types.PaginationParams) ([]LembagaSertifikasi, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// LembagaAkred
// ============================================================================

func (r *repository) GetLembagaAkred(ctx context.Context, params types.LembagaAkredParams) ([]LembagaAkred, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendString("kode_pos", params.KodePos)
	cb.AppendString("kd_kl", params.KdKl)
	cb.AppendString("kd_satker", params.KdSatker)
	cb.AppendString("target_akred", params.TargetAkred)
	cb.AppendFloat("lintang", params.Lintang)
	cb.AppendFloat("bujur", params.Bujur)
	if params.Email != "" {
		cb.Like("email", params.Email)
	}
	cb.Like("nm_lemb", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.lembaga_akred",
			Select:      `id_lemb_akred, nm_lemb, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker, tgl_mulai_beroperasi, ket, target_akred, create_date, last_update, expired_date`,
			DefaultSort: "id_lemb_akred",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (LembagaAkred, error) {
			var l LembagaAkred
			err := rows.Scan(
				&l.IDLembAkred,
				&l.NmLemb,
				&l.Jln,
				&l.Rt,
				&l.Rw,
				&l.NmDsn,
				&l.DsKel,
				&l.KodePos,
				&l.Lintang,
				&l.Bujur,
				&l.NoTel,
				&l.NoFax,
				&l.Email,
				&l.Website,
				&l.KdKl,
				&l.KdSatker,
				&l.TglMulaiBeroperasi,
				&l.Ket,
				&l.TargetAkred,
				&l.CreateDate,
				&l.LastUpdate,
				&l.ExpiredDate,
			)
			return l, err
		},
	)
}

// ============================================================================
// LembagaPengangkat
// ============================================================================

func (r *repository) GetLembagaPengangkat(ctx context.Context, params types.PaginationParams) ([]LembagaPengangkat, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_lemb_angkat", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.lembaga_pengangkat",
			Select:      `id_lemb_angkat, nm_lemb_angkat, create_date, last_update, expired_date`,
			DefaultSort: "id_lemb_angkat",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (LembagaPengangkat, error) {
			var l LembagaPengangkat
			err := rows.Scan(
				&l.IDLembAngkat,
				&l.NmLembAngkat,
				&l.CreateDate,
				&l.LastUpdate,
				&l.ExpiredDate,
			)
			return l, err
		},
	)
}

// ============================================================================
// LembagaSertifikasi
// ============================================================================

func (r *repository) GetLembagaSertifikasi(ctx context.Context, params types.PaginationParams) ([]LembagaSertifikasi, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_lemb_sert", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.lembaga_sertifikasi",
			Select:      `id_lemb_sert, nm_lemb_sert, create_date, last_update, expired_date`,
			DefaultSort: "id_lemb_sert",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (LembagaSertifikasi, error) {
			var l LembagaSertifikasi
			err := rows.Scan(
				&l.IDLembSert,
				&l.NmLembSert,
				&l.CreateDate,
				&l.LastUpdate,
				&l.ExpiredDate,
			)
			return l, err
		},
	)
}
