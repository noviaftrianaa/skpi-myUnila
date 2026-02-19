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
	GetListMahasiswaByRegis(ctx context.Context, params types.ListRegisMahasiswaParams) ([]RegPd, int64, error)
	GetListMahasiswaByStatus(ctx context.Context, params types.ListStatusMahasiswaParams) ([]RegPd, int64, error)
	GetSemesterKeaktifan(ctx context.Context, params types.SemesterKeaktifanParams) ([]KuliahMhs, error)
	GetDetailMahasiswa(ctx context.Context, params types.DetailMahasiswaParams) (*PesertaDidik, error)
	GetListAlumni(ctx context.Context, params types.ListAlumniParams) ([]RegPd, int64, error)
	GetMahasiswaLuarPT(ctx context.Context, params types.LuarPTParams) ([]RegPd, int64, error)
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

// GetListMahasiswaByRegis mengambil daftar mahasiswa berdasarkan jenis pendaftaran
func (s *service) GetListMahasiswaByRegis(ctx context.Context, params types.ListRegisMahasiswaParams) ([]RegPd, int64, error) {
	cacheKeyData := fmt.Sprintf("mahasiswa:regis:data:page:%d:limit:%d:jns_daftar:%v:prodi:%v:tahun:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDJnsDaftar, params.IDProdi, params.TahunMasuk, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("mahasiswa:regis:total:jns_daftar:%v:prodi:%v:tahun:%v:search:%s",
		params.IDJnsDaftar, params.IDProdi, params.TahunMasuk, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []RegPd
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for mahasiswa by regis data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetListMahasiswaByRegis(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetListMahasiswaByStatus mengambil daftar mahasiswa berdasarkan status
func (s *service) GetListMahasiswaByStatus(ctx context.Context, params types.ListStatusMahasiswaParams) ([]RegPd, int64, error) {
	cacheKeyData := fmt.Sprintf("mahasiswa:status:data:page:%d:limit:%d:status:%v:prodi:%v:smt:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDStatMhs, params.IDProdi, params.IDSmt, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("mahasiswa:status:total:status:%v:prodi:%v:smt:%v:search:%s",
		params.IDStatMhs, params.IDProdi, params.IDSmt, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []RegPd
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for mahasiswa by status data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetListMahasiswaByStatus(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetSemesterKeaktifan mengambil daftar semester keaktifan mahasiswa
func (s *service) GetSemesterKeaktifan(ctx context.Context, params types.SemesterKeaktifanParams) ([]KuliahMhs, error) {
	cacheKey := fmt.Sprintf("mahasiswa:keaktifan:%s", params.IDRegPd)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil {
		var data []KuliahMhs
		if json.Unmarshal([]byte(cachedData), &data) == nil {
			log.Printf("Cache hit for semester keaktifan")
			return data, nil
		}
	}

	data, err := s.repo.GetSemesterKeaktifan(ctx, params)
	if err != nil {
		return nil, err
	}

	dataJSON, _ := json.Marshal(data)
	cache.Set(ctx, cacheKey, string(dataJSON), 15*time.Minute)

	return data, nil
}

// GetDetailMahasiswa mengambil detail lengkap mahasiswa
func (s *service) GetDetailMahasiswa(ctx context.Context, params types.DetailMahasiswaParams) (*PesertaDidik, error) {
	cacheKey := fmt.Sprintf("mahasiswa:detail:pd:%v:reg:%v:nipd:%v", params.IDPd, params.IDRegPd, params.NIPD)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil {
		var data PesertaDidik
		if json.Unmarshal([]byte(cachedData), &data) == nil {
			log.Printf("Cache hit for mahasiswa detail")
			return &data, nil
		}
	}

	data, err := s.repo.GetDetailMahasiswa(ctx, params)
	if err != nil {
		return nil, err
	}

	dataJSON, _ := json.Marshal(data)
	cache.Set(ctx, cacheKey, string(dataJSON), 15*time.Minute)

	return data, nil
}

// GetListAlumni mengambil daftar alumni berdasarkan tahun dan prodi
func (s *service) GetListAlumni(ctx context.Context, params types.ListAlumniParams) ([]RegPd, int64, error) {
	cacheKeyData := fmt.Sprintf("mahasiswa:alumni:data:page:%d:limit:%d:tahun:%v:prodi:%v:bulan:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.TahunLulus, params.IDProdi, params.Bulan, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("mahasiswa:alumni:total:tahun:%v:prodi:%v:bulan:%v:search:%s",
		params.TahunLulus, params.IDProdi, params.Bulan, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []RegPd
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for alumni data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetListAlumni(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetMahasiswaLuarPT mengambil daftar mahasiswa luar PT (MBKM)
func (s *service) GetMahasiswaLuarPT(ctx context.Context, params types.LuarPTParams) ([]RegPd, int64, error) {
	cacheKeyData := fmt.Sprintf("mahasiswa:luar_pt:data:page:%d:limit:%d:prodi:%v:periode:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDProdi, params.IDPeriodeMbkm, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("mahasiswa:luar_pt:total:prodi:%v:periode:%v:search:%s",
		params.IDProdi, params.IDPeriodeMbkm, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []RegPd
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for mahasiswa luar PT data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetMahasiswaLuarPT(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
