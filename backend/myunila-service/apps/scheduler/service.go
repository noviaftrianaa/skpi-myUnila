package scheduler

import (
	"context"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
)

// PegawaiSyncService interface for pegawai sync operations
type PegawaiSyncService interface {
	SyncPegawai(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error)
}

// RadiusSyncService interface for radius sync operations
type RadiusSyncService interface {
	SyncPengguna(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error)
}

// UnitOrganisasiSyncService interface for unit organisasi sync operations
type UnitOrganisasiSyncService interface {
	SyncFromSMS(ctx context.Context, syncedBy string) (interface{}, error)
}

// KerjasamaSyncService interface for SIKERMA kerjasama sync operations
type KerjasamaSyncService interface {
	SyncKerjasama(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error)
}

// SiakaduSyncRunner runs SIAKADU sync via internal HTTP calls
type SiakaduSyncRunner struct {
	BaseURL string
}

func (r *SiakaduSyncRunner) Run(endpoint string) error {
	client := &http.Client{Timeout: 4 * time.Hour}
	url := r.BaseURL + endpoint
	resp, err := client.Post(url, "application/json", strings.NewReader("{}"))
	if err != nil {
		return fmt.Errorf("failed to call %s: %w", endpoint, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("sync %s returned HTTP %d", endpoint, resp.StatusCode)
	}
	return nil
}

// KeuanganSyncRunner — runs keuangan-service sync via internal HTTP calls.
// Service mount di docker network alias `keuangan-service:8088`.
type KeuanganSyncRunner struct {
	BaseURL string
}

// RunWithBody — POST endpoint dengan body JSON arbitrary (mis. {"tahun":2025}).
func (r *KeuanganSyncRunner) RunWithBody(endpoint, jsonBody string) error {
	client := &http.Client{Timeout: 4 * time.Hour}
	url := r.BaseURL + endpoint
	resp, err := client.Post(url, "application/json", strings.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to call %s: %w", endpoint, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 && resp.StatusCode != 201 && resp.StatusCode != 202 {
		return fmt.Errorf("sync %s returned HTTP %d", endpoint, resp.StatusCode)
	}
	return nil
}

type Service interface {
	Start() error
	Stop()
	GetAll(ctx context.Context, page, limit int, syncType *string, isActive *bool) (*ScheduledSyncListResponse, error)
	GetByID(ctx context.Context, id int) (*ScheduledSync, error)
	Create(ctx context.Context, req *CreateScheduledSyncRequest) (*ScheduledSync, error)
	Update(ctx context.Context, id int, req *UpdateScheduledSyncRequest) (*ScheduledSync, error)
	Delete(ctx context.Context, id int) error
	Toggle(ctx context.Context, id int, isActive bool) (*ScheduledSync, error)
	SetPegawaiSyncService(svc PegawaiSyncService)
	SetRadiusSyncService(svc RadiusSyncService)
	SetUnitOrganisasiSyncService(svc UnitOrganisasiSyncService)
	SetKerjasamaSyncService(svc KerjasamaSyncService)
}

type service struct {
	repo              Repository
	cron              *cron.Cron
	cronJobs          map[int]cron.EntryID
	mu                sync.RWMutex
	pegawaiSync       PegawaiSyncService
	radiusSync        RadiusSyncService
	unitOrgSync       UnitOrganisasiSyncService
	kerjasamaSync     KerjasamaSyncService
	siakaduRunner     *SiakaduSyncRunner
	keuanganRunner    *KeuanganSyncRunner
}

func NewService(repo Repository) Service {
	// Create cron with seconds precision
	// SkipIfStillRunning: kalau sync sebelumnya belum selesai, fire berikutnya
	// akan di-skip (bukan jalan paralel). Penting untuk sync data besar
	// (mis. siakadu_transkrip per-NPM, mahasiswa) yang bisa lewat 1 cycle.
	c := cron.New(
		cron.WithSeconds(),
		cron.WithChain(cron.SkipIfStillRunning(cron.DefaultLogger)),
	)

	keuanganURL := os.Getenv("KEUANGAN_SERVICE_URL")
	if keuanganURL == "" {
		keuanganURL = "http://keuangan-service:8088/api/v1"
	}

	return &service{
		repo:     repo,
		cron:     c,
		cronJobs: make(map[int]cron.EntryID),
		siakaduRunner:  &SiakaduSyncRunner{BaseURL: "http://localhost:8086/api/v1"},
		keuanganRunner: &KeuanganSyncRunner{BaseURL: keuanganURL},
	}
}

// SetPegawaiSyncService sets the pegawai sync service for scheduled syncs
func (s *service) SetPegawaiSyncService(svc PegawaiSyncService) {
	s.pegawaiSync = svc
}

// SetRadiusSyncService sets the radius sync service for scheduled syncs
func (s *service) SetRadiusSyncService(svc RadiusSyncService) {
	s.radiusSync = svc
}

// SetUnitOrganisasiSyncService sets the unit organisasi sync service for scheduled syncs
func (s *service) SetUnitOrganisasiSyncService(svc UnitOrganisasiSyncService) {
	s.unitOrgSync = svc
}

// SetKerjasamaSyncService sets the SIKERMA kerjasama sync service for scheduled syncs
func (s *service) SetKerjasamaSyncService(svc KerjasamaSyncService) {
	s.kerjasamaSync = svc
}

// Start loads active schedules and starts the cron scheduler
func (s *service) Start() error {
	ctx := context.Background()

	// Load active schedules from database
	schedules, err := s.repo.GetActiveSchedules(ctx)
	if err != nil {
		log.Printf("⚠️  Failed to load active schedules: %v", err)
		return err
	}

	log.Printf("📅 Loading %d active schedules...", len(schedules))

	for _, schedule := range schedules {
		if err := s.registerSchedule(&schedule); err != nil {
			log.Printf("⚠️  Failed to register schedule %d (%s): %v", schedule.ID, schedule.Name, err)
		}
	}

	// Start the cron scheduler
	s.cron.Start()
	log.Println("✅ Scheduler started")

	return nil
}

// Stop stops the cron scheduler
func (s *service) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	log.Println("✅ Scheduler stopped")
}

