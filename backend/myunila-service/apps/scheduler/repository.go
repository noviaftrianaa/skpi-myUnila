package scheduler

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetAll(ctx context.Context, page, limit int, syncType *string, isActive *bool) ([]ScheduledSync, int, error)
	GetByID(ctx context.Context, id int) (*ScheduledSync, error)
	GetActiveSchedules(ctx context.Context) ([]ScheduledSync, error)
	Create(ctx context.Context, schedule *ScheduledSync) error
	Update(ctx context.Context, schedule *ScheduledSync) error
	Delete(ctx context.Context, id int) error
	UpdateLastRun(ctx context.Context, id int, lastRunAt time.Time, nextRunAt *time.Time) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetAll retrieves all scheduled syncs with pagination and filters
func (r *repository) GetAll(ctx context.Context, page, limit int, syncType *string, isActive *bool) ([]ScheduledSync, int, error) {
	offset := (page - 1) * limit

	conditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if syncType != nil && *syncType != "" {
		conditions = append(conditions, fmt.Sprintf("sync_type = @p%d", paramIndex))
		args = append(args, *syncType)
		paramIndex++
	}

	if isActive != nil {
		conditions = append(conditions, fmt.Sprintf("is_active = @p%d", paramIndex))
		args = append(args, *isActive)
		paramIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM scheduled_syncs %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count schedules: %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT * FROM scheduled_syncs %s
		ORDER BY created_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	args = append(args, offset, limit)

	var schedules []ScheduledSync
	err = r.db.SelectContext(ctx, &schedules, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get schedules: %w", err)
	}

	return schedules, total, nil
}

// GetByID retrieves a scheduled sync by ID
func (r *repository) GetByID(ctx context.Context, id int) (*ScheduledSync, error) {
	query := "SELECT * FROM scheduled_syncs WHERE id = @p1"

	var schedule ScheduledSync
	err := r.db.GetContext(ctx, &schedule, query, id)
	if err != nil {
		return nil, fmt.Errorf("schedule not found: %w", err)
	}

	return &schedule, nil
}

// GetActiveSchedules retrieves all active schedules
func (r *repository) GetActiveSchedules(ctx context.Context) ([]ScheduledSync, error) {
	query := "SELECT * FROM scheduled_syncs WHERE is_active = 1"

	var schedules []ScheduledSync
	err := r.db.SelectContext(ctx, &schedules, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get active schedules: %w", err)
	}

	return schedules, nil
}

// Create creates a new scheduled sync
func (r *repository) Create(ctx context.Context, schedule *ScheduledSync) error {
	query := `
		INSERT INTO scheduled_syncs (
			name, description, sync_type, endpoint_key, cron_expression,
			schedule_time, is_active, next_run_at, created_by, created_at, updated_at
		)
		OUTPUT INSERTED.id
		VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, GETDATE(), GETDATE()
		)
	`

	err := r.db.QueryRowContext(ctx, query,
		schedule.Name, schedule.Description, schedule.SyncType, schedule.EndpointKey,
		schedule.CronExpression, schedule.ScheduleTime, schedule.IsActive,
		schedule.NextRunAt, schedule.CreatedBy,
	).Scan(&schedule.ID)

	if err != nil {
		return fmt.Errorf("failed to create schedule: %w", err)
	}

	return nil
}

// Update updates an existing scheduled sync
func (r *repository) Update(ctx context.Context, schedule *ScheduledSync) error {
	query := `
		UPDATE scheduled_syncs SET
			name = @p1,
			description = @p2,
			cron_expression = @p3,
			schedule_time = @p4,
			is_active = @p5,
			next_run_at = @p6,
			updated_at = GETDATE()
		WHERE id = @p7
	`

	_, err := r.db.ExecContext(ctx, query,
		schedule.Name, schedule.Description, schedule.CronExpression,
		schedule.ScheduleTime, schedule.IsActive, schedule.NextRunAt, schedule.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update schedule: %w", err)
	}

	return nil
}

// Delete deletes a scheduled sync
func (r *repository) Delete(ctx context.Context, id int) error {
	query := "DELETE FROM scheduled_syncs WHERE id = @p1"

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete schedule: %w", err)
	}

	return nil
}

// UpdateLastRun updates the last run time
func (r *repository) UpdateLastRun(ctx context.Context, id int, lastRunAt time.Time, nextRunAt *time.Time) error {
	query := `
		UPDATE scheduled_syncs SET
			last_run_at = @p1,
			next_run_at = @p2,
			updated_at = GETDATE()
		WHERE id = @p3
	`

	_, err := r.db.ExecContext(ctx, query, lastRunAt, nextRunAt, id)
	if err != nil {
		return fmt.Errorf("failed to update last run: %w", err)
	}

	return nil
}
