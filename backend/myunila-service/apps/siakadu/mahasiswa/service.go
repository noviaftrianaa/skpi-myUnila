package mahasiswa

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for mahasiswa business logic
type Service interface {
	GetMahasiswaList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error)
	GetStats(ctx context.Context) (*SyncStats, error)
	SyncMahasiswa(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	SyncAllProdi(ctx context.Context, syncedBy string) ([]*ProdiSyncResult, error)
}

// SiakaduAPIClient interface for SIAKADU API operations
type SiakaduAPIClient interface {
	Login() error
	ForceRefreshToken() error
	TestConnection() error
	GetMahasiswa(page, pageSize int, idUnit string) ([]map[string]interface{}, int, error)
	GetMahasiswaDetail(nim string) (map[string]interface{}, error)
}

// service implementation
type service struct {
	repo       Repository
	siakaduAPI SiakaduAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new mahasiswa service
func NewService(repo Repository, siakaduAPI SiakaduAPIClient) Service {
	return &service{
		repo:       repo,
		siakaduAPI: siakaduAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// GetMahasiswaList retrieves paginated list of mahasiswa
func (s *service) GetMahasiswaList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	return s.repo.GetMahasiswaList(ctx, page, limit, search)
}

// GetMahasiswaByNIM retrieves a single mahasiswa by NIM
func (s *service) GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error) {
	return s.repo.GetMahasiswaByNIM(ctx, nim)
}

// GetStats retrieves sync statistics
func (s *service) GetStats(ctx context.Context) (*SyncStats, error) {
	return s.repo.GetStats(ctx)
}

// SyncMahasiswa syncs mahasiswa data from SIAKADU API with automatic pagination
func (s *service) SyncMahasiswa(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()

	syncType := "manual"
	if filter != nil && filter.SyncType != "" {
		syncType = filter.SyncType
	}

	batchSize := 500
	idUnit := ""
	if filter != nil {
		if filter.PageSize > 0 {
			batchSize = filter.PageSize
		}
		idUnit = filter.IdUnit
	}

	log.Printf("🔄 [Mahasiswa Sync] Starting %s sync from SIAKADU API - batchSize: %d, idUnit: %s",
		syncType, batchSize, idUnit)

	// Ensure reference data and schema columns exist
	if err := s.repo.EnsureReferenceData(ctx); err != nil {
		log.Printf("⚠️  [Mahasiswa Sync] EnsureReferenceData warning: %v", err)
	}

	// Start monitoring
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Mahasiswa SIAKADU", "siakadu_mahasiswa", syncType, syncedBy, 0)
	}

	// Fetch all data with pagination
	allData := make([]map[string]interface{}, 0)
	currentPage := 1

	for {
		data, totalCount, err := s.siakaduAPI.GetMahasiswa(currentPage, batchSize, idUnit)
		if err != nil {
			if len(allData) == 0 {
				errMsg := fmt.Sprintf("failed to fetch mahasiswa from SIAKADU: %v", err)
				s.logSyncResult(ctx, syncType, "failed", syncedBy, 0, 0, 0, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg, nil)
				if s.monitorSvc != nil && syncID != "" {
					s.monitorSvc.FailSync(syncID, errMsg)
				}
				return nil, fmt.Errorf(errMsg)
			}
			log.Printf("⚠️  [Mahasiswa Sync] API fetch failed at page=%d, continuing with %d records: %v", currentPage, len(allData), err)
			break
		}

		if len(data) == 0 {
			break
		}

		allData = append(allData, data...)
		log.Printf("📊 [Mahasiswa Sync] Fetched page %d: %d records (total so far: %d / %d)",
			currentPage, len(data), len(allData), totalCount)

		if len(data) < batchSize {
			break
		}

		currentPage++
	}

	log.Printf("📊 [Mahasiswa Sync] Total fetched from SIAKADU API: %d records", len(allData))

	// Debug: dump first record fields
	if len(allData) > 0 {
		log.Printf("🔍 [Mahasiswa Sync] Sample record fields:")
		for k, v := range allData[0] {
			log.Printf("   %s = %v (type: %T)", k, v, v)
		}
	}

	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, len(allData))
	}

	// Process records
	totalInserted := 0
	totalUpdated := 0
	totalSkipped := 0
	totalErrors := 0
	allErrors := make([]string, 0)

	for i, item := range allData {
		// Upsert peserta_didik
		isNew, err := s.repo.UpsertPesertaDidik(ctx, item)
		if err != nil {
			totalErrors++
			nim := ""
			if v, ok := item["nim"].(string); ok {
				nim = v
			}
			errMsg := fmt.Sprintf("peserta_didik %s: %v", nim, err)
			allErrors = append(allErrors, errMsg)
			log.Printf("⚠️  [Mahasiswa Sync] %s", errMsg)
			continue
		}

		// Upsert reg_pd
		isNewReg, err := s.repo.UpsertRegPd(ctx, item)
		if err != nil {
			totalErrors++
			nim := ""
			if v, ok := item["nim"].(string); ok {
				nim = v
			}
			errMsg := fmt.Sprintf("reg_pd %s: %v", nim, err)
			allErrors = append(allErrors, errMsg)
			log.Printf("⚠️  [Mahasiswa Sync] %s", errMsg)
			continue
		}

		if isNew || isNewReg {
			totalInserted++
		} else {
			totalUpdated++
		}

		// Update monitoring progress periodically
		if s.monitorSvc != nil && syncID != "" && (i+1)%100 == 0 {
			s.monitorSvc.UpdateProgress(syncID, i+1, fmt.Sprintf("Processing %d/%d", i+1, len(allData)))
		}
	}

	duration := time.Since(startTime)

	// Determine status
	status := "success"
	if totalErrors > 0 && (totalInserted+totalUpdated) > 0 {
		status = "partial"
	} else if totalErrors > 0 && (totalInserted+totalUpdated) == 0 {
		status = "failed"
	}

	// Prepare error details
	var errDetails *string
	if len(allErrors) > 0 {
		maxErrors := 10
		if len(allErrors) > maxErrors {
			errSummary := fmt.Sprintf("First %d of %d errors:\n%s\n... and %d more",
				maxErrors, len(allErrors), joinErrors(allErrors[:maxErrors]), len(allErrors)-maxErrors)
			errDetails = &errSummary
		} else {
			errSummary := joinErrors(allErrors)
			errDetails = &errSummary
		}
	}

	// Log sync result
	s.logSyncResult(ctx, syncType, status, syncedBy, len(allData), totalInserted, totalUpdated, totalErrors, totalSkipped,
		int(duration.Milliseconds()), nil, errDetails)

	// Complete monitoring
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d inserted, %d updated, %d errors",
			totalInserted, totalUpdated, totalErrors))
	}

	result := &SyncResult{
		TotalFetched:  len(allData),
		TotalInserted: totalInserted,
		TotalUpdated:  totalUpdated,
		TotalSkipped:  totalSkipped,
		TotalErrors:   totalErrors,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
	}

	log.Printf("✅ [Mahasiswa Sync] Complete - %d fetched, %d inserted, %d updated, %d errors, duration: %s",
		result.TotalFetched, result.TotalInserted, result.TotalUpdated, result.TotalErrors, result.Duration)

	return result, nil
}

