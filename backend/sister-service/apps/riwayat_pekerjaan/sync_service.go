package riwayat_pekerjaan

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"sister-service/external/sister_api"
)

// SyncService handles syncing riwayat pekerjaan from Sister API
type SyncService struct {
	repo      Repository
	sisterAPI *sister_api.Client
}

// NewSyncService creates a new SyncService
func NewSyncService(repo Repository, sisterAPI *sister_api.Client) *SyncService {
	return &SyncService{
		repo:      repo,
		sisterAPI: sisterAPI,
	}
}

// SyncResult represents the result of a sync operation
type SyncResult struct {
	IDSDM        string `json:"id_sdm"`
	Success      int    `json:"success"`
	Failed       int    `json:"failed"`
	TotalDokumen int    `json:"total_dokumen"`
	ErrorMessage string `json:"error_message,omitempty"`
}

// BatchSyncResult represents the result of a batch sync
type BatchSyncResult struct {
	TotalDosen   int           `json:"total_dosen"`
	TotalSuccess int           `json:"total_success"`
	TotalFailed  int           `json:"total_failed"`
	Results      []SyncResult  `json:"results"`
	StartTime    time.Time     `json:"start_time"`
	EndTime      time.Time     `json:"end_time"`
	Duration     time.Duration `json:"duration"`
}

