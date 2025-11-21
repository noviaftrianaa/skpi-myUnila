package penelitian

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"sister-service/apps/monitoring"
	"sister-service/pkg/timeutil"

	"github.com/google/uuid"
)

// System UUID for created_by/updated_by
const SYSTEM_UUID = "00000000-0000-0000-0000-000000000001"

// Retry configuration
const (
	MaxRetries     = 3               // Maximum number of retry attempts
	InitialBackoff = 1 * time.Second // Initial backoff duration
	MaxBackoff     = 10 * time.Second // Maximum backoff duration
)

// workerResult represents the result of syncing one dosen
type workerResult struct {
	idSDM   string
	success int
	failed  int
	err     error
}

// SyncPenelitianByIDSDM syncs all penelitian for a dosen from Sister API
func (s *service) SyncPenelitianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting penelitian sync for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Penelitian",
		"penelitian",
		"by_dosen",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get list of penelitian from Sister API
	log.Printf("📋 Fetching list of penelitian from Sister API...")
	rawData, err := s.sisterAPI.GetPenelitianByIDSDM(idSDM)
	if err != nil {
		syncErr := fmt.Errorf("failed to fetch penelitian list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Penelitian", "penelitian", "by_dosen", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	var penelitianList []SisterPenelitianListItem
	if err := json.Unmarshal(rawData, &penelitianList); err != nil {
		syncErr := fmt.Errorf("failed to parse penelitian list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Penelitian", "penelitian", "by_dosen", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	totalPenelitian := len(penelitianList)
	log.Printf("✅ Found %d penelitian to sync", totalPenelitian)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalPenelitian)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d penelitian to sync", totalPenelitian))

	if totalPenelitian == 0 {
		monitorSvc.CompleteSync(syncID, "No penelitian to sync")
		s.logSyncResult("Penelitian", "penelitian", "by_dosen", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchPenelitianSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
		}, nil
	}

	// Step 2: Process each penelitian
	var allResults []PenelitianSyncResult
	successCount := 0
	failedCount := 0

	for idx, penelitian := range penelitianList {
		result := s.syncSinglePenelitian(penelitian.ID, idSDM, "L") // L = Penelitian
		allResults = append(allResults, result)

		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync penelitian %s: %s", penelitian.ID, result.Error)
		}

		// Update monitoring progress
		processed := idx + 1
		monitorSvc.UpdateProgress(
			syncID,
			processed,
			fmt.Sprintf("Processing penelitian %d/%d (Success: %d, Failed: %d)",
				processed, totalPenelitian, successCount, failedCount),
		)

		// Log progress every 10 penelitian
		if processed%10 == 0 {
			log.Printf("📊 Progress: %d/%d penelitian processed (%d success, %d failed)",
				processed, totalPenelitian, successCount, failedCount)
		}

		// Add small delay to avoid rate limiting
		time.Sleep(200 * time.Millisecond)
	}

	duration := time.Since(startTime)
	log.Printf("✅ Penelitian sync completed: %d success, %d failed in %s",
		successCount, failedCount, duration)

	// Complete monitoring
	if failedCount == 0 {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Penelitian sync completed successfully: %d/%d penelitian synced", successCount, totalPenelitian),
		)
	} else if successCount == 0 {
		monitorSvc.FailSync(
			syncID,
			fmt.Sprintf("all %d penelitian failed to sync", failedCount),
		)
	} else {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Penelitian sync completed with errors: %d success, %d failed", successCount, failedCount),
		)
	}

	// Log sync result to database
	var syncErr error
	if successCount == 0 && failedCount > 0 {
		syncErr = fmt.Errorf("all %d penelitian failed to sync", failedCount)
	}
	s.logSyncResult("Penelitian", "penelitian", "by_dosen", syncedBy, totalPenelitian, successCount, failedCount, startTime, syncErr)

	return &BatchPenelitianSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
	}, nil
}

