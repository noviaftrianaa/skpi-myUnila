package kategori

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
	GetKategoriCapaianLuaran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianLuaran, int64, error)
	GetKategoriKegiatan(ctx context.Context, params types.KategoriKegiatanParams) ([]KategoriKegiatan, int64, error)
	GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetKategoriCapaianLuaran mengambil daftar kategori capaian luaran dengan pagination
func (s *service) GetKategoriCapaianLuaran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianLuaran, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kategori_capaian_iuran:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kategori_capaian_iuran:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KategoriCapaianLuaran
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kategori capaian iuran data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKategoriCapaianLuaran(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetKategoriKegiatan mengambil daftar kategori kegiatan dengan pagination dan filter
func (s *service) GetKategoriKegiatan(ctx context.Context, params types.KategoriKegiatanParams) ([]KategoriKegiatan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kategori_kegiatan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kategori_kegiatan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KategoriKegiatan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kategori kegiatan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKategoriKegiatan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetKategoriTabel mengambil daftar kategori tabel dengan pagination dan filter
func (s *service) GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kategori_tabel:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kategori_tabel:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KategoriTabel
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kategori tabel data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKategoriTabel(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
