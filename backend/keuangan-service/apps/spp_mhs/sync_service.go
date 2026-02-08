package spp_mhs

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
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

// SyncSppMhs syncs SPP Mahasiswa data from SIMPEDAM
// Supports dual API: GetListTagihan (primary) with MasterBiayaMahasiswa fallback
// Uses progressive batch insert and skips already-synced NPMs
func (s *service) SyncSppMhs(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	startTime := timeutil.NowWIB()

	// Resolve filter: normalize id_smt <-> tahun_akd+ganjil_genap
	if err := resolveSyncFilter(filter); err != nil {
		return nil, err
	}

	filterKey := fmt.Sprintf("id_smt=%s", *filter.IDSmt)
	log.Printf("🔄 [Sync SppMhs] Starting sync for %s (tahun_akd=%s, ganjil_genap=%s, force=%v)",
		filterKey, *filter.TahunAkd, *filter.GanjilGenap, filter.ForceSync)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync SPP Mahasiswa",
		filterKey,
		"batch",
		syncedBy,
		0,
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

	// Load npm -> id_reg_pd mappings (only active students, filtered by enrollment year)
	log.Println("📋 [Sync SppMhs] Loading active npm to id_reg_pd mappings...")
	npmMappings, err := s.repo.GetActiveRegPdMappings(ctx, *filter.IDSmt)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to load npm mappings: %v", err)
		monitorSvc.FailSync(syncID, errMsg)
		return nil, fmt.Errorf(errMsg)
	}
	log.Printf("📋 [Sync SppMhs] Loaded %d active npm mappings", len(npmMappings))

	// Try GetListTagihan with progressive insert
	apiMethod := "GetListTagihan"
	inserted, updated, mapped, unmapped, err := s.syncViaGetListTagihanProgressive(ctx, filter, npmMappings, monitorSvc, syncID)
	if err != nil {
		log.Printf("⚠️  [Sync SppMhs] GetListTagihan failed: %v, falling back to MasterBiayaMahasiswa", err)
		apiMethod = "MasterBiayaMahasiswa"

		// Fallback: non-progressive (collect then bulk insert)
		dataList, mapped2, unmapped2, err2 := s.syncViaMasterBiayaMahasiswa(ctx, filter, npmMappings, monitorSvc, syncID)
		if err2 != nil {
			errMsg := fmt.Sprintf("Both APIs failed. MasterBiayaMahasiswa error: %v", err2)
			monitorSvc.FailSync(syncID, errMsg)
			return nil, fmt.Errorf(errMsg)
		}
		mapped = mapped2
		unmapped = unmapped2
		if len(dataList) > 0 {
			inserted, updated, _ = s.repo.BulkUpsertSppMhs(ctx, dataList)
		}
	}

	totalProcessed := inserted + updated
	duration := time.Since(startTime)
	durationMs := int(duration.Milliseconds())

	if totalProcessed == 0 {
		log.Printf("⚠️  [Sync SppMhs] No data found for %s", filterKey)
		monitorSvc.CompleteSync(syncID, "Tidak ada data ditemukan")
		return &SyncResult{
			TotalProcessed: 0,
			Duration:       duration.String(),
			SyncedBy:       syncedBy,
			APIMethod:      apiMethod,
		}, nil
	}

	result := &SyncResult{
		TotalProcessed: totalProcessed,
		TotalInserted:  inserted,
		TotalUpdated:   updated,
		TotalFailed:    0,
		TotalMapped:    mapped,
		TotalUnmapped:  unmapped,
		Duration:       duration.String(),
		SyncedBy:       syncedBy,
		APIMethod:      apiMethod,
	}

	// Log to database
	status := "success"
	_, logErr := s.loggerSvc.LogSync(ctx, &logger.CreateSyncLogRequest{
		EndpointName:  "SppMhs",
		EndpointKey:   filterKey,
		SyncType:      "batch",
		Status:        status,
		APICode:       "SIMPEDAM",
		TotalRecords:  totalProcessed,
		InsertedCount: inserted,
		UpdatedCount:  updated,
		FailedCount:   0,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	})
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}

	// Complete monitoring
	msg := fmt.Sprintf("Selesai via %s! Inserted: %d, Updated: %d, Mapped: %d, Unmapped: %d",
		apiMethod, inserted, updated, mapped, unmapped)
	monitorSvc.CompleteSync(syncID, msg)

	log.Printf("✅ [Sync SppMhs] Completed in %v via %s", duration, apiMethod)

	// Auto-update id_sms in daftar_ukt based on synced data
	log.Printf("🔄 [Sync SppMhs] Auto-updating id_sms in daftar_ukt...")
	updatedCount, err := s.repo.AutoUpdateDaftarUktIdSms(ctx)
	if err != nil {
		log.Printf("⚠️  [Sync SppMhs] Failed to auto-update daftar_ukt id_sms: %v", err)
	} else if updatedCount > 0 {
		log.Printf("✅ [Sync SppMhs] Auto-updated %d daftar_ukt records with id_sms", updatedCount)
	}

	return result, nil
}

