package dosen

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
	minioClient "sister-service/internal/minio"
	"time"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// Service defines the dosen service interface
type Service interface {
	GetDosenPhoto(idSdm string) ([]byte, string, error)
	GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error)
	SyncDosenFromSister(idSP string, syncedBy string) (*BatchDosenSyncResult, error)
	SyncSingleDosenTest(idSDM string) (*DosenSyncResult, error)
	SyncDosenPhotosToMinIO(syncedBy string) (*BatchPhotoSyncResult, error)
	SyncDosenDokumenToMinIO(syncedBy string) (*BatchDokumenSyncResult, error)
	GetDosenDokumen(idSDM string) ([]DokumenSyncItem, error)
	DownloadDosenDokumen(idDok string) ([]byte, string, string, error)
	GetDosenList(page, limit int, search string, idJnsSDM, idStatAktif int) (*DosenListResult, error)
	GetDosenByID(idSDM string) (*Dosen, error)
	GetDosenStats() (*DosenStats, error)
	ForceRefreshToken() error
}

type service struct {
	sisterAPI     *sister_api.Client
	redisClient   *redis.Client
	repo          Repository
	loggerService appLogger.Service
	minioClient   *minioClient.Client
}

// NewService creates a new dosen service with Redis caching and optional MinIO
func NewService(sisterAPI *sister_api.Client, redisClient *redis.Client, repo Repository, loggerSvc appLogger.Service, minio *minioClient.Client) Service {
	return &service{
		sisterAPI:     sisterAPI,
		redisClient:   redisClient,
		repo:          repo,
		loggerService: loggerSvc,
		minioClient:   minio,
	}
}

// GetDosenPhoto fetches dosen photo: MinIO (primary) → Redis cache → SISTER API (fallback)
func (s *service) GetDosenPhoto(idSdm string) ([]byte, string, error) {
	// 1. Cek MinIO — primary source setelah batch sync
	if s.minioClient != nil {
		objectPath := fmt.Sprintf("photos/sdm/%s.jpg", idSdm)
		if s.minioClient.ObjectExists(objectPath) {
			data, ct, err := s.minioClient.GetObject(objectPath)
			if err == nil {
				log.Printf("✅ Photo served from MinIO for ID: %s (%d bytes)", idSdm, len(data))
				return data, ct, nil
			}
			log.Printf("⚠️  MinIO get failed for %s: %v, falling back to cache/SISTER", idSdm, err)
		}
	}

	// 2. Cek Redis cache
	cacheKey := fmt.Sprintf("dosen:photo:%s", idSdm)
	cacheKeyType := fmt.Sprintf("dosen:photo:type:%s", idSdm)
	if s.redisClient != nil {
		cachedPhoto, err := s.redisClient.Get(ctx, cacheKey).Bytes()
		if err == nil {
			cachedType, _ := s.redisClient.Get(ctx, cacheKeyType).Result()
			if cachedType == "" {
				cachedType = "image/jpeg"
			}
			log.Printf("✅ Photo cache HIT for ID: %s (%d bytes)", idSdm, len(cachedPhoto))
			return cachedPhoto, cachedType, nil
		}
		log.Printf("⚠️  Photo cache MISS for ID: %s, fetching from SISTER...", idSdm)
	}

	// 3. Fallback ke SISTER API (untuk dosen yang belum di-sync ke MinIO)
	log.Printf("📷 Fetching dosen photo from SISTER for ID: %s", idSdm)
	photoBytes, contentType, err := s.sisterAPI.GetDosenPhoto(idSdm)
	if err != nil {
		log.Printf("❌ Failed to fetch dosen photo: %v", err)
		return nil, "", err
	}

	log.Printf("✅ Photo fetched from SISTER: %d bytes, type: %s", len(photoBytes), contentType)

	// Cache di Redis untuk 7 hari
	if s.redisClient != nil {
		cacheTTL := 7 * 24 * time.Hour
		if err := s.redisClient.Set(ctx, cacheKey, photoBytes, cacheTTL).Err(); err != nil {
			log.Printf("⚠️  Failed to cache photo: %v", err)
		} else {
			s.redisClient.Set(ctx, cacheKeyType, contentType, cacheTTL)
			log.Printf("💾 Photo cached for %s (TTL: %s)", idSdm, cacheTTL)
		}
	}

	return photoBytes, contentType, nil
}

