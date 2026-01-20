package jab

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data bidang
type Repository interface {
	GetJabTgs(ctx context.Context, params types.JabTgsParams) ([]JabTgs, int64, error)
	GetJabFung(ctx context.Context, params types.JabFungParams) ([]JabFung, int64, error)
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
// Jab Tgs (Jabatan Tugas)
// ============================================================================

func (r *repository) GetJabTgs(ctx context.Context, params types.JabTgsParams) ([]JabTgs, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_kel_prof", params.IDKelProf)
	cb.AppendInt("a_jab_utama_sek", params.JabatanUtamaSek)
	cb.AppendInt("a_jab_utama_pt", params.JabatanUtamaPt)
	cb.AppendInt("a_jab_utama_lpnk", params.JabatanUtamaLpnk)
	cb.AppendInt("a_jab_utama_lpk", params.JabatanUtamaLpk)
	cb.Like("nm_jab_tgs", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jab_tgs",
			Select:      "id_jab_tgs, id_kel_prof, nm_jab_tgs, a_jab_utama_sek, a_jab_utama_pt, a_jab_utama_lpnk, a_jab_utama_lpk, jml_jam_diakui, create_date, last_update, expired_date",
			DefaultSort: "id_jab_tgs",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JabTgs, error) {
			var a JabTgs
			err := rows.Scan(
				&a.IDJabTgs,
				&a.IDKelProf,
				&a.NmJabTgs,
				&a.AJabUtamaSek,
				&a.AJabUtamaPt,
				&a.AJabUtamaLpnk,
				&a.AJabUtamaLpk,
				&a.JmlJamDiakui,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Jab Fung (Jabatan Fungsional)
// ============================================================================

func (r *repository) GetJabFung(ctx context.Context, params types.JabFungParams) ([]JabFung, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_kel_prof", params.IDKelProf)
	cb.AppendInt("angka_kredit", params.AngkaKredit)
	cb.Like("nm_jab_fung", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jab_fung",
			Select:      "id_jab_fung, id_kel_prof, nm_jab_fung, angka_kredit, create_date, last_update, expired_date",
			DefaultSort: "id_jab_fung",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JabFung, error) {
			var a JabFung
			err := rows.Scan(
				&a.IDJabFung,
				&a.IDKelProf,
				&a.NmJabFung,
				&a.AngkaKredit,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}
