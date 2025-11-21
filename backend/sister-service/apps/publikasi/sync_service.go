package publikasi

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"sister-service/apps/monitoring"
	"sister-service/pkg/timeutil"
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

// SyncPublikasiByIDSDM syncs all publikasi for a dosen from Sister API
func (s *service) SyncPublikasiByIDSDM(idSDM string, syncedBy string) (*BatchPublikasiSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting publikasi sync for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Publikasi",
		"publikasi",
		"by_dosen",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get list of publikasi from Sister API
	log.Printf("📋 Fetching list of publikasi from Sister API...")
	rawData, err := s.sisterAPI.GetPublikasiByIDSDM(idSDM)
	if err != nil {
		syncErr := fmt.Errorf("failed to fetch publikasi list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Publikasi", "publikasi", "by_dosen", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	var publikasiList []SisterPublikasiListItem
	if err := json.Unmarshal(rawData, &publikasiList); err != nil {
		parseErr := fmt.Errorf("failed to parse publikasi list: %w", err)
		monitorSvc.FailSync(syncID, parseErr.Error())
		s.logSyncResult("Publikasi", "publikasi", "by_dosen", syncedBy, 0, 0, 0, startTime, parseErr)
		return nil, parseErr
	}

	totalPublikasi := len(publikasiList)
	log.Printf("✅ Found %d publikasi to sync", totalPublikasi)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalPublikasi)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d publikasi to sync", totalPublikasi))

	if totalPublikasi == 0 {
		log.Printf("✅ No publikasi found for id_sdm: %s", idSDM)
		monitorSvc.CompleteSync(syncID, "No publikasi to sync")
		s.logSyncResult("Publikasi", "publikasi", "by_dosen", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchPublikasiSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			Results:        []PublikasiSyncResult{},
			SyncedBy:       syncedBy,
		}, nil
	}

	// Step 2: Process each publikasi
	var allResults []PublikasiSyncResult
	successCount := 0
	failedCount := 0

	for idx, publikasi := range publikasiList {
		result := s.syncSinglePublikasi(publikasi.ID)
		allResults = append(allResults, result)

		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync publikasi %s: %s", publikasi.ID, result.Error)
		}

		// Update progress every 10 items or on last item
		if (idx+1)%10 == 0 || idx == totalPublikasi-1 {
			monitorSvc.UpdateProgress(syncID, idx+1, fmt.Sprintf("Synced %d/%d publikasi", idx+1, totalPublikasi))
			log.Printf("📊 Progress: %d/%d publikasi synced (Success: %d, Failed: %d)",
				idx+1, totalPublikasi, successCount, failedCount)
		}
	}

	duration := time.Since(startTime)

	// Step 3: Log final result
	log.Printf("🏁 Publikasi sync completed in %s", duration)
	log.Printf("📊 Total: %d | Success: %d | Failed: %d",
		totalPublikasi, successCount, failedCount)

	// Log to database
	var syncErr error
	if failedCount > 0 {
		syncErr = fmt.Errorf("%d out of %d publikasi failed to sync", failedCount, totalPublikasi)
	}
	s.logSyncResult("Publikasi", "publikasi", "by_dosen", syncedBy, totalPublikasi, successCount, failedCount, startTime, syncErr)

	// Complete monitoring
	if failedCount > 0 {
		monitorSvc.FailSync(syncID, fmt.Sprintf("%d/%d publikasi failed", failedCount, totalPublikasi))
	} else {
		monitorSvc.CompleteSync(syncID, fmt.Sprintf("Successfully synced %d publikasi", successCount))
	}

	return &BatchPublikasiSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
	}, nil
}