// SyncPengabdianByIDSDM syncs all pengabdian for a dosen from Sister API
func (s *service) SyncPengabdianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting pengabdian sync for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Pengabdian",
		"pengabdian",
		"by_dosen",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get list of pengabdian from Sister API
	log.Printf("📋 Fetching list of pengabdian from Sister API...")
	rawData, err := s.sisterAPI.GetPengabdianByIDSDM(idSDM)
	if err != nil {
		syncErr := fmt.Errorf("failed to fetch pengabdian list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Pengabdian", "pengabdian", "by_dosen", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	var pengabdianList []SisterPenelitianListItem
	if err := json.Unmarshal(rawData, &pengabdianList); err != nil {
		parseErr := fmt.Errorf("failed to parse pengabdian list: %w", err)
		monitorSvc.FailSync(syncID, parseErr.Error())
		s.logSyncResult("Pengabdian", "pengabdian", "by_dosen", syncedBy, 0, 0, 0, startTime, parseErr)
		return nil, parseErr
	}

	totalPengabdian := len(pengabdianList)
	log.Printf("✅ Found %d pengabdian to sync", totalPengabdian)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalPengabdian)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d pengabdian to sync", totalPengabdian))

	if totalPengabdian == 0 {
		log.Printf("✅ No pengabdian found for id_sdm: %s", idSDM)
		monitorSvc.CompleteSync(syncID, "No pengabdian to sync")
		s.logSyncResult("Pengabdian", "pengabdian", "by_dosen", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchPenelitianSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			Results:        []PenelitianSyncResult{},
			SyncedBy:       syncedBy,
		}, nil
	}

	// Step 2: Process each pengabdian
	var allResults []PenelitianSyncResult
	successCount := 0
	failedCount := 0

	for idx, pengabdian := range pengabdianList {
		result := s.syncSinglePenelitian(pengabdian.ID, idSDM, "M") // M = Pengabdian
		allResults = append(allResults, result)

		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync pengabdian %s: %s", pengabdian.ID, result.Error)
		}

		// Update progress every 10 items or on last item
		if (idx+1)%10 == 0 || idx == totalPengabdian-1 {
			monitorSvc.UpdateProgress(syncID, idx+1, fmt.Sprintf("Synced %d/%d pengabdian", idx+1, totalPengabdian))
			log.Printf("📊 Progress: %d/%d pengabdian synced (Success: %d, Failed: %d)",
				idx+1, totalPengabdian, successCount, failedCount)
		}
	}

	duration := time.Since(startTime)

	// Step 3: Log final result
	log.Printf("🏁 Pengabdian sync completed in %s", duration)
	log.Printf("📊 Total: %d | Success: %d | Failed: %d",
		totalPengabdian, successCount, failedCount)

	// Log to database
	var syncErr error
	if failedCount > 0 {
		syncErr = fmt.Errorf("%d out of %d pengabdian failed to sync", failedCount, totalPengabdian)
	}
	s.logSyncResult("Pengabdian", "pengabdian", "by_dosen", syncedBy, totalPengabdian, successCount, failedCount, startTime, syncErr)

	// Complete monitoring
	if failedCount > 0 {
		monitorSvc.FailSync(syncID, fmt.Sprintf("%d/%d pengabdian failed", failedCount, totalPengabdian))
	} else {
		monitorSvc.CompleteSync(syncID, fmt.Sprintf("Successfully synced %d pengabdian", successCount))
	}

	return &BatchPenelitianSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
	}, nil
}

