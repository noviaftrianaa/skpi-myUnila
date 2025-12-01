package transkrip_nilai

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
)

const (
	feederPageSize    = 500
	maxConcurrency    = 3
	syncLockKeyPrefix = "sync:transkrip_nilai:"
	syncLockTTL       = 30 * time.Minute
)

func (s *service) SyncTranskripNilai(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error) {
	// Build filter string for Feeder API
	filterParts := []string{}

	if filter != nil && len(filter.IDSemester) > 0 {
		var semesterParts []string
		for _, sem := range filter.IDSemester {
			semesterParts = append(semesterParts, fmt.Sprintf("'%s'", sem))
		}
		filterParts = append(filterParts, fmt.Sprintf("id_semester IN (%s)", strings.Join(semesterParts, ",")))
	}

	if filter != nil && filter.IDProdi != nil && *filter.IDProdi != "" {
		filterParts = append(filterParts, fmt.Sprintf("id_prodi = '%s'", *filter.IDProdi))
	}

	feederFilter := strings.Join(filterParts, " AND ")

	// Try to acquire lock using Redis
	lockKey := syncLockKeyPrefix + "all"
	if feederFilter != "" {
		lockKey = syncLockKeyPrefix + feederFilter
	}

	// Check if already syncing
	if s.redisClient != nil {
		exists, err := s.redisClient.Exists(ctx, lockKey).Result()
		if err == nil && exists > 0 {
			return nil, fmt.Errorf("sync already in progress for this filter")
		}

		// Set lock
		s.redisClient.Set(ctx, lockKey, "syncing", syncLockTTL)
		defer s.redisClient.Del(ctx, lockKey)
	}

	startTime := time.Now()
	result := &SyncResult{}

	// Fetch and sync data
	totalFetched, totalSynced, totalFailed, err := s.fetchAndSyncAll(ctx, feederFilter)

	result.TotalFetched = totalFetched
	result.TotalSynced = totalSynced
	result.TotalFailed = totalFailed

	duration := time.Since(startTime)
	syncStatus := "success"
	if err != nil {
		syncStatus = "failed"
	} else if totalFailed > 0 {
		syncStatus = "partial"
	}

	log.Printf("✅ [Sync Transkrip Nilai] Completed in %v (Fetched: %d, Synced: %d, Failed: %d, Status: %s)",
		duration, totalFetched, totalSynced, totalFailed, syncStatus)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all"
	if filter != nil && len(filter.IDSemester) > 0 {
		endpointKey = fmt.Sprintf("semesters:%v", filter.IDSemester)
	}

	if s.loggerSvc != nil {
		logReq := &logger.CreateSyncLogRequest{
			EndpointName:  "transkrip_nilai",
			EndpointKey:   endpointKey,
			SyncType:      "manual",
			Status:        syncStatus,
			APICode:       "FEEDER",
			TotalRecords:  totalFetched,
			InsertedCount: totalSynced,
			UpdatedCount:  0,
			FailedCount:   totalFailed,
			SkippedCount:  0,
			DurationMs:    &durationMs,
			SyncedBy:      triggeredBy,
		}

		if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
			log.Printf("⚠️  [Sync Transkrip Nilai] Failed to create sync log: %v", err)
		}
	}

	if err != nil {
		result.Message = fmt.Sprintf("Sync completed with errors: %v", err)
		return result, err
	}

	result.Message = fmt.Sprintf("Successfully synced %d transkrip nilai from Feeder API", totalSynced)
	return result, nil
}

