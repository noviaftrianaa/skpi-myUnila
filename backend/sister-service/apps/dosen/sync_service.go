package dosen

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"sister-service/apps/monitoring"
)

// jenisSDMMapping maps jenis_sdm name to ID based on ref.jenis_sdm table
var jenisSDMMapping = map[string]int{
	"Guru Kelas":                  3,
	"Guru Mapel":                  4,
	"Guru BK":                     5,
	"Guru Inklusi":                6,
	"Pengawas Satuan Pendidikan":  7,
	"Pengawas PLB":                8,
	"Pengawas Metpel":             9,
	"Pengawas Bidang":             10,
	"Tenaga Administrasi Sekolah": 11,
	"Dosen":                       12,
	"Tenaga Kependidikan":         13,
	"Lainnya":                     99,
}

// getJenisSDMID converts jenis_sdm name to ID, returns default 12 (Dosen) if not found
func getJenisSDMID(jenisSDMName string) int {
	if id, ok := jenisSDMMapping[jenisSDMName]; ok {
		return id
	}
	// Default to 12 (Dosen) if not found
	return 12
}

// SyncDosenFromSister performs batch sync of dosen from Sister API using goroutine workers
func (s *service) SyncDosenFromSister(idSP string, syncedBy string) (*BatchDosenSyncResult, error) {
	startTime := time.Now()
	var totalRecords int
	var syncErr error

	log.Printf("🚀 Starting batch dosen sync for id_sp: %s (synced_by: %s)", idSP, syncedBy)

	// Initialize monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Dosen",
		"dosen",
		"full",
		syncedBy,
		0, // Will be updated after we know total count
	)

	// Step 1: Get list of all dosen from Sister API
	log.Printf("📋 Fetching list of dosen from Sister API...")
	rawData, err := s.sisterAPI.GetReferensiSDM(idSP)
	if err != nil {
		syncErr = fmt.Errorf("failed to fetch dosen list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		// Log to database
		s.logSyncResult("Dosen", "dosen", "batch", syncedBy, 0, startTime, syncErr)
		return nil, syncErr
	}

	var dosenList []map[string]interface{}
	if err := json.Unmarshal(rawData, &dosenList); err != nil {
		syncErr = fmt.Errorf("failed to parse dosen list: %w", err)
		monitorSvc.FailSync(syncID, syncErr.Error())
		// Log to database
		s.logSyncResult("Dosen", "dosen", "batch", syncedBy, 0, startTime, syncErr)
		return nil, syncErr
	}

	totalDosen := len(dosenList)
	log.Printf("✅ Found %d dosen to sync", totalDosen)

	// Update monitoring with actual total records
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	monitorSvc.UpdateProgress(syncID, 0, fmt.Sprintf("Found %d dosen to sync", totalDosen))

	if totalDosen == 0 {
		monitorSvc.CompleteSync(syncID, "No dosen to sync")
		// Log to database
		s.logSyncResult("Dosen", "dosen", "batch", syncedBy, 0, startTime, nil)
		return &BatchDosenSyncResult{
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			SyncedBy:       syncedBy,
		}, nil
	}

	// Step 2: Load reference cache for lookups
	log.Printf("📚 Loading reference cache...")
	cache, err := s.repo.GetReferenceCache()
	if err != nil {
		return nil, fmt.Errorf("failed to load reference cache: %w", err)
	}

	// Step 3: Setup goroutine worker pool
	numWorkers := 5 // 5 concurrent workers (balanced between speed and Sister API rate limiting)
	jobs := make(chan map[string]interface{}, totalDosen)
	results := make(chan DosenSyncResult, totalDosen)

	var wg sync.WaitGroup

	// Start workers
	log.Printf("👷 Starting %d workers for parallel processing...", numWorkers)
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.dosenWorker(w, jobs, results, cache, &wg)
	}

	// Send jobs to workers
	for _, dosen := range dosenList {
		jobs <- dosen
	}
	close(jobs)

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
	}()

	// Step 4: Collect results
	var allResults []DosenSyncResult
	successCount := 0
	failedCount := 0

	for result := range results {
		allResults = append(allResults, result)
		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync dosen %s (%s): %s", result.IDSDM, result.Nama, result.Error)
		}

		// Update monitoring progress
		processed := successCount + failedCount
		monitorSvc.UpdateProgress(
			syncID,
			processed,
			fmt.Sprintf("Processing dosen %d/%d (Success: %d, Failed: %d)",
				processed, totalDosen, successCount, failedCount),
		)

		// Log progress every 50 dosen
		if processed%50 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d success, %d failed)",
				processed, totalDosen, successCount, failedCount)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync completed: %d success, %d failed in %s",
		successCount, failedCount, duration)

	totalRecords = successCount

	// Complete monitoring with appropriate status
	if failedCount == 0 {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Dosen sync completed successfully: %d/%d dosen synced", successCount, totalDosen),
		)
		syncErr = nil
	} else if successCount == 0 {
		syncErr = fmt.Errorf("all %d dosen failed to sync", failedCount)
		monitorSvc.FailSync(
			syncID,
			syncErr.Error(),
		)
	} else {
		monitorSvc.CompleteSync(
			syncID,
			fmt.Sprintf("Dosen sync completed with errors: %d success, %d failed", successCount, failedCount),
		)
		syncErr = nil // Partial success is still success
	}

	// Log sync result to database
	s.logSyncResult("Dosen", "dosen", "batch", syncedBy, totalRecords, startTime, syncErr)

	return &BatchDosenSyncResult{
		TotalProcessed: len(allResults),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
	}, nil
}

