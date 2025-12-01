package nilai_perkuliahan

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
	"github.com/myunila/feeder-service/external/feeder_api"
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

// SyncService interface for nilai perkuliahan sync operations
type SyncService interface {
	SyncNilaiPerkuliahan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchNilaiSyncResult, error)
}

// syncService implementation
type syncService struct {
	repo       Repository
	feederAPI  *feeder_api.FeederClient
	loggerSvc  logger.Service
}

// NewSyncService creates a new sync service
func NewSyncService(repo Repository, feederAPI *feeder_api.FeederClient, loggerSvc logger.Service) SyncService {
	return &syncService{
		repo:      repo,
		feederAPI: feederAPI,
		loggerSvc: loggerSvc,
	}
}

// KelasToSync represents a kelas that needs to be synced
type KelasToSync struct {
	IDKls     string
	NmKls     string
	KodeMk    string
	NamaMk    string
	IDSemester string
}

// SyncNilaiPerkuliahan performs sync of nilai perkuliahan from Neo Feeder
// Flow:
// 1. Get list of kelas kuliah from database (filtered by semester/prodi/kelas)
// 2. For each kelas, call GetDetailNilaiPerkuliahanKelas API
// 3. Transform and upsert nilai to database
// 4. Log sync results
func (s *syncService) SyncNilaiPerkuliahan(ctx context.Context, filter *SyncFilter, syncedBy string) (*BatchNilaiSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Nilai Perkuliahan] Starting sync...")

	// Log filter parameters
	if filter != nil {
		if len(filter.IDSemester) > 0 {
			log.Printf("📋 [Sync Nilai Perkuliahan] Filtering by semesters: %v", filter.IDSemester)
		}
		if filter.IDProdi != nil && *filter.IDProdi != "" {
			log.Printf("📋 [Sync Nilai Perkuliahan] Filtering by prodi: %s", *filter.IDProdi)
		}
		if filter.IDKelas != nil && *filter.IDKelas != "" {
			log.Printf("📋 [Sync Nilai Perkuliahan] Filtering by kelas: %s", *filter.IDKelas)
		}
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Nilai Perkuliahan",
		"nilai_perkuliahan",
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

	// Get list of kelas to sync from database
	log.Printf("📥 [Sync Nilai Perkuliahan] Fetching kelas list from database...")
	kelasList, err := s.getKelasListToSync(ctx, filter)
	if err != nil {
		monitorSvc.CompleteSync(syncID, "Gagal mengambil daftar kelas")
		return nil, fmt.Errorf("failed to fetch kelas list: %w", err)
	}

	log.Printf("📊 [Sync Nilai Perkuliahan] Total kelas to sync: %d", len(kelasList))

	totalKelas := len(kelasList)
	if totalKelas == 0 {
		monitorSvc.CompleteSync(syncID, "Tidak ada kelas untuk disinkronisasi")

		result := &BatchNilaiSyncResult{
			TotalKelas:   0,
			TotalNilai:   0,
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

	// Setup worker pool for processing kelas
	jobs := make(chan *KelasToSync, totalKelas)
	results := make(chan NilaiSyncResult, totalKelas)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= NUM_WORKERS; w++ {
		wg.Add(1)
		go s.nilaiWorker(w, jobs, results, &wg)
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
	var allResults []NilaiSyncResult
	successCount := 0
	failedCount := 0
	totalNilai := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
			totalNilai += result.JumlahNilai
		} else {
			failedCount++
			log.Printf("❌ Failed to sync nilai for kelas %s (%s): %s", result.IDKls, result.NmKls, result.Error)
		}

		// Log progress every 10 items
		processed := successCount + failedCount
		if processed%10 == 0 || processed == totalKelas {
			log.Printf("📈 [Sync Nilai Perkuliahan] Progress: %d/%d (Success: %d, Failed: %d)",
				processed, totalKelas, successCount, failedCount)

			message := fmt.Sprintf("Memproses %d dari %d kelas (Berhasil: %d, Gagal: %d)",
				processed, totalKelas, successCount, failedCount)
			monitorSvc.UpdateProgress(syncID, processed, message)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ [Sync Nilai Perkuliahan] Completed in %v (Success: %d, Failed: %d, Total Nilai: %d)",
		duration, successCount, failedCount, totalNilai)

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
		EndpointName:  "nilai_perkuliahan",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  totalNilai,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Nilai Perkuliahan] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Total Kelas: %d, Nilai: %d, Berhasil: %d, Gagal: %d",
		totalKelas, totalNilai, successCount, failedCount)
	monitorSvc.CompleteSync(syncID, message)

	result := &BatchNilaiSyncResult{
		TotalKelas:   totalKelas,
		TotalNilai:   totalNilai,
		TotalSuccess: successCount,
		TotalFailed:  failedCount,
		Duration:     duration.String(),
		Results:      allResults,
		SyncedBy:     syncedBy,
		Filter:       filter,
	}

	return result, nil
}

