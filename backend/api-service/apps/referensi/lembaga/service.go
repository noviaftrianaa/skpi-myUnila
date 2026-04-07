package lembaga

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
	GetLembagaAkred(ctx context.Context, params types.LembagaAkredParams) ([]LembagaAkred, int64, error)
	GetLembagaPengangkat(ctx context.Context, params types.PaginationParams) ([]LembagaPengangkat, int64, error)
	GetLembagaSertifikasi(ctx context.Context, params types.PaginationParams) ([]LembagaSertifikasi, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// LembagaAkred
// ============================================================================

func (s *service) GetLembagaAkred(ctx context.Context, params types.LembagaAkredParams) ([]LembagaAkred, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("lembaga_akred:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("lembaga_akred:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []LembagaAkred
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for lembaga akred data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetLembagaAkred(ctx, params)
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
// LembagaPengangkat
// ============================================================================

func (s *service) GetLembagaPengangkat(ctx context.Context, params types.PaginationParams) ([]LembagaPengangkat, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("lembaga_pengangkat:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("lembaga_pengangkat:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []LembagaPengangkat
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for lembaga pengangkat data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetLembagaPengangkat(ctx, params)
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
// LembagaSertifikasi
// ============================================================================

func (s *service) GetLembagaSertifikasi(ctx context.Context, params types.PaginationParams) ([]LembagaSertifikasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("lembaga_sertifikasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("lembaga_sertifikasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []LembagaSertifikasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for lembaga sertifikasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetLembagaSertifikasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