// syncSinglePenelitian fetches detail and syncs a single penelitian
func (s *service) syncSinglePenelitian(idLitabmas string, idSDM string, jnsLitabmas string) PenelitianSyncResult {
	// Load jenis dokumen mapping
	jenisDokumenMap, mapErr := s.repo.GetJenisDokumenMap()
	if mapErr != nil {
		log.Printf("⚠️ Failed to load jenis dokumen mapping: %v (will continue without mapping)", mapErr)
		jenisDokumenMap = make(map[string]int) // Empty map as fallback
	}

	// Fetch detail from Sister API with retry mechanism
	var rawData []byte

	entityName := fmt.Sprintf("penelitian %s", idLitabmas)
	if jnsLitabmas != "L" {
		entityName = fmt.Sprintf("pengabdian %s", idLitabmas)
	}

	// Wrap API call in retry logic
	err := retryWithBackoff(func() error {
		var apiErr error
		if jnsLitabmas == "L" {
			rawData, apiErr = s.sisterAPI.GetPenelitianDetail(idLitabmas)
		} else {
			rawData, apiErr = s.sisterAPI.GetPengabdianDetail(idLitabmas)
		}
		return apiErr
	}, entityName)

	if err != nil {
		return PenelitianSyncResult{
			IDLitabmas: idLitabmas,
			IDSDM:      idSDM,
			Success:    false,
			Error:      fmt.Sprintf("failed to fetch detail after retries: %v", err),
		}
	}

	var detail SisterPenelitianDetail
	if err := json.Unmarshal(rawData, &detail); err != nil {
		return PenelitianSyncResult{
			IDLitabmas: idLitabmas,
			IDSDM:      idSDM,
			Success:    false,
			Error:      fmt.Sprintf("failed to parse detail: %v", err),
		}
	}

	// Transform to Litabmas entity
	litabmas, err := s.transformSisterDataToLitabmas(&detail, jnsLitabmas)
	if err != nil {
		return PenelitianSyncResult{
			IDLitabmas: idLitabmas,
			IDSDM:      idSDM,
			Judul:      detail.Judul,
			Success:    false,
			Error:      fmt.Sprintf("transform error: %v", err),
		}
	}

	// Upsert litabmas
	if err := s.repo.UpsertLitabmas(litabmas); err != nil {
		return PenelitianSyncResult{
			IDLitabmas: idLitabmas,
			IDSDM:      idSDM,
			Judul:      detail.Judul,
			Success:    false,
			Error:      fmt.Sprintf("failed to upsert litabmas: %v", err),
		}
	}

	// Transform and merge anggota SDM (dosen)
	anggotaSDMList := s.transformAnggotaSDM(&detail)
	log.Printf("📋 Found %d dosen anggota from Sister API for %s", len(anggotaSDMList), idLitabmas)
	if err := s.repo.MergeAnggotaSDM(idLitabmas, anggotaSDMList); err != nil {
		log.Printf("⚠️ Failed to merge anggota SDM for %s: %v", idLitabmas, err)
	}

	// Transform and merge anggota PD (mahasiswa)
	anggotaPDList := s.transformAnggotaPD(&detail)
	log.Printf("📋 Found %d mahasiswa anggota from Sister API for %s", len(anggotaPDList), idLitabmas)
	if err := s.repo.MergeAnggotaPD(idLitabmas, anggotaPDList); err != nil {
		log.Printf("⚠️ Failed to merge anggota PD for %s: %v", idLitabmas, err)
	}

	// Transform and sync dokumen
	dokumenList, dokLitabmasList := s.transformDokumen(&detail, jenisDokumenMap)

	// Track successfully inserted dokumen IDs
	successfulDokIDs := make(map[string]bool)

	for _, dok := range dokumenList {
		// Skip if id_jns_dok is NULL
		if dok.IDJnsDok == nil {
			log.Printf("⚠️ Skipping dokumen %s: id_jns_dok is NULL", dok.IDDok)
			continue
		}

		if err := s.repo.UpsertDokumen(dok); err != nil {
			log.Printf("⚠️ Failed to upsert dokumen %s: %v", dok.IDDok, err)
		} else {
			// Mark this dokumen as successfully inserted
			successfulDokIDs[dok.IDDok] = true
		}
	}

	// Only sync relations for successfully inserted dokumen
	validDokLitabmas := make([]*DokLitabmas, 0)
	for _, dokLit := range dokLitabmasList {
		if successfulDokIDs[dokLit.IDDok] {
			validDokLitabmas = append(validDokLitabmas, dokLit)
		}
	}

	if err := s.repo.MergeDokumenLitabmas(idLitabmas, validDokLitabmas); err != nil {
		log.Printf("⚠️ Failed to merge dok_litabmas for %s: %v", idLitabmas, err)
	}

	return PenelitianSyncResult{
		IDLitabmas: idLitabmas,
		IDSDM:      idSDM,
		Judul:      detail.Judul,
		Success:    true,
	}
}

