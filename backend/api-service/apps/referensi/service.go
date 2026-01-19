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
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("semester:data:page:%d:limit:%d:ta:%v:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.TahunAjaran, params.PeriodeAktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("semester:total:ta:%v:aktif:%v:search:%s",
		params.TahunAjaran, params.PeriodeAktif, params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var semesters []Semester
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &semesters); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return semesters, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetSemesters(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache semesters data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache semesters total: %v", err)
		}
	}

	return data, total, nil
}

// GetTahunAjarans mengambil daftar tahun ajaran dengan pagination
func (s *service) GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("tahun_ajaran:data:page:%d:limit:%d:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PeriodeAktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("tahun_ajaran:total:aktif:%v:search:%s",
		params.PeriodeAktif, params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var tahunAjarans []TahunAjaran
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &tahunAjarans); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return tahunAjarans, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetTahunAjarans(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache tahun ajarans data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache tahun ajarans total: %v", err)
		}
	}

	return data, total, nil
}

// GetAgamas mengambil daftar agama dengan pagination
func (s *service) GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("agama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("agama:total:search:%s", params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var agamas []Agama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &agamas); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return agamas, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetAgamas(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache agamas data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache agamas total: %v", err)
		}
	}

	return data, total, nil
}

// GetWilayahs mengambil daftar wilayah dengan pagination dan filter level
func (s *service) GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("wilayah:data:page:%d:limit:%d:level:%v:induk:%v:negara:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Level, params.IDIndukWilayah, params.IDNegara, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("wilayah:total:level:%v:induk:%v:negara:%v:search:%s",
		params.Level, params.IDIndukWilayah, params.IDNegara, params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var wilayahs []Wilayah
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &wilayahs); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return wilayahs, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetWilayahs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache wilayahs data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache wilayahs total: %v", err)
		}
	}

	return data, total, nil
}

// GetAktifitasKerjasama mengambil daftar aktifitas kerjasama dengan pagination
func (s *service) GetAktifitasKerjasama(ctx context.Context, params PaginationParams) ([]AktifitasKerjasama, int64, error) {
	cacheKeyData := fmt.Sprintf("aktifitas_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("aktifitas_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []AktifitasKerjasama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetAktifitasKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache aktifitas kerjasama data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache aktifitas kerjasama total: %v", err)
		}
	}

	return data, total, nil
}

// GetBasisEvaluasi mengambil daftar basis evaluasi dengan pagination
func (s *service) GetBasisEvaluasi(ctx context.Context, params PaginationParams) ([]BasisEvaluasi, int64, error) {
	cacheKeyData := fmt.Sprintf("basis_evaluasi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("basis_evaluasi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BasisEvaluasi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBasisEvaluasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache basis evaluasi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache basis evaluasi total: %v", err)
		}
	}

	return data, total, nil
}

// GetBentukKegiatanKerjasama mengambil daftar bentuk kegiatan kerjasama dengan pagination
func (s *service) GetBentukKegiatanKerjasama(ctx context.Context, params PaginationParams) ([]BentukKegiatanKerjasama, int64, error) {
	cacheKeyData := fmt.Sprintf("bentuk_kegiatan_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bentuk_kegiatan_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BentukKegiatanKerjasama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBentukKegiatanKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk kegiatan kerjasama data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk kegiatan kerjasama total: %v", err)
		}
	}

	return data, total, nil
}

