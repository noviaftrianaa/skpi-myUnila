package jabatan_struktural

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"sister-service/pkg/timeutil"
)

// truncateString truncates a string pointer to maxLen if it exceeds the limit
func truncateString(s *string, maxLen int) *string {
	if s == nil {
		return nil
	}
	if len(*s) > maxLen {
		truncated := (*s)[:maxLen]
		return &truncated
	}
	return s
}

// truncateStringValue truncates a regular string to maxLen if it exceeds the limit
func truncateStringValue(s string, maxLen int) string {
	if len(s) > maxLen {
		return s[:maxLen]
	}
	return s
}

type Repository interface {
	// Jabatan Struktural operations
	MergeRwyStruktural(rwyStruktural *RwyStruktural) error
	GetRwyStrukturalByID(idRwyJabStruk string) (*RwyStrukturalWithDetail, error)
	GetRwyStrukturalList(page, limit int, search, sortBy, sortOrder string) (*JabatanStrukturalListResult, error)
	GetRwyStrukturalStats() (*JabatanStrukturalStats, error)

	// Helper operations
	GetAllIDSDMWithRwyStruktural() ([]string, error)
	GetAllActiveDosenIDSDM() ([]string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// MergeRwyStruktural performs MERGE (upsert) operation for rwy_struktural
func (r *repository) MergeRwyStruktural(rwyStruktural *RwyStruktural) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	skJabStruk := truncateStringValue(rwyStruktural.SKJabStruk.String, 80)
	lokasiTugas := truncateStringValue(rwyStruktural.LokasiTugas.String, 80)

	query := `
		MERGE INTO pdrd.rwy_struktural WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_jabstruk,
				CAST(@p2 AS uniqueidentifier) AS id_sdm,
				CAST(@p3 AS int) AS id_katgiat,
				CAST(@p4 AS numeric(5,0)) AS id_jab_tgs,
				CAST(@p5 AS varchar(80)) AS sk_jabstruk,
				CAST(@p6 AS date) AS tmt_sk_jabstruk,
				CAST(@p7 AS date) AS tst_sk_jabstruk,
				CAST(@p8 AS varchar(80)) AS lokasi_tugas,
				CAST(@p9 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_jabstruk = source.id_rwy_jabstruk
		WHEN MATCHED THEN
			UPDATE SET
				id_sdm = source.id_sdm,
				id_katgiat = source.id_katgiat,
				id_jab_tgs = source.id_jab_tgs,
				sk_jabstruk = source.sk_jabstruk,
				tmt_sk_jabstruk = source.tmt_sk_jabstruk,
				tst_sk_jabstruk = source.tst_sk_jabstruk,
				lokasi_tugas = source.lokasi_tugas,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_jabstruk, id_sdm, id_katgiat, id_jab_tgs,
				sk_jabstruk, tmt_sk_jabstruk, tst_sk_jabstruk, lokasi_tugas,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_rwy_jabstruk, source.id_sdm, source.id_katgiat, source.id_jab_tgs,
				source.sk_jabstruk, source.tmt_sk_jabstruk, source.tst_sk_jabstruk, source.lokasi_tugas,
				GETDATE(), source.id_sdm, GETDATE(), source.id_sdm, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		rwyStruktural.IDRwyJabStruk,      // @p1
		rwyStruktural.IDSDM,              // @p2
		rwyStruktural.IDKatGiat,          // @p3
		rwyStruktural.IDJabTgs,           // @p4
		skJabStruk,                       // @p5
		rwyStruktural.TmtSKJabStruk,      // @p6
		rwyStruktural.TstSKJabStruk,      // @p7
		lokasiTugas,                      // @p8
		timeutil.NowWIB(),                // @p9
	)

	if err != nil {
		log.Printf("❌ Error merging rwy_struktural: %v", err)
		return fmt.Errorf("failed to merge rwy_struktural: %w", err)
	}

	return nil
}

// GetRwyStrukturalByID retrieves a single rwy_struktural by ID with related data
func (r *repository) GetRwyStrukturalByID(idRwyJabStruk string) (*RwyStrukturalWithDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			rs.id_rwy_jabstruk, rs.id_sdm,
			rs.sk_jabstruk, rs.tmt_sk_jabstruk, rs.tst_sk_jabstruk,
			rs.lokasi_tugas, rs.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			jt.nm_jab_tgs AS nama_jabatan,
			kg.nm_kat AS kategori_kegiatan
		FROM pdrd.rwy_struktural rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON rs.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN ref.kategori_kegiatan kg ON rs.id_katgiat = kg.id_katgiat
		WHERE rs.id_rwy_jabstruk = @p1 AND rs.soft_delete = 0
	`

	var result RwyStrukturalWithDetail
	err := r.db.GetContext(ctx, &result, query, idRwyJabStruk)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rwy_struktural not found")
		}
		return nil, fmt.Errorf("failed to get rwy_struktural: %w", err)
	}

	return &result, nil
}

