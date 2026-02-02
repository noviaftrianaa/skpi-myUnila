package daftar_ukt

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/apps/monitoring"
	"github.com/myunila/keuangan-service/external/simpedam"
	"github.com/myunila/keuangan-service/pkg/timeutil"
)

const (
	// System UUID for audit fields
	SYSTEM_UUID = "00000000-0000-0000-0000-000000000001"

	// Batch size for API calls
	BATCH_SIZE = 100
)

// SyncDaftarUKT syncs DaftarUKT data from SIMPEDAM (creates new syncID)
func (s *service) SyncDaftarUKT(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	// Initialize monitoring with new syncID
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Daftar UKT",
		fmt.Sprintf("tahun=%d", filter.Tahun),
		"batch",
		syncedBy,
		0, // Will update later
	)

	return s.SyncDaftarUKTWithID(ctx, syncID, filter, syncedBy)
}

// SyncDaftarUKTWithID syncs DaftarUKT data from SIMPEDAM with existing syncID
func (s *service) SyncDaftarUKTWithID(ctx context.Context, syncID string, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🔄 [Sync DaftarUKT] Starting sync for tahun %d (syncID: %s)", filter.Tahun, syncID)

	// Get monitoring service
	monitorSvc := monitoring.GetInstance()

	// Check if SIMPEDAM API client is available
	if s.simpedamAPI == nil {
		errMsg := "SIMPEDAM API client is not initialized"
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}

	// Test connection
	if err := s.simpedamAPI.TestConnection(); err != nil {
		errMsg := fmt.Sprintf("SIMPEDAM API connection failed: %v", err)
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}

	// Load prodi mappings for lookup
	mappings, err := s.repo.GetAllProdiMappings(ctx)
	if err != nil {
		log.Printf("⚠️  [Sync DaftarUKT] Could not load prodi mappings: %v", err)
		mappings = []ProdiMapping{} // Continue without mappings
	}
	log.Printf("📋 [Sync DaftarUKT] Loaded %d prodi mappings", len(mappings))

	// Build mapping lookup
	mappingLookup := make(map[string]*ProdiMapping)
	for i := range mappings {
		key := fmt.Sprintf("%s_%d", mappings[i].IDProdiSimpedam.String(), mappings[i].KodeStrata)
		mappingLookup[key] = &mappings[i]
	}

	// Fetch data from SIMPEDAM with pagination
	var allItems []simpedam.DaftarUKTItem
	offset := 0

	apiFilter := ""
	if filter.Tahun > 0 {
		apiFilter = fmt.Sprintf("tahun=%d", filter.Tahun)
	}

	for {
		items, err := s.simpedamAPI.GetDaftarUKT(apiFilter, "", BATCH_SIZE, offset)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to fetch DaftarUKT from SIMPEDAM: %v", err)
			monitorSvc.FailSync(syncID, errMsg)
			return nil, fmt.Errorf(errMsg)
		}

		if len(items) == 0 {
			break
		}

		allItems = append(allItems, items...)
		log.Printf("📥 [Sync DaftarUKT] Fetched %d records (total: %d)", len(items), len(allItems))

		if len(items) < BATCH_SIZE {
			break
		}
		offset += BATCH_SIZE
	}

	totalRecords := len(allItems)
	if totalRecords == 0 {
		log.Printf("⚠️  [Sync DaftarUKT] No data found for tahun %d", filter.Tahun)
		monitorSvc.CompleteSync(syncID, "Tidak ada data ditemukan")
		return &SyncResult{
			TotalProcessed: 0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
		}, nil
	}

	monitorSvc.UpdateTotalRecords(syncID, totalRecords)
	log.Printf("📊 [Sync DaftarUKT] Total records to sync: %d", totalRecords)

	// Transform data first
	var dataList []*DaftarUKT
	mapped := 0
	unmapped := 0
	systemUUID, _ := uuid.Parse(SYSTEM_UUID)
	now := timeutil.NowWIB()

	for _, item := range allItems {
		// Parse ID - use id_ukt from SIMPEDAM REST API
		idDaftarUKT, err := uuid.Parse(item.IDUkt)
		if err != nil {
			log.Printf("⚠️  Invalid UUID: %s", item.IDUkt)
			continue
		}

		idProdi, err := uuid.Parse(item.IDProdi)
		if err != nil {
			log.Printf("⚠️  Invalid prodi UUID: %s", item.IDProdi)
			continue
		}

		// Lookup mapping
		key := fmt.Sprintf("%s_%d", item.IDProdi, int(item.KodeStrata))
		mapping := mappingLookup[key]

		var idSMS *uuid.UUID
		var idJenjDidik *int

		if mapping != nil {
			idSMS = &mapping.IDSMS
			// Map kode_strata to id_jenj_didik
			jenjDidik := mapKodeStrataToJenjDidik(int(item.KodeStrata))
			if jenjDidik > 0 {
				idJenjDidik = &jenjDidik
			}
			mapped++
		} else {
			unmapped++
		}

		d := &DaftarUKT{
			IDDaftarUKT:     idDaftarUKT,
			IDProdiSimpedam: idProdi,
			NamaProdi:       item.NamaProgramStudi,
			Tahun:           int(item.Tahun),
			KodeFakultas:    item.KodeFak,
			NamaFakultas:    item.NamaFakultas,
			KodeKelas:       item.KodeKelas,
			NamaKelas:       item.NamaKelas,
			Nominal:         float64(item.Nominal),
			KodeStrata:      int(item.KodeStrata),
			IDSMS:           idSMS,
			IDJenjDidik:     idJenjDidik,
			CreateDate:      now,
			IDCreator:       systemUUID,
			LastUpdate:      now,
			SoftDelete:      0,
			LastSync:        now,
		}

		dataList = append(dataList, d)
	}

	log.Printf("💾 [Sync DaftarUKT] Starting database insert...")

	// Process in batches with progress updates
	batchSize := 50
	totalBatches := (len(dataList) + batchSize - 1) / batchSize
	totalInserted := 0
	totalUpdated := 0

	for i := 0; i < len(dataList); i += batchSize {
		end := i + batchSize
		if end > len(dataList) {
			end = len(dataList)
		}

		batch := dataList[i:end]
		batchNum := i/batchSize + 1

		// Insert batch
		inserted, updated, err := s.repo.BulkUpsertDaftarUKT(ctx, batch)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to upsert batch %d: %v", batchNum, err)
			monitorSvc.FailSync(syncID, errMsg)
			return nil, fmt.Errorf(errMsg)
		}

		totalInserted += inserted
		totalUpdated += updated

		// Calculate progress
		progress := (end * 100) / totalRecords
		msg := fmt.Sprintf("Menyimpan data %d/%d (%d%%) - Batch %d/%d", end, totalRecords, progress, batchNum, totalBatches)

		// Update monitoring
		monitorSvc.UpdateProgress(syncID, end, msg)

		log.Printf("💾 [Sync DaftarUKT] Batch %d/%d: Inserted: %d, Updated: %d (Total: %d/%d)",
			batchNum, totalBatches, inserted, updated, end, totalRecords)
	}

	duration := time.Since(startTime)
	durationMs := int(duration.Milliseconds())

	result := &SyncResult{
		TotalProcessed: totalRecords,
		TotalInserted:  totalInserted,
		TotalUpdated:   totalUpdated,
		TotalFailed:    totalRecords - (totalInserted + totalUpdated),
		TotalMapped:    mapped,
		TotalUnmapped:  unmapped,
		Duration:       duration.String(),
		SyncedBy:       syncedBy,
	}

	// Log to database
	status := "success"
	if result.TotalFailed > 0 {
		status = "partial"
	}

	_, logErr := s.loggerSvc.LogSync(ctx, &logger.CreateSyncLogRequest{
		EndpointName:  "DaftarUKT",
		EndpointKey:   fmt.Sprintf("tahun=%d", filter.Tahun),
		SyncType:      "batch",
		Status:        status,
		APICode:       "SIMPEDAM",
		TotalRecords:  totalRecords,
		InsertedCount: totalInserted,
		UpdatedCount:  totalUpdated,
		FailedCount:   result.TotalFailed,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	})
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}

	// Complete monitoring
	msg := fmt.Sprintf("Selesai! Total: %d, Inserted: %d, Updated: %d, Mapped: %d, Unmapped: %d",
		totalRecords, totalInserted, totalUpdated, mapped, unmapped)
	monitorSvc.CompleteSync(syncID, msg)

	log.Printf("✅ [Sync DaftarUKT] Completed in %v", duration)

	return result, nil
}

// mapKodeStrataToJenjDidik maps SIMPEDAM kode_strata to MyUnila id_jenj_didik
func mapKodeStrataToJenjDidik(kodeStrata int) int {
	switch kodeStrata {
	case 3: // D3
		return 22
	case 4, 7: // S1 Reguler, S1 Non-Reg/Paralel
		return 30
	default:
		return 0
	}
}

// GetJenjangName returns jenjang name from kode_strata
func GetJenjangName(kodeStrata int) string {
	switch kodeStrata {
	case 3:
		return "D3"
	case 4:
		return "S1 REGULER"
	case 7:
		return "S1 NON-REG/PARALEL"
	default:
		return "UNKNOWN"
	}
}

// Helper to check if error is "no rows"
func isNoRows(err error) bool {
	return err == sql.ErrNoRows
}
