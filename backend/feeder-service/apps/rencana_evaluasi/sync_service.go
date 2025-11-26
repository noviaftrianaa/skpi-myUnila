package rencana_evaluasi

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

const (
	// System UUID for audit fields
	SYSTEM_UUID = "443701e4-e814-48f3-9528-251bccee8af1"

	// Pagination configuration
	BATCH_SIZE = 100
)

// SyncRencanaEvaluasi performs sync of rencana evaluasi from Neo Feeder
// Flow:
// 1. Sync jenis evaluasi reference data
// 2. Fetch all rencana evaluasi from Neo Feeder
// 3. Transform and bulk upsert to database
// 4. Log sync results
func (s *service) SyncRencanaEvaluasi(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchRencanaEvaluasiSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Rencana Evaluasi] Starting sync...")

	// Filter is optional
	if filter == nil {
		filter = &SyncFilter{}
	}

	if filter.IDMatkul != nil && *filter.IDMatkul != "" {
		log.Printf("📋 [Sync Rencana Evaluasi] Filtering by matkul: %s", *filter.IDMatkul)
	} else {
		log.Printf("📋 [Sync Rencana Evaluasi] No matkul filter - syncing ALL")
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Rencana Evaluasi",
		"rencana_evaluasi",
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

	// Step 1: Sync jenis evaluasi reference data
	log.Printf("📥 [Sync Rencana Evaluasi] Syncing jenis evaluasi reference data...")
	jenisEvalCount, err := s.syncJenisEvaluasi(ctx)
	if err != nil {
		log.Printf("⚠️  [Sync Rencana Evaluasi] Failed to sync jenis evaluasi: %v", err)
		// Continue anyway, as this is reference data
	} else {
		log.Printf("✅ [Sync Rencana Evaluasi] Synced %d jenis evaluasi", jenisEvalCount)
	}

	// Step 2: Build filter string for Neo Feeder API
	filterStr := s.buildFeederFilter(filter)
	log.Printf("📋 [Sync Rencana Evaluasi] Using Neo Feeder filter: %s", filterStr)

	// Step 3: Fetch all rencana evaluasi from Feeder API
	log.Printf("📥 [Sync Rencana Evaluasi] Fetching rencana evaluasi list from Neo Feeder...")
	reList, err := s.getRencanaEvaluasiListFromFeeder(filterStr)
	if err != nil {
		log.Printf("⚠️  [Sync Rencana Evaluasi] Failed to get rencana evaluasi list: %v", err)
		monitorSvc.CompleteSync(syncID, "Gagal mengambil data rencana evaluasi")
		return nil, fmt.Errorf("failed to fetch rencana evaluasi list: %w", err)
	}

	log.Printf("📊 [Sync Rencana Evaluasi] Total rencana evaluasi from API: %d", len(reList))

	totalRE := len(reList)
	if totalRE == 0 {
		filterDesc := "all matkul"
		if filter.IDMatkul != nil && *filter.IDMatkul != "" {
			filterDesc = fmt.Sprintf("matkul %s", *filter.IDMatkul)
		}
		log.Printf("⚠️  [Sync Rencana Evaluasi] No rencana evaluasi found for %s", filterDesc)

		monitorSvc.CompleteSync(syncID, "Tidak ada data rencana evaluasi ditemukan")

		result := &BatchRencanaEvaluasiSyncResult{
			TotalJenisEvaluasi:   jenisEvalCount,
			TotalRencanaEvaluasi: 0,
			TotalSuccess:         0,
			TotalFailed:          0,
			Duration:             time.Since(startTime).String(),
			SyncedBy:             syncedBy,
		}

		return result, nil
	}

	// Update monitoring with total records
	monitorSvc.UpdateTotalRecords(syncID, totalRE)

	// Step 4: Transform all rencana evaluasi to entities
	log.Printf("🔄 [Sync Rencana Evaluasi] Transforming rencana evaluasi data...")
	reEntities := make([]*RencanaEvaluasi, 0, totalRE)
	var results []RencanaEvaluasiSyncResult

	now := timeutil.NowWIB()
	for _, reData := range reList {
		entity := transformRencanaEvaluasi(reData, SYSTEM_UUID, now)
		reEntities = append(reEntities, entity)
	}

	// Step 5: Bulk upsert rencana evaluasi in batches
	successCount := 0
	failedCount := 0
	batchSize := 50 // Process 50 records per batch

	log.Printf("💾 [Sync Rencana Evaluasi] Upserting %d rencana evaluasi in batches of %d...", totalRE, batchSize)

	for i := 0; i < len(reEntities); i += batchSize {
		end := i + batchSize
		if end > len(reEntities) {
			end = len(reEntities)
		}

		batch := reEntities[i:end]

		if err := s.repo.BulkUpsertRencanaEvaluasi(ctx, batch); err != nil {
			log.Printf("⚠️  [Sync Rencana Evaluasi] Failed to upsert batch %d-%d: %v", i, end, err)

			// Mark all in this batch as failed
			for _, re := range batch {
				failedCount++
				namaMk := ""
				if re.IDMk != nil {
					namaMk = *re.IDMk
				}
				results = append(results, RencanaEvaluasiSyncResult{
					IDReMk:     re.IDReMk,
					IDMatkul:   namaMk,
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
			if processed%100 == 0 || processed == totalRE {
				log.Printf("📈 [Sync Rencana Evaluasi] Progress: %d/%d (Success: %d, Failed: %d)",
					processed, totalRE, successCount, failedCount)

				message := fmt.Sprintf("Memproses %d dari %d rencana evaluasi (Berhasil: %d, Gagal: %d)",
					processed, totalRE, successCount, failedCount)
				monitorSvc.UpdateProgress(syncID, processed, message)
			}
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Rencana Evaluasi] Completed in %v (Success: %d, Failed: %d)",
		duration, successCount, failedCount)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all_matkul"
	if filter.IDMatkul != nil && *filter.IDMatkul != "" {
		endpointKey = fmt.Sprintf("matkul:%s", *filter.IDMatkul)
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
		EndpointName:  "rencana_evaluasi",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalRE,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Rencana Evaluasi] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Jenis Evaluasi: %d, Total: %d, Berhasil: %d, Gagal: %d",
		jenisEvalCount, totalRE, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchRencanaEvaluasiSyncResult{
		TotalJenisEvaluasi:   jenisEvalCount,
		TotalRencanaEvaluasi: totalRE,
		TotalSuccess:         successCount,
		TotalFailed:          failedCount,
		Duration:             duration.String(),
		Results:              results,
		SyncedBy:             syncedBy,
	}

	return result, nil
}

// syncJenisEvaluasi syncs jenis evaluasi reference data
func (s *service) syncJenisEvaluasi(ctx context.Context) (int, error) {
	rawData, err := s.feederAPI.GetJenisEvaluasi("", 1000, 0)
	if err != nil {
		return 0, fmt.Errorf("API call failed: %w", err)
	}

	var jenisEvalList []*FeederJenisEvaluasiData
	if err := json.Unmarshal(rawData, &jenisEvalList); err != nil {
		return 0, fmt.Errorf("failed to parse jenis evaluasi list: %w", err)
	}

	if len(jenisEvalList) == 0 {
		return 0, nil
	}

	// Transform to entities
	now := timeutil.NowWIB()
	entities := make([]*JenisEvaluasi, 0, len(jenisEvalList))
	for _, jeData := range jenisEvalList {
		entity := transformJenisEvaluasi(jeData, now)
		entities = append(entities, entity)
	}

	// Bulk upsert
	if err := s.repo.BulkUpsertJenisEvaluasi(ctx, entities); err != nil {
		return 0, fmt.Errorf("failed to upsert jenis evaluasi: %w", err)
	}

	return len(entities), nil
}

// buildFeederFilter builds Neo Feeder API filter string from SyncFilter
func (s *service) buildFeederFilter(filter *SyncFilter) string {
	if filter == nil {
		return ""
	}

	if filter.IDMatkul != nil && *filter.IDMatkul != "" {
		return fmt.Sprintf("id_matkul = '%s'", *filter.IDMatkul)
	}

	return ""
}

// getRencanaEvaluasiListFromFeeder fetches all rencana evaluasi from Feeder API with pagination
func (s *service) getRencanaEvaluasiListFromFeeder(filter string) ([]*FeederRencanaEvaluasiData, error) {
	var allRE []*FeederRencanaEvaluasiData
	offset := 0

	log.Printf("📥 [Fetch Rencana Evaluasi] Starting pagination fetch with BATCH_SIZE=%d", BATCH_SIZE)

	for {
		log.Printf("📦 [Fetch Rencana Evaluasi] Fetching batch at offset=%d, limit=%d", offset, BATCH_SIZE)

		rawData, err := s.feederAPI.GetListRencanaEvaluasi(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("API call failed at offset %d: %w", offset, err)
		}

		var batchRE []*FeederRencanaEvaluasiData
		if err := json.Unmarshal(rawData, &batchRE); err != nil {
			return nil, fmt.Errorf("failed to parse rencana evaluasi list at offset %d: %w", offset, err)
		}

		log.Printf("✅ [Fetch Rencana Evaluasi] Received %d records in this batch", len(batchRE))

		allRE = append(allRE, batchRE...)

		if len(batchRE) < BATCH_SIZE {
			log.Printf("🏁 [Fetch Rencana Evaluasi] Completed pagination. Total fetched: %d", len(allRE))
			break
		}

		offset += BATCH_SIZE
	}

	return allRE, nil
}
