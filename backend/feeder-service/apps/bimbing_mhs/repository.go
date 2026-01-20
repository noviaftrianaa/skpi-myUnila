package bimbing_mhs

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetList(ctx context.Context, filter *ListFilter) (*BimbingMhsListResult, error)
	GetStats(ctx context.Context) (*BimbingMhsStats, error)
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	UpsertSingle(ctx context.Context, item *BimbingMhs) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ListFilter - Filter for list query
type ListFilter struct {
	Page       int     `query:"page"`
	Limit      int     `query:"limit"`
	Search     string  `query:"search"`
	IDProdi    *string `query:"id_prodi"`
	OrderBy    string  `query:"order_by"`
	OrderDir   string  `query:"order_dir"`
}

// convertToWIB converts UTC time to WIB (UTC+7)
func convertToWIB(t time.Time) time.Time {
	wib := time.FixedZone("WIB", 7*60*60)
	return t.In(wib)
}

func (r *repository) GetList(ctx context.Context, filter *ListFilter) (*BimbingMhsListResult, error) {
	// Set defaults
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	// Build WHERE conditions
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "bm.soft_delete = 0")

	// Filter by prodi (through akt_mhs)
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("am.id_sms = @p%d", argIndex))
		args = append(args, *filter.IDProdi)
		argIndex++
	}

	// Search by NIDN, nama dosen, NIM, nama mahasiswa, or judul aktivitas
	// Use subquery for anggota_akt_mhs to avoid join issues
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf(`(
			s.nidn LIKE @p%d OR
			s.nm_sdm LIKE @p%d OR
			am.judul_akt_mhs LIKE @p%d OR
			EXISTS (
				SELECT 1 FROM pdrd.anggota_akt_mhs aam_search
				WHERE aam_search.id_akt_mhs = bm.id_akt_mhs
				AND aam_search.soft_delete = 0
				AND (aam_search.nipd LIKE @p%d OR aam_search.nm_pd LIKE @p%d)
			)
		)`, argIndex, argIndex+1, argIndex+2, argIndex+3, argIndex+4))
		searchPattern := "%" + filter.Search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
		argIndex += 5
	}

	whereClause := strings.Join(conditions, " AND ")

	// Build main query with JOINs to get related info
	query := fmt.Sprintf(`
		SELECT
			CAST(bm.id_bimb_mhs AS VARCHAR(50)) AS id_bimb_mhs,
			CAST(bm.id_sdm AS VARCHAR(50)) AS id_sdm,
			CAST(bm.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			bm.urutan_promotor,
			s.nidn,
			s.nm_sdm AS nama_dosen,
			am.judul_akt_mhs AS judul_aktivitas,
			jak.nm_jns_akt_mhs AS jenis_aktivitas,
			aam.nm_pd AS nama_mahasiswa,
			aam.nipd AS nim,
			sms.nm_lemb AS nama_prodi,
			bm.last_sync
		FROM pdrd.bimbing_mhs AS bm WITH(NOLOCK)
		LEFT JOIN pdrd.sdm AS s WITH(NOLOCK) ON s.id_sdm = bm.id_sdm AND s.soft_delete = 0
		LEFT JOIN pdrd.akt_mhs AS am WITH(NOLOCK) ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
		LEFT JOIN ref.jenis_akt_mhs AS jak WITH(NOLOCK) ON jak.id_jns_akt_mhs = am.id_jns_akt_mhs
		LEFT JOIN pdrd.anggota_akt_mhs AS aam WITH(NOLOCK) ON aam.id_akt_mhs = bm.id_akt_mhs AND aam.soft_delete = 0
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = am.id_sms AND sms.soft_delete = 0
		WHERE %s
	`, whereClause)

	// Order by
	orderBy := "bm.last_sync"
	orderDir := "DESC"
	if filter.OrderBy != "" {
		switch filter.OrderBy {
		case "nidn":
			orderBy = "s.nidn"
		case "nama_dosen":
			orderBy = "s.nm_sdm"
		case "nim":
			orderBy = "aam.nipd"
		case "nama_mahasiswa":
			orderBy = "aam.nm_pd"
		case "judul_aktivitas":
			orderBy = "am.judul_akt_mhs"
		case "urutan_promotor":
			orderBy = "bm.urutan_promotor"
		case "last_sync":
			orderBy = "bm.last_sync"
		}
	}
	if filter.OrderDir != "" && (strings.ToUpper(filter.OrderDir) == "ASC" || strings.ToUpper(filter.OrderDir) == "DESC") {
		orderDir = strings.ToUpper(filter.OrderDir)
	}

	// Count query - no need for anggota_akt_mhs join since search uses EXISTS subquery
	countQuery := fmt.Sprintf(`
		SELECT COUNT(DISTINCT bm.id_bimb_mhs)
		FROM pdrd.bimbing_mhs AS bm WITH(NOLOCK)
		LEFT JOIN pdrd.sdm AS s WITH(NOLOCK) ON s.id_sdm = bm.id_sdm AND s.soft_delete = 0
		LEFT JOIN pdrd.akt_mhs AS am WITH(NOLOCK) ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count bimbing_mhs: %w", err)
	}

	// Add GROUP BY and pagination (GROUP BY to avoid duplicates from anggota_akt_mhs join)
	offset := (filter.Page - 1) * filter.Limit
	query = fmt.Sprintf(`
		SELECT DISTINCT
			CAST(bm.id_bimb_mhs AS VARCHAR(50)) AS id_bimb_mhs,
			CAST(bm.id_sdm AS VARCHAR(50)) AS id_sdm,
			CAST(bm.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			bm.urutan_promotor,
			s.nidn,
			s.nm_sdm AS nama_dosen,
			am.judul_akt_mhs AS judul_aktivitas,
			jak.nm_jns_akt_mhs AS jenis_aktivitas,
			(SELECT TOP 1 aam2.nm_pd FROM pdrd.anggota_akt_mhs aam2 WHERE aam2.id_akt_mhs = bm.id_akt_mhs AND aam2.soft_delete = 0) AS nama_mahasiswa,
			(SELECT TOP 1 aam2.nipd FROM pdrd.anggota_akt_mhs aam2 WHERE aam2.id_akt_mhs = bm.id_akt_mhs AND aam2.soft_delete = 0) AS nim,
			sms.nm_lemb AS nama_prodi,
			bm.last_sync
		FROM pdrd.bimbing_mhs AS bm WITH(NOLOCK)
		LEFT JOIN pdrd.sdm AS s WITH(NOLOCK) ON s.id_sdm = bm.id_sdm AND s.soft_delete = 0
		LEFT JOIN pdrd.akt_mhs AS am WITH(NOLOCK) ON am.id_akt_mhs = bm.id_akt_mhs AND am.soft_delete = 0
		LEFT JOIN ref.jenis_akt_mhs AS jak WITH(NOLOCK) ON jak.id_jns_akt_mhs = am.id_jns_akt_mhs
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = am.id_sms AND sms.soft_delete = 0
		WHERE %s
		ORDER BY %s %s
		OFFSET %d ROWS FETCH NEXT %d ROWS ONLY
	`, whereClause, orderBy, orderDir, offset, filter.Limit)

	var items []*BimbingMhsListItem
	err = r.db.SelectContext(ctx, &items, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get bimbing_mhs list: %w", err)
	}

	// Convert times to WIB
	for _, item := range items {
		if item.LastSync != nil {
			converted := convertToWIB(*item.LastSync)
			item.LastSync = &converted
		}
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit

	return &BimbingMhsListResult{
		Data:       items,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetStats(ctx context.Context) (*BimbingMhsStats, error) {
	stats := &BimbingMhsStats{}

	// Get total bimbingan
	err := r.db.GetContext(ctx, &stats.TotalBimbingan, `
		SELECT COUNT(*) FROM pdrd.bimbing_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total bimbingan: %w", err)
	}

	// Get total unique dosen
	err = r.db.GetContext(ctx, &stats.TotalDosen, `
		SELECT COUNT(DISTINCT id_sdm) FROM pdrd.bimbing_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total dosen: %w", err)
	}

	// Get total unique aktivitas
	err = r.db.GetContext(ctx, &stats.TotalAktivitas, `
		SELECT COUNT(DISTINCT id_akt_mhs) FROM pdrd.bimbing_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total aktivitas: %w", err)
	}

	// Get total unique mahasiswa (through anggota_akt_mhs)
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(DISTINCT aam.id_reg_pd)
		FROM pdrd.bimbing_mhs AS bm WITH(NOLOCK)
		INNER JOIN pdrd.anggota_akt_mhs AS aam WITH(NOLOCK) ON aam.id_akt_mhs = bm.id_akt_mhs AND aam.soft_delete = 0
		WHERE bm.soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Get last sync
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM pdrd.bimbing_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get last sync: %w", err)
	}

	if lastSync != nil {
		converted := convertToWIB(*lastSync)
		stats.LastSync = &converted
	}

	return stats, nil
}

