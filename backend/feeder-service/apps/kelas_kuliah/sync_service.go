package kelas_kuliah

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

// SyncKelasKuliah performs sync of kelas kuliah from Neo Feeder
// Flow:
// 1. Call GetListKelasKuliah with semester and prodi filter
// 2. Process with worker pool (3 concurrent workers)
// 3. For each kelas, call GetDosenPengajarKelasKuliah with id_kelas_kuliah filter
// 4. Transform and upsert to database
// 5. Log sync results
func (s *service) SyncKelasKuliah(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchKelasKuliahSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Kelas Kuliah] Starting sync...")

	// id_semester filter is optional - if empty, sync all semesters
	if filter != nil && len(filter.IDSemester) > 0 {
		log.Printf("📋 [Sync Kelas Kuliah] Filtering by semesters: %v", filter.IDSemester)
	} else {
		log.Printf("📋 [Sync Kelas Kuliah] No semester filter - syncing all semesters")
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Kelas Kuliah",
		"kelas_kuliah",
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

	// Build filter string for Neo Feeder API
	filterStr := s.buildFeederFilter(filter)
	if filterStr != "" {
		log.Printf("📋 [Sync Kelas Kuliah] Using Neo Feeder filter: %s", filterStr)
	}

	// Fetch kelas kuliah from Feeder API
	log.Printf("📥 [Sync Kelas Kuliah] Fetching kelas kuliah list from Neo Feeder...")
	kelasList, err := s.getKelasKuliahListFromFeeder(filterStr)
	if err != nil {
		monitorSvc.CompleteSync(syncID, "Gagal mengambil data kelas kuliah")
		return nil, fmt.Errorf("failed to fetch kelas kuliah list: %w", err)
	}

	log.Printf("📊 [Sync Kelas Kuliah] Total kelas kuliah from API: %d", len(kelasList))

	totalKelas := len(kelasList)
	if totalKelas == 0 {
		monitorSvc.CompleteSync(syncID, "Tidak ada data kelas kuliah ditemukan")

		result := &BatchKelasKuliahSyncResult{
			TotalKelas:   0,
			TotalDosen:   0,
			TotalSuccess: 0,
			TotalFailed:  0,
			Duration:     time.Since(startTime).String(),
			SyncedBy:     syncedBy,
			Filter:       filter,
		}

		return result, nil
	}

	// Update monitoring with total records
	monitorSvc.UpdateTotalRecords(syncID, totalKelas)

	// Setup worker pool for processing kelas kuliah
	jobs := make(chan *FeederKelasKuliahData, totalKelas)
	results := make(chan KelasKuliahSyncResult, totalKelas)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= NUM_WORKERS; w++ {
		wg.Add(1)
		go s.kelasKuliahWorker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, kelas := range kelasList {
		jobs <- kelas
	}
	close(jobs)

	// Wait for completion
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	var allResults []KelasKuliahSyncResult
	successCount := 0
	failedCount := 0
	totalDosen := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
			totalDosen += result.JumlahDosen
		} else {
			failedCount++
			log.Printf("❌ Failed to sync kelas kuliah %s (%s): %s", result.IDKls, result.NmKls, result.Error)
		}

		// Log progress every 10 items
		processed := successCount + failedCount
		if processed%10 == 0 || processed == totalKelas {
			log.Printf("📈 [Sync Kelas Kuliah] Progress: %d/%d (Success: %d, Failed: %d)",
				processed, totalKelas, successCount, failedCount)

			message := fmt.Sprintf("Memproses %d dari %d kelas kuliah (Berhasil: %d, Gagal: %d)",
				processed, totalKelas, successCount, failedCount)
			monitorSvc.UpdateProgress(syncID, processed, message)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Kelas Kuliah] Completed in %v (Success: %d, Failed: %d, Total Dosen: %d)",
		duration, successCount, failedCount, totalDosen)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all_semesters"
	if filter != nil && len(filter.IDSemester) > 0 {
		endpointKey = fmt.Sprintf("semesters:%v", filter.IDSemester)
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
		EndpointName:  "kelas_kuliah",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalKelas,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Kelas Kuliah] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Total Kelas: %d, Dosen: %d, Berhasil: %d, Gagal: %d",
		totalKelas, totalDosen, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchKelasKuliahSyncResult{
		TotalKelas:   totalKelas,
		TotalDosen:   totalDosen,
		TotalSuccess: successCount,
		TotalFailed:  failedCount,
		Duration:     duration.String(),
		Results:      allResults,
		SyncedBy:     syncedBy,
		Filter:       filter,
	}

	return result, nil
}

// kelasKuliahWorker processes sync jobs concurrently
func (s *service) kelasKuliahWorker(id int, jobs <-chan *FeederKelasKuliahData, results chan<- KelasKuliahSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	log.Printf("👷 [Worker %d] Started", id)

	for kelasData := range jobs {
		result := s.syncSingleKelasKuliah(kelasData)
		results <- result

		time.Sleep(RATE_LIMIT_DELAY)
	}

	log.Printf("👷 [Worker %d] Finished", id)
}