func (s *service) fetchAndSyncAll(ctx context.Context, filter string) (int, int, int, error) {
	totalFetched := 0
	totalSynced := 0
	totalFailed := 0

	offset := 0

	for {
		// Fetch data from Feeder API with pagination
		data, err := s.feederAPI.GetTranskripMahasiswa(filter, feederPageSize, offset)
		if err != nil {
			return totalFetched, totalSynced, totalFailed, fmt.Errorf("failed to fetch from Feeder API: %w", err)
		}

		// Parse response
		var feederItems []FeederTranskripResponse
		if err := json.Unmarshal(data, &feederItems); err != nil {
			// Try as empty
			if string(data) == "null" || string(data) == "[]" {
				break
			}
			return totalFetched, totalSynced, totalFailed, fmt.Errorf("failed to parse Feeder response: %w", err)
		}

		if len(feederItems) == 0 {
			break
		}

		totalFetched += len(feederItems)
		log.Printf("📥 Fetched %d transkrip nilai (offset: %d)", len(feederItems), offset)

		// Transform and sync using worker pool
		synced, failed := s.syncBatch(ctx, feederItems)
		totalSynced += synced
		totalFailed += failed

		log.Printf("✅ Synced %d, failed %d (total: %d/%d)", synced, failed, totalSynced, totalFetched)

		// If we got less than page size, we're done
		if len(feederItems) < feederPageSize {
			break
		}

		offset += feederPageSize
	}

	return totalFetched, totalSynced, totalFailed, nil
}

func (s *service) syncBatch(ctx context.Context, feederItems []FeederTranskripResponse) (int, int) {
	// Transform all items
	entities := make([]*TranskripNilai, 0, len(feederItems))
	for _, item := range feederItems {
		entity := TransformFeederToEntity(&item)
		entities = append(entities, entity)
	}

	// Split into chunks for concurrent processing
	chunkSize := (len(entities) + maxConcurrency - 1) / maxConcurrency
	if chunkSize < 50 {
		chunkSize = 50
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	totalSynced := 0
	totalFailed := 0
	totalSkippedKls := 0
	totalSkippedUUID := 0

	for i := 0; i < len(entities); i += chunkSize {
		end := i + chunkSize
		if end > len(entities) {
			end = len(entities)
		}
		chunk := entities[i:end]

		wg.Add(1)
		go func(items []*TranskripNilai) {
			defer wg.Done()

			localSynced := 0
			localFailed := 0
			localSkippedKls := 0
			localSkippedUUID := 0

			// Process each record individually for better error handling
			for _, item := range items {
				err := s.repo.UpsertSingle(ctx, item)
				if err != nil {
					errStr := err.Error()
					if strings.Contains(errStr, "FK_KELAS_KULIAH_NOT_FOUND") {
						// FK constraint - id_kls doesn't exist in kelas_kuliah
						localSkippedKls++
					} else if strings.Contains(errStr, "Conversion failed") ||
						strings.Contains(errStr, "uniqueidentifier") {
						// Invalid UUID format
						localSkippedUUID++
					} else if strings.Contains(errStr, "fk_nilai_tr_kelas_tra_kelas_ku") {
						// FK constraint violation from database
						localSkippedKls++
					} else {
						// Other errors
						localFailed++
						log.Printf("⚠️  [Transkrip] Failed id_reg_pd=%s, id_mk=%s: %v",
							item.IDRegPD, item.IDMK, err)
					}
				} else {
					localSynced++
				}
			}

			mu.Lock()
			totalSynced += localSynced
			totalFailed += localFailed
			totalSkippedKls += localSkippedKls
			totalSkippedUUID += localSkippedUUID
			mu.Unlock()
		}(chunk)
	}

	wg.Wait()

	// Log summary of skipped records
	if totalSkippedKls > 0 {
		log.Printf("⚠️  [Transkrip] Skipped %d records (id_kls not found in kelas_kuliah - sync kelas kuliah first)",
			totalSkippedKls)
	}
	if totalSkippedUUID > 0 {
		log.Printf("⚠️  [Transkrip] Skipped %d records (invalid UUID format)", totalSkippedUUID)
	}

	// Count skipped as failed for reporting
	return totalSynced, totalFailed + totalSkippedKls + totalSkippedUUID
}
