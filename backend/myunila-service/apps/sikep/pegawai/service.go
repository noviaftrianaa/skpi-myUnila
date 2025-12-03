package pegawai

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for pegawai business logic
type Service interface {
	// List operations
	GetPegawaiList(ctx context.Context, page, limit int, search string, jnsTenaga, status *string, sortBy, sortOrder string) (*PegawaiListResult, error)
	GetPegawaiByID(ctx context.Context, idPegawai string) (*Pegawai, error)
	GetPegawaiStats(ctx context.Context) (*PegawaiStats, error)

	// Sync operations
	SyncPegawai(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
}

// SikepAPIClient interface for SIKEP API operations
type SikepAPIClient interface {
	// Authentication
	GetToken() error
	ForceRefreshToken() error
	TestConnection() error

	// SIKEP API endpoints
	GetPegawai(start, limit int) ([]map[string]interface{}, error)
}

// service implementation
type service struct {
	repo       Repository
	sikepAPI   SikepAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new pegawai service
func NewService(repo Repository, sikepAPI SikepAPIClient) Service {
	return &service{
		repo:       repo,
		sikepAPI:   sikepAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// GetPegawaiList retrieves paginated list of pegawai
func (s *service) GetPegawaiList(ctx context.Context, page, limit int, search string, jnsTenaga, status *string, sortBy, sortOrder string) (*PegawaiListResult, error) {
	return s.repo.GetPegawaiList(ctx, page, limit, search, jnsTenaga, status, sortBy, sortOrder)
}

// GetPegawaiByID retrieves a single pegawai by ID
func (s *service) GetPegawaiByID(ctx context.Context, idPegawai string) (*Pegawai, error) {
	return s.repo.GetPegawaiByID(ctx, idPegawai)
}

// GetPegawaiStats retrieves statistics for dashboard
func (s *service) GetPegawaiStats(ctx context.Context) (*PegawaiStats, error) {
	return s.repo.GetPegawaiStats(ctx)
}

// SyncPegawai syncs pegawai data from SIKEP API with automatic pagination
func (s *service) SyncPegawai(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()

	// Determine sync type
	syncType := "manual"
	if filter != nil && filter.SyncType != "" {
		syncType = filter.SyncType
	}

	// Default values - set limit to 0 for auto-pagination (sync all)
	start := 1
	limit := 0 // 0 means sync all with pagination
	batchSize := 500 // Fetch 500 records per API call
	if filter != nil {
		if filter.Start > 0 {
			start = filter.Start
		}
		if filter.Limit > 0 {
			limit = filter.Limit // If limit specified, only sync that many records
		}
	}

	log.Printf("🔄 [Pegawai Sync] Starting %s sync from SIKEP API - start: %d, limit: %s",
		syncType, start, func() string {
			if limit == 0 {
				return "all (auto-pagination)"
			}
			return fmt.Sprintf("%d", limit)
		}())

	// Start monitoring
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Pegawai SIKEP", "pegawai", syncType, syncedBy, 0)
	}

	// Collect all data with pagination
	allData := make([]map[string]interface{}, 0)
	currentStart := start
	fetchBatchSize := batchSize
	if limit > 0 && limit < batchSize {
		fetchBatchSize = limit
	}

	log.Printf("📥 [Pegawai Sync] Fetching data with pagination (batch size: %d)...", fetchBatchSize)

	for {
		data, err := s.sikepAPI.GetPegawai(currentStart, fetchBatchSize)
		if err != nil {
			if len(allData) == 0 {
				// First fetch failed - report error
				errMsg := fmt.Sprintf("failed to fetch pegawai from SIKEP: %v", err)
				s.logSyncResult(ctx, syncType, "failed", syncedBy, 0, 0, 0, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg, nil)
				if s.monitorSvc != nil && syncID != "" {
					s.monitorSvc.FailSync(syncID, errMsg)
				}
				return nil, fmt.Errorf(errMsg)
			}
			// Subsequent fetch failed - continue with what we have
			log.Printf("⚠️  [Pegawai Sync] API fetch failed at start=%d, continuing with %d records: %v", currentStart, len(allData), err)
			break
		}

		if len(data) == 0 {
			// No more data
			log.Printf("📊 [Pegawai Sync] No more data at start=%d", currentStart)
			break
		}

		allData = append(allData, data...)
		log.Printf("📊 [Pegawai Sync] Fetched %d records (total so far: %d)", len(data), len(allData))

		// Check if we've reached the limit
		if limit > 0 && len(allData) >= limit {
			allData = allData[:limit] // Trim to exact limit
			break
		}

		// If we got less than batch size, we've reached the end
		if len(data) < fetchBatchSize {
			break
		}

		// Move to next page
		currentStart += fetchBatchSize
	}

	log.Printf("📊 [Pegawai Sync] Total fetched from SIKEP API: %d records", len(allData))

	// Update monitoring with total records
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, len(allData))
	}

	// Transform data
	pegawaiList := make([]*Pegawai, 0, len(allData))
	for _, item := range allData {
		p := s.transformSikepData(item, syncedBy)
		pegawaiList = append(pegawaiList, p)
	}

	// Bulk upsert with progress tracking
	totalSuccess := 0
	totalFailed := 0
	totalUpdated := 0
	allErrors := make([]string, 0)

	// Process in batches of 100 for database upsert
	dbBatchSize := 100
	totalBatches := (len(pegawaiList) + dbBatchSize - 1) / dbBatchSize
	for i := 0; i < len(pegawaiList); i += dbBatchSize {
		end := i + dbBatchSize
		if end > len(pegawaiList) {
			end = len(pegawaiList)
		}
		batch := pegawaiList[i:end]
		batchNum := i/dbBatchSize + 1

		// Use repository with result tracking
		result := s.repo.BulkUpsertPegawaiWithResult(ctx, batch)
		totalSuccess += result.TotalSuccess
		totalFailed += result.TotalFailed
		totalUpdated += result.TotalSuccess // Assuming upserts are updates
		allErrors = append(allErrors, result.Errors...)

		if result.TotalFailed > 0 {
			log.Printf("⚠️  [Pegawai Sync] Batch %d/%d: %d success, %d failed",
				batchNum, totalBatches, result.TotalSuccess, result.TotalFailed)
		} else {
			log.Printf("✅ [Pegawai Sync] Batch %d/%d: %d records synced",
				batchNum, totalBatches, result.TotalSuccess)
		}

		// Update monitoring progress
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.UpdateProgress(syncID, end, fmt.Sprintf("Processing batch %d/%d", batchNum, totalBatches))
		}
	}

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
		// Limit error details to first 10 errors
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
	s.logSyncResult(ctx, syncType, status, syncedBy, len(allData), 0, totalUpdated, totalFailed, 0, durationMs, nil, errDetails)

	// Complete monitoring
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d success, %d failed", totalSuccess, totalFailed))
	}

	result := &SyncResult{
		TotalProcessed: len(allData),
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		Duration:       duration.String(),
		SyncedBy:       syncedBy,
	}

	log.Printf("✅ [Pegawai Sync] Complete - %d processed, %d success, %d failed, duration: %s",
		result.TotalProcessed, result.TotalSuccess, result.TotalFailed, result.Duration)

	return result, nil
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
	// Get logger service lazily at runtime
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		log.Printf("⚠️  [Pegawai Sync] Logger service not available, skipping log")
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Pegawai SIKEP",
		EndpointKey:   "pegawai",
		SyncType:      syncType,
		Status:        status,
		APICode:       "SIKEP",
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
		log.Printf("⚠️  [Pegawai Sync] Failed to log sync result: %v", err)
	}
}