// GetBentukPendidikan mengambil daftar bentuk pendidikan dengan pagination dan filter
func (s *service) GetBentukPendidikan(ctx context.Context, params BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
	cacheKeyData := fmt.Sprintf("bentuk_pendidikan:data:page:%d:limit:%d:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:aktif:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Aktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bentuk_pendidikan:total:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:aktif:%v:search:%s",
		params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Aktif, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BentukPendidikan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBentukPendidikan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk pendidikan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bentuk pendidikan total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangKerjasama mengambil daftar bidang kerjasama dengan pagination
func (s *service) GetBidangKerjasama(ctx context.Context, params PaginationParams) ([]BidangKerjasama, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangKerjasama
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang kerjasama data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang kerjasama total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangPekerjaan mengambil daftar bidang pekerjaan dengan pagination
func (s *service) GetBidangPekerjaan(ctx context.Context, params PaginationParams) ([]BidangPekerjaan, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_pekerjaan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_pekerjaan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangPekerjaan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang pekerjaan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang pekerjaan total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangStudi mengambil daftar bidang studi dengan pagination dan filter
func (s *service) GetBidangStudi(ctx context.Context, params BidangStudiParams) ([]BidangStudi, int64, error) {
	cacheKeyData := fmt.Sprintf("bidang_studi:data:page:%d:limit:%d:induk:%v:kel:%v:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDIndukBidangStudi, params.Kelompok, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_studi:total:induk:%v:kel:%v:paud:%v:tk:%v:sd:%v:smp:%v:sma:%v:tinggi:%v:search:%s",
		params.IDIndukBidangStudi, params.Kelompok, params.JenjangPaud, params.JenjangTk, params.JenjangSd, params.JenjangSmp, params.JenjangSma, params.JenjangTinggi, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []BidangStudi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetBidangStudi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang studi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang studi total: %v", err)
		}
	}

	return data, total, nil
}

// GetBidangUsaha mengambil daftar bidang usaha dengan pagination
func (s *service) GetBidangUsaha(ctx context.Context, params PaginationParams) ([]BidangUsaha, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("bidang_usaha:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("bidang_usaha:total:search:%s", params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var bidangUsaha []BidangUsaha
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &bidangUsaha); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return bidangUsaha, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetBidangUsaha(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang usaha data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache bidang usaha total: %v", err)
		}
	}

	return data, total, nil
}

// GetFungsiLab mengambil daftar fungsi lab dengan pagination
func (s *service) GetFungsiLab(ctx context.Context, params PaginationParams) ([]FungsiLab, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("fungsi_lab:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("fungsi_lab:total:search:%s", params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var fungsiLab []FungsiLab
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &fungsiLab); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return fungsiLab, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetFungsiLab(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache fungsi lab data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache fungsi lab total: %v", err)
		}
	}

	return data, total, nil
}

// GetGelarAkademik mengambil daftar gelar akademik dengan pagination
func (s *service) GetGelarAkademik(ctx context.Context, params GelarAkademikParams) ([]GelarAkademik, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("gelar_akademik:data:page:%d:limit:%d:posisi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PosisiGelar, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("gelar_akademik:total:posisi:%v:search:%s",
		params.PosisiGelar, params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var gelarAkademik []GelarAkademik
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &gelarAkademik); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return gelarAkademik, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetGelarAkademik(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache gelar akademik data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache gelar akademik total: %v", err)
		}
	}

	return data, total, nil
}

// GetIkatanKerjaSdm mengambil daftar ikatan kerja sdm dengan pagination
func (s *service) GetIkatanKerjaSdm(ctx context.Context, params PaginationParams) ([]IkatanKerjaSdm, int64, error) {
	// Build cache keys based on params
	cacheKeyData := fmt.Sprintf("ikatan_kerja_sdm:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("ikatan_kerja_sdm:total:search:%s", params.Search)

	// Try get from cache
	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var ikatanKerjaSdm []IkatanKerjaSdm
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &ikatanKerjaSdm); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache HIT: %s (total: %d)", cacheKeyData, total)
				return ikatanKerjaSdm, total, nil
			}
		}
	}

	// Get from database
	data, total, err := s.repo.GetIkatanKerjaSdm(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// Save data to cache
	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache ikatan kerja sdm data: %v", err)
		}
	}

	// Save total to cache
	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache ikatan kerja sdm total: %v", err)
		}
	}

	return data, total, nil
}
