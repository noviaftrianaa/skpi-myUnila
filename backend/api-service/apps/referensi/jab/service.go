package jab

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
	GetJabTgss(ctx context.Context, params types.JabTgsParams) ([]JabTgs, int64, error)
	GetJabFungs(ctx context.Context, params types.JabFungParams) ([]JabFung, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetJabTgss mengambil daftar semester dengan pagination
func (s *service) GetJabTgss(ctx context.Context, params types.JabTgsParams) ([]JabTgs, int64, error) {
	cacheKeyData := fmt.Sprintf("jab_tgs:data:page:%d:limit:%d:id_kel_prof:%v:jabatansek:%v:jabatanpt:%v:jabatanpt:%v:jabatanlpnk:%v:jabatanlpk:%v:search:%s:sort:%s:%s", params.Page, params.Limit, params.IDKelProf, params.JabatanUtamaSek, params.JabatanUtamaPt, params.JabatanUtamaLpnk, params.JabatanUtamaLpk, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jab_tgs:total:id_kel_prof:%v:jabatansek:%v:jabatanpt:%v:jabatanpt:%v:jabatanlpnk:%v:jabatanlpk:%v:search:%s", params.IDKelProf, params.JabatanUtamaSek, params.JabatanUtamaPt, params.JabatanUtamaLpnk, params.JabatanUtamaLpk, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JabTgs
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jab_tgs data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJabTgs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetTahunAjarans mengambil daftar tahun ajaran dengan pagination
func (s *service) GetJabFungs(ctx context.Context, params types.JabFungParams) ([]JabFung, int64, error) {
	cacheKeyData := fmt.Sprintf("jab_fung:data:page:%d:limit:%d:id_kel_prof:%v:angka_kredit:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDKelProf, params.AngkaKredit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jab_fung:total:id_kel_prof:%v:angka_kredit:%v:search:%s", params.IDKelProf, params.AngkaKredit, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JabFung
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jab_fung data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJabFung(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
