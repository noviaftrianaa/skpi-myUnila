package aktivitas_mahasiswa

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
	// System UUID for audit fields (hardcoded as per mahasiswa pattern)
	SYSTEM_UUID = "443701e4-e814-48f3-9528-251bccee8af1"

	// Worker configuration
	NUM_WORKERS      = 3                      // 3 concurrent workers
	RATE_LIMIT_DELAY = 300 * time.Millisecond // 300ms delay = ~3 req/sec per worker

	// Pagination configuration
	BATCH_SIZE = 100 // Fetch 100 records per API call
)

// SyncAktivitasMahasiswa performs sync of aktivitas mahasiswa from Neo Feeder
// Flow:
// 1. Call GetListAktivitasMahasiswa (no filter - gets all)
// 2. Filter aktivitas by id_semester if provided (optional - if empty, sync all)
// 3. Process with worker pool (3 concurrent workers)
// 4. For each aktivitas, call GetListAnggotaAktivitasMahasiswa with id_aktivitas filter
// 5. Transform and upsert to database
// 6. Log sync results to logger.sync_logs
func (s *service) SyncAktivitasMahasiswa(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchAktivitasSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Aktivitas] Starting sync...")

	// id_semester filter is optional - if empty, sync all semesters
	if filter != nil && len(filter.IDSemester) > 0 {
		log.Printf("📋 [Sync Aktivitas] Filtering by semesters: %v", filter.IDSemester)
	} else {
		log.Printf("📋 [Sync Aktivitas] No semester filter - syncing all semesters")
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Aktivitas Mahasiswa",
		"aktivitas_mahasiswa",
		"batch",
		syncedBy,
		0, // Will update totalRecords later
	)

	// Check if Feeder API client is initialized
	if s.feederAPI == nil {
		log.Printf("❌ [ERROR] Feeder API client is NIL!")
		return nil, fmt.Errorf("feeder API client is not initialized - please configure API credentials in settings")
	}

	// Test connection
	if err := s.feederAPI.TestConnection(); err != nil {
		log.Printf("❌ [ERROR] Feeder API client failed connection test: %v", err)
		return nil, fmt.Errorf("feeder API client connection failed: %w - please check API credentials and network connectivity", err)
	}

	log.Printf("✅ [DEBUG] Feeder API client is initialized and connected")

	// Step 1: Build filter string for Neo Feeder API
	filterStr := s.buildFeederFilter(filter)
	if filterStr != "" {
		log.Printf("📋 [Sync Aktivitas] Using Neo Feeder filter: %s", filterStr)
	}

	// Step 2: Fetch aktivitas from Feeder API with filter
	log.Printf("📥 [Sync Aktivitas] Fetching aktivitas list from Neo Feeder...")
	aktivitasList, err := s.getAktivitasListFromFeederWithFilter(filterStr)
	if err != nil {
		log.Printf("⚠️  [Sync Aktivitas] Failed to get aktivitas list: %v", err)
		return nil, fmt.Errorf("failed to fetch aktivitas list: %w", err)
	}

	log.Printf("📊 [Sync Aktivitas] Total aktivitas from API: %d", len(aktivitasList))

	totalAktivitas := len(aktivitasList)
	if totalAktivitas == 0 {
		log.Printf("⚠️  [Sync Aktivitas] No aktivitas found for semesters: %v", filter.IDSemester)

		// Complete monitoring with no data
		monitorSvc.CompleteSync(syncID, "Tidak ada data aktivitas ditemukan")

		result := &BatchAktivitasSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
			Filter:         filter,
		}

		return result, nil
	}

	log.Printf("📊 [Sync Aktivitas] Total aktivitas to sync: %d", totalAktivitas)

	// Update monitoring with total records
	monitorSvc.UpdateTotalRecords(syncID, totalAktivitas)

	// Step 2: Setup worker pool for processing aktivitas
	jobs := make(chan *FeederAktivitasData, totalAktivitas)
	results := make(chan AktivitasSyncResult, totalAktivitas)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= NUM_WORKERS; w++ {
		wg.Add(1)
		go s.aktivitasWorker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, akt := range aktivitasList {
		jobs <- akt
	}
	close(jobs)

	// Wait for completion
	go func() {
		wg.Wait()
		close(results)
	}()

	// Step 3: Collect results and update sync log
	var allResults []AktivitasSyncResult
	successCount := 0
	failedCount := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
		} else {
			failedCount++
			// Log detailed error for debugging
			log.Printf("❌ Failed to sync aktivitas %s (%s): %s", result.IDAktivitas, result.Judul, result.Error)
		}

		// Log progress every 10 items
		processed := successCount + failedCount
		if processed%10 == 0 || processed == totalAktivitas {
			log.Printf("📈 [Sync Aktivitas] Progress: %d/%d (Success: %d, Failed: %d)",
				processed, totalAktivitas, successCount, failedCount)

			// Update monitoring progress
			message := fmt.Sprintf("Memproses %d dari %d aktivitas (Berhasil: %d, Gagal: %d)",
				processed, totalAktivitas, successCount, failedCount)
			monitorSvc.UpdateProgress(syncID, processed, message)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Aktivitas] Completed in %v (Success: %d, Failed: %d)",
		duration, successCount, failedCount)

	// Create sync log entry using logger service
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
		EndpointName:  "aktivitas_mahasiswa",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalAktivitas,
		InsertedCount: successCount,
		UpdatedCount:  0, // We don't track separately in this implementation
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Aktivitas] Failed to create sync log: %v", err)
		// Don't fail the sync if logging fails
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Total: %d, Berhasil: %d, Gagal: %d", totalAktivitas, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchAktivitasSyncResult{
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

