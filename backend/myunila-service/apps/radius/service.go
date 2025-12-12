package radius

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
	"github.com/myunila/myunila-service/external/radius_api"
)

// Service interface for radius business logic
type Service interface {
	// List operations
	GetPenggunaList(ctx context.Context, page, limit int, search string, status, hasSso *string) (*PenggunaListResult, error)
	GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error)
	GetPenggunaStats(ctx context.Context) (*PenggunaStats, error)
	GetRadiusStats(ctx context.Context) (*RadiusStats, error)

	// Sync operations
	SyncFromRadius(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)

	// For scheduler
	SyncPengguna(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error)
}

// RadiusAPIClient interface for Radius API operations
type RadiusAPIClient interface {
	GetToken() error
	ForceRefreshToken() error
	TestConnection() error
	GetUsers(page, limit int) (*radius_api.UsersResponse, error)
	GetAllUsers() ([]radius_api.SSOUser, error)
	GetStats() (int, error)
	IsAvailable() bool
}

// service implementation
type service struct {
	repo       Repository
	radiusAPI  RadiusAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new radius service
func NewService(repo Repository, radiusAPI RadiusAPIClient) Service {
	return &service{
		repo:       repo,
		radiusAPI:  radiusAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// GetPenggunaList retrieves paginated list of pengguna
func (s *service) GetPenggunaList(ctx context.Context, page, limit int, search string, status, hasSso *string) (*PenggunaListResult, error) {
	// Query directly from database without SSO API call
	// SSO usernames are no longer needed for filtering since we removed SSO column
	return s.repo.GetPenggunaList(ctx, page, limit, search, status, hasSso, nil)
}

// GetPenggunaByID retrieves a single pengguna by ID
func (s *service) GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error) {
	return s.repo.GetPenggunaByID(ctx, idPengguna)
}

// GetPenggunaStats retrieves statistics for dashboard
func (s *service) GetPenggunaStats(ctx context.Context) (*PenggunaStats, error) {
	stats, err := s.repo.GetPenggunaStats(ctx)
	if err != nil {
		return nil, err
	}

	// Get SSO count from Radius API
	if s.radiusAPI != nil && s.radiusAPI.IsAvailable() {
		total, err := s.radiusAPI.GetStats()
		if err == nil {
			stats.TotalSSO = total
			stats.TotalNonSSO = stats.TotalPengguna - total
			if stats.TotalNonSSO < 0 {
				stats.TotalNonSSO = 0
			}
		}
	}

	return stats, nil
}

// GetRadiusStats retrieves statistics from Radius API
func (s *service) GetRadiusStats(ctx context.Context) (*RadiusStats, error) {
	if s.radiusAPI == nil || !s.radiusAPI.IsAvailable() {
		return &RadiusStats{
			TotalActive: 0,
			Source:      "unavailable",
		}, nil
	}

	total, err := s.radiusAPI.GetStats()
	if err != nil {
		return nil, err
	}

	return &RadiusStats{
		TotalActive: total,
		Source:      "api",
	}, nil
}

// SyncFromRadius syncs pengguna data from Radius SSO API
func (s *service) SyncFromRadius(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()

	// Determine sync type
	syncType := "manual"
	if filter != nil && filter.SyncType != "" {
		syncType = filter.SyncType
	}

	log.Printf("🔄 [Radius Sync] Starting %s sync from Radius SSO API", syncType)

	// Check if Radius API is available
	if s.radiusAPI == nil || !s.radiusAPI.IsAvailable() {
		errMsg := "Radius API not available"
		s.logSyncResult(ctx, syncType, "failed", syncedBy, 0, 0, 0, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg, nil)
		return nil, fmt.Errorf(errMsg)
	}

	// Start monitoring
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Radius SSO", "radius", syncType, syncedBy, 0)
	}

	// Fetch all users from Radius API
	log.Printf("📥 [Radius Sync] Fetching data from Radius API...")
	users, err := s.radiusAPI.GetAllUsers()
	if err != nil {
		errMsg := fmt.Sprintf("failed to fetch users from Radius: %v", err)
		s.logSyncResult(ctx, syncType, "failed", syncedBy, 0, 0, 0, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg, nil)
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.FailSync(syncID, errMsg)
		}
		return nil, fmt.Errorf(errMsg)
	}

	log.Printf("📊 [Radius Sync] Total fetched from Radius API: %d records", len(users))

	// Update monitoring with total records
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, len(users))
	}

	// Transform data
	penggunaList := make([]*Pengguna, 0, len(users))
	for _, user := range users {
		p := s.transformRadiusUser(user)
		penggunaList = append(penggunaList, p)
	}

	// Bulk upsert with progress tracking
	totalSuccess := 0
	totalFailed := 0
	allErrors := make([]string, 0)

	// Process in batches of 100
	batchSize := 100
	totalBatches := (len(penggunaList) + batchSize - 1) / batchSize
	for i := 0; i < len(penggunaList); i += batchSize {
		end := i + batchSize
		if end > len(penggunaList) {
			end = len(penggunaList)
		}
		batch := penggunaList[i:end]
		batchNum := i/batchSize + 1

		result := s.repo.BulkUpsertPengguna(ctx, batch)
		totalSuccess += result.TotalSuccess
		totalFailed += result.TotalFailed
		allErrors = append(allErrors, result.Errors...)

		if result.TotalFailed > 0 {
			log.Printf("⚠️  [Radius Sync] Batch %d/%d: %d success, %d failed",
				batchNum, totalBatches, result.TotalSuccess, result.TotalFailed)
		} else {
			log.Printf("✅ [Radius Sync] Batch %d/%d: %d records synced",
				batchNum, totalBatches, result.TotalSuccess)
		}

		// Update monitoring progress
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.UpdateProgress(syncID, end, fmt.Sprintf("Processing batch %d/%d", batchNum, totalBatches))
		}
	}

	// Sync roles for each user
	log.Printf("🔄 [Radius Sync] Syncing roles for users...")
	rolesSynced := 0
	rolesErrors := 0
	for _, user := range users {
		if user.RolePengguna == nil {
			continue
		}
		// Get pengguna ID by username
		p, err := s.repo.GetPenggunaByUsername(ctx, user.Username)
		if err != nil || p == nil {
			continue
		}
		// Build role list
		roles := []*RolePengguna{
			{
				IDPeran:      user.RolePengguna.IDPeran,
				IDOrganisasi: &user.RolePengguna.IDOrganisasi,
			},
		}
		// Upsert roles
		roleResult := s.repo.UpsertRolePengguna(ctx, p.IDPengguna, roles)
		rolesSynced += roleResult.TotalSuccess
		rolesErrors += roleResult.TotalFailed
	}
	log.Printf("✅ [Radius Sync] Roles synced: %d success, %d failed", rolesSynced, rolesErrors)

	duration := time.Since(startTime)
	durationMs := int(duration.Milliseconds())

	// Determine status
	status := "success"
	if totalFailed > 0 && totalSuccess > 0 {
		status = "partial"
	} else if totalFailed > 0 && totalSuccess == 0 {
		status = "failed"
	}

	// Prepare error details for logging
	var errDetails *string
	if len(allErrors) > 0 {
		maxErrors := 10
		if len(allErrors) > maxErrors {
			errSummary := fmt.Sprintf("First %d of %d errors:\n%s\n... and %d more errors",
				maxErrors, len(allErrors),
				joinErrors(allErrors[:maxErrors]),
				len(allErrors)-maxErrors)
			errDetails = &errSummary
		} else {
			errSummary := joinErrors(allErrors)
			errDetails = &errSummary
		}
	}

	// Log sync result
	s.logSyncResult(ctx, syncType, status, syncedBy, len(users), 0, totalSuccess, totalFailed, 0, durationMs, nil, errDetails)

	// Complete monitoring
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d success, %d failed", totalSuccess, totalFailed))
	}

	result := &SyncResult{
		TotalProcessed: len(users),
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		TotalInserted:  0, // MERGE doesn't distinguish
		TotalUpdated:   totalSuccess,
		TotalSkipped:   0,
		Duration:       duration.String(),
		SyncedBy:       syncedBy,
		Source:         "api",
	}

	log.Printf("✅ [Radius Sync] Complete - %d processed, %d success, %d failed, duration: %s",
		result.TotalProcessed, result.TotalSuccess, result.TotalFailed, result.Duration)

	return result, nil
}

