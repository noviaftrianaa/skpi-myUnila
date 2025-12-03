package pegawai

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for pegawai data access
type Repository interface {
	// Bulk operations
	BulkUpsertPegawai(ctx context.Context, data []*Pegawai) error
	BulkUpsertPegawaiWithResult(ctx context.Context, data []*Pegawai) *UpsertResult

	// List operations with filters
	GetPegawaiList(ctx context.Context, page, limit int, search string, jnsTenaga, status *string, sortBy, sortOrder string) (*PegawaiListResult, error)
	GetPegawaiByID(ctx context.Context, idPegawai string) (*Pegawai, error)

	// Statistics
	GetPegawaiStats(ctx context.Context) (*PegawaiStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new pegawai repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// UpsertResult holds the result of bulk upsert operation
type UpsertResult struct {
	TotalSuccess int
	TotalFailed  int
	Errors       []string
}

// BulkUpsertPegawai performs bulk upsert for pegawai with error handling per record
// It will continue processing even if individual records fail
func (r *repository) BulkUpsertPegawai(ctx context.Context, data []*Pegawai) error {
	if len(data) == 0 {
		return nil
	}

	result := r.BulkUpsertPegawaiWithResult(ctx, data)
	if result.TotalFailed > 0 && result.TotalSuccess == 0 {
		// Only return error if ALL records failed
		return fmt.Errorf("all %d records failed to upsert", result.TotalFailed)
	}
	return nil
}

// BulkUpsertPegawaiWithResult performs bulk upsert and returns detailed result
func (r *repository) BulkUpsertPegawaiWithResult(ctx context.Context, data []*Pegawai) *UpsertResult {
	result := &UpsertResult{
		Errors: make([]string, 0),
	}

	if len(data) == 0 {
		return result
	}

	// SQL Server MERGE query for upsert
	// Includes id_org1, id_org2, id_org3 for unit organization info
	// id_creator is included for INSERT to handle NOT NULL constraint in production
	query := `
		MERGE sikep.pegawai AS target
		USING (SELECT @p1 AS id_pegawai) AS source
		ON target.id_pegawai = source.id_pegawai
		WHEN MATCHED THEN
			UPDATE SET
				nm_pegawai = @p2,
				jk = @p3,
				nip = @p4,
				nidn = @p5,
				tmp_lahir = @p6,
				tgl_lahir = @p7,
				alamat = @p8,
				jns_pegawai = @p9,
				tmt_cpns = @p10,
				tmt_pns = @p11,
				jns_tenaga = @p12,
				status = @p13,
				tmt_pensiun = @p14,
				id_org1 = @p15,
				id_org2 = @p16,
				id_org3 = @p17,
				last_sync = @p18
		WHEN NOT MATCHED THEN
			INSERT (
				id_pegawai, nm_pegawai, jk, nip, nidn, tmp_lahir, tgl_lahir, alamat,
				jns_pegawai, tmt_cpns, tmt_pns, jns_tenaga,
				status, tmt_pensiun,
				id_org1, id_org2, id_org3,
				id_creator, create_date, last_sync
			)
			VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8,
				@p9, @p10, @p11, @p12,
				@p13, @p14,
				@p15, @p16, @p17,
				@p20, @p19, @p18
			);
	`

	now := time.Now()

	// Process each record individually to skip errors
	for _, p := range data {
		_, err := r.db.ExecContext(ctx, query,
			p.IDPegawai,  // @p1
			p.NmPegawai,  // @p2
			p.JK,         // @p3
			p.NIP,        // @p4
			p.NIDN,       // @p5
			p.TmpLahir,   // @p6
			p.TglLahir,   // @p7
			p.Alamat,     // @p8
			p.JnsPegawai, // @p9
			p.TmtCPNS,    // @p10
			p.TmtPNS,     // @p11
			p.JnsTenaga,  // @p12
			p.Status,     // @p13
			p.TmtPensiun, // @p14
			p.IDOrg1,     // @p15
			p.IDOrg2,     // @p16
			p.IDOrg3,     // @p17
			now,          // @p18 - last_sync
			now,          // @p19 - create_date (for INSERT)
			p.IDCreator,  // @p20 - id_creator (for INSERT)
		)
		if err != nil {
			result.TotalFailed++
			errMsg := fmt.Sprintf("pegawai %s (%s): %v", p.IDPegawai, p.NmPegawai, err)
			result.Errors = append(result.Errors, errMsg)
			// Log but continue processing
			log.Printf("⚠️  [Pegawai Upsert] Skip error: %s", errMsg)
		} else {
			result.TotalSuccess++
		}
	}

	return result
}

// GetPegawaiList retrieves paginated list of pegawai with filters
func (r *repository) GetPegawaiList(ctx context.Context, page, limit int, search string, jnsTenaga, status *string, sortBy, sortOrder string) (*PegawaiListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	// Search filter (nama and NIP)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(p.nm_pegawai LIKE @p%d OR p.nip LIKE @p%d OR p.nidn LIKE @p%d)", paramIndex, paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Jenis Tenaga filter
	if jnsTenaga != nil && *jnsTenaga != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("p.jns_tenaga = @p%d", paramIndex))
		args = append(args, *jnsTenaga)
		paramIndex++
	}

	// Status filter
	if status != nil && *status != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("p.status = @p%d", paramIndex))
		args = append(args, *status)
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Build ORDER BY clause
	orderByClause := "p.nm_pegawai ASC" // Default
	if sortBy != "" {
		var dbColumn string
		switch sortBy {
		case "nm_pegawai":
			dbColumn = "p.nm_pegawai"
		case "nip":
			dbColumn = "p.nip"
		case "jns_tenaga":
			dbColumn = "p.jns_tenaga"
		case "status":
			dbColumn = "p.status"
		case "last_sync":
			dbColumn = "p.last_sync"
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

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM sikep.pegawai AS p
		%s
	`, whereClause)

	// Data query - select from pegawai table with org names joined from unit_orga
	dataQuery := fmt.Sprintf(`
		SELECT
			p.id_pegawai,
			p.nm_pegawai,
			p.nip,
			p.nidn,
			p.jk,
			p.jns_pegawai,
			p.jns_tenaga,
			CAST(NULL AS VARCHAR(100)) AS nama_golongan,
			CAST(NULL AS VARCHAR(100)) AS nama_fungsional,
			p.id_org1,
			p.id_org2,
			p.id_org3,
			o1.nm_unit_orga AS nama_org1,
			o2.nm_unit_orga AS nama_org2,
			o3.nm_unit_orga AS nama_org3,
			p.status,
			p.last_sync
		FROM sikep.pegawai AS p
		LEFT JOIN sikep.unit_orga AS o1 ON p.id_org1 = o1.id_unit_orga
		LEFT JOIN sikep.unit_orga AS o2 ON p.id_org2 = o2.id_unit_orga
		LEFT JOIN sikep.unit_orga AS o3 ON p.id_org3 = o3.id_unit_orga
		%s
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, orderByClause, paramIndex, paramIndex+1)

	// Execute count query
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count pegawai: %w", err)
	}

	// Execute data query
	dataArgs := append(args, offset, limit)
	var pegawaiList []*PegawaiListItem
	err = r.db.SelectContext(ctx, &pegawaiList, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get pegawai list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &PegawaiListResult{
		Data:       pegawaiList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetPegawaiByID retrieves a single pegawai by ID
func (r *repository) GetPegawaiByID(ctx context.Context, idPegawai string) (*Pegawai, error) {
	// Select only columns that exist in the database
	query := `
		SELECT
			id_pegawai, nm_pegawai, jk, nip, nidn,
			jns_pegawai, jns_tenaga,
			status,
			last_sync
		FROM sikep.pegawai
		WHERE id_pegawai = @p1
	`

	var p Pegawai
	err := r.db.GetContext(ctx, &p, query, idPegawai)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("pegawai not found")
		}
		return nil, fmt.Errorf("failed to get pegawai: %w", err)
	}

	return &p, nil
}