// GetProdiList returns list of active prodi
func (r *repository) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT
			CAST(sms.id_sms AS VARCHAR(50)) AS id_sms,
			sms.nm_lemb AS nama_prodi,
			sms.kode_prodi,
			sms.id_jenj_didik,
			didik.nm_jenj_didik,
			CAST(sms.id_sp AS VARCHAR(50)) AS id_sp,
			sms.stat_prodi
		FROM pdrd.sms AS sms
		INNER JOIN ref.jenjang_pendidikan AS didik
			ON didik.id_jenj_didik = sms.id_jenj_didik
			AND didik.expired_date IS NULL
		WHERE sms.soft_delete = 0
			AND sms.stat_prodi = 'A'
			AND sms.id_jns_sms = 3
			AND sms.id_sp = CAST('e2b705a7-173e-464a-9fac-509128709515' AS UNIQUEIDENTIFIER)
		ORDER BY sms.nm_lemb ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var results []map[string]interface{}
	columns, _ := rows.Columns()

	for rows.Next() {
		values := make([]interface{}, len(columns))
		pointers := make([]interface{}, len(columns))
		for i := range values {
			pointers[i] = &values[i]
		}

		if err := rows.Scan(pointers...); err != nil {
			return nil, fmt.Errorf("failed to scan prodi row: %w", err)
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			if b, ok := val.([]byte); ok {
				row[col] = string(b)
			} else {
				row[col] = val
			}
		}
		results = append(results, row)
	}

	return results, nil
}

