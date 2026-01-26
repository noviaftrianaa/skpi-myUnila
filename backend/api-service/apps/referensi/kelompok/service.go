package kelompok

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
	GetKelompokBidang(ctx context.Context, params types.KelompokBidangParams) ([]KelompokBidang, int64, error)
	GetKelompokMk(ctx context.Context, params types.PaginationParams) ([]KelompokMk, int64, error)
	GetKelompokProfesi(ctx context.Context, params types.PaginationParams) ([]KelompokProfesi, int64, error)
	GetKelompokUsaha(ctx context.Context, params types.PaginationParams) ([]KelompokUsaha, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// KelompokBidang
// ============================================================================

func (s *service) GetKelompokBidang(ctx context.Context, params types.KelompokBidangParams) ([]KelompokBidang, int64, error) {
	cacheKeyData := fmt.Sprintf("kelompok_bidang:data:page:%d:limit:%d:kode:%v:nm:%v:induk:%v:sma:%v:smk:%v:pt:%v:iptek:%v:kepakaran:%v:leaf:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.KodeKelBidang, params.NmKelBidang, params.IDIndukBidang, params.USma, params.USmk, params.UPt, params.UIptek, params.UKepakaran, params.ALeafNode, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kelompok_bidang:total:kode:%v:nm:%v:induk:%v:sma:%v:smk:%v:pt:%v:iptek:%v:kepakaran:%v:leaf:%v:search:%s",
		params.KodeKelBidang, params.NmKelBidang, params.IDIndukBidang, params.USma, params.USmk, params.UPt, params.UIptek, params.UKepakaran, params.ALeafNode, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KelompokBidang
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kelompok bidang data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKelompokBidang(ctx, params)
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
// KelompokMk
// ============================================================================

func (s *service) GetKelompokMk(ctx context.Context, params types.PaginationParams) ([]KelompokMk, int64, error) {
	cacheKeyData := fmt.Sprintf("kelompok_mk:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kelompok_mk:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KelompokMk
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kelompok mk data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKelompokMk(ctx, params)
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
// KelompokProfesi
// ============================================================================

func (s *service) GetKelompokProfesi(ctx context.Context, params types.PaginationParams) ([]KelompokProfesi, int64, error) {
	cacheKeyData := fmt.Sprintf("kelompok_profesi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kelompok_profesi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KelompokProfesi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kelompok profesi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKelompokProfesi(ctx, params)
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
// KelompokUsaha
// ============================================================================

func (s *service) GetKelompokUsaha(ctx context.Context, params types.PaginationParams) ([]KelompokUsaha, int64, error) {
	cacheKeyData := fmt.Sprintf("kelompok_usaha:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kelompok_usaha:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KelompokUsaha
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kelompok usaha data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKelompokUsaha(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
