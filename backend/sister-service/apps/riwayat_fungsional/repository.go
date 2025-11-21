package riwayat_fungsional

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
	// Riwayat Fungsional operations
	MergeRwyFungsional(rwyFungsional *RwyFungsional) error
	GetRwyFungsionalByID(idRwyJabfung string) (*RwyFungsionalWithDetail, error)
	GetRwyFungsionalList(page, limit int, search, sortBy, sortOrder string) (*RiwayatFungsionalListResult, error)
	GetRwyFungsionalStats() (*RiwayatFungsionalStats, error)

	// Helper operations
	GetAllIDSDMWithRwyFungsional() ([]string, error)
	GetAllActiveDosenIDSDM() ([]string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// MergeRwyFungsional performs MERGE (upsert) operation for rwy_fungsional
func (r *repository) MergeRwyFungsional(rwyFungsional *RwyFungsional) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	skJabfung := truncateStringValue(rwyFungsional.SkJabfung, 60)
	bidangIlmu := truncateString(rwyFungsional.BidangIlmu, 100)

	query := `
		MERGE INTO pdrd.rwy_fungsional WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_jabfung,
				CAST(@p2 AS uniqueidentifier) AS id_sdm,
				CAST(@p3 AS uniqueidentifier) AS id_kel_bidang,
				CAST(@p4 AS int) AS id_jabfung,
				CAST(@p5 AS varchar(60)) AS sk_jabfung,
				CAST(@p6 AS date) AS tmt_sk_jabfung,
				CAST(@p7 AS decimal(10,2)) AS angka_kredit,
				CAST(@p8 AS decimal(10,2)) AS lebih_ajar,
				CAST(@p9 AS decimal(10,2)) AS lebih_lit,
				CAST(@p10 AS decimal(10,2)) AS lebih_pengmas,
				CAST(@p11 AS decimal(10,2)) AS lebih_tunjang,
				CAST(@p12 AS varchar(100)) AS bidang_ilmu,
				CAST(@p13 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_jabfung = source.id_rwy_jabfung
		WHEN MATCHED THEN
			UPDATE SET
				id_sdm = source.id_sdm,
				id_kel_bidang = source.id_kel_bidang,
				id_jabfung = source.id_jabfung,
				sk_jabfung = source.sk_jabfung,
				tmt_sk_jabfung = source.tmt_sk_jabfung,
				angka_kredit = source.angka_kredit,
				lebih_ajar = source.lebih_ajar,
				lebih_lit = source.lebih_lit,
				lebih_pengmas = source.lebih_pengmas,
				lebih_tunjang = source.lebih_tunjang,
				bidang_ilmu = source.bidang_ilmu,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_jabfung, id_sdm, id_kel_bidang, id_jabfung,
				sk_jabfung, tmt_sk_jabfung, angka_kredit,
				lebih_ajar, lebih_lit, lebih_pengmas, lebih_tunjang,
				bidang_ilmu,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_rwy_jabfung, source.id_sdm, source.id_kel_bidang, source.id_jabfung,
				source.sk_jabfung, source.tmt_sk_jabfung, source.angka_kredit,
				source.lebih_ajar, source.lebih_lit, source.lebih_pengmas, source.lebih_tunjang,
				source.bidang_ilmu,
				GETDATE(), source.id_sdm, GETDATE(), source.id_sdm, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		rwyFungsional.IDRwyJabfung,   // @p1
		rwyFungsional.IDSDM,          // @p2
		rwyFungsional.IDKelBidang,    // @p3 - *string pointer, driver handles NULL
		rwyFungsional.IDJabfung,      // @p4
		skJabfung,                    // @p5
		rwyFungsional.TmtSkJabfung,   // @p6
		rwyFungsional.AngkaKredit,    // @p7
		rwyFungsional.LebihAjar,      // @p8
		rwyFungsional.LebihLit,       // @p9
		rwyFungsional.LebihPengmas,   // @p10
		rwyFungsional.LebihTunjang,   // @p11
		bidangIlmu,                   // @p12
		timeutil.NowWIB(),            // @p13
	)

	if err != nil {
		log.Printf("❌ Error merging rwy_fungsional: %v", err)
		return fmt.Errorf("failed to merge rwy_fungsional: %w", err)
	}

	log.Printf("✅ Successfully merged rwy_fungsional: %s", rwyFungsional.IDRwyJabfung)

	return nil
}

// GetRwyFungsionalByID retrieves a single rwy_fungsional by ID with related data
func (r *repository) GetRwyFungsionalByID(idRwyJabfung string) (*RwyFungsionalWithDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			rf.id_rwy_jabfung, rf.id_sdm, rf.id_kel_bidang, rf.id_jabfung,
			rf.sk_jabfung, rf.tmt_sk_jabfung, rf.angka_kredit,
			rf.lebih_ajar, rf.lebih_lit, rf.lebih_pengmas, rf.lebih_tunjang,
			rf.bidang_ilmu,
			rf.create_date, rf.id_creator, rf.last_update, rf.id_updater, rf.soft_delete, rf.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			j.nm_jabfung,
			kb.nm_kel_bidang
		FROM pdrd.rwy_fungsional rf
		LEFT JOIN pdrd.sdm s ON rf.id_sdm = s.id_sdm
		LEFT JOIN ref.jabfung j ON rf.id_jabfung = j.id_jabfung
		LEFT JOIN ref.kelompok_bidang kb ON rf.id_kel_bidang = kb.id_kel_bidang
		WHERE rf.id_rwy_jabfung = @p1 AND rf.soft_delete = 0
	`

	var result RwyFungsionalWithDetail
	err := r.db.GetContext(ctx, &result, query, idRwyJabfung)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rwy_fungsional not found")
		}
		return nil, fmt.Errorf("failed to get rwy_fungsional: %w", err)
	}

	return &result, nil
}

