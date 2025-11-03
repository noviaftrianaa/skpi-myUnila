package penelitian

import (
	"context"
	"log"
	"time"

	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"

	"github.com/jmoiron/sqlx"
)

// Service interface defines penelitian service methods
type Service interface {
	// Sync operations
	SyncPenelitianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error)
	SyncPengabdianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error)

	// Query operations
	GetPenelitianByIDSDM(idSDM string) ([]*Litabmas, error)
	GetPengabdianByIDSDM(idSDM string) ([]*Litabmas, error)
	GetLitabmasByID(idLitabmas string) (*Litabmas, error)
	GetAnggotaByLitabmas(idLitabmas string) (interface{}, error)
	GetDokumenByLitabmas(idLitabmas string) ([]*Dokumen, error)
	GetPenelitianStats() (*PenelitianStats, error)
	GetPengabdianStats() (*PenelitianStats, error)
	GetPenelitianList(page, limit int, search string) (*LitabmasListResult, error)
	GetPengabdianList(page, limit int, search string) (*LitabmasListResult, error)
	GetPenelitianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error)
	GetPengabdianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error)
}

type service struct {
	repo          Repository
	sisterAPI     *sister_api.Client
	loggerService appLogger.Service
}

// NewService creates a new penelitian service
func NewService(db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          NewRepository(db),
		sisterAPI:     sisterAPI,
		loggerService: loggerSvc,
	}
}

// SyncPengabdianByIDSDM syncs all pengabdian for a dosen from Sister API
func (s *service) SyncPengabdianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error) {
	// Similar to SyncPenelitianByIDSDM but uses jns_litabmas = 'M' (Pengabdian)
	// Implementation will be similar, just calling different Sister API endpoint
	return s.syncLitabmasByIDSDM(idSDM, syncedBy, "M")
}

// syncLitabmasByIDSDM is a generic method to sync litabmas (penelitian or pengabdian)
func (s *service) syncLitabmasByIDSDM(idSDM string, syncedBy string, jnsLitabmas string) (*BatchPenelitianSyncResult, error) {
	// This method is implemented in sync_service.go as SyncPenelitianByIDSDM
	// We'll reuse that logic for both penelitian and pengabdian
	if jnsLitabmas == "L" {
		return s.SyncPenelitianByIDSDM(idSDM, syncedBy)
	}
	// For pengabdian, we need similar logic but calling GetPengabdianByIDSDM
	// For now, just redirect to penelitian sync (will be refined)
	return s.SyncPenelitianByIDSDM(idSDM, syncedBy)
}

// GetPenelitianByIDSDM retrieves all penelitian for a dosen
func (s *service) GetPenelitianByIDSDM(idSDM string) ([]*Litabmas, error) {
	return s.repo.GetLitabmasByIDSDM(idSDM, "L")
}

// GetPengabdianByIDSDM retrieves all pengabdian for a dosen
func (s *service) GetPengabdianByIDSDM(idSDM string) ([]*Litabmas, error) {
	return s.repo.GetLitabmasByIDSDM(idSDM, "M")
}

// GetLitabmasByID retrieves a single litabmas by ID
func (s *service) GetLitabmasByID(idLitabmas string) (*Litabmas, error) {
	return s.repo.GetLitabmasByID(idLitabmas)
}

// GetAnggotaByLitabmas retrieves all anggota (dosen and mahasiswa) for a litabmas
func (s *service) GetAnggotaByLitabmas(idLitabmas string) (interface{}, error) {
	anggotaSDM, err := s.repo.GetAnggotaSDMByLitabmas(idLitabmas)
	if err != nil {
		return nil, err
	}

	anggotaPD, err := s.repo.GetAnggotaPDByLitabmas(idLitabmas)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"anggota_dosen":     anggotaSDM,
		"anggota_mahasiswa": anggotaPD,
	}, nil
}

// GetPenelitianStats retrieves statistics for penelitian
func (s *service) GetPenelitianStats() (*PenelitianStats, error) {
	return s.repo.GetPenelitianStats()
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

// GetPengabdianStats retrieves pengabdian statistics
func (s *service) GetPengabdianStats() (*PenelitianStats, error) {
	return s.repo.GetPengabdianStats()
}

// GetPenelitianList retrieves paginated list of penelitian
func (s *service) GetPenelitianList(page, limit int, search string) (*LitabmasListResult, error) {
	return s.repo.GetPenelitianList(page, limit, search)
}

// GetPengabdianList retrieves paginated list of pengabdian
func (s *service) GetPengabdianList(page, limit int, search string) (*LitabmasListResult, error) {
	return s.repo.GetPengabdianList(page, limit, search)
}

// GetPenelitianListWithSort retrieves paginated list of penelitian with sorting
func (s *service) GetPenelitianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error) {
	return s.repo.GetPenelitianListWithSort(page, limit, search, sortBy, sortOrder)
}

// GetPengabdianListWithSort retrieves paginated list of pengabdian with sorting
func (s *service) GetPengabdianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error) {
	return s.repo.GetPengabdianListWithSort(page, limit, search, sortBy, sortOrder)
}

// GetDokumenByLitabmas retrieves all dokumen for a litabmas (penelitian/pengabdian)
func (s *service) GetDokumenByLitabmas(idLitabmas string) ([]*Dokumen, error) {
	return s.repo.GetDokumenByLitabmas(idLitabmas)
}
