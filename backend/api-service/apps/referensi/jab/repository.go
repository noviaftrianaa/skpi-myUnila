package jab

import (
	"context"
	"fmt"
	"strings"

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
	cb.AppendInt("jt.id_kel_prof", params.IDKelProf)
	cb.AppendInt("jt.a_jab_utama_sek", params.JabatanUtamaSek)
	cb.AppendInt("jt.a_jab_utama_pt", params.JabatanUtamaPt)
	cb.AppendInt("jt.a_jab_utama_lpnk", params.JabatanUtamaLpnk)
	cb.AppendInt("jt.a_jab_utama_lpk", params.JabatanUtamaLpk)
	cb.Like("jt.nm_jab_tgs", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "jt.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.jab_tgs jt
		LEFT JOIN ref.kelompok_profesi kp ON kp.id_kel_prof = jt.id_kel_prof
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "jt.id_jab_tgs"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			jt.id_jab_tgs, jt.id_kel_prof, jt.nm_jab_tgs, jt.a_jab_utama_sek, jt.a_jab_utama_pt, jt.a_jab_utama_lpnk, jt.a_jab_utama_lpk, jt.jml_jam_diakui, jt.create_date, jt.last_update, jt.expired_date, kp.nm_kel_prof
		FROM ref.jab_tgs jt
		LEFT JOIN ref.kelompok_profesi kp ON kp.id_kel_prof = jt.id_kel_prof
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []JabTgs
	for rows.Next() {
		var s JabTgs
		if err := rows.StructScan(&s); err != nil {
			return nil, 0, err
		}
		result = append(result, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil

	// return helper.QueryPaged(
	// 	ctx,
	// 	r.db,
	// 	helper.BaseQueryConfig{
	// 		Table:       "ref.jab_tgs",
	// 		Select:      "id_jab_tgs, id_kel_prof, nm_jab_tgs, a_jab_utama_sek, a_jab_utama_pt, a_jab_utama_lpnk, a_jab_utama_lpk, jml_jam_diakui, create_date, last_update, expired_date",
	// 		DefaultSort: "id_jab_tgs",
	// 	},
	// 	params.PaginationParams,
	// 	conds,
	// 	args,
	// 	func(rows *sql.Rows) (JabTgs, error) {
	// 		var a JabTgs
	// 		err := rows.Scan(
	// 			&a.IDJabTgs,
	// 			&a.IDKelProf,
	// 			&a.NmJabTgs,
	// 			&a.AJabUtamaSek,
	// 			&a.AJabUtamaPt,
	// 			&a.AJabUtamaLpnk,
	// 			&a.AJabUtamaLpk,
	// 			&a.JmlJamDiakui,
	// 			&a.CreateDate,
	// 			&a.LastUpdate,
	// 			&a.ExpiredDate,
	// 		)
	// 		return a, err
	// 	},
	// )
}

// ============================================================================
// Jab Fung (Jabatan Fungsional)
// ============================================================================

func (r *repository) GetJabFung(ctx context.Context, params types.JabFungParams) ([]JabFung, int64, error) {
	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("jf.id_kel_prof", params.IDKelProf)
	cb.AppendInt("jf.angka_kredit", params.AngkaKredit)
	cb.Like("jf.nm_jabfung", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "jf.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.jabfung jf
		LEFT JOIN ref.kelompok_profesi kp ON kp.id_kel_prof = jf.id_kel_prof
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "jf.id_jabfung"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			jf.id_jabfung, jf.id_kel_prof, jf.nm_jabfung, jf.angka_kredit, jf.create_date, jf.last_update, jf.expired_date, kp.nm_kel_prof
		FROM ref.jabfung jf
		LEFT JOIN ref.kelompok_profesi kp ON kp.id_kel_prof = jf.id_kel_prof
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []JabFung
	for rows.Next() {
		var s JabFung
		if err := rows.StructScan(&s); err != nil {
			return nil, 0, err
		}
		result = append(result, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil

	// return helper.QueryPaged(
	// 	ctx,
	// 	r.db,
	// 	helper.BaseQueryConfig{
	// 		Table:       "ref.jabfung",
	// 		Select:      "id_jabfung, id_kel_prof, nm_jabfung, angka_kredit, create_date, last_update, expired_date",
	// 		DefaultSort: "id_jabfung",
	// 	},
	// 	params.PaginationParams,
	// 	conds,
	// 	args,
	// 	func(rows *sql.Rows) (JabFung, error) {
	// 		var a JabFung
	// 		err := rows.Scan(
	// 			&a.IDJabfung,
	// 			&a.IDKelProf,
	// 			&a.NmJabfung,
	// 			&a.AngkaKredit,
	// 			&a.CreateDate,
	// 			&a.LastUpdate,
	// 			&a.ExpiredDate,
	// 		)
	// 		return a, err
	// 	},
	// )
}