// transformSisterDataToLitabmas transforms Sister API detail to Litabmas entity
func (s *service) transformSisterDataToLitabmas(detail *SisterPenelitianDetail, jnsLitabmas string) (*Litabmas, error) {
	now := timeutil.NowWIB()

	litabmas := &Litabmas{
		IDLitabmas:    detail.ID,
		JudulLitabmas: detail.Judul,
		LamaKegiatan:  detail.LamaKegiatan,
		DanaDikti:     detail.DanaDikti,
		DanaPT:        detail.DanaPerguruanTinggi,
		DanaInstLain:  detail.DanaInstLain,
		StatAktif:     1, // Default aktif
		JnsLitabmas:   jnsLitabmas,
		CreateDate:    now,
		IDCreator:     SYSTEM_UUID,
		LastUpdate:    now,
		SoftDelete:    0,
	}

	// Optional fields
	if detail.TahunPelaksanaanKe > 0 {
		litabmas.ThnLaksKe = &detail.TahunPelaksanaanKe
	}

	if detail.InKind != nil {
		litabmas.InKind = detail.InKind
	}

	if detail.SKPenugasan != nil {
		litabmas.SKTugas = detail.SKPenugasan
	}

	if detail.TanggalSKPenugasan != nil {
		if t, err := parseDate(*detail.TanggalSKPenugasan); err == nil {
			litabmas.TglSKTugas = &t
		}
	}

	if detail.Lokasi != nil {
		litabmas.LokasiKegiatan = detail.Lokasi
	}

	// Foreign keys
	if detail.IDAfiliasi != "" {
		litabmas.IDLembIptek = &detail.IDAfiliasi
	}

	if detail.IDJenisSkim != nil && *detail.IDJenisSkim != "" {
		litabmas.IDSkim = detail.IDJenisSkim
	}

	if detail.TahunUsulan > 0 {
		litabmas.IDThnUsulan = &detail.TahunUsulan
	}

	if detail.TahunKegiatan > 0 {
		litabmas.IDThnKegiatan = &detail.TahunKegiatan
	}

	if detail.TahunPelaksanaan > 0 {
		litabmas.IDThnLaks = &detail.TahunPelaksanaan
	}

	if detail.IDLitabmasSebelumnya != nil && *detail.IDLitabmasSebelumnya != "" {
		litabmas.IDLanjutanLitabmas = detail.IDLitabmasSebelumnya
	}

	if detail.IDKelompokBidang != nil && *detail.IDKelompokBidang != "" {
		litabmas.IDKelBidang = detail.IDKelompokBidang
	}

	// Set last_sync
	litabmas.LastSync = &now

	return litabmas, nil
}

// transformAnggotaSDM transforms Sister API anggota to AnggotaSDMLitabmas entities
func (s *service) transformAnggotaSDM(detail *SisterPenelitianDetail) []*AnggotaSDMLitabmas {
	var result []*AnggotaSDMLitabmas
	now := timeutil.NowWIB()

	for _, ang := range detail.Anggota {
		// Only process if jenis is "Dosen" and has id_sdm
		if ang.Jenis != "Dosen" {
			continue
		}

		if ang.IDSDM == nil || *ang.IDSDM == "" {
			log.Printf("⚠️ Skipping dosen anggota with empty id_sdm")
			continue
		}

		// Map peran: "Ketua" -> 'K', "Anggota" -> 'A'
		peran := "A" // Default
		if strings.Contains(strings.ToLower(ang.Peran), "ketua") {
			peran = "K"
		}

		// Convert stat_aktif bool to int
		statAktif := 0
		if ang.StatAktif {
			statAktif = 1
		}

		anggota := &AnggotaSDMLitabmas{
			IDLitabmas:    detail.ID,
			IDSDM:         *ang.IDSDM,
			IDKatgiat:     detail.IDKategoriKegiatan,
			PeranLitabmas: peran,
			StatAktif:     statAktif,
			CreateDate:    now,
			IDCreator:     SYSTEM_UUID,
			LastUpdate:    now,
			SoftDelete:    0,
			LastSync:      &now,
		}

		result = append(result, anggota)
	}

	return result
}