// GetDosenBidangIlmu fetches dosen bidang keahlian from cache or SISTER API
func (s *service) GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error) {
	cacheKey := fmt.Sprintf("dosen:bidang_ilmu:%s", idSdm)

	// Try to get from cache first
	if s.redisClient != nil {
		cachedData, err := s.redisClient.Get(ctx, cacheKey).Result()
		if err == nil {
			// Cache hit - parse JSON
			var bidangIlmu []map[string]interface{}
			if err := json.Unmarshal([]byte(cachedData), &bidangIlmu); err == nil {
				log.Printf("✅ Bidang keahlian cache HIT for ID: %s (%d items)", idSdm, len(bidangIlmu))
				return bidangIlmu, nil
			}
		}
		// Cache miss, continue to fetch from SISTER
		log.Printf("⚠️  Bidang keahlian cache MISS for ID: %s, fetching from SISTER...", idSdm)
	}

	// Fetch from SISTER API
	log.Printf("📚 Fetching bidang keahlian from SISTER for ID: %s", idSdm)
	bidangIlmu, err := s.sisterAPI.GetDosenBidangIlmu(idSdm)
	if err != nil {
		log.Printf("❌ Failed to fetch bidang keahlian: %v", err)
		return nil, err
	}

	log.Printf("✅ Bidang keahlian fetched successfully: %d items", len(bidangIlmu))

	// Cache the bidang ilmu for 7 days (data jarang berubah)
	if s.redisClient != nil {
		cacheTTL := 7 * 24 * time.Hour // 7 days
		jsonData, err := json.Marshal(bidangIlmu)
		if err == nil {
			err = s.redisClient.Set(ctx, cacheKey, jsonData, cacheTTL).Err()
			if err != nil {
				log.Printf("⚠️  Failed to cache bidang keahlian: %v", err)
			} else {
				log.Printf("💾 Bidang keahlian cached for %s (TTL: %s)", idSdm, cacheTTL)
			}
		}
	}

	return bidangIlmu, nil
}

// GetDosenList retrieves paginated list of dosen with search and filters
func (s *service) GetDosenList(page, limit int, search string, idJnsSDM, idStatAktif int) (*DosenListResult, error) {
	return s.repo.GetDosenList(page, limit, search, idJnsSDM, idStatAktif)
}

// GetDosenByID retrieves single dosen by ID from database
func (s *service) GetDosenByID(idSDM string) (*Dosen, error) {
	return s.repo.GetDosenByID(idSDM)
}

// GetDosenStats retrieves dosen statistics from database
func (s *service) GetDosenStats() (*DosenStats, error) {
	return s.repo.GetDosenStats()
}

// logSyncResult is a helper function to log sync results to database
func (s *service) logSyncResult(endpointName, endpointKey, syncType, syncedBy string, totalRecords int, startTime time.Time, err error) {
	duration := time.Since(startTime)

	// Auto-detect sync type based on syncedBy value
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	var errorMessage, errorDetails *string
	status := "success"

	if err != nil {
		status = "failed"
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	durationMs := int(duration.Milliseconds())
	req := &appLogger.CreateSyncLogRequest{
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: totalRecords, // For dosen, all successful records are inserts/updates
		UpdatedCount:  0,
		FailedCount:   0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
		ErrorMessage:  errorMessage,
		ErrorDetails:  errorDetails,
	}

	if status == "failed" {
		req.FailedCount = 1
		req.InsertedCount = 0
	}

	_, logErr := s.loggerService.LogSync(context.Background(), req)
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}
}

// ForceRefreshToken forces a refresh of the Sister API authentication token
// This is useful for scheduled syncs to ensure they always use a fresh token
func (s *service) ForceRefreshToken() error {
	return s.sisterAPI.ForceRefreshToken()
}

// GetDosenDokumen returns list of documents for a dosen from DB (dok.dok_sdm + dok.dokumen)
func (s *service) GetDosenDokumen(idSDM string) ([]DokumenSyncItem, error) {
	return s.repo.GetDokumenBySDM(idSDM)
}

// DownloadDosenDokumen retrieves a document from MinIO by its id_dok.
// Returns: file bytes, content type, file name, error
func (s *service) DownloadDosenDokumen(idDok string) ([]byte, string, string, error) {
	if s.minioClient == nil {
		return nil, "", "", fmt.Errorf("MinIO client not configured")
	}

	// Get MinIO path from DB
	minioPath, err := s.repo.GetDokumenMinioPath(idDok)
	if err != nil {
		return nil, "", "", fmt.Errorf("dokumen not found: %w", err)
	}
	if minioPath == "" {
		return nil, "", "", fmt.Errorf("dokumen has no MinIO path")
	}

	// Stream from MinIO
	data, contentType, err := s.minioClient.GetObject(minioPath)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to retrieve file from storage: %w", err)
	}

	// Extract filename from path (last segment)
	fileName := minioPath
	if idx := len(minioPath) - 1; idx >= 0 {
		parts := splitPath(minioPath)
		if len(parts) > 0 {
			fileName = parts[len(parts)-1]
		}
	}

	return data, contentType, fileName, nil
}

// splitPath splits a MinIO object path by '/'
func splitPath(p string) []string {
	var parts []string
	current := ""
	for _, c := range p {
		if c == '/' {
			if current != "" {
				parts = append(parts, current)
				current = ""
			}
		} else {
			current += string(c)
		}
	}
	if current != "" {
		parts = append(parts, current)
	}
	return parts
}
