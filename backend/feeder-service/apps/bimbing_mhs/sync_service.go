package bimbing_mhs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/apps/monitoring"
)

const (
	feederPageSize    = 500
	maxConcurrency    = 3
	syncLockKeyPrefix = "sync:bimbing_mhs:"
	syncLockTTL       = 30 * time.Minute
)

func (s *service) SyncBimbingMhs(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error) {
	// Build filter string for Feeder API
	feederFilter := ""
	if filter != nil && filter.IDKategoriKegiatan != nil {
		feederFilter = fmt.Sprintf("id_kategori_kegiatan = '%d'", *filter.IDKategoriKegiatan)
	}

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
	result := &SyncResult{
		SyncedBy: triggeredBy,
	}

	log.Printf("📋 [Sync BimbingMhs] Starting sync with filter: %s", feederFilter)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	endpointKey := "all"
	if filter != nil && filter.IDKategoriKegiatan != nil {
		endpointKey = fmt.Sprintf("kategori:%d", *filter.IDKategoriKegiatan)
	}
	monitorID := monitorSvc.StartSync("bimbing_mhs", endpointKey, "manual", triggeredBy, 0)

	// Fetch and sync data
	totalFetched, totalSynced, totalFailed, totalSkipped, err := s.fetchAndSyncAllWithMonitoring(ctx, feederFilter, monitorSvc, monitorID)

	result.TotalFetched = totalFetched
	result.TotalSynced = totalSynced
	result.TotalFailed = totalFailed
	result.TotalSkipped = totalSkipped

	duration := time.Since(startTime)
	result.Duration = duration.String()

	syncStatus := "success"
	if err != nil {
		syncStatus = "failed"
		monitorSvc.FailSync(monitorID, err.Error())
	} else if totalFailed > 0 {
		syncStatus = "partial"
		monitorSvc.CompleteSync(monitorID, fmt.Sprintf("Synced %d, Failed %d, Skipped %d", totalSynced, totalFailed, totalSkipped))
	} else {
		monitorSvc.CompleteSync(monitorID, fmt.Sprintf("Successfully synced %d records", totalSynced))
	}

	log.Printf("✅ [Sync BimbingMhs] Completed in %v (Fetched: %d, Synced: %d, Failed: %d, Skipped: %d, Status: %s)",
		duration, totalFetched, totalSynced, totalFailed, totalSkipped, syncStatus)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())

	if s.loggerSvc != nil {
		logReq := &logger.CreateSyncLogRequest{
			EndpointName:  "bimbing_mhs",
			EndpointKey:   endpointKey,
			SyncType:      "manual",
			Status:        syncStatus,
			APICode:       "FEEDER",
			TotalRecords:  totalFetched,
			InsertedCount: totalSynced,
			UpdatedCount:  0,
			FailedCount:   totalFailed,
			SkippedCount:  totalSkipped,
			DurationMs:    &durationMs,
			SyncedBy:      triggeredBy,
		}

		if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
			log.Printf("⚠️  [Sync BimbingMhs] Failed to create sync log: %v", err)
		}
	}

	if err != nil {
		result.Message = fmt.Sprintf("Sync completed with errors: %v", err)
		return result, err
	}

	result.Message = fmt.Sprintf("Successfully synced %d bimbing_mhs from Feeder API", totalSynced)
	return result, nil
}

func (s *service) fetchAndSyncAllWithMonitoring(ctx context.Context, filter string, monitorSvc *monitoring.Service, monitorID string) (int, int, int, int, error) {
	totalFetched := 0
	totalSynced := 0
	totalFailed := 0
	totalSkipped := 0

	offset := 0

	for {
		// Fetch data from Feeder API with pagination
		data, err := s.feederAPI.GetDosenPembimbing(filter, feederPageSize, offset)
		if err != nil {
			return totalFetched, totalSynced, totalFailed, totalSkipped, fmt.Errorf("failed to fetch from Feeder API: %w", err)
		}

		// Parse response
		var feederItems []FeederDosenPembimbingData
		if err := json.Unmarshal(data, &feederItems); err != nil {
			// Try as empty
			if string(data) == "null" || string(data) == "[]" {
				break
			}
			return totalFetched, totalSynced, totalFailed, totalSkipped, fmt.Errorf("failed to parse Feeder response: %w", err)
		}

		if len(feederItems) == 0 {
			break
		}

		totalFetched += len(feederItems)
		log.Printf("📥 [BimbingMhs] Fetched %d records (offset: %d)", len(feederItems), offset)

		// Update monitoring with total records on first fetch
		if offset == 0 {
			monitorSvc.UpdateTotalRecords(monitorID, totalFetched)
		}

		// Transform and sync using worker pool
		synced, failed, skipped := s.syncBatch(ctx, feederItems)
		totalSynced += synced
		totalFailed += failed
		totalSkipped += skipped

		// Update monitoring progress
		monitorSvc.UpdateProgress(monitorID, totalSynced, fmt.Sprintf("Memproses batch offset %d (synced: %d)", offset, totalSynced))
		monitorSvc.UpdateTotalRecords(monitorID, totalFetched)

		log.Printf("✅ [BimbingMhs] Batch result: Synced %d, Failed %d, Skipped %d (total: %d/%d)",
			synced, failed, skipped, totalSynced, totalFetched)

		// If we got less than page size, we're done
		if len(feederItems) < feederPageSize {
			break
		}

		offset += feederPageSize
	}

	return totalFetched, totalSynced, totalFailed, totalSkipped, nil
}

