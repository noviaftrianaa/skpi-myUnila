package scheduler

import (
	"context"
	"fmt"
	"log"
	"github.com/myunila/feeder-service/apps/bidang_ilmu"
	"github.com/myunila/feeder-service/apps/dosen"
	"github.com/myunila/feeder-service/apps/jabatan_struktural"
	"github.com/myunila/feeder-service/apps/pendidikan"
	"github.com/myunila/feeder-service/apps/penelitian"
	"github.com/myunila/feeder-service/apps/penugasan"
	"github.com/myunila/feeder-service/apps/publikasi"
	"github.com/myunila/feeder-service/apps/referensi"
	"github.com/myunila/feeder-service/apps/riwayat_fungsional"
	"github.com/myunila/feeder-service/apps/riwayat_pekerjaan"
	"github.com/myunila/feeder-service/apps/sertifikasi_dosen"
	"github.com/myunila/feeder-service/apps/tugas_tambahan"
	"time"

	"github.com/robfig/cron/v3"
)

// UNILA_ID_SP is the Satuan Perguruan Tinggi ID for Universitas Lampung
const UNILA_ID_SP = "e2b705a7-173e-464a-9fac-509128709515"

type Service struct {
	repo                     *Repository
	cron                     *cron.Cron
	jobs                     map[int]cron.EntryID // map schedule ID to cron entry ID
	dosenService             dosen.Service
	referensiService         referensi.Service
	penugasanService         penugasan.Service
	penelitianService        penelitian.Service
	publikasiService         publikasi.Service
	pendidikanService        pendidikan.Service
	riwayatPekerjaanService  *riwayat_pekerjaan.Service
	riwayatFungsionalService *riwayat_fungsional.Service
	jabatanStrukturalService *jabatan_struktural.Service
	tugasTambahanService     *tugas_tambahan.Service
	sertifikasiDosenService  *sertifikasi_dosen.Service
	bidangIlmuService        bidang_ilmu.Service
}