// GetRwyStrukturalList retrieves paginated list of rwy_struktural
func (r *repository) GetRwyStrukturalList(page, limit int, search, sortBy, sortOrder string) (*JabatanStrukturalListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	offset := (page - 1) * limit

	// Build WHERE clause
	whereClause := "WHERE rs.soft_delete = 0"
	args := []interface{}{}
	if search != "" {
		whereClause += ` AND (
			s.nm_sdm LIKE @p1 OR
			s.nidn LIKE @p1 OR
			rs.sk_jabstruk LIKE @p1 OR
			rs.lokasi_tugas LIKE @p1 OR
			jt.nm_jab_tgs LIKE @p1 OR
			kg.nm_kat LIKE @p1
		)`
		args = append(args, "%"+search+"%")
	}

	// Build ORDER BY clause with validation
	orderByClause := "ORDER BY rs.last_sync DESC, rs.tmt_sk_jabstruk DESC"
	if sortBy != "" {
		// Map sortable columns
		validSortColumns := map[string]string{
			"last_sync":         "rs.last_sync",
			"nama_dosen":        "s.nm_sdm",
			"sk_jabstruk":       "rs.sk_jabstruk",
			"tmt_sk_jabstruk":   "rs.tmt_sk_jabstruk",
			"nama_jabatan":      "jt.nm_jab_tgs",
			"kategori_kegiatan": "kg.nm_kat",
		}

		if sortColumn, ok := validSortColumns[sortBy]; ok {
			order := "DESC"
			if sortOrder == "asc" {
				order = "ASC"
			}
			orderByClause = fmt.Sprintf("ORDER BY %s %s", sortColumn, order)
		}
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.rwy_struktural rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON rs.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN ref.kategori_kegiatan kg ON rs.id_katgiat = kg.id_katgiat
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count rwy_struktural: %w", err)
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			rs.id_rwy_jabstruk, rs.id_sdm,
			rs.sk_jabstruk, rs.tmt_sk_jabstruk, rs.tst_sk_jabstruk,
			rs.lokasi_tugas, rs.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			jt.nm_jab_tgs AS nama_jabatan,
			kg.nm_kat AS kategori_kegiatan
		FROM pdrd.rwy_struktural rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON rs.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN ref.kategori_kegiatan kg ON rs.id_katgiat = kg.id_katgiat
		%s
		%s
		OFFSET %d ROWS FETCH NEXT %d ROWS ONLY
	`, whereClause, orderByClause, offset, limit)

	var data []*RwyStrukturalWithDetail
	err = r.db.SelectContext(ctx, &data, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_struktural list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &JabatanStrukturalListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRwyStrukturalStats retrieves statistics
func (r *repository) GetRwyStrukturalStats() (*JabatanStrukturalStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(DISTINCT rs.id_rwy_jabstruk) AS total_jabatan,
			SUM(CASE WHEN rs.tst_sk_jabstruk IS NULL OR rs.tst_sk_jabstruk > GETDATE() THEN 1 ELSE 0 END) AS total_aktif,
			SUM(CASE WHEN rs.tst_sk_jabstruk IS NOT NULL AND rs.tst_sk_jabstruk <= GETDATE() THEN 1 ELSE 0 END) AS total_selesai,
			MAX(rs.last_sync) AS last_sync_date
		FROM pdrd.rwy_struktural rs
		WHERE rs.soft_delete = 0
	`

	var stats JabatanStrukturalStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_struktural stats: %w", err)
	}

	return &stats, nil
}

// GetAllIDSDMWithRwyStruktural retrieves all unique id_sdm that have rwy_struktural records
func (r *repository) GetAllIDSDMWithRwyStruktural() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT id_sdm
		FROM pdrd.rwy_struktural
		WHERE soft_delete = 0
		ORDER BY id_sdm
	`

	var idSDMList []string
	err := r.db.SelectContext(ctx, &idSDMList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get id_sdm list: %w", err)
	}

	return idSDMList, nil
}

// GetAllActiveDosenIDSDM retrieves all active dosen id_sdm for batch sync
func (r *repository) GetAllActiveDosenIDSDM() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT CONVERT(VARCHAR(36), id_sdm) as id_sdm
		FROM pdrd.sdm WITH (NOLOCK)
		WHERE soft_delete = 0 AND id_sdm IS NOT NULL
		ORDER BY nm_sdm
	`

	var idSDMList []string
	err := r.db.SelectContext(ctx, &idSDMList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query active dosen: %w", err)
	}

	return idSDMList, nil
}
