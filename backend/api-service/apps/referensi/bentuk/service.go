package bentuk

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
	cacheKeyData := fmt.Sprintf("bentuk_kegiatan_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bentuk_kegiatan_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BentukKegiatanKerjasama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBentukKegiatanKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk kegiatan kerjasama data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk kegiatan kerjasama total: %v", err)
		}
	}

	return data, total, nil
}

// GetBentukPendidikan mengambil daftar bentuk pendidikan dengan pagination dan filter
func (s *service) GetBentukPendidikan(ctx context.Context, params types.BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
	cacheKeyData := fmt.Sprintf("bentuk_pendidikan:data:page:%d:limit:%d:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Aktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bentuk_pendidikan:total:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:aktif:%v:search:%s",
		params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Aktif, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BentukPendidikan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBentukPendidikan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk pendidikan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk pendidikan total: %v", err)
		}
	}

	return data, total, nil
}
