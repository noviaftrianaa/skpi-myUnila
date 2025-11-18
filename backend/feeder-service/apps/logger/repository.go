package logger

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	CreateSyncLog(ctx context.Context, log *CreateSyncLogRequest) (*SyncLog, error)
	GetSyncLogs(ctx context.Context, filter *SyncLogFilter) ([]SyncLog, int, error)
	GetSyncLogByID(ctx context.Context, id int64) (*SyncLog, error)
	GetRecentSyncLogs(ctx context.Context, limit int) ([]SyncLog, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// CreateSyncLog creates a new sync log entry
func (r *repository) CreateSyncLog(ctx context.Context, req *CreateSyncLogRequest) (*SyncLog, error) {
	query := `
		INSERT INTO logger.sync_logs (
			endpoint_name, endpoint_key, sync_type, status,
			total_records, inserted_count, updated_count, failed_count, skipped_count,
			duration_ms, error_message, error_details, synced_by, synced_at
		)
		OUTPUT INSERTED.id, INSERTED.endpoint_name, INSERTED.endpoint_key, INSERTED.sync_type, INSERTED.status,
		       INSERTED.total_records, INSERTED.inserted_count, INSERTED.updated_count,
		       INSERTED.failed_count, INSERTED.skipped_count, INSERTED.duration_ms,
		       INSERTED.error_message, INSERTED.error_details, INSERTED.synced_by, INSERTED.synced_at
		VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13,
			DATEADD(HOUR, 7, GETUTCDATE())
		)
	`

	var log SyncLog
	err := r.db.QueryRowContext(
		ctx, query,
		req.EndpointName,
		req.EndpointKey,
		req.SyncType,
		req.Status,
		req.TotalRecords,
		req.InsertedCount,
		req.UpdatedCount,
		req.FailedCount,
		req.SkippedCount,
		req.DurationMs,
		req.ErrorMessage,
		req.ErrorDetails,
		req.SyncedBy,
	).Scan(
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
		&log.ErrorMessage,
		&log.ErrorDetails,
		&log.SyncedBy,
		&log.SyncedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create sync log: %w", err)
	}

	return &log, nil
}

// GetSyncLogs retrieves sync logs with filtering and pagination
func (r *repository) GetSyncLogs(ctx context.Context, filter *SyncLogFilter) ([]SyncLog, int, error) {
	// Build WHERE clause
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filter.EndpointName != nil {
		conditions = append(conditions, fmt.Sprintf("endpoint_name = @p%d", argIndex))
		args = append(args, *filter.EndpointName)
		argIndex++
	}

	if filter.EndpointKey != nil {
		conditions = append(conditions, fmt.Sprintf("endpoint_key = @p%d", argIndex))
		args = append(args, *filter.EndpointKey)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("status = @p%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	if filter.SyncType != nil {
		conditions = append(conditions, fmt.Sprintf("sync_type = @p%d", argIndex))
		args = append(args, *filter.SyncType)
		argIndex++
	}

	if filter.DateFrom != nil {
		conditions = append(conditions, fmt.Sprintf("synced_at >= @p%d", argIndex))
		args = append(args, *filter.DateFrom)
		argIndex++
	}

	if filter.DateTo != nil {
		conditions = append(conditions, fmt.Sprintf("synced_at <= @p%d", argIndex))
		args = append(args, *filter.DateTo)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM logger.sync_logs %s", whereClause)
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count sync logs: %w", err)
	}

	// Get paginated data
	limit := filter.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	query := fmt.Sprintf(`
		SELECT
			id, endpoint_name, endpoint_key, sync_type, status,
			total_records, inserted_count, updated_count, failed_count, skipped_count,
			duration_ms, error_message, error_details, synced_by, synced_at
		FROM logger.sync_logs
		%s
		ORDER BY synced_at DESC
		OFFSET @p%d ROWS
		FETCH NEXT @p%d ROWS ONLY
	`, whereClause, argIndex, argIndex+1)

	args = append(args, offset, limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query sync logs: %w", err)
	}
	defer rows.Close()

	var logs []SyncLog
	for rows.Next() {
		var log SyncLog
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
			&log.ErrorMessage,
			&log.ErrorDetails,
			&log.SyncedBy,
			&log.SyncedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan sync log: %w", err)
		}
		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating sync logs: %w", err)
	}

	return logs, total, nil
}

// GetSyncLogByID retrieves a single sync log by ID
func (r *repository) GetSyncLogByID(ctx context.Context, id int64) (*SyncLog, error) {
	query := `
		SELECT
			id, endpoint_name, endpoint_key, sync_type, status,
			total_records, inserted_count, updated_count, failed_count, skipped_count,
			duration_ms, error_message, error_details, synced_by, synced_at
		FROM logger.sync_logs
		WHERE id = @p1
	`

	var log SyncLog
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
		&log.ErrorMessage,
		&log.ErrorDetails,
		&log.SyncedBy,
		&log.SyncedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get sync log: %w", err)
	}

	return &log, nil
}

// GetRecentSyncLogs retrieves the most recent sync logs
func (r *repository) GetRecentSyncLogs(ctx context.Context, limit int) ([]SyncLog, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT TOP (@p1)
			id, endpoint_name, endpoint_key, sync_type, status,
			total_records, inserted_count, updated_count, failed_count, skipped_count,
			duration_ms, error_message, error_details, synced_by, synced_at
		FROM logger.sync_logs
		ORDER BY synced_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent sync logs: %w", err)
	}
	defer rows.Close()

	var logs []SyncLog
	for rows.Next() {
		var log SyncLog
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
			&log.ErrorMessage,
			&log.ErrorDetails,
			&log.SyncedBy,
			&log.SyncedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan sync log: %w", err)
		}
		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating recent sync logs: %w", err)
	}

	return logs, nil
}
