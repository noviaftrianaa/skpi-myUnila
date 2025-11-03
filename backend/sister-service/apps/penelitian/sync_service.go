package penelitian

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"sister-service/apps/monitoring"

	"github.com/google/uuid"
)

// System UUID for created_by/updated_by
const SYSTEM_UUID = "00000000-0000-0000-0000-000000000001"

// Retry configuration
const (
	MaxRetries     = 3              // Maximum number of retry attempts
	InitialBackoff = 1 * time.Second // Initial backoff duration
	MaxBackoff     = 10 * time.Second // Maximum backoff duration
)

// SyncPenelitianByIDSDM syncs all penelitian for a dosen from Sister API
func (s *service) SyncPenelitianByIDSDM(idSDM string, syncedBy string) (*BatchPenelitianSyncResult, error) {
	startTime := time.Now()

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

// syncSinglePenelitian fetches detail and syncs a single penelitian
func (s *service) syncSinglePenelitian(idLitabmas string, idSDM string, jnsLitabmas string) PenelitianSyncResult {
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
	dokumenList, dokLitabmasList := s.transformDokumen(&detail)
	for _, dok := range dokumenList {
		if err := s.repo.UpsertDokumen(dok); err != nil {
			log.Printf("⚠️ Failed to upsert dokumen %s: %v", dok.IDDok, err)
		}
	}
	if err := s.repo.MergeDokumenLitabmas(idLitabmas, dokLitabmasList); err != nil {
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
	now := time.Now()

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
	now := time.Now()

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
	now := time.Now()

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
func (s *service) transformDokumen(detail *SisterPenelitianDetail) ([]*Dokumen, []*DokLitabmas) {
	var dokumenList []*Dokumen
	var dokLitabmasList []*DokLitabmas
	now := time.Now()

	for _, dok := range detail.Dokumen {
		// Transform to Dokumen entity
		dokumen := &Dokumen{
			IDDok:      dok.ID,
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

