package kerjasama

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/redis/go-redis/v9"
)

const cacheTTL = 5 * time.Minute // CRUD-heavy, TTL pendek

type Service interface {
	// mou
	ListMou(ctx context.Context, p MouParams) ([]Mou, int64, error)
	GetMou(ctx context.Context, id string) (*Mou, error)
	CreateMou(ctx context.Context, in MouCreate) (string, error)
	UpdateMou(ctx context.Context, id string, in MouUpdate) error
	DeleteMou(ctx context.Context, id, idUpdater string) error

	// sms_kerjasama
	ListSmsKerjasama(ctx context.Context, p SmsKerjasamaParams) ([]SmsKerjasama, int64, error)
	GetSmsKerjasama(ctx context.Context, id string) (*SmsKerjasama, error)
	CreateSmsKerjasama(ctx context.Context, in SmsKerjasamaCreate) (string, error)
	UpdateSmsKerjasama(ctx context.Context, id string, in SmsKerjasamaUpdate) error
	DeleteSmsKerjasama(ctx context.Context, id, idUpdater string) error

	// dudi
	ListDudi(ctx context.Context, p DudiParams) ([]Dudi, int64, error)
	GetDudi(ctx context.Context, id string) (*Dudi, error)
	CreateDudi(ctx context.Context, in DudiCreate) (string, error)
	UpdateDudi(ctx context.Context, id string, in DudiUpdate) error
	DeleteDudi(ctx context.Context, id, idUpdater string) error
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "kerjasama:"+key+":data", "kerjasama:"+key+":total"
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

// mou
func (s *service) ListMou(ctx context.Context, p MouParams) ([]Mou, int64, error) {
	return cached(ctx, fmt.Sprintf("mou:%s", utils.HashParams(p)),
		func() ([]Mou, int64, error) { return s.repo.ListMou(ctx, p) })
}
func (s *service) GetMou(ctx context.Context, id string) (*Mou, error) { return s.repo.GetMou(ctx, id) }
func (s *service) CreateMou(ctx context.Context, in MouCreate) (string, error) {
	return s.repo.CreateMou(ctx, in)
}
func (s *service) UpdateMou(ctx context.Context, id string, in MouUpdate) error {
	return s.repo.UpdateMou(ctx, id, in)
}
func (s *service) DeleteMou(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteMou(ctx, id, idUpdater)
}

// sms_kerjasama
func (s *service) ListSmsKerjasama(ctx context.Context, p SmsKerjasamaParams) ([]SmsKerjasama, int64, error) {
	return cached(ctx, fmt.Sprintf("sms_k:%s", utils.HashParams(p)),
		func() ([]SmsKerjasama, int64, error) { return s.repo.ListSmsKerjasama(ctx, p) })
}
func (s *service) GetSmsKerjasama(ctx context.Context, id string) (*SmsKerjasama, error) {
	return s.repo.GetSmsKerjasama(ctx, id)
}
func (s *service) CreateSmsKerjasama(ctx context.Context, in SmsKerjasamaCreate) (string, error) {
	return s.repo.CreateSmsKerjasama(ctx, in)
}
func (s *service) UpdateSmsKerjasama(ctx context.Context, id string, in SmsKerjasamaUpdate) error {
	return s.repo.UpdateSmsKerjasama(ctx, id, in)
}
func (s *service) DeleteSmsKerjasama(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteSmsKerjasama(ctx, id, idUpdater)
}

// dudi
func (s *service) ListDudi(ctx context.Context, p DudiParams) ([]Dudi, int64, error) {
	return cached(ctx, fmt.Sprintf("dudi:%s", utils.HashParams(p)),
		func() ([]Dudi, int64, error) { return s.repo.ListDudi(ctx, p) })
}
func (s *service) GetDudi(ctx context.Context, id string) (*Dudi, error) {
	return s.repo.GetDudi(ctx, id)
}
func (s *service) CreateDudi(ctx context.Context, in DudiCreate) (string, error) {
	return s.repo.CreateDudi(ctx, in)
}
func (s *service) UpdateDudi(ctx context.Context, id string, in DudiUpdate) error {
	return s.repo.UpdateDudi(ctx, id, in)
}
func (s *service) DeleteDudi(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteDudi(ctx, id, idUpdater)
}