// transformSikepData transforms SIKEP API response to Pegawai entity
func (s *service) transformSikepData(data map[string]interface{}, creatorID string) *Pegawai {
	p := &Pegawai{}

	// Helper function to get string value
	getString := func(key string) *string {
		if v, ok := data[key]; ok && v != nil {
			if str, ok := v.(string); ok && str != "" {
				return &str
			}
		}
		return nil
	}

	// Map fields from SIKEP API response
	if v := getString("idpegawai"); v != nil {
		p.IDPegawai = *v
	}
	if v := getString("nmpegawai"); v != nil {
		p.NmPegawai = *v
	}

	p.JK = getString("jnskel")
	p.NIP = getString("nip")
	p.NIDN = getString("nidn")
	p.TmpLahir = getString("tmplahir")
	p.TglLahir = getString("tgllahir")
	p.Alamat = getString("alamat")
	p.JnsPegawai = getString("jnspegawai")
	p.TmtCPNS = getString("tmtcpns")
	p.TmtPNS = getString("tmtpns")
	p.JnsTenaga = getString("jnstenaga")
	p.IDGolongan = getString("idgolongan")
	p.TmtGol = getString("tmtgol")
	p.IDFungsional = getString("idfungsional")
	p.TmtFung = getString("tmtfung")
	p.IDStruktural = getString("idstruktural")
	p.IDPendidikan = getString("idpendidikan")
	p.IDOrg1 = getString("idorg1")
	p.IDOrg2 = getString("idorg2")
	p.IDOrg3 = getString("idorg3")
	p.Status = getString("status")
	p.TmtPensiun = getString("tmtpensiun")

	// Set creator
	if creatorID != "" {
		p.IDCreator = &creatorID
	}

	return p
}
