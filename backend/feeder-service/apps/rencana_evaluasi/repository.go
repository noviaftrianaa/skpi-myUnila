package rencana_evaluasi

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for rencana_evaluasi data access
type Repository interface {
	// Bulk operations
	BulkUpsertRencanaEvaluasi(ctx context.Context, data []*RencanaEvaluasi) error
	BulkUpsertJenisEvaluasi(ctx context.Context, data []*JenisEvaluasi) error

	// List operations with filters
	GetRencanaEvaluasiList(ctx context.Context, page, limit int, search string, idMatkul *string, idProdi *string, sortBy, sortOrder string) (*RencanaEvaluasiListResult, error)
	GetRencanaEvaluasiByID(ctx context.Context, idReMk string) (*RencanaEvaluasi, error)

	// Utility
	GetJenisEvaluasiList(ctx context.Context) ([]*JenisEvaluasi, error)

	// Stats operations
	GetStats(ctx context.Context) (*RencanaEvaluasiStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new rencana_evaluasi repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertRencanaEvaluasi performs bulk upsert for rencana evaluasi
func (r *repository) BulkUpsertRencanaEvaluasi(ctx context.Context, data []*RencanaEvaluasi) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.re_mk AS target
		USING (SELECT @p1 AS id_re_mk) AS source
		ON target.id_re_mk = CAST(source.id_re_mk AS UNIQUEIDENTIFIER)
		WHEN MATCHED THEN
			UPDATE SET
				id_jns_eval = COALESCE(@p2, target.id_jns_eval),
				id_mk = COALESCE(CAST(@p3 AS UNIQUEIDENTIFIER), target.id_mk),
				no_urut = COALESCE(@p4, target.no_urut),
				komponen_evaluasi = COALESCE(@p5, target.komponen_evaluasi),
				desk_indo = COALESCE(@p6, target.desk_indo),
				desk_ing = COALESCE(@p7, target.desk_ing),
				bobot_evaluasi = COALESCE(@p8, target.bobot_evaluasi),
				last_update = @p9,
				id_updater = @p13,
				last_sync = @p10
		WHEN NOT MATCHED THEN
			INSERT (
				id_re_mk, id_jns_eval, id_mk, no_urut, komponen_evaluasi,
				desk_indo, desk_ing, bobot_evaluasi,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), @p2, CAST(@p3 AS UNIQUEIDENTIFIER), @p4, @p5,
				@p6, @p7, @p8,
				@p11, @p12, @p9, @p13, @p14, @p10
			);
	`

	for _, re := range data {
		var idMk interface{}
		if re.IDMk != nil {
			idMk = *re.IDMk
		}

		_, err = tx.ExecContext(ctx, query,
			re.IDReMk,           // @p1
			re.IDJnsEval,        // @p2
			idMk,                // @p3
			re.NoUrut,           // @p4
			re.KomponenEvaluasi, // @p5
			re.DeskIndo,         // @p6
			re.DeskIng,          // @p7
			re.BobotEvaluasi,    // @p8
			re.LastUpdate,       // @p9 - for UPDATE
			re.LastSync,         // @p10 - for both
			re.CreateDate,       // @p11 - for INSERT
			re.IDCreator,        // @p12 - for INSERT
			re.IDUpdater,        // @p13 - for both
			re.SoftDelete,       // @p14 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert rencana_evaluasi %s: %w", re.IDReMk, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertJenisEvaluasi performs bulk upsert for jenis evaluasi
func (r *repository) BulkUpsertJenisEvaluasi(ctx context.Context, data []*JenisEvaluasi) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE ref.jenis_evaluasi AS target
		USING (SELECT @p1 AS id_jns_eval) AS source
		ON target.id_jns_eval = source.id_jns_eval
		WHEN MATCHED THEN
			UPDATE SET
				nm_jns_eval = @p2,
				last_update = @p3,
				last_sync = @p4
		WHEN NOT MATCHED THEN
			INSERT (
				id_jns_eval, nm_jns_eval, create_date, last_update, last_sync
			)
			VALUES (
				@p1, @p2, @p5, @p3, @p4
			);
	`

	for _, je := range data {
		_, err = tx.ExecContext(ctx, query,
			je.IDJnsEval,  // @p1
			je.NmJnsEval,  // @p2
			je.LastUpdate, // @p3 - for UPDATE
			je.LastSync,   // @p4 - for both
			je.CreateDate, // @p5 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_evaluasi %d: %w", je.IDJnsEval, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetRencanaEvaluasiList retrieves paginated list with filters
func (r *repository) GetRencanaEvaluasiList(ctx context.Context, page, limit int, search string, idMatkul *string, idProdi *string, sortBy, sortOrder string) (*RencanaEvaluasiListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"re.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Filter by prodi (via matkul.id_sms)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("m.id_sms = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Filter by matkul
	if idMatkul != nil && *idMatkul != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("re.id_mk = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idMatkul)
		paramIndex++
	}

	// Search filter (search by nama matkul, komponen evaluasi, or desk_indo)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(m.nm_mk LIKE @p%d OR re.komponen_evaluasi LIKE @p%d OR re.desk_indo LIKE @p%d)", paramIndex, paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Build ORDER BY clause
	orderByClause := "re.no_urut ASC, m.nm_mk ASC" // Default
	if sortBy != "" {
		var dbColumn string
		switch sortBy {
			case "nm_mk":
				dbColumn = "m.nm_mk"
			case "no_urut":
				dbColumn = "re.no_urut"
			case "bobot_evaluasi":
				dbColumn = "re.bobot_evaluasi"
			case "komponen_evaluasi":
				dbColumn = "re.komponen_evaluasi"
			case "last_sync":
				dbColumn = "re.last_sync"
			default:
				dbColumn = ""
		}

		order := "ASC"
		if sortOrder == "desc" || sortOrder == "DESC" {
			order = "DESC"
		}

		if dbColumn != "" {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.re_mk AS re WITH(NOLOCK)
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON CAST(m.id_mk AS VARCHAR(50)) = CAST(re.id_mk AS VARCHAR(50)) AND m.soft_delete = 0
		WHERE %s
	`, whereClause)

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			CAST(re.id_re_mk AS VARCHAR(50)) AS id_re_mk,
			re.id_jns_eval,
			je.nm_jns_eval AS jenis_evaluasi,
			CAST(re.id_mk AS VARCHAR(50)) AS id_mk,
			m.kode_mk AS kode_matkul,
			m.nm_mk AS nama_matkul,
			m.sks_mk AS sks_matkul,
			re.no_urut,
			re.komponen_evaluasi,
			re.desk_indo,
			re.desk_ing,
			re.bobot_evaluasi,
			re.last_sync
		FROM pdrd.re_mk AS re WITH(NOLOCK)
		LEFT JOIN ref.jenis_evaluasi je WITH(NOLOCK) ON je.id_jns_eval = re.id_jns_eval
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON CAST(m.id_mk AS VARCHAR(50)) = CAST(re.id_mk AS VARCHAR(50)) AND m.soft_delete = 0
		WHERE %s
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, orderByClause, paramIndex, paramIndex+1)

	// Add pagination parameters
	dataArgs := append(args, offset, limit)

	// Execute queries in parallel
	type countResult struct {
		total int
		err   error
	}
	type dataResult struct {
		data []*RencanaEvaluasiListItem
		err  error
	}

	countChan := make(chan countResult, 1)
	dataChan := make(chan dataResult, 1)

	go func() {
		var total int
		err := r.db.GetContext(ctx, &total, countQuery, args...)
		countChan <- countResult{total: total, err: err}
	}()

	go func() {
		var reList []*RencanaEvaluasiListItem
		err := r.db.SelectContext(ctx, &reList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: reList, err: err}
	}()

	countRes := <-countChan
	dataRes := <-dataChan

	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count rencana evaluasi: %w", countRes.err)
	}
	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get rencana evaluasi list: %w", dataRes.err)
	}

	// Convert timestamps to WIB
	for _, item := range dataRes.data {
		item.LastSync = convertToWIB(item.LastSync)
	}

	totalPages := (countRes.total + limit - 1) / limit

	return &RencanaEvaluasiListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRencanaEvaluasiByID retrieves a single rencana evaluasi by ID
func (r *repository) GetRencanaEvaluasiByID(ctx context.Context, idReMk string) (*RencanaEvaluasi, error) {
	query := `
		SELECT
			CAST(id_re_mk AS VARCHAR(50)) AS id_re_mk,
			id_jns_eval,
			CAST(id_mk AS VARCHAR(50)) AS id_mk,
			no_urut,
			komponen_evaluasi,
			desk_indo,
			desk_ing,
			bobot_evaluasi,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.re_mk
		WHERE id_re_mk = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var re RencanaEvaluasi
	err := r.db.GetContext(ctx, &re, query, idReMk)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rencana evaluasi not found")
		}
		return nil, fmt.Errorf("failed to get rencana evaluasi: %w", err)
	}

	re.CreateDate = convertToWIB(re.CreateDate)
	re.LastUpdate = convertToWIB(re.LastUpdate)
	re.LastSync = convertToWIB(re.LastSync)

	return &re, nil
}

// GetJenisEvaluasiList retrieves list of jenis evaluasi
func (r *repository) GetJenisEvaluasiList(ctx context.Context) ([]*JenisEvaluasi, error) {
	query := `
		SELECT
			id_jns_eval,
			nm_jns_eval,
			create_date,
			last_update,
			last_sync
		FROM ref.jenis_evaluasi
		ORDER BY id_jns_eval ASC
	`

	var jeList []*JenisEvaluasi
	err := r.db.SelectContext(ctx, &jeList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get jenis evaluasi list: %w", err)
	}

	for _, je := range jeList {
		je.CreateDate = convertToWIB(je.CreateDate)
		je.LastUpdate = convertToWIB(je.LastUpdate)
		je.LastSync = convertToWIB(je.LastSync)
	}

	return jeList, nil
}

// GetStats retrieves statistics for rencana evaluasi
func (r *repository) GetStats(ctx context.Context) (*RencanaEvaluasiStats, error) {
	query := `
		SELECT
			COUNT(DISTINCT re.id_re_mk) AS total_rencana_evaluasi,
			COUNT(DISTINCT re.id_mk) AS total_matkul,
			(SELECT COUNT(*) FROM ref.jenis_evaluasi) AS total_jenis_evaluasi,
			MAX(re.last_sync) AS last_sync
		FROM pdrd.re_mk AS re
		WHERE re.soft_delete = 0
	`

	var stats RencanaEvaluasiStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	if stats.LastSync != nil {
		converted := convertToWIB(*stats.LastSync)
		stats.LastSync = &converted
	}

	return &stats, nil
}
