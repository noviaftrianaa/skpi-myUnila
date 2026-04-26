package scheduler

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// Create creates a new scheduled sync
func (r *Repository) Create(schedule *ScheduledSync) error {
	query := `
		INSERT INTO scheduled_syncs
		(name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, next_run_at, created_by, created_at, updated_at)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11)
	`

	var id int
	err := r.db.QueryRow(
		query,
		schedule.Name,
		schedule.Description,
		schedule.SyncType,
		schedule.EndpointKey,
		schedule.CronExpression,
		schedule.ScheduleTime,
		schedule.IsActive,
		schedule.NextRunAt,
		schedule.CreatedBy,
		time.Now().UTC(),
		time.Now().UTC(),
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create scheduled sync: %w", err)
	}

	schedule.ID = id
	return nil
}

// GetAll retrieves all scheduled syncs with pagination
func (r *Repository) GetAll(page, limit int, syncType string, isActive *bool) ([]ScheduledSync, int, error) {
	offset := (page - 1) * limit

	// Build query with filters
	query := `
		SELECT id, name, description, sync_type, endpoint_key, cron_expression, schedule_time,
		       is_active, last_run_at, next_run_at, created_by, created_at, updated_at
		FROM scheduled_syncs
		WHERE 1=1
	`
	countQuery := `SELECT COUNT(*) FROM scheduled_syncs WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if syncType != "" {
		query += fmt.Sprintf(" AND sync_type = @p%d", argCount)
		countQuery += fmt.Sprintf(" AND sync_type = @p%d", argCount)
		args = append(args, syncType)
		argCount++
	}

	if isActive != nil {
		query += fmt.Sprintf(" AND is_active = @p%d", argCount)
		countQuery += fmt.Sprintf(" AND is_active = @p%d", argCount)
		args = append(args, *isActive)
		argCount++
	}

	query += " ORDER BY created_at DESC"
	query += fmt.Sprintf(" OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY", argCount, argCount+1)
	args = append(args, offset, limit)

	// Get total count
	var total int
	countArgs := args
	if argCount > 1 {
		countArgs = args[:argCount-1]
	} else {
		countArgs = []interface{}{}
	}
	err := r.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count scheduled syncs: %w", err)
	}

	// Get schedules
	var schedules []ScheduledSync
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get scheduled syncs: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var schedule ScheduledSync
		err := rows.Scan(
			&schedule.ID,
			&schedule.Name,
			&schedule.Description,
			&schedule.SyncType,
			&schedule.EndpointKey,
			&schedule.CronExpression,
			&schedule.ScheduleTime,
			&schedule.IsActive,
			&schedule.LastRunAt,
			&schedule.NextRunAt,
			&schedule.CreatedBy,
			&schedule.CreatedAt,
			&schedule.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan scheduled sync: %w", err)
		}
		schedules = append(schedules, schedule)
	}

	return schedules, total, nil
}

// GetByID retrieves a scheduled sync by ID
func (r *Repository) GetByID(id int) (*ScheduledSync, error) {
	query := `
		SELECT id, name, description, sync_type, endpoint_key, cron_expression, schedule_time,
		       is_active, last_run_at, next_run_at, created_by, created_at, updated_at
		FROM scheduled_syncs
		WHERE id = @p1
	`

	var schedule ScheduledSync
	err := r.db.QueryRow(query, id).Scan(
		&schedule.ID,
		&schedule.Name,
		&schedule.Description,
		&schedule.SyncType,
		&schedule.EndpointKey,
		&schedule.CronExpression,
		&schedule.ScheduleTime,
		&schedule.IsActive,
		&schedule.LastRunAt,
		&schedule.NextRunAt,
		&schedule.CreatedBy,
		&schedule.CreatedAt,
		&schedule.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("scheduled sync not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled sync: %w", err)
	}

	return &schedule, nil
}

// GetActive retrieves all active scheduled syncs untuk semua sync_type
// yang dikelola feeder-service.
func (r *Repository) GetActive() ([]ScheduledSync, error) {
	query := `
		SELECT id, name, description, sync_type, endpoint_key, cron_expression, schedule_time,
		       is_active, last_run_at, next_run_at, created_by, created_at, updated_at
		FROM scheduled_syncs
		WHERE is_active = 1
		  AND sync_type IN (
		    'mahasiswa', 'aktivitas_mahasiswa', 'kurikulum', 'rencana_evaluasi',
		    'kelas_kuliah', 'nilai_perkuliahan', 'nilai_konversi', 'transkrip_nilai'
		  )
		ORDER BY next_run_at ASC
	`

	var schedules []ScheduledSync
	err := r.db.Select(&schedules, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get active schedules: %w", err)
	}

	return schedules, nil
}

// Update updates a scheduled sync
func (r *Repository) Update(id int, schedule *ScheduledSync) error {
	query := `
		UPDATE scheduled_syncs
		SET name = @p1, description = @p2, endpoint_key = @p3, cron_expression = @p4,
		    schedule_time = @p5, is_active = @p6, next_run_at = @p7, updated_at = @p8
		WHERE id = @p9
	`

	result, err := r.db.Exec(
		query,
		schedule.Name,
		schedule.Description,
		schedule.EndpointKey,
		schedule.CronExpression,
		schedule.ScheduleTime,
		schedule.IsActive,
		schedule.NextRunAt,
		time.Now().UTC(),
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to update scheduled sync: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduled sync not found")
	}

	return nil
}

// UpdateLastRun updates the last run time and next run time
func (r *Repository) UpdateLastRun(id int, lastRunAt, nextRunAt time.Time) error {
	query := `
		UPDATE scheduled_syncs
		SET last_run_at = @p1, next_run_at = @p2, updated_at = @p3
		WHERE id = @p4
	`

	_, err := r.db.Exec(query, lastRunAt, nextRunAt, time.Now().UTC(), id)
	if err != nil {
		log.Printf("❌ Failed to update last run for schedule %d: %v", id, err)
		return fmt.Errorf("failed to update last run: %w", err)
	}

	log.Printf("✅ Updated last run for schedule %d: last=%v, next=%v", id, lastRunAt, nextRunAt)
	return nil
}

// Delete deletes a scheduled sync
func (r *Repository) Delete(id int) error {
	query := `DELETE FROM scheduled_syncs WHERE id = @p1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete scheduled sync: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduled sync not found")
	}

	return nil
}

// ToggleActive toggles the is_active status
func (r *Repository) ToggleActive(id int, isActive bool) error {
	query := `
		UPDATE scheduled_syncs
		SET is_active = @p1, updated_at = @p2
		WHERE id = @p3
	`

	result, err := r.db.Exec(query, isActive, time.Now().UTC(), id)
	if err != nil {
		return fmt.Errorf("failed to toggle active status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("scheduled sync not found")
	}

	return nil
}
