package bentuk

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/referensi/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

type Service interface {
	GetBentukKegiatanKerjasama(ctx context.Context, params types.PaginationParams) ([]BentukKegiatanKerjasama, int64, error)
	GetBentukPendidikan(ctx context.Context, params types.BentukPendidikanParams) ([]BentukPendidikan, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetBentukKegiatanKerjasama mengambil daftar bentuk kegiatan kerjasama dengan pagination
func (s *service) GetBentukKegiatanKerjasama(ctx context.Context, params types.PaginationParams) ([]BentukKegiatanKerjasama, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bentuk_kegiatan_kerjasama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bentuk_kegiatan_kerjasama:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BentukKegiatanKerjasama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bentuk kegiatan kerjasama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBentukKegiatanKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetBentukPendidikan mengambil daftar bentuk pendidikan dengan pagination dan filter
func (s *service) GetBentukPendidikan(ctx context.Context, params types.BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bentuk_pendidikan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bentuk_pendidikan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BentukPendidikan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bentuk pendidikan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBentukPendidikan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