// aktivitasWorker processes sync jobs concurrently
func (s *service) aktivitasWorker(id int, jobs <-chan *FeederAktivitasData, results chan<- AktivitasSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	log.Printf("👷 [Worker %d] Started", id)

	for aktData := range jobs {
		// Sync single aktivitas
		result := s.syncSingleAktivitas(aktData)
		results <- result

		// Rate limiting: prevent API throttling
		time.Sleep(RATE_LIMIT_DELAY)
	}

	log.Printf("👷 [Worker %d] Finished", id)
}

// syncSingleAktivitas syncs a single aktivitas with its anggota
func (s *service) syncSingleAktivitas(aktData *FeederAktivitasData) AktivitasSyncResult {
	ctx := context.Background()

	idAktivitas := aktData.IDAktivitas
	judul := ""
	if aktData.Judul != nil {
		judul = *aktData.Judul
	}

	// Step 1: Fetch anggota for this aktivitas
	anggotaList, err := s.fetchAnggotaAktivitas(idAktivitas)
	if err != nil {
		log.Printf("⚠️  [Sync Aktivitas %s] Failed to fetch anggota: %v", idAktivitas, err)
		// Continue even if no anggota (some aktivitas may have no members yet)
		anggotaList = []*FeederAnggotaAktivitasData{}
	}

	// Step 2: Transform aktivitas to entity
	aktMhs := transformAktivitas(aktData, SYSTEM_UUID, timeutil.NowWIB())

	// Step 3: Transform anggota to entities
	anggotaEntities := transformAnggotaList(anggotaList, SYSTEM_UUID, timeutil.NowWIB())

	// Step 4: Upsert aktivitas to database
	if err := s.repo.BulkUpsertAktMhs(ctx, []*AktMhs{aktMhs}); err != nil {
		return AktivitasSyncResult{
			IDAktivitas:   idAktivitas,
			Judul:         judul,
			JumlahAnggota: 0,
			Success:       false,
			Error:         fmt.Sprintf("failed to upsert aktivitas: %v", err),
		}
	}

	// Step 5: Upsert anggota to database
	if len(anggotaEntities) > 0 {
		if err := s.repo.BulkUpsertAnggotaAktMhs(ctx, anggotaEntities); err != nil {
			log.Printf("⚠️  [Sync Aktivitas %s] Failed to upsert anggota: %v", idAktivitas, err)
			// Don't fail the whole sync if anggota fails
		}
	}

	return AktivitasSyncResult{
		IDAktivitas:   idAktivitas,
		Judul:         judul,
		JumlahAnggota: len(anggotaList),
		Success:       true,
	}
}

