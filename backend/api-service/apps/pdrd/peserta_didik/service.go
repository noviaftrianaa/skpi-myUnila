package pesertadidik

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

// Service adalah interface untuk business logic mahasiswa
type Service interface {
	GetPesertaDidik(ctx context.Context, params types.PaginationParams) ([]PesertaDidik, int64, error)
	GetPesertaDidikDetail(ctx context.Context, params types.PesertaDidikDetailParams) ([]PesertaDidikDetail, int64, error)
	GetRegPd(ctx context.Context, params types.RegPdParams) ([]RegPd, int64, error)
	GetStatusKuliahMahasiswa(ctx context.Context, params types.StatusKuliahMahasiswaParams) ([]StatusKuliahMahasiswa, int64, error)

	// Batch 2: nilai + kehadiran + aktivitas
	GetNilaiSmtMhs(ctx context.Context, p types.NilaiSmtParams) ([]NilaiSmtMhs, int64, error)
	GetNilaiTranskrip(ctx context.Context, p types.NilaiTranskripParams) ([]NilaiTranskrip, int64, error)
	GetKehadiranMhs(ctx context.Context, p types.KehadiranMhsParams) ([]KehadiranMhs, int64, error)
	GetAktMhs(ctx context.Context, p types.AktMhsParams) ([]AktMhs, int64, error)

	// Batch 3: bimbingan + uji
	GetBimbingMhs(ctx context.Context, p types.BimbingMhsParams) ([]BimbingMhs, int64, error)
	GetUjiMhs(ctx context.Context, p types.UjiMhsParams) ([]UjiMhs, int64, error)
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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("peserta_didik:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("peserta_didik:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("peserta_didik_detail:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("peserta_didik_detail:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("reg_pd:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("reg_pd:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_kuliah:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_kuliah:total:%s", h)

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
