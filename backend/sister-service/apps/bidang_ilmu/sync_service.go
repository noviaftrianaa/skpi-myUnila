package bidang_ilmu

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"sister-service/external/sister_api"
	"sister-service/pkg/timeutil"
)

// Retry configuration
const (
	MaxRetries     = 3                // Maximum number of retry attempts
	InitialBackoff = 1 * time.Second  // Initial backoff duration
	MaxBackoff     = 10 * time.Second // Maximum backoff duration
)

// SyncService handles syncing bidang ilmu from Sister API
type SyncService struct {
	repo      Repository
	sisterAPI *sister_api.Client
}

// NewSyncService creates a new SyncService
func NewSyncService(repo Repository, sisterAPI *sister_api.Client) *SyncService {
	return &SyncService{
		repo:      repo,
		sisterAPI: sisterAPI,
	}
}

// SyncResult represents the result of a sync operation for a single dosen
type SyncResult struct {
	IDSDM        string `json:"id_sdm"`
	Success      int    `json:"success"`
	Failed       int    `json:"failed"`
	ErrorMessage string `json:"error_message,omitempty"`
}

// SyncBidangIlmuByIDSDM syncs bidang ilmu for a single dosen
func (s *SyncService) SyncBidangIlmuByIDSDM(idSDM string, idCreator string) (*SyncResult, error) {
	log.Printf("🔄 Starting bidang ilmu sync for id_sdm: %s", idSDM)

	result := &SyncResult{
		IDSDM: idSDM,
	}

	// Step 1: Get bidang ilmu list from Sister API with retry mechanism
	var rawData []byte
	entityName := fmt.Sprintf("bidang ilmu for dosen %s", idSDM)

	err := retryWithBackoff(func() error {
		var apiErr error
		rawData, apiErr = s.sisterAPI.GetBidangIlmuByIDSDM(idSDM)
		return apiErr
	}, entityName)

	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to fetch bidang ilmu: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	var bidangIlmuList []SisterBidangIlmuItem
	if err := json.Unmarshal(rawData, &bidangIlmuList); err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to decode response: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	log.Printf("📊 Found %d bidang ilmu for id_sdm: %s", len(bidangIlmuList), idSDM)

	if len(bidangIlmuList) == 0 {
		log.Printf("ℹ️  No bidang ilmu found for id_sdm: %s", idSDM)
		// Still need to delete old data
		if err := s.repo.DeleteBidangIlmuBySDM(idSDM); err != nil {
			log.Printf("❌ Failed to delete old bidang ilmu: %v", err)
		}
		return result, nil
	}

	// Step 2: Get kelompok_bidang reference map
	bidangMap, err := s.repo.GetKelompokBidangMap()
	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to get kelompok bidang reference: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	// Step 3: Delete old mappings (soft delete)
	if err := s.repo.DeleteBidangIlmuBySDM(idSDM); err != nil {
		log.Printf("❌ Failed to delete old bidang ilmu: %v", err)
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to delete old data: %v", err)
		return result, err
	}

	// Step 4: Insert new mappings
	now := timeutil.NowWIB()
	for i, item := range bidangIlmuList {
		// Parse urutan (string to int)
		urutan, err := strconv.Atoi(item.Urutan)
		if err != nil {
			log.Printf("⚠️  Invalid urutan '%s', using index %d", item.Urutan, i+1)
			urutan = i + 1
		}

		// Lookup id_kel_bidang
		// Try exact match first with API's id_kelompok_bidang
		idKelBidang := item.IDKelompokBidang

		// If ID from API is empty or invalid, try to lookup by name
		if idKelBidang == "" || idKelBidang == "00000000-0000-0000-0000-000000000000" {
			// Try to match by kelompok_bidang name
			if foundID, ok := bidangMap[item.KelompokBidang]; ok {
				idKelBidang = foundID
			} else {
				log.Printf("⚠️  Kelompok bidang not found in map: '%s' for dosen %s", item.KelompokBidang, idSDM)
				result.Failed++
				continue
			}
		}

		// Create mapping entity
		// Use idSDM as id_creator following the pattern from other modules (pendidikan, etc.)
		mapping := &MapSDMBidang{
			IDSDM:       idSDM,
			IDKelBidang: idKelBidang,
			Urutan:      urutan,
			CreateDate:  now,
			IDCreator:   idSDM, // Use idSDM (dosen UUID) as creator
			LastUpdate:  now,
			SoftDelete:  0,
			LastSync:    now,
		}

		// Insert to database
		if err := s.repo.InsertBidangIlmu(mapping); err != nil {
			log.Printf("❌ Failed to insert bidang ilmu %s for dosen %s: %v", item.KelompokBidang, idSDM, err)
			result.Failed++
		} else {
			log.Printf("✅ Inserted bidang ilmu: %s (urutan: %d)", item.KelompokBidang, urutan)
			result.Success++
		}
	}

	log.Printf("✅ Bidang ilmu sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)
	return result, nil
}

// isRetryableError determines if an error is worth retrying
func isRetryableError(err error) bool {
	if err == nil {
		return false
	}

	errMsg := err.Error()

	// Network-related errors that are worth retrying
	retryablePatterns := []string{
		"timeout",
		"connection refused",
		"connection reset",
		"429", // Too Many Requests
		"503", // Service Unavailable
		"502", // Bad Gateway
		"504", // Gateway Timeout
		"temporary failure",
		"try again",
	}

	for _, pattern := range retryablePatterns {
		if strings.Contains(strings.ToLower(errMsg), pattern) {
			return true
		}
	}

	return false
}

// retryWithBackoff executes a function with exponential backoff retry logic
func retryWithBackoff(operation func() error, entityName string) error {
	var lastErr error

	for attempt := 0; attempt <= MaxRetries; attempt++ {
		if attempt > 0 {
			// Calculate backoff duration with exponential increase
			backoff := time.Duration(1<<uint(attempt-1)) * InitialBackoff
			if backoff > MaxBackoff {
				backoff = MaxBackoff
			}

			log.Printf("⏳ Waiting %v before retry attempt %d/%d for %s", backoff, attempt, MaxRetries, entityName)
			time.Sleep(backoff)
		}

		// Execute the operation
		err := operation()
		if err == nil {
			if attempt > 0 {
				log.Printf("✅ Retry successful for %s after %d attempts", entityName, attempt)
			}
			return nil
		}

		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err) {
			log.Printf("❌ Non-retryable error for %s: %v", entityName, err)
			return err
		}

		if attempt < MaxRetries {
			log.Printf("⚠️  Retryable error for %s (attempt %d/%d): %v", entityName, attempt+1, MaxRetries, err)
		}
	}

	log.Printf("❌ All retry attempts exhausted for %s: %v", entityName, lastErr)
	return lastErr
}
