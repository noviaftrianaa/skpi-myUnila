package nilai_perkuliahan

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Service interface for nilai_perkuliahan business logic
type Service interface {
	// List operations
	GetNilaiPerkuliahanList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, idKelas *string, sortBy, sortOrder string) (*NilaiPerkuliahanListResult, error)
	GetNilaiByKelas(ctx context.Context, idKls string) ([]*NilaiPerkuliahanListItem, error)

	// Helper operations
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)
	GetKelasListBySemesterAndProdi(ctx context.Context, idSemester []string, idProdi *string) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*NilaiPerkuliahanStats, error)

	// Sync operations
	SyncNilaiPerkuliahan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchNilaiSyncResult, error)
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   *feeder_api.FeederClient
	redisClient *redis.Client
	loggerSvc   logger.Service
	syncSvc     SyncService
}

// NewService creates a new nilai_perkuliahan service
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

// GetNilaiPerkuliahanList retrieves paginated list of nilai perkuliahan
func (s *service) GetNilaiPerkuliahanList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, idKelas *string, sortBy, sortOrder string) (*NilaiPerkuliahanListResult, error) {
	return s.repo.GetNilaiPerkuliahanList(ctx, page, limit, search, idSemester, idProdi, idKelas, sortBy, sortOrder)
}

// GetNilaiByKelas retrieves all nilai for a specific kelas
func (s *service) GetNilaiByKelas(ctx context.Context, idKls string) ([]*NilaiPerkuliahanListItem, error) {
	return s.repo.GetNilaiByKelas(ctx, idKls)
}

// GetProdiList retrieves list of active prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// GetSemesterList retrieves list of semesters with nilai data
func (s *service) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetSemesterList(ctx)
}

// GetKelasListBySemesterAndProdi retrieves list of kelas for sync dropdown
func (s *service) GetKelasListBySemesterAndProdi(ctx context.Context, idSemester []string, idProdi *string) ([]map[string]interface{}, error) {
	return s.repo.GetKelasListBySemesterAndProdi(ctx, idSemester, idProdi)
}

// GetStats retrieves nilai perkuliahan statistics
func (s *service) GetStats(ctx context.Context) (*NilaiPerkuliahanStats, error) {
	return s.repo.GetStats(ctx)
}

// SyncNilaiPerkuliahan syncs nilai perkuliahan from Neo Feeder API
func (s *service) SyncNilaiPerkuliahan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchNilaiSyncResult, error) {
	return s.syncSvc.SyncNilaiPerkuliahan(ctx, filter, syncedBy)
}
