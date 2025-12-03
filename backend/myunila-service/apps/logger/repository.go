package logger

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	CreateSyncLog(ctx context.Context, req *CreateSyncLogRequest) (*SyncLog, error)
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
			endpoint_name, endpoint_key, sync_type, status, api_code,
			total_records, inserted_count, updated_count, failed_count, skipped_count,
			duration_ms, error_message, error_details, synced_by, synced_at
		)
		OUTPUT INSERTED.*
		VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13, @p14, GETDATE()
		)
	`

	var log SyncLog
	err := r.db.QueryRowxContext(ctx, query,
		req.EndpointName, req.EndpointKey, req.SyncType, req.Status, req.APICode,
		req.TotalRecords, req.InsertedCount, req.UpdatedCount, req.FailedCount, req.SkippedCount,
		req.DurationMs, req.ErrorMessage, req.ErrorDetails, req.SyncedBy,
	).StructScan(&log)

	if err != nil {
		return nil, fmt.Errorf("failed to create sync log: %w", err)
	}

	return &log, nil
}

// GetSyncLogs retrieves sync logs with filtering and pagination
func (r *repository) GetSyncLogs(ctx context.Context, filter *SyncLogFilter) ([]SyncLog, int, error) {
	conditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if filter.EndpointName != nil && *filter.EndpointName != "" {
		conditions = append(conditions, fmt.Sprintf("endpoint_name LIKE @p%d", paramIndex))
		args = append(args, "%"+*filter.EndpointName+"%")
		paramIndex++
	}

	if filter.EndpointKey != nil && *filter.EndpointKey != "" {
		conditions = append(conditions, fmt.Sprintf("endpoint_key = @p%d", paramIndex))
		args = append(args, *filter.EndpointKey)
		paramIndex++
	}

	if filter.Status != nil && *filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = @p%d", paramIndex))
		args = append(args, *filter.Status)
		paramIndex++
	}

	if filter.SyncType != nil && *filter.SyncType != "" {
		conditions = append(conditions, fmt.Sprintf("sync_type = @p%d", paramIndex))
		args = append(args, *filter.SyncType)
		paramIndex++
	}

	if filter.APICode != nil && *filter.APICode != "" {
		conditions = append(conditions, fmt.Sprintf("api_code = @p%d", paramIndex))
		args = append(args, *filter.APICode)
		paramIndex++
	}

	if filter.DateFrom != nil {
		conditions = append(conditions, fmt.Sprintf("synced_at >= @p%d", paramIndex))
		args = append(args, *filter.DateFrom)
		paramIndex++
	}

	if filter.DateTo != nil {
		conditions = append(conditions, fmt.Sprintf("synced_at <= @p%d", paramIndex))
		args = append(args, *filter.DateTo)
		paramIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM logger.sync_logs %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count sync logs: %w", err)
	}

	// Data query with pagination
	dataQuery := fmt.Sprintf(`
		SELECT * FROM logger.sync_logs %s
		ORDER BY synced_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	args = append(args, filter.Offset, filter.Limit)

	var logs []SyncLog
	err = r.db.SelectContext(ctx, &logs, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get sync logs: %w", err)
	}

	return logs, total, nil
}

// GetSyncLogByID retrieves a single sync log by ID
func (r *repository) GetSyncLogByID(ctx context.Context, id int64) (*SyncLog, error) {
	query := "SELECT * FROM logger.sync_logs WHERE id = @p1"

	var log SyncLog
	err := r.db.GetContext(ctx, &log, query, id)
	if err != nil {
		return nil, fmt.Errorf("sync log not found: %w", err)
	}

	return &log, nil
}

// GetRecentSyncLogs retrieves the most recent sync logs
func (r *repository) GetRecentSyncLogs(ctx context.Context, limit int) ([]SyncLog, error) {
	query := `
		SELECT TOP(@p1) * FROM logger.sync_logs
		ORDER BY synced_at DESC
	`

	var logs []SyncLog
	err := r.db.SelectContext(ctx, &logs, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent sync logs: %w", err)
	}

	return logs, nil
}