// registerSchedule registers a schedule with the cron scheduler
func (s *service) registerSchedule(schedule *ScheduledSync) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Remove existing job if any
	if entryID, exists := s.cronJobs[schedule.ID]; exists {
		s.cron.Remove(entryID)
		delete(s.cronJobs, schedule.ID)
	}

	// Add new job
	scheduleID := schedule.ID
	scheduleName := schedule.Name
	syncType := schedule.SyncType

	entryID, err := s.cron.AddFunc(schedule.CronExpression, func() {
		s.executeScheduledSync(scheduleID, scheduleName, syncType)
	})

	if err != nil {
		return fmt.Errorf("failed to add cron job: %w", err)
	}

	s.cronJobs[schedule.ID] = entryID
	log.Printf("📅 Registered schedule: %s (ID: %d, Cron: %s)", schedule.Name, schedule.ID, schedule.CronExpression)

	return nil
}

// executeScheduledSync executes a scheduled sync
func (s *service) executeScheduledSync(scheduleID int, scheduleName, syncType string) {
	ctx := context.Background()
	log.Printf("🔄 [Scheduler] Executing scheduled sync: %s (ID: %d, Type: %s)", scheduleName, scheduleID, syncType)

	startTime := time.Now()

	// Execute with retry
	err := s.executeWithRetry(ctx, syncType, "scheduler")

	// Calculate next run time
	entry := s.cron.Entry(s.cronJobs[scheduleID])
	var nextRun *time.Time
	if entry.ID != 0 {
		next := entry.Next
		nextRun = &next
	}

	// Update last run time
	if err := s.repo.UpdateLastRun(ctx, scheduleID, startTime, nextRun); err != nil {
		log.Printf("⚠️  Failed to update last run for schedule %d: %v", scheduleID, err)
	}

	if err != nil {
		log.Printf("❌ [Scheduler] Scheduled sync failed: %s (ID: %d): %v", scheduleName, scheduleID, err)
	} else {
		log.Printf("✅ [Scheduler] Scheduled sync completed: %s (ID: %d)", scheduleName, scheduleID)
	}
}

// executeWithRetry executes sync with exponential backoff retry
func (s *service) executeWithRetry(ctx context.Context, syncType, syncedBy string) error {
	maxRetries := 3
	retryDelays := []time.Duration{5 * time.Second, 10 * time.Second, 20 * time.Second}

	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			log.Printf("🔄 [Scheduler] Retry attempt %d/%d for %s", attempt, maxRetries, syncType)
			time.Sleep(retryDelays[attempt-1])
		}

		err := s.executeSync(ctx, syncType, syncedBy)
		if err == nil {
			return nil
		}

		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err) {
			return err
		}
	}

	return fmt.Errorf("max retries exceeded: %w", lastErr)
}

