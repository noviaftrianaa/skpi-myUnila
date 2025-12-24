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
	"golang.org/x/crypto/bcrypt"
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

	// Role operations
	UpsertRolePengguna(ctx context.Context, idPengguna string, roles []*RolePengguna) *UpsertResult
	GetRolesByPengguna(ctx context.Context, idPengguna string) ([]*RolePengguna, error)

	// Helpers
	GetAllUsernames(ctx context.Context) ([]string, error)

	// Scheduler operations
	GetSchedulers(ctx context.Context, page, limit int, jenisSync string) (*SchedulerListResult, error)
	GetSchedulerByID(ctx context.Context, idScheduler string) (*SyncScheduler, error)
	CreateScheduler(ctx context.Context, scheduler *SyncScheduler) error
	UpdateScheduler(ctx context.Context, scheduler *SyncScheduler) error
	DeleteScheduler(ctx context.Context, idScheduler string) error
	ToggleSchedulerActive(ctx context.Context, idScheduler string, isActive int) error
	UpdateSchedulerRunStatus(ctx context.Context, idScheduler string, status string, message string, nextRunAt *time.Time) error
	GetActiveSchedulers(ctx context.Context, jenisSync string) ([]*SyncScheduler, error)
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
	// Password Strategy: SHA1 (from SSO) + bcrypt(SHA1) for auth service
	// jenis_kelamin: from peserta_didik (mahasiswa) or sdm (dosen), default 'L'
	// id_updater: required NOT NULL field, use system UUID for sync operations
	// id_pd_pengguna, id_sdm_pengguna, id_user_sikep: reference IDs from PDUT
	systemUUID := "00000000-0000-0000-0000-000000000001" // System user for sync
	query := `
		MERGE man_akses.pengguna AS target
		USING (SELECT @p1 AS username) AS source
		ON target.username = source.username
		WHEN MATCHED THEN
			UPDATE SET
				nm_pengguna = @p2,
				email = @p3,
				a_aktif = @p4,
				password = @p5,
				password_encrypt = @p6,
				jenis_kelamin = @p9,
				id_pd_pengguna = @p11,
				id_sdm_pengguna = @p12,
				id_user_sikep = @p13,
				last_update = @p7,
				last_sync = @p7,
				id_updater = @p10
		WHEN NOT MATCHED THEN
			INSERT (
				id_pengguna, username, nm_pengguna, email,
				a_aktif, disable, soft_delete, password, password_encrypt,
				jenis_kelamin, id_pd_pengguna, id_sdm_pengguna, id_user_sikep,
				tgl_create, last_update, last_sync, id_updater
			)
			VALUES (
				@p8, @p1, @p2, @p3,
				@p4, 0, 0, @p5, @p6,
				@p9, @p11, @p12, @p13,
				@p7, @p7, @p7, @p10
			);
	`

	now := time.Now()

	// Process each record individually to handle errors gracefully
	for _, p := range data {
		// Generate UUID for new records
		newUUID := uuid.New().String()

		// Password handling:
		// p.Password contains SHA1 hash from SSO (radcheck.value)
		// Generate bcrypt(SHA1) for auth service verification
		passwordSha1 := p.Password
		if passwordSha1 == "" {
			// Default password if not provided (SHA1 of 'unilajaya')
			passwordSha1 = "6461aeaed17aab2ed577647aab64e0a79caf868f" // sha1('unilajaya')
		}

		// Generate bcrypt hash of SHA1 password (cost 12 matches Laravel's bcrypt)
		passwordBcrypt, err := bcrypt.GenerateFromPassword([]byte(passwordSha1), 12)
		if err != nil {
			result.TotalFailed++
			errMsg := fmt.Sprintf("bcrypt %s: %v", p.Username, err)
			result.Errors = append(result.Errors, errMsg)
			log.Printf("⚠️  [Radius Upsert] bcrypt error: %s", errMsg)
			continue
		}

		// jenis_kelamin: use from data, default to 'L' if empty
		jenisKelamin := "L"
		if p.JenisKelamin != nil && *p.JenisKelamin != "" {
			jenisKelamin = *p.JenisKelamin
		}

		_, err = r.db.ExecContext(ctx, query,
			p.Username,             // @p1 - username (for matching and insert)
			p.NmPengguna,           // @p2 - nm_pengguna
			p.Email,                // @p3 - email
			p.AAktif,               // @p4 - a_aktif
			passwordSha1,           // @p5 - password (SHA1)
			string(passwordBcrypt), // @p6 - password_encrypt (bcrypt of SHA1)
			now,                    // @p7 - timestamp (last_update, last_sync, tgl_create)
			newUUID,                // @p8 - id_pengguna (only for insert)
			jenisKelamin,           // @p9 - jenis_kelamin (from peserta_didik/sdm)
			systemUUID,             // @p10 - id_updater (system user for sync)
			p.IDPdPengguna,         // @p11 - id_pd_pengguna (peserta_didik.id_pd)
			p.IDSdmPengguna,        // @p12 - id_sdm_pengguna (sdm.id_sdm)
			p.IDUserSikep,          // @p13 - id_user_sikep (sikep.pegawai.id_pegawai)
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

// UpsertRolePengguna performs upsert for role_pengguna
// Matches by id_pengguna + id_peran + id_organisasi combination
// If exists, updates; if not, inserts new role
func (r *repository) UpsertRolePengguna(ctx context.Context, idPengguna string, roles []*RolePengguna) *UpsertResult {
	result := &UpsertResult{
		Errors: make([]string, 0),
	}

	if len(roles) == 0 {
		return result
	}

	now := time.Now()

	// Process each role
	for _, role := range roles {
		// Check if role already exists for this pengguna + peran + organisasi combination (MULTIPLE ROLES SUPPORT)
		checkQuery := `
			SELECT id_role_pengguna 
			FROM man_akses.role_pengguna 
			WHERE id_pengguna = @p1 AND id_peran = @p2 AND id_organisasi = @p3 AND soft_delete = 0
		`
		
		var existingID string
		err := r.db.GetContext(ctx, &existingID, checkQuery, idPengguna, role.IDPeran, role.IDOrganisasi)
		
		if err == sql.ErrNoRows {
			// Insert new role
			insertQuery := `
				INSERT INTO man_akses.role_pengguna (
					id_role_pengguna, id_pengguna, id_organisasi, id_peran,
					approval_peran, soft_delete, tgl_create, last_update, last_sync
				) VALUES (
					@p1, @p2, @p3, @p4, @p5, 0, @p6, @p6, @p6
				)
			`
			newUUID := uuid.New().String()
			_, err = r.db.ExecContext(ctx, insertQuery,
				newUUID,            // @p1 - id_role_pengguna
				idPengguna,         // @p2 - id_pengguna
				role.IDOrganisasi,  // @p3 - id_organisasi
				role.IDPeran,       // @p4 - id_peran
				1,                  // @p5 - approval_peran (default approved)
				now,                // @p6 - timestamps
			)
			if err != nil {
				result.TotalFailed++
				errMsg := fmt.Sprintf("insert role %d for %s: %v", role.IDPeran, idPengguna, err)
				result.Errors = append(result.Errors, errMsg)
				log.Printf("⚠️  [Role Upsert] %s", errMsg)
			} else {
				result.TotalInserted++
				result.TotalSuccess++
			}
		} else if err != nil {
			result.TotalFailed++
			errMsg := fmt.Sprintf("check role %d for %s: %v", role.IDPeran, idPengguna, err)
			result.Errors = append(result.Errors, errMsg)
		} else {
			// Update existing role
			updateQuery := `
				UPDATE man_akses.role_pengguna 
				SET id_organisasi = @p1, last_update = @p2, last_sync = @p2
				WHERE id_role_pengguna = @p3
			`
			_, err = r.db.ExecContext(ctx, updateQuery,
				role.IDOrganisasi,  // @p1
				now,                // @p2
				existingID,         // @p3
			)
			if err != nil {
				result.TotalFailed++
				errMsg := fmt.Sprintf("update role %d for %s: %v", role.IDPeran, idPengguna, err)
				result.Errors = append(result.Errors, errMsg)
				log.Printf("⚠️  [Role Upsert] %s", errMsg)
			} else {
				result.TotalUpdated++
				result.TotalSuccess++
			}
		}
	}

	return result
}

// GetRolesByPengguna retrieves all roles for a pengguna
func (r *repository) GetRolesByPengguna(ctx context.Context, idPengguna string) ([]*RolePengguna, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_role_pengguna) as id_role_pengguna,
			CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
			CONVERT(VARCHAR(36), id_organisasi) as id_organisasi,
			id_peran,
			soft_delete
		FROM man_akses.role_pengguna
		WHERE id_pengguna = @p1 AND soft_delete = 0
	`

	var roles []*RolePengguna
	err := r.db.SelectContext(ctx, &roles, query, idPengguna)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles: %w", err)
	}

	return roles, nil
}

// ===========================
// SCHEDULER REPOSITORY METHODS
// ===========================

// GetSchedulers retrieves paginated list of schedulers with optional filter by jenis_sync
func (r *repository) GetSchedulers(ctx context.Context, page, limit int, jenisSync string) (*SchedulerListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Filter by jenis_sync
	if jenisSync != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("jenis_sync = @p%d", paramIndex))
		args = append(args, jenisSync)
		paramIndex++
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM man_akses.sync_scheduler
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count schedulers: %w", err)
	}

	// Data query with pagination
	dataArgs := append(args, offset, limit)
	dataQuery := fmt.Sprintf(`
		SELECT
			CONVERT(VARCHAR(36), id_scheduler) as id_scheduler,
			nama_scheduler,
			deskripsi,
			jenis_sync,
			cron_expression,
			is_active,
			username_filter,
			role_filter,
			date_from,
			date_to,
			last_run_at,
			next_run_at,
			last_run_status,
			last_run_message,
			created_by,
			tgl_create,
			last_update
		FROM man_akses.sync_scheduler
		WHERE %s
		ORDER BY tgl_create DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	var schedulers []*SyncScheduler
	err = r.db.SelectContext(ctx, &schedulers, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get schedulers: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &SchedulerListResult{
		Data:       schedulers,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetSchedulerByID retrieves a single scheduler by ID
func (r *repository) GetSchedulerByID(ctx context.Context, idScheduler string) (*SyncScheduler, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_scheduler) as id_scheduler,
			nama_scheduler,
			deskripsi,
			jenis_sync,
			cron_expression,
			is_active,
			username_filter,
			role_filter,
			date_from,
			date_to,
			last_run_at,
			next_run_at,
			last_run_status,
			last_run_message,
			created_by,
			tgl_create,
			last_update
		FROM man_akses.sync_scheduler
		WHERE id_scheduler = @p1 AND soft_delete = 0
	`

	var scheduler SyncScheduler
	err := r.db.GetContext(ctx, &scheduler, query, idScheduler)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("scheduler not found")
		}
		return nil, fmt.Errorf("failed to get scheduler: %w", err)
	}

	return &scheduler, nil
}

// CreateScheduler creates a new scheduler
func (r *repository) CreateScheduler(ctx context.Context, scheduler *SyncScheduler) error {
	query := `
		INSERT INTO man_akses.sync_scheduler (
			id_scheduler, nama_scheduler, deskripsi, jenis_sync, cron_expression,
			is_active, username_filter, role_filter, date_from, date_to,
			next_run_at, created_by, tgl_create, last_update, soft_delete
		) VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13, @p13, 0
		)
	`

	newUUID := uuid.New().String()
	now := time.Now()

	_, err := r.db.ExecContext(ctx, query,
		newUUID,                    // @p1 - id_scheduler
		scheduler.NamaScheduler,    // @p2 - nama_scheduler
		scheduler.Deskripsi,        // @p3 - deskripsi
		scheduler.JenisSync,        // @p4 - jenis_sync
		scheduler.CronExpression,   // @p5 - cron_expression
		scheduler.IsActive,         // @p6 - is_active
		scheduler.UsernameFilter,   // @p7 - username_filter
		scheduler.RoleFilter,       // @p8 - role_filter
		scheduler.DateFrom,         // @p9 - date_from
		scheduler.DateTo,           // @p10 - date_to
		scheduler.NextRunAt,        // @p11 - next_run_at
		scheduler.CreatedBy,        // @p12 - created_by
		now,                        // @p13 - tgl_create, last_update
	)
	if err != nil {
		return fmt.Errorf("failed to create scheduler: %w", err)
	}

	scheduler.IDScheduler = newUUID
	scheduler.TglCreate = &now
	scheduler.LastUpdate = &now

	return nil
}

// UpdateScheduler updates an existing scheduler
func (r *repository) UpdateScheduler(ctx context.Context, scheduler *SyncScheduler) error {
	query := `
		UPDATE man_akses.sync_scheduler
		SET
			nama_scheduler = @p1,
			deskripsi = @p2,
			jenis_sync = @p3,
			cron_expression = @p4,
			is_active = @p5,
			username_filter = @p6,
			role_filter = @p7,
			date_from = @p8,
			date_to = @p9,
			next_run_at = @p10,
			last_update = @p11
		WHERE id_scheduler = @p12 AND soft_delete = 0
	`

	now := time.Now()

	result, err := r.db.ExecContext(ctx, query,
		scheduler.NamaScheduler,    // @p1
		scheduler.Deskripsi,        // @p2
		scheduler.JenisSync,        // @p3
		scheduler.CronExpression,   // @p4
		scheduler.IsActive,         // @p5
		scheduler.UsernameFilter,   // @p6
		scheduler.RoleFilter,       // @p7
		scheduler.DateFrom,         // @p8
		scheduler.DateTo,           // @p9
		scheduler.NextRunAt,        // @p10
		now,                        // @p11
		scheduler.IDScheduler,      // @p12
	)
	if err != nil {
		return fmt.Errorf("failed to update scheduler: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduler not found or already deleted")
	}

	scheduler.LastUpdate = &now

	return nil
}

// DeleteScheduler performs soft delete on a scheduler
func (r *repository) DeleteScheduler(ctx context.Context, idScheduler string) error {
	query := `
		UPDATE man_akses.sync_scheduler
		SET soft_delete = 1, last_update = @p1
		WHERE id_scheduler = @p2 AND soft_delete = 0
	`

	now := time.Now()

	result, err := r.db.ExecContext(ctx, query, now, idScheduler)
	if err != nil {
		return fmt.Errorf("failed to delete scheduler: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduler not found or already deleted")
	}

	return nil
}

// ToggleSchedulerActive toggles the is_active status of a scheduler
func (r *repository) ToggleSchedulerActive(ctx context.Context, idScheduler string, isActive int) error {
	query := `
		UPDATE man_akses.sync_scheduler
		SET is_active = @p1, last_update = @p2
		WHERE id_scheduler = @p3 AND soft_delete = 0
	`

	now := time.Now()

	result, err := r.db.ExecContext(ctx, query, isActive, now, idScheduler)
	if err != nil {
		return fmt.Errorf("failed to toggle scheduler active: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduler not found or already deleted")
	}

	return nil
}

// UpdateSchedulerRunStatus updates the run status and next run time of a scheduler
func (r *repository) UpdateSchedulerRunStatus(ctx context.Context, idScheduler string, status string, message string, nextRunAt *time.Time) error {
	query := `
		UPDATE man_akses.sync_scheduler
		SET
			last_run_at = @p1,
			last_run_status = @p2,
			last_run_message = @p3,
			next_run_at = @p4,
			last_update = @p1
		WHERE id_scheduler = @p5 AND soft_delete = 0
	`

	now := time.Now()

	result, err := r.db.ExecContext(ctx, query, now, status, message, nextRunAt, idScheduler)
	if err != nil {
		return fmt.Errorf("failed to update scheduler run status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduler not found or already deleted")
	}

	return nil
}

// GetActiveSchedulers retrieves all active schedulers for a specific jenis_sync
func (r *repository) GetActiveSchedulers(ctx context.Context, jenisSync string) ([]*SyncScheduler, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_scheduler) as id_scheduler,
			nama_scheduler,
			deskripsi,
			jenis_sync,
			cron_expression,
			is_active,
			username_filter,
			role_filter,
			date_from,
			date_to,
			last_run_at,
			next_run_at,
			last_run_status,
			last_run_message,
			created_by,
			tgl_create,
			last_update
		FROM man_akses.sync_scheduler
		WHERE jenis_sync = @p1 AND is_active = 1 AND soft_delete = 0
		ORDER BY next_run_at ASC
	`

	var schedulers []*SyncScheduler
	err := r.db.SelectContext(ctx, &schedulers, query, jenisSync)
	if err != nil {
		return nil, fmt.Errorf("failed to get active schedulers: %w", err)
	}

	return schedulers, nil
}