func (s *service) syncBatch(ctx context.Context, feederItems []FeederDosenPembimbingData) (int, int, int) {
	// Transform all items
	now := time.Now().UTC()
	entities := make([]*BimbingMhs, 0, len(feederItems))
	for _, item := range feederItems {
		entity := transformFeederToEntity(&item, now)
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
	totalSkippedSDM := 0
	totalSkippedAkt := 0
	totalSkippedUUID := 0

	for i := 0; i < len(entities); i += chunkSize {
		end := i + chunkSize
		if end > len(entities) {
			end = len(entities)
		}
		chunk := entities[i:end]

		wg.Add(1)
		go func(items []*BimbingMhs) {
			defer wg.Done()

			localSynced := 0
			localFailed := 0
			localSkippedSDM := 0
			localSkippedAkt := 0
			localSkippedUUID := 0

			// Process each record individually for better error handling
			for _, item := range items {
				err := s.repo.UpsertSingle(ctx, item)
				if err != nil {
					errStr := err.Error()
					if strings.Contains(errStr, "FK_SDM_NOT_FOUND") {
						// FK constraint - id_sdm doesn't exist in sdm table
						localSkippedSDM++
					} else if strings.Contains(errStr, "FK_AKT_MHS_NOT_FOUND") {
						// FK constraint - id_akt_mhs doesn't exist in akt_mhs table
						localSkippedAkt++
					} else if strings.Contains(errStr, "INVALID_UUID") ||
						strings.Contains(errStr, "Conversion failed") ||
						strings.Contains(errStr, "uniqueidentifier") {
						// Invalid UUID format
						localSkippedUUID++
					} else {
						// Other errors
						localFailed++
						log.Printf("⚠️  [BimbingMhs] Failed id=%s: %v", item.IDBimbMhs, err)
					}
				} else {
					localSynced++
				}
			}

			mu.Lock()
			totalSynced += localSynced
			totalFailed += localFailed
			totalSkippedSDM += localSkippedSDM
			totalSkippedAkt += localSkippedAkt
			totalSkippedUUID += localSkippedUUID
			mu.Unlock()
		}(chunk)
	}

	wg.Wait()

	// Log summary of skipped records
	if totalSkippedSDM > 0 {
		log.Printf("⚠️  [BimbingMhs] Skipped %d records (id_sdm not found in sdm - sync dosen first)",
			totalSkippedSDM)
	}
	if totalSkippedAkt > 0 {
		log.Printf("⚠️  [BimbingMhs] Skipped %d records (id_akt_mhs not found in akt_mhs - sync aktivitas first)",
			totalSkippedAkt)
	}
	if totalSkippedUUID > 0 {
		log.Printf("⚠️  [BimbingMhs] Skipped %d records (invalid UUID format)", totalSkippedUUID)
	}

	return totalSynced, totalFailed, totalSkippedSDM + totalSkippedAkt + totalSkippedUUID
}

// transformFeederToEntity transforms Feeder API response to database entity
func transformFeederToEntity(feeder *FeederDosenPembimbingData, now time.Time) *BimbingMhs {
	entity := &BimbingMhs{
		IDBimbMhs: feeder.IDBimbingMahasiswa,
		IDSDM:     feeder.IDDosen,
		IDAktMhs:  feeder.IDAktivitas,
		LastSync:  now,
	}

	// Set id_kategori_kegiatan
	if feeder.IDKategoriKegiatan.Value != nil {
		entity.IDKatGiat = *feeder.IDKategoriKegiatan.Value
	}

	// Parse pembimbing_ke to urutan_promotor
	if feeder.PembimbingKe != "" {
		if val, err := strconv.Atoi(feeder.PembimbingKe); err == nil {
			entity.UrutanPromotor = val
		} else {
			entity.UrutanPromotor = 1 // Default to 1 if parsing fails
		}
	} else {
		entity.UrutanPromotor = 1
	}

	return entity
}