// executeSync executes the actual sync based on type
func (s *service) executeSync(ctx context.Context, syncType, syncedBy string) error {
	switch syncType {
	case "pegawai":
		if s.pegawaiSync == nil {
			return fmt.Errorf("pegawai sync service not configured")
		}
		_, err := s.pegawaiSync.SyncPegawai(ctx, nil, syncedBy)
		return err
	case "radius":
		if s.radiusSync == nil {
			return fmt.Errorf("radius sync service not configured")
		}
		_, err := s.radiusSync.SyncPengguna(ctx, nil, syncedBy)
		return err
	case "unit_organisasi":
		if s.unitOrgSync == nil {
			return fmt.Errorf("unit organisasi sync service not configured")
		}
		_, err := s.unitOrgSync.SyncFromSMS(ctx, syncedBy)
		return err
	case "kerjasama":
		if s.kerjasamaSync == nil {
			return fmt.Errorf("kerjasama sync service not configured")
		}
		_, err := s.kerjasamaSync.SyncKerjasama(ctx, nil, syncedBy)
		return err
	case "daftar_ukt":
		// Tahun saat ini (UTC, tetapi server jalan WIB jadi accurate)
		tahun := time.Now().Year()
		body := fmt.Sprintf(`{"tahun":%d,"force_sync":false,"synced_by":"scheduler"}`, tahun)
		return s.keuanganRunner.RunWithBody("/daftar-ukt/sync", body)
	case "spp_mhs":
		// Default sync semester aktif berjalan; tahun_akd & ganjil_genap di-derive di
		// keuangan-service kalau body kosong.
		return s.keuanganRunner.RunWithBody("/spp-mhs/sync", `{"synced_by":"scheduler"}`)
	case "siakadu_referensi", "siakadu_unit":
		return s.siakaduRunner.Run("/siakadu/referensi/unit/sync")
	case "siakadu_mahasiswa":
		return s.siakaduRunner.Run("/siakadu/mahasiswa/sync-all")
	case "siakadu_akademik":
		return s.siakaduRunner.Run("/siakadu/akademik/sync-all?id_semester=20241")
	case "siakadu_matakuliah":
		return s.siakaduRunner.Run("/siakadu/akademik/matakuliah/sync")
	case "siakadu_kurikulum":
		return s.siakaduRunner.Run("/siakadu/akademik/kurikulum/sync")
	case "siakadu_kelas":
		return s.siakaduRunner.Run("/siakadu/akademik/kelas/sync")
	case "siakadu_khs":
		return s.siakaduRunner.Run("/siakadu/nilai/khs/sync")
	case "siakadu_kuliah":
		return s.siakaduRunner.Run("/siakadu/nilai/kuliah/sync")
	case "siakadu_transkrip":
		return s.siakaduRunner.Run("/siakadu/nilai/transkrip/sync-batch")
	case "siakadu_wisuda":
		return s.siakaduRunner.Run("/siakadu/wisuda/sync")
	default:
		return fmt.Errorf("unknown sync type: %s", syncType)
	}
}

// isRetryableError checks if an error is retryable
func isRetryableError(err error) bool {
	if err == nil {
		return false
	}
	errStr := strings.ToLower(err.Error())
	retryablePatterns := []string{
		"timeout",
		"connection refused",
		"connection reset",
		"429", // Rate limit
		"500", // Server error
		"502", // Bad gateway
		"503", // Service unavailable
	}
	for _, pattern := range retryablePatterns {
		if strings.Contains(errStr, pattern) {
			return true
		}
	}
	return false
}

