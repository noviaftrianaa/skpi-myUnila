package bidang

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/referensi/types"
	cache "github.com/myunila/api-service/external/redis"
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
	cacheKeyData := fmt.Sprintf("bidang_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangKerjasama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang kerjasama data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang kerjasama total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangPekerjaan mengambil daftar bidang pekerjaan dengan pagination
func (s *service) GetBidangPekerjaan(ctx context.Context, params types.PaginationParams) ([]BidangPekerjaan, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_pekerjaan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_pekerjaan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangPekerjaan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang pekerjaan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang pekerjaan total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangStudi mengambil daftar bidang studi dengan pagination dan filter
func (s *service) GetBidangStudi(ctx context.Context, params types.BidangStudiParams) ([]BidangStudi, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_studi:data:page:%d:limit:%d:induk:%v:kel:%v:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDIndukBidangStudi, params.Kelompok, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_studi:total:induk:%v:kel:%v:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:search:%s",
		params.IDIndukBidangStudi, params.Kelompok, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangStudi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangStudi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang studi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang studi total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangUsaha mengambil daftar bidang usaha dengan pagination
func (s *service) GetBidangUsaha(ctx context.Context, params types.PaginationParams) ([]BidangUsaha, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_usaha:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_usaha:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var bidangUsaha []BidangUsaha
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &bidangUsaha); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return bidangUsaha, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangUsaha(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang usaha data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang usaha total: %v", err)
		}
	}

	return data, total, nil
}
