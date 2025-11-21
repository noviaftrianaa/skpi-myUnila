package mahasiswa

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/myunila/feeder-service/apps/logger"
)

// Service interface for mahasiswa business logic
type Service interface {
	// List operations
	GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string, sortBy, sortOrder string) (*MahasiswaListResult, error)
	GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error)
	GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error)

	// Utility operations
	GetAngkatanList(ctx context.Context) ([]string, error)
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)

	// Sync operations (implemented in sync_service.go)
	SyncMahasiswaByAngkatan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchMahasiswaSyncResult, error)
	SyncSingleMahasiswaTest(ctx context.Context, idRegPd string) (*MahasiswaSyncResult, error)

	// Token management
	ForceRefreshToken() error
}

// service implementation
type service struct {
	repo          Repository
	feederAPI     FeederAPIClient
	redisClient   *redis.Client
	loggerService logger.Service
}

// FeederAPIClient interface for Feeder API operations
type FeederAPIClient interface {
	// Authentication
	GetToken() error
	ForceRefreshToken() error
	TestConnection() error

	// Feeder API endpoints
	GetDataLengkapMahasiswaProdi(idProdi string, filter string, limit, offset int) ([]byte, error)
	GetListRiwayatPendidikanMahasiswa(idRegPd string) ([]byte, error)
	GetDetailMahasiswaLulusDO(idRegPd string) ([]byte, error)
	GetListPerkuliahanMahasiswa(idRegPd string) ([]byte, error)
}

// NewService creates a new mahasiswa service
func NewService(
	repo Repository,
	feederAPI FeederAPIClient,
	redisClient *redis.Client,
	loggerSvc logger.Service,
) Service {
	return &service{
		repo:          repo,
		feederAPI:     feederAPI,
		redisClient:   redisClient,
		loggerService: loggerSvc,
	}
}

// GetMahasiswaList retrieves paginated list of mahasiswa with Redis caching
func (s *service) GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string, sortBy, sortOrder string) (*MahasiswaListResult, error) {
	// Empty angkatan means "all angkatan" - no filter applied
	// Repository will handle empty array correctly by not adding WHERE clause

	// Check Redis cache first (only for non-search queries to ensure cache efficiency)
	if search == "" && s.redisClient != nil {
		cacheKey := s.buildCacheKey(page, limit, angkatan, idProdi, sortBy, sortOrder)

		// Try to get from cache
		cachedData, err := s.getCachedMahasiswaList(ctx, cacheKey)
		if err == nil && cachedData != nil {
			log.Printf("✅ [Cache HIT] GetMahasiswaList - key: %s", cacheKey)
			return cachedData, nil
		}
		log.Printf("⚠️  [Cache MISS] GetMahasiswaList - key: %s", cacheKey)
	}

	// Delegate to repository
	result, err := s.repo.GetMahasiswaList(ctx, page, limit, search, angkatan, idProdi, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	// Cache the result (only for non-search queries, TTL 5 minutes)
	if search == "" && s.redisClient != nil && result != nil {
		cacheKey := s.buildCacheKey(page, limit, angkatan, idProdi, sortBy, sortOrder)
		if err := s.cacheMahasiswaList(ctx, cacheKey, result); err != nil {
			log.Printf("⚠️  Failed to cache mahasiswa list: %v", err)
			// Don't return error, just log it
		}
	}

	return result, nil
}

// GetMahasiswaByID retrieves a single mahasiswa by ID
func (s *service) GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error) {
	return s.repo.GetMahasiswaByID(ctx, idPD)
}

// GetMahasiswaStats retrieves statistics for dashboard
func (s *service) GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error) {
	return s.repo.GetMahasiswaStats(ctx)
}

// GetAngkatanList retrieves available angkatan list
func (s *service) GetAngkatanList(ctx context.Context) ([]string, error) {
	return s.repo.GetAngkatanList(ctx)
}

// GetProdiList retrieves list of prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// ForceRefreshToken forces token refresh for scheduled jobs
func (s *service) ForceRefreshToken() error {
	log.Println("🔄 [Mahasiswa Service] Forcing Feeder API token refresh...")
	return s.feederAPI.ForceRefreshToken()
}

// Sync operations are implemented in sync_service.go
// This separation keeps the service.go file clean and focused on CRUD operations

// ============================================================================
// Redis Caching Helper Methods
// ============================================================================

// buildCacheKey generates a deterministic cache key based on query parameters
func (s *service) buildCacheKey(page, limit int, angkatan []string, idProdi *string, sortBy, sortOrder string) string {
	// Sort angkatan for deterministic key
	sortedAngkatan := make([]string, len(angkatan))
	copy(sortedAngkatan, angkatan)
	sort.Strings(sortedAngkatan)

	// Build key parts
	keyParts := []string{
		"mahasiswa_list",
		fmt.Sprintf("p%d", page),
		fmt.Sprintf("l%d", limit),
	}

	if len(sortedAngkatan) > 0 {
		keyParts = append(keyParts, "ang:"+strings.Join(sortedAngkatan, ","))
	} else {
		keyParts = append(keyParts, "ang:all")
	}

	if idProdi != nil && *idProdi != "" {
		keyParts = append(keyParts, "prodi:"+*idProdi)
	} else {
		keyParts = append(keyParts, "prodi:all")
	}

	// Add sorting parameters to cache key
	if sortBy != "" {
		keyParts = append(keyParts, fmt.Sprintf("sort:%s:%s", sortBy, sortOrder))
	}

	// Create hash for shorter key (optional, for very long angkatan lists)
	key := strings.Join(keyParts, ":")
	if len(key) > 200 {
		hash := sha256.Sum256([]byte(key))
		return fmt.Sprintf("mahasiswa_list:hash:%x", hash[:16])
	}

	return key
}

// getCachedMahasiswaList retrieves cached mahasiswa list from Redis
func (s *service) getCachedMahasiswaList(ctx context.Context, cacheKey string) (*MahasiswaListResult, error) {
	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err // redis.Nil or other error
	}

	var result MahasiswaListResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %w", err)
	}

	return &result, nil
}

// cacheMahasiswaList stores mahasiswa list in Redis with TTL
func (s *service) cacheMahasiswaList(ctx context.Context, cacheKey string, result *MahasiswaListResult) error {
	// Serialize to JSON
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	// Cache for 5 minutes (adjust based on your sync frequency)
	// If you sync every 1 hour, you can increase TTL to 30-60 minutes
	ttl := 5 * time.Minute

	if err := s.redisClient.Set(ctx, cacheKey, data, ttl).Err(); err != nil {
		return fmt.Errorf("failed to set cache: %w", err)
	}

	log.Printf("✅ [Cache SET] Cached mahasiswa list - key: %s, TTL: %v", cacheKey, ttl)
	return nil
}

// GetSyncLogs retrieves sync logs with filtering
func (s *service) GetSyncLogs(ctx context.Context, page, limit int, search, angkatan string, status *string) (*SyncLogListResult, error) {
	return s.repo.GetSyncLogs(ctx, page, limit, search, angkatan, status)
}

// GetSyncLogStats retrieves sync log statistics
func (s *service) GetSyncLogStats(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetSyncLogStats(ctx)
}