// syncViaGetListTagihanProgressive fetches data per NPM and inserts progressively in batches.
// Skips already-synced NPMs unless ForceSync is true.
// Returns (inserted, updated, mapped, unmapped, error).
func (s *service) syncViaGetListTagihanProgressive(
	ctx context.Context,
	filter *SyncFilter,
	npmMappings map[string]*RegPdMapping,
	monitorSvc *monitoring.Service,
	syncID string,
) (int, int, int, int, error) {
	// Single NPM mode: fetch directly (no concurrency needed)
	if filter.NPM != nil && *filter.NPM != "" {
		apiFilter := fmt.Sprintf("npm='%s' and tahun_akd='%s' and ganjil_genap='%s'",
			*filter.NPM, *filter.TahunAkd, *filter.GanjilGenap)
		log.Printf("📤 [Sync SppMhs] GetListTagihan single NPM: %s", apiFilter)

		items, err := s.simpedamAPI.GetListTagihan(apiFilter, "", BATCH_SIZE, 1)
		if err != nil {
			return 0, 0, 0, 0, fmt.Errorf("GetListTagihan failed: %w", err)
		}
		if len(items) == 0 {
			return 0, 0, 0, 0, nil
		}

		dataList, mapped, unmapped, _ := s.transformListTagihanItems(items, filter, npmMappings, monitorSvc, syncID)
		if len(dataList) == 0 {
			return 0, 0, mapped, unmapped, nil
		}
		ins, upd, err := s.repo.BulkUpsertSppMhs(ctx, dataList)
		return ins, upd, mapped, unmapped, err
	}

	// Batch mode: build NPM list
	npms := make([]string, 0, len(npmMappings))
	for npm := range npmMappings {
		npms = append(npms, npm)
	}

	// Skip already-synced NPMs unless force_sync
	if !filter.ForceSync {
		syncedNpms, err := s.repo.GetSyncedNpmsBySemester(ctx, *filter.IDSmt)
		if err == nil && len(syncedNpms) > 0 {
			filtered := make([]string, 0, len(npms)-len(syncedNpms))
			for _, npm := range npms {
				if !syncedNpms[npm] {
					filtered = append(filtered, npm)
				}
			}
			log.Printf("⏩ [Sync SppMhs] Skipping %d already-synced NPMs, %d remaining",
				len(npms)-len(filtered), len(filtered))
			npms = filtered
		}
	}

	if len(npms) == 0 {
		log.Printf("✅ [Sync SppMhs] All NPMs already synced for semester %s", *filter.IDSmt)
		return 0, 0, 0, 0, nil
	}

	log.Printf("📤 [Sync SppMhs] Fetching per NPM from SIMPEDAM (%d students, tahun_akd=%s, ganjil_genap=%s)",
		len(npms), *filter.TahunAkd, *filter.GanjilGenap)

	const maxConcurrent = 10
	const batchInsertThreshold = 200
	sem := make(chan struct{}, maxConcurrent)
	var mu sync.Mutex
	var buffer []simpedam.ListTagihanItem
	var totalInserted, totalUpdated int
	var totalMapped, totalUnmapped int
	var fetchErrors, fetched int

	var wg sync.WaitGroup
	for _, npm := range npms {
		wg.Add(1)
		sem <- struct{}{}
		go func(npm string) {
			defer wg.Done()
			defer func() { <-sem }()

			apiFilter := fmt.Sprintf("npm='%s' and tahun_akd='%s' and ganjil_genap='%s'",
				npm, *filter.TahunAkd, *filter.GanjilGenap)

			items, err := s.simpedamAPI.GetListTagihan(apiFilter, "", BATCH_SIZE, 1)

			mu.Lock()
			defer mu.Unlock()

			fetched++
			if err != nil {
				fetchErrors++
				if fetchErrors <= 10 {
					log.Printf("⚠️  [Sync SppMhs] GetListTagihan NPM=%s failed: %v", npm, err)
				}
				return
			}
			if len(items) > 0 {
				buffer = append(buffer, items...)
			}

			// Progressive batch insert when buffer is large enough
			if len(buffer) >= batchInsertThreshold {
				dataList, m, u, _ := s.transformListTagihanItems(buffer, filter, npmMappings, monitorSvc, syncID)
				totalMapped += m
				totalUnmapped += u
				if len(dataList) > 0 {
					ins, upd, insertErr := s.repo.BulkUpsertSppMhs(ctx, dataList)
					if insertErr != nil {
						log.Printf("⚠️  [Sync SppMhs] Batch insert error: %v", insertErr)
					} else {
						totalInserted += ins
						totalUpdated += upd
						log.Printf("💾 [Sync SppMhs] Progressive batch: +%d inserted, +%d updated (total: %d)",
							ins, upd, totalInserted+totalUpdated)
					}
				}
				buffer = buffer[:0] // clear buffer
			}

			if fetched%500 == 0 || fetched == len(npms) {
				msg := fmt.Sprintf("Mengambil data: %d/%d NPM, %d inserted, %d updated",
					fetched, len(npms), totalInserted, totalUpdated)
				monitorSvc.UpdateProgress(syncID, 0, msg)
				log.Printf("📦 [Sync SppMhs] Progress: %d/%d NPMs, %d ins, %d upd, %d errors",
					fetched, len(npms), totalInserted, totalUpdated, fetchErrors)
			}
		}(npm)
	}

	wg.Wait()

	// Insert remaining buffer
	if len(buffer) > 0 {
		dataList, m, u, _ := s.transformListTagihanItems(buffer, filter, npmMappings, monitorSvc, syncID)
		totalMapped += m
		totalUnmapped += u
		if len(dataList) > 0 {
			ins, upd, err := s.repo.BulkUpsertSppMhs(ctx, dataList)
			if err != nil {
				log.Printf("⚠️  [Sync SppMhs] Final batch insert error: %v", err)
			} else {
				totalInserted += ins
				totalUpdated += upd
			}
		}
	}

	log.Printf("📊 [Sync SppMhs] Fetch complete: %d NPMs, %d inserted, %d updated, %d errors",
		len(npms), totalInserted, totalUpdated, fetchErrors)

	if totalInserted == 0 && totalUpdated == 0 && fetchErrors == len(npms) {
		return 0, 0, 0, 0, fmt.Errorf("all %d API calls failed", fetchErrors)
	}

	return totalInserted, totalUpdated, totalMapped, totalUnmapped, nil
}

