package transkrip_nilai

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

type Service interface {
	GetList(ctx context.Context, filter *ListFilter) (*PaginatedResponse, error)
	GetStats(ctx context.Context) (*TranskripNilaiStats, error)
	GetProdiList(ctx context.Context) ([]*ProdiListItem, error)
	GetSemesterList(ctx context.Context) ([]*SemesterListItem, error)
	SyncTranskripNilai(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error)
}

type service struct {
	repo        Repository
	feederAPI   *feeder_api.FeederClient
	redisClient *redis.Client
	loggerSvc   logger.Service
}

func NewService(repo Repository, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	return &service{
		repo:        repo,
		feederAPI:   feederAPI,
		redisClient: redisClient,
		loggerSvc:   loggerSvc,
	}
}

func (s *service) GetList(ctx context.Context, filter *ListFilter) (*PaginatedResponse, error) {
	return s.repo.GetList(ctx, filter)
}

func (s *service) GetStats(ctx context.Context) (*TranskripNilaiStats, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) GetProdiList(ctx context.Context) ([]*ProdiListItem, error) {
	return s.repo.GetProdiList(ctx)
}

func (s *service) GetSemesterList(ctx context.Context) ([]*SemesterListItem, error) {
	return s.repo.GetSemesterList(ctx)
}
