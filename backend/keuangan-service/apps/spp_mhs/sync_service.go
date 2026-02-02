package spp_mhs

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/apps/monitoring"
	"github.com/myunila/keuangan-service/pkg/timeutil"
)

const (
	// System UUID for audit fields
	SYSTEM_UUID = "00000000-0000-0000-0000-000000000001"

	// Batch size for API calls
	BATCH_SIZE = 100
)

// SyncSppMhs syncs SPP Mahasiswa data from SIMPEDAM
func (s *service) SyncSppMhs(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := timeutil.NowWIB()

	filterKey := "all"
	if filter.NPM != nil {
		filterKey = fmt.Sprintf("npm=%s", *filter.NPM)
	} else if filter.Tahun != nil {
		filterKey = fmt.Sprintf("tahun=%d", *filter.Tahun)
	}

	log.Printf("🔄 [Sync SppMhs] Starting sync for %s", filterKey)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync SPP Mahasiswa",
		filterKey,
		"batch",
		syncedBy,
		0, // Will update later
	)

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

	// Load npm -> id_reg_pd mappings
	log.Println("📋 [Sync SppMhs] Loading npm to id_reg_pd mappings...")
	npmMappings, err := s.repo.GetAllRegPdMappings(ctx)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to load npm mappings: %v", err)
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}
	log.Printf("📋 [Sync SppMhs] Loaded %d npm mappings", len(npmMappings))

	// Build API filter
	apiFilter := ""
	if filter.NPM != nil && *filter.NPM != "" {
		apiFilter = fmt.Sprintf("npm=%s", *filter.NPM)
	} else if filter.Tahun != nil && *filter.Tahun > 0 {
		apiFilter = fmt.Sprintf("tahun_masuk=%d", *filter.Tahun)
	}

	// Fetch data from SIMPEDAM with pagination
	allItems, err := s.simpedamAPI.GetMasterBiayaMahasiswa(apiFilter, "", BATCH_SIZE, 0)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to fetch MasterBiayaMahasiswa from SIMPEDAM: %v", err)
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}

	totalRecords := len(allItems)
	if totalRecords == 0 {
		log.Printf("⚠️  [Sync SppMhs] No data found for %s", filterKey)
		monitorSvc.CompleteSync(syncID, "Tidak ada data ditemukan")
		return &SyncResult{
			TotalProcessed: 0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
		}, nil
	}

	// Count total payment records
	totalPayments := 0
	for _, item := range allItems {
		totalPayments += len(item.RiwayatBayar)
	}

	monitorSvc.UpdateTotalRecords(syncID, totalPayments)
	log.Printf("📊 [Sync SppMhs] Total mahasiswa: %d, Total payment records: %d", totalRecords, totalPayments)

	// Transform and upsert data
	var dataList []*SppMhs
	mapped := 0
	unmapped := 0
	systemUUID, _ := uuid.Parse(SYSTEM_UUID)
	now := timeutil.NowWIB()
	processed := 0

	for _, item := range allItems {
		// Lookup npm -> id_reg_pd mapping
		npmMapping := npmMappings[item.NPM]
		if npmMapping == nil {
			unmapped++
			log.Printf("⚠️  [Sync SppMhs] NPM %s not found in reg_pd", item.NPM)
			continue
		}
		mapped++

		// Process each payment record
		for _, riwayat := range item.RiwayatBayar {
			// Only process paid records
			if riwayat.FlagBayar == 0 {
				continue
			}

			// Generate deterministic UUID for id_spp_mhs
			// Using npm + id_semester as unique key
			idSppMhs := uuid.NewSHA1(uuid.NameSpaceOID, []byte(item.NPM+"_"+riwayat.IDSemester))

			// Convert id_semester to id_smt format (20241 -> 20241)
			idSmt := riwayat.IDSemester

			spp := &SppMhs{
				IDSppMhs:       idSppMhs,
				IDKelasUKT:     nil, // TODO: map kelas UKT
				IDSmt:          idSmt,
				IDRegPd:        npmMapping.IDRegPd,
				TglBayar:       now, // SIMPEDAM doesn't provide exact date
				Nominal:        float64(riwayat.NominalUKT),
				KodePembayaran: "SIMPEDAM",
				FlagBy:         riwayat.KeteranganBayar,
				CreateDate:     now,
				IDCreator:      systemUUID,
				LastUpdate:     now,
				SoftDelete:     0,
				LastSync:       now,
			}

			// Add description
			if riwayat.FlagKeringanan == 1 {
				ket := fmt.Sprintf("Keringanan: %.0f", float64(riwayat.JumlahKeringanan))
				spp.Ket = &ket
			}

			dataList = append(dataList, spp)
			processed++

			// Update progress every 50 records
			if processed%50 == 0 || processed == totalPayments {
				msg := fmt.Sprintf("Memproses %d dari %d record", processed, totalPayments)
				monitorSvc.UpdateProgress(syncID, processed, msg)
			}
		}
	}

	// Bulk upsert
	inserted, updated, err := s.repo.BulkUpsertSppMhs(ctx, dataList)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to upsert data: %v", err)
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}

	duration := time.Since(startTime)
	durationMs := int(duration.Milliseconds())

	result := &SyncResult{
		TotalProcessed: len(dataList),
		TotalInserted:  inserted,
		TotalUpdated:   updated,
		TotalFailed:    len(dataList) - (inserted + updated),
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
		EndpointName:  "SppMhs",
		EndpointKey:   filterKey,
		SyncType:      "batch",
		Status:        status,
		APICode:       "SIMPEDAM",
		TotalRecords:  len(dataList),
		InsertedCount: inserted,
		UpdatedCount:  updated,
		FailedCount:   result.TotalFailed,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	})
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}

	// Complete monitoring
	msg := fmt.Sprintf("Selesai! Total: %d, Inserted: %d, Updated: %d, Mapped: %d, Unmapped: %d",
		len(dataList), inserted, updated, mapped, unmapped)
	monitorSvc.CompleteSync(syncID, msg)

	log.Printf("✅ [Sync SppMhs] Completed in %v", duration)

	// Auto-update id_sms in daftar_ukt based on synced data
	// This updates daftar_ukt records that don't have id_sms yet
	// by matching prodi names from reg_pd via the synced spp_mhs data
	log.Printf("🔄 [Sync SppMhs] Auto-updating id_sms in daftar_ukt...")
	updatedCount, err := s.repo.AutoUpdateDaftarUktIdSms(ctx)
	if err != nil {
		log.Printf("⚠️  [Sync SppMhs] Failed to auto-update daftar_ukt id_sms: %v", err)
	} else if updatedCount > 0 {
		log.Printf("✅ [Sync SppMhs] Auto-updated %d daftar_ukt records with id_sms", updatedCount)
	}

	return result, nil
}
