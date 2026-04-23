package sdm

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

const cacheTTL = 10 * time.Minute

type Service interface {
	GetSDMList(ctx context.Context, p types.SDMParams) ([]SDM, int64, error)
	GetSDMDetail(ctx context.Context, p types.SDMDetailParams) ([]SDMDetail, int64, error)
	GetPenugasan(ctx context.Context, p types.RegPtkParams) ([]RegPtk, int64, error)
	GetRiwayatPendFormal(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatPendFormal, int64, error)
	GetRiwayatFungsional(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatFungsional, int64, error)
	GetRiwayatKepangkatan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatKepangkatan, int64, error)
	GetRiwayatTugasTambahan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatTugasTambahan, int64, error)
	GetRiwayatSertifikasi(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatSertifikasi, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(repo Repository, rConn *redis.Client) Service { return &service{repo: repo, rConn: rConn} }

// Generic cache helper supaya tidak duplikasi 7x
func cached[T any](ctx context.Context, key string, ttl time.Duration,
	fetch func() ([]T, int64, error)) ([]T, int64, error) {

	dKey, tKey := "sdm:"+key+":data", "sdm:"+key+":total"
	dStr, err1 := cache.Get(ctx, dKey)
	tStr, err2 := cache.Get(ctx, tKey)
	if err1 == nil && err2 == nil {
		var data []T
		var total int64
		if json.Unmarshal([]byte(dStr), &data) == nil && json.Unmarshal([]byte(tStr), &total) == nil {
			log.Printf("Cache hit %s", key)
			return data, total, nil
		}
	}
	data, total, err := fetch()
	if err != nil {
		return nil, 0, err
	}
	dJSON, _ := json.Marshal(data)
	tJSON, _ := json.Marshal(total)
	cache.Set(ctx, dKey, string(dJSON), ttl)
	cache.Set(ctx, tKey, string(tJSON), ttl)
	return data, total, nil
}

func (s *service) GetSDMList(ctx context.Context, p types.SDMParams) ([]SDM, int64, error) {
	key := fmt.Sprintf("list:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]SDM, int64, error) { return s.repo.GetSDMList(ctx, p) })
}

func (s *service) GetSDMDetail(ctx context.Context, p types.SDMDetailParams) ([]SDMDetail, int64, error) {
	key := fmt.Sprintf("detail:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]SDMDetail, int64, error) { return s.repo.GetSDMDetail(ctx, p) })
}

func (s *service) GetPenugasan(ctx context.Context, p types.RegPtkParams) ([]RegPtk, int64, error) {
	key := fmt.Sprintf("penugasan:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RegPtk, int64, error) { return s.repo.GetPenugasan(ctx, p) })
}

func (s *service) GetRiwayatPendFormal(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatPendFormal, int64, error) {
	key := fmt.Sprintf("rwy_pend:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RiwayatPendFormal, int64, error) { return s.repo.GetRiwayatPendFormal(ctx, p) })
}

func (s *service) GetRiwayatFungsional(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatFungsional, int64, error) {
	key := fmt.Sprintf("rwy_fung:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RiwayatFungsional, int64, error) { return s.repo.GetRiwayatFungsional(ctx, p) })
}

func (s *service) GetRiwayatKepangkatan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatKepangkatan, int64, error) {
	key := fmt.Sprintf("rwy_pangkat:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RiwayatKepangkatan, int64, error) { return s.repo.GetRiwayatKepangkatan(ctx, p) })
}

func (s *service) GetRiwayatTugasTambahan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatTugasTambahan, int64, error) {
	key := fmt.Sprintf("rwy_tgs:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RiwayatTugasTambahan, int64, error) { return s.repo.GetRiwayatTugasTambahan(ctx, p) })
}

func (s *service) GetRiwayatSertifikasi(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatSertifikasi, int64, error) {
	key := fmt.Sprintf("rwy_sert:%s", utils.HashParams(p))
	return cached(ctx, key, cacheTTL, func() ([]RiwayatSertifikasi, int64, error) { return s.repo.GetRiwayatSertifikasi(ctx, p) })
}
