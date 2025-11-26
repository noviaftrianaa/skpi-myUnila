package rencana_evaluasi

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
)

// Service interface for rencana_evaluasi business logic
type Service interface {
	// List operations
	GetRencanaEvaluasiList(ctx context.Context, page, limit int, search string, idMatkul *string, idProdi *string, sortBy, sortOrder string) (*RencanaEvaluasiListResult, error)
	GetRencanaEvaluasiByID(ctx context.Context, idReMk string) (*RencanaEvaluasi, error)

	// Utility operations
	GetJenisEvaluasiList(ctx context.Context) ([]*JenisEvaluasi, error)
	GetStats(ctx context.Context) (*RencanaEvaluasiStats, error)

	// Sync operations (implemented in sync_service.go)
	SyncRencanaEvaluasi(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchRencanaEvaluasiSyncResult, error)
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   FeederAPIClient
	redisClient *redis.Client
	loggerSvc   logger.Service
}

// FeederAPIClient interface for Feeder API operations
type FeederAPIClient interface {
	// Authentication
	TestConnection() error

	// Feeder API endpoints
	GetListRencanaEvaluasi(filter string, limit, offset int) ([]byte, error)
	GetJenisEvaluasi(filter string, limit, offset int) ([]byte, error)
}

// NewService creates a new rencana_evaluasi service
func NewService(
	repo Repository,
	feederAPI FeederAPIClient,
	redisClient *redis.Client,
	loggerSvc logger.Service,
) Service {
	return &service{
		repo:        repo,
		feederAPI:   feederAPI,
		redisClient: redisClient,
		loggerSvc:   loggerSvc,
	}
}

// GetRencanaEvaluasiList retrieves paginated list
func (s *service) GetRencanaEvaluasiList(ctx context.Context, page, limit int, search string, idMatkul *string, idProdi *string, sortBy, sortOrder string) (*RencanaEvaluasiListResult, error) {
	result, err := s.repo.GetRencanaEvaluasiList(ctx, page, limit, search, idMatkul, idProdi, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// GetRencanaEvaluasiByID retrieves a single rencana evaluasi by ID
func (s *service) GetRencanaEvaluasiByID(ctx context.Context, idReMk string) (*RencanaEvaluasi, error) {
	return s.repo.GetRencanaEvaluasiByID(ctx, idReMk)
}

// GetJenisEvaluasiList retrieves list of jenis evaluasi
func (s *service) GetJenisEvaluasiList(ctx context.Context) ([]*JenisEvaluasi, error) {
	return s.repo.GetJenisEvaluasiList(ctx)
}

// GetStats retrieves statistics
func (s *service) GetStats(ctx context.Context) (*RencanaEvaluasiStats, error) {
	return s.repo.GetStats(ctx)
}

// Sync operations are implemented in sync_service.go
