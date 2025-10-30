package scheduler

import (
	"fmt"
	"log"
	"sister-service/apps/dosen"
	"sister-service/apps/referensi"
	"time"

	"github.com/robfig/cron/v3"
)

type Service struct {
	repo           *Repository
	cron           *cron.Cron
	jobs           map[int]cron.EntryID // map schedule ID to cron entry ID
	dosenService   *dosen.Service
	referensiService *referensi.Service
}

func NewService(repo *Repository, dosenService *dosen.Service, referensiService *referensi.Service) *Service {
	// Create cron with second precision
	c := cron.New(cron.WithSeconds())

	service := &Service{
		repo:           repo,
		cron:           c,
		jobs:           make(map[int]cron.EntryID),
		dosenService:   dosenService,
		referensiService: referensiService,
	}

	return service
}

// Start starts the cron scheduler
func (s *Service) Start() error {
	log.Println("🕐 Starting scheduler service...")

	// Load all active schedules from database
	schedules, err := s.repo.GetActive()
	if err != nil {
		return fmt.Errorf("failed to load active schedules: %w", err)
	}

	// Register each active schedule
	for _, schedule := range schedules {
		if err := s.registerSchedule(schedule); err != nil {
			log.Printf("⚠️  Failed to register schedule %d (%s): %v", schedule.ID, schedule.Name, err)
			continue
		}
		log.Printf("✅ Registered schedule: %s (next run: %v)", schedule.Name, schedule.NextRunAt)
	}

	// Start cron
	s.cron.Start()
	log.Printf("✅ Scheduler started with %d active schedules", len(schedules))

	return nil
}

// Stop stops the cron scheduler
func (s *Service) Stop() {
	log.Println("🛑 Stopping scheduler service...")
	s.cron.Stop()
	log.Println("✅ Scheduler stopped")
}

// registerSchedule registers a single schedule with cron
func (s *Service) registerSchedule(schedule ScheduledSync) error {
	// Create job function
	job := func() {
		log.Printf("🔔 Executing scheduled sync: %s (ID: %d)", schedule.Name, schedule.ID)

		var err error
		if schedule.SyncType == "dosen" {
			// Execute dosen sync
			_, err = s.dosenService.SyncFromSister("scheduler")
		} else if schedule.SyncType == "referensi" && schedule.EndpointKey != nil {
			// Execute referensi sync
			_, err = s.referensiService.SyncEndpoint(*schedule.EndpointKey, "scheduler")
		} else {
			log.Printf("❌ Invalid sync configuration for schedule %d", schedule.ID)
			return
		}

		// Update last run time
		now := time.Now().UTC()
		nextRun := s.cron.Entry(s.jobs[schedule.ID]).Next

		if err != nil {
			log.Printf("❌ Scheduled sync failed for %s: %v", schedule.Name, err)
		} else {
			log.Printf("✅ Scheduled sync completed for %s", schedule.Name)
		}

		// Update last run and next run in database
		if err := s.repo.UpdateLastRun(schedule.ID, now, nextRun); err != nil {
			log.Printf("⚠️  Failed to update last run for schedule %d: %v", schedule.ID, err)
		}
	}

	// Add job to cron
	entryID, err := s.cron.AddFunc(schedule.CronExpression, job)
	if err != nil {
		return fmt.Errorf("failed to add cron job: %w", err)
	}

	// Store entry ID
	s.jobs[schedule.ID] = entryID

	return nil
}

// unregisterSchedule removes a schedule from cron
func (s *Service) unregisterSchedule(scheduleID int) {
	if entryID, exists := s.jobs[scheduleID]; exists {
		s.cron.Remove(entryID)
		delete(s.jobs, scheduleID)
		log.Printf("✅ Unregistered schedule ID %d", scheduleID)
	}
}

// CreateSchedule creates a new scheduled sync
func (s *Service) CreateSchedule(req CreateScheduledSyncRequest) (*ScheduledSync, error) {
	// Parse schedule time
	scheduleTime, cronExpr, nextRun, err := s.parseDateTimeToCron(req.ScheduleDate, req.ScheduleTime)
	if err != nil {
		return nil, fmt.Errorf("invalid schedule time: %w", err)
	}

	// Validate endpoint_key for referensi type
	if req.SyncType == "referensi" && req.EndpointKey == nil {
		return nil, fmt.Errorf("endpoint_key is required for referensi sync")
	}

	// Create schedule object
	schedule := &ScheduledSync{
		Name:           req.Name,
		Description:    req.Description,
		SyncType:       req.SyncType,
		EndpointKey:    req.EndpointKey,
		CronExpression: cronExpr,
		ScheduleTime:   &scheduleTime,
		IsActive:       req.IsActive,
		NextRunAt:      &nextRun,
		CreatedBy:      req.CreatedBy,
	}

	// Save to database
	if err := s.repo.Create(schedule); err != nil {
		return nil, fmt.Errorf("failed to create schedule: %w", err)
	}

	// Register with cron if active
	if schedule.IsActive {
		if err := s.registerSchedule(*schedule); err != nil {
			log.Printf("⚠️  Failed to register new schedule: %v", err)
		} else {
			log.Printf("✅ Registered new schedule: %s", schedule.Name)
		}
	}

	return schedule, nil
}