// SyncRwyPekerjaanByIDSDM syncs riwayat pekerjaan for a single dosen
func (s *SyncService) SyncRwyPekerjaanByIDSDM(idSDM string, trigger string) (*SyncResult, error) {
	log.Printf("🔄 [%s] Starting riwayat pekerjaan sync for id_sdm: %s", trigger, idSDM)

	result := &SyncResult{
		IDSDM: idSDM,
	}

	// Step 1: Get list from Sister API
	rawData, err := s.sisterAPI.GetRiwayatPekerjaanByIDSDM(idSDM)
	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to fetch riwayat pekerjaan list: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	var rwyPekerjaanList []SisterRiwayatPekerjaanListItem
	if err := json.Unmarshal(rawData, &rwyPekerjaanList); err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to decode response: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	log.Printf("📊 Found %d riwayat pekerjaan records for id_sdm: %s", len(rwyPekerjaanList), idSDM)

	if len(rwyPekerjaanList) == 0 {
		log.Printf("ℹ️ No riwayat pekerjaan records found for id_sdm: %s", idSDM)
		return result, nil
	}

	// Step 2: For each riwayat pekerjaan, get detail and sync
	for i, item := range rwyPekerjaanList {
		log.Printf("🔄 Processing riwayat pekerjaan %d/%d: %s (%s)", i+1, len(rwyPekerjaanList), item.NamaJabatan, item.ID)

		// Get detail from Sister API
		detailData, err := s.sisterAPI.GetRiwayatPekerjaanDetail(item.ID)
		if err != nil {
			log.Printf("❌ Failed to fetch detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		var detail SisterRiwayatPekerjaanDetail
		if err := json.Unmarshal(detailData, &detail); err != nil {
			log.Printf("❌ Failed to decode detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		// Sync to database
		if err := s.syncSingleRwyPekerjaan(idSDM, &item, &detail); err != nil {
			log.Printf("❌ Failed to sync %s: %v", item.ID, err)
			result.Failed++
		} else {
			result.Success++
		}
	}

	log.Printf("✅ Riwayat pekerjaan sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)
	return result, nil
}

// syncSingleRwyPekerjaan syncs a single riwayat pekerjaan record
func (s *SyncService) syncSingleRwyPekerjaan(idSDM string, item *SisterRiwayatPekerjaanListItem, detail *SisterRiwayatPekerjaanDetail) error {
	// Parse dates
	mulaiBekerja, _ := time.Parse("2006-01-02", detail.MulaiBekerja)
	var selesaiBekerja *time.Time
	if detail.SelesaiBekerja != nil {
		t, _ := time.Parse("2006-01-02", *detail.SelesaiBekerja)
		selesaiBekerja = &t
	}

	// Convert LuarNegeri bool to int
	aLuarNegeri := 0
	if detail.LuarNegeri {
		aLuarNegeri = 1
	}

	// Map API data to database entity
	rwyKerja := &RwyPekerjaan{
		IDRwyKerja:     item.ID,
		IDSDM:          idSDM,
		IDDudi:         nil, // Always NULL per requirements
		IDPekerjaan:    detail.IDJenisPekerjaan,
		IDKBLI:         &detail.IDBidangUsaha,
		NmJabatan:      detail.NamaJabatan,
		DeskripsiKerja: detail.DeskripsiKerja,
		Instansi:       &detail.Instansi,
		Divisi:         &detail.Divisi,
		MulaiBekerja:   mulaiBekerja,
		SelesaiBekerja: selesaiBekerja,
		ALuarNegeri:    aLuarNegeri,
	}

	// Save to database
	if err := s.repo.MergeRwyPekerjaan(rwyKerja); err != nil {
		return fmt.Errorf("failed to merge rwy_pekerjaan: %w", err)
	}

	// Sync dokumen
	if len(detail.Dokumen) > 0 {
		if err := s.syncDokumen(item.ID, detail.Dokumen); err != nil {
			log.Printf("⚠️ Failed to sync dokumen for %s: %v", item.ID, err)
		}
	}

	return nil
}

// syncDokumen syncs dokumen for a riwayat pekerjaan
func (s *SyncService) syncDokumen(idRwyKerja string, dokumenList []SisterDokumenRwyKerja) error {
	// Get jenis dokumen mapping
	jenisDokMap, err := s.repo.GetJenisDokumenMap()
	if err != nil {
		return fmt.Errorf("failed to get jenis dokumen map: %w", err)
	}

	// Collect active dokumen IDs
	activeDokIDs := make([]string, 0, len(dokumenList))
	for _, dok := range dokumenList {
		activeDokIDs = append(activeDokIDs, dok.ID)
	}

	// Soft delete dokumen not in the active list
	if err := s.repo.SoftDeleteDokumenNotInList(idRwyKerja, activeDokIDs); err != nil {
		return fmt.Errorf("failed to soft delete inactive dokumen: %w", err)
	}

	// Insert/update dokumen from API
	for _, dok := range dokumenList {
		// Map jenis dokumen name to ID
		idJnsDok := 0
		if jenisDokMap != nil {
			idJnsDok = jenisDokMap[strings.ToLower(dok.JenisDokumen)]
		}

		// Parse tanggal upload
		wktUnggah, _ := time.Parse("2006-01-02 15:04:05", dok.TanggalUpload)

		dokumen := &Dokumen{
			IDDok:    dok.ID,
			IDJnsDok: &idJnsDok,
			NmDok:    &dok.Nama,
			KetDok:   dok.Keterangan,
			WktUnggah: wktUnggah,
			URL:      dok.Tautan,
		}

		if err := s.repo.MergeDokumen(dokumen); err != nil {
			log.Printf("⚠️ Failed to merge dokumen %s: %v", dok.ID, err)
			continue
		}

		// Create junction record
		if err := s.repo.MergeDokRwyPekerjaan(idRwyKerja, dok.ID); err != nil {
			log.Printf("⚠️ Failed to merge dok_rwy_pekerjaan for %s: %v", dok.ID, err)
		}
	}

	return nil
}

// BatchSyncAllRwyPekerjaan syncs riwayat pekerjaan for all active dosen
func (s *SyncService) BatchSyncAllRwyPekerjaan(trigger string) (*BatchSyncResult, error) {
	log.Printf("🚀 [%s] Starting batch riwayat pekerjaan sync for all dosen", trigger)

	startTime := time.Now()
	result := &BatchSyncResult{
		StartTime: startTime,
		Results:   []SyncResult{},
	}

	// Get all active dosen
	idSDMList, err := s.repo.GetAllActiveDosenIDSDM()
	if err != nil {
		return nil, fmt.Errorf("failed to get active dosen: %w", err)
	}

	result.TotalDosen = len(idSDMList)
	log.Printf("📊 Found %d active dosen to sync", result.TotalDosen)

	// Sync each dosen
	for i, idSDM := range idSDMList {
		log.Printf("🔄 Syncing dosen %d/%d: %s", i+1, result.TotalDosen, idSDM)

		syncResult, err := s.SyncRwyPekerjaanByIDSDM(idSDM, trigger)
		if err != nil {
			log.Printf("❌ Failed to sync dosen %s: %v", idSDM, err)
			result.TotalFailed++
		} else {
			result.TotalSuccess++
		}

		if syncResult != nil {
			result.Results = append(result.Results, *syncResult)
		}

		// Add delay between requests to avoid rate limiting
		time.Sleep(500 * time.Millisecond)
	}

	result.EndTime = time.Now()
	result.Duration = result.EndTime.Sub(startTime)

	log.Printf("✅ Batch sync completed - Success: %d, Failed: %d, Duration: %s", result.TotalSuccess, result.TotalFailed, result.Duration)
	return result, nil
}

// ResyncFailedRwyPekerjaan re-syncs riwayat pekerjaan for failed dosen
func (s *SyncService) ResyncFailedRwyPekerjaan(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	log.Printf("🔄 [%s] Re-syncing %d failed dosen", trigger, len(failedIDSDMs))

	startTime := time.Now()
	result := &BatchSyncResult{
		StartTime:  startTime,
		TotalDosen: len(failedIDSDMs),
		Results:    []SyncResult{},
	}

	for i, idSDM := range failedIDSDMs {
		log.Printf("🔄 Re-syncing dosen %d/%d: %s", i+1, result.TotalDosen, idSDM)

		syncResult, err := s.SyncRwyPekerjaanByIDSDM(idSDM, trigger)
		if err != nil {
			result.TotalFailed++
		} else {
			result.TotalSuccess++
		}

		if syncResult != nil {
			result.Results = append(result.Results, *syncResult)
		}

		time.Sleep(500 * time.Millisecond)
	}

	result.EndTime = time.Now()
	result.Duration = result.EndTime.Sub(startTime)

	return result, nil
}

// ForceRefreshToken forces a token refresh
func (s *SyncService) ForceRefreshToken() error {
	return s.sisterAPI.ForceRefreshToken()
}