// dosenWorker processes dosen sync jobs from the jobs channel
func (s *service) dosenWorker(id int, jobs <-chan map[string]interface{}, results chan<- DosenSyncResult, cache *ReferenceCache, wg *sync.WaitGroup) {
	defer wg.Done()

	for dosenInfo := range jobs {
		idSDM, ok := dosenInfo["id_sdm"].(string)
		if !ok {
			results <- DosenSyncResult{
				Success: false,
				Error:   "invalid id_sdm type",
			}
			continue
		}

		// Try both field names from Sister API
		nama, ok := dosenInfo["nama_sdm"].(string)
		if !ok || nama == "" {
			// Fallback to nm_sdm
			nama, _ = dosenInfo["nm_sdm"].(string)
		}

		// Fetch and process single dosen
		result := s.syncSingleDosen(idSDM, nama, cache)
		results <- result

		// Add small delay to avoid rate limiting (200ms per dosen = ~5 dosen/second per worker)
		time.Sleep(200 * time.Millisecond)
	}
}

// syncSingleDosen fetches all data for a single dosen and upserts to database
func (s *service) syncSingleDosen(idSDM string, nama string, cache *ReferenceCache) DosenSyncResult {
	// Fetch data from 6 Sister API endpoints
	combined, err := s.fetchDosenData(idSDM)
	if err != nil {
		return DosenSyncResult{
			IDSDM:   idSDM,
			Nama:    nama,
			Success: false,
			Error:   err.Error(),
		}
	}

	// Transform Sister data to Dosen entity
	dosen, err := s.transformSisterDataToDosen(combined, nama, cache)
	if err != nil {
		return DosenSyncResult{
			IDSDM:   idSDM,
			Nama:    nama,
			Success: false,
			Error:   fmt.Sprintf("transform error: %v", err),
		}
	}

	// Upsert to database
	if err := s.repo.BulkUpsertDosen([]*Dosen{dosen}); err != nil {
		return DosenSyncResult{
			IDSDM:   idSDM,
			Nama:    nama,
			Success: false,
			Error:   fmt.Sprintf("database error: %v", err),
		}
	}

	return DosenSyncResult{
		IDSDM:   idSDM,
		Nama:    nama,
		Success: true,
	}
}

