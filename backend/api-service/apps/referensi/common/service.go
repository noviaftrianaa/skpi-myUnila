package common

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
	GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error)
	GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error)
	GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error)
	GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error)
	GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error)
	GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error)
	GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error)
	GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error)
	GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error)
	GetJalurDaftar(ctx context.Context, params types.PaginationParams) ([]JalurDaftar, int64, error)
	GetJenjangPendidikan(ctx context.Context, params types.JenjangPendidikanParams) ([]JenjangPendidikan, int64, error)
	GetJurusan(ctx context.Context, params types.JurusanParams) ([]Jurusan, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetSemesters mengambil daftar semester dengan pagination
func (s *service) GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error) {
	cacheKeyData := fmt.Sprintf("semester:data:page:%d:limit:%d:tahun:%v:periode:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.TahunAjaran, params.PeriodeAktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("semester:total:tahun:%v:periode:%v:search:%s", params.TahunAjaran, params.PeriodeAktif, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Semester
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for semester data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSemesters(ctx, params)
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
func (s *service) GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error) {
	cacheKeyData := fmt.Sprintf("tahun_ajaran:data:page:%d:limit:%d:periode:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PeriodeAktif, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("tahun_ajaran:total:periode:%v:search:%s", params.PeriodeAktif, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []TahunAjaran
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tahun ajaran data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTahunAjarans(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetAgamas mengambil daftar agama dengan pagination
func (s *service) GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error) {
	cacheKeyData := fmt.Sprintf("agama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("agama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Agama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for agama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetAgamas(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetWilayahs mengambil daftar wilayah dengan pagination
func (s *service) GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error) {
	cacheKeyData := fmt.Sprintf("wilayah:data:page:%d:limit:%d:negara:%v:level:%v:induk:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDNegara, params.Level, params.IDIndukWilayah, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("wilayah:total:negara:%v:level:%v:induk:%v:search:%s",
		params.IDNegara, params.Level, params.IDIndukWilayah, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Wilayah
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for wilayah data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetWilayahs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetAktifitasKerjasama mengambil daftar aktifitas kerjasama dengan pagination
func (s *service) GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error) {
	cacheKeyData := fmt.Sprintf("aktifitas_kerjasama:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("aktifitas_kerjasama:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []AktifitasKerjasama
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for aktifitas kerjasama data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetAktifitasKerjasama(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetBasisEvaluasi mengambil daftar basis evaluasi dengan pagination
func (s *service) GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error) {
	cacheKeyData := fmt.Sprintf("basis_evaluasi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("basis_evaluasi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []BasisEvaluasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for basis evaluasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetBasisEvaluasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetFungsiLab mengambil daftar fungsi lab dengan pagination
func (s *service) GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error) {
	cacheKeyData := fmt.Sprintf("fungsi_lab:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("fungsi_lab:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []FungsiLab
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for fungsi lab data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetFungsiLab(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetGelarAkademik mengambil daftar gelar akademik dengan pagination
func (s *service) GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error) {
	cacheKeyData := fmt.Sprintf("gelar_akademik:data:page:%d:limit:%d:posisi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.PosisiGelar, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("gelar_akademik:total:posisi:%v:search:%s", params.PosisiGelar, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []GelarAkademik
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for gelar akademik data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetGelarAkademik(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetIkatanKerjaSdm mengambil daftar ikatan kerja SDM dengan pagination
func (s *service) GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error) {
	cacheKeyData := fmt.Sprintf("ikatan_kerja_sdm:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("ikatan_kerja_sdm:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []IkatanKerjaSdm
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for ikatan kerja sdm data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetIkatanKerjaSdm(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetIkatanKerjaSdm mengambil daftar ikatan kerja SDM dengan pagination
func (s *service) GetJalurDaftar(ctx context.Context, params types.PaginationParams) ([]JalurDaftar, int64, error) {
	cacheKeyData := fmt.Sprintf("jalur_daftar:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jalur_daftar:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JalurDaftar
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jalur daftar data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJalurDaftar(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenjangPendidikan mengambil daftar jenjang pendidikan dengan pagination
func (s *service) GetJenjangPendidikan(ctx context.Context, params types.JenjangPendidikanParams) ([]JenjangPendidikan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenjang_pendidikan:data:page:%d:limit:%d:u_jenj_lemb:%v:u_jenj_org:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.UJenjLemb, params.UJenjOrg, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenjang_pendidikan:total:u_jenj_lemb:%v:u_jenj_org:%v:search:%s", params.UJenjLemb, params.UJenjOrg, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenjangPendidikan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenjang pendidikan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenjangPendidikan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJurusan mengambil daftar jurusan dengan pagination
func (s *service) GetJurusan(ctx context.Context, params types.JurusanParams) ([]Jurusan, int64, error) {
	cacheKeyData := fmt.Sprintf("jurusan:data:page:%d:limit:%d:id_jenj_didik:%v:id_kel_bidang:%v:kode_nomenklatur:%v:u_sma:%v:u_smk:%v:u_pt:%v:u_slb:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDJenjDidik, params.IDKelBidang, params.KodeNomenklatur, params.USma, params.USmk, params.UPt, params.USlb, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jurusan:total:id_jenj_didik:%v:id_kel_bidang:%v:kode_nomenklatur:%v:u_sma:%v:u_smk:%v:u_pt:%v:u_slb:%v:search:%s",
		params.IDJenjDidik, params.IDKelBidang, params.KodeNomenklatur, params.USma, params.USmk, params.UPt, params.USlb, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Jurusan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jurusan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJurusan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