// UpdateSchedule updates an existing scheduled sync
func (s *Service) UpdateSchedule(id int, req UpdateScheduledSyncRequest) (*ScheduledSync, error) {
	// Get existing schedule
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("schedule not found: %w", err)
	}

	// Update fields
	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	// Update schedule time if provided
	if req.ScheduleDate != nil && req.ScheduleTime != nil {
		scheduleTime, cronExpr, nextRun, err := s.parseDateTimeToCron(*req.ScheduleDate, *req.ScheduleTime)
		if err != nil {
			return nil, fmt.Errorf("invalid schedule time: %w", err)
		}
		existing.ScheduleTime = &scheduleTime
		existing.CronExpression = cronExpr
		existing.NextRunAt = &nextRun
	}

	// Update in database
	if err := s.repo.Update(id, existing); err != nil {
		return nil, fmt.Errorf("failed to update schedule: %w", err)
	}

	// Re-register with cron
	s.unregisterSchedule(id)
	if existing.IsActive {
		if err := s.registerSchedule(*existing); err != nil {
			log.Printf("⚠️  Failed to re-register schedule: %v", err)
		}
	}

	return existing, nil
}

// DeleteSchedule deletes a scheduled sync
func (s *Service) DeleteSchedule(id int) error {
	// Unregister from cron
	s.unregisterSchedule(id)

	// Delete from database
	if err := s.repo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete schedule: %w", err)
	}

	return nil
}

// ToggleSchedule toggles a schedule's active status
func (s *Service) ToggleSchedule(id int, isActive bool) error {
	// Get schedule
	schedule, err := s.repo.GetByID(id)
	if err != nil {
		return fmt.Errorf("schedule not found: %w", err)
	}

	// Toggle in database
	if err := s.repo.ToggleActive(id, isActive); err != nil {
		return fmt.Errorf("failed to toggle schedule: %w", err)
	}

	// Update cron registration
	if isActive {
		// Register with cron
		schedule.IsActive = true
		if err := s.registerSchedule(*schedule); err != nil {
			return fmt.Errorf("failed to register schedule: %w", err)
		}
	} else {
		// Unregister from cron
		s.unregisterSchedule(id)
	}

	return nil
}

// parseDateTimeToCron converts date and time strings to cron expression and next run time
func (s *Service) parseDateTimeToCron(dateStr, timeStr string) (time.Time, string, time.Time, error) {
	// Parse date: YYYY-MM-DD
	// Parse time: HH:mm
	layout := "2006-01-02 15:04"
	datetimeStr := fmt.Sprintf("%s %s", dateStr, timeStr)

	scheduleTime, err := time.Parse(layout, datetimeStr)
	if err != nil {
		return time.Time{}, "", time.Time{}, fmt.Errorf("invalid datetime format: %w", err)
	}

	// Extract hour and minute
	hour := scheduleTime.Hour()
	minute := scheduleTime.Minute()

	// Create cron expression: "0 minute hour * * *" (daily at specified time)
	cronExpr := fmt.Sprintf("0 %d %d * * *", minute, hour)

	// Calculate next run time
	nextRun := s.calculateNextRun(scheduleTime)

	return scheduleTime, cronExpr, nextRun, nil
}

// calculateNextRun calculates the next run time based on schedule time
func (s *Service) calculateNextRun(scheduleTime time.Time) time.Time {
	now := time.Now()

	// Create today's scheduled time
	nextRun := time.Date(
		now.Year(), now.Month(), now.Day(),
		scheduleTime.Hour(), scheduleTime.Minute(), 0, 0,
		time.Local,
	)

	// If time has passed today, schedule for tomorrow
	if nextRun.Before(now) {
		nextRun = nextRun.Add(24 * time.Hour)
	}

	return nextRun.UTC()
}

// GetAll retrieves all schedules with pagination
func (s *Service) GetAll(page, limit int, syncType string, isActive *bool) (*ScheduledSyncListResponse, error) {
	schedules, total, err := s.repo.GetAll(page, limit, syncType, isActive)
	if err != nil {
		return nil, err
	}

	totalPages := (total + limit - 1) / limit

	return &ScheduledSyncListResponse{
		Data:       schedules,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetByID retrieves a schedule by ID
func (s *Service) GetByID(id int) (*ScheduledSync, error) {
	return s.repo.GetByID(id)
}
