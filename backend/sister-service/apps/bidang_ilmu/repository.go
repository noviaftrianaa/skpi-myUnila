package bidang_ilmu

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface defines the data access methods
type Repository interface {
	// Bidang Ilmu mapping operations
	DeleteBidangIlmuBySDM(idSDM string) error
	InsertBidangIlmu(mapping *MapSDMBidang) error

	// Query operations
	GetStats() (*BidangIlmuStats, error)
	GetList(page, limit int, search, sortBy, sortOrder string) (*BidangIlmuListResult, error)
	GetByIDSDM(idSDM string) ([]BidangIlmuListItem, error)

	// Reference data
	GetKelompokBidangMap() (map[string]string, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new repository instance
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// DeleteBidangIlmuBySDM soft deletes all bidang ilmu mappings for a dosen
func (r *repository) DeleteBidangIlmuBySDM(idSDM string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		UPDATE pdrd.map_sdm_bidang
		SET soft_delete = 1,
		    last_update = GETDATE()
		WHERE id_sdm = @p1
		  AND soft_delete = 0
	`

	_, err := r.db.ExecContext(ctx, query, idSDM)
	if err != nil {
		return fmt.Errorf("failed to soft delete bidang ilmu for dosen %s: %w", idSDM, err)
	}

	return nil
}

// InsertBidangIlmu inserts a new bidang ilmu mapping
func (r *repository) InsertBidangIlmu(mapping *MapSDMBidang) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Use SELECT with explicit CAST pattern like pendidikan formal module
	query := `
		INSERT INTO pdrd.map_sdm_bidang (
			id_sdm, id_kel_bidang, urutan,
			create_date, id_creator, last_update,
			soft_delete, last_sync
		)
		SELECT
			CAST(@p1 AS uniqueidentifier),
			CAST(@p2 AS uniqueidentifier),
			CAST(@p3 AS numeric(32)),
			CAST(@p4 AS datetime),
			CAST(@p5 AS uniqueidentifier),
			CAST(@p6 AS datetime),
			CAST(@p7 AS numeric(1)),
			CAST(@p8 AS datetime)
	`

	_, err := r.db.ExecContext(ctx, query,
		mapping.IDSDM,
		mapping.IDKelBidang,
		mapping.Urutan,
		mapping.CreateDate,
		mapping.IDCreator,
		mapping.LastUpdate,
		mapping.SoftDelete,
		mapping.LastSync,
	)

	if err != nil {
		return fmt.Errorf("failed to insert bidang ilmu mapping: %w", err)
	}

	return nil
}

// GetStats retrieves bidang ilmu statistics
func (r *repository) GetStats() (*BidangIlmuStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(DISTINCT id_sdm) as total_dosen,
			COUNT(*) as total_bidang_ilmu,
			MAX(last_sync) as last_sync_date
		FROM pdrd.map_sdm_bidang
		WHERE soft_delete = 0
	`

	var stats BidangIlmuStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get bidang ilmu stats: %w", err)
	}

	return &stats, nil
}

// GetList retrieves paginated list of bidang ilmu mappings with dosen info
func (r *repository) GetList(page, limit int, search, sortBy, sortOrder string) (*BidangIlmuListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	log.Printf("🔍 Repository GetList - page: %d, limit: %d, search: '%s', sort_by: %s, sort_order: %s",
		page, limit, search, sortBy, sortOrder)

	offset := (page - 1) * limit

	// Validate sort parameters
	validSortColumns := map[string]bool{
		"nama_dosen":  true,
		"nidn":        true,
		"nama_bidang": true,
		"urutan":      true,
		"last_sync":   true,
	}

	if sortBy == "" || !validSortColumns[sortBy] {
		sortBy = "last_sync"
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Build WHERE clause for search
	whereClause := "WHERE msb.soft_delete = 0"
	searchParam := ""
	if search != "" {
		whereClause += ` AND (
			s.nm_sdm LIKE '%' + @search + '%' OR
			s.nidn LIKE '%' + @search + '%' OR
			kb.nm_kel_bidang LIKE '%' + @search + '%'
		)`
		searchParam = search
	}

	// Count total records
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.map_sdm_bidang msb
		LEFT JOIN pdrd.sdm s ON msb.id_sdm = s.id_sdm
		LEFT JOIN ref.kelompok_bidang kb ON msb.id_kel_bidang = kb.id_kel_bidang
		%s
	`, whereClause)

	var total int
	if search != "" {
		err := r.db.GetContext(ctx, &total, countQuery, sql.Named("search", searchParam))
		if err != nil {
			return nil, fmt.Errorf("failed to count bidang ilmu records: %w", err)
		}
	} else {
		err := r.db.GetContext(ctx, &total, countQuery)
		if err != nil {
			return nil, fmt.Errorf("failed to count bidang ilmu records: %w", err)
		}
	}

	// Get paginated data with recursive CTE for bidang ilmu hierarchy
	dataQuery := fmt.Sprintf(`
		WITH BidangHierarchy AS (
			-- Base case: get the leaf node
			SELECT
				id_kel_bidang,
				kode_kel_bidang,
				nm_kel_bidang,
				id_induk_bidang,
				CAST(nm_kel_bidang AS VARCHAR(MAX)) as full_hierarchy,
				0 as level
			FROM ref.kelompok_bidang
			WHERE id_kel_bidang IN (SELECT id_kel_bidang FROM pdrd.map_sdm_bidang WHERE soft_delete = 0)

			UNION ALL

			-- Recursive case: traverse up to parent nodes
			SELECT
				kb.id_kel_bidang,
				kb.kode_kel_bidang,
				kb.nm_kel_bidang,
				kb.id_induk_bidang,
				CAST(kb.nm_kel_bidang + ' -- ' + bh.full_hierarchy AS VARCHAR(MAX)),
				bh.level + 1
			FROM ref.kelompok_bidang kb
			INNER JOIN BidangHierarchy bh ON kb.id_kel_bidang = bh.id_induk_bidang
		)
		SELECT
			msb.id_sdm,
			s.nm_sdm as nama_dosen,
			s.nidn,
			msb.id_kel_bidang,
			kb.kode_kel_bidang as kode_bidang,
			CONCAT('[', kb.kode_kel_bidang, '] ',
				   (SELECT TOP 1 full_hierarchy
					FROM BidangHierarchy
					WHERE id_kel_bidang = msb.id_kel_bidang
					ORDER BY level DESC)) as nama_bidang,
			msb.urutan,
			msb.last_sync
		FROM pdrd.map_sdm_bidang msb
		LEFT JOIN pdrd.sdm s ON msb.id_sdm = s.id_sdm
		LEFT JOIN ref.kelompok_bidang kb ON msb.id_kel_bidang = kb.id_kel_bidang
		%s
		ORDER BY %s %s
		OFFSET @offset ROWS
		FETCH NEXT @limit ROWS ONLY
	`, whereClause, sortBy, sortOrder)

	var items []BidangIlmuListItem
	if search != "" {
		err := r.db.SelectContext(ctx, &items, dataQuery,
			sql.Named("search", searchParam),
			sql.Named("offset", offset),
			sql.Named("limit", limit))
		if err != nil {
			return nil, fmt.Errorf("failed to get bidang ilmu list: %w", err)
		}
	} else {
		err := r.db.SelectContext(ctx, &items, dataQuery,
			sql.Named("offset", offset),
			sql.Named("limit", limit))
		if err != nil {
			return nil, fmt.Errorf("failed to get bidang ilmu list: %w", err)
		}
	}

	totalPages := (total + limit - 1) / limit

	log.Printf("✅ Repository GetList - returned %d items, total: %d, pages: %d", len(items), total, totalPages)

	return &BidangIlmuListResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetByIDSDM retrieves all bidang ilmu for a specific dosen
func (r *repository) GetByIDSDM(idSDM string) ([]BidangIlmuListItem, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		WITH BidangHierarchy AS (
			-- Base case: get the leaf node
			SELECT
				id_kel_bidang,
				kode_kel_bidang,
				nm_kel_bidang,
				id_induk_bidang,
				CAST(nm_kel_bidang AS VARCHAR(MAX)) as full_hierarchy,
				0 as level
			FROM ref.kelompok_bidang
			WHERE id_kel_bidang IN (
				SELECT id_kel_bidang FROM pdrd.map_sdm_bidang
				WHERE id_sdm = @p1 AND soft_delete = 0
			)

			UNION ALL

			-- Recursive case: traverse up to parent nodes
			SELECT
				kb.id_kel_bidang,
				kb.kode_kel_bidang,
				kb.nm_kel_bidang,
				kb.id_induk_bidang,
				CAST(kb.nm_kel_bidang + ' -- ' + bh.full_hierarchy AS VARCHAR(MAX)),
				bh.level + 1
			FROM ref.kelompok_bidang kb
			INNER JOIN BidangHierarchy bh ON kb.id_kel_bidang = bh.id_induk_bidang
		)
		SELECT
			msb.id_sdm,
			s.nm_sdm as nama_dosen,
			s.nidn,
			msb.id_kel_bidang,
			kb.kode_kel_bidang as kode_bidang,
			CONCAT('[', kb.kode_kel_bidang, '] ',
				   (SELECT TOP 1 full_hierarchy
					FROM BidangHierarchy
					WHERE id_kel_bidang = msb.id_kel_bidang
					ORDER BY level DESC)) as nama_bidang,
			msb.urutan,
			msb.last_sync
		FROM pdrd.map_sdm_bidang msb
		LEFT JOIN pdrd.sdm s ON msb.id_sdm = s.id_sdm
		LEFT JOIN ref.kelompok_bidang kb ON msb.id_kel_bidang = kb.id_kel_bidang
		WHERE msb.id_sdm = @p1
		  AND msb.soft_delete = 0
		ORDER BY msb.urutan ASC
	`

	var items []BidangIlmuListItem
	err := r.db.SelectContext(ctx, &items, query, idSDM)
	if err != nil {
		return nil, fmt.Errorf("failed to get bidang ilmu for dosen %s: %w", idSDM, err)
	}

	return items, nil
}

// GetKelompokBidangMap creates a map of kelompok_bidang name to ID for lookup
func (r *repository) GetKelompokBidangMap() (map[string]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT CONVERT(VARCHAR(36), id_kel_bidang) as id_kel_bidang, nm_kel_bidang
		FROM ref.kelompok_bidang WITH (NOLOCK)
	`

	type KelompokBidang struct {
		IDKelBidang string `db:"id_kel_bidang"`
		NmBidang    string `db:"nm_kel_bidang"`
	}

	var bidangList []KelompokBidang
	err := r.db.SelectContext(ctx, &bidangList, query)
	if err != nil {
		log.Printf("❌ Error fetching kelompok_bidang reference: %v", err)
		return nil, fmt.Errorf("failed to fetch kelompok_bidang reference: %w", err)
	}

	// Create map with normalized keys (lowercase, trimmed)
	bidangMap := make(map[string]string)
	for _, kb := range bidangList {
		// Store with exact name as key
		bidangMap[kb.NmBidang] = kb.IDKelBidang
	}

	log.Printf("✅ Loaded %d kelompok_bidang references", len(bidangMap))
	return bidangMap, nil
}
