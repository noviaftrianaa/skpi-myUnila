package peta

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error)
	GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error)
	GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// PetaKatgiatJabfung
// ============================================================================

func (r *repository) GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error) {
	cb := helper.NewCondBuilder()
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.peta_katgiat_jabfung",
			Select:      `id_katgiat, id_jabfung, create_date, last_update, expired_date`,
			DefaultSort: "id_katgiat, id_jabfung",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (PetaKatgiatJabfung, error) {
			var p PetaKatgiatJabfung
			err := rows.Scan(
				&p.IDKatgiat,
				&p.IDJabfung,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// PetaKatgiatJnsdok
// ============================================================================

func (r *repository) GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("pkj.id_jns_dok", params.IDJnsDok)
	cb.AppendInt("pkj.a_wajib", params.AWajib)
	cb.AppendInt("pkj.no_urut", params.NoUrut)

	conds, args := cb.Build()
	conds = append(conds, "s.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.peta_katgiat_jnsdok pkj
		LEFT JOIN ref.jenis_dokumen jd ON jd.id_jns_dok = pkj.id_jns_dok
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "s.id_smt"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			pkj.id_katgiat, pkj.id_jns_dok, pkj.a_wajib, pkj.no_urut, pkj.create_date, pkj.last_update, pkj.expired_date, jd.nm_jns_dok
		FROM ref.peta_katgiat_jnsdok pkj
		LEFT JOIN ref.jenis_dokumen jd ON jd.id_jns_dok = pkj.id_jns_dok
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

	var result []PetaKatgiatJnsdok
	for rows.Next() {
		var p PetaKatgiatJnsdok
		if err := rows.StructScan(&p); err != nil {
			return nil, 0, err
		}
		result = append(result, p)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// PetaKatgiatJnspub
// ============================================================================

func (r *repository) GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error) {
	params.NormalizePagination()

	cb := helper.NewCondBuilder()

	conds, args := cb.Build()
	conds = append(conds, "pk.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.peta_katgiat_jnspub pk
		LEFT JOIN ref.jenis_publikasi jp ON jp.id_jns_pub = pk.id_jns_pub
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "s.id_smt"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			pk.id_katgiat, pk.id_jns_pub, pk.create_date, pk.last_update, pk.expired_date, jp.nm_jns_pub
		FROM ref.peta_katgiat_jnspub pk
		LEFT JOIN ref.jenis_publikasi jp ON jp.id_jns_pub = pk.id_jns_pub
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

	var result []PetaKatgiatJnspub
	for rows.Next() {
		var p PetaKatgiatJnspub
		if err := rows.StructScan(&p); err != nil {
			return nil, 0, err
		}
		result = append(result, p)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}