// transformListTagihanItems transforms GetListTagihan items to SppMhs records
func (s *service) transformListTagihanItems(
	items []simpedam.ListTagihanItem,
	filter *SyncFilter,
	npmMappings map[string]*RegPdMapping,
	monitorSvc *monitoring.Service,
	syncID string,
) ([]*SppMhs, int, int, error) {
	var dataList []*SppMhs
	mapped, unmapped := 0, 0
	systemUUID, _ := uuid.Parse(SYSTEM_UUID)
	now := timeutil.NowWIB()
	processed := 0

	for _, item := range items {
		npmMapping := npmMappings[item.NPM]
		if npmMapping == nil {
			unmapped++
			if unmapped <= 10 {
				log.Printf("⚠️  [Sync SppMhs] NPM %s not found in reg_pd", item.NPM)
			}
			continue
		}
		mapped++

		idSmt := convertToIdSmt(item.TahunAkd, item.GanjilGenap)
		if idSmt == "" {
			log.Printf("⚠️  [Sync SppMhs] Invalid tahun_akd/ganjil_genap for NPM %s: %s/%s",
				item.NPM, item.TahunAkd, item.GanjilGenap)
			continue
		}

		// Deterministic UUID: npm + id_smt + id_tagihan
		idSppMhs := uuid.NewSHA1(uuid.NameSpaceOID, []byte(item.NPM+"_"+idSmt+"_"+item.IDTagihan))

		flagBy := "BELUM"
		if item.StatusBayar == "Sudah Bayar" || int(item.NominalBayar) > 0 {
			flagBy = "LUNAS"
		}

		spp := &SppMhs{
			IDSppMhs:       idSppMhs,
			IDSmt:          idSmt,
			IDRegPd:        npmMapping.IDRegPd,
			TglBayar:       now,
			Nominal:        float64(item.NominalUKT),
			KodePembayaran: "SIMPEDAM",
			FlagBy:         flagBy,
			CreateDate:     now,
			IDCreator:      systemUUID,
			LastUpdate:     now,
			SoftDelete:     0,
			LastSync:       now,
		}

		if item.BillReference != "" {
			spp.BillRef = &item.BillReference
		}

		ket := fmt.Sprintf("Tagihan: %s, Total: %.0f", item.IDTagihan, float64(item.TotalTagihan))
		spp.Ket = &ket

		dataList = append(dataList, spp)
		processed++

		if processed%50 == 0 || processed == len(items) {
			msg := fmt.Sprintf("Memproses %d dari %d record (GetListTagihan)", processed, len(items))
			monitorSvc.UpdateProgress(syncID, processed, msg)
		}
	}

	return dataList, mapped, unmapped, nil
}

