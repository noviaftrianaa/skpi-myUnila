package scheduler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/myunila/feeder-service/apps/mahasiswa"
	"github.com/robfig/cron/v3"
)

type Service struct {
	repo             *Repository
	cron             *cron.Cron
	jobs             map[int]cron.EntryID // map schedule ID to cron entry ID
	mahasiswaService mahasiswa.Service
}

// EndpointConfig represents the JSON structure stored in endpoint_key
type EndpointConfig struct {
	Angkatan []string `json:"angkatan,omitempty"`
	IDProdi  *string  `json:"id_prodi,omitempty"`
}

func NewService(repo *Repository, mahasiswaService mahasiswa.Service) *Service {
	// Create cron with second precision
	c := cron.New(cron.WithSeconds())

	service := &Service{
		repo:             repo,
		cron:             c,
		jobs:             make(map[int]cron.EntryID),
		mahasiswaService: mahasiswaService,
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
		// Parse endpoint_key to populate helper fields
		s.parseEndpointKey(&schedule)

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

// parseEndpointKey parses JSON from endpoint_key and populates helper fields
func (s *Service) parseEndpointKey(schedule *ScheduledSync) {
	if schedule.EndpointKey == nil || *schedule.EndpointKey == "" {
		return
	}

	var config EndpointConfig
	if err := json.Unmarshal([]byte(*schedule.EndpointKey), &config); err != nil {
		log.Printf("⚠️  Failed to parse endpoint_key for schedule %d: %v", schedule.ID, err)
		return
	}

	// Convert angkatan array to comma-separated string
	if len(config.Angkatan) > 0 {
		angkatanStr := strings.Join(config.Angkatan, ",")
		schedule.Angkatan = &angkatanStr
	}

	schedule.IDProdi = config.IDProdi
}

// encodeEndpointKey encodes angkatan and id_prodi to JSON string
func (s *Service) encodeEndpointKey(angkatan *string, idProdi *string) (*string, error) {
	config := EndpointConfig{
		IDProdi: idProdi,
	}

	// Convert comma-separated string to array
	if angkatan != nil && *angkatan != "" {
		config.Angkatan = strings.Split(*angkatan, ",")
		// Trim spaces
		for i := range config.Angkatan {
			config.Angkatan[i] = strings.TrimSpace(config.Angkatan[i])
		}
	}

	jsonBytes, err := json.Marshal(config)
	if err != nil {
		return nil, fmt.Errorf("failed to encode endpoint_key: %w", err)
	}

	jsonStr := string(jsonBytes)
	return &jsonStr, nil
}

// registerSchedule registers a single schedule with cron
func (s *Service) registerSchedule(schedule ScheduledSync) error {
	// Create job function
	job := func() {
		log.Printf("🔔 Executing scheduled sync: %s (ID: %d)", schedule.Name, schedule.ID)

		// Parse angkatan from comma-separated string
		var angkatanList []string
		if schedule.Angkatan != nil && *schedule.Angkatan != "" {
			angkatanList = strings.Split(*schedule.Angkatan, ",")
			// Trim spaces
			for i := range angkatanList {
				angkatanList[i] = strings.TrimSpace(angkatanList[i])
			}
		}

		// Build sync filter
		filter := &mahasiswa.SyncFilter{
			Angkatan: angkatanList,
			IDProdi:  schedule.IDProdi,
		}

		// Execute mahasiswa sync
		ctx := context.Background()
		_, err := s.mahasiswaService.SyncMahasiswaByAngkatan(ctx, filter, "scheduler")

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

	// Encode endpoint_key from angkatan and id_prodi
	endpointKey, err := s.encodeEndpointKey(req.Angkatan, req.IDProdi)
	if err != nil {
		return nil, fmt.Errorf("failed to encode endpoint config: %w", err)
	}

	// Create schedule object
	schedule := &ScheduledSync{
		Name:           req.Name,
		Description:    req.Description,
		SyncType:       "mahasiswa", // Fixed type for feeder service
		EndpointKey:    endpointKey,
		CronExpression: cronExpr,
		ScheduleTime:   &scheduleTime,
		IsActive:       req.IsActive,
		NextRunAt:      &nextRun,
		CreatedBy:      req.CreatedBy,
		// Helper fields for response
		Angkatan: req.Angkatan,
		IDProdi:  req.IDProdi,
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

	// Parse existing endpoint_key to get current values
	s.parseEndpointKey(existing)

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

	// Track if endpoint_key needs updating
	updateEndpointKey := false
	if req.Angkatan != nil {
		existing.Angkatan = req.Angkatan
		updateEndpointKey = true
	}
	if req.IDProdi != nil {
		existing.IDProdi = req.IDProdi
		updateEndpointKey = true
	}

	// Re-encode endpoint_key if changed
	if updateEndpointKey {
		endpointKey, err := s.encodeEndpointKey(existing.Angkatan, existing.IDProdi)
		if err != nil {
			return nil, fmt.Errorf("failed to encode endpoint config: %w", err)
		}
		existing.EndpointKey = endpointKey
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

	// Parse endpoint_key
	s.parseEndpointKey(schedule)

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
	// Parse time: HH:mm (input is in WIB timezone)
	layout := "2006-01-02 15:04"
	datetimeStr := fmt.Sprintf("%s %s", dateStr, timeStr)

	// Load WIB timezone (Asia/Jakarta)
	wibLoc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Time{}, "", time.Time{}, fmt.Errorf("failed to load WIB timezone: %w", err)
	}

	// Parse as WIB time
	scheduleTimeWIB, err := time.ParseInLocation(layout, datetimeStr, wibLoc)
	if err != nil {
		return time.Time{}, "", time.Time{}, fmt.Errorf("invalid datetime format: %w", err)
	}

	// Convert to UTC for cron expression
	scheduleTimeUTC := scheduleTimeWIB.UTC()

	// Extract hour and minute in UTC
	hour := scheduleTimeUTC.Hour()
	minute := scheduleTimeUTC.Minute()

	// Create cron expression in UTC: "0 minute hour * * *" (daily at specified time)
	cronExpr := fmt.Sprintf("0 %d %d * * *", minute, hour)

	// Calculate next run time
	nextRun := s.calculateNextRun(scheduleTimeWIB)

	return scheduleTimeWIB, cronExpr, nextRun, nil
}

// calculateNextRun calculates the next run time based on schedule time
func (s *Service) calculateNextRun(scheduleTime time.Time) time.Time {
	// Load WIB timezone
	wibLoc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		log.Printf("⚠️  Failed to load WIB timezone, using UTC: %v", err)
		wibLoc = time.UTC
	}

	// Get current time in WIB
	nowWIB := time.Now().In(wibLoc)

	// Create today's scheduled time in WIB
	nextRun := time.Date(
		nowWIB.Year(), nowWIB.Month(), nowWIB.Day(),
		scheduleTime.Hour(), scheduleTime.Minute(), 0, 0,
		wibLoc,
	)

	// Add 1-minute buffer to prevent race condition
	bufferTime := nowWIB.Add(1 * time.Minute)
	if nextRun.Before(bufferTime) {
		nextRun = nextRun.Add(24 * time.Hour)
		log.Printf("⚠️  Schedule time is less than 1 minute away, scheduling for tomorrow at %s WIB",
			nextRun.Format("2006-01-02 15:04:05"))
	} else {
		log.Printf("✅ Schedule will run today at %s WIB",
			nextRun.Format("2006-01-02 15:04:05"))
	}

	return nextRun.UTC()
}

// GetAll retrieves all schedules with pagination (filter by mahasiswa type)
func (s *Service) GetAll(page, limit int, isActive *bool) (*ScheduledSyncListResponse, error) {
	schedules, total, err := s.repo.GetAll(page, limit, "mahasiswa", isActive)
	if err != nil {
		return nil, err
	}

	// Parse endpoint_key for each schedule to populate helper fields
	for i := range schedules {
		s.parseEndpointKey(&schedules[i])
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
	schedule, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Parse endpoint_key to populate helper fields
	s.parseEndpointKey(schedule)

	return schedule, nil
}
