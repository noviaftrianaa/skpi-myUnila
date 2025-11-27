package kelas_kuliah

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

// Service interface for kelas_kuliah business logic
type Service interface {
	// List operations
	GetKelasKuliahList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, sortBy, sortOrder string) (*KelasKuliahListResult, error)
	GetKelasKuliahByID(ctx context.Context, idKls string) (*KelasKuliah, error)
	GetKelasKuliahDetail(ctx context.Context, idKls string) (map[string]interface{}, error)

	// Utility operations
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)
	GetStats(ctx context.Context) (*KelasKuliahStats, error)

	// Sync operations (implemented in sync_service.go)
	SyncKelasKuliah(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchKelasKuliahSyncResult, error)
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

	// Feeder API endpoints for kelas kuliah
	GetListKelasKuliah(filter string, limit, offset int) ([]byte, error)
	GetDosenPengajarKelasKuliah(filter string, limit, offset int) ([]byte, error)
}

// NewService creates a new kelas_kuliah service
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

// GetKelasKuliahList retrieves paginated list of kelas kuliah with Redis caching
func (s *service) GetKelasKuliahList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, sortBy, sortOrder string) (*KelasKuliahListResult, error) {
	// Check Redis cache first (only for non-search queries)
	if search == "" && s.redisClient != nil {
		cacheKey := s.buildCacheKey(page, limit, idSemester, idProdi, sortBy, sortOrder)

		cachedData, err := s.getCachedKelasKuliahList(ctx, cacheKey)
		if err == nil && cachedData != nil {
			log.Printf("✅ [Cache HIT] GetKelasKuliahList - key: %s", cacheKey)
			return cachedData, nil
		}
		log.Printf("⚠️  [Cache MISS] GetKelasKuliahList - key: %s", cacheKey)
	}

	// Delegate to repository
	result, err := s.repo.GetKelasKuliahList(ctx, page, limit, search, idSemester, idProdi, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	// Cache the result (only for non-search queries, TTL 5 minutes)
	if search == "" && s.redisClient != nil && result != nil {
		cacheKey := s.buildCacheKey(page, limit, idSemester, idProdi, sortBy, sortOrder)
		if err := s.cacheKelasKuliahList(ctx, cacheKey, result); err != nil {
			log.Printf("⚠️  Failed to cache kelas kuliah list: %v", err)
		}
	}

	return result, nil
}

// GetKelasKuliahByID retrieves a single kelas kuliah by ID
func (s *service) GetKelasKuliahByID(ctx context.Context, idKls string) (*KelasKuliah, error) {
	return s.repo.GetKelasKuliahByID(ctx, idKls)
}

// GetKelasKuliahDetail retrieves complete kelas kuliah detail with dosen pengajar list
func (s *service) GetKelasKuliahDetail(ctx context.Context, idKls string) (map[string]interface{}, error) {
	// Get kelas kuliah data
	kelasKuliah, err := s.repo.GetKelasKuliahByID(ctx, idKls)
	if err != nil {
		return nil, err
	}

	// Get dosen pengajar list
	dosenList, err := s.repo.GetDosenPengajarByKelas(ctx, idKls)
	if err != nil {
		return nil, err
	}

	// Combine into single response
	detail := map[string]interface{}{
		"kelas_kuliah":   kelasKuliah,
		"dosen_pengajar": dosenList,
	}

	return detail, nil
}

// GetProdiList retrieves list of prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// GetSemesterList retrieves list of semesters with kelas kuliah data
func (s *service) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetSemesterList(ctx)
}

// GetStats retrieves statistics for kelas kuliah
func (s *service) GetStats(ctx context.Context) (*KelasKuliahStats, error) {
	return s.repo.GetStats(ctx)
}

// ============================================================================
// Redis Caching Helper Methods
// ============================================================================

// buildCacheKey generates a deterministic cache key based on query parameters
func (s *service) buildCacheKey(page, limit int, idSemester []string, idProdi *string, sortBy, sortOrder string) string {
	keyParts := []string{
		"kelas_kuliah_list",
		fmt.Sprintf("p%d", page),
		fmt.Sprintf("l%d", limit),
	}

	if len(idSemester) > 0 {
		keyParts = append(keyParts, fmt.Sprintf("sem:%s", strings.Join(idSemester, ",")))
	} else {
		keyParts = append(keyParts, "sem:all")
	}

	if idProdi != nil && *idProdi != "" {
		keyParts = append(keyParts, "prodi:"+*idProdi)
	} else {
		keyParts = append(keyParts, "prodi:all")
	}

	if sortBy != "" {
		keyParts = append(keyParts, fmt.Sprintf("sort:%s:%s", sortBy, sortOrder))
	}

	key := strings.Join(keyParts, ":")
	if len(key) > 200 {
		hash := sha256.Sum256([]byte(key))
		return fmt.Sprintf("kelas_kuliah_list:hash:%x", hash[:16])
	}

	return key
}

// getCachedKelasKuliahList retrieves cached kelas kuliah list from Redis
func (s *service) getCachedKelasKuliahList(ctx context.Context, cacheKey string) (*KelasKuliahListResult, error) {
	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err
	}

	var result KelasKuliahListResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %w", err)
	}

	return &result, nil
}

// cacheKelasKuliahList stores kelas kuliah list in Redis with TTL
func (s *service) cacheKelasKuliahList(ctx context.Context, cacheKey string, result *KelasKuliahListResult) error {
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	ttl := 5 * time.Minute

	if err := s.redisClient.Set(ctx, cacheKey, data, ttl).Err(); err != nil {
		return fmt.Errorf("failed to set cache: %w", err)
	}

	log.Printf("✅ [Cache SET] Cached kelas kuliah list - key: %s, TTL: %v", cacheKey, ttl)
	return nil
}
