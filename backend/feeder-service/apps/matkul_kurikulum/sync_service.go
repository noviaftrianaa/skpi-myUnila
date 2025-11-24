package matkul_kurikulum

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/apps/monitoring"
	"github.com/myunila/feeder-service/pkg/timeutil"
)

const (
	// System UUID for audit fields
	SYSTEM_UUID = "443701e4-e814-48f3-9528-251bccee8af1"

	// Worker configuration
	NUM_WORKERS      = 3
	RATE_LIMIT_DELAY = 300 * time.Millisecond

	// Pagination configuration
	BATCH_SIZE = 100
)

// SyncKurikulum performs sync of kurikulum from Neo Feeder
// Flow:
// 1. Call GetListKurikulum with filter by id_prodi (MANDATORY)
// 2. For each kurikulum:
//    a. Call GetMatkulKurikulum with filter by id_kurikulum
//    b. For each matkul in kurikulum, call GetListMataKuliah with filter by id_matkul
// 3. Transform and upsert to database
// 4. Log sync results
func (s *service) SyncKurikulum(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchKurikulumSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Kurikulum] Starting sync...")

	// id_prodi filter is now OPTIONAL
	// If not provided, sync all prodi kurikulum
	if filter == nil {
		filter = &SyncFilter{}
	}

	if filter.IDProdi != nil && *filter.IDProdi != "" {
		log.Printf("📋 [Sync Kurikulum] Filtering by prodi: %s", *filter.IDProdi)
	} else {
		log.Printf("📋 [Sync Kurikulum] No prodi filter - syncing ALL prodi")
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Kurikulum",
		"kurikulum",
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

	log.Printf("✅ [DEBUG] Feeder API client is initialized and connected")

	// Step 1: Build filter string for Neo Feeder API
	filterStr := s.buildFeederFilter(filter)
	log.Printf("📋 [Sync Kurikulum] Using Neo Feeder filter: %s", filterStr)

	// Step 2: Fetch kurikulum from Feeder API with filter
	log.Printf("📥 [Sync Kurikulum] Fetching kurikulum list from Neo Feeder...")
	kurikulumList, err := s.getKurikulumListFromFeederWithFilter(filterStr)
	if err != nil {
		log.Printf("⚠️  [Sync Kurikulum] Failed to get kurikulum list: %v", err)
		return nil, fmt.Errorf("failed to fetch kurikulum list: %w", err)
	}

	log.Printf("📊 [Sync Kurikulum] Total kurikulum from API: %d", len(kurikulumList))

	totalKurikulum := len(kurikulumList)
	if totalKurikulum == 0 {
		filterDesc := "all prodi"
		if filter.IDProdi != nil && *filter.IDProdi != "" {
			filterDesc = fmt.Sprintf("prodi %s", *filter.IDProdi)
		}
		log.Printf("⚠️  [Sync Kurikulum] No kurikulum found for %s", filterDesc)

		monitorSvc.CompleteSync(syncID, "Tidak ada data kurikulum ditemukan")

		result := &BatchKurikulumSyncResult{
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
	monitorSvc.UpdateTotalRecords(syncID, totalKurikulum)

	// Step 3: Setup worker pool for processing kurikulum
	jobs := make(chan *FeederKurikulumData, totalKurikulum)
	results := make(chan KurikulumSyncResult, totalKurikulum)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= NUM_WORKERS; w++ {
		wg.Add(1)
		go s.kurikulumWorker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, kur := range kurikulumList {
		jobs <- kur
	}
	close(jobs)

	// Wait for completion
	go func() {
		wg.Wait()
		close(results)
	}()

	// Step 4: Collect results
	var allResults []KurikulumSyncResult
	successCount := 0
	failedCount := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync kurikulum %s (%s): %s", result.IDKurikulum, result.NamaKurikulum, result.Error)
		}

		// Log progress every 10 items
		processed := successCount + failedCount
		if processed%10 == 0 || processed == totalKurikulum {
			log.Printf("📈 [Sync Kurikulum] Progress: %d/%d (Success: %d, Failed: %d)",
				processed, totalKurikulum, successCount, failedCount)

			message := fmt.Sprintf("Memproses %d dari %d kurikulum (Berhasil: %d, Gagal: %d)",
				processed, totalKurikulum, successCount, failedCount)
			monitorSvc.UpdateProgress(syncID, processed, message)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Kurikulum] Completed in %v (Success: %d, Failed: %d)",
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
		EndpointName:  "kurikulum",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalKurikulum,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Kurikulum] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Total: %d, Berhasil: %d, Gagal: %d", totalKurikulum, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchKurikulumSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
		Filter:         filter,
	}

	return result, nil
}