// transformAnggotaPD transforms Sister API anggota to AnggotaPDLitabmas entities
func (s *service) transformAnggotaPD(detail *SisterPenelitianDetail) []*AnggotaPDLitabmas {
	var result []*AnggotaPDLitabmas
	now := timeutil.NowWIB()

	for _, ang := range detail.Anggota {
		// Only process if jenis is "Mahasiswa" or similar
		if ang.Jenis == "Dosen" {
			continue
		}

		// Map peran: "Ketua" -> 'K', "Anggota" -> 'A'
		peran := "A" // Default
		if strings.Contains(strings.ToLower(ang.Peran), "ketua") {
			peran = "K"
		}

		// Convert stat_aktif bool to int
		statAktif := 0
		if ang.StatAktif {
			statAktif = 1
		}

		// Generate UUID for id_pd_ang_litabmas
		idPDAngLitabmas := uuid.New().String()

		anggota := &AnggotaPDLitabmas{
			IDPDAngLitabmas: idPDAngLitabmas,
			IDLitabmas:      detail.ID,
			IDPD:            ang.IDPD,
			PeranLitabmas:   peran,
			StatAktif:       statAktif,
			NmPD:            &ang.Nama,
			NIPD:            ang.NIPD,
			CreateDate:      now,
			IDCreator:       SYSTEM_UUID,
			LastUpdate:      now,
			SoftDelete:      0,
			LastSync:        &now,
		}

		result = append(result, anggota)
	}

	return result
}

// transformDokumen transforms Sister API dokumen to Dokumen and DokLitabmas entities
func (s *service) transformDokumen(detail *SisterPenelitianDetail, jenisDokumenMap map[string]int) ([]*Dokumen, []*DokLitabmas) {
	var dokumenList []*Dokumen
	var dokLitabmasList []*DokLitabmas
	now := timeutil.NowWIB()

	for _, dok := range detail.Dokumen {
		// Map jenis_dokumen string to id_jns_dok
		var idJnsDok *int
		if dok.JenisDokumen != "" {
			// Try exact match first
			if id, ok := jenisDokumenMap[dok.JenisDokumen]; ok {
				idJnsDok = &id
			} else if id, ok := jenisDokumenMap[strings.ToLower(dok.JenisDokumen)]; ok {
				// Try lowercase match
				idJnsDok = &id
			} else {
				log.Printf("⚠️ Unknown jenis_dokumen: %s for dokumen %s", dok.JenisDokumen, dok.ID)
			}
		}

		// Transform to Dokumen entity
		dokumen := &Dokumen{
			IDDok:      dok.ID,
			IDJnsDok:   idJnsDok,
			NmDok:      &dok.Nama,
			MediaType:  &dok.JenisFile,
			FileName:   &dok.NamaFile,
			URL:        dok.Tautan,
			KetDok:     dok.Keterangan,
			CreateDate: now,
			IDCreator:  SYSTEM_UUID,
			LastUpdate: now,
			SoftDelete: 0,
			LastSync:   &now,
		}

		// Parse tanggal upload
		if dok.TanggalUpload != "" {
			if t, err := parseDateTime(dok.TanggalUpload); err == nil {
				dokumen.WktUnggah = &t
			}
		}

		dokumenList = append(dokumenList, dokumen)

		// Create DokLitabmas relation
		dokLitabmas := &DokLitabmas{
			IDLitabmas: detail.ID,
			IDDok:      dok.ID,
			CreateDate: now,
			IDCreator:  SYSTEM_UUID,
			LastUpdate: now,
			SoftDelete: 0,
			LastSync:   &now,
		}

		dokLitabmasList = append(dokLitabmasList, dokLitabmas)
	}

	return dokumenList, dokLitabmasList
}

