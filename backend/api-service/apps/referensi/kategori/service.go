package kategori

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
	cacheKeyData := fmt.Sprintf("kategori_capaian_iuran:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kategori_capaian_iuran:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []KategoriCapaianLuaran
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for kategori capaian iuran data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetKategoriCapaianLuaran(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori capaian iuran data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori capaian iuran total: %v", err)
		}
	}

	return data, total, nil
}

// GetKategoriKegiatan mengambil daftar kategori kegiatan dengan pagination dan filter
func (s *service) GetKategoriKegiatan(ctx context.Context, params types.KategoriKegiatanParams) ([]KategoriKegiatan, int64, error) {
	cacheKeyData := fmt.Sprintf("kategori_kegiatan:data:page:%d:limit:%d:induk:%v:jns_sdm:%v:kat_pak:%v:kat_bkd:%v:level:%v:judul:%v:bkd:%v:pak:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDIndukKatGiat, params.IDJenisSdm, params.KodeKatPak, params.KodeKatBkd, params.LevelKat, params.Judul, params.Bkd, params.Pak, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kategori_kegiatan:total:induk:%v:jns_sdm:%v:kat_pak:%v:kat_bkd:%v:level:%v:judul:%v:bkd:%v:pak:%v:search:%s",
		params.IDIndukKatGiat, params.IDJenisSdm, params.KodeKatPak, params.KodeKatBkd, params.LevelKat, params.Judul, params.Bkd, params.Pak, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []KategoriKegiatan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for kategori kegiatan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetKategoriKegiatan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori kegiatan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori kegiatan total: %v", err)
		}
	}

	return data, total, nil
}

// GetKategoriTabel mengambil daftar kategori tabel dengan pagination dan filter
func (s *service) GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error) {
	cacheKeyData := fmt.Sprintf("kategori_tabel:data:page:%d:limit:%d:kat_giat:%v:schema:%v:konfig:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDKatGiat, params.NmSchema, params.KonfigKolom, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("kategori_tabel:total:kat_giat:%v:schema:%v:konfig:%v:search:%s",
		params.IDKatGiat, params.NmSchema, params.KonfigKolom, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []KategoriTabel
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for kategori tabel data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetKategoriTabel(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori tabel data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache kategori tabel total: %v", err)
		}
	}

	return data, total, nil
}
