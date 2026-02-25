package pesertadidik

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

// Service adalah interface untuk business logic mahasiswa
type Service interface {
	GetPesertaDidik(ctx context.Context, params types.PaginationParams) ([]PesertaDidik, int64, error)
	GetPesertaDidikDetail(ctx context.Context, params types.PesertaDidikDetailParams) ([]PesertaDidikDetail, int64, error)
	GetRegPd(ctx context.Context, params types.RegPdParams) ([]RegPd, int64, error)
	GetStatusKuliahMahasiswa(ctx context.Context, params types.StatusKuliahMahasiswaParams) ([]StatusKuliahMahasiswa, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

// NewService membuat instance service baru
func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetPesertaDidik mengambil daftar mahasiswa dengan pagination dan caching
func (s *service) GetPesertaDidik(ctx context.Context, params types.PaginationParams) ([]PesertaDidik, int64, error) {
	cacheKeyData := fmt.Sprintf("peserta_didik:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("peserta_didik:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PesertaDidik
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for peserta didik data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPesertaDidik(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetPesertaDidikDetail mengambil daftar mahasiswa dengan join lookup tables dan caching
func (s *service) GetPesertaDidikDetail(ctx context.Context, params types.PesertaDidikDetailParams) ([]PesertaDidikDetail, int64, error) {
	cacheKeyData := fmt.Sprintf("peserta_didik:detail:data:page:%d:limit:%d:id_pd:%v:stat:%v:wil:%v:agama:%v:jns_tinggal:%v:kk:%v:kk_ibu:%v:kk_ayah:%v:transport:%v:kwn:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit,
		params.IDPd, params.IDStatMhs, params.IDWil, params.IDAgama,
		params.IDJnsTinggal, params.IDKk, params.IDKkIbu, params.IDKkAyah,
		params.IDAlatTransport, params.IDKewarganegaraan,
		params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("peserta_didik:detail:total:id_pd:%v:stat:%v:wil:%v:agama:%v:search:%s",
		params.IDPd, params.IDStatMhs, params.IDWil, params.IDAgama, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PesertaDidikDetail
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for peserta didik detail data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPesertaDidikDetail(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetRegPd mengambil data reg_pd dengan join lookup tables dan caching
func (s *service) GetRegPd(ctx context.Context, params types.RegPdParams) ([]RegPd, int64, error) {
	cacheKeyData := fmt.Sprintf("reg_pd:data:page:%d:limit:%d:id_reg_pd:%s:id_sp:%v:id_sms:%v:id_pd:%v:jns_daftar:%v:jalur:%v:pembiayaan:%v:smt:%v:jns_keluar:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit,
		params.IDRegPd, params.IDSP, params.IDSms, params.IDPd,
		params.IDJnsDaftar, params.IDJalurDaftar, params.IDPembiayaan, params.IDSmt,
		params.IDJnsKeluar, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("reg_pd:total:id_reg_pd:%s:id_sp:%v:id_pd:%v:jns_daftar:%v:search:%s",
		params.IDRegPd, params.IDSP, params.IDPd, params.IDJnsDaftar, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []RegPd
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for reg_pd data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetRegPd(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetStatusKuliahMahasiswa mengambil data kuliah_mhs per semester dengan caching
func (s *service) GetStatusKuliahMahasiswa(ctx context.Context, params types.StatusKuliahMahasiswaParams) ([]StatusKuliahMahasiswa, int64, error) {
	cacheKeyData := fmt.Sprintf("status_kuliah:data:page:%d:limit:%d:id_reg_pd:%s:id_smt:%v:id_stat_mhs:%v:sort:%s:%s",
		params.Page, params.Limit,
		params.IDRegPd, params.IDSmt, params.IDStatMhs,
		params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("status_kuliah:total:id_reg_pd:%s:id_smt:%v:id_stat_mhs:%v",
		params.IDRegPd, params.IDSmt, params.IDStatMhs)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusKuliahMahasiswa
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status kuliah mahasiswa")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusKuliahMahasiswa(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