// GetAll retrieves all scheduled syncs with pagination
func (s *service) GetAll(ctx context.Context, page, limit int, syncType *string, isActive *bool) (*ScheduledSyncListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}

	schedules, total, err := s.repo.GetAll(ctx, page, limit, syncType, isActive)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &ScheduledSyncListResponse{
		Data:       schedules,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetByID retrieves a scheduled sync by ID
func (s *service) GetByID(ctx context.Context, id int) (*ScheduledSync, error) {
	return s.repo.GetByID(ctx, id)
}

// Create creates a new scheduled sync
func (s *service) Create(ctx context.Context, req *CreateScheduledSyncRequest) (*ScheduledSync, error) {
	// Parse schedule time
	cronExpr, scheduleTime, nextRun, err := parseToCronExpression(req.ScheduleDate, req.ScheduleTime)
	if err != nil {
		return nil, err
	}

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

	if err := s.repo.Create(ctx, schedule); err != nil {
		return nil, err
	}

	// Register with cron if active
	if schedule.IsActive {
		if err := s.registerSchedule(schedule); err != nil {
			log.Printf("⚠️  Failed to register new schedule: %v", err)
		}
	}

	return schedule, nil
}

// Update updates a scheduled sync
func (s *service) Update(ctx context.Context, id int, req *UpdateScheduledSyncRequest) (*ScheduledSync, error) {
	schedule, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		schedule.Name = *req.Name
	}
	if req.Description != nil {
		schedule.Description = *req.Description
	}

	// Update schedule time if provided
	if req.ScheduleDate != nil && req.ScheduleTime != nil {
		cronExpr, scheduleTime, nextRun, err := parseToCronExpression(*req.ScheduleDate, *req.ScheduleTime)
		if err != nil {
			return nil, err
		}
		schedule.CronExpression = cronExpr
		schedule.ScheduleTime = &scheduleTime
		schedule.NextRunAt = &nextRun
	}

	if req.IsActive != nil {
		schedule.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, schedule); err != nil {
		return nil, err
	}

	// Update cron registration
	if schedule.IsActive {
		if err := s.registerSchedule(schedule); err != nil {
			log.Printf("⚠️  Failed to update schedule registration: %v", err)
		}
	} else {
		s.unregisterSchedule(schedule.ID)
	}

	return schedule, nil
}

// Delete deletes a scheduled sync
func (s *service) Delete(ctx context.Context, id int) error {
	s.unregisterSchedule(id)
	return s.repo.Delete(ctx, id)
}

// Toggle toggles the active state of a scheduled sync
func (s *service) Toggle(ctx context.Context, id int, isActive bool) (*ScheduledSync, error) {
	schedule, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	schedule.IsActive = isActive

	if err := s.repo.Update(ctx, schedule); err != nil {
		return nil, err
	}

	if isActive {
		if err := s.registerSchedule(schedule); err != nil {
			log.Printf("⚠️  Failed to register schedule: %v", err)
		}
	} else {
		s.unregisterSchedule(id)
	}

	return schedule, nil
}

// unregisterSchedule removes a schedule from the cron scheduler
func (s *service) unregisterSchedule(id int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if entryID, exists := s.cronJobs[id]; exists {
		s.cron.Remove(entryID)
		delete(s.cronJobs, id)
		log.Printf("📅 Unregistered schedule ID: %d", id)
	}
}

// parseToCronExpression converts date and time to cron expression
func parseToCronExpression(dateStr, timeStr string) (string, time.Time, time.Time, error) {
	// Parse time HH:mm
	timeParts := strings.Split(timeStr, ":")
	if len(timeParts) != 2 {
		return "", time.Time{}, time.Time{}, fmt.Errorf("invalid time format: expected HH:mm")
	}

	// Parse date YYYY-MM-DD
	dateParts := strings.Split(dateStr, "-")
	if len(dateParts) != 3 {
		return "", time.Time{}, time.Time{}, fmt.Errorf("invalid date format: expected YYYY-MM-DD")
	}

	// Build full datetime
	fullDateTime := fmt.Sprintf("%s %s:00", dateStr, timeStr)
	scheduleTime, err := time.Parse("2006-01-02 15:04:05", fullDateTime)
	if err != nil {
		return "", time.Time{}, time.Time{}, fmt.Errorf("failed to parse datetime: %w", err)
	}

	// Create cron expression: second minute hour day month day-of-week
	// For one-time execution, we use specific date values
	cronExpr := fmt.Sprintf("0 %s %s %s %s *",
		timeParts[1], // minute
		timeParts[0], // hour
		dateParts[2], // day
		dateParts[1], // month
	)

	return cronExpr, scheduleTime, scheduleTime, nil
}

// Global service instance
var globalService Service

// SetService sets the global scheduler service
func SetService(svc Service) {
	globalService = svc
}

// GetService returns the global scheduler service
func GetService() Service {
	return globalService
}