// fetchDosenData fetches all data for a single dosen from 6 Sister API endpoints
func (s *service) fetchDosenData(idSDM string) (*SisterDosenData, error) {
	combined := &SisterDosenData{
		IDSDM: idSDM,
	}

	// Enable detailed logging for specific dosen (for debugging)
	debugMode := idSDM == "f99f738d-a6d4-41b3-b546-2a5acb2c040b"

	if debugMode {
		log.Printf("🔍 [%s] DEBUG MODE: Fetching data from 6 Sister endpoints...", idSDM)
	}

	// Fetch profil
	if rawData, err := s.sisterAPI.GetDosenProfil(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Profil response: %s", idSDM, string(rawData))
		}
		var profil SisterProfil
		if err := json.Unmarshal(rawData, &profil); err == nil {
			combined.Profil = &profil
			if debugMode {
				log.Printf("✅ [%s] Profil parsed: nama=%s, jk=%s, tmpt_lahir=%s, tgl_lahir=%s",
					idSDM, profil.Nama, profil.JenisKelamin, profil.TempatLahir, profil.TanggalLahir)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse profil: %v", idSDM, err)
		}
	} else {
		log.Printf("❌ [%s] Failed to fetch profil: %v", idSDM, err)
	}

	// Fetch kependudukan
	if rawData, err := s.sisterAPI.GetDosenKependudukan(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Kependudukan response: %s", idSDM, string(rawData))
		}
		var kependudukan SisterKependudukan
		if err := json.Unmarshal(rawData, &kependudukan); err == nil {
			combined.Kependudukan = &kependudukan
			if debugMode {
				log.Printf("✅ [%s] Kependudukan parsed: nik=%s, id_agama=%s, kewarganegaraan=%s",
					idSDM, kependudukan.NIK, kependudukan.IDAgama, kependudukan.Kewarganegaraan)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse kependudukan: %v", idSDM, err)
		}
	} else {
		if debugMode {
			log.Printf("❌ [%s] Failed to fetch kependudukan: %v", idSDM, err)
		}
	}

	// Fetch keluarga
	if rawData, err := s.sisterAPI.GetDosenKeluarga(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Keluarga response: %s", idSDM, string(rawData))
		}
		var keluarga SisterKeluarga
		if err := json.Unmarshal(rawData, &keluarga); err == nil {
			combined.Keluarga = &keluarga
			if debugMode {
				log.Printf("✅ [%s] Keluarga parsed: status_kawin=%s, id_status_kawin=%s, nama_pasangan=%s, nip_pasangan=%s",
					idSDM, keluarga.StatusKawin, keluarga.IDStatusKawin, keluarga.NamaPasangan, keluarga.NIPPasangan)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse keluarga: %v", idSDM, err)
		}
	} else {
		if debugMode {
			log.Printf("❌ [%s] Failed to fetch keluarga: %v", idSDM, err)
		}
	}

	// Fetch alamat
	if rawData, err := s.sisterAPI.GetDosenAlamat(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Alamat response: %s", idSDM, string(rawData))
		}
		var alamat SisterAlamat
		if err := json.Unmarshal(rawData, &alamat); err == nil {
			combined.Alamat = &alamat
			if debugMode {
				log.Printf("✅ [%s] Alamat parsed: alamat=%s, rt=%d, rw=%d, dusun=%s, kelurahan=%s, kode_pos=%s, telepon_hp=%s, email=%s",
					idSDM, alamat.Alamat, alamat.RT, alamat.RW, alamat.Dusun, alamat.Kelurahan, alamat.KodePos, alamat.TeleponHP, alamat.Email)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse alamat: %v", idSDM, err)
		}
	} else {
		if debugMode {
			log.Printf("❌ [%s] Failed to fetch alamat: %v", idSDM, err)
		}
	}

	// Fetch kepegawaian
	if rawData, err := s.sisterAPI.GetDosenKepegawaian(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Kepegawaian response: %s", idSDM, string(rawData))
		}
		var kepegawaian SisterKepegawaian
		if err := json.Unmarshal(rawData, &kepegawaian); err == nil {
			combined.Kepegawaian = &kepegawaian
			if debugMode {
				log.Printf("✅ [%s] Kepegawaian parsed: nidn=%s, nip=%s, nuptk=%s, tmmd=%s, sk_cpns=%s, tanggal_sk_cpns=%s",
					idSDM, kepegawaian.NIDN, kepegawaian.NIP, kepegawaian.NUPTK, kepegawaian.TMMD, kepegawaian.SKCPNS, kepegawaian.TanggalSKCPNS)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse kepegawaian: %v", idSDM, err)
		}
	} else {
		if debugMode {
			log.Printf("❌ [%s] Failed to fetch kepegawaian: %v", idSDM, err)
		}
	}

	// Fetch lain
	if rawData, err := s.sisterAPI.GetDosenLain(idSDM); err == nil {
		if debugMode {
			log.Printf("📋 [%s] Lain response: %s", idSDM, string(rawData))
		}
		var lain SisterLain
		if err := json.Unmarshal(rawData, &lain); err == nil {
			combined.Lain = &lain
			if debugMode {
				log.Printf("✅ [%s] Lain parsed: npwp=%s", idSDM, lain.NPWP)
			}
		} else {
			log.Printf("⚠️ [%s] Failed to parse lain: %v", idSDM, err)
		}
	} else {
		if debugMode {
			log.Printf("❌ [%s] Failed to fetch lain: %v", idSDM, err)
		}
	}

	// Note: Profil tidak lagi required - akan gunakan default values
	// Ini memungkinkan sync tetap berjalan meskipun Sister API return error
	// untuk endpoint tertentu

	if debugMode {
		log.Printf("✅ [%s] Completed fetching all endpoints", idSDM)
	}
	return combined, nil
}

