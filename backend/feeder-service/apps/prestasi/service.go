package prestasi

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

type Service interface {
	GetList(ctx context.Context, filter *ListFilter) (*PrestasiListResult, error)
	GetStats(ctx context.Context) (*PrestasiStats, error)
	GetTahunList(ctx context.Context) ([]*TahunListItem, error)
	SyncPrestasi(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error)
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

func (s *service) GetList(ctx context.Context, filter *ListFilter) (*PrestasiListResult, error) {
	return s.repo.GetList(ctx, filter)
}

func (s *service) GetStats(ctx context.Context) (*PrestasiStats, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) GetTahunList(ctx context.Context) ([]*TahunListItem, error) {
	return s.repo.GetTahunList(ctx)
}