// syncViaMasterBiayaMahasiswa fetches data using MasterBiayaMahasiswa API as fallback
func (s *service) syncViaMasterBiayaMahasiswa(
	ctx context.Context,
	filter *SyncFilter,
	npmMappings map[string]*RegPdMapping,
	monitorSvc *monitoring.Service,
	syncID string,
) ([]*SppMhs, int, int, error) {
	log.Printf("📤 [Sync SppMhs] Using MasterBiayaMahasiswa fallback for semester %s", *filter.IDSmt)

	var allStudents []simpedam.MasterBiayaMahasiswaItem

	if filter.NPM != nil && *filter.NPM != "" {
		// Single student mode
		apiFilter := fmt.Sprintf("npm='%s'", *filter.NPM)
		items, err := s.simpedamAPI.GetMasterBiayaMahasiswa(apiFilter, "", BATCH_SIZE, 0)
		if err != nil {
			return nil, 0, 0, fmt.Errorf("MasterBiayaMahasiswa failed: %w", err)
		}
		allStudents = items
	} else {
		// Batch mode: iterate by tahun_masuk
		targetYear, _ := strconv.Atoi((*filter.IDSmt)[:4])
		totalFetched := 0

		for year := targetYear - 7; year <= targetYear; year++ {
			apiFilter := fmt.Sprintf("tahun_masuk=%d", year)
			log.Printf("📤 [Sync SppMhs] MasterBiayaMahasiswa tahun_masuk=%d ...", year)

			offset := 1
			for {
				items, err := s.simpedamAPI.GetMasterBiayaMahasiswa(apiFilter, "", BATCH_SIZE, offset)
				if err != nil {
					log.Printf("⚠️  [Sync SppMhs] MasterBiayaMahasiswa tahun_masuk=%d offset=%d failed: %v", year, offset, err)
					break
				}
				if len(items) == 0 {
					break
				}
				allStudents = append(allStudents, items...)
				totalFetched += len(items)

				msg := fmt.Sprintf("Mengambil data tahun_masuk=%d, total: %d mahasiswa", year, totalFetched)
				monitorSvc.UpdateProgress(syncID, 0, msg)

				if len(items) < BATCH_SIZE {
					break
				}
				offset += BATCH_SIZE
			}
		}
		log.Printf("📊 [Sync SppMhs] MasterBiayaMahasiswa total students: %d", len(allStudents))
	}

	if len(allStudents) == 0 {
		return nil, 0, 0, nil
	}

	// Transform: filter riwayat by target semester
	return s.transformMasterBiayaItems(allStudents, filter, npmMappings, monitorSvc, syncID)
}

