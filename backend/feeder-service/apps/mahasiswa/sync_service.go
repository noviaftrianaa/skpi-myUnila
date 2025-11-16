package mahasiswa

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)

const (
	// UNILA ID_SP constant
	UNILA_ID_SP = "e2b705a7-173e-464a-9fac-509128709515"

	// System UUID for audit fields
	SYSTEM_UUID = "00000000-0000-0000-0000-000000000001"

	// Worker configuration
	NUM_WORKERS        = 3               // 3 concurrent workers
	RATE_LIMIT_DELAY   = 200 * time.Millisecond // 200ms delay = ~5 req/sec per worker
	MAX_RETRY_PER_ITEM = 2               // Retry failed items up to 2 times
)

// SyncMahasiswaByAngkatan performs batch sync mahasiswa by angkatan using worker pool
func (s *service) SyncMahasiswaByAngkatan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchMahasiswaSyncResult, error) {
	startTime := time.Now()

	// Validation: Angkatan is REQUIRED
	if filter == nil || len(filter.Angkatan) == 0 {
		return nil, fmt.Errorf("filter angkatan is required")
	}

	log.Printf("🔄 [Sync Mahasiswa] Starting sync for angkatan %v (prodi: %v)", filter.Angkatan, filter.IDProdi)

	// Step 1: Get prodi list to sync
	prodiList, err := s.getProdiListForSync(ctx, filter.IDProdi)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}

	log.Printf("📋 [Sync Mahasiswa] Will sync %d prodi", len(prodiList))

	// Step 2: Collect all mahasiswa from all prodi and angkatan
	var allMahasiswaList []map[string]interface{}
	for _, angkatan := range filter.Angkatan {
		for _, prodi := range prodiList {
			idProdi := prodi["id_sms"].(string)
			namaProdi := prodi["nama_prodi"].(string)

			log.Printf("📥 [Sync Mahasiswa] Fetching list from %s angkatan %s...", namaProdi, angkatan)

			// Get mahasiswa list from Feeder API for this prodi + angkatan
			mhsList, err := s.getMahasiswaListFromFeeder(idProdi, angkatan)
			if err != nil {
				log.Printf("⚠️  [Sync Mahasiswa] Failed to get list from %s: %v", namaProdi, err)
				continue
			}

			log.Printf("✅ [Sync Mahasiswa] Found %d mahasiswa in %s angkatan %s", len(mhsList), namaProdi, angkatan)
			allMahasiswaList = append(allMahasiswaList, mhsList...)
		}
	}

	totalMahasiswa := len(allMahasiswaList)
	if totalMahasiswa == 0 {
		log.Printf("⚠️  [Sync Mahasiswa] No mahasiswa found for angkatan %v", filter.Angkatan)
		return &BatchMahasiswaSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
			Filter:         filter,
		}, nil
	}

	log.Printf("📊 [Sync Mahasiswa] Total mahasiswa to sync: %d", totalMahasiswa)

	// Step 3: Setup worker pool
	jobs := make(chan map[string]interface{}, totalMahasiswa)
	results := make(chan MahasiswaSyncResult, totalMahasiswa)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= NUM_WORKERS; w++ {
		wg.Add(1)
		go s.mahasiswaWorker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, mhs := range allMahasiswaList {
		jobs <- mhs
	}
	close(jobs)

	// Wait for completion
	go func() {
		wg.Wait()
		close(results)
	}()

	// Step 4: Collect results
	var allResults []MahasiswaSyncResult
	successCount := 0
	failedCount := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
		} else {
			failedCount++
		}

		// Log progress every 10 items
		processed := successCount + failedCount
		if processed%10 == 0 || processed == totalMahasiswa {
			log.Printf("📈 [Sync Mahasiswa] Progress: %d/%d (Success: %d, Failed: %d)",
				processed, totalMahasiswa, successCount, failedCount)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Mahasiswa] Completed in %v (Success: %d, Failed: %d)",
		duration, successCount, failedCount)

	return &BatchMahasiswaSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults, // Include all results for detailed logging
		SyncedBy:       syncedBy,
		Filter:         filter,
	}, nil
}

