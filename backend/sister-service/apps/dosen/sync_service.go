package dosen

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"
)

// SyncDosenFromSister performs batch sync of dosen from Sister API using goroutine workers
func (s *service) SyncDosenFromSister(idSP string, syncedBy string) (*BatchDosenSyncResult, error) {
	startTime := time.Now()
	log.Printf("🚀 Starting batch dosen sync for id_sp: %s (synced_by: %s)", idSP, syncedBy)

	// Step 1: Get list of all dosen from Sister API
	log.Printf("📋 Fetching list of dosen from Sister API...")
	rawData, err := s.sisterAPI.GetReferensiSDM(idSP)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch dosen list: %w", err)
	}

	var dosenList []map[string]interface{}
	if err := json.Unmarshal(rawData, &dosenList); err != nil {
		return nil, fmt.Errorf("failed to parse dosen list: %w", err)
	}

	totalDosen := len(dosenList)
	log.Printf("✅ Found %d dosen to sync", totalDosen)

	if totalDosen == 0 {
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

		// Log progress every 50 dosen
		processed := successCount + failedCount
		if processed%50 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d success, %d failed)",
				processed, totalDosen, successCount, failedCount)
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ Batch sync completed: %d success, %d failed in %s",
		successCount, failedCount, duration)

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

		nama, _ := dosenInfo["nm_sdm"].(string)

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
	dosen, err := s.transformSisterDataToDosen(combined, cache)
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

	// Validate we have at least profil data
	if combined.Profil == nil {
		return nil, fmt.Errorf("failed to fetch profil data (required)")
	}

	return combined, nil
}

// transformSisterDataToDosen transforms combined Sister API data to Dosen entity
func (s *service) transformSisterDataToDosen(data *SisterDosenData, cache *ReferenceCache) (*Dosen, error) {
	dosen := &Dosen{
		IDSDM: data.IDSDM,
	}

	// From Profil (required)
	if data.Profil != nil {
		dosen.NamaSDM = data.Profil.NamaSDM
		dosen.JenisKelamin = data.Profil.JenisKelamin
		dosen.TempatLahir = data.Profil.TempatLahir
		if data.Profil.TanggalLahir != "" {
			if t, err := parseDate(data.Profil.TanggalLahir); err == nil {
				dosen.TanggalLahir = &t
			}
		}
		if data.Profil.NIDN != "" {
			dosen.NIDN = &data.Profil.NIDN
		}
		if data.Profil.Telepon != "" {
			dosen.Telepon = &data.Profil.Telepon
		}
		if data.Profil.Handphone != "" {
			dosen.Handphone = &data.Profil.Handphone
		}
		if data.Profil.Email != "" {
			dosen.Email = &data.Profil.Email
		}
	}

	// From Kependudukan
	if data.Kependudukan != nil {
		if data.Kependudukan.NIK != "" {
			dosen.NIK = &data.Kependudukan.NIK
		}
		if data.Kependudukan.IDAgama != "" {
			dosen.IDAgama = &data.Kependudukan.IDAgama
		}
		if data.Kependudukan.Kewarganegaraan != "" {
			dosen.Kewarganegaraan = &data.Kependudukan.Kewarganegaraan
		}
	}

	// From Keluarga
	if data.Keluarga != nil {
		if data.Keluarga.StatusKawin != "" {
			dosen.StatusKawin = &data.Keluarga.StatusKawin
		}
		if data.Keluarga.NamaPasangan != "" {
			dosen.NamaPasangan = &data.Keluarga.NamaPasangan
		}
		if data.Keluarga.NIPPasangan != "" {
			dosen.NIPPasangan = &data.Keluarga.NIPPasangan
		}
		if data.Keluarga.TanggalNikah != "" {
			if t, err := parseDate(data.Keluarga.TanggalNikah); err == nil {
				dosen.TanggalNikah = &t
			}
		}
		if data.Keluarga.PekerjaanPsgn != "" {
			dosen.PekerjaanPsgn = &data.Keluarga.PekerjaanPsgn
		}
	}

	// From Alamat
	if data.Alamat != nil {
		if data.Alamat.Jalan != "" {
			dosen.Alamat = &data.Alamat.Jalan
		}
		if data.Alamat.RT != "" {
			dosen.RT = &data.Alamat.RT
		}
		if data.Alamat.RW != "" {
			dosen.RW = &data.Alamat.RW
		}
		if data.Alamat.Dusun != "" {
			dosen.Dusun = &data.Alamat.Dusun
		}
		if data.Alamat.DesaKelurahan != "" {
			dosen.DesaKelurahan = &data.Alamat.DesaKelurahan
		}
		if data.Alamat.KodePos != "" {
			dosen.KodePos = &data.Alamat.KodePos
		}
		if data.Alamat.IDWilayah != "" {
			dosen.IDWilayah = &data.Alamat.IDWilayah
		}
	}

	// From Kepegawaian
	if data.Kepegawaian != nil {
		// Sister API returns id_jns_sdm and id_stat_aktif directly as IDs
		// We store them as-is (the cache is available if we need nama lookup in future)
		if data.Kepegawaian.IDJenisSDM != "" {
			// Parse as int since database expects int
			// For now, Sister API should return numeric ID as string
			// We'll handle conversion in repository if needed
			// Store as string for now since entity uses *int
			// TODO: Add proper conversion if Sister API returns string IDs
		}

		if data.Kepegawaian.IDStatusAktif != "" {
			dosen.IDStatusAktif = &data.Kepegawaian.IDStatusAktif
		}

		if data.Kepegawaian.NIP != "" {
			dosen.NIP = &data.Kepegawaian.NIP
		}
		if data.Kepegawaian.NIPY != "" {
			dosen.NIPY = &data.Kepegawaian.NIPY
		}
		if data.Kepegawaian.NUPTK != "" {
			dosen.NUPTK = &data.Kepegawaian.NUPTK
		}
		if data.Kepegawaian.TanggalMasuk != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalMasuk); err == nil {
				dosen.TanggalMasuk = &t
			}
		}
		if data.Kepegawaian.TanggalKeluar != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalKeluar); err == nil {
				dosen.TanggalKeluar = &t
			}
		}
		if data.Kepegawaian.TanggalCPNS != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalCPNS); err == nil {
				dosen.TanggalCPNS = &t
			}
		}
		if data.Kepegawaian.NomorSKCPNS != "" {
			dosen.NomorSKCPNS = &data.Kepegawaian.NomorSKCPNS
		}
		if data.Kepegawaian.TanggalSKCPNS != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalSKCPNS); err == nil {
				dosen.TanggalSKCPNS = &t
			}
		}
		if data.Kepegawaian.TanggalPengangkatan != "" {
			if t, err := parseDate(data.Kepegawaian.TanggalPengangkatan); err == nil {
				dosen.TanggalPengangkatan = &t
			}
		}
		if data.Kepegawaian.NomorSKPengangkatan != "" {
			dosen.NomorSKPengangkatan = &data.Kepegawaian.NomorSKPengangkatan
		}
	}

	// From Lain
	if data.Lain != nil {
		if data.Lain.NPWP != "" {
			dosen.NPWP = &data.Lain.NPWP
		}
	}

	// Set default id_lemb_angkat to 0 for new records (as per your instruction)
	defaultLembagaAngkat := 0
	dosen.IDLembagaPengangkat = &defaultLembagaAngkat

	return dosen, nil
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