// parseDate parses date string from Sister API (format: YYYY-MM-DD)
func parseDate(dateStr string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)
	if dateStr == "" || dateStr == "0000-00-00" {
		return time.Time{}, fmt.Errorf("invalid date")
	}

	// Try multiple date formats
	formats := []string{
		"2006-01-02",
		"02-01-2006",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

// parseDateTime parses datetime string from Sister API (format: YYYY-MM-DD HH:MM:SS)
func parseDateTime(dateTimeStr string) (time.Time, error) {
	dateTimeStr = strings.TrimSpace(dateTimeStr)
	if dateTimeStr == "" {
		return time.Time{}, fmt.Errorf("invalid datetime")
	}

	// Try multiple datetime formats
	formats := []string{
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateTimeStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse datetime: %s", dateTimeStr)
}

// isRetryableError determines if an error is worth retrying
func isRetryableError(err error) bool {
	if err == nil {
		return false
	}

	errMsg := err.Error()

	// Network-related errors that are worth retrying
	retryablePatterns := []string{
		"timeout",
		"connection refused",
		"connection reset",
		"temporary failure",
		"too many requests",
		"rate limit",
		"503",
		"502",
		"504",
		"i/o timeout",
		"EOF",
	}

	for _, pattern := range retryablePatterns {
		if strings.Contains(strings.ToLower(errMsg), pattern) {
			return true
		}
	}

	return false
}

// retryWithBackoff executes a function with exponential backoff retry logic
func retryWithBackoff(operation func() error, entityName string) error {
	var lastErr error

	for attempt := 0; attempt <= MaxRetries; attempt++ {
		if attempt > 0 {
			// Calculate backoff duration with exponential increase
			backoff := time.Duration(1<<uint(attempt-1)) * InitialBackoff
			if backoff > MaxBackoff {
				backoff = MaxBackoff
			}

			log.Printf("⏳ Retry attempt %d/%d for %s after %v backoff", attempt, MaxRetries, entityName, backoff)
			time.Sleep(backoff)
		}

		err := operation()
		if err == nil {
			if attempt > 0 {
				log.Printf("✅ Retry successful for %s after %d attempts", entityName, attempt)
			}
			return nil
		}

		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err) {
			log.Printf("❌ Non-retryable error for %s: %v", entityName, err)
			return err
		}

		if attempt < MaxRetries {
			log.Printf("⚠️  Retryable error for %s (attempt %d/%d): %v", entityName, attempt+1, MaxRetries, err)
		}
	}

	log.Printf("❌ All retry attempts exhausted for %s: %v", entityName, lastErr)
	return fmt.Errorf("failed after %d retries: %w", MaxRetries, lastErr)
}

// BatchSyncAllPenelitian syncs penelitian for all dosen from Sister API with 3-worker pool
func (s *service) BatchSyncAllPenelitian(syncedBy string) (*BatchAllSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting batch sync all penelitian with 3-worker pool (synced_by: %s)", syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Batch Sync All Penelitian",
		"penelitian",
		"batch",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get all unique id_sdm that have penelitian
	log.Printf("📋 Getting all id_sdm with penelitian...")
	idSDMList, err := s.repo.GetAllIDSDMWithLitabmas("L") // L = Penelitian
	if err != nil {
		syncErr := fmt.Errorf("failed to get id_sdm list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Penelitian", "penelitian", "batch", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	totalDosen := len(idSDMList)
	log.Printf("✅ Found %d dosen with penelitian to sync", totalDosen)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d dosen to sync", totalDosen))

	if totalDosen == 0 {
		monitorSvc.CompleteSync(syncID, "No dosen with penelitian to sync")
		s.logSyncResult("Penelitian", "penelitian", "batch", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchAllSyncResult{
			TotalDosen:    0,
			TotalSuccess:  0,
			TotalFailed:   0,
			TotalLitabmas: 0,
			Duration:      time.Since(startTime).String(),
			SyncedBy:      syncedBy,
		}, nil
	}

	// Step 2: Setup worker pool with 3 goroutines
	numWorkers := 3
	jobs := make(chan string, numWorkers*2)
	results := make(chan workerResult, numWorkers*2)

	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.penelitianWorker(w, jobs, results, syncedBy, &wg)
	}

	// Step 3: Feed id_sdm to workers
	go func() {
		for _, idSDM := range idSDMList {
			jobs <- idSDM
		}
		close(jobs)
		log.Printf("✅ All id_sdm sent to workers")
	}()

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect all results
	successCount := 0
	failedCount := 0
	totalLitabmasSynced := 0
	var failedDosen []string
	dosenProcessed := 0

	for result := range results {
		dosenProcessed++
		if result.err != nil {
			failedCount++
			failedDosen = append(failedDosen, result.idSDM)
		} else {
			successCount++
			totalLitabmasSynced += result.success
		}

		// Progress logging every 10 dosen
		if dosenProcessed%10 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d success, %d failed, %d total penelitian)",
				dosenProcessed, totalDosen, successCount, failedCount, totalLitabmasSynced)
		}

		// Update monitoring progress
		monitorSvc.UpdateProgress(
			syncID,
			dosenProcessed,
			fmt.Sprintf("Processing dosen %d/%d (Success: %d, Failed: %d, Total Litabmas: %d)",
				dosenProcessed, totalDosen, successCount, failedCount, totalLitabmasSynced),
		)
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync all penelitian completed: %d/%d dosen success, %d total penelitian in %s",
		successCount, totalDosen, totalLitabmasSynced, duration)

	// Complete monitoring
	if failedCount == 0 {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed successfully: %d dosen, %d penelitian synced", successCount, totalLitabmasSynced),
		)
	} else if successCount == 0 {
		monitorSvc.FailSync(
			syncID,
			fmt.Sprintf("all %d dosen failed to sync", failedCount),
		)
	} else {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed with errors: %d success, %d failed, %d penelitian synced", successCount, failedCount, totalLitabmasSynced),
		)
	}

	// Log sync result to database
	var syncErr error
	if successCount == 0 && failedCount > 0 {
		syncErr = fmt.Errorf("all %d dosen failed to sync", failedCount)
	}
	s.logSyncResult("Penelitian", "penelitian", "batch", syncedBy, totalDosen, successCount, failedCount, startTime, syncErr)

	return &BatchAllSyncResult{
		TotalDosen:    totalDosen,
		TotalSuccess:  successCount,
		TotalFailed:   failedCount,
		TotalLitabmas: totalLitabmasSynced,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
		FailedDosen:   failedDosen,
	}, nil
}

