package tingkat

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
	GetTingkatKerjasama(ctx context.Context, params types.PaginationParams) ([]TingkatKerjasama, int64, error)
	GetTingkatPenghargaan(ctx context.Context, params types.PaginationParams) ([]TingkatPenghargaan, int64, error)
	GetTingkatPrestasi(ctx context.Context, params types.PaginationParams) ([]TingkatPrestasi, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// TingkatKerjasama
// ============================================================================

func (s *service) GetTingkatKerjasama(ctx context.Context, params types.PaginationParams) ([]TingkatKerjasama, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tingkat_kerjasama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tingkat_kerjasama:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []TingkatKerjasama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tingkat kerjasama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTingkatKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// ============================================================================
// TingkatPenghargaan
// ============================================================================

func (s *service) GetTingkatPenghargaan(ctx context.Context, params types.PaginationParams) ([]TingkatPenghargaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tingkat_penghargaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tingkat_penghargaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []TingkatPenghargaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tingkat penghargaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTingkatPenghargaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// ============================================================================
// TingkatPrestasi
// ============================================================================

func (s *service) GetTingkatPrestasi(ctx context.Context, params types.PaginationParams) ([]TingkatPrestasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tingkat_prestasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tingkat_prestasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []TingkatPrestasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tingkat prestasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTingkatPrestasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
