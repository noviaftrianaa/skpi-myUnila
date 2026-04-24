package akademik

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

const cacheTTL = 15 * time.Minute // matkul/kelas/jadwal relatif stabil per semester

type Service interface {
	GetMatkulList(ctx context.Context, p MatkulParams) ([]Matkul, int64, error)
	GetMatkulDetail(ctx context.Context, p MatkulParams) ([]MatkulDetail, int64, error)
	GetKelasKuliah(ctx context.Context, p KelasKuliahParams) ([]KelasKuliah, int64, error)
	GetJadwalKelas(ctx context.Context, p JadwalKelasParams) ([]JadwalKelas, int64, error)
	GetKurikulum(ctx context.Context, p KurikulumParams) ([]Kurikulum, int64, error)

	// Batch 8 — akademik advanced
	GetAktAjarDosen(ctx context.Context, p AktAjarDosenParams) ([]AktAjarDosen, int64, error)
	GetRencanaAjar(ctx context.Context, p RencanaAjarParams) ([]RencanaAjar, int64, error)
	GetMatkulKurikulum(ctx context.Context, p MatkulKurikulumParams) ([]MatkulKurikulum, int64, error)
	GetSubstansiKuliah(ctx context.Context, p SubstansiKuliahParams) ([]SubstansiKuliah, int64, error)
	GetReMk(ctx context.Context, p ReMkParams) ([]ReMk, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, r *redis.Client) Service { return &service{repo: repo, rConn: r} }

func cachedFetch[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tkey := "akademik:"+key+":data", "akademik:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tkey); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
				log.Printf("Cache hit %s", key)
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
	cache.Set(ctx, tkey, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) GetMatkulList(ctx context.Context, p MatkulParams) ([]Matkul, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("matkul_list:%s", utils.HashParams(p)),
		func() ([]Matkul, int64, error) { return s.repo.GetMatkulList(ctx, p) })
}
func (s *service) GetMatkulDetail(ctx context.Context, p MatkulParams) ([]MatkulDetail, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("matkul_detail:%s", utils.HashParams(p)),
		func() ([]MatkulDetail, int64, error) { return s.repo.GetMatkulDetail(ctx, p) })
}
func (s *service) GetKelasKuliah(ctx context.Context, p KelasKuliahParams) ([]KelasKuliah, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("kelas:%s", utils.HashParams(p)),
		func() ([]KelasKuliah, int64, error) { return s.repo.GetKelasKuliah(ctx, p) })
}
func (s *service) GetJadwalKelas(ctx context.Context, p JadwalKelasParams) ([]JadwalKelas, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("jadwal:%s", utils.HashParams(p)),
		func() ([]JadwalKelas, int64, error) { return s.repo.GetJadwalKelas(ctx, p) })
}
func (s *service) GetKurikulum(ctx context.Context, p KurikulumParams) ([]Kurikulum, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("kurikulum:%s", utils.HashParams(p)),
		func() ([]Kurikulum, int64, error) { return s.repo.GetKurikulum(ctx, p) })
}
