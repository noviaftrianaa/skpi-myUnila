package siakadu

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

const cacheTTL = 10 * time.Minute

type Service interface {
	// 11a
	ListMahasiswa(ctx context.Context, p MahasiswaParams) ([]Mahasiswa, int64, error)
	DetailMahasiswa(ctx context.Context, nim string) (*MahasiswaDetail, error)
	ListKeluargaMhs(ctx context.Context, p KeluargaMhsParams) ([]KeluargaMhs, int64, error)
	ListSdm(ctx context.Context, p SdmParams) ([]Sdm, int64, error)
	DetailSdm(ctx context.Context, idSdm string) (*Sdm, error)
	ListRegPtk(ctx context.Context, p RegPtkParams) ([]RegPtk, int64, error)
	ListWisuda(ctx context.Context, p WisudaParams) ([]WisudaMahasiswa, int64, error)
	ListPeriodeWisuda(ctx context.Context, p PeriodeWisudaParams) ([]PeriodeWisuda, int64, error)

	// 11b
	ListNilaiSmt(ctx context.Context, p NilaiSmtParams) ([]NilaiSmtMhs, int64, error)
	ListNilaiTranskrip(ctx context.Context, p NilaiTranskripParams) ([]NilaiTranskrip, int64, error)
	ListKehadiranMhs(ctx context.Context, p KehadiranMhsParams) ([]KehadiranMhs, int64, error)
	ListKehadiranSdm(ctx context.Context, p KehadiranSdmParams) ([]KehadiranSdm, int64, error)
	ListKinerjaDosen(ctx context.Context, p KinerjaDosenParams) ([]KinerjaDosen, int64, error)

	// 11c
	ListSppMhs(ctx context.Context, p SppMhsParams) ([]SppMhs, int64, error)
	ListDaftarUkt(ctx context.Context, p DaftarUktParams) ([]DaftarUkt, int64, error)
	ListKelasUkt(ctx context.Context, p KelasUktParams) ([]KelasUkt, int64, error)
	ListKuliahMhs(ctx context.Context, p KuliahMhsParams) ([]KuliahMhs, int64, error)
	ListPimpinanUnit(ctx context.Context, p PimpinanUnitParams) ([]PimpinanUnit, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "siakadu:"+key+":data", "siakadu:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tk); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
				return data, total, nil
			}
		}
	}
	data, total, err := fetch()
	if err != nil {
		return nil, 0, err
	}
	dj, _ := json.Marshal(data)
	tj, _ := json.Marshal(total)
	cache.Set(ctx, d, string(dj), cacheTTL)
	cache.Set(ctx, tk, string(tj), cacheTTL)
	return data, total, nil
}

// 11a
func (s *service) ListMahasiswa(ctx context.Context, p MahasiswaParams) ([]Mahasiswa, int64, error) {
	return cached(ctx, fmt.Sprintf("mhs:%s", utils.HashParams(p)),
		func() ([]Mahasiswa, int64, error) { return s.repo.ListMahasiswa(ctx, p) })
}
func (s *service) DetailMahasiswa(ctx context.Context, nim string) (*MahasiswaDetail, error) {
	return s.repo.DetailMahasiswa(ctx, nim)
}
func (s *service) ListKeluargaMhs(ctx context.Context, p KeluargaMhsParams) ([]KeluargaMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("keluarga:%s", utils.HashParams(p)),
		func() ([]KeluargaMhs, int64, error) { return s.repo.ListKeluargaMhs(ctx, p) })
}
func (s *service) ListSdm(ctx context.Context, p SdmParams) ([]Sdm, int64, error) {
	return cached(ctx, fmt.Sprintf("sdm:%s", utils.HashParams(p)),
		func() ([]Sdm, int64, error) { return s.repo.ListSdm(ctx, p) })
}
func (s *service) DetailSdm(ctx context.Context, idSdm string) (*Sdm, error) {
	return s.repo.DetailSdm(ctx, idSdm)
}
func (s *service) ListRegPtk(ctx context.Context, p RegPtkParams) ([]RegPtk, int64, error) {
	return cached(ctx, fmt.Sprintf("reg_ptk:%s", utils.HashParams(p)),
		func() ([]RegPtk, int64, error) { return s.repo.ListRegPtk(ctx, p) })
}
func (s *service) ListWisuda(ctx context.Context, p WisudaParams) ([]WisudaMahasiswa, int64, error) {
	return cached(ctx, fmt.Sprintf("wisuda:%s", utils.HashParams(p)),
		func() ([]WisudaMahasiswa, int64, error) { return s.repo.ListWisuda(ctx, p) })
}
func (s *service) ListPeriodeWisuda(ctx context.Context, p PeriodeWisudaParams) ([]PeriodeWisuda, int64, error) {
	return cached(ctx, fmt.Sprintf("periode_wisuda:%s", utils.HashParams(p)),
		func() ([]PeriodeWisuda, int64, error) { return s.repo.ListPeriodeWisuda(ctx, p) })
}