// mahasiswaWorker processes sync jobs concurrently
func (s *service) mahasiswaWorker(id int, jobs <-chan map[string]interface{}, results chan<- MahasiswaSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	log.Printf("👷 [Worker %d] Started", id)

	for mhsInfo := range jobs {
		idRegPd := mhsInfo["id_registrasi_mahasiswa"].(string)
		nama := mhsInfo["nama_mahasiswa"].(string)
		npm := ""
		if mhsInfo["nim"] != nil {
			npm = mhsInfo["nim"].(string)
		}

		// Sync single mahasiswa with retry
		result := s.syncSingleMahasiswaWithRetry(idRegPd, nama, npm)
		results <- result

		// Rate limiting: prevent API throttling
		time.Sleep(RATE_LIMIT_DELAY)
	}

	log.Printf("👷 [Worker %d] Finished", id)
}

// syncSingleMahasiswaWithRetry syncs a single mahasiswa with retry logic
func (s *service) syncSingleMahasiswaWithRetry(idRegPd, nama, npm string) MahasiswaSyncResult {
	var lastErr error

	for attempt := 0; attempt <= MAX_RETRY_PER_ITEM; attempt++ {
		if attempt > 0 {
			log.Printf("🔄 [Retry %d/%d] %s (%s)", attempt, MAX_RETRY_PER_ITEM, nama, npm)
			time.Sleep(time.Duration(attempt) * 2 * time.Second) // Exponential backoff
		}

		result := s.syncSingleMahasiswa(idRegPd, nama, npm)
		if result.Success {
			return result
		}

		lastErr = fmt.Errorf(result.Error)

		// Don't retry if error is not retryable
		if !isRetryableError(result.Error) {
			break
		}
	}

	// All retries failed
	return MahasiswaSyncResult{
		IDPD:    idRegPd,
		Nama:    nama,
		NPM:     npm,
		Success: false,
		Error:   fmt.Sprintf("failed after %d retries: %v", MAX_RETRY_PER_ITEM, lastErr),
	}
}