// GetRwyFungsionalList retrieves paginated list of rwy_fungsional
func (r *repository) GetRwyFungsionalList(page, limit int, search, sortBy, sortOrder string) (*RiwayatFungsionalListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	offset := (page - 1) * limit

	// Build WHERE clause
	whereClause := "WHERE rf.soft_delete = 0"
	args := []interface{}{}
	if search != "" {
		whereClause += ` AND (
			s.nm_sdm LIKE @p1 OR
			s.nidn LIKE @p1 OR
			rf.sk_jabfung LIKE @p1 OR
			j.nm_jabfung LIKE @p1 OR
			kb.nm_kel_bidang LIKE @p1
		)`
		args = append(args, "%"+search+"%")
	}

	// Build ORDER BY clause with validation
	orderByClause := "ORDER BY rf.last_sync DESC, rf.tmt_sk_jabfung DESC"
	if sortBy != "" {
		// Map sortable columns
		validSortColumns := map[string]string{
			"last_sync":      "rf.last_sync",
			"nama_dosen":     "s.nm_sdm",
			"nm_jabfung":     "j.nm_jabfung",
			"tmt_sk_jabfung": "rf.tmt_sk_jabfung",
			"angka_kredit":   "rf.angka_kredit",
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
		FROM pdrd.rwy_fungsional rf
		LEFT JOIN pdrd.sdm s ON rf.id_sdm = s.id_sdm
		LEFT JOIN ref.jabfung j ON rf.id_jabfung = j.id_jabfung
		LEFT JOIN ref.kelompok_bidang kb ON rf.id_kel_bidang = kb.id_kel_bidang
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count rwy_fungsional: %w", err)
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			rf.id_rwy_jabfung, rf.id_sdm, rf.id_kel_bidang, rf.id_jabfung,
			rf.sk_jabfung, rf.tmt_sk_jabfung, rf.angka_kredit,
			rf.lebih_ajar, rf.lebih_lit, rf.lebih_pengmas, rf.lebih_tunjang,
			rf.bidang_ilmu,
			rf.create_date, rf.id_creator, rf.last_update, rf.id_updater, rf.soft_delete, rf.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			j.nm_jabfung,
			kb.nm_kel_bidang
		FROM pdrd.rwy_fungsional rf
		LEFT JOIN pdrd.sdm s ON rf.id_sdm = s.id_sdm
		LEFT JOIN ref.jabfung j ON rf.id_jabfung = j.id_jabfung
		LEFT JOIN ref.kelompok_bidang kb ON rf.id_kel_bidang = kb.id_kel_bidang
		%s
		%s
		OFFSET %d ROWS FETCH NEXT %d ROWS ONLY
	`, whereClause, orderByClause, offset, limit)

	var data []*RwyFungsionalWithDetail
	err = r.db.SelectContext(ctx, &data, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_fungsional list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &RiwayatFungsionalListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRwyFungsionalStats retrieves statistics
func (r *repository) GetRwyFungsionalStats() (*RiwayatFungsionalStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(DISTINCT rf.id_rwy_jabfung) AS total_riwayat,
			SUM(CASE WHEN j.nm_jabfung LIKE '%Guru Besar%' OR j.nm_jabfung LIKE '%Profesor%' THEN 1 ELSE 0 END) AS total_profesor,
			SUM(CASE WHEN j.nm_jabfung LIKE '%Lektor Kepala%' THEN 1 ELSE 0 END) AS total_lektor_kepala,
			SUM(CASE WHEN j.nm_jabfung LIKE '%Lektor%' AND j.nm_jabfung NOT LIKE '%Lektor Kepala%' THEN 1 ELSE 0 END) AS total_lektor,
			MAX(rf.last_sync) AS last_sync_date
		FROM pdrd.rwy_fungsional rf
		LEFT JOIN ref.jabfung j ON rf.id_jabfung = j.id_jabfung
		WHERE rf.soft_delete = 0
	`

	var stats RiwayatFungsionalStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_fungsional stats: %w", err)
	}

	return &stats, nil
}

// GetAllIDSDMWithRwyFungsional retrieves all unique id_sdm that have rwy_fungsional records
func (r *repository) GetAllIDSDMWithRwyFungsional() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT id_sdm
		FROM pdrd.rwy_fungsional
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
