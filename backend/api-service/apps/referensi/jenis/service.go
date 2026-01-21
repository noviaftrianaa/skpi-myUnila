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
