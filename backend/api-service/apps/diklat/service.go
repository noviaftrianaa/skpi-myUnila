package diklat

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	cache "github.com/myunila/api-service/external/redis"

	"github.com/redis/go-redis/v9"
)

type Service interface {
	GetDiklat(ctx context.Context, params DiklatParams) ([]*Diklat, int64, error)
	GetDiklatByID(ctx context.Context, ID string) (*Diklat, error)
	CreateDiklat(ctx context.Context, params DiklatCreateRequest) (string, error)
	UpdateDiklat(ctx context.Context, params DiklatUpdateRequest) (string, error)
	DeleteDiklat(ctx context.Context, IDDiklat string) error
}

type service struct {
	repo      Repository
	redisConn *redis.Client
}

func NewService(repo Repository, redisConn *redis.Client) Service {
	return &service{repo: repo, redisConn: redisConn}
}

func (s *service) GetDiklat(ctx context.Context, params DiklatParams) ([]*Diklat, int64, error) {
	// Check cache first
	cachedKey := fmt.Sprintf("diklatpaging:%d:%d", params.Page, params.Limit)

	cachedData, err := cache.Get(ctx, cachedKey)
	if err == nil && cachedData != "" {
		var diklats []*Diklat
		err = json.Unmarshal([]byte(cachedData), &diklats)
		if err == nil {
			return diklats, int64(len(diklats)), nil
		}
	}

	data, total, err := s.repo.GetDiklat(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("get diklat: %w", err)
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Failed to marshal diklat for caching: %v", err)
	}

	if err := cache.Set(ctx, cachedKey, bytes, 10*time.Minute); err != nil {
		log.Printf("Failed to cache diklats: %v", err)
	}

	return data, total, nil
}

func (s *service) GetDiklatByID(ctx context.Context, ID string) (*Diklat, error) {
	// Check cache first
	cachedKey := fmt.Sprintf("diklat:%s", ID)

	cachedData, err := cache.Get(ctx, cachedKey)
	if err == nil && cachedData != "" {
		var diklat *Diklat
		err = json.Unmarshal([]byte(cachedData), &diklat)
		if err == nil {
			return diklat, nil
		}
	}

	data, err := s.repo.GetDiklatByID(ctx, ID)
	if err != nil {
		return nil, fmt.Errorf("get diklat: %w", err)
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Failed to marshal diklat for caching: %v", err)
	}

	if err := cache.Set(ctx, cachedKey, bytes, 10*time.Minute); err != nil {
		log.Printf("Failed to cache diklats: %v", err)
	}

	return data, nil
}

func (s *service) CreateDiklat(ctx context.Context, params DiklatCreateRequest) (string, error) {
	if err := cache.DelByPattern(ctx, "diklatpaging:*"); err != nil {
		log.Printf("Failed to delete cache for diklatpaging: %v", err)
	}

	return s.repo.CreateDiklat(ctx, params)
}

func (s *service) UpdateDiklat(ctx context.Context, params DiklatUpdateRequest) (string, error) {
	if err := cache.DelByPattern(ctx, "diklatpaging:*"); err != nil {
		log.Printf("Failed to delete cache for diklatpaging: %v", err)
	}
	return s.repo.UpdateDiklat(ctx, params)
}

func (s *service) DeleteDiklat(ctx context.Context, IDDiklat string) error {
	if err := cache.DelByPattern(ctx, "diklatpaging:*"); err != nil {
		log.Printf("Failed to delete cache for diklatpaging: %v", err)
	}
	return s.repo.DeleteDiklat(ctx, IDDiklat)
}
