package referensi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/redis/go-redis/v9"
)

// Service adalah interface untuk business logic referensi
type Service interface {
	GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error)
	GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error)
	GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error)
	GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error)
	GetAktifitasKerjasama(ctx context.Context, params PaginationParams) ([]AktifitasKerjasama, int64, error)
	GetBasisEvaluasi(ctx context.Context, params PaginationParams) ([]BasisEvaluasi, int64, error)
	GetBentukKegiatanKerjasama(ctx context.Context, params PaginationParams) ([]BentukKegiatanKerjasama, int64, error)
	GetBentukPendidikan(ctx context.Context, params BentukPendidikanParams) ([]BentukPendidikan, int64, error)
	GetBidangKerjasama(ctx context.Context, params PaginationParams) ([]BidangKerjasama, int64, error)
	GetBidangPekerjaan(ctx context.Context, params PaginationParams) ([]BidangPekerjaan, int64, error)
	GetBidangStudi(ctx context.Context, params BidangStudiParams) ([]BidangStudi, int64, error)
	GetBidangUsaha(ctx context.Context, params PaginationParams) ([]BidangUsaha, int64, error)
	GetFungsiLab(ctx context.Context, params PaginationParams) ([]FungsiLab, int64, error)
	GetGelarAkademik(ctx context.Context, params GelarAkademikParams) ([]GelarAkademik, int64, error)
	GetIkatanKerjaSdm(ctx context.Context, params PaginationParams) ([]IkatanKerjaSdm, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

// NewService membuat instance service baru
func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetSemesters mengambil daftar semester dengan pagination
func (s *service) GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("semester:page:%d:limit:%d:ta:%v:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.TahunAjaran, params.PeriodeAktif, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var semesters []Semester
		if err := json.Unmarshal([]byte(cachedData), &semesters); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return semesters, int64(len(semesters)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetSemesters(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache semesters: %v", err)
		}
	}

	return data, total, nil
}

// GetTahunAjarans mengambil daftar tahun ajaran dengan pagination
func (s *service) GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("tahun_ajaran:page:%d:limit:%d:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PeriodeAktif, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var tahunAjarans []TahunAjaran
		if err := json.Unmarshal([]byte(cachedData), &tahunAjarans); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return tahunAjarans, int64(len(tahunAjarans)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetTahunAjarans(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache tahun ajarans: %v", err)
		}
	}

	return data, total, nil
}

// GetAgamas mengambil daftar agama dengan pagination
func (s *service) GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("agama:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var agamas []Agama
		if err := json.Unmarshal([]byte(cachedData), &agamas); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return agamas, int64(len(agamas)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetAgamas(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache agamas: %v", err)
		}
	}

	return data, total, nil
}

// GetWilayahs mengambil daftar wilayah dengan pagination dan filter level
func (s *service) GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("wilayah:page:%d:limit:%d:level:%v:induk:%v:negara:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Level, params.IDIndukWilayah, params.IDNegara, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var wilayahs []Wilayah
		if err := json.Unmarshal([]byte(cachedData), &wilayahs); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return wilayahs, int64(len(wilayahs)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetWilayahs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache wilayahs: %v", err)
		}
	}

	return data, total, nil
}

// GetAktifitasKerjasama mengambil daftar aktifitas kerjasama dengan pagination
func (s *service) GetAktifitasKerjasama(ctx context.Context, params PaginationParams) ([]AktifitasKerjasama, int64, error) {
	cacheKey := fmt.Sprintf("aktifitas_kerjasama:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []AktifitasKerjasama
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetAktifitasKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache aktifitas kerjasama: %v", err)
		}
	}

	return data, total, nil
}

// GetBasisEvaluasi mengambil daftar basis evaluasi dengan pagination
func (s *service) GetBasisEvaluasi(ctx context.Context, params PaginationParams) ([]BasisEvaluasi, int64, error) {
	cacheKey := fmt.Sprintf("basis_evaluasi:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BasisEvaluasi
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBasisEvaluasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache basis evaluasi: %v", err)
		}
	}

	return data, total, nil
}

// GetBentukKegiatanKerjasama mengambil daftar bentuk kegiatan kerjasama dengan pagination
func (s *service) GetBentukKegiatanKerjasama(ctx context.Context, params PaginationParams) ([]BentukKegiatanKerjasama, int64, error) {
	cacheKey := fmt.Sprintf("bentuk_kegiatan_kerjasama:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BentukKegiatanKerjasama
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBentukKegiatanKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk kegiatan kerjasama: %v", err)
		}
	}

	return data, total, nil
}