// penelitianWorker is the worker goroutine that processes penelitian sync for each dosen
func (s *service) penelitianWorker(id int, jobs <-chan string, results chan<- workerResult, syncedBy string, wg *sync.WaitGroup) {
	defer wg.Done()

	for idSDM := range jobs {
		log.Printf("🔧 Worker %d: Syncing penelitian for id_sdm: %s", id, idSDM)

		result, err := s.SyncPenelitianByIDSDM(idSDM, syncedBy)
		if err != nil {
			log.Printf("❌ Worker %d: Failed to sync penelitian for id_sdm %s: %v", id, idSDM, err)
			results <- workerResult{idSDM: idSDM, err: err}
		} else {
			log.Printf("✅ Worker %d: Synced %d penelitian for id_sdm %s", id, result.TotalSuccess, idSDM)
			results <- workerResult{idSDM: idSDM, success: result.TotalSuccess, failed: result.TotalFailed}
		}
	}

	log.Printf("✅ Worker %d: Finished", id)
}

// BatchSyncAllPengabdian syncs pengabdian for all dosen from Sister API with 3-worker pool
func (s *service) BatchSyncAllPengabdian(syncedBy string) (*BatchAllSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting batch sync all pengabdian with 3-worker pool (synced_by: %s)", syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Batch Sync All Pengabdian",
		"pengabdian",
		"batch",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get all unique id_sdm that have pengabdian
	log.Printf("📋 Getting all id_sdm with pengabdian...")
	idSDMList, err := s.repo.GetAllIDSDMWithLitabmas("M") // M = Pengabdian
	if err != nil {
		syncErr := fmt.Errorf("failed to get id_sdm list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Pengabdian", "pengabdian", "batch", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	totalDosen := len(idSDMList)
	log.Printf("✅ Found %d dosen with pengabdian to sync", totalDosen)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d dosen to sync", totalDosen))

	if totalDosen == 0 {
		monitorSvc.CompleteSync(syncID, "No dosen with pengabdian to sync")
		s.logSyncResult("Pengabdian", "pengabdian", "batch", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchAllSyncResult{
			TotalDosen:    0,
			TotalSuccess:  0,
			TotalFailed:   0,
			TotalLitabmas: 0,
			Duration:      time.Since(startTime).String(),
			SyncedBy:      syncedBy,
		}, nil
	}

	// Step 2: Setup worker pool with 3 goroutines
	numWorkers := 3
	jobs := make(chan string, numWorkers*2)
	results := make(chan workerResult, numWorkers*2)

	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.pengabdianWorker(w, jobs, results, syncedBy, &wg)
	}

	// Step 3: Feed id_sdm to workers
	go func() {
		for _, idSDM := range idSDMList {
			jobs <- idSDM
		}
		close(jobs)
		log.Printf("✅ All id_sdm sent to workers")
	}()

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect all results
	successCount := 0
	failedCount := 0
	totalLitabmasSynced := 0
	var failedDosen []string
	dosenProcessed := 0

	for result := range results {
		dosenProcessed++
		if result.err != nil {
			failedCount++
			failedDosen = append(failedDosen, result.idSDM)
		} else {
			successCount++
			totalLitabmasSynced += result.success
		}

		// Progress logging every 10 dosen
		if dosenProcessed%10 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d success, %d failed, %d total pengabdian)",
				dosenProcessed, totalDosen, successCount, failedCount, totalLitabmasSynced)
		}

		// Update monitoring progress
		monitorSvc.UpdateProgress(
			syncID,
			dosenProcessed,
			fmt.Sprintf("Processing dosen %d/%d (Success: %d, Failed: %d, Total Litabmas: %d)",
				dosenProcessed, totalDosen, successCount, failedCount, totalLitabmasSynced),
		)
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync all pengabdian completed: %d/%d dosen success, %d total pengabdian in %s",
		successCount, totalDosen, totalLitabmasSynced, duration)

	// Complete monitoring
	if failedCount == 0 {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed successfully: %d dosen, %d pengabdian synced", successCount, totalLitabmasSynced),
		)
	} else if successCount == 0 {
		monitorSvc.FailSync(
			syncID,
			fmt.Sprintf("all %d dosen failed to sync", failedCount),
		)
	} else {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed with errors: %d success, %d failed, %d pengabdian synced", successCount, failedCount, totalLitabmasSynced),
		)
	}

	// Log sync result to database
	var syncErr error
	if successCount == 0 && failedCount > 0 {
		syncErr = fmt.Errorf("all %d dosen failed to sync", failedCount)
	}
	s.logSyncResult("Pengabdian", "pengabdian", "batch", syncedBy, totalDosen, successCount, failedCount, startTime, syncErr)

	return &BatchAllSyncResult{
		TotalDosen:    totalDosen,
		TotalSuccess:  successCount,
		TotalFailed:   failedCount,
		TotalLitabmas: totalLitabmasSynced,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
		FailedDosen:   failedDosen,
	}, nil
}

// pengabdianWorker is the worker goroutine that processes pengabdian sync for each dosen
func (s *service) pengabdianWorker(id int, jobs <-chan string, results chan<- workerResult, syncedBy string, wg *sync.WaitGroup) {
	defer wg.Done()

	for idSDM := range jobs {
		log.Printf("🔧 Worker %d: Syncing pengabdian for id_sdm: %s", id, idSDM)

		result, err := s.SyncPengabdianByIDSDM(idSDM, syncedBy)
		if err != nil {
			log.Printf("❌ Worker %d: Failed to sync pengabdian for id_sdm %s: %v", id, idSDM, err)
			results <- workerResult{idSDM: idSDM, err: err}
		} else {
			log.Printf("✅ Worker %d: Synced %d pengabdian for id_sdm %s", id, result.TotalSuccess, idSDM)
			results <- workerResult{idSDM: idSDM, success: result.TotalSuccess, failed: result.TotalFailed}
		}
	}

	log.Printf("✅ Worker %d: Finished", id)
}

