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

	// Build WHERE clause - PENTING: soft_delete = 0 (bukan expired_date)
	conditions := []string{"soft_delete = 0"}
	args := []interface{}{}
	argIndex := 1

	if params.IDDiklat != nil {
		conditions = append(conditions, fmt.Sprintf("id_diklat = @p%d", argIndex))
		args = append(args, *params.IDDiklat)
		argIndex++
	}

	if params.IDSDM != nil {
		conditions = append(conditions, fmt.Sprintf("id_sdm = @p%d", argIndex))
		args = append(args, *params.IDSDM)
		argIndex++
	}

	if params.Thn != nil {
		conditions = append(conditions, fmt.Sprintf("thn = @p%d", argIndex))
		args = append(args, *params.Thn)
		argIndex++
	}

	if params.Peran != nil {
		conditions = append(conditions, fmt.Sprintf("peran = @p%d", argIndex))
		args = append(args, *params.Peran)
		argIndex++
	}

	if params.TglMulai != nil {
		conditions = append(conditions, fmt.Sprintf("tgl_mulai >= @p%d", argIndex))
		args = append(args, *params.TglMulai)
		argIndex++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("nm_diklat LIKE @p%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Count total - SCHEMA: pdrd.diklat (bukan sdm.diklat)
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM pdrd.diklat WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count diklat: %w", err)
	}

	// Get data with pagination
	sortBy := "create_date"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT 
			id_diklat, id_sp, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat,
			nm_diklat, penyelenggara, thn, peran, tkt, jml_jam,
			no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai,
			sk_tugas, tgl_sk_tugas, a_valid, tgl_validasi,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.diklat
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
		d := new(Diklat)
		err := rows.Scan(
			&d.IDDiklat, &d.IDSP, &d.IDSDM, &d.IDKelBidang, &d.IDKatGiat, &d.IDJnsDiklat,
			&d.NmDiklat, &d.Penyelenggara, &d.Thn, &d.Peran, &d.Tkt, &d.JmlJam,
			&d.NoSert, &d.TglSert, &d.Tempat, &d.TglMulai, &d.TglSelesai,
			&d.SkTugas, &d.TglSkTugas, &d.AValid, &d.TglValidasi,
			&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater, &d.SoftDelete, &d.LastSync,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan diklat: %w", err)
		}
		diklats = append(diklats, d)
	}

	return diklats, total, nil
}

// ============================================================================
// Get Diklat By ID
// ============================================================================

func (r *repository) GetDiklatByID(ctx context.Context, ID string) (*Diklat, error) {
	query := `
		SELECT 
			id_diklat, id_sp, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat,
			nm_diklat, penyelenggara, thn, peran, tkt, jml_jam,
			no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai,
			sk_tugas, tgl_sk_tugas, a_valid, tgl_validasi,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.diklat
		WHERE id_diklat = @p1
		AND soft_delete = 0
	`

	d := new(Diklat)
	err := r.db.QueryRowContext(ctx, query, ID).Scan(
		&d.IDDiklat, &d.IDSP, &d.IDSDM, &d.IDKelBidang, &d.IDKatGiat, &d.IDJnsDiklat,
		&d.NmDiklat, &d.Penyelenggara, &d.Thn, &d.Peran, &d.Tkt, &d.JmlJam,
		&d.NoSert, &d.TglSert, &d.Tempat, &d.TglMulai, &d.TglSelesai,
		&d.SkTugas, &d.TglSkTugas, &d.AValid, &d.TglValidasi,
		&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater, &d.SoftDelete, &d.LastSync,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("data diklat tidak ditemukan")
		}
		return nil, fmt.Errorf("scan diklat: %w", err)
	}

	return d, nil
}

// ============================================================================
// Create Diklat
// ============================================================================

func (r *repository) CreateDiklat(ctx context.Context, req DiklatCreateRequest) (string, error) {
	query := `
		INSERT INTO pdrd.diklat (
			id_diklat, id_sp, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat,
			nm_diklat, penyelenggara, thn, peran, tkt, jml_jam,
			no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai,
			sk_tugas, tgl_sk_tugas, 
			create_date, id_creator, last_update, soft_delete, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6,
			@p7, @p8, @p9, @p10, @p11, @p12,
			@p13, @p14, @p15, @p16, @p17,
			@p18, @p19,
			GETDATE(), @p20, GETDATE(), 0, GETDATE()
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		req.IDDiklat, req.IDSP, req.IDSDM, req.IDKelBidang, req.IDKatGiat, req.IDJnsDiklat,
		req.NmDiklat, req.Penyelenggara, req.Thn, req.Peran, req.Tkt, req.JmlJam,
		req.NoSert, req.TglSert, req.Tempat, req.TglMulai, req.TglSelesai,
		req.SkTugas, req.TglSkTugas,
		req.IDCreator,
	)
	if err != nil {
		return "", fmt.Errorf("create diklat: %w", err)
	}

	return req.IDDiklat, nil
}

// ============================================================================
// Update Diklat
// ============================================================================

func (r *repository) UpdateDiklat(ctx context.Context, req DiklatUpdateRequest) (string, error) {
	query := `
		UPDATE pdrd.diklat SET
			id_sp = @p1,
			id_sdm = @p2,
			id_kel_bidang = @p3,
			id_katgiat = @p4,
			id_jns_diklat = @p5,
			nm_diklat = @p6,
			penyelenggara = @p7,
			thn = @p8,
			peran = @p9,
			tkt = @p10,
			jml_jam = @p11,
			no_sert = @p12,
			tgl_sert = @p13,
			tempat = @p14,
			tgl_mulai = @p15,
			tgl_selesai = @p16,
			sk_tugas = @p17,
			tgl_sk_tugas = @p18,
			last_update = GETDATE(),
			id_updater = @p19
		WHERE id_diklat = @p20
		AND soft_delete = 0
	`

	result, err := r.db.ExecContext(ctx, query,
		req.IDSP, req.IDSDM, req.IDKelBidang, req.IDKatGiat, req.IDJnsDiklat,
		req.NmDiklat, req.Penyelenggara, req.Thn, req.Peran, req.Tkt, req.JmlJam,
		req.NoSert, req.TglSert, req.Tempat, req.TglMulai, req.TglSelesai,
		req.SkTugas, req.TglSkTugas,
		req.IDUpdater,
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
		return "", fmt.Errorf("data diklat tidak ditemukan")
	}

	return req.IDDiklat, nil
}

// ============================================================================
// Delete Diklat (Soft Delete)
// ============================================================================
// Delete Diklat (Soft Delete)
// ============================================================================

func (r *repository) DeleteDiklat(ctx context.Context, IDDiklat string) error {
	query := `
		UPDATE pdrd.diklat SET
			soft_delete = 1,
			last_update = GETDATE()
		WHERE id_diklat = @p1
		AND soft_delete = 0
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
