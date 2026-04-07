package status

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetStatusKepegawaian(ctx context.Context, params types.PaginationParams) ([]StatusKepegawaian, int64, error)
	GetStatusKepemilikan(ctx context.Context, params types.PaginationParams) ([]StatusKepemilikan, int64, error)
	GetStatusKerjasama(ctx context.Context, params types.PaginationParams) ([]StatusKerjasama, int64, error)
	GetStatusMahasiswa(ctx context.Context, params types.PaginationParams) ([]StatusMahasiswa, int64, error)
	GetStatusMilikSarpras(ctx context.Context, params types.PaginationParams) ([]StatusMilikSarpras, int64, error)
	GetStatusAnak(ctx context.Context, params types.PaginationParams) ([]StatusAnak, int64, error)
	GetStatusKeaktifanPegawai(ctx context.Context, params types.PaginationParams) ([]StatusKeaktifanPegawai, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// StatusKepegawaian
// ============================================================================

func (r *repository) GetStatusKepegawaian(ctx context.Context, params types.PaginationParams) ([]StatusKepegawaian, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_pegawai", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_kepegawaian",
			Select:      `id_stat_pegawai, nm_stat_pegawai, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_pegawai",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusKepegawaian, error) {
			var s StatusKepegawaian
			err := rows.Scan(
				&s.IDStatPegawai,
				&s.NmStatPegawai,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusKepemilikan
// ============================================================================

func (r *repository) GetStatusKepemilikan(ctx context.Context, params types.PaginationParams) ([]StatusKepemilikan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_milik", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_kepemilikan",
			Select:      `id_stat_milik, nm_stat_milik, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_milik",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusKepemilikan, error) {
			var s StatusKepemilikan
			err := rows.Scan(
				&s.IDStatMilik,
				&s.NmStatMilik,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusKerjasama
// ============================================================================

func (r *repository) GetStatusKerjasama(ctx context.Context, params types.PaginationParams) ([]StatusKerjasama, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_kerjasama", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_kerjasama",
			Select:      `id_stat_kerjasama, nm_stat_kerjasama, ket, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusKerjasama, error) {
			var s StatusKerjasama
			err := rows.Scan(
				&s.IDStatKerjasama,
				&s.NmStatKerjasama,
				&s.Ket,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusMahasiswa
// ============================================================================

func (r *repository) GetStatusMahasiswa(ctx context.Context, params types.PaginationParams) ([]StatusMahasiswa, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_mhs", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_mahasiswa",
			Select:      `id_stat_mhs, nm_stat_mhs, ket_stat_mhs, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_mhs",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusMahasiswa, error) {
			var s StatusMahasiswa
			err := rows.Scan(
				&s.IDStatMhs,
				&s.NmStatMhs,
				&s.KetStatMhs,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusMilikSarpras
// ============================================================================

func (r *repository) GetStatusMilikSarpras(ctx context.Context, params types.PaginationParams) ([]StatusMilikSarpras, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_milik_sarpras", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_milik_sarpras",
			Select:      `id_stat_milik_sarpras, nm_stat_milik_sarpras, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_milik_sarpras",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusMilikSarpras, error) {
			var s StatusMilikSarpras
			err := rows.Scan(
				&s.IDStatMilikSarpras,
				&s.NmStatMilikSarpras,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusAnak
// ============================================================================

func (r *repository) GetStatusAnak(ctx context.Context, params types.PaginationParams) ([]StatusAnak, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_anak", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_anak",
			Select:      `id_stat_anak, nm_stat_anak, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_anak",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusAnak, error) {
			var s StatusAnak
			err := rows.Scan(
				&s.IDStatAnak,
				&s.NmStatAnak,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// StatusKeaktifanPegawai
// ============================================================================

func (r *repository) GetStatusKeaktifanPegawai(ctx context.Context, params types.PaginationParams) ([]StatusKeaktifanPegawai, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_stat_aktif", params.Search)
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.status_keaktifan_pegawai",
			Select:      `id_stat_aktif, nm_stat_aktif, create_date, last_update, expired_date`,
			DefaultSort: "id_stat_aktif",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (StatusKeaktifanPegawai, error) {
			var s StatusKeaktifanPegawai
			err := rows.Scan(
				&s.IDStatAktif,
				&s.NmStatAktif,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}
