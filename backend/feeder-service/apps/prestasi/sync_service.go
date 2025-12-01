package prestasi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
)

const (
	feederPageSize    = 500
	maxConcurrency    = 3
	syncLockKeyPrefix = "sync:prestasi:"
	syncLockTTL       = 30 * time.Minute
	// Default Universitas Lampung id_sp
	DEFAULT_ID_SP     = "e2b705a7-173e-464a-9fac-509128709515"
)

func (s *service) SyncPrestasi(ctx context.Context, filter *SyncFilter, triggeredBy string) (*SyncResult, error) {
	// Build filter string for Feeder API
	feederFilter := ""
	if filter != nil && filter.TahunPrestasi != nil && *filter.TahunPrestasi != "" {
		feederFilter = fmt.Sprintf("tahun_prestasi = '%s'", *filter.TahunPrestasi)
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

	log.Printf("📋 [Sync Prestasi] Starting sync with filter: %s", feederFilter)

	// Fetch and sync data
	totalFetched, totalSynced, totalFailed, totalSkipped, err := s.fetchAndSyncAll(ctx, feederFilter)

	result.TotalFetched = totalFetched
	result.TotalSynced = totalSynced
	result.TotalFailed = totalFailed
	result.TotalSkipped = totalSkipped

	duration := time.Since(startTime)
	result.Duration = duration.String()

	syncStatus := "success"
	if err != nil {
		syncStatus = "failed"
	} else if totalFailed > 0 {
		syncStatus = "partial"
	}

	log.Printf("✅ [Sync Prestasi] Completed in %v (Fetched: %d, Synced: %d, Failed: %d, Skipped: %d, Status: %s)",
		duration, totalFetched, totalSynced, totalFailed, totalSkipped, syncStatus)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all"
	if filter != nil && filter.TahunPrestasi != nil && *filter.TahunPrestasi != "" {
		endpointKey = fmt.Sprintf("tahun:%s", *filter.TahunPrestasi)
	}

	if s.loggerSvc != nil {
		logReq := &logger.CreateSyncLogRequest{
			EndpointName:  "prestasi",
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
			log.Printf("⚠️  [Sync Prestasi] Failed to create sync log: %v", err)
		}
	}

	if err != nil {
		result.Message = fmt.Sprintf("Sync completed with errors: %v", err)
		return result, err
	}

	result.Message = fmt.Sprintf("Successfully synced %d prestasi from Feeder API", totalSynced)
	return result, nil
}

func (s *service) fetchAndSyncAll(ctx context.Context, filter string) (int, int, int, int, error) {
	totalFetched := 0
	totalSynced := 0
	totalFailed := 0
	totalSkipped := 0

	offset := 0

	// Get id_sp from environment, fallback to Universitas Lampung default
	idSP := os.Getenv("FEEDER_ID_SP")
	if idSP == "" {
		idSP = DEFAULT_ID_SP
	}

	for {
		// Fetch data from Feeder API with pagination
		data, err := s.feederAPI.GetListPrestasiMahasiswa(filter, feederPageSize, offset)
		if err != nil {
			return totalFetched, totalSynced, totalFailed, totalSkipped, fmt.Errorf("failed to fetch from Feeder API: %w", err)
		}

		// Parse response
		var feederItems []FeederPrestasiData
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
		log.Printf("📥 [Prestasi] Fetched %d records (offset: %d)", len(feederItems), offset)

		// Transform and sync using worker pool
		synced, failed, skipped := s.syncBatch(ctx, feederItems, idSP)
		totalSynced += synced
		totalFailed += failed
		totalSkipped += skipped

		log.Printf("✅ [Prestasi] Batch result: Synced %d, Failed %d, Skipped %d (total: %d/%d)",
			synced, failed, skipped, totalSynced, totalFetched)

		// If we got less than page size, we're done
		if len(feederItems) < feederPageSize {
			break
		}

		offset += feederPageSize
	}

	return totalFetched, totalSynced, totalFailed, totalSkipped, nil
}

func (s *service) syncBatch(ctx context.Context, feederItems []FeederPrestasiData, idSP string) (int, int, int) {
	// Transform all items
	now := time.Now().UTC()
	entities := make([]*Prestasi, 0, len(feederItems))
	for _, item := range feederItems {
		entity := transformFeederToEntity(&item, idSP, now)
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
	totalSkippedPD := 0
	totalSkippedUUID := 0

	for i := 0; i < len(entities); i += chunkSize {
		end := i + chunkSize
		if end > len(entities) {
			end = len(entities)
		}
		chunk := entities[i:end]

		wg.Add(1)
		go func(items []*Prestasi) {
			defer wg.Done()

			localSynced := 0
			localFailed := 0
			localSkippedPD := 0
			localSkippedUUID := 0

			// Process each record individually for better error handling
			for _, item := range items {
				err := s.repo.UpsertSingle(ctx, item)
				if err != nil {
					errStr := err.Error()
					if strings.Contains(errStr, "FK_PESERTA_DIDIK_NOT_FOUND") {
						// FK constraint - id_pd doesn't exist in peserta_didik
						localSkippedPD++
					} else if strings.Contains(errStr, "INVALID_UUID") ||
						strings.Contains(errStr, "Conversion failed") ||
						strings.Contains(errStr, "uniqueidentifier") {
						// Invalid UUID format
						localSkippedUUID++
					} else {
						// Other errors
						localFailed++
						log.Printf("⚠️  [Prestasi] Failed id=%s: %v", item.IDPrestasi, err)
					}
				} else {
					localSynced++
				}
			}

			mu.Lock()
			totalSynced += localSynced
			totalFailed += localFailed
			totalSkippedPD += localSkippedPD
			totalSkippedUUID += localSkippedUUID
			mu.Unlock()
		}(chunk)
	}

	wg.Wait()

	// Log summary of skipped records
	if totalSkippedPD > 0 {
		log.Printf("⚠️  [Prestasi] Skipped %d records (id_pd not found in peserta_didik - sync mahasiswa first)",
			totalSkippedPD)
	}
	if totalSkippedUUID > 0 {
		log.Printf("⚠️  [Prestasi] Skipped %d records (invalid UUID format)", totalSkippedUUID)
	}

	return totalSynced, totalFailed, totalSkippedPD + totalSkippedUUID
}

// transformFeederToEntity transforms Feeder API response to database entity
func transformFeederToEntity(feeder *FeederPrestasiData, idSP string, now time.Time) *Prestasi {
	entity := &Prestasi{
		IDPrestasi: feeder.IDPrestasi,
		IDPD:       feeder.IDMahasiswa,
		IDSP:       idSP,
		NmPrestasi: feeder.NamaPrestasi,
		LastSync:   now,
	}

	// Parse tahun_prestasi
	if feeder.TahunPrestasi != "" {
		if val, err := strconv.Atoi(feeder.TahunPrestasi); err == nil {
			entity.ThnPrestasi = val
		}
	}

	// Parse id_jenis_prestasi
	if feeder.IDJenisPrestasi.Value != nil {
		entity.IDJenisPrestasi = *feeder.IDJenisPrestasi.Value
	}

	// Parse id_tingkat_prestasi
	if feeder.IDTingkatPrestasi.Value != nil {
		entity.IDTktPrestasi = *feeder.IDTingkatPrestasi.Value
	}

	// Parse peringkat
	if feeder.Peringkat.Value != nil {
		entity.Peringkat = feeder.Peringkat.Value
	}

	// Penyelenggara
	if feeder.Penyelenggara != nil && *feeder.Penyelenggara != "" {
		entity.Penyelenggara = feeder.Penyelenggara
	}

	// id_aktivitas -> id_akt_mhs
	if feeder.IDAktivitas != nil && *feeder.IDAktivitas != "" {
		entity.IDAktMhs = feeder.IDAktivitas
	}

	return entity
}
