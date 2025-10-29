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
	numWorkers := 10 // 10 concurrent workers
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

	// Fetch profil
	if rawData, err := s.sisterAPI.GetDosenProfil(idSDM); err == nil {
		var profil SisterProfil
		if err := json.Unmarshal(rawData, &profil); err == nil {
			combined.Profil = &profil
		}
	}

	// Fetch kependudukan
	if rawData, err := s.sisterAPI.GetDosenKependudukan(idSDM); err == nil {
		var kependudukan SisterKependudukan
		if err := json.Unmarshal(rawData, &kependudukan); err == nil {
			combined.Kependudukan = &kependudukan
		}
	}

	// Fetch keluarga
	if rawData, err := s.sisterAPI.GetDosenKeluarga(idSDM); err == nil {
		var keluarga SisterKeluarga
		if err := json.Unmarshal(rawData, &keluarga); err == nil {
			combined.Keluarga = &keluarga
		}
	}

	// Fetch alamat
	if rawData, err := s.sisterAPI.GetDosenAlamat(idSDM); err == nil {
		var alamat SisterAlamat
		if err := json.Unmarshal(rawData, &alamat); err == nil {
			combined.Alamat = &alamat
		}
	}

	// Fetch kepegawaian
	if rawData, err := s.sisterAPI.GetDosenKepegawaian(idSDM); err == nil {
		var kepegawaian SisterKepegawaian
		if err := json.Unmarshal(rawData, &kepegawaian); err == nil {
			combined.Kepegawaian = &kepegawaian
		}
	}

	// Fetch lain
	if rawData, err := s.sisterAPI.GetDosenLain(idSDM); err == nil {
		var lain SisterLain
		if err := json.Unmarshal(rawData, &lain); err == nil {
			combined.Lain = &lain
		}
	}

	// Note: Profil tidak lagi required - akan gunakan default values
	// Ini memungkinkan sync tetap berjalan meskipun Sister API return error
	// untuk endpoint tertentu

	return combined, nil
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

	// From Profil (required)
	if data.Profil != nil {
		// Override nama only if profil has non-empty value
		if data.Profil.NamaSDM != "" {
			dosen.NamaSDM = data.Profil.NamaSDM
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

		if data.Profil.NIDN != "" {
			dosen.NIDN = &data.Profil.NIDN
		}
		if data.Profil.Telepon != "" {
			dosen.NoTelRumah = &data.Profil.Telepon
		}
		if data.Profil.Handphone != "" {
			dosen.NoHP = &data.Profil.Handphone
		}
		if data.Profil.Email != "" {
			dosen.Email = &data.Profil.Email
		}
	}

	// From Kependudukan
	if data.Kependudukan != nil {
		if data.Kependudukan.NIK != "" {
			dosen.NIK = data.Kependudukan.NIK // Override default
		}

		// Parse ID Agama (Sister API returns as string number)
		if data.Kependudukan.IDAgama != "" {
			if idAgama, err := parseInt(data.Kependudukan.IDAgama); err == nil {
				dosen.IDAgama = idAgama
			}
		}

		// Map kewarganegaraan (Sister API: WNI/WNA -> DB: ID/XX)
		if data.Kependudukan.Kewarganegaraan != "" {
			if data.Kependudukan.Kewarganegaraan == "WNI" {
				dosen.Kewarganegaraan = "ID"
			} else {
				dosen.Kewarganegaraan = "XX" // Foreign national
			}
		}
	}

	// From Keluarga
	if data.Keluarga != nil {
		// Parse id_status_kawin from Sister API response
		// Sister API response contains "id_status_kawin": 1 (for married)
		if data.Keluarga.IDStatusKawin != "" {
			if statKawin, err := parseInt(data.Keluarga.IDStatusKawin); err == nil {
				dosen.StatKawin = &statKawin
			}
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
		if data.Alamat.Jalan != "" {
			dosen.Jalan = &data.Alamat.Jalan
		}

		// Parse RT/RW (Sister API returns as string -> DB: numeric(3))
		if data.Alamat.RT != "" {
			if rt, err := parseInt(data.Alamat.RT); err == nil {
				dosen.RT = &rt
			}
		}
		if data.Alamat.RW != "" {
			if rw, err := parseInt(data.Alamat.RW); err == nil {
				dosen.RW = &rw
			}
		}

		if data.Alamat.Dusun != "" {
			dosen.NamaDusun = &data.Alamat.Dusun
		}
		if data.Alamat.DesaKelurahan != "" {
			dosen.DesaKel = &data.Alamat.DesaKelurahan
		}
		if data.Alamat.KodePos != "" {
			dosen.KodePos = &data.Alamat.KodePos
		}
		if data.Alamat.IDWilayah != "" {
			dosen.IDWilayah = data.Alamat.IDWilayah // Required field, override default
		}
	}

	// From Kepegawaian
	if data.Kepegawaian != nil {
		// Map Jenis SDM name to ID (Sister API returns name like "Dosen", not ID)
		if data.Kepegawaian.JenisSDM != "" {
			mappedID := getJenisSDMID(data.Kepegawaian.JenisSDM)
			dosen.IDJenisSDM = mappedID
			log.Printf("   📝 Mapped jenis_sdm '%s' to ID %d for dosen %s", data.Kepegawaian.JenisSDM, mappedID, data.IDSDM)
		} else if data.Kepegawaian.IDJenisSDM != "" {
			// Fallback: if ID is provided as string number, parse it
			if idJenisSDM, err := parseInt(data.Kepegawaian.IDJenisSDM); err == nil {
				dosen.IDJenisSDM = idJenisSDM
				log.Printf("   📝 Parsed id_jns_sdm '%s' to ID %d for dosen %s", data.Kepegawaian.IDJenisSDM, idJenisSDM, data.IDSDM)
			}
		} else {
			log.Printf("   ⚠️  No jenis_sdm data from Sister API for dosen %s, using default ID %d", data.IDSDM, dosen.IDJenisSDM)
		}

		// Parse ID Status Aktif (Sister API returns as string number -> DB: numeric(2))
		if data.Kepegawaian.IDStatusAktif != "" {
			if idStatusAktif, err := parseInt(data.Kepegawaian.IDStatusAktif); err == nil {
				dosen.IDStatusAktif = idStatusAktif // Override default
			}
		}

		if data.Kepegawaian.NIP != "" {
			dosen.NIP = &data.Kepegawaian.NIP
		}
		if data.Kepegawaian.NUPTK != "" {
			dosen.NUPTK = &data.Kepegawaian.NUPTK
		}
		if data.Kepegawaian.NIPY != "" {
			dosen.NIYIGK = &data.Kepegawaian.NIPY // Sister uses NIPY, DB uses niy_nigk
		}

		// TMT PNS
		if data.Kepegawaian.TanggalMasuk != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalMasuk); err == nil {
				dosen.TMTPNS = &t
			}
		}

		// SK CPNS
		if data.Kepegawaian.NomorSKCPNS != "" {
			dosen.SKCPNS = &data.Kepegawaian.NomorSKCPNS
		}
		if data.Kepegawaian.TanggalSKCPNS != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalSKCPNS); err == nil {
				dosen.TglSKCPNS = &t
			}
		}

		// SK Angkat
		if data.Kepegawaian.NomorSKPengangkatan != "" {
			dosen.SKAngkat = &data.Kepegawaian.NomorSKPengangkatan
		}
		if data.Kepegawaian.TanggalPengangkatan != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalPengangkatan); err == nil {
				dosen.TMTSKAngkat = &t
			}
		}
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