// GetBentukPendidikan mengambil daftar bentuk pendidikan dengan pagination dan filter
func (s *service) GetBentukPendidikan(ctx context.Context, params BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
	cacheKey := fmt.Sprintf("bentuk_pendidikan:page:%d:limit:%d:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Aktif, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BentukPendidikan
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBentukPendidikan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk pendidikan: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangKerjasama mengambil daftar bidang kerjasama dengan pagination
func (s *service) GetBidangKerjasama(ctx context.Context, params PaginationParams) ([]BidangKerjasama, int64, error) {
	cacheKey := fmt.Sprintf("bidang_kerjasama:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BidangKerjasama
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBidangKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang kerjasama: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangPekerjaan mengambil daftar bidang pekerjaan dengan pagination
func (s *service) GetBidangPekerjaan(ctx context.Context, params PaginationParams) ([]BidangPekerjaan, int64, error) {
	cacheKey := fmt.Sprintf("bidang_pekerjaan:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BidangPekerjaan
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBidangPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang pekerjaan: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangStudi mengambil daftar bidang studi dengan pagination dan filter
func (s *service) GetBidangStudi(ctx context.Context, params BidangStudiParams) ([]BidangStudi, int64, error) {
	cacheKey := fmt.Sprintf("bidang_studi:page:%d:limit:%d:induk:%v:kel:%v:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDIndukBidangStudi, params.Kelompok, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Search, params.SortBy, params.Order)

	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var data []BidangStudi
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return data, int64(len(data)), nil
		}
	}

	data, total, err := s.repo.GetBidangStudi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang studi: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangUsaha mengambil daftar bidang usaha dengan pagination
func (s *service) GetBidangUsaha(ctx context.Context, params PaginationParams) ([]BidangUsaha, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("bidang_usaha:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var bidangUsaha []BidangUsaha
		if err := json.Unmarshal([]byte(cachedData), &bidangUsaha); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return bidangUsaha, int64(len(bidangUsaha)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetBidangUsaha(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang usaha: %v", err)
		}
	}

	return data, total, nil
}

// GetFungsiLab mengambil daftar fungsi lab dengan pagination
func (s *service) GetFungsiLab(ctx context.Context, params PaginationParams) ([]FungsiLab, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("fungsi_lab:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var fungsiLab []FungsiLab
		if err := json.Unmarshal([]byte(cachedData), &fungsiLab); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return fungsiLab, int64(len(fungsiLab)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetFungsiLab(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache fungsi lab: %v", err)
		}
	}

	return data, total, nil
}

// GetGelarAkademik mengambil daftar gelar akademik dengan pagination
func (s *service) GetGelarAkademik(ctx context.Context, params GelarAkademikParams) ([]GelarAkademik, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("gelar_akademik:page:%d:limit:%d:posisi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PosisiGelar, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var gelarAkademik []GelarAkademik
		if err := json.Unmarshal([]byte(cachedData), &gelarAkademik); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return gelarAkademik, int64(len(gelarAkademik)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetGelarAkademik(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache gelar akademik: %v", err)
		}
	}

	return data, total, nil
}

// GetIkatanKerjaSdm mengambil daftar ikatan kerja sdm dengan pagination
func (s *service) GetIkatanKerjaSdm(ctx context.Context, params PaginationParams) ([]IkatanKerjaSdm, int64, error) {
	// Build cache key based on params
	cacheKey := fmt.Sprintf("ikatan_kerja_sdm:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)

	// Try get from cache
	cachedData, err := cache.Get(ctx, cacheKey)
	if err == nil && cachedData != "" {
		var ikatanKerjaSdm []IkatanKerjaSdm
		if err := json.Unmarshal([]byte(cachedData), &ikatanKerjaSdm); err == nil {
			log.Printf("Cache HIT: %s", cacheKey)
			return ikatanKerjaSdm, int64(len(ikatanKerjaSdm)), nil
		}
	}

	// Get from database
	data, total, err := s.repo.GetIkatanKerjaSdm(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKey, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache ikatan kerja sdm: %v", err)
		}
	}

	return data, total, nil
}