// GetPegawaiStats retrieves statistics for dashboard (4 stats only)
func (r *repository) GetPegawaiStats(ctx context.Context) (*PegawaiStats, error) {
	stats := &PegawaiStats{}

	// Total pegawai (all records)
	err := r.db.GetContext(ctx, &stats.TotalPegawai, `
		SELECT COUNT(*) FROM sikep.pegawai
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get total pegawai: %v", err)
	}

	// Total dosen aktif (jns_tenaga = 'Dosen' AND status = 'Aktif')
	err = r.db.GetContext(ctx, &stats.TotalDosenAktif, `
		SELECT COUNT(*) FROM sikep.pegawai
		WHERE (jns_tenaga = 'Dosen' OR nidn IS NOT NULL)
		AND status = 'Aktif'
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get total dosen aktif: %v", err)
	}

	// Total tendik aktif (non-dosen AND status = 'Aktif')
	err = r.db.GetContext(ctx, &stats.TotalTendikAktif, `
		SELECT COUNT(*) FROM sikep.pegawai
		WHERE (jns_tenaga != 'Dosen' OR jns_tenaga IS NULL)
		AND (nidn IS NULL OR nidn = '')
		AND status = 'Aktif'
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get total tendik aktif: %v", err)
	}

	// Last sync
	var lastSync time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM sikep.pegawai
	`)
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}
