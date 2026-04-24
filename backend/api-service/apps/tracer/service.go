package tracer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

const cacheTTL = 5 * time.Minute // tracer data berubah via POST/PUT, TTL pendek

type Service interface {
	// hasil_tracer_study
	ListHasilTracer(ctx context.Context, p HasilTracerParams) ([]HasilTracerStudy, int64, error)
	GetHasilTracer(ctx context.Context, id string) (*HasilTracerStudy, error)
	CreateHasilTracer(ctx context.Context, in HasilTracerCreate) (string, error)
	UpdateHasilTracer(ctx context.Context, id string, in HasilTracerUpdate) error
	DeleteHasilTracer(ctx context.Context, id, idUpdater string) error

	// hasil_tracer_atasan
	ListHasilTracerAtasan(ctx context.Context, p HasilTracerAtasanParams) ([]HasilTracerAtasan, int64, error)
	GetHasilTracerAtasan(ctx context.Context, id string) (*HasilTracerAtasan, error)
	CreateHasilTracerAtasan(ctx context.Context, in HasilTracerAtasanCreate) (string, error)
	UpdateHasilTracerAtasan(ctx context.Context, id string, in HasilTracerAtasanUpdate) error
	DeleteHasilTracerAtasan(ctx context.Context, id, idUpdater string) error

	// umr_wilayah
	ListUmrWilayah(ctx context.Context, p UmrWilayahParams) ([]UmrWilayah, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "tracer:"+key+":data", "tracer:"+key+":total"
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

// invalidateList hapus semua cached list entries (best-effort, by key prefix).
// SIMPLE: set TTL to 0 dgn nil value. Redis MCD nanti — untuk sekarang biarkan
// TTL pendek (5 menit) auto-expire.

func (s *service) ListHasilTracer(ctx context.Context, p HasilTracerParams) ([]HasilTracerStudy, int64, error) {
	return cached(ctx, fmt.Sprintf("list:%s", utils.HashParams(p)),
		func() ([]HasilTracerStudy, int64, error) { return s.repo.ListHasilTracer(ctx, p) })
}

func (s *service) GetHasilTracer(ctx context.Context, id string) (*HasilTracerStudy, error) {
	return s.repo.GetHasilTracer(ctx, id)
}

func (s *service) CreateHasilTracer(ctx context.Context, in HasilTracerCreate) (string, error) {
	id, err := s.repo.CreateHasilTracer(ctx, in)
	if err != nil {
		log.Printf("create hasil_tracer: %v", err)
	}
	return id, err
}

func (s *service) UpdateHasilTracer(ctx context.Context, id string, in HasilTracerUpdate) error {
	return s.repo.UpdateHasilTracer(ctx, id, in)
}

func (s *service) DeleteHasilTracer(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteHasilTracer(ctx, id, idUpdater)
}

func (s *service) ListHasilTracerAtasan(ctx context.Context, p HasilTracerAtasanParams) ([]HasilTracerAtasan, int64, error) {
	return cached(ctx, fmt.Sprintf("atasan:%s", utils.HashParams(p)),
		func() ([]HasilTracerAtasan, int64, error) { return s.repo.ListHasilTracerAtasan(ctx, p) })
}
func (s *service) GetHasilTracerAtasan(ctx context.Context, id string) (*HasilTracerAtasan, error) {
	return s.repo.GetHasilTracerAtasan(ctx, id)
}
func (s *service) CreateHasilTracerAtasan(ctx context.Context, in HasilTracerAtasanCreate) (string, error) {
	return s.repo.CreateHasilTracerAtasan(ctx, in)
}
func (s *service) UpdateHasilTracerAtasan(ctx context.Context, id string, in HasilTracerAtasanUpdate) error {
	return s.repo.UpdateHasilTracerAtasan(ctx, id, in)
}
func (s *service) DeleteHasilTracerAtasan(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteHasilTracerAtasan(ctx, id, idUpdater)
}

func (s *service) ListUmrWilayah(ctx context.Context, p UmrWilayahParams) ([]UmrWilayah, int64, error) {
	return cached(ctx, fmt.Sprintf("umr:%s", utils.HashParams(p)),
		func() ([]UmrWilayah, int64, error) { return s.repo.ListUmrWilayah(ctx, p) })
}
