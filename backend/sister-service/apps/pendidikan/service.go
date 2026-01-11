package pendidikan

import (
	"context"
	"fmt"
	"log"
	"time"

	appLogger "sister-service/apps/logger"
	"sister-service/pkg/timeutil"

	"github.com/jmoiron/sqlx"
)

type Service interface {
	SyncPendidikanFormalByIDSDM(idSDM, syncedBy string) (*BatchPendidikanFormalSyncResult, error)
	BatchSyncAllPendidikanFormal(syncedBy string) (*BatchAllSyncResult, error)
	GetPendidikanFormalByIDSDM(idSDM string) ([]*RwyPendFormal, error)
	GetPendidikanFormalByID(idRwyDidikFormal string) (*RwyPendFormal, error)
	GetPendidikanFormalStats() (*PendidikanFormalStats, error)
	GetPendidikanFormalList(page, limit int, search, sortBy, sortOrder string) (*PendidikanFormalListResult, error)
}

type service struct {
	repo          Repository
	syncService   SyncService
	db            *sqlx.DB
	loggerService appLogger.Service
}

func NewService(repo Repository, syncService SyncService, db *sqlx.DB, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          repo,
		syncService:   syncService,
		db:            db,
		loggerService: loggerSvc,
	}
}

// SyncPendidikanFormalByIDSDM syncs pendidikan formal for a single dosen
func (s *service) SyncPendidikanFormalByIDSDM(idSDM, syncedBy string) (*BatchPendidikanFormalSyncResult, error) {
	result, err := s.syncService.SyncPendidikanFormalByIDSDM(idSDM, syncedBy)

	// Don't log here - will be logged by BatchSyncAllPendidikanFormal if called from scheduler

	return result, err
}

// BatchSyncAllPendidikanFormal syncs pendidikan formal for all dosen
func (s *service) BatchSyncAllPendidikanFormal(syncedBy string) (*BatchAllSyncResult, error) {
	startTime := timeutil.NowWIB()
	log.Printf("🚀 Starting batch sync all pendidikan formal (synced_by: %s)", syncedBy)

	// Get all dosen from database
	dosenList, err := s.getAllDosen()
	if err != nil {
		log.Printf("❌ Failed to get dosen list: %v", err)
		return nil, fmt.Errorf("failed to get dosen list: %w", err)
	}

	totalDosen := len(dosenList)
	log.Printf("📋 Found %d dosen to sync", totalDosen)

	totalSuccess := 0
	totalFailed := 0
	totalPendidikanFormal := 0
	failedDosen := []string{}

	// Process each dosen
	for i, dosen := range dosenList {
		log.Printf("📚 [%d/%d] Syncing pendidikan formal for dosen: %s (%s)",
			i+1, totalDosen, dosen.NmSDM, dosen.IDSDM)

		result, err := s.syncService.SyncPendidikanFormalByIDSDM(dosen.IDSDM, syncedBy)
		if err != nil {
			log.Printf("❌ Failed to sync pendidikan formal for dosen %s: %v", dosen.NmSDM, err)
			totalFailed++
			failedDosen = append(failedDosen, fmt.Sprintf("%s (%s)", dosen.NmSDM, dosen.IDSDM))
			continue
		}

		if result.TotalFailed > 0 {
			log.Printf("⚠️  Partial sync for dosen %s: Success=%d, Failed=%d",
				dosen.NmSDM, result.TotalSuccess, result.TotalFailed)
		}

		totalSuccess++
		totalPendidikanFormal += result.TotalSuccess

		// Small delay to avoid overwhelming the API
		time.Sleep(100 * time.Millisecond)
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync all pendidikan formal completed - Total Dosen: %d, Success: %d, Failed: %d, Total Pendidikan Formal: %d, Duration: %s",
		totalDosen, totalSuccess, totalFailed, totalPendidikanFormal, duration)

	// Log batch sync result
	s.logSyncResult("Batch Sync All Pendidikan Formal", "all_dosen", syncedBy, totalPendidikanFormal, totalPendidikanFormal-totalFailed, totalFailed, startTime, nil)

	return &BatchAllSyncResult{
		TotalDosen:            totalDosen,
		TotalSuccess:          totalSuccess,
		TotalFailed:           totalFailed,
		TotalPendidikanFormal: totalPendidikanFormal,
		Duration:              duration.String(),
		SyncedBy:              syncedBy,
		FailedDosen:           failedDosen,
	}, nil
}

// GetPendidikanFormalByIDSDM retrieves all pendidikan formal for a dosen
func (s *service) GetPendidikanFormalByIDSDM(idSDM string) ([]*RwyPendFormal, error) {
	return s.repo.GetPendidikanFormalByIDSDM(idSDM)
}

// GetPendidikanFormalByID retrieves a single pendidikan formal by ID
func (s *service) GetPendidikanFormalByID(idRwyDidikFormal string) (*RwyPendFormal, error) {
	return s.repo.GetPendidikanFormalByID(idRwyDidikFormal)
}

// GetPendidikanFormalStats retrieves statistics for pendidikan formal
func (s *service) GetPendidikanFormalStats() (*PendidikanFormalStats, error) {
	return s.repo.GetPendidikanFormalStats()
}

// GetPendidikanFormalList retrieves paginated list of pendidikan formal
func (s *service) GetPendidikanFormalList(page, limit int, search, sortBy, sortOrder string) (*PendidikanFormalListResult, error) {
	return s.repo.GetPendidikanFormalList(page, limit, search, sortBy, sortOrder)
}

// Helper: Get all dosen from database
type DosenInfo struct {
	IDSDM string `db:"id_sdm"`
	NmSDM string `db:"nm_sdm"`
}

func (s *service) getAllDosen() ([]DosenInfo, error) {
	query := `
		SELECT
			CONVERT(VARCHAR(36), id_sdm) as id_sdm,
			nm_sdm
		FROM pdrd.sdm WITH (NOLOCK)
		WHERE soft_delete = 0
			AND id_sdm IS NOT NULL
		ORDER BY nm_sdm
	`

	var dosenList []DosenInfo
	err := s.db.Select(&dosenList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query dosen: %w", err)
	}

	return dosenList, nil
}

// logSyncResult is a helper function to log sync results to database
func (s *service) logSyncResult(endpointName, endpointKey, syncedBy string, totalRecords, successCount, failedCount int, startTime time.Time, err error) {
	duration := time.Since(startTime)

	// Auto-detect sync type based on syncedBy value
	syncType := "manual"
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	var errorMessage, errorDetails *string
	status := "success"

	if err != nil {
		status = "failed"
		errMsg := err.Error()
		errorMessage = &errMsg
	} else if failedCount > 0 && successCount > 0 {
		status = "partial"
	} else if failedCount > 0 {
		status = "failed"
	}

	durationMs := int(duration.Milliseconds())
	req := &appLogger.CreateSyncLogRequest{
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
		ErrorMessage:  errorMessage,
		ErrorDetails:  errorDetails,
	}

	if status == "failed" && totalRecords == 0 {
		req.FailedCount = 1
		req.InsertedCount = 0
	}

	_, logErr := s.loggerService.LogSync(context.Background(), req)
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}
}