// joinErrors joins error messages with newline
// SyncAllProdi syncs mahasiswa for all active prodi in ref_unit sequentially
func (s *service) SyncAllProdi(ctx context.Context, syncedBy string) ([]*ProdiSyncResult, error) {
	// Get all prodi from ref_unit
	prodis, err := s.repo.GetAllProdiIDs(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %v", err)
	}

	if len(prodis) == 0 {
		return nil, fmt.Errorf("no prodi found in ref_unit — sync unit first via POST /siakadu/referensi/unit/sync")
	}

	log.Printf("🔄 [SyncAllProdi] Starting sync for %d prodi", len(prodis))

	results := make([]*ProdiSyncResult, 0, len(prodis))

	for i, prodi := range prodis {
		nmUnit := "Unknown"
		if prodi.NmUnit != nil {
			nmUnit = *prodi.NmUnit
		}
		log.Printf("📊 [SyncAllProdi] [%d/%d] Syncing %s (%s)", i+1, len(prodis), nmUnit, prodi.IdUnit)

		result, err := s.SyncMahasiswa(ctx, &SyncFilter{
			IdUnit:   prodi.IdUnit,
			PageSize: 500,
			SyncType: "auto-all",
		}, syncedBy)

		pr := &ProdiSyncResult{
			IdUnit:  prodi.IdUnit,
			NmUnit:  nmUnit,
		}
		if err != nil {
			pr.SyncResult = &SyncResult{TotalErrors: 1, Duration: "0s", SyncedBy: syncedBy}
			log.Printf("❌ [SyncAllProdi] %s failed: %v", prodi.IdUnit, err)
		} else {
			pr.SyncResult = result
		}
		results = append(results, pr)
	}

	log.Printf("✅ [SyncAllProdi] Done — %d prodi synced", len(results))
	return results, nil
}

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
		log.Printf("⚠️  [Mahasiswa Sync] Logger service not available, skipping log")
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Mahasiswa SIAKADU",
		EndpointKey:   "siakadu_mahasiswa",
		SyncType:      syncType,
		Status:        status,
		APICode:       "SIAKADU",
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
		log.Printf("⚠️  [Mahasiswa Sync] Failed to log sync result: %v", err)
	}
}