// transformMasterBiayaItems transforms MasterBiayaMahasiswa items to SppMhs records
// Only processes riwayat entries that match the target semester
func (s *service) transformMasterBiayaItems(
	students []simpedam.MasterBiayaMahasiswaItem,
	filter *SyncFilter,
	npmMappings map[string]*RegPdMapping,
	monitorSvc *monitoring.Service,
	syncID string,
) ([]*SppMhs, int, int, error) {
	var dataList []*SppMhs
	mapped, unmapped := 0, 0
	systemUUID, _ := uuid.Parse(SYSTEM_UUID)
	now := timeutil.NowWIB()
	processed := 0
	targetIdSmt := *filter.IDSmt

	for _, student := range students {
		npmMapping := npmMappings[strings.TrimSpace(student.NPM)]
		if npmMapping == nil {
			unmapped++
			if unmapped <= 10 {
				log.Printf("⚠️  [Sync SppMhs] NPM %s not found in reg_pd", student.NPM)
			}
			continue
		}

		// Filter riwayat by target semester
		for _, riwayat := range student.RiwayatBayar {
			riwayatIdSmt := convertToIdSmt(riwayat.TahunAkd, riwayat.GanjilGenap)
			if riwayatIdSmt != targetIdSmt {
				continue
			}

			mapped++

			// Deterministic UUID: npm + id_smt + "mbm"
			npm := strings.TrimSpace(student.NPM)
			idSppMhs := uuid.NewSHA1(uuid.NameSpaceOID, []byte(npm+"_"+riwayatIdSmt+"_mbm"))

			flagBy := "BELUM"
			if int(riwayat.FlagBayar) == 1 {
				flagBy = "LUNAS"
			}

			spp := &SppMhs{
				IDSppMhs:       idSppMhs,
				IDSmt:          riwayatIdSmt,
				IDRegPd:        npmMapping.IDRegPd,
				TglBayar:       now,
				Nominal:        float64(riwayat.NominalUKT),
				KodePembayaran: "SIMPEDAM",
				FlagBy:         flagBy,
				CreateDate:     now,
				IDCreator:      systemUUID,
				LastUpdate:     now,
				SoftDelete:     0,
				LastSync:       now,
			}

			ket := fmt.Sprintf("Total: %.0f, SPI: %.0f, Denda: %.0f",
				float64(riwayat.TotalTagihan), float64(riwayat.JumlahSPI), float64(riwayat.JumlahDenda))
			spp.Ket = &ket

			dataList = append(dataList, spp)
			processed++

			if processed%50 == 0 {
				msg := fmt.Sprintf("Memproses %d record (MasterBiayaMahasiswa)", processed)
				monitorSvc.UpdateProgress(syncID, processed, msg)
			}
		}
	}

	monitorSvc.UpdateTotalRecords(syncID, processed)
	return dataList, mapped, unmapped, nil
}

// resolveSyncFilter normalizes the sync filter
// Priority: id_smt -> compute tahun_akd + ganjil_genap
// Or: tahun_akd + ganjil_genap -> compute id_smt
func resolveSyncFilter(filter *SyncFilter) error {
	// Priority 1: id_smt provided
	if filter.IDSmt != nil && *filter.IDSmt != "" {
		tahunAkd, ganjilGenap, err := convertFromIdSmt(*filter.IDSmt)
		if err != nil {
			return err
		}
		filter.TahunAkd = &tahunAkd
		filter.GanjilGenap = &ganjilGenap
		return nil
	}

	// Priority 2: tahun_akd + ganjil_genap provided
	if filter.TahunAkd != nil && *filter.TahunAkd != "" &&
		filter.GanjilGenap != nil && *filter.GanjilGenap != "" {
		idSmt := convertToIdSmt(*filter.TahunAkd, *filter.GanjilGenap)
		if idSmt == "" {
			return fmt.Errorf("invalid tahun_akd/ganjil_genap: %s/%s", *filter.TahunAkd, *filter.GanjilGenap)
		}
		filter.IDSmt = &idSmt
		return nil
	}

	return fmt.Errorf("id_smt (e.g. '20252') atau tahun_akd + ganjil_genap harus diisi")
}

// convertFromIdSmt converts id_smt to tahun_akd and ganjil_genap
// e.g. "20252" -> tahun_akd="2025/2026", ganjil_genap="2"
func convertFromIdSmt(idSmt string) (string, string, error) {
	if len(idSmt) != 5 {
		return "", "", fmt.Errorf("format id_smt tidak valid: %s (harus 5 karakter, contoh: '20252')", idSmt)
	}

	year := idSmt[:4]
	semester := idSmt[4:5]

	if semester != "1" && semester != "2" {
		return "", "", fmt.Errorf("digit semester tidak valid: %s (harus '1' atau '2')", semester)
	}

	yearInt, err := strconv.Atoi(year)
	if err != nil || yearInt < 2000 || yearInt > 2100 {
		return "", "", fmt.Errorf("tahun tidak valid dalam id_smt: %s", year)
	}

	tahunAkd := fmt.Sprintf("%d/%d", yearInt, yearInt+1)
	return tahunAkd, semester, nil
}

// convertToIdSmt converts tahun_akd and ganjil_genap to id_smt format
// e.g. "2025/2026" + "1" (ganjil) = "20251"
// e.g. "2025/2026" + "2" (genap) = "20252"
func convertToIdSmt(tahunAkd, ganjilGenap string) string {
	if tahunAkd == "" || ganjilGenap == "" {
		return ""
	}

	parts := strings.Split(tahunAkd, "/")
	if len(parts) < 1 {
		return ""
	}

	year := strings.TrimSpace(parts[0])
	if len(year) != 4 {
		return ""
	}

	semester := strings.TrimSpace(ganjilGenap)
	if semester != "1" && semester != "2" {
		return ""
	}

	return year + semester
}