// syncSingleKelasKuliah syncs a single kelas kuliah with its dosen pengajar
func (s *service) syncSingleKelasKuliah(kelasData *FeederKelasKuliahData) KelasKuliahSyncResult {
	ctx := context.Background()

	idKelas := kelasData.IDKelasKuliah
	nmKelas := safeString(kelasData.NamaKelasKuliah)

	// Step 1: Fetch dosen pengajar for this kelas
	dosenList, err := s.fetchDosenPengajarKelas(idKelas)
	if err != nil {
		log.Printf("⚠️  [Sync Kelas %s] Failed to fetch dosen: %v", idKelas, err)
		dosenList = []*FeederDosenPengajarData{}
	}

	// Step 2: Transform kelas kuliah to entity
	kelasKuliah := transformKelasKuliah(kelasData, SYSTEM_UUID, timeutil.NowWIB())

	// Step 3: Transform dosen to entities
	dosenEntities := transformDosenPengajarList(dosenList, SYSTEM_UUID, timeutil.NowWIB())

	// Step 4: Upsert kelas kuliah to database
	if err := s.repo.BulkUpsertKelasKuliah(ctx, []*KelasKuliah{kelasKuliah}); err != nil {
		return KelasKuliahSyncResult{
			IDKls:       idKelas,
			NmKls:       nmKelas,
			JumlahDosen: 0,
			Success:     false,
			Error:       fmt.Sprintf("failed to upsert kelas kuliah: %v", err),
		}
	}

	// Step 5: Upsert dosen pengajar to database
	if len(dosenEntities) > 0 {
		if err := s.repo.BulkUpsertAktAjarDosen(ctx, dosenEntities); err != nil {
			log.Printf("⚠️  [Sync Kelas %s] Failed to upsert dosen: %v", idKelas, err)
		}
	}

	return KelasKuliahSyncResult{
		IDKls:       idKelas,
		NmKls:       nmKelas,
		JumlahDosen: len(dosenList),
		Success:     true,
	}
}

// buildFeederFilter builds Neo Feeder API filter string from SyncFilter
func (s *service) buildFeederFilter(filter *SyncFilter) string {
	if filter == nil {
		return ""
	}

	var conditions []string

	// Build id_semester filter (support multiple semesters with OR)
	if len(filter.IDSemester) > 0 {
		if len(filter.IDSemester) == 1 {
			conditions = append(conditions, fmt.Sprintf("id_semester = '%s'", filter.IDSemester[0]))
		} else {
			semesterConds := []string{}
			for _, sem := range filter.IDSemester {
				semesterConds = append(semesterConds, fmt.Sprintf("id_semester = '%s'", sem))
			}
			conditions = append(conditions, "("+strings.Join(semesterConds, " OR ")+")")
		}
	}

	// Build id_prodi filter
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("id_prodi = '%s'", *filter.IDProdi))
	}

	if len(conditions) == 0 {
		return ""
	}

	return strings.Join(conditions, " AND ")
}

// getKelasKuliahListFromFeeder fetches kelas kuliah from Feeder API with pagination
func (s *service) getKelasKuliahListFromFeeder(filter string) ([]*FeederKelasKuliahData, error) {
	var allKelas []*FeederKelasKuliahData
	offset := 0

	log.Printf("📥 [Fetch Kelas Kuliah] Starting pagination fetch with BATCH_SIZE=%d", BATCH_SIZE)

	for {
		log.Printf("📦 [Fetch Kelas Kuliah] Fetching batch at offset=%d, limit=%d", offset, BATCH_SIZE)

		rawData, err := s.feederAPI.GetListKelasKuliah(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("API call failed at offset %d: %w", offset, err)
		}

		var batchKelas []*FeederKelasKuliahData
		if err := json.Unmarshal(rawData, &batchKelas); err != nil {
			return nil, fmt.Errorf("failed to parse kelas kuliah list at offset %d: %w", offset, err)
		}

		log.Printf("✅ [Fetch Kelas Kuliah] Received %d records in this batch", len(batchKelas))

		allKelas = append(allKelas, batchKelas...)

		if len(batchKelas) < BATCH_SIZE {
			log.Printf("🏁 [Fetch Kelas Kuliah] Completed pagination. Total fetched: %d", len(allKelas))
			break
		}

		offset += BATCH_SIZE
	}

	return allKelas, nil
}

// fetchDosenPengajarKelas fetches dosen pengajar for a specific kelas
func (s *service) fetchDosenPengajarKelas(idKelasKuliah string) ([]*FeederDosenPengajarData, error) {
	filter := fmt.Sprintf("id_kelas_kuliah = '%s'", idKelasKuliah)

	rawData, err := s.feederAPI.GetDosenPengajarKelasKuliah(filter, 1000, 0)
	if err != nil {
		return nil, err
	}

	var dosenList []*FeederDosenPengajarData
	if err := json.Unmarshal(rawData, &dosenList); err != nil {
		return nil, fmt.Errorf("failed to parse dosen list: %w", err)
	}

	return dosenList, nil
}