// SyncSingleDosenTest syncs a single dosen by ID for testing/debugging
func (s *service) SyncSingleDosenTest(idSDM string) (*DosenSyncResult, error) {
	log.Printf("🧪 [TEST] Starting single dosen sync for ID: %s", idSDM)

	// Load reference cache
	cache, err := s.repo.GetReferenceCache()
	if err != nil {
		return nil, fmt.Errorf("failed to load reference cache: %w", err)
	}

	// Unila ID SP (Satuan Perguruan Tinggi)
	const UNILA_ID_SP = "e2b705a7-173e-464a-9fac-509128709515"

	// Get dosen name from /referensi/sdm endpoint first
	rawData, err := s.sisterAPI.GetReferensiSDM(UNILA_ID_SP)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch SDM list: %w", err)
	}

	// Parse JSON response
	var dosenList []interface{}
	if err := json.Unmarshal(rawData, &dosenList); err != nil {
		return nil, fmt.Errorf("failed to parse SDM list: %w", err)
	}

	var nama string
	for _, dosen := range dosenList {
		dosenMap, ok := dosen.(map[string]interface{})
		if !ok {
			continue
		}

		id, _ := dosenMap["id_sdm"].(string)
		if id == idSDM {
			// Try both field names
			nama, ok = dosenMap["nama_sdm"].(string)
			if !ok || nama == "" {
				nama, _ = dosenMap["nm_sdm"].(string)
			}
			log.Printf("📝 [TEST] Found dosen in SDM list: %s (nama: %s)", idSDM, nama)
			break
		}
	}

	if nama == "" {
		log.Printf("⚠️ [TEST] Dosen not found in SDM list, will use name from profil")
		nama = "Unknown"
	}

	// Perform single dosen sync
	result := s.syncSingleDosen(idSDM, nama, cache)

	log.Printf("🏁 [TEST] Sync completed for %s: success=%v, error=%s", idSDM, result.Success, result.Error)

	return &result, nil
}