// UpsertSingle performs single record upsert with UUID validation and FK constraint handling
func (r *repository) UpsertSingle(ctx context.Context, item *BimbingMhs) error {
	query := `
		DECLARE @id_bimb_mhs UNIQUEIDENTIFIER = TRY_CAST(@p1 AS UNIQUEIDENTIFIER);
		DECLARE @id_sdm UNIQUEIDENTIFIER = TRY_CAST(@p2 AS UNIQUEIDENTIFIER);
		DECLARE @id_akt_mhs UNIQUEIDENTIFIER = TRY_CAST(@p3 AS UNIQUEIDENTIFIER);
		DECLARE @id_katgiat INT = @p4;
		DECLARE @urutan_promotor INT = @p5;
		DECLARE @last_sync DATETIME = @p6;

		-- Check if required UUIDs are valid
		IF @id_bimb_mhs IS NULL OR @id_sdm IS NULL OR @id_akt_mhs IS NULL
		BEGIN
			RAISERROR('INVALID_UUID', 16, 1);
			RETURN;
		END

		-- Check if id_sdm exists in sdm table
		IF NOT EXISTS (SELECT 1 FROM pdrd.sdm WHERE id_sdm = @id_sdm)
		BEGIN
			RAISERROR('FK_SDM_NOT_FOUND', 16, 1);
			RETURN;
		END

		-- Check if id_akt_mhs exists in akt_mhs table
		IF NOT EXISTS (SELECT 1 FROM pdrd.akt_mhs WHERE id_akt_mhs = @id_akt_mhs)
		BEGIN
			RAISERROR('FK_AKT_MHS_NOT_FOUND', 16, 1);
			RETURN;
		END

		MERGE pdrd.bimbing_mhs AS target
		USING (SELECT
			@id_bimb_mhs AS id_bimb_mhs,
			@id_katgiat AS id_katgiat,
			@id_sdm AS id_sdm,
			@id_akt_mhs AS id_akt_mhs,
			@urutan_promotor AS urutan_promotor,
			@last_sync AS last_sync
		) AS source
		ON target.id_bimb_mhs = source.id_bimb_mhs
		WHEN MATCHED THEN
			UPDATE SET
				id_katgiat = source.id_katgiat,
				id_sdm = source.id_sdm,
				id_akt_mhs = source.id_akt_mhs,
				urutan_promotor = source.urutan_promotor,
				last_update = GETUTCDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (id_bimb_mhs, id_katgiat, id_sdm, id_akt_mhs, urutan_promotor, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (source.id_bimb_mhs, source.id_katgiat, source.id_sdm, source.id_akt_mhs, source.urutan_promotor, GETUTCDATE(), '00000000-0000-0000-0000-000000000000', GETUTCDATE(), 0, source.last_sync);
	`

	_, err := r.db.ExecContext(ctx, query,
		item.IDBimbMhs,      // @p1
		item.IDSDM,          // @p2
		item.IDAktMhs,       // @p3
		item.IDKatGiat,      // @p4
		item.UrutanPromotor, // @p5
		item.LastSync,       // @p6
	)

	return err
}
