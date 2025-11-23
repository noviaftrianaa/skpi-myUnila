package aktivitas_mahasiswa

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

// Service interface for aktivitas_mahasiswa business logic
type Service interface {
	// List operations
	GetAktivitasList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, idJenisAktivitas *int, sortBy, sortOrder string) (*AktivitasListResult, error)
	GetAktivitasByID(ctx context.Context, idAktMhs string) (*AktMhs, error)
	GetAktivitasDetail(ctx context.Context, idAktMhs string) (map[string]interface{}, error)

	// Utility operations
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)
	GetStats(ctx context.Context) (*AktivitasStats, error)

	// Sync operations (implemented in sync_service.go)
	SyncAktivitasMahasiswa(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchAktivitasSyncResult, error)
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

	// Feeder API endpoints for aktivitas
	GetListAktivitasMahasiswa() ([]byte, error)
	GetListAktivitasMahasiswaWithPagination(limit, offset int) ([]byte, error)
	GetListAktivitasMahasiswaWithFilter(filter string, limit, offset int) ([]byte, error)
	GetListAnggotaAktivitasMahasiswa(idAktivitas string) ([]byte, error)
}

// NewService creates a new aktivitas_mahasiswa service
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

// GetAktivitasList retrieves paginated list of aktivitas with Redis caching
func (s *service) GetAktivitasList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, idJenisAktivitas *int, sortBy, sortOrder string) (*AktivitasListResult, error) {
	// Check Redis cache first (only for non-search queries to ensure cache efficiency)
	if search == "" && s.redisClient != nil {
		cacheKey := s.buildCacheKey(page, limit, idSemester, idProdi, idJenisAktivitas, sortBy, sortOrder)

		// Try to get from cache
		cachedData, err := s.getCachedAktivitasList(ctx, cacheKey)
		if err == nil && cachedData != nil {
			log.Printf("✅ [Cache HIT] GetAktivitasList - key: %s", cacheKey)
			return cachedData, nil
		}
		log.Printf("⚠️  [Cache MISS] GetAktivitasList - key: %s", cacheKey)
	}

	// Delegate to repository
	result, err := s.repo.GetAktivitasList(ctx, page, limit, search, idSemester, idProdi, idJenisAktivitas, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	// Cache the result (only for non-search queries, TTL 5 minutes)
	if search == "" && s.redisClient != nil && result != nil {
		cacheKey := s.buildCacheKey(page, limit, idSemester, idProdi, idJenisAktivitas, sortBy, sortOrder)
		if err := s.cacheAktivitasList(ctx, cacheKey, result); err != nil {
			log.Printf("⚠️  Failed to cache aktivitas list: %v", err)
			// Don't return error, just log it
		}
	}

	return result, nil
}

// GetAktivitasByID retrieves a single aktivitas by ID
func (s *service) GetAktivitasByID(ctx context.Context, idAktMhs string) (*AktMhs, error) {
	return s.repo.GetAktivitasByID(ctx, idAktMhs)
}

// GetAktivitasDetail retrieves complete aktivitas detail with anggota list
func (s *service) GetAktivitasDetail(ctx context.Context, idAktMhs string) (map[string]interface{}, error) {
	// Get aktivitas data
	aktivitas, err := s.repo.GetAktivitasByID(ctx, idAktMhs)
	if err != nil {
		return nil, err
	}

	// Get anggota list
	anggotaList, err := s.repo.GetAnggotaByAktivitas(ctx, idAktMhs)
	if err != nil {
		return nil, err
	}

	// Combine into single response
	detail := map[string]interface{}{
		"aktivitas": aktivitas,
		"anggota":   anggotaList,
	}

	return detail, nil
}

// GetProdiList retrieves list of prodi
func (s *service) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetProdiList(ctx)
}

// GetSemesterList retrieves list of semesters with aktivitas data
func (s *service) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetSemesterList(ctx)
}

// GetStats retrieves statistics for aktivitas mahasiswa
func (s *service) GetStats(ctx context.Context) (*AktivitasStats, error) {
	return s.repo.GetStats(ctx)
}

// Sync operations are implemented in sync_service.go
// This separation keeps the service.go file clean and focused on CRUD operations

// ============================================================================
// Redis Caching Helper Methods
// ============================================================================

// buildCacheKey generates a deterministic cache key based on query parameters
func (s *service) buildCacheKey(page, limit int, idSemester []string, idProdi *string, idJenisAktivitas *int, sortBy, sortOrder string) string {
	// Build key parts
	keyParts := []string{
		"aktivitas_list",
		fmt.Sprintf("p%d", page),
		fmt.Sprintf("l%d", limit),
	}

	// Add semester filter to cache key
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

	if idJenisAktivitas != nil && *idJenisAktivitas != 0 {
		keyParts = append(keyParts, fmt.Sprintf("jenis:%d", *idJenisAktivitas))
	} else {
		keyParts = append(keyParts, "jenis:all")
	}

	// Add sorting parameters to cache key
	if sortBy != "" {
		keyParts = append(keyParts, fmt.Sprintf("sort:%s:%s", sortBy, sortOrder))
	}

	// Create hash for shorter key (optional, for very long keys)
	key := strings.Join(keyParts, ":")
	if len(key) > 200 {
		hash := sha256.Sum256([]byte(key))
		return fmt.Sprintf("aktivitas_list:hash:%x", hash[:16])
	}

	return key
}

// getCachedAktivitasList retrieves cached aktivitas list from Redis
func (s *service) getCachedAktivitasList(ctx context.Context, cacheKey string) (*AktivitasListResult, error) {
	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err // redis.Nil or other error
	}

	var result AktivitasListResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %w", err)
	}

	return &result, nil
}

// cacheAktivitasList stores aktivitas list in Redis with TTL
func (s *service) cacheAktivitasList(ctx context.Context, cacheKey string, result *AktivitasListResult) error {
	// Serialize to JSON
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	// Cache for 5 minutes (adjust based on your sync frequency)
	ttl := 5 * time.Minute

	if err := s.redisClient.Set(ctx, cacheKey, data, ttl).Err(); err != nil {
		return fmt.Errorf("failed to set cache: %w", err)
	}

	log.Printf("✅ [Cache SET] Cached aktivitas list - key: %s, TTL: %v", cacheKey, ttl)
	return nil
}