// kurikulumWorker processes sync jobs concurrently
func (s *service) kurikulumWorker(id int, jobs <-chan *FeederKurikulumData, results chan<- KurikulumSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	log.Printf("👷 [Worker %d] Started", id)

	for kurData := range jobs {
		result := s.syncSingleKurikulum(kurData)
		results <- result

		time.Sleep(RATE_LIMIT_DELAY)
	}

	log.Printf("👷 [Worker %d] Finished", id)
}

// syncSingleKurikulum syncs a single kurikulum with its matkul
func (s *service) syncSingleKurikulum(kurData *FeederKurikulumData) KurikulumSyncResult {
	ctx := context.Background()

	idKurikulum := kurData.IDKurikulum
	namaKurikulum := ""
	if kurData.NamaKurikulum != nil {
		namaKurikulum = *kurData.NamaKurikulum
	}

	// Step 1: Transform kurikulum to entity
	kurikulum := transformKurikulum(kurData, SYSTEM_UUID, timeutil.NowWIB())

	// Step 2: Upsert kurikulum to database
	if err := s.repo.BulkUpsertKurikulumSP(ctx, []*KurikulumSP{kurikulum}); err != nil {
		return KurikulumSyncResult{
			IDKurikulum:   idKurikulum,
			NamaKurikulum: namaKurikulum,
			JumlahMatkul:  0,
			Success:       false,
			Error:         fmt.Sprintf("failed to upsert kurikulum: %v", err),
		}
	}

	// Step 3: Fetch matkul_kurikulum for this kurikulum
	matkulKurikulumList, err := s.fetchMatkulKurikulum(idKurikulum)
	if err != nil {
		log.Printf("⚠️  [Sync Kurikulum %s] Failed to fetch matkul_kurikulum: %v", idKurikulum, err)
		matkulKurikulumList = []*FeederMatkulKurikulumData{}
	}

	// Step 4: Transform matkul_kurikulum to entities
	matkulKurikulumEntities := make([]*MatkulKurikulum, 0, len(matkulKurikulumList))
	matkulIDs := make([]string, 0, len(matkulKurikulumList))

	for _, mkKur := range matkulKurikulumList {
		entity := transformMatkulKurikulum(mkKur, SYSTEM_UUID, timeutil.NowWIB())
		matkulKurikulumEntities = append(matkulKurikulumEntities, entity)

		if mkKur.IDMatkul != nil {
			matkulIDs = append(matkulIDs, *mkKur.IDMatkul)
		}
	}

	// Step 5: Upsert matkul_kurikulum
	if len(matkulKurikulumEntities) > 0 {
		if err := s.repo.BulkUpsertMatkulKurikulum(ctx, matkulKurikulumEntities); err != nil {
			log.Printf("⚠️  [Sync Kurikulum %s] Failed to upsert matkul_kurikulum: %v", idKurikulum, err)
		}
	}

	// Step 6: Fetch and upsert matkul data for each matkul_id
	// (Note: This could be optimized by batching, but for now we do it one by one)
	matkulCount := 0
	for _, matkulID := range matkulIDs {
		if matkulData, err := s.fetchMatkul(matkulID); err == nil {
			matkulEntity := transformMatkul(matkulData, SYSTEM_UUID, timeutil.NowWIB())
			if err := s.repo.BulkUpsertMatkul(ctx, []*Matkul{matkulEntity}); err != nil {
				log.Printf("⚠️  [Sync Kurikulum %s] Failed to upsert matkul %s: %v", idKurikulum, matkulID, err)
			} else {
				matkulCount++
			}
		}
	}

	return KurikulumSyncResult{
		IDKurikulum:   idKurikulum,
		NamaKurikulum: namaKurikulum,
		JumlahMatkul:  matkulCount,
		Success:       true,
	}
}

