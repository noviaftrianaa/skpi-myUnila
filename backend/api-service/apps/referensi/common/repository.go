package common

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data common referensi
type Repository interface {
	GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error)
	GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error)
	GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error)
	GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error)
	GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error)
	GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error)
	GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error)
	GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error)
	GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error)
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
// Semester
// ============================================================================

func (r *repository) GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error) {
	conds := []string{}
	args := []interface{}{}
	p := 1

	if params.TahunAjaran != nil {
		conds = append(conds, fmt.Sprintf("id_thn_ajaran = @p%d", p))
		args = append(args, *params.TahunAjaran)
		p++
	}

	if params.PeriodeAktif != nil {
		conds = append(conds, fmt.Sprintf("a_periode_aktif = @p%d", p))
		args = append(args, *params.PeriodeAktif)
		p++
	}

	if params.Search != "" {
		conds = append(conds, fmt.Sprintf("nm_smt LIKE @p%d", p))
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.semester",
			Select: `id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif,
				tgl_mulai, tgl_selesai, create_date, last_update, expired_date`,
			DefaultSort: "id_smt",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Semester, error) {
			var s Semester
			err := rows.Scan(
				&s.IDSmt,
				&s.IDThnAjaran,
				&s.NmSmt,
				&s.Smt,
				&s.APeriodeAktif,
				&s.TglMulai,
				&s.TglSelesai,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// Tahun Ajaran
// ============================================================================

func (r *repository) GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error) {
	conds := []string{}
	args := []interface{}{}
	p := 1

	if params.PeriodeAktif != nil {
		conds = append(conds, fmt.Sprintf("a_periode_aktif = @p%d", p))
		args = append(args, *params.PeriodeAktif)
		p++
	}

	if params.Search != "" {
		conds = append(conds, fmt.Sprintf("nm_thn_ajaran LIKE @p%d", p))
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.tahun_ajaran",
			Select: `id_thn_ajaran, nm_thn_ajaran, a_periode_aktif, tgl_mulai, 
				tgl_selesai, create_date, last_update, expired_date`,
			DefaultSort: "id_thn_ajaran",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (TahunAjaran, error) {
			var t TahunAjaran
			err := rows.Scan(
				&t.IDThnAjaran,
				&t.NmThnAjaran,
				&t.APeriodeAktif,
				&t.TglMulai,
				&t.TglSelesai,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// Agama
// ============================================================================

func (r *repository) GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error) {
	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_agama LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.agama",
			Select:      "id_agama, nm_agama, create_date, last_update, expired_date",
			DefaultSort: "id_agama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Agama, error) {
			var a Agama
			err := rows.Scan(
				&a.IDAgama,
				&a.NmAgama,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Wilayah
// ============================================================================

func (r *repository) GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error) {
	conds := []string{}
	args := []interface{}{}
	p := 1

	if params.IDNegara != nil {
		conds = append(conds, fmt.Sprintf("id_negara = @p%d", p))
		args = append(args, *params.IDNegara)
		p++
	}

	if params.Level != nil {
		conds = append(conds, fmt.Sprintf("id_level_wil = @p%d", p))
		args = append(args, *params.Level)
		p++
	}

	if params.IDIndukWilayah != nil {
		conds = append(conds, fmt.Sprintf("id_induk_wilayah = @p%d", p))
		args = append(args, *params.IDIndukWilayah)
		p++
	}

	if params.Search != "" {
		conds = append(conds, fmt.Sprintf("nm_wil LIKE @p%d", p))
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.wilayah",
			Select: `id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri, 
				kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date`,
			DefaultSort: "id_wil",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Wilayah, error) {
			var w Wilayah
			err := rows.Scan(
				&w.IDWil,
				&w.IDNegara,
				&w.NmWil,
				&w.AsalWil,
				&w.KodeBps,
				&w.KodeDagri,
				&w.KodeKeu,
				&w.IDIndukWilayah,
				&w.IDLevelWil,
				&w.CreateDate,
				&w.LastUpdate,
				&w.ExpiredDate,
			)
			return w, err
		},
	)
}

// ============================================================================
// Aktifitas Kerjasama
// ============================================================================

func (r *repository) GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error) {
	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_akt_kerjasama LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.aktifitas_kerjasama",
			Select:      "id_akt_kerjasama, nm_akt_kerjasama, ket, create_date, last_update, expired_date",
			DefaultSort: "id_akt_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (AktifitasKerjasama, error) {
			var a AktifitasKerjasama
			err := rows.Scan(
				&a.IDAktKerjasama,
				&a.NmAktKerjasama,
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
// Basis Evaluasi
// ============================================================================

func (r *repository) GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error) {
	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_basis_evaluasi LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.basis_evaluasi",
			Select:      "id_basis_evaluasi, nm_basis_evaluasi, create_date, last_update, expired_date",
			DefaultSort: "id_basis_evaluasi",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BasisEvaluasi, error) {
			var b BasisEvaluasi
			err := rows.Scan(
				&b.IDBasisEvaluasi,
				&b.NmBasisEvaluasi,
				&b.CreateDate,
				&b.LastUpdate,
				&b.ExpiredDate,
			)
			return b, err
		},
	)
}

// ============================================================================
// Fungsi Lab
// ============================================================================

func (r *repository) GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error) {
	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_fungsi_lab LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.fungsi_lab",
			Select:      "id_fungsi_lab, nm_fungsi_lab, create_date, last_update, expired_date",
			DefaultSort: "id_fungsi_lab",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (FungsiLab, error) {
			var f FungsiLab
			err := rows.Scan(
				&f.IDFungsiLab,
				&f.NmFungsiLab,
				&f.CreateDate,
				&f.LastUpdate,
				&f.ExpiredDate,
			)
			return f, err
		},
	)
}

// ============================================================================
// Gelar Akademik
// ============================================================================

func (r *repository) GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error) {
	conds := []string{}
	args := []interface{}{}
	p := 1

	if params.PosisiGelar != nil {
		conds = append(conds, fmt.Sprintf("posisi_gelar = @p%d", p))
		args = append(args, *params.PosisiGelar)
		p++
	}

	if params.Search != "" {
		conds = append(conds, fmt.Sprintf("(nm_gelar_akad LIKE @p%d OR singkat_gelar LIKE @p%d)", p, p))
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.gelar_akademik",
			Select: `id_gelar_akad, singkat_gelar, nm_gelar_akad, posisi_gelar, 
				create_date, last_update, expired_date`,
			DefaultSort: "id_gelar_akad",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (GelarAkademik, error) {
			var g GelarAkademik
			err := rows.Scan(
				&g.IDGelarAkad,
				&g.SingkatGelar,
				&g.NmGelarAkad,
				&g.PosisiGelar,
				&g.CreateDate,
				&g.LastUpdate,
				&g.ExpiredDate,
			)
			return g, err
		},
	)
}

// ============================================================================
// Ikatan Kerja SDM
// ============================================================================

func (r *repository) GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error) {
	conds := []string{}
	args := []interface{}{}

	if params.Search != "" {
		conds = append(conds, "nm_ikatan_kerja LIKE @p1")
		args = append(args, "%"+params.Search+"%")
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.ikatan_kerja_sdm",
			Select: `id_ikatan_kerja, nm_ikatan_kerja, ket_ikatan_kerja, 
				create_date, last_update, expired_date`,
			DefaultSort: "id_ikatan_kerja",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (IkatanKerjaSdm, error) {
			var i IkatanKerjaSdm
			err := rows.Scan(
				&i.IDIkatanKerja,
				&i.NmIkatanKerja,
				&i.KetIkatanKerja,
				&i.CreateDate,
				&i.LastUpdate,
				&i.ExpiredDate,
			)
			return i, err
		},
	)
}
