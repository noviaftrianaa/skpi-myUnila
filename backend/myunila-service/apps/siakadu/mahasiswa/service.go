package mahasiswa

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for mahasiswa business logic
type Service interface {
	GetMahasiswaList(ctx context.Context, filter *MahasiswaListFilter) (*PaginatedResult, error)
	GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error)
	GetStats(ctx context.Context) (*SyncStats, error)
	GetFilterOptions(ctx context.Context) (*FilterOptions, error)
	SyncMahasiswa(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	SyncAllProdi(ctx context.Context, syncedBy string) ([]*ProdiSyncResult, error)
	SyncDetailEnrichment(ctx context.Context, limit int, syncedBy string) (*SyncResult, error)
	SyncFull(ctx context.Context, detailLimit int, syncedBy string) (*SyncFullResult, error)
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
func (s *service) GetMahasiswaList(ctx context.Context, filter *MahasiswaListFilter) (*PaginatedResult, error) {
	return s.repo.GetMahasiswaList(ctx, filter)
}

// GetFilterOptions retrieves available filter options for mahasiswa list
func (s *service) GetFilterOptions(ctx context.Context) (*FilterOptions, error) {
	return s.repo.GetFilterOptions(ctx)
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
		// v2.0: Single UpsertMahasiswa replaces UpsertPesertaDidik + UpsertRegPd
		isNew, err := s.repo.UpsertMahasiswa(ctx, item)
		if err != nil {
			totalErrors++
			nim := ""
			if v, ok := item["nim"].(string); ok {
				nim = v
			}
			errMsg := fmt.Sprintf("mahasiswa %s: %v", nim, err)
			allErrors = append(allErrors, errMsg)
			log.Printf("⚠️  [Mahasiswa Sync] %s", errMsg)
			continue
		}

		if isNew {
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

// SyncDetailEnrichment - Pass 2: Fetch detail for stale NIMs and enrich all 131 fields + keluarga
func (s *service) SyncDetailEnrichment(ctx context.Context, limit int, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()

	if limit <= 0 {
		limit = 100
	}

	log.Printf("🔄 [Detail Enrichment] Starting — fetching up to %d stale NIMs", limit)

	// Get NIMs that haven't been detail-synced in 168 hours (7 days)
	nims, err := s.repo.GetStaleNIMs(ctx, 168, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get stale NIMs: %w", err)
	}

	if len(nims) == 0 {
		log.Printf("✅ [Detail Enrichment] No stale NIMs found — all up to date")
		return &SyncResult{Duration: time.Since(startTime).String(), SyncedBy: syncedBy}, nil
	}

	log.Printf("📊 [Detail Enrichment] Found %d stale NIMs to enrich", len(nims))

	totalUpdated := 0
	totalErrors := 0
	consecutiveErrors := 0

	for i, nim := range nims {
		// Rate limiting: 200ms between requests to avoid 429
		if i > 0 {
			time.Sleep(200 * time.Millisecond)
		}

		// Retry with backoff on 429
		var detail map[string]interface{}
		var fetchErr error
		for attempt := 0; attempt < 3; attempt++ {
			detail, fetchErr = s.siakaduAPI.GetMahasiswaDetail(nim)
			if fetchErr == nil {
				break
			}
			// Check if 429 rate limit
			if strings.Contains(fetchErr.Error(), "429") {
				backoff := time.Duration(2<<attempt) * time.Second // 2s, 4s, 8s
				log.Printf("⏳ [Detail Enrichment] Rate limited, waiting %v before retry...", backoff)
				time.Sleep(backoff)
				continue
			}
			break // Non-429 error, don't retry
		}

		if fetchErr != nil {
			totalErrors++
			consecutiveErrors++
			log.Printf("⚠️  [Detail Enrichment] [%d/%d] Failed to fetch detail for %s: %v", i+1, len(nims), nim, fetchErr)
			// If too many consecutive errors, pause longer
			if consecutiveErrors >= 10 {
				log.Printf("⏳ [Detail Enrichment] Too many consecutive errors, pausing 30s...")
				time.Sleep(30 * time.Second)
				consecutiveErrors = 0
			}
			continue
		}
		consecutiveErrors = 0

		// Upsert full detail into siakadu.mahasiswa
		_, err = s.repo.UpsertMahasiswa(ctx, detail)
		if err != nil {
			totalErrors++
			log.Printf("⚠️  [Detail Enrichment] [%d/%d] Failed to upsert %s: %v", i+1, len(nims), nim, err)
			continue
		}

		// Upsert keluarga if present
		if keluargaRaw, ok := detail["keluarga"]; ok && keluargaRaw != nil {
			if keluargaSlice, ok := keluargaRaw.([]interface{}); ok {
				if err := s.repo.UpsertKeluargaMhs(ctx, nim, keluargaSlice); err != nil {
					log.Printf("⚠️  [Detail Enrichment] [%d/%d] keluarga upsert failed for %s: %v", i+1, len(nims), nim, err)
				}
			}
		}

		totalUpdated++

		if (i+1)%50 == 0 {
			log.Printf("📊 [Detail Enrichment] Progress: %d/%d enriched, %d errors", i+1, len(nims), totalErrors)
		}
	}

	duration := time.Since(startTime)
	result := &SyncResult{
		TotalFetched:  len(nims),
		TotalUpdated:  totalUpdated,
		TotalErrors:   totalErrors,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
	}

	log.Printf("✅ [Detail Enrichment] Done — %d enriched, %d errors, duration: %s",
		totalUpdated, totalErrors, duration)

	return result, nil
}

// SyncFull - Full sync: list all prodi first, then detail enrichment in parallel
func (s *service) SyncFull(ctx context.Context, detailLimit int, syncedBy string) (*SyncFullResult, error) {
	startTime := time.Now()

	if detailLimit <= 0 {
		detailLimit = 500
	}

	log.Printf("🚀 [SyncFull] Starting full sync (list + detail enrichment)")

	// Step 1: Sync all prodi (list sync)
	prodiResults, err := s.SyncAllProdi(ctx, syncedBy)
	if err != nil {
		return nil, fmt.Errorf("list sync failed: %w", err)
	}

	// Aggregate list sync results
	listResult := &SyncResult{SyncedBy: syncedBy}
	for _, pr := range prodiResults {
		if pr.SyncResult != nil {
			listResult.TotalFetched += pr.TotalFetched
			listResult.TotalInserted += pr.TotalInserted
			listResult.TotalUpdated += pr.TotalUpdated
			listResult.TotalErrors += pr.TotalErrors
		}
	}
	listResult.Duration = time.Since(startTime).String()

	log.Printf("📊 [SyncFull] List sync done — fetched: %d, inserted: %d, updated: %d",
		listResult.TotalFetched, listResult.TotalInserted, listResult.TotalUpdated)

	// Step 2: Detail enrichment (runs after list sync completes)
	detailResult, err := s.SyncDetailEnrichment(ctx, detailLimit, syncedBy)
	if err != nil {
		log.Printf("⚠️  [SyncFull] Detail enrichment failed: %v", err)
		// Don't fail the whole operation, return partial result
		detailResult = &SyncResult{SyncedBy: syncedBy, Duration: "failed"}
	}

	totalDuration := time.Since(startTime)
	log.Printf("✅ [SyncFull] Complete — total duration: %s", totalDuration)

	return &SyncFullResult{
		ListSync:      listResult,
		DetailSync:    detailResult,
		TotalDuration: totalDuration.String(),
	}, nil
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
