package radius

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for pengguna data access
type Repository interface {
	// Bulk operations for sync
	BulkUpsertPengguna(ctx context.Context, data []*Pengguna) *UpsertResult

	// List operations
	GetPenggunaList(ctx context.Context, page, limit int, search string, status *string, hasSso *string, ssoUsernames []string) (*PenggunaListResult, error)
	GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error)
	GetPenggunaByUsername(ctx context.Context, username string) (*Pengguna, error)

	// Statistics
	GetPenggunaStats(ctx context.Context) (*PenggunaStats, error)

	// Helpers
	GetAllUsernames(ctx context.Context) ([]string, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new radius repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// UpsertResult holds the result of bulk upsert operation
type UpsertResult struct {
	TotalSuccess  int
	TotalFailed   int
	TotalInserted int
	TotalUpdated  int
	Errors        []string
}

// BulkUpsertPengguna performs bulk upsert for pengguna from SSO Radius
// Uses SQL Server MERGE command for upsert
func (r *repository) BulkUpsertPengguna(ctx context.Context, data []*Pengguna) *UpsertResult {
	result := &UpsertResult{
		Errors: make([]string, 0),
	}

	if len(data) == 0 {
		return result
	}

	// SQL Server MERGE query for upsert
	// Match by username (SSO identifier)
	query := `
		MERGE man_akses.pengguna AS target
		USING (SELECT @p1 AS username) AS source
		ON target.username = source.username
		WHEN MATCHED THEN
			UPDATE SET
				nm_pengguna = @p2,
				email = @p3,
				a_aktif = @p4,
				last_update = @p5,
				last_sync = @p5
		WHEN NOT MATCHED THEN
			INSERT (
				id_pengguna, username, nm_pengguna, email,
				a_aktif, disable, soft_delete,
				tgl_create, last_update, last_sync
			)
			VALUES (
				@p6, @p1, @p2, @p3,
				@p4, 0, 0,
				@p5, @p5, @p5
			);
	`

	now := time.Now()

	// Process each record individually to handle errors gracefully
	for _, p := range data {
		// Generate UUID for new records
		newUUID := uuid.New().String()

		_, err := r.db.ExecContext(ctx, query,
			p.Username,   // @p1 - username (for matching and insert)
			p.NmPengguna, // @p2 - nm_pengguna
			p.Email,      // @p3 - email
			p.AAktif,     // @p4 - a_aktif
			now,          // @p5 - timestamp (last_update, last_sync, tgl_create)
			newUUID,      // @p6 - id_pengguna (only for insert)
		)
		if err != nil {
			result.TotalFailed++
			errMsg := fmt.Sprintf("pengguna %s (%s): %v", p.Username, p.NmPengguna, err)
			result.Errors = append(result.Errors, errMsg)
			log.Printf("⚠️  [Radius Upsert] Skip error: %s", errMsg)
		} else {
			result.TotalSuccess++
		}
	}

	return result
}

// GetPenggunaList retrieves paginated list of pengguna with filters
func (r *repository) GetPenggunaList(ctx context.Context, page, limit int, search string, status *string, hasSso *string, ssoUsernames []string) (*PenggunaListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"p.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Search filter (username, nama, email)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(p.username LIKE @p%d OR p.nm_pengguna LIKE @p%d OR p.email LIKE @p%d)", paramIndex, paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Status filter
	if status != nil && *status != "" {
		if *status == "aktif" {
			whereConditions = append(whereConditions, "p.a_aktif = 1 AND p.disable = 0")
		} else {
			whereConditions = append(whereConditions, "(p.a_aktif = 0 OR p.disable = 1)")
		}
	}

	// SSO filter - filter by username in/not in SSO list
	if hasSso != nil && *hasSso != "" && len(ssoUsernames) > 0 {
		ssoSet := make(map[string]bool)
		for _, u := range ssoUsernames {
			ssoSet[u] = true
		}

		// Get all matching usernames first
		baseWhereClause := strings.Join(whereConditions, " AND ")
		usernameQuery := fmt.Sprintf(`
			SELECT p.username
			FROM man_akses.pengguna p
			WHERE %s
		`, baseWhereClause)

		var allUsernames []string
		rows, err := r.db.QueryContext(ctx, usernameQuery, args...)
		if err != nil {
			return nil, fmt.Errorf("failed to get usernames: %w", err)
		}
		defer rows.Close()

		for rows.Next() {
			var username string
			if err := rows.Scan(&username); err == nil {
				allUsernames = append(allUsernames, username)
			}
		}

		// Filter usernames based on SSO status
		var filteredUsernames []string
		for _, username := range allUsernames {
			inSSO := ssoSet[username]
			if *hasSso == "yes" && inSSO {
				filteredUsernames = append(filteredUsernames, username)
			} else if *hasSso == "no" && !inSSO {
				filteredUsernames = append(filteredUsernames, username)
			}
		}

		if len(filteredUsernames) == 0 {
			return &PenggunaListResult{
				Data:       []*PenggunaListItem{},
				Total:      0,
				Page:       page,
				Limit:      limit,
				TotalPages: 0,
			}, nil
		}

		// Paginate filtered usernames
		total := len(filteredUsernames)
		start := offset
		end := offset + limit
		if start >= total {
			return &PenggunaListResult{
				Data:       []*PenggunaListItem{},
				Total:      total,
				Page:       page,
				Limit:      limit,
				TotalPages: (total + limit - 1) / limit,
			}, nil
		}
		if end > total {
			end = total
		}
		paginatedUsernames := filteredUsernames[start:end]

		// Build query with filtered usernames
		placeholders := make([]string, len(paginatedUsernames))
		for i := range paginatedUsernames {
			placeholders[i] = fmt.Sprintf("@p%d", paramIndex+i)
			args = append(args, paginatedUsernames[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("p.username IN (%s)", strings.Join(placeholders, ",")))

		whereClause := strings.Join(whereConditions, " AND ")

		dataQuery := fmt.Sprintf(`
			SELECT
				CONVERT(VARCHAR(36), p.id_pengguna) as id_pengguna,
				p.username,
				p.nm_pengguna,
				p.email,
				p.a_aktif,
				p.disable,
				p.last_sync
			FROM man_akses.pengguna p
			WHERE %s
			ORDER BY p.username ASC
		`, whereClause)

		var penggunaList []*PenggunaListItem
		err = r.db.SelectContext(ctx, &penggunaList, dataQuery, args...)
		if err != nil {
			return nil, fmt.Errorf("failed to get pengguna list: %w", err)
		}

		// Add SSO status
		for _, item := range penggunaList {
			if ssoSet[item.Username] {
				item.HasSSO = 1
				item.SumberData = "SSO Radius"
			} else {
				item.HasSSO = 0
				item.SumberData = "Manajemen Akses"
			}
		}

		return &PenggunaListResult{
			Data:       penggunaList,
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: (total + limit - 1) / limit,
		}, nil
	}

	// Standard query without SSO filter
	whereClause := strings.Join(whereConditions, " AND ")

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM man_akses.pengguna p
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count pengguna: %w", err)
	}

	// Data query with pagination
	dataArgs := append(args, offset, limit)
	dataQuery := fmt.Sprintf(`
		SELECT
			CONVERT(VARCHAR(36), p.id_pengguna) as id_pengguna,
			p.username,
			p.nm_pengguna,
			p.email,
			p.a_aktif,
			p.disable,
			p.last_sync
		FROM man_akses.pengguna p
		WHERE %s
		ORDER BY p.username ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	var penggunaList []*PenggunaListItem
	err = r.db.SelectContext(ctx, &penggunaList, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get pengguna list: %w", err)
	}

	// Add SSO status
	ssoSet := make(map[string]bool)
	for _, u := range ssoUsernames {
		ssoSet[u] = true
	}
	for _, item := range penggunaList {
		if ssoSet[item.Username] {
			item.HasSSO = 1
			item.SumberData = "SSO Radius"
		} else {
			item.HasSSO = 0
			item.SumberData = "Manajemen Akses"
		}
	}

	totalPages := (total + limit - 1) / limit

	return &PenggunaListResult{
		Data:       penggunaList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetPenggunaByID retrieves a single pengguna by ID
func (r *repository) GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
			username,
			nm_pengguna,
			email,
			jenis_kelamin,
			tempat_lahir,
			tgl_lahir,
			alamat,
			no_tel,
			no_hp,
			a_aktif,
			disable,
			soft_delete,
			tgl_create,
			last_update,
			last_sync
		FROM man_akses.pengguna
		WHERE id_pengguna = @p1
		  AND soft_delete = 0
	`

	var p Pengguna
	err := r.db.GetContext(ctx, &p, query, idPengguna)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("pengguna not found")
		}
		return nil, fmt.Errorf("failed to get pengguna: %w", err)
	}

	return &p, nil
}

// GetPenggunaByUsername retrieves a single pengguna by username
func (r *repository) GetPenggunaByUsername(ctx context.Context, username string) (*Pengguna, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
			username,
			nm_pengguna,
			email,
			a_aktif,
			disable,
			soft_delete,
			tgl_create,
			last_update,
			last_sync
		FROM man_akses.pengguna
		WHERE username = @p1
		  AND soft_delete = 0
	`

	var p Pengguna
	err := r.db.GetContext(ctx, &p, query, username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get pengguna: %w", err)
	}

	return &p, nil
}

// GetPenggunaStats retrieves statistics for dashboard
func (r *repository) GetPenggunaStats(ctx context.Context) (*PenggunaStats, error) {
	stats := &PenggunaStats{}

	// Get base stats in one query
	err := r.db.GetContext(ctx, stats, `
		SELECT
			COUNT(*) as total_pengguna,
			SUM(CASE WHEN a_aktif = 1 AND disable = 0 THEN 1 ELSE 0 END) as total_aktif,
			SUM(CASE WHEN a_aktif = 0 OR disable = 1 THEN 1 ELSE 0 END) as total_nonaktif
		FROM man_akses.pengguna
		WHERE soft_delete = 0
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get pengguna stats: %v", err)
	}

	// Get last sync
	var lastSync time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM man_akses.pengguna WHERE soft_delete = 0
	`)
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}

// GetAllUsernames retrieves all usernames from pengguna table
func (r *repository) GetAllUsernames(ctx context.Context) ([]string, error) {
	query := `
		SELECT username
		FROM man_akses.pengguna
		WHERE soft_delete = 0 AND username IS NOT NULL AND username != ''
	`

	var usernames []string
	err := r.db.SelectContext(ctx, &usernames, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get usernames: %w", err)
	}

	return usernames, nil
}
