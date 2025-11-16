package mahasiswa

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
)

// Service interface for mahasiswa business logic
type Service interface {
	// List operations
	GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string) (*MahasiswaListResult, error)
	GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error)
	GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error)

	// Utility operations
	GetAngkatanList(ctx context.Context) ([]string, error)
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)

	// Sync operations (implemented in sync_service.go)
	SyncMahasiswaByAngkatan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchMahasiswaSyncResult, error)
	SyncSingleMahasiswaTest(ctx context.Context, idRegPd string) (*MahasiswaSyncResult, error)

	// Token management
	ForceRefreshToken() error
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   FeederAPIClient
	redisClient *redis.Client
	// loggerService will be added when implementing logging
}

// FeederAPIClient interface for Feeder API operations
type FeederAPIClient interface {
	// Authentication
	GetToken() error
	ForceRefreshToken() error

	// Feeder API endpoints
	GetDataLengkapMahasiswaProdi(idProdi string, filter string, limit, offset int) ([]byte, error)
	GetListRiwayatPendidikanMahasiswa(idRegPd string) ([]byte, error)
	GetDetailMahasiswaLulusDO(idRegPd string) ([]byte, error)
	GetListPerkuliahanMahasiswa(idRegPd string) ([]byte, error)
}

// NewService creates a new mahasiswa service
func NewService(
	repo Repository,
	feederAPI FeederAPIClient,
	redisClient *redis.Client,
) Service {
	return &service{
		repo:        repo,
		feederAPI:   feederAPI,
		redisClient: redisClient,
	}
}

// GetMahasiswaList retrieves paginated list of mahasiswa
func (s *service) GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string) (*MahasiswaListResult, error) {
	// Validation: Angkatan is REQUIRED
	if len(angkatan) == 0 {
		return nil, fmt.Errorf("filter angkatan is required")
	}

	// Delegate to repository
	return s.repo.GetMahasiswaList(ctx, page, limit, search, angkatan, idProdi)
}

// GetMahasiswaByID retrieves a single mahasiswa by ID
func (s *service) GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error) {
	return s.repo.GetMahasiswaByID(ctx, idPD)
}

// GetMahasiswaStats retrieves statistics for dashboard
func (s *service) GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error) {
	return s.repo.GetMahasiswaStats(ctx)
}

// GetAngkatanList retrieves available angkatan list
func (s *service) GetAngkatanList(ctx context.Context) ([]string, error) {
	return s.repo.GetAngkatanList(ctx)
}

// GetProdiList retrieves list of prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// ForceRefreshToken forces token refresh for scheduled jobs
func (s *service) ForceRefreshToken() error {
	log.Println("🔄 [Mahasiswa Service] Forcing Feeder API token refresh...")
	return s.feederAPI.ForceRefreshToken()
}

// Sync operations are implemented in sync_service.go
// This separation keeps the service.go file clean and focused on CRUD operations
