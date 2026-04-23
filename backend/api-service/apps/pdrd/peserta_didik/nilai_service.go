package pesertadidik

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
)

const nilaiCacheTTL = 10 * time.Minute

func (s *service) GetNilaiSmtMhs(ctx context.Context, p types.NilaiSmtParams) ([]NilaiSmtMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("nilai_smt:%s", utils.HashParams(p)),
		func() ([]NilaiSmtMhs, int64, error) { return s.repo.GetNilaiSmtMhs(ctx, p) })
}
func (s *service) GetNilaiTranskrip(ctx context.Context, p types.NilaiTranskripParams) ([]NilaiTranskrip, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("transkrip:%s", utils.HashParams(p)),
		func() ([]NilaiTranskrip, int64, error) { return s.repo.GetNilaiTranskrip(ctx, p) })
}
func (s *service) GetKehadiranMhs(ctx context.Context, p types.KehadiranMhsParams) ([]KehadiranMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("kehadiran:%s", utils.HashParams(p)),
		func() ([]KehadiranMhs, int64, error) { return s.repo.GetKehadiranMhs(ctx, p) })
}
func (s *service) GetAktMhs(ctx context.Context, p types.AktMhsParams) ([]AktMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("akt_mhs:%s", utils.HashParams(p)),
		func() ([]AktMhs, int64, error) { return s.repo.GetAktMhs(ctx, p) })
}

func nilaiCached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tkey := "mhs:"+key+":data", "mhs:"+key+":total"
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
	cache.Set(ctx, d, string(dj), nilaiCacheTTL)
	cache.Set(ctx, tkey, string(tj), nilaiCacheTTL)
	return data, total, nil
}