// Helper: buildFeederFilter builds Neo Feeder API filter string from SyncFilter
// Example output: "id_semester = '20251' and id_prodi='15300df3-faf0-41fe-a79c-1e06f64e5e3d' and id_jenis_aktivitas='24'"
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
			// Multiple semesters: id_semester = '20241' OR id_semester = '20242'
			semesterConds := []string{}
			for _, sem := range filter.IDSemester {
				semesterConds = append(semesterConds, fmt.Sprintf("id_semester = '%s'", sem))
			}
			conditions = append(conditions, "("+strings.Join(semesterConds, " OR ")+")")
		}
	}

	// Build id_prodi filter (id_prodi in Neo Feeder = id_sms in our DB)
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("id_prodi = '%s'", *filter.IDProdi))
	}

	// Build id_jenis_aktivitas filter (optional)
	if filter.IDJenisAktivitas != nil && *filter.IDJenisAktivitas != 0 {
		conditions = append(conditions, fmt.Sprintf("id_jenis_aktivitas = '%d'", *filter.IDJenisAktivitas))
	}

	// Join with AND
	if len(conditions) == 0 {
		return ""
	}

	return strings.Join(conditions, " and ")
}

// Helper: getAktivitasListFromFeederWithFilter fetches aktivitas from Feeder API with filter
func (s *service) getAktivitasListFromFeederWithFilter(filter string) ([]*FeederAktivitasData, error) {
	var allAktivitas []*FeederAktivitasData
	offset := 0

	log.Printf("📥 [Fetch Aktivitas] Starting pagination fetch with BATCH_SIZE=%d", BATCH_SIZE)

	// Pagination loop: fetch BATCH_SIZE records at a time to avoid API timeout/memory exhaustion
	for {
		log.Printf("📦 [Fetch Aktivitas] Fetching batch at offset=%d, limit=%d", offset, BATCH_SIZE)

		var rawData []byte
		var err error

		if filter != "" {
			// Use filter version
			rawData, err = s.feederAPI.GetListAktivitasMahasiswaWithFilter(filter, BATCH_SIZE, offset)
		} else {
			// No filter - fetch all
			rawData, err = s.feederAPI.GetListAktivitasMahasiswaWithPagination(BATCH_SIZE, offset)
		}

		if err != nil {
			return nil, fmt.Errorf("API call failed at offset %d: %w", offset, err)
		}

		var batchAktivitas []*FeederAktivitasData
		if err := json.Unmarshal(rawData, &batchAktivitas); err != nil {
			return nil, fmt.Errorf("failed to parse aktivitas list at offset %d: %w", offset, err)
		}

		log.Printf("✅ [Fetch Aktivitas] Received %d records in this batch", len(batchAktivitas))

		// Append to main list
		allAktivitas = append(allAktivitas, batchAktivitas...)

		// If we got fewer records than BATCH_SIZE, we've reached the end
		if len(batchAktivitas) < BATCH_SIZE {
			log.Printf("🏁 [Fetch Aktivitas] Completed pagination. Total aktivitas fetched: %d", len(allAktivitas))
			break
		}

		// Move to next batch
		offset += BATCH_SIZE
	}

	return allAktivitas, nil
}

// Helper: getAktivitasListFromFeeder fetches all aktivitas from Feeder API with pagination (DEPRECATED - use getAktivitasListFromFeederWithFilter)
func (s *service) getAktivitasListFromFeeder() ([]*FeederAktivitasData, error) {
	return s.getAktivitasListFromFeederWithFilter("")
}

// Helper: fetchAnggotaAktivitas fetches anggota for a specific aktivitas
func (s *service) fetchAnggotaAktivitas(idAktivitas string) ([]*FeederAnggotaAktivitasData, error) {
	// Call GetListAnggotaAktivitasMahasiswa with id_aktivitas filter
	rawData, err := s.feederAPI.GetListAnggotaAktivitasMahasiswa(idAktivitas)
	if err != nil {
		return nil, err
	}

	var anggotaList []*FeederAnggotaAktivitasData
	if err := json.Unmarshal(rawData, &anggotaList); err != nil {
		return nil, fmt.Errorf("failed to parse anggota list: %w", err)
	}

	return anggotaList, nil
}
