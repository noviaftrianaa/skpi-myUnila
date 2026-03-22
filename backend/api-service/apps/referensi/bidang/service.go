package bidang

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
	GetBidangKerjasama(ctx context.Context, params types.PaginationParams) ([]BidangKerjasama, int64, error)
	GetBidangPekerjaan(ctx context.Context, params types.PaginationParams) ([]BidangPekerjaan, int64, error)
	GetBidangStudi(ctx context.Context, params types.BidangStudiParams) ([]BidangStudi, int64, error)
	GetBidangUsaha(ctx context.Context, params types.PaginationParams) ([]BidangUsaha, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetBidangKerjasama mengambil daftar bidang kerjasama dengan pagination
func (s *service) GetBidangKerjasama(ctx context.Context, params types.PaginationParams) ([]BidangKerjasama, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bidang_kerjasama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bidang_kerjasama:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BidangKerjasama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bidang kerjasama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBidangKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetBidangPekerjaan mengambil daftar bidang pekerjaan dengan pagination
func (s *service) GetBidangPekerjaan(ctx context.Context, params types.PaginationParams) ([]BidangPekerjaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bidang_pekerjaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bidang_pekerjaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BidangPekerjaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bidang pekerjaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBidangPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetBidangStudi mengambil daftar bidang studi dengan pagination dan filter
func (s *service) GetBidangStudi(ctx context.Context, params types.BidangStudiParams) ([]BidangStudi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bidang_studi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bidang_studi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BidangStudi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bidang studi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBidangStudi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetBidangUsaha mengambil daftar bidang usaha dengan pagination
func (s *service) GetBidangUsaha(ctx context.Context, params types.PaginationParams) ([]BidangUsaha, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("bidang_usaha:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("bidang_usaha:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BidangUsaha
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for bidang usaha data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBidangUsaha(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
