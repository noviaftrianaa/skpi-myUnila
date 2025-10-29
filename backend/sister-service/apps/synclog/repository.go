package synclog

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetList(ctx context.Context, req SyncLogListRequest) ([]SyncLog, int, error)
	GetByID(ctx context.Context, id int64) (*SyncLog, error)
	GetStats(ctx context.Context) (*SyncLogStats, error)
	GetStatsByEndpoint(ctx context.Context, endpointKey string) (*SyncLogStats, error)
	Create(ctx context.Context, log *SyncLog) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetList retrieves paginated sync logs with filtering
func (r *repository) GetList(ctx context.Context, req SyncLogListRequest) ([]SyncLog, int, error) {
	// Set default pagination
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}
	offset := (req.Page - 1) * req.Limit

	// Build WHERE clause
	whereClauses := []string{}
	args := []interface{}{}
	argCounter := 1

	if req.Status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = @p%d", argCounter))
		args = append(args, req.Status)
		argCounter++
	}

	if req.EndpointKey != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("endpoint_key = @p%d", argCounter))
		args = append(args, req.EndpointKey)
		argCounter++
	}

	if req.SyncType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("sync_type = @p%d", argCounter))
		args = append(args, req.SyncType)
		argCounter++
	}

	if req.Search != "" {
		searchPattern := "%" + req.Search + "%"
		whereClauses = append(whereClauses, fmt.Sprintf("(endpoint_name LIKE @p%d OR synced_by LIKE @p%d)", argCounter, argCounter))
		args = append(args, searchPattern)
		argCounter++
	}

	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM logger.sync_logs
		%s
	`, whereClause)

	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)

	err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count sync logs: %w", err)
	}

	// Data query with pagination
	dataQuery := fmt.Sprintf(`
		SELECT
			id,
			endpoint_name,
			endpoint_key,
			sync_type,
			status,
			total_records,
			inserted_count,
			updated_count,
			failed_count,
			skipped_count,
			duration_ms,
			error_message,
			error_details,
			synced_by,
			synced_at
		FROM logger.sync_logs
		%s
		ORDER BY synced_at DESC
		OFFSET @p%d ROWS
		FETCH NEXT @p%d ROWS ONLY
	`, whereClause, argCounter, argCounter+1)

	args = append(args, offset, req.Limit)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query sync logs: %w", err)
	}
	defer rows.Close()

	logs := []SyncLog{}
	for rows.Next() {
		var log SyncLog
		var errorMessage, errorDetails sql.NullString

		err := rows.Scan(
			&log.ID,
			&log.EndpointName,
			&log.EndpointKey,
			&log.SyncType,
			&log.Status,
			&log.TotalRecords,
			&log.InsertedCount,
			&log.UpdatedCount,
			&log.FailedCount,
			&log.SkippedCount,
			&log.DurationMs,
			&errorMessage,
			&errorDetails,
			&log.SyncedBy,
			&log.SyncedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan sync log: %w", err)
		}

		// Handle NULL values
		if errorMessage.Valid {
			log.ErrorMessage = &errorMessage.String
		}
		if errorDetails.Valid {
			log.ErrorDetails = &errorDetails.String
		}

		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating sync logs: %w", err)
	}

	return logs, total, nil
}

// GetByID retrieves a single sync log by ID
func (r *repository) GetByID(ctx context.Context, id int64) (*SyncLog, error) {
	query := `
		SELECT
			id,
			endpoint_name,
			endpoint_key,
			sync_type,
			status,
			total_records,
			inserted_count,
			updated_count,
			failed_count,
			skipped_count,
			duration_ms,
			error_message,
			error_details,
			synced_by,
			synced_at
		FROM logger.sync_logs
		WHERE id = @p1
	`

	var log SyncLog
	var errorMessage, errorDetails sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&log.ID,
		&log.EndpointName,
		&log.EndpointKey,
		&log.SyncType,
		&log.Status,
		&log.TotalRecords,
		&log.InsertedCount,
		&log.UpdatedCount,
		&log.FailedCount,
		&log.SkippedCount,
		&log.DurationMs,
		&errorMessage,
		&errorDetails,
		&log.SyncedBy,
		&log.SyncedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("sync log not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get sync log: %w", err)
	}

	// Handle NULL values
	if errorMessage.Valid {
		log.ErrorMessage = &errorMessage.String
	}
	if errorDetails.Valid {
		log.ErrorDetails = &errorDetails.String
	}

	return &log, nil
}

// GetStats retrieves overall sync log statistics
func (r *repository) GetStats(ctx context.Context) (*SyncLogStats, error) {
	query := `
		SELECT
			COUNT(*) as total_syncs,
			SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
			SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
			COALESCE(SUM(total_records), 0) as total_records,
			COALESCE(SUM(inserted_count), 0) as total_inserted,
			COALESCE(SUM(updated_count), 0) as total_updated,
			COALESCE(SUM(failed_count), 0) as total_failed,
			COALESCE(AVG(duration_ms), 0) as avg_duration_ms,
			MAX(synced_at) as last_sync_at
		FROM logger.sync_logs
	`

	var stats SyncLogStats
	var lastSyncAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalSyncs,
		&stats.SuccessCount,
		&stats.FailedCount,
		&stats.PartialCount,
		&stats.TotalRecords,
		&stats.TotalInserted,
		&stats.TotalUpdated,
		&stats.TotalFailed,
		&stats.AvgDurationMs,
		&lastSyncAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get sync log stats: %w", err)
	}

	if lastSyncAt.Valid {
		stats.LastSyncAt = &lastSyncAt.Time
	}

	return &stats, nil
}

// GetStatsByEndpoint retrieves sync log statistics for a specific endpoint
func (r *repository) GetStatsByEndpoint(ctx context.Context, endpointKey string) (*SyncLogStats, error) {
	query := `
		SELECT
			COUNT(*) as total_syncs,
			SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
			SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
			COALESCE(SUM(total_records), 0) as total_records,
			COALESCE(SUM(inserted_count), 0) as total_inserted,
			COALESCE(SUM(updated_count), 0) as total_updated,
			COALESCE(SUM(failed_count), 0) as total_failed,
			COALESCE(AVG(duration_ms), 0) as avg_duration_ms,
			MAX(synced_at) as last_sync_at
		FROM logger.sync_logs
		WHERE endpoint_key = @p1
	`

	var stats SyncLogStats
	var lastSyncAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, endpointKey).Scan(
		&stats.TotalSyncs,
		&stats.SuccessCount,
		&stats.FailedCount,
		&stats.PartialCount,
		&stats.TotalRecords,
		&stats.TotalInserted,
		&stats.TotalUpdated,
		&stats.TotalFailed,
		&stats.AvgDurationMs,
		&lastSyncAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get sync log stats by endpoint: %w", err)
	}

	if lastSyncAt.Valid {
		stats.LastSyncAt = &lastSyncAt.Time
	}

	return &stats, nil
}

// Create inserts a new sync log entry
func (r *repository) Create(ctx context.Context, log *SyncLog) error {
	query := `
		INSERT INTO logger.sync_logs (
			endpoint_name,
			endpoint_key,
			sync_type,
			status,
			total_records,
			inserted_count,
			updated_count,
			failed_count,
			skipped_count,
			duration_ms,
			error_message,
			error_details,
			synced_by,
			synced_at
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14
		)
	`

	if log.SyncedAt.IsZero() {
		log.SyncedAt = time.Now()
	}

	_, err := r.db.ExecContext(
		ctx,
		query,
		log.EndpointName,
		log.EndpointKey,
		log.SyncType,
		log.Status,
		log.TotalRecords,
		log.InsertedCount,
		log.UpdatedCount,
		log.FailedCount,
		log.SkippedCount,
		log.DurationMs,
		log.ErrorMessage,
		log.ErrorDetails,
		log.SyncedBy,
		log.SyncedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create sync log: %w", err)
	}

	return nil
}