func NewService(repo *Repository, dosenService dosen.Service, referensiService referensi.Service, penugasanService penugasan.Service, penelitianService penelitian.Service, publikasiService publikasi.Service, pendidikanService pendidikan.Service, riwayatPekerjaanService *riwayat_pekerjaan.Service, riwayatFungsionalService *riwayat_fungsional.Service, jabatanStrukturalService *jabatan_struktural.Service, tugasTambahanService *tugas_tambahan.Service, sertifikasiDosenService *sertifikasi_dosen.Service, bidangIlmuService bidang_ilmu.Service) *Service {
	// Create cron with second precision
	c := cron.New(cron.WithSeconds())

	service := &Service{
		repo:                     repo,
		cron:                     c,
		jobs:                     make(map[int]cron.EntryID),
		dosenService:             dosenService,
		referensiService:         referensiService,
		penugasanService:         penugasanService,
		penelitianService:        penelitianService,
		publikasiService:         publikasiService,
		pendidikanService:        pendidikanService,
		riwayatPekerjaanService:  riwayatPekerjaanService,
		riwayatFungsionalService: riwayatFungsionalService,
		jabatanStrukturalService: jabatanStrukturalService,
		tugasTambahanService:     tugasTambahanService,
		sertifikasiDosenService:  sertifikasiDosenService,
		bidangIlmuService:        bidangIlmuService,
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

// executeWithRetry executes sync function with retry logic for transient errors
func (s *Service) executeWithRetry(schedule ScheduledSync) error {
	maxRetries := 3
	var lastErr error

	// Force refresh token before first attempt to ensure fresh authentication
	if schedule.SyncType == "dosen" {
		if err := s.dosenService.ForceRefreshToken(); err != nil {
			log.Printf("⚠️  Failed to refresh token for dosen sync, continuing anyway: %v", err)
		}
	} else if schedule.SyncType == "referensi" {
		if err := s.referensiService.ForceRefreshToken(); err != nil {
			log.Printf("⚠️  Failed to refresh token for referensi sync, continuing anyway: %v", err)
		}
	} else if schedule.SyncType == "penugasan" {
		if err := s.penugasanService.ForceRefreshToken(); err != nil {
			log.Printf("⚠️  Failed to refresh token for penugasan sync, continuing anyway: %v", err)
		}
	} else if schedule.SyncType == "penelitian" || schedule.SyncType == "pengabdian" || schedule.SyncType == "pendidikan" || schedule.SyncType == "publikasi" || schedule.SyncType == "riwayat_pekerjaan" || schedule.SyncType == "riwayat_fungsional" {
		// Penelitian, pengabdian, pendidikan, publikasi, riwayat_pekerjaan, and riwayat_fungsional use the same Sister API token as dosen
		if err := s.dosenService.ForceRefreshToken(); err != nil {
			log.Printf("⚠️  Failed to refresh token for %s sync, continuing anyway: %v", schedule.SyncType, err)
		}
	}

	for attempt := 0; attempt <= maxRetries; attempt++ {
		var err error

		if schedule.SyncType == "dosen" {
			// Execute dosen sync - using UNILA_ID_SP to sync all Unila dosen
			_, err = s.dosenService.SyncDosenFromSister(UNILA_ID_SP, "scheduler")
		} else if schedule.SyncType == "referensi" && schedule.EndpointKey != nil {
			// Execute referensi sync - BatchSync with single endpoint
			_, err = s.referensiService.BatchSyncFromSister(context.Background(), []string{*schedule.EndpointKey}, "scheduler")
		} else if schedule.SyncType == "penugasan" {
			// Execute penugasan sync - BatchSync for all active dosen
			_, err = s.penugasanService.BatchSyncPenugasan("scheduler")
		} else if schedule.SyncType == "penelitian" {
			// Execute penelitian batch sync for all dosen
			_, err = s.penelitianService.BatchSyncAllPenelitian("scheduler")
		} else if schedule.SyncType == "pengabdian" {
			// Execute pengabdian batch sync for all dosen
			_, err = s.penelitianService.BatchSyncAllPengabdian("scheduler")
		} else if schedule.SyncType == "pendidikan" {
			// Execute pendidikan formal batch sync for all dosen
			_, err = s.pendidikanService.BatchSyncAllPendidikanFormal("scheduler")
		} else if schedule.SyncType == "publikasi" {
			// Execute publikasi batch sync for all dosen
			_, err = s.publikasiService.BatchSyncAllPublikasi("scheduler")
		} else if schedule.SyncType == "riwayat_pekerjaan" {
			// Execute riwayat pekerjaan batch sync for all dosen
			_, err = s.riwayatPekerjaanService.BatchSyncAllRwyPekerjaan("scheduler")
		} else if schedule.SyncType == "riwayat_fungsional" {
			// Execute riwayat fungsional batch sync for all dosen
			_, err = s.riwayatFungsionalService.BatchSyncAllRwyFungsional("scheduler")
		} else {
			return fmt.Errorf("invalid sync configuration")
		}

		// If successful, return immediately
		if err == nil {
			if attempt > 0 {
				log.Printf("✅ Sync succeeded after %d retries", attempt)
			}
			return nil
		}

		// Store last error
		lastErr = err

		// Check if error is retryable (contains keywords for transient errors)
		errStr := err.Error()
		isRetryable := contains(errStr, "429") || // Rate limit
			contains(errStr, "500") || // Internal server error
			contains(errStr, "502") || // Bad gateway
			contains(errStr, "503") || // Service unavailable
			contains(errStr, "timeout") ||
			contains(errStr, "Terjadi kesalahan dalam sistem")

		// If not retryable or max retries reached, return error
		if !isRetryable || attempt >= maxRetries {
			if !isRetryable {
				log.Printf("❌ Non-retryable error: %v", err)
			}
			return lastErr
		}

		// Calculate exponential backoff: 5s, 10s, 20s
		waitTime := time.Duration(1<<uint(attempt)) * 5 * time.Second
		log.Printf("⚠️  Sync failed (attempt %d/%d): %v", attempt+1, maxRetries+1, err)
		log.Printf("⏳ Retrying in %v...", waitTime)
		time.Sleep(waitTime)
	}

	return lastErr
}

// Helper function to check if string contains substring
func contains(str, substr string) bool {
	return len(str) > 0 && len(substr) > 0 &&
		(str == substr || len(str) >= len(substr) &&
		 (str[:len(substr)] == substr || str[len(str)-len(substr):] == substr ||
		  findSubstring(str, substr)))
}

func findSubstring(str, substr string) bool {
	for i := 0; i <= len(str)-len(substr); i++ {
		if str[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// registerSchedule registers a single schedule with cron
func (s *Service) registerSchedule(schedule ScheduledSync) error {
	// Create job function
	job := func() {
		log.Printf("🔔 Executing scheduled sync: %s (ID: %d)", schedule.Name, schedule.ID)

		// Execute sync with retry mechanism
		err := s.executeWithRetry(schedule)

		// Update last run time
		now := time.Now().UTC()
		nextRun := s.cron.Entry(s.jobs[schedule.ID]).Next

		if err != nil {
			log.Printf("❌ Scheduled sync failed for %s after all retries: %v", schedule.Name, err)
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

	// Validate endpoint_key only for referensi type
	// penelitian, pengabdian, pendidikan, publikasi, riwayat_pekerjaan will batch sync all dosen
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

	// Add 1-minute buffer to prevent race condition where schedule time is very close to current time
	// If the scheduled time is less than 1 minute away, schedule for tomorrow instead
	bufferTime := now.Add(1 * time.Minute)
	if nextRun.Before(bufferTime) {
		nextRun = nextRun.Add(24 * time.Hour)
		log.Printf("⚠️  Schedule time is less than 1 minute away (current: %s, scheduled: %s), scheduling for tomorrow at %s WIB",
			now.Format("15:04:05"), scheduleTime.Format("15:04"), nextRun.Format("2006-01-02 15:04:05"))
	} else {
		log.Printf("✅ Schedule will run today at %s WIB (next run: %s WIB)",
			scheduleTime.Format("15:04"), nextRun.Format("2006-01-02 15:04:05"))
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