// SyncPengguna implements the interface for scheduler
func (s *service) SyncPengguna(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error) {
	var syncFilter *SyncFilter
	if filter != nil {
		if f, ok := filter.(*SyncFilter); ok {
			syncFilter = f
		}
	}
	if syncFilter == nil {
		syncFilter = &SyncFilter{SyncType: "scheduled"}
	}
	return s.SyncFromRadius(ctx, syncFilter, syncedBy)
}

// joinErrors joins error messages with newline
func joinErrors(errors []string) string {
	result := ""
	for i, e := range errors {
		if i > 0 {
			result += "\n"
		}
		result += e
	}
	return result
}

// logSyncResult logs the sync result to database
func (s *service) logSyncResult(ctx context.Context, syncType, status, syncedBy string, total, inserted, updated, failed, skipped, durationMs int, errMsg, errDetails *string) {
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		log.Printf("⚠️  [Radius Sync] Logger service not available, skipping log")
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Radius SSO",
		EndpointKey:   "radius",
		SyncType:      syncType,
		Status:        status,
		APICode:       "RADIUS",
		TotalRecords:  total,
		InsertedCount: inserted,
		UpdatedCount:  updated,
		FailedCount:   failed,
		SkippedCount:  skipped,
		DurationMs:    &durationMs,
		ErrorMessage:  errMsg,
		ErrorDetails:  errDetails,
		SyncedBy:      syncedBy,
	}

	_, err := loggerSvc.LogSync(ctx, req)
	if err != nil {
		log.Printf("⚠️  [Radius Sync] Failed to log sync result: %v", err)
	}
}

// transformRadiusUser transforms Radius API response to Pengguna entity
func (s *service) transformRadiusUser(user radius_api.SSOUser) *Pengguna {
	// Determine active status based on Status field
	// If status is not empty (e.g., "karyawan", "Mahasiswa"), consider active
	aAktif := 0
	if user.Status != "" {
		aAktif = 1
	}

	p := &Pengguna{
		Username:   user.Username,
		NmPengguna: user.NmPengguna,
		AAktif:     aAktif,
		Password:   user.PasswordHash, // SHA1 password from SSO API
	}

	if user.Email != "" {
		p.Email = &user.Email
	}

	// jenis_kelamin from peserta_didik/sdm, default 'L' if empty
	if user.JenisKelamin != "" {
		p.JenisKelamin = &user.JenisKelamin
	}

	// Reference IDs from PDUT (now at top level of API response)
	if user.IDPdPengguna != nil {
		p.IDPdPengguna = user.IDPdPengguna
	}
	if user.IDSdmPengguna != nil {
		p.IDSdmPengguna = user.IDSdmPengguna
	}
	if user.IDUserSikep != nil {
		p.IDUserSikep = user.IDUserSikep
	}

	return p
}

// Global service instance
var globalService Service

// SetService sets the global radius service
func SetService(svc Service) {
	globalService = svc
}

// GetService returns the global radius service
func GetService() Service {
	return globalService
}
