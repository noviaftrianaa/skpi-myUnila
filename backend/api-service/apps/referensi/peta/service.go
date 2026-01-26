package peta

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
	GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error)
	GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error)
	GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// PetaKatgiatJabfung
// ============================================================================

func (s *service) GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error) {
	cacheKeyData := fmt.Sprintf("peta_katgiat_jabfung:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("peta_katgiat_jabfung:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PetaKatgiatJabfung
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for peta katgiat jabfung data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPetaKatgiatJabfung(ctx, params)
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
// PetaKatgiatJnsdok
// ============================================================================

func (s *service) GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error) {
	cacheKeyData := fmt.Sprintf("peta_katgiat_jnsdok:data:page:%d:limit:%d:jnsdok:%d:wajib:%d:urut:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDJnsDok, params.AWajib, params.NoUrut, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("peta_katgiat_jnsdok:total:jnsdok:%d:wajib:%d:urut:%d:search:%s",
		params.IDJnsDok, params.AWajib, params.NoUrut, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PetaKatgiatJnsdok
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for peta katgiat jnsdok data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPetaKatgiatJnsdok(ctx, params)
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
// PetaKatgiatJnspub
// ============================================================================

func (s *service) GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error) {
	cacheKeyData := fmt.Sprintf("peta_katgiat_jnspub:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("peta_katgiat_jnspub:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PetaKatgiatJnspub
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for peta katgiat jnspub data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPetaKatgiatJnspub(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
