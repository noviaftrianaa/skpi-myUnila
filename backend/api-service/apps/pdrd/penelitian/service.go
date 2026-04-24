package penelitian

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

// Service adalah interface untuk business logic penelitian/publikasi
type Service interface {
	GetPublikasi(ctx context.Context, params types.PublikasiParams) ([]Publikasi, int64, error)
	GetLitabmas(ctx context.Context, params types.LitabmasParams) ([]Litabmas, int64, error)

	// Batch 9b — pivot tables
	GetTulisPub(ctx context.Context, p TulisPubParams) ([]TulisPub, int64, error)
	GetMitraLitabmas(ctx context.Context, p MitraLitabmasParams) ([]MitraLitabmas, int64, error)
	GetPdAngLitabmas(ctx context.Context, p PdAngLitabmasParams) ([]PdAngLitabmas, int64, error)
	GetSdmAnggotaLitabmas(ctx context.Context, p SdmAnggotaLitabmasParams) ([]SdmAnggotaLitabmas, int64, error)
	GetNonCaAnggotaLitabmas(ctx context.Context, p NonCaAnggotaLitabmasParams) ([]NonCaAnggotaLitabmas, int64, error)
	GetNonCa(ctx context.Context, p NonCaParams) ([]NonCa, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

// NewService membuat instance service baru
func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetPublikasi mengambil daftar publikasi dengan pagination dan caching
func (s *service) GetPublikasi(ctx context.Context, params types.PublikasiParams) ([]Publikasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("publikasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("publikasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Publikasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for publikasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPublikasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetLitabmas mengambil daftar litabmas (penelitian/pengabdian) dengan pagination dan caching
func (s *service) GetLitabmas(ctx context.Context, params types.LitabmasParams) ([]Litabmas, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("litabmas:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("litabmas:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Litabmas
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for litabmas data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetLitabmas(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
