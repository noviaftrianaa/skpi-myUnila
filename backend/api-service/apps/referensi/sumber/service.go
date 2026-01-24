package sumber

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
	GetSumberAir(ctx context.Context, params types.PaginationParams) ([]SumberAir, int64, error)
	GetSumberDana(ctx context.Context, params types.SumberDanaParams) ([]SumberDana, int64, error)
	GetSumberGaji(ctx context.Context, params types.PaginationParams) ([]SumberGaji, int64, error)
	GetSumberListrik(ctx context.Context, params types.PaginationParams) ([]SumberListrik, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// SumberAir
// ============================================================================

func (s *service) GetSumberAir(ctx context.Context, params types.PaginationParams) ([]SumberAir, int64, error) {
	cacheKeyData := fmt.Sprintf("sumber_air:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("sumber_air:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []SumberAir
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for sumber air data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSumberAir(ctx, params)
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
// SumberDana
// ============================================================================

func (s *service) GetSumberDana(ctx context.Context, params types.SumberDanaParams) ([]SumberDana, int64, error) {
	cacheKeyData := fmt.Sprintf("sumber_dana:data:page:%d:limit:%d:blockgrant:%v:beasiswa:%v:lit:%v:unit_usaha:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.UBlockgrant, params.UBeasiswa, params.ULit, params.UUnitUsaha, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("sumber_dana:total:blockgrant:%v:beasiswa:%v:lit:%v:unit_usaha:%v:search:%s",
		params.UBlockgrant, params.UBeasiswa, params.ULit, params.UUnitUsaha, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []SumberDana
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for sumber dana data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSumberDana(ctx, params)
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
// SumberGaji
// ============================================================================

func (s *service) GetSumberGaji(ctx context.Context, params types.PaginationParams) ([]SumberGaji, int64, error) {
	cacheKeyData := fmt.Sprintf("sumber_gaji:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("sumber_gaji:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []SumberGaji
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for sumber gaji data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSumberGaji(ctx, params)
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
// SumberListrik
// ============================================================================

func (s *service) GetSumberListrik(ctx context.Context, params types.PaginationParams) ([]SumberListrik, int64, error) {
	cacheKeyData := fmt.Sprintf("sumber_listrik:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("sumber_listrik:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []SumberListrik
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for sumber listrik data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSumberListrik(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
