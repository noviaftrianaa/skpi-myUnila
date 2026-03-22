package status

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
	GetStatusKepegawaian(ctx context.Context, params types.PaginationParams) ([]StatusKepegawaian, int64, error)
	GetStatusKepemilikan(ctx context.Context, params types.PaginationParams) ([]StatusKepemilikan, int64, error)
	GetStatusKerjasama(ctx context.Context, params types.PaginationParams) ([]StatusKerjasama, int64, error)
	GetStatusMahasiswa(ctx context.Context, params types.PaginationParams) ([]StatusMahasiswa, int64, error)
	GetStatusMilikSarpras(ctx context.Context, params types.PaginationParams) ([]StatusMilikSarpras, int64, error)
	GetStatusAnak(ctx context.Context, params types.PaginationParams) ([]StatusAnak, int64, error)
	GetStatusKeaktifanPegawai(ctx context.Context, params types.PaginationParams) ([]StatusKeaktifanPegawai, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// ============================================================================
// StatusKepegawaian
// ============================================================================

func (s *service) GetStatusKepegawaian(ctx context.Context, params types.PaginationParams) ([]StatusKepegawaian, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_kepegawaian:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_kepegawaian:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusKepegawaian
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status kepegawaian data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusKepegawaian(ctx, params)
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
// StatusKepemilikan
// ============================================================================

func (s *service) GetStatusKepemilikan(ctx context.Context, params types.PaginationParams) ([]StatusKepemilikan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_kepemilikan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_kepemilikan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusKepemilikan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status kepemilikan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusKepemilikan(ctx, params)
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
// StatusKerjasama
// ============================================================================

func (s *service) GetStatusKerjasama(ctx context.Context, params types.PaginationParams) ([]StatusKerjasama, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_kerjasama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_kerjasama:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusKerjasama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status kerjasama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusKerjasama(ctx, params)
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
// StatusMahasiswa
// ============================================================================

func (s *service) GetStatusMahasiswa(ctx context.Context, params types.PaginationParams) ([]StatusMahasiswa, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_mahasiswa:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_mahasiswa:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusMahasiswa
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status mahasiswa data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusMahasiswa(ctx, params)
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
// StatusMilikSarpras
// ============================================================================

func (s *service) GetStatusMilikSarpras(ctx context.Context, params types.PaginationParams) ([]StatusMilikSarpras, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_milik_sarpras:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_milik_sarpras:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusMilikSarpras
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status milik sarpras data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusMilikSarpras(ctx, params)
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
// StatusAnak
// ============================================================================

func (s *service) GetStatusAnak(ctx context.Context, params types.PaginationParams) ([]StatusAnak, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_anak:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_anak:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusAnak
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status anak data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusAnak(ctx, params)
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
// StatusKeaktifanPegawai
// ============================================================================

func (s *service) GetStatusKeaktifanPegawai(ctx context.Context, params types.PaginationParams) ([]StatusKeaktifanPegawai, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("status_keaktifan_pegawai:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("status_keaktifan_pegawai:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []StatusKeaktifanPegawai
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for status keaktifan pegawai data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetStatusKeaktifanPegawai(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
