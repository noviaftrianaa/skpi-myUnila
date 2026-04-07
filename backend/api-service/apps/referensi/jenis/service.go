package jenis

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
	GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error)
	GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error)
	GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error)
	GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error)
	GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error)
	GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error)
	GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error)
	GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error)
	GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error)
	GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error)
	GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error)
	GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error)
	GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error)
	GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error)
	GetJenisMk(ctx context.Context, params types.PaginationParams) ([]JenisMk, int64, error)
	GetJenisPendaftaran(ctx context.Context, params types.JenisPendaftaranParams) ([]JenisPendaftaran, int64, error)
	GetJenisPenelitian(ctx context.Context, params types.PaginationParams) ([]JenisPenelitian, int64, error)
	GetJenisPenghargaan(ctx context.Context, params types.JenisPenghargaanParams) ([]JenisPenghargaan, int64, error)
	GetJenisPrasarana(ctx context.Context, params types.PaginationParams) ([]JenisPrasarana, int64, error)
	GetJenisPrestasi(ctx context.Context, params types.PaginationParams) ([]JenisPrestasi, int64, error)
	GetJenisPublikasi(ctx context.Context, params types.PaginationParams) ([]JenisPublikasi, int64, error)
	GetJenisSarana(ctx context.Context, params types.JenisSaranaParams) ([]JenisSarana, int64, error)
	GetJenisSdm(ctx context.Context, params types.JenisSdmParams) ([]JenisSdm, int64, error)
	GetJenisSert(ctx context.Context, params types.JenisSertParams) ([]JenisSert, int64, error)
	GetJenisSms(ctx context.Context, params types.PaginationParams) ([]JenisSms, int64, error)
	GetJenisSubst(ctx context.Context, params types.PaginationParams) ([]JenisSubst, int64, error)
	GetJenisTes(ctx context.Context, params types.JenisTesParams) ([]JenisTes, int64, error)
	GetJenisTinggal(ctx context.Context, params types.PaginationParams) ([]JenisTinggal, int64, error)
	GetJenisTunjangan(ctx context.Context, params types.PaginationParams) ([]JenisTunjangan, int64, error)
	GetJenisUnit(ctx context.Context, params types.JenisUnitParams) ([]JenisUnit, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service {
	return &service{repo: repo, rConn: rConn}
}

// GetJenisAktMhs mengambil daftar jenis aktivitas mahasiswa dengan pagination dan filter
func (s *service) GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_akt_mhs:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_akt_mhs:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisAktMhs
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis akt mhs data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisAktMhs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisBahanAjar mengambil daftar jenis bahan ajar dengan pagination
func (s *service) GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_bahan_ajar:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_bahan_ajar:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisBahanAjar
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis bahan ajar data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisBahanAjar(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisBeasiswa mengambil daftar jenis beasiswa dengan pagination dan filter
func (s *service) GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_beasiswa:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_beasiswa:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisBeasiswa
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis beasiswa data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisBeasiswa(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisDiklat mengambil daftar jenis diklat dengan pagination dan filter
func (s *service) GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_diklat:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_diklat:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisDiklat
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis diklat data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisDiklat(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisDokumen mengambil daftar jenis dokumen dengan pagination
func (s *service) GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_dokumen:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_dokumen:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisDokumen
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis dokumen data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisDokumen(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisEvaluasi mengambil daftar jenis evaluasi dengan pagination
func (s *service) GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_evaluasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_evaluasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisEvaluasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis evaluasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisEvaluasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisHapusBuku mengambil daftar jenis hapus buku dengan pagination
func (s *service) GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_hapus_buku:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_hapus_buku:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisHapusBuku
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis hapus buku data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisHapusBuku(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisJalurPekerjaan mengambil daftar jenis jalur pekerjaan dengan pagination
func (s *service) GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_jalur_pekerjaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_jalur_pekerjaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisJalurPekerjaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis jalur pekerjaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisJalurPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisKeluar mengambil daftar jenis keluar dengan pagination dan filter
func (s *service) GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_keluar:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_keluar:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisKeluar
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis keluar data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisKeluar(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisKepanitiaan mengambil daftar jenis kepanitiaan dengan pagination
func (s *service) GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_kepanitiaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_kepanitiaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisKepanitiaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis kepanitiaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisKepanitiaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisKesejahteraan mengambil daftar jenis kesejahteraan dengan pagination
func (s *service) GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_kesejahteraan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_kesejahteraan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisKesejahteraan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis kesejahteraan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisKesejahteraan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisKeuangan mengambil daftar jenis keuangan dengan pagination dan filter
func (s *service) GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_keuangan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_keuangan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisKeuangan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis keuangan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisKeuangan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisLembaga mengambil daftar jenis lembaga dengan pagination dan filter
func (s *service) GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_lembaga:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_lembaga:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisLembaga
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis lembaga data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisLembaga(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisMediaPub mengambil daftar jenis media publikasi dengan pagination
func (s *service) GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_media_pub:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_media_pub:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisMediaPub
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis media pub data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisMediaPub(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisMk mengambil daftar jenis mata kuliah dengan pagination
func (s *service) GetJenisMk(ctx context.Context, params types.PaginationParams) ([]JenisMk, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_mk:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_mk:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisMk
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis mk data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisMk(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPendaftaran mengambil daftar jenis pendaftaran dengan pagination dan filter
func (s *service) GetJenisPendaftaran(ctx context.Context, params types.JenisPendaftaranParams) ([]JenisPendaftaran, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_pendaftaran:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_pendaftaran:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPendaftaran
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis pendaftaran data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPendaftaran(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPenelitian mengambil daftar jenis penelitian dengan pagination
func (s *service) GetJenisPenelitian(ctx context.Context, params types.PaginationParams) ([]JenisPenelitian, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_penelitian:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_penelitian:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPenelitian
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis penelitian data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPenelitian(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPenghargaan mengambil daftar jenis penghargaan dengan pagination dan filter
func (s *service) GetJenisPenghargaan(ctx context.Context, params types.JenisPenghargaanParams) ([]JenisPenghargaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_penghargaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_penghargaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPenghargaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis penghargaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPenghargaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPrasarana mengambil daftar jenis prasarana dengan pagination
func (s *service) GetJenisPrasarana(ctx context.Context, params types.PaginationParams) ([]JenisPrasarana, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_prasarana:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_prasarana:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPrasarana
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis prasarana data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPrasarana(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPrestasi mengambil daftar jenis prestasi dengan pagination
func (s *service) GetJenisPrestasi(ctx context.Context, params types.PaginationParams) ([]JenisPrestasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_prestasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_prestasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPrestasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis prestasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPrestasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisPublikasi mengambil daftar jenis publikasi dengan pagination
func (s *service) GetJenisPublikasi(ctx context.Context, params types.PaginationParams) ([]JenisPublikasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_publikasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_publikasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisPublikasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis publikasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisPublikasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisSarana mengambil daftar jenis sarana dengan pagination dan filter
func (s *service) GetJenisSarana(ctx context.Context, params types.JenisSaranaParams) ([]JenisSarana, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_sarana:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_sarana:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisSarana
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis sarana data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisSarana(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisSdm mengambil daftar jenis SDM dengan pagination dan filter
func (s *service) GetJenisSdm(ctx context.Context, params types.JenisSdmParams) ([]JenisSdm, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_sdm:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_sdm:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisSdm
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis sdm data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisSdm(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisSert mengambil daftar jenis sertifikasi dengan pagination dan filter
func (s *service) GetJenisSert(ctx context.Context, params types.JenisSertParams) ([]JenisSert, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_sert:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_sert:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisSert
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis sert data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisSert(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisSms mengambil daftar jenis SMS dengan pagination
func (s *service) GetJenisSms(ctx context.Context, params types.PaginationParams) ([]JenisSms, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_sms:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_sms:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisSms
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis sms data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisSms(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisSubst mengambil daftar jenis substansi dengan pagination
func (s *service) GetJenisSubst(ctx context.Context, params types.PaginationParams) ([]JenisSubst, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_subst:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_subst:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisSubst
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis subst data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisSubst(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisTes mengambil daftar jenis tes dengan pagination dan filter
func (s *service) GetJenisTes(ctx context.Context, params types.JenisTesParams) ([]JenisTes, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_tes:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_tes:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisTes
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis tes data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisTes(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisTinggal mengambil daftar jenis tinggal dengan pagination
func (s *service) GetJenisTinggal(ctx context.Context, params types.PaginationParams) ([]JenisTinggal, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_tinggal:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_tinggal:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisTinggal
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis tinggal data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisTinggal(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisTunjangan mengambil daftar jenis tunjangan dengan pagination
func (s *service) GetJenisTunjangan(ctx context.Context, params types.PaginationParams) ([]JenisTunjangan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_tunjangan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_tunjangan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisTunjangan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis tunjangan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisTunjangan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}

// GetJenisUnit mengambil daftar jenis unit dengan pagination
func (s *service) GetJenisUnit(ctx context.Context, params types.JenisUnitParams) ([]JenisUnit, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenis_unit:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenis_unit:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []JenisUnit
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for jenis unit data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetJenisUnit(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
