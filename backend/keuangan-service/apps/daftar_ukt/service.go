package daftar_ukt

import (
	"context"

	"github.com/google/uuid"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/external/simpedam"
)

type Service interface {
	GetDaftarUKTList(ctx context.Context, tahun int, page, limit int) (*DaftarUKTListResult, error)
	GetDaftarUKTByID(ctx context.Context, id string) (*DaftarUKT, error)
	SyncDaftarUKT(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	GetProdiMappings(ctx context.Context) ([]ProdiMapping, error)
	GetStats(ctx context.Context) (*DaftarUktStats, error)
	GetFakultasList(ctx context.Context) ([]FakultasOption, error)
	GetProdiList(ctx context.Context) ([]ProdiOption, error)
}

type service struct {
	repo         Repository
	simpedamAPI  *simpedam.Client
	loggerSvc    logger.Service
}

func NewService(repo Repository, simpedamAPI *simpedam.Client, loggerSvc logger.Service) Service {
	return &service{
		repo:        repo,
		simpedamAPI: simpedamAPI,
		loggerSvc:   loggerSvc,
	}
}

func (s *service) GetDaftarUKTList(ctx context.Context, tahun int, page, limit int) (*DaftarUKTListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetDaftarUKTList(ctx, tahun, page, limit)
}

func (s *service) GetDaftarUKTByID(ctx context.Context, id string) (*DaftarUKT, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetDaftarUKTByID(ctx, uid)
}

func (s *service) GetProdiMappings(ctx context.Context) ([]ProdiMapping, error) {
	return s.repo.GetAllProdiMappings(ctx)
}

func (s *service) GetStats(ctx context.Context) (*DaftarUktStats, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) GetFakultasList(ctx context.Context) ([]FakultasOption, error) {
	return s.repo.GetFakultasList(ctx)
}

func (s *service) GetProdiList(ctx context.Context) ([]ProdiOption, error) {
	return s.repo.GetProdiList(ctx)
}
