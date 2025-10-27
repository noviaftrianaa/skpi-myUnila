package dosen

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sister-service/external/sister_api"
	"time"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// Service defines the dosen service interface
type Service interface {
	GetDosenPhoto(idSdm string) ([]byte, string, error)
	GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error)
	SyncDosenFromSister(idSP string, syncedBy string) (*BatchDosenSyncResult, error)
}

type service struct {
	sisterAPI   *sister_api.Client
	redisClient *redis.Client
	repo        Repository
}

// NewService creates a new dosen service with Redis caching
func NewService(sisterAPI *sister_api.Client, redisClient *redis.Client, repo Repository) Service {
	return &service{
		sisterAPI:   sisterAPI,
		redisClient: redisClient,
		repo:        repo,
	}
}

// GetDosenPhoto fetches dosen photo from cache or SISTER API
func (s *service) GetDosenPhoto(idSdm string) ([]byte, string, error) {
	cacheKey := fmt.Sprintf("dosen:photo:%s", idSdm)
	cacheKeyType := fmt.Sprintf("dosen:photo:type:%s", idSdm)

	// Try to get from cache first
	if s.redisClient != nil {
		cachedPhoto, err := s.redisClient.Get(ctx, cacheKey).Bytes()
		if err == nil {
			// Cache hit
			cachedType, _ := s.redisClient.Get(ctx, cacheKeyType).Result()
			if cachedType == "" {
				cachedType = "image/jpeg" // default
			}
			log.Printf("✅ Photo cache HIT for ID: %s (%d bytes)", idSdm, len(cachedPhoto))
			return cachedPhoto, cachedType, nil
		}
		// Cache miss, continue to fetch from SISTER
		log.Printf("⚠️  Photo cache MISS for ID: %s, fetching from SISTER...", idSdm)
	}

	// Fetch from SISTER API
	log.Printf("📷 Fetching dosen photo from SISTER for ID: %s", idSdm)
	photoBytes, contentType, err := s.sisterAPI.GetDosenPhoto(idSdm)
	if err != nil {
		log.Printf("❌ Failed to fetch dosen photo: %v", err)
		return nil, "", err
	}

	log.Printf("✅ Photo fetched successfully: %d bytes, type: %s", len(photoBytes), contentType)

	// Cache the photo for 7 days (foto jarang berubah)
	if s.redisClient != nil {
		cacheTTL := 7 * 24 * time.Hour // 7 days
		err = s.redisClient.Set(ctx, cacheKey, photoBytes, cacheTTL).Err()
		if err != nil {
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
