package wisuda

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for wisuda business logic
type Service interface {
	GetWisudaList(ctx context.Context, filter *WisudaListFilter) (*WisudaPaginatedResult, error)
	GetWisudaStats(ctx context.Context) (*WisudaStats, error)
	GetWisudaFilterOptions(ctx context.Context) (*WisudaFilterOptions, error)
	GetPeriodeList(ctx context.Context) ([]*WisudaPeriode, error)
	SyncWisuda(ctx context.Context, syncedBy string) (*SyncResult, error)
}

// SiakaduAPIClient interface for SIAKADU API operations needed by wisuda
type SiakaduAPIClient interface {
	GetWisudaPeriode() ([]map[string]interface{}, error)
	GetWisudaPeserta(idPeriode, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error)
}

// service implementation
type service struct {
	repo       Repository
	siakaduAPI SiakaduAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new wisuda service
func NewService(repo Repository, siakaduAPI SiakaduAPIClient) Service {
	return &service{
		repo:       repo,
		siakaduAPI: siakaduAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// GetWisudaList retrieves paginated list of wisuda peserta
func (s *service) GetWisudaList(ctx context.Context, filter *WisudaListFilter) (*WisudaPaginatedResult, error) {
	return s.repo.GetWisudaList(ctx, filter)
}

// GetWisudaStats retrieves wisuda statistics
func (s *service) GetWisudaStats(ctx context.Context) (*WisudaStats, error) {
	return s.repo.GetWisudaStats(ctx)
}

// GetWisudaFilterOptions retrieves available filter options for wisuda list
func (s *service) GetWisudaFilterOptions(ctx context.Context) (*WisudaFilterOptions, error) {
	return s.repo.GetWisudaFilterOptions(ctx)
}

// GetPeriodeList retrieves all wisuda periods
func (s *service) GetPeriodeList(ctx context.Context) ([]*WisudaPeriode, error) {
	return s.repo.GetPeriodeList(ctx)
}

// SyncWisuda syncs wisuda data (periods + participants) from SIAKADU API
func (s *service) SyncWisuda(ctx context.Context, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()

	log.Printf("🔄 [Wisuda Sync] Starting sync from SIAKADU API")

	// Ensure schema
	if err := s.repo.EnsureWisudaSchema(ctx); err != nil {
		return nil, fmt.Errorf("schema check failed: %w", err)
	}

	// Start monitoring
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Wisuda SIAKADU", "siakadu_wisuda", "manual", syncedBy, 0)
	}

	totalInserted := 0
	totalUpdated := 0
	totalErrors := 0

	// Step 1: Sync periode wisuda
	log.Printf("🔄 [Wisuda Sync] Step 1: Syncing periode wisuda...")
	periodeData, err := s.siakaduAPI.GetWisudaPeriode()
	if err != nil {
		errMsg := fmt.Sprintf("failed to fetch wisuda periode: %v", err)
		s.logSyncResult(ctx, "manual", "failed", syncedBy, 0, 0, 0, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg, nil)
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.FailSync(syncID, errMsg)
		}
		return nil, fmt.Errorf(errMsg)
	}

	log.Printf("📊 [Wisuda Sync] Fetched %d periode wisuda", len(periodeData))

	for _, item := range periodeData {
		isNew, err := s.repo.UpsertPeriode(ctx, item)
		if err != nil {
			totalErrors++
			log.Printf("⚠️  [Wisuda Sync] Failed to upsert periode: %v", err)
			continue
		}
		if isNew {
			totalInserted++
		} else {
			totalUpdated++
		}
	}

	// Step 2: Sync peserta wisuda for each periode
	log.Printf("🔄 [Wisuda Sync] Step 2: Syncing peserta wisuda...")
	for pIdx, periode := range periodeData {
		idPeriode := getString(periode, "id_periode_wisuda")
		if idPeriode == nil || *idPeriode == "" {
			continue
		}

		// Rate limit: delay 300ms between periodes
		if pIdx > 0 {
			time.Sleep(300 * time.Millisecond)
		}

		currentPage := 1
		batchSize := 500

		for {
			// Retry with backoff on 429
			var data []map[string]interface{}
			var fetchErr error
			for attempt := 0; attempt < 3; attempt++ {
				data, _, fetchErr = s.siakaduAPI.GetWisudaPeserta(*idPeriode, "", currentPage, batchSize)
				if fetchErr == nil {
					break
				}
				if strings.Contains(fetchErr.Error(), "429") {
					backoff := time.Duration(2<<attempt) * time.Second
					log.Printf("⏳ [Wisuda Sync] Rate limited, waiting %v before retry...", backoff)
					time.Sleep(backoff)
					continue
				}
				break
			}
			err := fetchErr
			if err != nil {
				log.Printf("⚠️  [Wisuda Sync] Failed to fetch peserta for periode %s page %d: %v", *idPeriode, currentPage, err)
				totalErrors++
				break
			}

			if len(data) == 0 {
				break
			}

			// Debug: dump first item fields
			if currentPage == 1 && pIdx == 0 && len(data) > 0 {
				log.Printf("🔍 [Wisuda Sync] Sample peserta fields:")
				for k, v := range data[0] {
					log.Printf("   %s = %v (%T)", k, v, v)
				}
			}

			for _, item := range data {
				// Inject id_periode_wisuda from outer loop context
				item["id_periode_wisuda"] = *idPeriode
				isNew, err := s.repo.UpsertPeserta(ctx, item)
				if err != nil {
					totalErrors++
					log.Printf("⚠️  [Wisuda Sync] Failed to upsert peserta: %v", err)
					continue
				}
				if isNew {
					totalInserted++
				} else {
					totalUpdated++
				}
			}

			log.Printf("📊 [Wisuda Sync] Synced %d peserta from periode %s page %d",
				len(data), *idPeriode, currentPage)

			if len(data) < batchSize {
				break
			}
			currentPage++
		}
	}

	duration := time.Since(startTime)
	totalFetched := totalInserted + totalUpdated + totalErrors

	// Determine status
	status := "success"
	if totalErrors > 0 && (totalInserted+totalUpdated) > 0 {
		status = "partial"
	} else if totalErrors > 0 && (totalInserted+totalUpdated) == 0 {
		status = "failed"
	}

	// Log sync result
	s.logSyncResult(ctx, "manual", status, syncedBy, totalFetched, totalInserted, totalUpdated, totalErrors, 0,
		int(duration.Milliseconds()), nil, nil)

	// Complete monitoring
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d inserted, %d updated, %d errors",
			totalInserted, totalUpdated, totalErrors))
	}

	result := &SyncResult{
		TotalFetched:  totalFetched,
		TotalInserted: totalInserted,
		TotalUpdated:  totalUpdated,
		TotalErrors:   totalErrors,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
	}

	log.Printf("✅ [Wisuda Sync] Complete - %d fetched, %d inserted, %d updated, %d errors, duration: %s",
		result.TotalFetched, result.TotalInserted, result.TotalUpdated, result.TotalErrors, result.Duration)

	return result, nil
}

// logSyncResult logs the sync result to database
func (s *service) logSyncResult(ctx context.Context, syncType, status, syncedBy string, total, inserted, updated, failed, skipped, durationMs int, errMsg, errDetails *string) {
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		log.Printf("⚠️  [Wisuda Sync] Logger service not available, skipping log")
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Wisuda SIAKADU",
		EndpointKey:   "siakadu_wisuda",
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
		log.Printf("⚠️  [Wisuda Sync] Failed to log sync result: %v", err)
	}
}
