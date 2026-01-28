package jenis

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
	cacheKeyData := fmt.Sprintf("jenis_akt_mhs:data:page:%d:limit:%d:kegiatan_kampus_merdeka:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.KegiatanKampusMerdeka, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_akt_mhs:total:kegiatan_kampus_merdeka:%v:search:%s",
		params.KegiatanKampusMerdeka, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisAktMhs
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis akt mhs data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisAktMhs(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis akt mhs data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis akt mhs total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisBahanAjar mengambil daftar jenis bahan ajar dengan pagination
func (s *service) GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_bahan_ajar:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_bahan_ajar:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisBahanAjar
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis bahan ajar data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisBahanAjar(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis bahan ajar data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis bahan ajar total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisBeasiswa mengambil daftar jenis beasiswa dengan pagination dan filter
func (s *service) GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_beasiswa:data:page:%d:limit:%d:id_sumber_dana:%v:u_pd:%v:u_ptk:%v:u_non_ca:%v:kat_beasiswa:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.IDSumberDana, params.UPd, params.UPtk, params.UNonCa, params.KatBeasiswa, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_beasiswa:total:id_sumber_dana:%v:u_pd:%v:u_ptk:%v:u_non_ca:%v:kat_beasiswa:%v:search:%s",
		params.IDSumberDana, params.UPd, params.UPtk, params.UNonCa, params.KatBeasiswa, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisBeasiswa
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis beasiswa data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisBeasiswa(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis beasiswa data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis beasiswa total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisDiklat mengambil daftar jenis diklat dengan pagination dan filter
func (s *service) GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_diklat:data:page:%d:limit:%d:u_guru:%v:u_dosen:%v:u_tendik:%v:a_validasi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.UGuru, params.UDosen, params.UTendik, params.AValidasi, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_diklat:total:u_guru:%v:u_dosen:%v:u_tendik:%v:a_validasi:%v:search:%s",
		params.UGuru, params.UDosen, params.UTendik, params.AValidasi, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisDiklat
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis diklat data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisDiklat(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis diklat data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis diklat total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisDokumen mengambil daftar jenis dokumen dengan pagination
func (s *service) GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_dokumen:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_dokumen:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisDokumen
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis dokumen data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisDokumen(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis dokumen data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis dokumen total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisEvaluasi mengambil daftar jenis evaluasi dengan pagination
func (s *service) GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_evaluasi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_evaluasi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisEvaluasi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis evaluasi data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisEvaluasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis evaluasi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis evaluasi total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisHapusBuku mengambil daftar jenis hapus buku dengan pagination
func (s *service) GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_hapus_buku:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_hapus_buku:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisHapusBuku
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis hapus buku data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisHapusBuku(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis hapus buku data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis hapus buku total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisJalurPekerjaan mengambil daftar jenis jalur pekerjaan dengan pagination
func (s *service) GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_jalur_pekerjaan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_jalur_pekerjaan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisJalurPekerjaan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis jalur pekerjaan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisJalurPekerjaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis jalur pekerjaan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis jalur pekerjaan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisKeluar mengambil daftar jenis keluar dengan pagination dan filter
func (s *service) GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_keluar:data:page:%d:limit:%d:a_pd:%v:a_ptk:%v:a_sdm_iptek:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.APd, params.APtk, params.ASdmIptek, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_keluar:total:a_pd:%v:a_ptk:%v:a_sdm_iptek:%v:search:%s",
		params.APd, params.APtk, params.ASdmIptek, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisKeluar
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis keluar data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisKeluar(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis keluar data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis keluar total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisKepanitiaan mengambil daftar jenis kepanitiaan dengan pagination
func (s *service) GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_kepanitiaan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_kepanitiaan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisKepanitiaan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis kepanitiaan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisKepanitiaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis kepanitiaan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis kepanitiaan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisKesejahteraan mengambil daftar jenis kesejahteraan dengan pagination
func (s *service) GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_kesejahteraan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_kesejahteraan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisKesejahteraan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis kesejahteraan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisKesejahteraan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis kesejahteraan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis kesejahteraan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisKeuangan mengambil daftar jenis keuangan dengan pagination dan filter
func (s *service) GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_keuangan:data:page:%d:limit:%d:pengeluaran:%v:pemasukan:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Pengeluaran, params.Pemasukan, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_keuangan:total:pengeluaran:%v:pemasukan:%v:search:%s",
		params.Pengeluaran, params.Pemasukan, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisKeuangan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis keuangan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisKeuangan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis keuangan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis keuangan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisLembaga mengambil daftar jenis lembaga dengan pagination dan filter
func (s *service) GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_lembaga:data:page:%d:limit:%d:sp:%v:lemb_akred:%v:pengelola_pendidikan:%v:sms:%v:tmpt_pengawas:%v:lemb_iptek:%v:smi:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Sp, params.LembAkred, params.PengelolaPendidikan, params.Sms, params.TmptPengawas, params.LembIptek, params.Smi, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_lembaga:total:sp:%v:lemb_akred:%v:pengelola_pendidikan:%v:sms:%v:tmpt_pengawas:%v:lemb_iptek:%v:smi:%v:search:%s",
		params.Sp, params.LembAkred, params.PengelolaPendidikan, params.Sms, params.TmptPengawas, params.LembIptek, params.Smi, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisLembaga
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis lembaga data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisLembaga(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis lembaga data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis lembaga total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisMediaPub mengambil daftar jenis media publikasi dengan pagination
func (s *service) GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_media_pub:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_media_pub:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisMediaPub
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis media pub data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisMediaPub(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis media pub data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis media pub total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisMk mengambil daftar jenis mata kuliah dengan pagination
func (s *service) GetJenisMk(ctx context.Context, params types.PaginationParams) ([]JenisMk, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_mk:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_mk:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisMk
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis mk data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisMk(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis mk data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis mk total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPendaftaran mengambil daftar jenis pendaftaran dengan pagination dan filter
func (s *service) GetJenisPendaftaran(ctx context.Context, params types.JenisPendaftaranParams) ([]JenisPendaftaran, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_pendaftaran:data:page:%d:limit:%d:daftar_sekolah:%v:daftar_rombel:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.DaftarSekolah, params.DaftarRombel, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_pendaftaran:total:daftar_sekolah:%v:daftar_rombel:%v:search:%s",
		params.DaftarSekolah, params.DaftarRombel, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPendaftaran
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis pendaftaran data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPendaftaran(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis pendaftaran data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis pendaftaran total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPenelitian mengambil daftar jenis penelitian dengan pagination
func (s *service) GetJenisPenelitian(ctx context.Context, params types.PaginationParams) ([]JenisPenelitian, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_penelitian:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_penelitian:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPenelitian
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis penelitian data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPenelitian(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis penelitian data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis penelitian total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPenghargaan mengambil daftar jenis penghargaan dengan pagination dan filter
func (s *service) GetJenisPenghargaan(ctx context.Context, params types.JenisPenghargaanParams) ([]JenisPenghargaan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_penghargaan:data:page:%d:limit:%d:lembaga:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Lembaga, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_penghargaan:total:lembaga:%v:search:%s",
		params.Lembaga, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPenghargaan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis penghargaan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPenghargaan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis penghargaan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis penghargaan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPrasarana mengambil daftar jenis prasarana dengan pagination
func (s *service) GetJenisPrasarana(ctx context.Context, params types.PaginationParams) ([]JenisPrasarana, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_prasarana:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_prasarana:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPrasarana
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis prasarana data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPrasarana(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis prasarana data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis prasarana total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPrestasi mengambil daftar jenis prestasi dengan pagination
func (s *service) GetJenisPrestasi(ctx context.Context, params types.PaginationParams) ([]JenisPrestasi, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_prestasi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_prestasi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPrestasi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis prestasi data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPrestasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis prestasi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis prestasi total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisPublikasi mengambil daftar jenis publikasi dengan pagination
func (s *service) GetJenisPublikasi(ctx context.Context, params types.PaginationParams) ([]JenisPublikasi, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_publikasi:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_publikasi:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisPublikasi
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis publikasi data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisPublikasi(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis publikasi data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis publikasi total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisSarana mengambil daftar jenis sarana dengan pagination dan filter
func (s *service) GetJenisSarana(ctx context.Context, params types.JenisSaranaParams) ([]JenisSarana, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_sarana:data:page:%d:limit:%d:penempatan:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Penempatan, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_sarana:total:penempatan:%v:search:%s",
		params.Penempatan, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisSarana
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis sarana data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisSarana(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sarana data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sarana total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisSdm mengambil daftar jenis SDM dengan pagination dan filter
func (s *service) GetJenisSdm(ctx context.Context, params types.JenisSdmParams) ([]JenisSdm, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_sdm:data:page:%d:limit:%d:guru_kelas:%v:guru_mapel:%v:guru_bk:%v:guru_inklusi:%v:pengawas_sp:%v:pengawas_plb:%v:pengawas_mapel:%v:pengawas_bid:%v:tas:%v:formal:%v:dosen:%v:peneliti:%v:perekayasa:%v:pranata:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.GuruKelas, params.GuruMapel, params.GuruBk, params.GuruInklusi, params.PengawasSp, params.PengawasPlb, params.PengawasMapel, params.PengawasBid, params.Tas, params.Formal, params.Dosen, params.Peneliti, params.Perekayasa, params.PranataLevel, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_sdm:total:guru_kelas:%v:guru_mapel:%v:guru_bk:%v:guru_inklusi:%v:pengawas_sp:%v:pengawas_plb:%v:pengawas_mapel:%v:pengawas_bid:%v:tas:%v:formal:%v:dosen:%v:peneliti:%v:perekayasa:%v:pranata:%v:search:%s",
		params.GuruKelas, params.GuruMapel, params.GuruBk, params.GuruInklusi, params.PengawasSp, params.PengawasPlb, params.PengawasMapel, params.PengawasBid, params.Tas, params.Formal, params.Dosen, params.Peneliti, params.Perekayasa, params.PranataLevel, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisSdm
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis sdm data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisSdm(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sdm data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sdm total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisSert mengambil daftar jenis sertifikasi dengan pagination dan filter
func (s *service) GetJenisSert(ctx context.Context, params types.JenisSertParams) ([]JenisSert, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_sert:data:page:%d:limit:%d:prof_guru:%v:kepsek:%v:laboran:%v:prof_dosen:%v:lembaga:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.ProfGuru, params.Kepsek, params.Laboran, params.ProfDosen, params.Lembaga, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_sert:total:prof_guru:%v:kepsek:%v:laboran:%v:prof_dosen:%v:lembaga:%v:search:%s",
		params.ProfGuru, params.Kepsek, params.Laboran, params.ProfDosen, params.Lembaga, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisSert
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis sert data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisSert(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sert data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sert total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisSms mengambil daftar jenis SMS dengan pagination
func (s *service) GetJenisSms(ctx context.Context, params types.PaginationParams) ([]JenisSms, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_sms:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_sms:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisSms
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis sms data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisSms(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sms data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis sms total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisSubst mengambil daftar jenis substansi dengan pagination
func (s *service) GetJenisSubst(ctx context.Context, params types.PaginationParams) ([]JenisSubst, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_subst:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_subst:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisSubst
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis subst data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisSubst(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis subst data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis subst total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisTes mengambil daftar jenis tes dengan pagination dan filter
func (s *service) GetJenisTes(ctx context.Context, params types.JenisTesParams) ([]JenisTes, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_tes:data:page:%d:limit:%d:nilai_maks:%v:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.NilaiMaks, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_tes:total:nilai_maks:%v:search:%s",
		params.NilaiMaks, params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisTes
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis tes data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisTes(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tes data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tes total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisTinggal mengambil daftar jenis tinggal dengan pagination
func (s *service) GetJenisTinggal(ctx context.Context, params types.PaginationParams) ([]JenisTinggal, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_tinggal:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_tinggal:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisTinggal
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis tinggal data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisTinggal(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tinggal data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tinggal total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisTunjangan mengambil daftar jenis tunjangan dengan pagination
func (s *service) GetJenisTunjangan(ctx context.Context, params types.PaginationParams) ([]JenisTunjangan, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_tunjangan:data:page:%d:limit:%d:search:%s:sort:%s:%s",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order)
	cacheKeyTotal := fmt.Sprintf("jenis_tunjangan:total:search:%s", params.Search)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisTunjangan
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis tunjangan data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisTunjangan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tunjangan data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis tunjangan total: %v", err)
		}
	}

	return data, total, nil
}

// GetJenisUnit mengambil daftar jenis unit dengan pagination
func (s *service) GetJenisUnit(ctx context.Context, params types.JenisUnitParams) ([]JenisUnit, int64, error) {
	cacheKeyData := fmt.Sprintf("jenis_unit:data:page:%d:limit:%d:search:%s:sort:%s:%s:id_fak_unila:%v:id_lemb_non_sp:%v:id_jur_unila:%v:id_jur:%v:id_jenj_didik:%v:id_sp:%v:id_blob:%v:id_wil:%v:id_induk_sms:%v:id_creator:%v:id_updater:%v:id_jns_sms:%v:id_fungsi_lab:%v:id_kel_usaha:%v",
		params.Page, params.Limit, params.Search, params.SortBy, params.Order,
		params.IDFakUnila, params.IDLembNonSP, params.IDJurUnila, params.IDJur,
		params.IDJenjDidik, params.IDSp, params.IDBlob, params.IDWil,
		params.IDIndukSms, params.IDCreator, params.IDUpdater, params.IDJnsSms,
		params.IDFungsiLab, params.IDKelUsaha)
	cacheKeyTotal := fmt.Sprintf("jenis_unit:total:search:%s:id_fak_unila:%v:id_lemb_non_sp:%v:id_jur_unila:%v:id_jur:%v:id_jenj_didik:%v:id_sp:%v:id_blob:%v:id_wil:%v:id_induk_sms:%v:id_creator:%v:id_updater:%v:id_jns_sms:%v:id_fungsi_lab:%v:id_kel_usaha:%v",
		params.Search,
		params.IDFakUnila, params.IDLembNonSP, params.IDJurUnila, params.IDJur,
		params.IDJenjDidik, params.IDSp, params.IDBlob, params.IDWil,
		params.IDIndukSms, params.IDCreator, params.IDUpdater, params.IDJnsSms,
		params.IDFungsiLab, params.IDKelUsaha)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil && cachedData != "" && cachedTotal != "" {
		var data []JenisUnit
		var total int64
		if err := json.Unmarshal([]byte(cachedData), &data); err == nil {
			if err := json.Unmarshal([]byte(cachedTotal), &total); err == nil {
				log.Printf("Cache hit for jenis unit data and total")
				return data, total, nil
			}
		}
	}

	data, total, err := s.repo.GetJenisUnit(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	if bytes, err := json.Marshal(data); err == nil {
		if err := cache.Set(ctx, cacheKeyData, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis unit data: %v", err)
		}
	}

	if bytes, err := json.Marshal(total); err == nil {
		if err := cache.Set(ctx, cacheKeyTotal, bytes, 10*time.Minute); err != nil {
			log.Printf("Failed to cache jenis unit total: %v", err)
		}
	}

	return data, total, nil
}
