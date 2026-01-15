package diklat

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

// Repository adalah interface untuk akses data diklat
type Repository interface {
	// Diklat operations
	GetDiklat(ctx context.Context, params DiklatParams) ([]*Diklat, int64, error)
	GetDiklatByID(ctx context.Context, ID string) (*Diklat, error)
	CreateDiklat(ctx context.Context, params DiklatCreateRequest) (string, error)
	UpdateDiklat(ctx context.Context, params DiklatUpdateRequest) (string, error)
	DeleteDiklat(ctx context.Context, IDDiklat string) error
}

type repository struct {
	db *sqlx.DB
}

// NewRepository membuat instance repository baru
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// Get Diklat
// ============================================================================

func (r *repository) GetDiklat(ctx context.Context, params DiklatParams) ([]*Diklat, int64, error) {
	params.NormalizePagination()

	// Build WHERE clause
	conditions := []string{"expired_date IS NULL"}
	args := []interface{}{}
	argIndex := 1

	if params.Tahun != nil {
		conditions = append(conditions, fmt.Sprintf("tahun = @p%d", argIndex))
		args = append(args, *params.Tahun)
		argIndex++
	}

	if params.TglMulai != nil {
		conditions = append(conditions, fmt.Sprintf("tgl_mulai = @p%d", argIndex))
		args = append(args, *params.TglMulai)
		argIndex++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nama_diklat LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sdm.diklat WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count diklat: %w", err)
	}

	// Get data with pagination
	sortBy := "id_diklat"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT id_diklat, jenis_diklat, kategori, bidang_keilmuan, nama_diklat,
		       penyelenggara, tahun, peran, durasi, no_sert,
		       tgl_sert, tempat, tgl_mulai, tgl_selesai, sk_tugas,
		       create_date, last_update, expired_date
		FROM sdm.diklat
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, params.Order, argIndex, argIndex+1)

	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query diklat: %w", err)
	}
	defer rows.Close()

	var diklats []*Diklat
	for rows.Next() {
		s := new(Diklat)
		err := rows.Scan(
			&s.IDDiklat, &s.JenisDiklat, &s.Kategori, &s.BidangKeilmuan, &s.NamaDiklat,
			&s.Penyelenggara, &s.Tahun, &s.Peran, &s.Durasi, &s.NoSert,
			&s.TglSert, &s.Tempat, &s.TglMulai, &s.TglSelesai, &s.SkTugas,
			&s.CreateDate, &s.LastUpdate, &s.ExpiredDate,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan diklat: %w", err)
		}
		diklats = append(diklats, s)
	}

	return diklats, total, nil
}

// ============================================================================
// Get Diklat By ID
// ============================================================================

func (r *repository) GetDiklatByID(ctx context.Context, ID string) (*Diklat, error) {
	query := `
		SELECT id_diklat, jenis_diklat, kategori, bidang_keilmuan, nama_diklat,
		       penyelenggara, tahun, peran, durasi, no_sert,
		       tgl_sert, tempat, tgl_mulai, tgl_selesai, sk_tugas,
		       create_date, last_update, expired_date
		FROM sdm.diklat
		WHERE id_diklat = @p1
		AND expired_date IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, ID)

	var result *Diklat
	if err := row.Scan(
		&result.IDDiklat, &result.JenisDiklat, &result.Kategori, &result.BidangKeilmuan, &result.NamaDiklat,
		&result.Penyelenggara, &result.Tahun, &result.Peran, &result.Durasi, &result.NoSert,
		&result.TglSert, &result.Tempat, &result.TglMulai, &result.TglSelesai, &result.SkTugas,
		&result.CreateDate, &result.LastUpdate, &result.ExpiredDate,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("data diklat tidak ditemukan")
		}
		return nil, fmt.Errorf("scan diklat: %w", err)
	}

	return result, nil
}

// ============================================================================
// Create Diklat
// ============================================================================

func (r *repository) CreateDiklat(ctx context.Context, req DiklatCreateRequest) (string, error) {
	query := `
		INSERT INTO sdm.diklat (
			id_diklat, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat, nm_diklat,
			penyelenggara, thn, peran, tkt, jml_jam,
			no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai,
			sk_tugas, tgl_sk_tugas, create_date, last_update
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6,
			@p7, @p8, @p9, @p10, @p11,
			@p12, @p13, @p14, @p15, @p16,
			@p17, @p18, GETDATE(), GETDATE()
		)
	`

	result, err := r.db.ExecContext(ctx, query,
		req.IDDiklat, req.IDSDM, req.IDKelBidang, req.IDKatGiat, req.IDJnsDiklat, req.NamaDiklat,
		req.Penyelenggara, req.Tahun, req.Peran, req.Tingkat, req.JumlahJam,
		req.NoSertifikat, req.TglSert, req.Tempat, req.TglMulai, req.TglSelesai,
		req.SkTugas, req.TglSkTugas,
	)
	if err != nil {
		return "", fmt.Errorf("create diklat: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return "", fmt.Errorf("get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return "", fmt.Errorf("no rows inserted")
	}

	return req.IDDiklat, nil
}

// ============================================================================
// Update Diklat
// ============================================================================

func (r *repository) UpdateDiklat(ctx context.Context, req DiklatUpdateRequest) (string, error) {
	query := `
		UPDATE sdm.diklat SET
			id_sdm = @p1,
			id_kel_bidang = @p2,
			id_katgiat = @p3,
			id_jns_diklat = @p4,
			nm_diklat = @p5,
			penyelenggara = @p6,
			thn = @p7,
			peran = @p8,
			tkt = @p9,
			jml_jam = @p10,
			no_sert = @p11,
			tgl_sert = @p12,
			tempat = @p13,
			tgl_mulai = @p14,
			tgl_selesai = @p15,
			sk_tugas = @p16,
			tgl_sk_tugas = @p17,
			last_update = GETDATE()
		WHERE id_diklat = @p18
		AND expired_date IS NULL
	`

	result, err := r.db.ExecContext(ctx, query,
		req.IDSDM, req.IDKelBidang, req.IDKatGiat, req.IDJnsDiklat, req.NamaDiklat,
		req.Penyelenggara, req.Tahun, req.Peran, req.Tingkat, req.JumlahJam,
		req.NoSertifikat, req.TglSert, req.Tempat, req.TglMulai, req.TglSelesai,
		req.SkTugas, req.TglSkTugas,
		req.IDDiklat,
	)
	if err != nil {
		return "", fmt.Errorf("update diklat: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return "", fmt.Errorf("get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return "", fmt.Errorf("Data diklat tidak ditemukan")
	}

	return req.IDDiklat, nil
}

// ============================================================================
// Delete Diklat (Soft Delete)
// ============================================================================

func (r *repository) DeleteDiklat(ctx context.Context, IDDiklat string) error {
	query := `
		UPDATE sdm.diklat SET
			expired_date = GETDATE(),
			last_update = GETDATE()
		WHERE id_diklat = @p1
		AND expired_date IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, IDDiklat)
	if err != nil {
		return fmt.Errorf("delete diklat: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("data diklat tidak ditemukan")
	}

	return nil
}
