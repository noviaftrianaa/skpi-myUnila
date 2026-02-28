package penelitian

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/redis/go-redis/v9"
)

// Service adalah interface untuk business logic penelitian/publikasi
type Service interface {
	GetPublikasi(ctx context.Context, params types.PublikasiParams) ([]Publikasi, int64, error)
	GetLitabmas(ctx context.Context, params types.LitabmasParams) ([]Litabmas, int64, error)
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
	cacheKeyData := fmt.Sprintf("publikasi:data:page:%d:limit:%d:jns_pub:%v:jurnal:%v:edisi:%v:penerbit:%v:kat_capaian:%v:media:%v:litabmas:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit,
		params.IDJnsPub, params.NamaJurnal, params.Edisi, params.Penerbit,
		params.IDKatCapaian, params.IDMediaPub, params.IDLitabmas,
		params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("publikasi:total:jns_pub:%v:kat_capaian:%v:media:%v:litabmas:%v:search:%s",
		params.IDJnsPub, params.IDKatCapaian, params.IDMediaPub, params.IDLitabmas, params.Search)

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
	cacheKeyData := fmt.Sprintf("litabmas:data:page:%d:limit:%d:id_sdm:%s:jns:%v:lemb:%v:skim:%v:thn:%v:bidang:%v:tse:%v:smi:%v:jns_lit:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit,
		params.IDSdm, params.JnsLitabmas, params.IDLembIptek, params.IDSkim,
		params.IDThnKegiatan, params.IDKelBidang, params.IDTse, params.IDSmi, params.IDJnsLit,
		params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("litabmas:total:id_sdm:%s:jns:%v:skim:%v:thn:%v:search:%s",
		params.IDSdm, params.JnsLitabmas, params.IDSkim, params.IDThnKegiatan, params.Search)

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
