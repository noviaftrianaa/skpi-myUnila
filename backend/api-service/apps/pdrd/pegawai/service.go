package pegawai

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
	GetList(ctx context.Context, p types.PegawaiParams) ([]Pegawai, int64, error)
	GetDetail(ctx context.Context, p types.PegawaiParams) ([]PegawaiDetail, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func (s *service) GetList(ctx context.Context, p types.PegawaiParams) ([]Pegawai, int64, error) {
	h := utils.HashParams(p)
	dKey, tKey := fmt.Sprintf("pegawai:list:data:%s", h), fmt.Sprintf("pegawai:list:total:%s", h)
	if d, e1 := cache.Get(ctx, dKey); e1 == nil {
		if t, e2 := cache.Get(ctx, tKey); e2 == nil {
			var data []Pegawai
			var total int64
			if json.Unmarshal([]byte(d), &data) == nil && json.Unmarshal([]byte(t), &total) == nil {
				log.Printf("Cache hit pegawai list")
				return data, total, nil
			}
		}
	}
	data, total, err := s.repo.GetList(ctx, p)
	if err != nil {
		return nil, 0, err
	}
	dJSON, _ := json.Marshal(data)
	tJSON, _ := json.Marshal(total)
	cache.Set(ctx, dKey, string(dJSON), cacheTTL)
	cache.Set(ctx, tKey, string(tJSON), cacheTTL)
	return data, total, nil
}

func (s *service) GetDetail(ctx context.Context, p types.PegawaiParams) ([]PegawaiDetail, int64, error) {
	h := utils.HashParams(p)
	dKey, tKey := fmt.Sprintf("pegawai:detail:data:%s", h), fmt.Sprintf("pegawai:detail:total:%s", h)
	if d, e1 := cache.Get(ctx, dKey); e1 == nil {
		if t, e2 := cache.Get(ctx, tKey); e2 == nil {
			var data []PegawaiDetail
			var total int64
			if json.Unmarshal([]byte(d), &data) == nil && json.Unmarshal([]byte(t), &total) == nil {
				log.Printf("Cache hit pegawai detail")
				return data, total, nil
			}
		}
	}
	data, total, err := s.repo.GetDetail(ctx, p)
	if err != nil {
		return nil, 0, err
	}
	dJSON, _ := json.Marshal(data)
	tJSON, _ := json.Marshal(total)
	cache.Set(ctx, dKey, string(dJSON), cacheTTL)
	cache.Set(ctx, tKey, string(tJSON), cacheTTL)
	return data, total, nil
}
