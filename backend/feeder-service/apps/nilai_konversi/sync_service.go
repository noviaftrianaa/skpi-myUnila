package nilai_konversi

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
	BATCH_SIZE = 500
)

// SyncService interface for nilai konversi sync operations
type SyncService interface {
	SyncNilaiKonversi(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
}

// syncService implementation
type syncService struct {
	repo      Repository
	feederAPI *feeder_api.FeederClient
	loggerSvc logger.Service
}

// NewSyncService creates a new sync service
func NewSyncService(repo Repository, feederAPI *feeder_api.FeederClient, loggerSvc logger.Service) SyncService {
	return &syncService{
		repo:      repo,
		feederAPI: feederAPI,
		loggerSvc: loggerSvc,
	}
}

// SyncNilaiKonversi performs sync of nilai konversi and transfer from Neo Feeder
// Flow:
// 1. Sync GetListKonversiKampusMerdeka -> mbkm.konversi_akt_mhs
// 2. Sync GetNilaiTransferPendidikanMahasiswa -> mbkm.ekuiv_transfer
// 3. Log sync results
func (s *syncService) SyncNilaiKonversi(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync Nilai Konversi] Starting sync...")

	// Log filter parameters
	if filter != nil {
		if len(filter.IDSemester) > 0 {
			log.Printf("📋 [Sync Nilai Konversi] Filtering by semesters: %v", filter.IDSemester)
		}
		if filter.IDProdi != nil && *filter.IDProdi != "" {
			log.Printf("📋 [Sync Nilai Konversi] Filtering by prodi: %s", *filter.IDProdi)
		}
	}

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Nilai Konversi",
		"nilai_konversi",
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

	// Build filters for Feeder API (different endpoints may support different filters)
	// Transfer endpoint supports: id_prodi, id_semester
	// Konversi endpoint may only support: id_semester (no id_prodi)
	transferFilter := buildFeederFilter(filter)
	konversiFilter := buildKonversiFilter(filter) // Separate filter without id_prodi

	if transferFilter != "" {
		log.Printf("📋 [Sync Nilai Konversi] Transfer filter: %s", transferFilter)
	}
	if konversiFilter != "" {
		log.Printf("📋 [Sync Nilai Konversi] Konversi filter: %s", konversiFilter)
	}

	// Results
	result := &SyncResult{
		TotalKonversi: 0,
		TotalTransfer: 0,
		InsertedCount: 0,
		UpdatedCount:  0,
		FailedCount:   0,
		SkippedCount:  0,
	}

	// Create wait group and mutex for concurrent sync
	var wg sync.WaitGroup
	var mu sync.Mutex
	errors := []string{}

	// Sync konversi and transfer in parallel
	wg.Add(2)

	// Sync Konversi Kampus Merdeka
	go func() {
		defer wg.Done()

		log.Printf("📥 [Sync Nilai Konversi] Fetching konversi kampus merdeka from Feeder API...")
		konversiData, err := s.fetchKonversiKampusMerdeka(konversiFilter)
		if err != nil {
			mu.Lock()
			errors = append(errors, fmt.Sprintf("konversi: %v", err))
			mu.Unlock()
			log.Printf("❌ [Sync Nilai Konversi] Failed to fetch konversi: %v", err)
			return
		}

		log.Printf("📊 [Sync Nilai Konversi] Fetched %d konversi records", len(konversiData))

		if len(konversiData) > 0 {
			// Transform to entities
			now := timeutil.NowWIB()
			entities := transformKonversiList(konversiData, SYSTEM_UUID, now)

			// Upsert to database with per-record processing
			successCount := 0
			failCount := 0
			for i, entity := range entities {
				if err := s.repo.UpsertKonversiAktMhs(ctx, entity); err != nil {
					failCount++
					// Check if it's FK constraint error for akt_mhs
					if strings.Contains(err.Error(), "fk_konversi_akt_konve_akt_mhs") {
						log.Printf("⚠️  [Konversi] Failed id=%s (akt_mhs not found - sync aktivitas mahasiswa first): id_akt_mhs=%s", entity.IDKonversiAktivitas, entity.IDAktMhs)
					} else {
						log.Printf("⚠️  [Konversi] Failed id=%s: %v", entity.IDKonversiAktivitas, err)
					}
				} else {
					successCount++
				}

				// Log progress every 50 items
				processed := i + 1
				if processed%50 == 0 || processed == len(entities) {
					log.Printf("📈 [Konversi] Progress: %d/%d (Success: %d, Failed: %d)",
						processed, len(entities), successCount, failCount)
				}
			}

			mu.Lock()
			result.TotalKonversi = len(konversiData)
			result.InsertedCount += successCount
			result.FailedCount += failCount
			if failCount > 0 {
				errors = append(errors, fmt.Sprintf("konversi: %d failed", failCount))
			}
			mu.Unlock()

			log.Printf("✅ [Konversi] Completed: %d success, %d failed", successCount, failCount)
		}
	}()

	// Sync Nilai Transfer
	go func() {
		defer wg.Done()

		log.Printf("📥 [Sync Nilai Konversi] Fetching nilai transfer from Feeder API...")
		transferData, err := s.fetchNilaiTransfer(transferFilter)
		if err != nil {
			mu.Lock()
			errors = append(errors, fmt.Sprintf("transfer: %v", err))
			mu.Unlock()
			log.Printf("❌ [Sync Nilai Konversi] Failed to fetch transfer: %v", err)
			return
		}

		log.Printf("📊 [Sync Nilai Konversi] Fetched %d transfer records", len(transferData))

		if len(transferData) > 0 {
			// Transform to entities
			now := timeutil.NowWIB()
			entities := transformTransferList(transferData, SYSTEM_UUID, now)

			// Upsert to database with per-record processing
			successCount := 0
			failCount := 0
			for i, entity := range entities {
				if err := s.repo.UpsertEkuivTransfer(ctx, entity); err != nil {
					failCount++
					// Check if it's FK constraint error for reg_pd
					if strings.Contains(err.Error(), "fk_ekuiv_tr_reg_pd") {
						log.Printf("⚠️  [Transfer] Failed id=%s (reg_pd not found - sync mahasiswa first): id_reg_pd=%s", entity.IDEkuivalensi, entity.IDRegPD)
					} else {
						log.Printf("⚠️  [Transfer] Failed id=%s: %v", entity.IDEkuivalensi, err)
					}
				} else {
					successCount++
				}

				// Log progress every 50 items
				processed := i + 1
				if processed%50 == 0 || processed == len(entities) {
					log.Printf("📈 [Transfer] Progress: %d/%d (Success: %d, Failed: %d)",
						processed, len(entities), successCount, failCount)
				}
			}

			mu.Lock()
			result.TotalTransfer = len(transferData)
			result.InsertedCount += successCount
			result.FailedCount += failCount
			if failCount > 0 {
				errors = append(errors, fmt.Sprintf("transfer: %d failed", failCount))
			}
			mu.Unlock()

			log.Printf("✅ [Transfer] Completed: %d success, %d failed", successCount, failCount)
		}
	}()

	// Wait for both syncs to complete
	wg.Wait()

	duration := time.Since(startTime)

	// Determine sync status
	syncStatus := "success"
	if len(errors) > 0 {
		if result.InsertedCount > 0 {
			syncStatus = "partial"
		} else {
			syncStatus = "failed"
		}
	}

	log.Printf("✅ [Sync Nilai Konversi] Completed in %v (Konversi: %d, Transfer: %d, Status: %s)",
		duration, result.TotalKonversi, result.TotalTransfer, syncStatus)

	// Create sync log entry
	durationMs := int(duration.Milliseconds())
	endpointKey := "all_semesters"
	if filter != nil && len(filter.IDSemester) > 0 {
		endpointKey = fmt.Sprintf("semesters:%v", filter.IDSemester)
	}

	logReq := &logger.CreateSyncLogRequest{
		EndpointName:  "nilai_konversi",
		EndpointKey:   endpointKey,
		SyncType:      "manual",
		Status:        syncStatus,
		APICode:       "FEEDER",
		TotalRecords:  result.TotalKonversi + result.TotalTransfer,
		InsertedCount: result.InsertedCount,
		UpdatedCount:  result.UpdatedCount,
		FailedCount:   result.FailedCount,
		SkippedCount:  result.SkippedCount,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	}

	if _, err := s.loggerSvc.LogSync(ctx, logReq); err != nil {
		log.Printf("⚠️  [Sync Nilai Konversi] Failed to create sync log: %v", err)
	}

	// Complete monitoring
	message := fmt.Sprintf("Selesai! Konversi: %d, Transfer: %d",
		result.TotalKonversi, result.TotalTransfer)
	if len(errors) > 0 {
		message += fmt.Sprintf(" (Errors: %s)", strings.Join(errors, "; "))
	}
	monitorSvc.CompleteSync(syncID, message)

	result.Message = message

	return result, nil
}