// getKelasListToSync fetches list of kelas to sync from database
func (s *syncService) getKelasListToSync(ctx context.Context, filter *SyncFilter) ([]*KelasToSync, error) {
	// If specific kelas is provided, just return that one
	if filter != nil && filter.IDKelas != nil && *filter.IDKelas != "" {
		return []*KelasToSync{
			{
				IDKls: *filter.IDKelas,
				NmKls: "Single Kelas",
			},
		}, nil
	}

	// Get kelas list from repository
	var idSemester []string
	var idProdi *string

	if filter != nil {
		idSemester = filter.IDSemester
		idProdi = filter.IDProdi
	}

	kelasData, err := s.repo.GetKelasListBySemesterAndProdi(ctx, idSemester, idProdi)
	if err != nil {
		return nil, err
	}

	var kelasList []*KelasToSync
	for _, k := range kelasData {
		kelas := &KelasToSync{
			IDKls: fmt.Sprintf("%v", k["id_kls"]),
			NmKls: fmt.Sprintf("%v", k["nm_kls"]),
		}
		if kodeMk, ok := k["kode_matkul"]; ok && kodeMk != nil {
			kelas.KodeMk = fmt.Sprintf("%v", kodeMk)
		}
		if namaMk, ok := k["nama_matkul"]; ok && namaMk != nil {
			kelas.NamaMk = fmt.Sprintf("%v", namaMk)
		}
		if idSem, ok := k["id_semester"]; ok && idSem != nil {
			kelas.IDSemester = fmt.Sprintf("%v", idSem)
		}
		kelasList = append(kelasList, kelas)
	}

	return kelasList, nil
}

// nilaiWorker processes sync jobs concurrently
func (s *syncService) nilaiWorker(id int, jobs <-chan *KelasToSync, results chan<- NilaiSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	log.Printf("👷 [Worker %d] Started", id)

	for kelas := range jobs {
		result := s.syncSingleKelasNilai(kelas)
		results <- result

		time.Sleep(RATE_LIMIT_DELAY)
	}

	log.Printf("👷 [Worker %d] Finished", id)
}

// syncSingleKelasNilai syncs nilai for a single kelas
func (s *syncService) syncSingleKelasNilai(kelas *KelasToSync) NilaiSyncResult {
	ctx := context.Background()

	idKelas := kelas.IDKls
	nmKelas := kelas.NmKls

	// Step 1: Fetch nilai from Feeder API
	nilaiList, err := s.fetchNilaiPerkuliahanKelas(idKelas)
	if err != nil {
		return NilaiSyncResult{
			IDKls:       idKelas,
			NmKls:       nmKelas,
			JumlahNilai: 0,
			Success:     false,
			Error:       fmt.Sprintf("failed to fetch nilai: %v", err),
		}
	}

	if len(nilaiList) == 0 {
		return NilaiSyncResult{
			IDKls:       idKelas,
			NmKls:       nmKelas,
			JumlahNilai: 0,
			Success:     true,
		}
	}

	// Step 2: Transform to entities
	now := timeutil.NowWIB()
	nilaiEntities := transformNilaiPerkuliahanList(nilaiList, SYSTEM_UUID, now)

	// Step 3: Upsert to database
	if err := s.repo.BulkUpsertNilaiSmtMhs(ctx, nilaiEntities); err != nil {
		return NilaiSyncResult{
			IDKls:       idKelas,
			NmKls:       nmKelas,
			JumlahNilai: 0,
			Success:     false,
			Error:       fmt.Sprintf("failed to upsert nilai: %v", err),
		}
	}

	return NilaiSyncResult{
		IDKls:       idKelas,
		NmKls:       nmKelas,
		JumlahNilai: len(nilaiList),
		Success:     true,
	}
}

// fetchNilaiPerkuliahanKelas fetches nilai from Feeder API for a specific kelas
func (s *syncService) fetchNilaiPerkuliahanKelas(idKelasKuliah string) ([]*FeederNilaiPerkuliahanData, error) {
	filter := fmt.Sprintf("id_kelas_kuliah = '%s'", idKelasKuliah)

	rawData, err := s.feederAPI.GetDetailNilaiPerkuliahanKelas(filter, 1000, 0)
	if err != nil {
		return nil, err
	}

	var nilaiList []*FeederNilaiPerkuliahanData
	if err := json.Unmarshal(rawData, &nilaiList); err != nil {
		return nil, fmt.Errorf("failed to parse nilai list: %w", err)
	}

	return nilaiList, nil
}

// buildFeederFilter builds Neo Feeder API filter string from SyncFilter
func buildFeederFilter(filter *SyncFilter) string {
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
