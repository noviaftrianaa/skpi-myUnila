package publikasi

import (
	"context"
	"log"
	"time"

	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"

	"github.com/jmoiron/sqlx"
)

// Service interface defines publikasi service methods
type Service interface {
	// Sync operations
	SyncPublikasiByIDSDM(idSDM string, syncedBy string) (*BatchPublikasiSyncResult, error)
	BatchSyncAllPublikasi(syncedBy string) (*BatchAllSyncResult, error)

	// Query operations
	GetPublikasiByID(idPublikasi string) (*Publikasi, error)
	GetPublikasiList(page, limit int, search string) (*PublikasiListResult, error)
	GetPublikasiStats() (*PublikasiStats, error)
	GetTulisPubByPublikasi(idPublikasi string) ([]*TulisPub, error)
}

type service struct {
	repo          Repository
	sisterAPI     *sister_api.Client
	loggerService appLogger.Service
}

// NewService creates a new publikasi service
func NewService(db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          NewRepository(db),
		sisterAPI:     sisterAPI,
		loggerService: loggerSvc,
	}
}

// GetPublikasiByID retrieves a single publikasi by ID
func (s *service) GetPublikasiByID(idPublikasi string) (*Publikasi, error) {
	return s.repo.GetPublikasiByID(idPublikasi)
}

// GetPublikasiList retrieves paginated list of publikasi
func (s *service) GetPublikasiList(page, limit int, search string) (*PublikasiListResult, error) {
	return s.repo.GetPublikasiList(page, limit, search)
}

// GetPublikasiStats retrieves publikasi statistics
func (s *service) GetPublikasiStats() (*PublikasiStats, error) {
	return s.repo.GetPublikasiStats()
}

// GetTulisPubByPublikasi retrieves all penulis for a publikasi
func (s *service) GetTulisPubByPublikasi(idPublikasi string) ([]*TulisPub, error) {
	return s.repo.GetTulisPubByPublikasi(idPublikasi)
}

// logSyncResult is a helper function to log sync results to database
func (s *service) logSyncResult(endpointName, endpointKey, syncType, syncedBy string, totalRecords, successCount, failedCount int, startTime time.Time, err error) {
	duration := time.Since(startTime)

	// Auto-detect sync type based on syncedBy value
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	var errorMessage, errorDetails *string
	status := "success"

	if err != nil {
		status = "failed"
		errMsg := err.Error()
		errorMessage = &errMsg
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