// Helper: buildFeederFilter builds Neo Feeder API filter string from SyncFilter
func (s *service) buildFeederFilter(filter *SyncFilter) string {
	if filter == nil {
		return ""
	}

	var conditions []string

	// Build id_prodi filter (MANDATORY - id_prodi in Neo Feeder = id_sms in our DB)
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("id_prodi = '%s'", *filter.IDProdi))
	}

	if len(conditions) == 0 {
		return ""
	}

	return strings.Join(conditions, " AND ")
}

// Helper: getKurikulumListFromFeederWithFilter fetches kurikulum from Feeder API with filter
func (s *service) getKurikulumListFromFeederWithFilter(filter string) ([]*FeederKurikulumData, error) {
	var allKurikulum []*FeederKurikulumData
	offset := 0

	log.Printf("📥 [Fetch Kurikulum] Starting pagination fetch with BATCH_SIZE=%d", BATCH_SIZE)

	for {
		log.Printf("📦 [Fetch Kurikulum] Fetching batch at offset=%d, limit=%d", offset, BATCH_SIZE)

		rawData, err := s.feederAPI.GetListKurikulum(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("API call failed at offset %d: %w", offset, err)
		}

		var batchKurikulum []*FeederKurikulumData
		if err := json.Unmarshal(rawData, &batchKurikulum); err != nil {
			return nil, fmt.Errorf("failed to parse kurikulum list at offset %d: %w", offset, err)
		}

		log.Printf("✅ [Fetch Kurikulum] Received %d records in this batch", len(batchKurikulum))

		allKurikulum = append(allKurikulum, batchKurikulum...)

		if len(batchKurikulum) < BATCH_SIZE {
			log.Printf("🏁 [Fetch Kurikulum] Completed pagination. Total kurikulum fetched: %d", len(allKurikulum))
			break
		}

		offset += BATCH_SIZE
	}

	return allKurikulum, nil
}

// Helper: fetchMatkulKurikulum fetches matkul_kurikulum for a specific kurikulum
func (s *service) fetchMatkulKurikulum(idKurikulum string) ([]*FeederMatkulKurikulumData, error) {
	filter := fmt.Sprintf("id_kurikulum = '%s'", idKurikulum)

	var allMatkulKurikulum []*FeederMatkulKurikulumData
	offset := 0

	for {
		rawData, err := s.feederAPI.GetMatkulKurikulum(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, err
		}

		var batchMatkulKurikulum []*FeederMatkulKurikulumData
		if err := json.Unmarshal(rawData, &batchMatkulKurikulum); err != nil {
			return nil, fmt.Errorf("failed to parse matkul_kurikulum list: %w", err)
		}

		allMatkulKurikulum = append(allMatkulKurikulum, batchMatkulKurikulum...)

		if len(batchMatkulKurikulum) < BATCH_SIZE {
			break
		}

		offset += BATCH_SIZE
	}

	return allMatkulKurikulum, nil
}

// Helper: fetchMatkul fetches matkul data for a specific id_matkul
func (s *service) fetchMatkul(idMatkul string) (*FeederMatkulData, error) {
	filter := fmt.Sprintf("id_matkul = '%s'", idMatkul)

	rawData, err := s.feederAPI.GetListMataKuliah(filter, 1, 0)
	if err != nil {
		return nil, err
	}

	var matkulList []*FeederMatkulData
	if err := json.Unmarshal(rawData, &matkulList); err != nil {
		return nil, fmt.Errorf("failed to parse matkul list: %w", err)
	}

	if len(matkulList) == 0 {
		return nil, fmt.Errorf("matkul not found")
	}

	return matkulList[0], nil
}