// syncSinglePublikasi fetches detail and syncs a single publikasi
func (s *service) syncSinglePublikasi(idPublikasi string) PublikasiSyncResult {
	// Fetch detail from Sister API with retry mechanism
	var rawData []byte
	entityName := fmt.Sprintf("publikasi %s", idPublikasi)

	err := s.retryWithBackoff(func() error {
		var fetchErr error
		rawData, fetchErr = s.sisterAPI.GetPublikasiDetail(idPublikasi)
		return fetchErr
	}, entityName)

	if err != nil {
		return PublikasiSyncResult{
			IDPublikasi: idPublikasi,
			Success:     false,
			Error:       fmt.Sprintf("failed to fetch detail: %v", err),
		}
	}

	// Parse detail response
	var detail SisterPublikasiDetail
	if err := json.Unmarshal(rawData, &detail); err != nil {
		return PublikasiSyncResult{
			IDPublikasi: idPublikasi,
			Success:     false,
			Error:       fmt.Sprintf("failed to parse detail: %v", err),
		}
	}

	// Transform and upsert publikasi
	publikasi := s.transformToPublikasi(&detail)
	if err := s.repo.UpsertPublikasi(&publikasi); err != nil {
		return PublikasiSyncResult{
			IDPublikasi: idPublikasi,
			Success:     false,
			Error:       fmt.Sprintf("failed to upsert publikasi: %v", err),
		}
	}

	// Transform and merge tulis_pub (penulis)
	tulisPubList := s.transformTulisPub(&detail)
	log.Printf("📋 Found %d penulis from Sister API for publikasi %s", len(tulisPubList), idPublikasi)
	if err := s.repo.MergeTulisPub(idPublikasi, tulisPubList); err != nil {
		log.Printf("⚠️ Failed to merge tulis_pub for publikasi %s: %v", idPublikasi, err)
	}

	return PublikasiSyncResult{
		IDPublikasi: idPublikasi,
		Judul:       detail.Judul,
		Success:     true,
	}
}

// transformToPublikasi transforms Sister API response to Publikasi entity
func (s *service) transformToPublikasi(detail *SisterPublikasiDetail) Publikasi {
	now := timeutil.NowWIB()

	// Parse tanggal terbit
	var tglTerbit *time.Time
	if detail.Tanggal != nil && *detail.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", *detail.Tanggal); err == nil {
			tglTerbit = &t
		}
	}

	// Map stat_impor_sinta: 1 if asal_data is "SINTA", else 0
	var statImporSinta *int
	if strings.ToUpper(detail.AsalData) == "SINTA" {
		val := 1
		statImporSinta = &val
	} else {
		val := 0
		statImporSinta = &val
	}

	// Handle volume and nomor (0 means NULL)
	var vol, no *int
	if detail.Volume > 0 {
		vol = &detail.Volume
	}
	if detail.Nomor > 0 {
		no = &detail.Nomor
	}

	// Handle jumlah halaman (0 means NULL)
	var jmlHal *int
	if detail.JumlahHalaman > 0 {
		jmlHal = &detail.JumlahHalaman
	}

	// Handle quartile (0 means NULL)
	var quartile *int
	if detail.Quartile > 0 {
		quartile = &detail.Quartile
	}

	// Handle id_kat_capaian (0 means NULL)
	var idKatCapaian *int
	if detail.IDKategoriCapaianLuaran > 0 {
		idKatCapaian = &detail.IDKategoriCapaianLuaran
	}

	// Handle id_jns_pub (NULL if 0)
	var idJnsPub *int
	if detail.IDJenisPublikasi > 0 {
		idJnsPub = &detail.IDJenisPublikasi
	}

	// Handle a_seminar and a_prosiding (convert int to *int)
	aSeminar := &detail.Seminar
	aProsiding := &detail.Prosiding

	return Publikasi{
		IDPublikasi:    detail.ID,
		IDJnsPub:       idJnsPub,
		Judul:          detail.Judul,
		JudulChapter:   detail.JudulArtikel,
		JudulAsli:      detail.JudulAsli,
		NamaJurnal:     detail.NamaJurnal,
		TglTerbit:      tglTerbit,
		Edisi:          detail.Edisi,
		Vol:            vol,
		No:             no,
		Hal:            detail.Halaman,
		JmlHal:         jmlHal,
		Penerbit:       detail.Penerbit,
		ASeminar:       aSeminar,
		AProsiding:     aProsiding,
		NoPaten:        detail.NomorPaten,
		PemberiPaten:   detail.PemberiPaten,
		DOI:            detail.DOI,
		ISBN:           detail.ISBN,
		ISSN:           detail.ISSN,
		EISSN:          detail.EISSN,
		URL:            detail.Tautan,
		Ket:            detail.Keterangan,
		StatImporSinta: statImporSinta,
		Quartile:       quartile,
		IDKatCapaian:   idKatCapaian,
		IDLitabmas:     detail.IDLitabmas,
		CreateDate:     now,
		IDCreator:      SYSTEM_UUID,
		LastUpdate:     now,
		IDUpdater:      nil,
		SoftDelete:     0,
		LastSync:       &now,
	}
}