// syncSingleMahasiswa syncs a single mahasiswa (core logic)
func (s *service) syncSingleMahasiswa(idRegPd, nama, npm string) MahasiswaSyncResult {
	ctx := context.Background()

	// Step 1: Fetch GetListRiwayatPendidikanMahasiswa (to get id_pd and basic reg data)
	regData, err := s.fetchRiwayatPendidikan(idRegPd)
	if err != nil {
		return MahasiswaSyncResult{
			IDPD: idRegPd, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("failed to fetch riwayat pendidikan: %v", err),
		}
	}

	idPD := regData["id_mahasiswa"].(string)
	idProdi := regData["id_prodi"].(string)

	// Step 2: Fetch GetDataLengkapMahasiswaProdi (for detailed mahasiswa data)
	feederMhs, err := s.fetchDataLengkapMahasiswa(idProdi, idPD)
	if err != nil {
		return MahasiswaSyncResult{
			IDPD: idPD, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("failed to fetch data lengkap: %v", err),
		}
	}

	// Step 3: Fetch GetListRiwayatPendidikanMahasiswa (detailed)
	feederReg, err := s.fetchRiwayatPendidikanDetail(idRegPd)
	if err != nil {
		return MahasiswaSyncResult{
			IDPD: idPD, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("failed to fetch reg detail: %v", err),
		}
	}

	// Step 4: Fetch GetDetailMahasiswaLulusDO (if applicable)
	feederLulusDO, _ := s.fetchDetailLulusDO(idRegPd) // Ignore error if not lulus/DO

	// Step 5: Fetch GetListPerkuliahanMahasiswa (semester activities)
	feederKuliah, err := s.fetchPerkuliahanMahasiswa(idRegPd)
	if err != nil {
		log.Printf("⚠️  [Sync %s] No perkuliahan data: %v", npm, err)
		feederKuliah = []*FeederPerkuliahanMahasiswa{} // Empty list is OK
	}

	// Step 6: Transform to entities
	pesertaDidik, regPd, kuliahMhsList, err := TransformFeederToEntities(
		feederMhs, feederReg, feederLulusDO, feederKuliah,
		UNILA_ID_SP, SYSTEM_UUID,
	)
	if err != nil {
		return MahasiswaSyncResult{
			IDPD: idPD, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("transform error: %v", err),
		}
	}

	// Step 7: Upsert to database
	if err := s.repo.BulkUpsertPesertaDidik(ctx, []*PesertaDidik{pesertaDidik}); err != nil {
		return MahasiswaSyncResult{
			IDPD: idPD, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("failed to upsert peserta_didik: %v", err),
		}
	}

	if err := s.repo.BulkUpsertRegPd(ctx, []*RegPd{regPd}); err != nil {
		return MahasiswaSyncResult{
			IDPD: idPD, Nama: nama, NPM: npm, Success: false,
			Error: fmt.Sprintf("failed to upsert reg_pd: %v", err),
		}
	}

	if len(kuliahMhsList) > 0 {
		if err := s.repo.BulkUpsertKuliahMhs(ctx, kuliahMhsList); err != nil {
			log.Printf("⚠️  [Sync %s] Failed to upsert kuliah_mhs: %v", npm, err)
			// Don't fail the whole sync if kuliah_mhs fails
		}
	}

	return MahasiswaSyncResult{
		IDPD:    idPD,
		Nama:    nama,
		NPM:     npm,
		Success: true,
	}
}

// SyncSingleMahasiswaTest syncs a single mahasiswa for testing
func (s *service) SyncSingleMahasiswaTest(ctx context.Context, idRegPd string) (*MahasiswaSyncResult, error) {
	log.Printf("🧪 [Test Sync] Syncing single mahasiswa: %s", idRegPd)

	result := s.syncSingleMahasiswa(idRegPd, "Test", idRegPd)

	if result.Success {
		log.Printf("✅ [Test Sync] Success: %s (%s)", result.Nama, result.NPM)
	} else {
		log.Printf("❌ [Test Sync] Failed: %v", result.Error)
	}

	return &result, nil
}

// Helper: getProdiListForSync gets prodi list based on filter
func (s *service) getProdiListForSync(ctx context.Context, idProdi *string) ([]map[string]interface{}, error) {
	allProdi, err := s.repo.GetProdiList(ctx)
	if err != nil {
		return nil, err
	}

	// If specific prodi requested, filter
	if idProdi != nil && *idProdi != "" {
		for _, prodi := range allProdi {
			if prodi["id_sms"].(string) == *idProdi {
				return []map[string]interface{}{prodi}, nil
			}
		}
		return nil, fmt.Errorf("prodi not found: %s", *idProdi)
	}

	// Return all prodi
	return allProdi, nil
}

// Helper: getMahasiswaListFromFeeder fetches mahasiswa list from Feeder API
func (s *service) getMahasiswaListFromFeeder(idProdi string, angkatan string) ([]map[string]interface{}, error) {
	// Build filter for angkatan
	// Angkatan "2021" -> semester starts with "2021" (20211, 20212)
	filter := fmt.Sprintf("LEFT(id_periode_masuk, 4) = '%s'", angkatan)

	rawData, err := s.feederAPI.GetDataLengkapMahasiswaProdi(idProdi, filter, 0, 0) // limit=0 means all
	if err != nil {
		return nil, err
	}

	var mhsList []map[string]interface{}
	if err := json.Unmarshal(rawData, &mhsList); err != nil {
		return nil, fmt.Errorf("failed to parse mahasiswa list: %w", err)
	}

	return mhsList, nil
}

