package jenis

import (
	"context"

	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/redis/go-redis/v9"
)

// Service adalah interface untuk business logic jenis referensi
type Service interface {
	GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error)
	GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error)
	GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error)
	GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error)
	GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error)
	GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error)
	GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error)
	GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error)
	GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error)
	GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error)
	GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error)
	GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error)
	GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error)
	GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{
		repo:  repo,
		rConn: rConn,
	}
}

func (s *service) GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisAktMhs(ctx, params)
}

func (s *service) GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisBahanAjar(ctx, params)
}

func (s *service) GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisBeasiswa(ctx, params)
}

func (s *service) GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisDiklat(ctx, params)
}

func (s *service) GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisDokumen(ctx, params)
}

func (s *service) GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisEvaluasi(ctx, params)
}

func (s *service) GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisHapusBuku(ctx, params)
}

func (s *service) GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisJalurPekerjaan(ctx, params)
}

func (s *service) GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisKeluar(ctx, params)
}

func (s *service) GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisKepanitiaan(ctx, params)
}

func (s *service) GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisKesejahteraan(ctx, params)
}

func (s *service) GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisKeuangan(ctx, params)
}

func (s *service) GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisLembaga(ctx, params)
}

func (s *service) GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error) {
	params.NormalizePagination()
	return s.repo.GetJenisMediaPub(ctx, params)
}
