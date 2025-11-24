package matkul_kurikulum

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
)

// Service interface for matkul_kurikulum business logic
type Service interface {
	// List operations
	GetKurikulumList(ctx context.Context, page, limit int, search string, idProdi *string, sortBy, sortOrder string) (*KurikulumListResult, error)
	GetKurikulumByID(ctx context.Context, idKurikulumSP string) (*KurikulumSP, error)
	GetKurikulumDetail(ctx context.Context, idKurikulumSP string) (map[string]interface{}, error)
	GetMatkulByKurikulum(ctx context.Context, idKurikulumSP string, search string) ([]map[string]interface{}, error)

	// Utility operations
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetStats(ctx context.Context) (*KurikulumStats, error)

	// Sync operations (implemented in sync_service.go)
	SyncKurikulum(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchKurikulumSyncResult, error)
}

// service implementation
type service struct {
	repo        Repository
	feederAPI   FeederAPIClient
	redisClient *redis.Client
	loggerSvc   logger.Service
}

// FeederAPIClient interface for Feeder API operations
type FeederAPIClient interface {
	// Authentication
	TestConnection() error

	// Feeder API endpoints for kurikulum
	GetListKurikulum(filter string, limit, offset int) ([]byte, error)
	GetMatkulKurikulum(filter string, limit, offset int) ([]byte, error)
	GetListMataKuliah(filter string, limit, offset int) ([]byte, error)
}

// NewService creates a new matkul_kurikulum service
func NewService(
	repo Repository,
	feederAPI FeederAPIClient,
	redisClient *redis.Client,
	loggerSvc logger.Service,
) Service {
	return &service{
		repo:        repo,
		feederAPI:   feederAPI,
		redisClient: redisClient,
		loggerSvc:   loggerSvc,
	}
}

// GetKurikulumList retrieves paginated list of kurikulum with Redis caching
func (s *service) GetKurikulumList(ctx context.Context, page, limit int, search string, idProdi *string, sortBy, sortOrder string) (*KurikulumListResult, error) {
	// Check Redis cache first (only for non-search queries)
	if search == "" && s.redisClient != nil {
		cacheKey := s.buildCacheKey(page, limit, idProdi, sortBy, sortOrder)

		// Try to get from cache
		cachedData, err := s.getCachedKurikulumList(ctx, cacheKey)
		if err == nil && cachedData != nil {
			log.Printf("✅ [Cache HIT] GetKurikulumList - key: %s", cacheKey)
			return cachedData, nil
		}
		log.Printf("⚠️  [Cache MISS] GetKurikulumList - key: %s", cacheKey)
	}

	// Delegate to repository
	result, err := s.repo.GetKurikulumList(ctx, page, limit, search, idProdi, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	// Cache the result (only for non-search queries, TTL 5 minutes)
	if search == "" && s.redisClient != nil && result != nil {
		cacheKey := s.buildCacheKey(page, limit, idProdi, sortBy, sortOrder)
		if err := s.cacheKurikulumList(ctx, cacheKey, result); err != nil {
			log.Printf("⚠️  Failed to cache kurikulum list: %v", err)
		}
	}

	return result, nil
}

// GetKurikulumByID retrieves a single kurikulum by ID
func (s *service) GetKurikulumByID(ctx context.Context, idKurikulumSP string) (*KurikulumSP, error) {
	return s.repo.GetKurikulumByID(ctx, idKurikulumSP)
}

// GetKurikulumDetail retrieves complete kurikulum detail with matkul list
func (s *service) GetKurikulumDetail(ctx context.Context, idKurikulumSP string) (map[string]interface{}, error) {
	// Get kurikulum data
	kurikulum, err := s.repo.GetKurikulumByID(ctx, idKurikulumSP)
	if err != nil {
		return nil, err
	}

	// Get matkul list
	matkulList, err := s.repo.GetMatkulByKurikulum(ctx, idKurikulumSP)
	if err != nil {
		return nil, err
	}

	// Combine into single response
	detail := map[string]interface{}{
		"kurikulum": kurikulum,
		"matkul":    matkulList,
	}

	return detail, nil
}

// GetMatkulByKurikulum retrieves list of matkul for a kurikulum with optional search
func (s *service) GetMatkulByKurikulum(ctx context.Context, idKurikulumSP string, search string) ([]map[string]interface{}, error) {
	// Use the new detailed repository method
	if detailedRepo, ok := s.repo.(*repository); ok {
		return detailedRepo.GetMatkulByKurikulumWithDetails(ctx, idKurikulumSP, search)
	}

	// Fallback to original method (shouldn't happen in practice)
	matkulList, err := s.repo.GetMatkulByKurikulum(ctx, idKurikulumSP)
	if err != nil {
		return nil, err
	}

	result := make([]map[string]interface{}, 0)
	for _, mk := range matkulList {
		matkulInfo := map[string]interface{}{
			"id_mk":        mk.IDMk,
			"smt":          mk.Smt,
			"sks_mk":       mk.SksMk,
			"sks_tm":       mk.SksTm,
			"sks_prak":     mk.SksPrak,
			"sks_prak_lap": mk.SksPrakLap,
			"sks_sim":      mk.SksSim,
			"a_wajib":      mk.AWajib,
		}
		result = append(result, matkulInfo)
	}
	return result, nil
}

// GetProdiList retrieves list of prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// GetStats retrieves statistics for kurikulum
func (s *service) GetStats(ctx context.Context) (*KurikulumStats, error) {
	return s.repo.GetStats(ctx)
}

// Sync operations are implemented in sync_service.go

// ============================================================================
// Redis Caching Helper Methods
// ============================================================================

// buildCacheKey generates a deterministic cache key based on query parameters
func (s *service) buildCacheKey(page, limit int, idProdi *string, sortBy, sortOrder string) string {
	keyParts := []string{
		"kurikulum_list",
		fmt.Sprintf("p%d", page),
		fmt.Sprintf("l%d", limit),
	}

	if idProdi != nil && *idProdi != "" {
		keyParts = append(keyParts, "prodi:"+*idProdi)
	} else {
		keyParts = append(keyParts, "prodi:all")
	}

	if sortBy != "" {
		keyParts = append(keyParts, fmt.Sprintf("sort:%s:%s", sortBy, sortOrder))
	}

	// Create hash for shorter key
	key := strings.Join(keyParts, ":")
	if len(key) > 200 {
		hash := sha256.Sum256([]byte(key))
		return fmt.Sprintf("kurikulum_list:hash:%x", hash[:16])
	}

	return key
}

// getCachedKurikulumList retrieves cached kurikulum list from Redis
func (s *service) getCachedKurikulumList(ctx context.Context, cacheKey string) (*KurikulumListResult, error) {
	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err
	}

	var result KurikulumListResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %w", err)
	}

	return &result, nil
}

// cacheKurikulumList stores kurikulum list in Redis with TTL
func (s *service) cacheKurikulumList(ctx context.Context, cacheKey string, result *KurikulumListResult) error {
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	ttl := 5 * time.Minute

	if err := s.redisClient.Set(ctx, cacheKey, data, ttl).Err(); err != nil {
		return fmt.Errorf("failed to set cache: %w", err)
	}

	log.Printf("✅ [Cache SET] Cached kurikulum list - key: %s, TTL: %v", cacheKey, ttl)
	return nil
}