// Helper: fetchRiwayatPendidikan fetches basic registration data
func (s *service) fetchRiwayatPendidikan(idRegPd string) (map[string]interface{}, error) {
	rawData, err := s.feederAPI.GetListRiwayatPendidikanMahasiswa(idRegPd)
	if err != nil {
		return nil, err
	}

	var regList []map[string]interface{}
	if err := json.Unmarshal(rawData, &regList); err != nil {
		return nil, err
	}

	if len(regList) == 0 {
		return nil, fmt.Errorf("no riwayat pendidikan found")
	}

	return regList[0], nil
}

// Helper: fetchDataLengkapMahasiswa fetches detailed mahasiswa data
func (s *service) fetchDataLengkapMahasiswa(idProdi, idPD string) (*FeederMahasiswaData, error) {
	filter := fmt.Sprintf("id_mahasiswa = '%s'", idPD)
	rawData, err := s.feederAPI.GetDataLengkapMahasiswaProdi(idProdi, filter, 1, 0)
	if err != nil {
		return nil, err
	}

	var mhsList []*FeederMahasiswaData
	if err := json.Unmarshal(rawData, &mhsList); err != nil {
		return nil, err
	}

	if len(mhsList) == 0 {
		return nil, fmt.Errorf("mahasiswa not found")
	}

	return mhsList[0], nil
}

// Helper: fetchRiwayatPendidikanDetail fetches detailed registration data
func (s *service) fetchRiwayatPendidikanDetail(idRegPd string) (*FeederRiwayatPendidikan, error) {
	rawData, err := s.feederAPI.GetListRiwayatPendidikanMahasiswa(idRegPd)
	if err != nil {
		return nil, err
	}

	var regList []*FeederRiwayatPendidikan
	if err := json.Unmarshal(rawData, &regList); err != nil {
		return nil, err
	}

	if len(regList) == 0 {
		return nil, fmt.Errorf("no registration found")
	}

	return regList[0], nil
}

// Helper: fetchDetailLulusDO fetches graduate/dropout data
func (s *service) fetchDetailLulusDO(idRegPd string) (*FeederMahasiswaLulusDO, error) {
	rawData, err := s.feederAPI.GetDetailMahasiswaLulusDO(idRegPd)
	if err != nil {
		return nil, err
	}

	var lulusList []*FeederMahasiswaLulusDO
	if err := json.Unmarshal(rawData, &lulusList); err != nil {
		return nil, err
	}

	if len(lulusList) == 0 {
		return nil, nil // Not lulus/DO yet, return nil
	}

	return lulusList[0], nil
}

// Helper: fetchPerkuliahanMahasiswa fetches semester activity data
func (s *service) fetchPerkuliahanMahasiswa(idRegPd string) ([]*FeederPerkuliahanMahasiswa, error) {
	rawData, err := s.feederAPI.GetListPerkuliahanMahasiswa(idRegPd)
	if err != nil {
		return nil, err
	}

	var kuliahList []*FeederPerkuliahanMahasiswa
	if err := json.Unmarshal(rawData, &kuliahList); err != nil {
		return nil, err
	}

	return kuliahList, nil
}

// isRetryableError checks if an error is retryable
func isRetryableError(errMsg string) bool {
	// Retry on network errors, timeouts, 5xx errors
	retryablePatterns := []string{
		"timeout",
		"connection",
		"429", // Too Many Requests
		"500", // Internal Server Error
		"502", // Bad Gateway
		"503", // Service Unavailable
		"504", // Gateway Timeout
	}

	for _, pattern := range retryablePatterns {
		if contains(errMsg, pattern) {
			return true
		}
	}

	return false
}

// contains checks if string contains substring (case-insensitive)
func contains(s, substr string) bool {
	return len(s) >= len(substr) &&
		(s == substr || len(s) > len(substr) &&
		(s[:len(substr)] == substr || contains(s[1:], substr)))
}