// transformSisterDataToDosen transforms combined Sister API data to Dosen entity for pdrd.sdm
func (s *service) transformSisterDataToDosen(data *SisterDosenData, namaFromSDMList string, cache *ReferenceCache) (*Dosen, error) {
	now := time.Now()

	// System UUID for created_by/updated_by (can be configured)
	systemUUID := "00000000-0000-0000-0000-000000000001" // Default system user

	// Default status kawin (0 = Belum Kawin/Tidak Diketahui)
	defaultStatKawin := 0

	// Default tanggal lahir (1970-01-01 jika tidak ada data)
	defaultTglLahir := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)

	dosen := &Dosen{
		IDSDM: data.IDSDM,

		// Required Audit Fields
		CreateDate: now,
		IDCreator:  systemUUID,
		LastUpdate: now,
		SoftDelete: 0, // Active record
		LastSync:   now,

		// Required Foreign Keys with defaults
		IDJenisSDM:            12, // Default: Dosen (ID 12 in ref.jenis_sdm)
		IDWilayah:             "000000", // Default wilayah (akan di-override dari Sister API jika ada)
		IDStatusAktif:         1,  // Default: Aktif (akan di-override dari Sister API jika ada)
		IDAgama:               1,  // Default: Islam (akan di-override dari Sister API jika ada)
		IDPekerjaanSuamiIstri: 99, // Default: Tidak Bekerja/Tidak Ada
		IDLembagaAngkat:       1,  // Default: Universitas Lampung
		StatKawin:             &defaultStatKawin, // Default: Belum Kawin (0

		// Required fields with default values
		Kewarganegaraan: "ID",                            // Default: Indonesia
		NIK:             "0000000000000000",              // Default NIK (20 chars) - will be overridden if available
		NamaSDM:         namaFromSDMList,                 // Use nama from /referensi/sdm as baseline
		JK:              "L",                             // Default: L (Laki-laki) - CHECK constraint only allows L/P
		TempatLahir:     "",                              // Will be set from profil, empty if not available
		TanggalLahir:    &defaultTglLahir,                // Default birthdate - will be overridden
	}

	// From Profil
	if data.Profil != nil {
		// Override nama only if profil has non-empty value (trim spaces)
		if strings.TrimSpace(data.Profil.Nama) != "" {
			dosen.NamaSDM = strings.TrimSpace(data.Profil.Nama)
		}

		// Validate JK - CHECK constraint only allows L or P
		if data.Profil.JenisKelamin == "L" || data.Profil.JenisKelamin == "P" {
			dosen.JK = data.Profil.JenisKelamin
		}
		// else keep default "L"

		// Only set TempatLahir if not empty
		if data.Profil.TempatLahir != "" {
			dosen.TempatLahir = data.Profil.TempatLahir
		}

		if data.Profil.TanggalLahir != "" {
			if t, err := parseDate(data.Profil.TanggalLahir); err == nil {
				dosen.TanggalLahir = &t
			}
		}
	}

	// From Kependudukan
	if data.Kependudukan != nil {
		if data.Kependudukan.NIK != "" {
			dosen.NIK = data.Kependudukan.NIK // Override default
		}

		// ID Agama from Sister API (int)
		if data.Kependudukan.IDAgama > 0 {
			dosen.IDAgama = data.Kependudukan.IDAgama
		}

		// Map kewarganegaraan (Sister API: "Indonesia"/"other" -> DB: ID/XX)
		if data.Kependudukan.Kewarganegaraan != "" {
			if data.Kependudukan.Kewarganegaraan == "Indonesia" {
				dosen.Kewarganegaraan = "ID"
			} else {
				dosen.Kewarganegaraan = "XX" // Foreign national
			}
		}
	}

	// From Keluarga
	if data.Keluarga != nil {
		// ID Status Kawin from Sister API (int)
		if data.Keluarga.IDStatusKawin > 0 {
			statKawin := data.Keluarga.IDStatusKawin
			dosen.StatKawin = &statKawin
		}

		if data.Keluarga.NamaPasangan != "" {
			dosen.NamaSuamiIstri = &data.Keluarga.NamaPasangan
		}
		if data.Keluarga.NIPPasangan != "" {
			dosen.NIPSuamiIstri = &data.Keluarga.NIPPasangan
		}

		// Note: tgl_nikah tidak ada di pdrd.sdm schema
	}

	// From Alamat
	if data.Alamat != nil {
		// Sister API field: "alamat" (jalan lengkap), DB: jln
		if data.Alamat.Alamat != "" {
			dosen.Jalan = &data.Alamat.Alamat
		}

		// RT/RW from Sister API (int) -> DB: numeric(3)
		if data.Alamat.RT > 0 {
			rt := data.Alamat.RT
			dosen.RT = &rt
		}
		if data.Alamat.RW > 0 {
			rw := data.Alamat.RW
			dosen.RW = &rw
		}

		if data.Alamat.Dusun != "" {
			dosen.NamaDusun = &data.Alamat.Dusun
		}

		// Sister API field: "kelurahan", DB: ds_kel
		if data.Alamat.Kelurahan != "" {
			dosen.DesaKel = &data.Alamat.Kelurahan
		}

		if data.Alamat.KodePos != "" {
			dosen.KodePos = &data.Alamat.KodePos
		}

		// Contact info from Alamat endpoint
		if data.Alamat.TeleponRumah != "" {
			dosen.NoTelRumah = &data.Alamat.TeleponRumah
		}
		if data.Alamat.TeleponHP != "" {
			dosen.NoHP = &data.Alamat.TeleponHP
		}
		if data.Alamat.Email != "" {
			dosen.Email = &data.Alamat.Email
		}

		// Note: IDKotaKabupaten tidak di-map karena tidak ada field terkait di pdrd.sdm
	}

	// From Kepegawaian
	if data.Kepegawaian != nil {
		// Sister API doesn't return jenis_sdm in kepegawaian endpoint
		// Use default (12 = Dosen) yang sudah di-set di awal
		log.Printf("   ⚠️  No jenis_sdm data from Sister API for dosen %s, using default ID %d", data.IDSDM, dosen.IDJenisSDM)

		if data.Kepegawaian.NIDN != "" {
			dosen.NIDN = &data.Kepegawaian.NIDN
		}
		if data.Kepegawaian.NIP != "" {
			dosen.NIP = &data.Kepegawaian.NIP
		}
		if data.Kepegawaian.NUPTK != "" {
			dosen.NUPTK = &data.Kepegawaian.NUPTK
		}

		// TMT (Terhitung Mulai Tanggal) from "tmmd" field
		if data.Kepegawaian.TMMD != "" {
			if t, err := parseDate(data.Kepegawaian.TMMD); err == nil {
				dosen.TMTPNS = &t
			}
		}

		// SK CPNS - Sister API field: "sk_cpns" (not no_sk_cpns)
		if data.Kepegawaian.SKCPNS != "" {
			dosen.SKCPNS = &data.Kepegawaian.SKCPNS
		}
		if data.Kepegawaian.TanggalSKCPNS != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalSKCPNS); err == nil {
				dosen.TglSKCPNS = &t
			}
		}

		// Note: Sister API doesn't return SK Angkat fields (no_sk_pengangkatan, tgl_diangkat)
	}

	// From Lain
	if data.Lain != nil {
		if data.Lain.NPWP != "" {
			dosen.NPWP = &data.Lain.NPWP
			// Set nm_wp sama dengan nama dosen jika tidak ada
			dosen.NmWP = &dosen.NamaSDM
		}
	}

	return dosen, nil
}

// parseInt safely converts string to int
func parseInt(s string) (int, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, fmt.Errorf("empty string")
	}

	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}

// parseDate parses date string from Sister API (format: YYYY-MM-DD or DD-MM-YYYY)
func parseDate(dateStr string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)
	if dateStr == "" || dateStr == "0000-00-00" {
		return time.Time{}, fmt.Errorf("invalid date")
	}

	// Try multiple date formats
	formats := []string{
		"2006-01-02",
		"02-01-2006",
		"2006-01-02 15:04:05",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}
