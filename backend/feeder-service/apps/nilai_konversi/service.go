package nilai_konversi

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Service interface for nilai_konversi business logic
type Service interface {
	// List operations
	GetNilaiKonversiList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, jenisKonversi *string, sortBy, sortOrder string) (*PaginatedResponse, error)

	// Helper operations
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*NilaiKonversiStats, error)

	// Sync operations
	SyncNilaiKonversi(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   *feeder_api.FeederClient
	redisClient *redis.Client
	loggerSvc   logger.Service
	syncSvc     SyncService
}

// NewService creates a new nilai_konversi service
func NewService(repo Repository, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	syncSvc := NewSyncService(repo, feederAPI, loggerSvc)
	return &service{
		repo:        repo,
		feederAPI:   feederAPI,
		redisClient: redisClient,
		loggerSvc:   loggerSvc,
		syncSvc:     syncSvc,
	}
}

// GetNilaiKonversiList retrieves paginated list of nilai konversi (combined view)
func (s *service) GetNilaiKonversiList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, jenisKonversi *string, sortBy, sortOrder string) (*PaginatedResponse, error) {
	return s.repo.GetNilaiKonversiList(ctx, page, limit, search, idSemester, idProdi, jenisKonversi, sortBy, sortOrder)
}

// GetProdiList retrieves list of active prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// GetSemesterList retrieves list of semesters with nilai konversi/transfer data
func (s *service) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetSemesterList(ctx)
}

// GetStats retrieves nilai konversi statistics
func (s *service) GetStats(ctx context.Context) (*NilaiKonversiStats, error) {
	return s.repo.GetStats(ctx)
}

// SyncNilaiKonversi syncs nilai konversi and nilai transfer from Neo Feeder API
func (s *service) SyncNilaiKonversi(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	return s.syncSvc.SyncNilaiKonversi(ctx, filter, syncedBy)
}