// 11b
func (s *service) ListNilaiSmt(ctx context.Context, p NilaiSmtParams) ([]NilaiSmtMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("nilai_smt:%s", utils.HashParams(p)),
		func() ([]NilaiSmtMhs, int64, error) { return s.repo.ListNilaiSmt(ctx, p) })
}
func (s *service) ListNilaiTranskrip(ctx context.Context, p NilaiTranskripParams) ([]NilaiTranskrip, int64, error) {
	return cached(ctx, fmt.Sprintf("transkrip:%s", utils.HashParams(p)),
		func() ([]NilaiTranskrip, int64, error) { return s.repo.ListNilaiTranskrip(ctx, p) })
}
func (s *service) ListKehadiranMhs(ctx context.Context, p KehadiranMhsParams) ([]KehadiranMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("kehadiran_mhs:%s", utils.HashParams(p)),
		func() ([]KehadiranMhs, int64, error) { return s.repo.ListKehadiranMhs(ctx, p) })
}
func (s *service) ListKehadiranSdm(ctx context.Context, p KehadiranSdmParams) ([]KehadiranSdm, int64, error) {
	return cached(ctx, fmt.Sprintf("kehadiran_sdm:%s", utils.HashParams(p)),
		func() ([]KehadiranSdm, int64, error) { return s.repo.ListKehadiranSdm(ctx, p) })
}
func (s *service) ListKinerjaDosen(ctx context.Context, p KinerjaDosenParams) ([]KinerjaDosen, int64, error) {
	return cached(ctx, fmt.Sprintf("kinerja:%s", utils.HashParams(p)),
		func() ([]KinerjaDosen, int64, error) { return s.repo.ListKinerjaDosen(ctx, p) })
}

// 11c
func (s *service) ListSppMhs(ctx context.Context, p SppMhsParams) ([]SppMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("spp:%s", utils.HashParams(p)),
		func() ([]SppMhs, int64, error) { return s.repo.ListSppMhs(ctx, p) })
}
func (s *service) ListDaftarUkt(ctx context.Context, p DaftarUktParams) ([]DaftarUkt, int64, error) {
	return cached(ctx, fmt.Sprintf("daftar_ukt:%s", utils.HashParams(p)),
		func() ([]DaftarUkt, int64, error) { return s.repo.ListDaftarUkt(ctx, p) })
}
func (s *service) ListKelasUkt(ctx context.Context, p KelasUktParams) ([]KelasUkt, int64, error) {
	return cached(ctx, fmt.Sprintf("kelas_ukt:%s", utils.HashParams(p)),
		func() ([]KelasUkt, int64, error) { return s.repo.ListKelasUkt(ctx, p) })
}
func (s *service) ListKuliahMhs(ctx context.Context, p KuliahMhsParams) ([]KuliahMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("kuliah_mhs:%s", utils.HashParams(p)),
		func() ([]KuliahMhs, int64, error) { return s.repo.ListKuliahMhs(ctx, p) })
}
func (s *service) ListPimpinanUnit(ctx context.Context, p PimpinanUnitParams) ([]PimpinanUnit, int64, error) {
	return cached(ctx, fmt.Sprintf("pimpinan:%s", utils.HashParams(p)),
		func() ([]PimpinanUnit, int64, error) { return s.repo.ListPimpinanUnit(ctx, p) })
}

// unused import silencer
var _ = log.Print
