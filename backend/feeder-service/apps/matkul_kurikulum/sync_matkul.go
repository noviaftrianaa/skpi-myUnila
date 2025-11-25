package matkul_kurikulum

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/apps/monitoring"
	"github.com/myunila/feeder-service/pkg/timeutil"
)

// SyncMatkul performs bulk sync of all matkul from Neo Feeder
// This is separate from kurikulum sync - it syncs ALL matkul data directly
// Flow:
// 1. Call GetListMataKuliah with optional filter by id_prodi
// 2. Transform and bulk upsert to database
// 3. Log sync results
func (s *service) SyncMatkul(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchMatkulSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Matkul] Starting bulk matkul sync...")

	// Filter is optional
	if filter == nil {
		filter = &SyncFilter{}
	}

	if filter.IDProdi != nil && *filter.IDProdi != "" {
		log.Printf("📋 [Sync Matkul] Filtering by prodi: %s", *filter.IDProdi)
	} else {
		log.Printf("📋 [Sync Matkul] No prodi filter - syncing ALL matkul")
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Matkul",
		"matkul",
		"batch",
		syncedBy,
		0,
	)

	// Check Feeder API client
	if s.feederAPI == nil {
		return nil, fmt.Errorf("feeder API client is not initialized")
	}

	if err := s.feederAPI.TestConnection(); err != nil {
		return nil, fmt.Errorf("feeder API connection failed: %w", err)
	}

	// Step 1: Build filter string for Neo Feeder API
	filterStr := s.buildFeederFilter(filter)
	log.Printf("📋 [Sync Matkul] Using Neo Feeder filter: %s", filterStr)

	// Step 2: Fetch all matkul from Feeder API with pagination
	log.Printf("📥 [Sync Matkul] Fetching matkul list from Neo Feeder...")
	matkulList, err := s.getMatkulListFromFeeder(filterStr)
	if err != nil {
		log.Printf("⚠️  [Sync Matkul] Failed to get matkul list: %v", err)
		monitorSvc.CompleteSync(syncID, "Gagal mengambil data matkul")
		return nil, fmt.Errorf("failed to fetch matkul list: %w", err)
	}

	log.Printf("📊 [Sync Matkul] Total matkul from API: %d", len(matkulList))

	totalMatkul := len(matkulList)
	if totalMatkul == 0 {
		filterDesc := "all prodi"
		if filter.IDProdi != nil && *filter.IDProdi != "" {
			filterDesc = fmt.Sprintf("prodi %s", *filter.IDProdi)
		}
		log.Printf("⚠️  [Sync Matkul] No matkul found for %s", filterDesc)

		monitorSvc.CompleteSync(syncID, "Tidak ada data matkul ditemukan")

		result := &BatchMatkulSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
			Filter:         filter,
		}

		return result, nil
	}

	// Update monitoring with total records
	monitorSvc.UpdateTotalRecords(syncID, totalMatkul)

	// Step 3: Transform all matkul to entities
	log.Printf("🔄 [Sync Matkul] Transforming matkul data...")
	matkulEntities := make([]*Matkul, 0, totalMatkul)
	var results []MatkulSyncResult

	now := timeutil.NowWIB()
	for _, mkData := range matkulList {
		entity := transformMatkul(mkData, SYSTEM_UUID, now)
		matkulEntities = append(matkulEntities, entity)
	}

	// Step 4: Bulk upsert matkul in batches
	successCount := 0
	failedCount := 0
	batchSize := 50 // Process 50 matkul per batch

	log.Printf("💾 [Sync Matkul] Upserting %d matkul in batches of %d...", totalMatkul, batchSize)

	for i := 0; i < len(matkulEntities); i += batchSize {
		end := i + batchSize
		if end > len(matkulEntities) {
			end = len(matkulEntities)
		}

		batch := matkulEntities[i:end]

		if err := s.repo.BulkUpsertMatkul(ctx, batch); err != nil {
			log.Printf("⚠️  [Sync Matkul] Failed to upsert batch %d-%d: %v", i, end, err)

			// Mark all in this batch as failed
			for _, mk := range batch {
				failedCount++
				namaMk := ""
				if mk.NmMk != nil {
					namaMk = *mk.NmMk
				}
				results = append(results, MatkulSyncResult{
					IDMatkul:   mk.IDMkPDDikti,
					NamaMatkul: namaMk,
					Success:    false,
					Error:      err.Error(),
				})
			}
		} else {
			// Mark all in this batch as success
			successCount += len(batch)

			// Log progress
			processed := i + len(batch)
			if processed%100 == 0 || processed == totalMatkul {
				log.Printf("📈 [Sync Matkul] Progress: %d/%d (Success: %d, Failed: %d)",
					processed, totalMatkul, successCount, failedCount)

				message := fmt.Sprintf("Memproses %d dari %d matkul (Berhasil: %d, Gagal: %d)",
					processed, totalMatkul, successCount, failedCount)
				monitorSvc.UpdateProgress(syncID, processed, message)
			}
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Matkul] Completed in %v (Success: %d, Failed: %d)",
		duration, successCount, failedCount)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all_prodi"
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		endpointKey = fmt.Sprintf("prodi:%s", *filter.IDProdi)
	}

	syncStatus := "success"
	if failedCount > 0 {
		if successCount > 0 {
			syncStatus = "partial"
		} else {
			syncStatus = "failed"
		}
	}

	logReq := &logger.CreateSyncLogRequest{
		EndpointName:  "matkul",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalMatkul,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Matkul] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Total: %d, Berhasil: %d, Gagal: %d", totalMatkul, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchMatkulSyncResult{
		TotalProcessed: totalMatkul,
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        results,
		SyncedBy:       syncedBy,
		Filter:         filter,
	}

	return result, nil
}

// Helper: getMatkulListFromFeeder fetches all matkul from Feeder API with pagination
func (s *service) getMatkulListFromFeeder(filter string) ([]*FeederMatkulData, error) {
	var allMatkul []*FeederMatkulData
	offset := 0

	log.Printf("📥 [Fetch Matkul] Starting pagination fetch with BATCH_SIZE=%d", BATCH_SIZE)

	for {
		log.Printf("📦 [Fetch Matkul] Fetching batch at offset=%d, limit=%d", offset, BATCH_SIZE)

		rawData, err := s.feederAPI.GetListMataKuliah(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("API call failed at offset %d: %w", offset, err)
		}

		var batchMatkul []*FeederMatkulData
		if err := json.Unmarshal(rawData, &batchMatkul); err != nil {
			return nil, fmt.Errorf("failed to parse matkul list at offset %d: %w", offset, err)
		}

		log.Printf("✅ [Fetch Matkul] Received %d records in this batch", len(batchMatkul))

		allMatkul = append(allMatkul, batchMatkul...)

		if len(batchMatkul) < BATCH_SIZE {
			log.Printf("🏁 [Fetch Matkul] Completed pagination. Total matkul fetched: %d", len(allMatkul))
			break
		}

		offset += BATCH_SIZE
	}

	return allMatkul, nil
}