// fetchKonversiKampusMerdeka fetches konversi data from Feeder API
func (s *syncService) fetchKonversiKampusMerdeka(filter string) ([]*FeederKonversiKampusMerdeka, error) {
	var allData []*FeederKonversiKampusMerdeka
	offset := 0

	for {
		rawData, err := s.feederAPI.GetListKonversiKampusMerdeka(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch konversi at offset %d: %w", offset, err)
		}

		var batch []*FeederKonversiKampusMerdeka
		if err := json.Unmarshal(rawData, &batch); err != nil {
			return nil, fmt.Errorf("failed to parse konversi at offset %d: %w", offset, err)
		}

		if len(batch) == 0 {
			break
		}

		allData = append(allData, batch...)

		// If less than batch size, we've reached the end
		if len(batch) < BATCH_SIZE {
			break
		}

		offset += BATCH_SIZE
		time.Sleep(RATE_LIMIT_DELAY)
	}

	return allData, nil
}

// fetchNilaiTransfer fetches transfer data from Feeder API
func (s *syncService) fetchNilaiTransfer(filter string) ([]*FeederNilaiTransfer, error) {
	var allData []*FeederNilaiTransfer
	offset := 0

	for {
		rawData, err := s.feederAPI.GetNilaiTransferPendidikanMahasiswa(filter, BATCH_SIZE, offset)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch transfer at offset %d: %w", offset, err)
		}

		var batch []*FeederNilaiTransfer
		if err := json.Unmarshal(rawData, &batch); err != nil {
			return nil, fmt.Errorf("failed to parse transfer at offset %d: %w", offset, err)
		}

		if len(batch) == 0 {
			break
		}

		allData = append(allData, batch...)

		// If less than batch size, we've reached the end
		if len(batch) < BATCH_SIZE {
			break
		}

		offset += BATCH_SIZE
		time.Sleep(RATE_LIMIT_DELAY)
	}

	return allData, nil
}

// buildFeederFilter builds Neo Feeder API filter string from SyncFilter
// Used for GetNilaiTransferPendidikanMahasiswa which supports id_prodi and id_semester
func buildFeederFilter(filter *SyncFilter) string {
	if filter == nil {
		return ""
	}

	var conditions []string

	// Build id_prodi filter - IMPORTANT: Must include id_prodi to filter by prodi!
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("id_prodi = '%s'", *filter.IDProdi))
	}

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

	if len(conditions) == 0 {
		return ""
	}

	return strings.Join(conditions, " AND ")
}

// buildKonversiFilter builds filter for GetListKonversiKampusMerdeka endpoint
// This endpoint may not support id_prodi filter, only id_semester
func buildKonversiFilter(filter *SyncFilter) string {
	if filter == nil {
		return ""
	}

	var conditions []string

	// Build id_semester filter only (konversi endpoint may not support id_prodi)
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

	if len(conditions) == 0 {
		return ""
	}

	return strings.Join(conditions, " AND ")
}
