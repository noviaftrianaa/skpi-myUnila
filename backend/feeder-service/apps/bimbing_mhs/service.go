package bimbing_mhs

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
)

// Service interface for bimbing_mhs business logic
type Service interface {
	// List operations
	GetList(ctx context.Context, filter *ListFilter) (*BimbingMhsListResult, error)
	GetStats(ctx context.Context) (*BimbingMhsStats, error)
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)

	// Sync operations
	SyncBimbingMhs(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error)

	// Test endpoints - for testing API response structures
	TestGetDosenPembimbing(ctx context.Context, filter string, limit int) ([]byte, error)
	TestGetMahasiswaBimbinganDosen(ctx context.Context, filter string, limit int) ([]byte, error)
	TestGetListBimbingMahasiswa(ctx context.Context, filter string, limit int) ([]byte, error)
}

// FeederAPIClient interface for Feeder API operations
type FeederAPIClient interface {
	// Authentication
	GetToken() error
	ForceRefreshToken() error
	TestConnection() error

	// Bimbingan endpoints
	GetDosenPembimbing(filter string, limit, offset int) ([]byte, error)
	GetMahasiswaBimbinganDosen(filter string, limit, offset int) ([]byte, error)
	GetListBimbingMahasiswa(filter string, limit, offset int) ([]byte, error)
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   FeederAPIClient
	redisClient *redis.Client
	loggerSvc   logger.Service
}

// NewService creates a new bimbing_mhs service
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

// GetList retrieves paginated list of bimbing_mhs
func (s *service) GetList(ctx context.Context, filter *ListFilter) (*BimbingMhsListResult, error) {
	return s.repo.GetList(ctx, filter)
}

// GetStats retrieves statistics for dashboard
func (s *service) GetStats(ctx context.Context) (*BimbingMhsStats, error) {
	return s.repo.GetStats(ctx)
}

// GetProdiList retrieves list of active prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// TestGetDosenPembimbing tests the GetDosenPembimbing endpoint and returns raw JSON
func (s *service) TestGetDosenPembimbing(ctx context.Context, filter string, limit int) ([]byte, error) {
	return s.feederAPI.GetDosenPembimbing(filter, limit, 0)
}

// TestGetMahasiswaBimbinganDosen tests the GetMahasiswaBimbinganDosen endpoint and returns raw JSON
func (s *service) TestGetMahasiswaBimbinganDosen(ctx context.Context, filter string, limit int) ([]byte, error) {
	return s.feederAPI.GetMahasiswaBimbinganDosen(filter, limit, 0)
}

// TestGetListBimbingMahasiswa tests the GetListBimbingMahasiswa endpoint and returns raw JSON
func (s *service) TestGetListBimbingMahasiswa(ctx context.Context, filter string, limit int) ([]byte, error) {
	return s.feederAPI.GetListBimbingMahasiswa(filter, limit, 0)
}
