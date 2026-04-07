package common

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
	// New entities
	GetKbli(ctx context.Context, params types.KbliParams) ([]Kbli, int64, error)
	GetKeahlianLab(ctx context.Context, params types.PaginationParams) ([]KeahlianLab, int64, error)
	GetKebutuhanKhusus(ctx context.Context, params types.PaginationParams) ([]KebutuhanKhusus, int64, error)
	GetKriteriaMitra(ctx context.Context, params types.PaginationParams) ([]KriteriaMitra, int64, error)
	GetLevelWilayah(ctx context.Context, params types.PaginationParams) ([]LevelWilayah, int64, error)
	GetMediaPublikasi(ctx context.Context, params types.MediaPublikasiParams) ([]MediaPublikasi, int64, error)
	GetNegara(ctx context.Context, params types.NegaraParams) ([]Negara, int64, error)
	GetNilaiAkred(ctx context.Context, params types.PaginationParams) ([]NilaiAkred, int64, error)
	GetPangkatGolongan(ctx context.Context, params types.PangkatGolonganParams) ([]PangkatGolongan, int64, error)
	GetPekerjaan(ctx context.Context, params types.PaginationParams) ([]Pekerjaan, int64, error)
	GetPembiayaan(ctx context.Context, params types.PaginationParams) ([]Pembiayaan, int64, error)
	GetPenghasilan(ctx context.Context, params types.PaginationParams) ([]Penghasilan, int64, error)
	GetSatuan(ctx context.Context, params types.PaginationParams) ([]Satuan, int64, error)
	GetTahunAnggaran(ctx context.Context, params types.TahunAnggaranParams) ([]TahunAnggaran, int64, error)
	GetTse(ctx context.Context, params types.TseParams) ([]Tse, int64, error)
	GetSkimKegiatan(ctx context.Context, params types.SkimKegiatanParams) ([]SkimKegiatan, int64, error)
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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("semester:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("semester:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tahun_ajaran:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tahun_ajaran:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("agama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("agama:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("wilayah:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("wilayah:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("aktifitas_kerjasama:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("aktifitas_kerjasama:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("basis_evaluasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("basis_evaluasi:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("fungsi_lab:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("fungsi_lab:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("gelar_akademik:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("gelar_akademik:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("ikatan_kerja_sdm:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("ikatan_kerja_sdm:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jalur_daftar:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jalur_daftar:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jenjang_pendidikan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jenjang_pendidikan:total:%s", h)

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
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("jurusan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("jurusan:total:%s", h)

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

// ============================================================================
// Kbli
// ============================================================================

func (s *service) GetKbli(ctx context.Context, params types.KbliParams) ([]Kbli, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kbli:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kbli:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Kbli
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kbli data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKbli(ctx, params)
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
// KeahlianLab
// ============================================================================

func (s *service) GetKeahlianLab(ctx context.Context, params types.PaginationParams) ([]KeahlianLab, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("keahlian_lab:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("keahlian_lab:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KeahlianLab
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for keahlian lab data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKeahlianLab(ctx, params)
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
// KebutuhanKhusus
// ============================================================================

func (s *service) GetKebutuhanKhusus(ctx context.Context, params types.PaginationParams) ([]KebutuhanKhusus, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kebutuhan_khusus:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kebutuhan_khusus:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KebutuhanKhusus
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kebutuhan khusus data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKebutuhanKhusus(ctx, params)
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
// KriteriaMitra
// ============================================================================

func (s *service) GetKriteriaMitra(ctx context.Context, params types.PaginationParams) ([]KriteriaMitra, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("kriteria_mitra:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("kriteria_mitra:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []KriteriaMitra
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for kriteria mitra data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetKriteriaMitra(ctx, params)
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
// LevelWilayah
// ============================================================================

func (s *service) GetLevelWilayah(ctx context.Context, params types.PaginationParams) ([]LevelWilayah, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("level_wilayah:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("level_wilayah:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []LevelWilayah
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for level wilayah data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetLevelWilayah(ctx, params)
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
// MediaPublikasi
// ============================================================================

func (s *service) GetMediaPublikasi(ctx context.Context, params types.MediaPublikasiParams) ([]MediaPublikasi, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("media_publikasi:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("media_publikasi:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []MediaPublikasi
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for media publikasi data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetMediaPublikasi(ctx, params)
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
// Negara
// ============================================================================

func (s *service) GetNegara(ctx context.Context, params types.NegaraParams) ([]Negara, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("negara:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("negara:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Negara
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for negara data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetNegara(ctx, params)
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
// NilaiAkred
// ============================================================================

func (s *service) GetNilaiAkred(ctx context.Context, params types.PaginationParams) ([]NilaiAkred, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("nilai_akred:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("nilai_akred:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []NilaiAkred
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for nilai akred data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetNilaiAkred(ctx, params)
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
// PangkatGolongan
// ============================================================================

func (s *service) GetPangkatGolongan(ctx context.Context, params types.PangkatGolonganParams) ([]PangkatGolongan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("pangkat_golongan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("pangkat_golongan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []PangkatGolongan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for pangkat golongan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPangkatGolongan(ctx, params)
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
// Pembiayaan
// ============================================================================

func (s *service) GetPembiayaan(ctx context.Context, params types.PaginationParams) ([]Pembiayaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("pembiayaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("pembiayaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Pembiayaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for pembiayaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPembiayaan(ctx, params)
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
// Pekerjaan
// ============================================================================

func (s *service) GetPekerjaan(ctx context.Context, params types.PaginationParams) ([]Pekerjaan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("pekerjaan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("pekerjaan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Pekerjaan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for pekerjaan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPekerjaan(ctx, params)
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
// Penghasilan
// ============================================================================

func (s *service) GetPenghasilan(ctx context.Context, params types.PaginationParams) ([]Penghasilan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("penghasilan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("penghasilan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Penghasilan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for penghasilan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetPenghasilan(ctx, params)
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
// Satuan
// ============================================================================

func (s *service) GetSatuan(ctx context.Context, params types.PaginationParams) ([]Satuan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("satuan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("satuan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Satuan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for satuan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSatuan(ctx, params)
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
// TahunAnggaran
// ============================================================================

func (s *service) GetTahunAnggaran(ctx context.Context, params types.TahunAnggaranParams) ([]TahunAnggaran, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tahun_anggaran:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tahun_anggaran:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []TahunAnggaran
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tahun anggaran data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTahunAnggaran(ctx, params)
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
// Tse
// ============================================================================

func (s *service) GetTse(ctx context.Context, params types.TseParams) ([]Tse, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("tse:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("tse:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []Tse
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for tse data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetTse(ctx, params)
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
// SkimKegiatan
// ============================================================================

func (s *service) GetSkimKegiatan(ctx context.Context, params types.SkimKegiatanParams) ([]SkimKegiatan, int64, error) {
	h := utils.HashParams(params)
	cacheKeyData := fmt.Sprintf("skim_kegiatan:data:%s", h)
	cacheKeyTotal := fmt.Sprintf("skim_kegiatan:total:%s", h)

	cachedData, err1 := cache.Get(ctx, cacheKeyData)
	cachedTotal, err2 := cache.Get(ctx, cacheKeyTotal)

	if err1 == nil && err2 == nil {
		var data []SkimKegiatan
		var total int64
		if json.Unmarshal([]byte(cachedData), &data) == nil && json.Unmarshal([]byte(cachedTotal), &total) == nil {
			log.Printf("Cache hit for skim kegiatan data and total")
			return data, total, nil
		}
	}

	data, total, err := s.repo.GetSkimKegiatan(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	dataJSON, _ := json.Marshal(data)
	totalJSON, _ := json.Marshal(total)
	cache.Set(ctx, cacheKeyData, string(dataJSON), 10*time.Minute)
	cache.Set(ctx, cacheKeyTotal, string(totalJSON), 10*time.Minute)

	return data, total, nil
}