// transformTulisPub transforms Sister API penulis to TulisPub entities
func (s *service) transformTulisPub(detail *SisterPublikasiDetail) []*TulisPub {
	var result []*TulisPub
	now := timeutil.NowWIB()

	for _, penulis := range detail.Penulis {
		// Map peran_tulis (case-insensitive)
		peranTulis := s.mapPeranTulis(penulis.Peran)

		// Map jns_penulis
		jnsPenulis := s.mapJenisPenulis(penulis.Jenis)

		// Prepare IDs
		var idSDM, idPD, idOrang *string
		if penulis.IDSDM != nil && *penulis.IDSDM != "" {
			idSDM = penulis.IDSDM
		}
		if penulis.IDPesertaDidik != nil && *penulis.IDPesertaDidik != "" {
			idPD = penulis.IDPesertaDidik
		}
		if penulis.IDOrang != nil && *penulis.IDOrang != "" {
			idOrang = penulis.IDOrang
		}

		// Prepare nm_pd and nipd from API response
		var nmPD, nipd *string
		nmPD = &penulis.Nama
		if penulis.NomorIndukPesertaDidik != nil && *penulis.NomorIndukPesertaDidik != "" {
			nipd = penulis.NomorIndukPesertaDidik
		}

		// id_katgiat from parent publikasi
		var idKatgiat *int
		if detail.IDKategoriKegiatan > 0 {
			idKatgiat = &detail.IDKategoriKegiatan
		}

		tulisPub := &TulisPub{
			IDTulisPub:  penulis.IDPenulis,
			IDPublikasi: detail.ID,
			IDSDM:       idSDM,
			IDKatgiat:   idKatgiat,
			IDPD:        idPD,
			IDOrang:     idOrang,
			Urutan:      penulis.Urutan,
			Afiliasi:    penulis.Afiliasi,
			PeranTulis:  peranTulis,
			JnsPenulis:  jnsPenulis,
			ACorrAuthor: penulis.CorrespondingAuthor,
			NmPD:        nmPD,
			NIPD:        nipd,
			IDAfiliasi:  nil, // Not in API
			JnsAfiliasi: nil, // Not in API
			CreateDate:  now,
			IDCreator:   SYSTEM_UUID,
			LastUpdate:  now,
			IDUpdater:   nil,
			SoftDelete:  0,
			LastSync:    &now,
		}

		result = append(result, tulisPub)
	}

	return result
}

// mapPeranTulis maps peran string to peran_tulis char(1)
func (s *service) mapPeranTulis(peran string) string {
	peranLower := strings.ToLower(peran)

	switch {
	case strings.Contains(peranLower, "penulis"):
		return "A"
	case strings.Contains(peranLower, "editor"):
		return "B"
	case strings.Contains(peranLower, "penerjemah"):
		return "C"
	case strings.Contains(peranLower, "penemu") || strings.Contains(peranLower, "inventor"):
		return "D"
	default:
		log.Printf("⚠️ Unknown peran: %s, defaulting to 'A' (Penulis)", peran)
		return "A" // Default to Penulis
	}
}

// mapJenisPenulis maps jenis string to jns_penulis char(1)
func (s *service) mapJenisPenulis(jenis string) string {
	jenisLower := strings.ToLower(jenis)

	switch {
	case strings.Contains(jenisLower, "dosen") || strings.Contains(jenisLower, "guru") || strings.Contains(jenisLower, "tendik"):
		return "1" // Dosen / guru / tendik
	case strings.Contains(jenisLower, "mahasiswa"):
		return "2" // Mahasiswa
	case strings.Contains(jenisLower, "profesional") || strings.Contains(jenisLower, "mitra"):
		return "3" // Profesional mitra
	default:
		log.Printf("⚠️ Unknown jenis penulis: %s, defaulting to '1' (Dosen)", jenis)
		return "1" // Default to Dosen
	}
}

// retryWithBackoff executes a function with exponential backoff retry
func (s *service) retryWithBackoff(fn func() error, entityName string) error {
	backoff := InitialBackoff
	var lastErr error

	for attempt := 0; attempt < MaxRetries; attempt++ {
		err := fn()
		if err == nil {
			return nil
		}

		lastErr = err

		// If this was the last attempt, don't sleep
		if attempt == MaxRetries-1 {
			break
		}

		// Sleep with exponential backoff
		log.Printf("⚠️  Retryable error for %s (attempt %d/%d): %v", entityName, attempt+1, MaxRetries, err)
		time.Sleep(backoff)

		// Double the backoff, but cap at MaxBackoff
		backoff *= 2
		if backoff > MaxBackoff {
			backoff = MaxBackoff
		}
	}

	log.Printf("❌ All retry attempts exhausted for %s: %v", entityName, lastErr)
	return fmt.Errorf("failed after %d retries: %w", MaxRetries, lastErr)
}

