package kkn

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

const cacheTTL = 10 * time.Minute

type Service interface {
	ListPeserta(ctx context.Context, p PesertaParams) ([]PesertaKKN, int64, error)
	DetailPeserta(ctx context.Context, npm string) (*DetailPesertaKKN, error)
	ListKelompok(ctx context.Context, p KelompokParams) ([]KelompokKKN, int64, error)
	ListDPL(ctx context.Context, p DPLParams) ([]DPLKKN, int64, error)
	ListNilai(ctx context.Context, p NilaiParams) ([]NilaiKKN, int64, error)
	ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKKN, int64, error)
	ListLokasi(ctx context.Context, p LokasiParams) ([]LokasiKKN, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "kkn:"+key+":data", "kkn:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tk); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
				return data, total, nil
			}
		}
	}
	data, total, err := fetch()
	if err != nil {
		return nil, 0, err
	}
	dj, _ := json.Marshal(data)
	tj, _ := json.Marshal(total)
	cache.Set(ctx, d, string(dj), cacheTTL)
	cache.Set(ctx, tk, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) ListPeserta(ctx context.Context, p PesertaParams) ([]PesertaKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("peserta:%s", utils.HashParams(p)),
		func() ([]PesertaKKN, int64, error) { return s.repo.ListPeserta(ctx, p) })
}

func (s *service) DetailPeserta(ctx context.Context, npm string) (*DetailPesertaKKN, error) {
	return s.repo.DetailPeserta(ctx, npm)
}

func (s *service) ListKelompok(ctx context.Context, p KelompokParams) ([]KelompokKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("kelompok:%s", utils.HashParams(p)),
		func() ([]KelompokKKN, int64, error) { return s.repo.ListKelompok(ctx, p) })
}

func (s *service) ListDPL(ctx context.Context, p DPLParams) ([]DPLKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("dpl:%s", utils.HashParams(p)),
		func() ([]DPLKKN, int64, error) { return s.repo.ListDPL(ctx, p) })
}

func (s *service) ListNilai(ctx context.Context, p NilaiParams) ([]NilaiKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("nilai:%s", utils.HashParams(p)),
		func() ([]NilaiKKN, int64, error) { return s.repo.ListNilai(ctx, p) })
}

func (s *service) ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("periode:%s", utils.HashParams(p)),
		func() ([]PeriodeKKN, int64, error) { return s.repo.ListPeriode(ctx, p) })
}

func (s *service) ListLokasi(ctx context.Context, p LokasiParams) ([]LokasiKKN, int64, error) {
	return cached(ctx, fmt.Sprintf("lokasi:%s", utils.HashParams(p)),
		func() ([]LokasiKKN, int64, error) { return s.repo.ListLokasi(ctx, p) })
}
