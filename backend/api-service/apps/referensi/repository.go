package referensi

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

// Repository adalah interface untuk akses data referensi
type Repository interface {
	// Semester
	GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error)

	// Tahun Ajaran
	GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error)

	// Agama
	GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error)

	// Wilayah
	GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository membuat instance repository baru
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// Semester
// ============================================================================

func (r *repository) GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error) {
	params.NormalizePagination()

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.TahunAjaran != nil {
		conditions = append(conditions, fmt.Sprintf("id_thn_ajaran = @p%d", argIndex))
		args = append(args, *params.TahunAjaran)
		argIndex++
	}

	if params.PeriodeAktif != nil {
		conditions = append(conditions, fmt.Sprintf("a_periode_aktif = @p%d", argIndex))
		args = append(args, *params.PeriodeAktif)
		argIndex++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_smt LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.semester WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count semesters: %w", err)
	}

	// Get data with pagination
	sortBy := "id_smt"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif,
		       tgl_mulai, tgl_selesai, create_date, last_update, expired_date
		FROM ref.semester
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, params.Order, argIndex, argIndex+1)

	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query semesters: %w", err)
	}
	defer rows.Close()

	var semesters []Semester
	for rows.Next() {
		var s Semester
		err := rows.Scan(
			&s.IDSmt, &s.IDThnAjaran, &s.NmSmt, &s.Smt, &s.APeriodeAktif,
			&s.TglMulai, &s.TglSelesai, &s.CreateDate, &s.LastUpdate, &s.ExpiredDate,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan semester: %w", err)
		}
		semesters = append(semesters, s)
	}

	return semesters, total, nil
}

// ============================================================================
// Tahun Ajaran
// ============================================================================

func (r *repository) GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error) {
	params.NormalizePagination()

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.PeriodeAktif != nil {
		conditions = append(conditions, fmt.Sprintf("a_periode_aktif = @p%d", argIndex))
		args = append(args, *params.PeriodeAktif)
		argIndex++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_thn_ajaran LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.tahun_ajaran WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count tahun_ajaran: %w", err)
	}

	// Get data
	sortBy := "id_thn_ajaran"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT id_thn_ajaran, nm_thn_ajaran, a_periode_aktif,
		       tgl_mulai, tgl_selesai, create_date, last_update, expired_date
		FROM ref.tahun_ajaran
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, params.Order, argIndex, argIndex+1)

	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query tahun_ajaran: %w", err)
	}
	defer rows.Close()

	var tahunAjarans []TahunAjaran
	for rows.Next() {
		var t TahunAjaran
		err := rows.Scan(
			&t.IDThnAjaran, &t.NmThnAjaran, &t.APeriodeAktif,
			&t.TglMulai, &t.TglSelesai, &t.CreateDate, &t.LastUpdate, &t.ExpiredDate,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan tahun_ajaran: %w", err)
		}
		tahunAjarans = append(tahunAjarans, t)
	}

	return tahunAjarans, total, nil
}

// ============================================================================
// Agama
// ============================================================================

func (r *repository) GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error) {
	params.NormalizePagination()

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_agama LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.agama WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count agama: %w", err)
	}

	// Get data
	sortBy := "id_agama"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT id_agama, nm_agama, create_date, last_update, expired_date
		FROM ref.agama
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, params.Order, argIndex, argIndex+1)

	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query agama: %w", err)
	}
	defer rows.Close()

	var agamas []Agama
	for rows.Next() {
		var a Agama
		err := rows.Scan(
			&a.IDAgama, &a.NmAgama, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan agama: %w", err)
		}
		agamas = append(agamas, a)
	}

	return agamas, total, nil
}

// ============================================================================
// Wilayah
// ============================================================================

func (r *repository) GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error) {
	params.NormalizePagination()

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.Level != nil {
		conditions = append(conditions, fmt.Sprintf("id_level_wil = @p%d", argIndex))
		args = append(args, *params.Level)
		argIndex++
	}

	if params.IDIndukWilayah != nil {
		conditions = append(conditions, fmt.Sprintf("id_induk_wilayah = @p%d", argIndex))
		args = append(args, *params.IDIndukWilayah)
		argIndex++
	}

	if params.IDNegara != nil {
		conditions = append(conditions, fmt.Sprintf("id_negara = @p%d", argIndex))
		args = append(args, *params.IDNegara)
		argIndex++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_wil LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.wilayah WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count wilayah: %w", err)
	}

	// Get data
	sortBy := "id_wil"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri,
		       kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date
		FROM ref.wilayah
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, params.Order, argIndex, argIndex+1)

	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query wilayah: %w", err)
	}
	defer rows.Close()

	var wilayahs []Wilayah
	for rows.Next() {
		var w Wilayah
		err := rows.Scan(
			&w.IDWil, &w.IDNegara, &w.NmWil, &w.AsalWil, &w.KodeBps, &w.KodeDagri,
			&w.KodeKeu, &w.IDIndukWilayah, &w.IDLevelWil, &w.CreateDate, &w.LastUpdate, &w.ExpiredDate,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan wilayah: %w", err)
		}
		wilayahs = append(wilayahs, w)
	}

	return wilayahs, total, nil
}