// BatchSyncAllPublikasi syncs publikasi for all dosen from Sister API with 3-worker pool
func (s *service) BatchSyncAllPublikasi(syncedBy string) (*BatchAllSyncResult, error) {
	startTime := timeutil.NowWIB()

	log.Printf("🚀 Starting batch sync all publikasi with 3-worker pool (synced_by: %s)", syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Batch Sync All Publikasi",
		"publikasi",
		"batch",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get all unique id_sdm that have publikasi
	log.Printf("📋 Getting all id_sdm with publikasi...")
	idSDMList, err := s.repo.GetAllIDSDMWithPublikasi()
	if err != nil {
		syncErr := fmt.Errorf("failed to get id_sdm list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		s.logSyncResult("Publikasi", "publikasi", "batch", syncedBy, 0, 0, 0, startTime, syncErr)
		return nil, syncErr
	}

	totalDosen := len(idSDMList)
	log.Printf("✅ Found %d dosen with publikasi to sync", totalDosen)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d dosen to sync", totalDosen))

	if totalDosen == 0 {
		monitorSvc.CompleteSync(syncID, "No dosen with publikasi to sync")
		s.logSyncResult("Publikasi", "publikasi", "batch", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchAllSyncResult{
			TotalDosen:     0,
			TotalSuccess:   0,
			TotalFailed:    0,
			TotalPublikasi: 0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
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
		go s.publikasiWorker(w, jobs, results, syncedBy, &wg)
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
	totalPublikasiSynced := 0
	var failedDosen []string
	dosenProcessed := 0

	for result := range results {
		dosenProcessed++
		if result.err != nil {
			failedCount++
			failedDosen = append(failedDosen, result.idSDM)
		} else {
			successCount++
			totalPublikasiSynced += result.success
		}

		// Progress logging every 10 dosen
		if dosenProcessed%10 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d success, %d failed, %d total publikasi)",
				dosenProcessed, totalDosen, successCount, failedCount, totalPublikasiSynced)
		}

		// Update monitoring progress
		monitorSvc.UpdateProgress(
			syncID,
			dosenProcessed,
			fmt.Sprintf("Processing dosen %d/%d (Success: %d, Failed: %d, Total Publikasi: %d)",
				dosenProcessed, totalDosen, successCount, failedCount, totalPublikasiSynced),
		)
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync all publikasi completed: %d/%d dosen success, %d total publikasi in %s",
		successCount, totalDosen, totalPublikasiSynced, duration)

	// Complete monitoring
	if failedCount == 0 {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed successfully: %d dosen, %d publikasi synced", successCount, totalPublikasiSynced),
		)
	} else if successCount == 0 {
		monitorSvc.FailSync(
			syncID,
			fmt.Sprintf("all %d dosen failed to sync", failedCount),
		)
	} else {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Batch sync completed with errors: %d success, %d failed, %d publikasi synced", successCount, failedCount, totalPublikasiSynced),
		)
	}

	// Log sync result to database
	var syncErr error
	if successCount == 0 && failedCount > 0 {
		syncErr = fmt.Errorf("all %d dosen failed to sync", failedCount)
	}
	s.logSyncResult("Publikasi", "publikasi", "batch", syncedBy, totalDosen, successCount, failedCount, startTime, syncErr)

	return &BatchAllSyncResult{
		TotalDosen:     totalDosen,
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		TotalPublikasi: totalPublikasiSynced,
		Duration:       duration.String(),
		SyncedBy:       syncedBy,
		FailedDosen:    failedDosen,
	}, nil
}

// publikasiWorker is the worker goroutine that processes publikasi sync for each dosen
func (s *service) publikasiWorker(id int, jobs <-chan string, results chan<- workerResult, syncedBy string, wg *sync.WaitGroup) {
	defer wg.Done()

	for idSDM := range jobs {
		log.Printf("🔧 Worker %d: Syncing publikasi for id_sdm: %s", id, idSDM)

		result, err := s.SyncPublikasiByIDSDM(idSDM, syncedBy)
		if err != nil {
			log.Printf("❌ Worker %d: Failed to sync publikasi for id_sdm %s: %v", id, idSDM, err)
			results <- workerResult{idSDM: idSDM, err: err}
		} else {
			log.Printf("✅ Worker %d: Synced %d publikasi for id_sdm %s", id, result.TotalSuccess, idSDM)
			results <- workerResult{idSDM: idSDM, success: result.TotalSuccess, failed: result.TotalFailed}
		}
	}

	log.Printf("✅ Worker %d: Finished", id)
}
