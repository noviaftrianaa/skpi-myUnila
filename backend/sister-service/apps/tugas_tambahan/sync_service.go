package tugas_tambahan

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"sister-service/external/sister_api"
	"sister-service/pkg/timeutil"
)

// SyncService handles syncing tugas tambahan from Sister API
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

// SyncTugasTambahanByIDSDM syncs tugas tambahan for a single dosen
func (s *SyncService) SyncTugasTambahanByIDSDM(idSDM string, trigger string) (*SyncResult, error) {
	log.Printf("🔄 [%s] Starting tugas tambahan sync for id_sdm: %s", trigger, idSDM)

	result := &SyncResult{
		IDSDM: idSDM,
	}

	// Step 1: Get list from Sister API
	rawData, err := s.sisterAPI.GetTugasTambahanByIDSDM(idSDM)
	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to fetch tugas tambahan list: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	var tugasTambahanList []SisterTugasTambahanListItem
	if err := json.Unmarshal(rawData, &tugasTambahanList); err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to decode response: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	log.Printf("📊 Found %d tugas tambahan records for id_sdm: %s", len(tugasTambahanList), idSDM)

	if len(tugasTambahanList) == 0 {
		log.Printf("ℹ️ No tugas tambahan records found for id_sdm: %s", idSDM)
		return result, nil
	}

	// Step 2: For each tugas tambahan, get detail and sync
	for i, item := range tugasTambahanList {
		log.Printf("🔄 Processing tugas tambahan %d/%d: %s (%s)", i+1, len(tugasTambahanList), item.JenisTugas, item.ID)

		// Get detail from Sister API
		detailData, err := s.sisterAPI.GetTugasTambahanDetail(item.ID)
		if err != nil {
			log.Printf("❌ Failed to fetch detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		var detail SisterTugasTambahanDetail
		if err := json.Unmarshal(detailData, &detail); err != nil {
			log.Printf("❌ Failed to decode detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		// Sync to database
		if err := s.syncSingleTugasTambahan(idSDM, &item, &detail); err != nil {
			log.Printf("❌ Failed to sync %s: %v", item.ID, err)
			result.Failed++
		} else {
			result.Success++
		}
	}

	log.Printf("✅ Tugas tambahan sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)
	return result, nil
}

// syncSingleTugasTambahan syncs a single tugas tambahan record
func (s *SyncService) syncSingleTugasTambahan(idSDM string, item *SisterTugasTambahanListItem, detail *SisterTugasTambahanDetail) error {
	// Parse dates
	tmtSKTambah, _ := time.Parse("2006-01-02", detail.TanggalMulaiTugas)
	var tstSKTambah *time.Time
	if detail.TanggalSelesaiTugas != nil {
		t, _ := time.Parse("2006-01-02", *detail.TanggalSelesaiTugas)
		tstSKTambah = &t
	}

	// Map API data to database entity
	tugasTambahan := &TugasTambahan{
		IDTgsTambah:   item.ID,
		IDSDM:         idSDM,
		IDJabTgs:      detail.IDJenisTugas,
		IDKatGiat:     detail.IDKategoriKegiatan,
		IDSMS:         &detail.IDUnitKerja,
		IDSP:          &detail.IDPerguruanTinggi,
		JmlJam:        detail.JumlahJam,
		SKTugasTambah: detail.SKPenugasan,
		TmtSKTambah:   tmtSKTambah,
		TstSKTambah:   tstSKTambah,
	}

	// Save to database
	if err := s.repo.MergeTugasTambahan(tugasTambahan); err != nil {
		return fmt.Errorf("failed to merge tugas_tambahan: %w", err)
	}

	// Sync dokumen
	if len(detail.Dokumen) > 0 {
		if err := s.syncDokumen(item.ID, detail.Dokumen); err != nil {
			log.Printf("⚠️ Failed to sync dokumen for %s: %v", item.ID, err)
		}
	}

	return nil
}

// syncDokumen syncs dokumen for a tugas tambahan
func (s *SyncService) syncDokumen(idTgsTambah string, dokumenList []SisterDokumenTugTam) error {
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
	if err := s.repo.SoftDeleteDokumenNotInList(idTgsTambah, activeDokIDs); err != nil {
		return fmt.Errorf("failed to soft delete inactive dokumen: %w", err)
	}

	// Insert/update dokumen from API
	for _, dok := range dokumenList {
		// Map jenis dokumen name to ID
		var idJnsDok *int
		if jenisDokMap != nil {
			if id, exists := jenisDokMap[strings.ToLower(dok.JenisDokumen)]; exists {
				idJnsDok = &id
			}
		}

		// Skip dokumen if jenis dokumen cannot be mapped (id_jns_dok is NOT NULL in database)
		if idJnsDok == nil {
			log.Printf("⚠️ Skipping dokumen %s: jenis dokumen '%s' not found in mapping", dok.ID, dok.JenisDokumen)
			continue
		}

		// Parse tanggal upload
		wktUnggah, _ := time.Parse("2006-01-02 15:04:05", dok.TanggalUpload)

		dokumen := &Dokumen{
			IDDok:     dok.ID,
			IDJnsDok:  idJnsDok,
			NmDok:     &dok.Nama,
			KetDok:    dok.Keterangan,
			WktUnggah: wktUnggah,
			URL:       dok.Tautan,
			MediaType: &dok.JenisFile,
			FileName:  &dok.NamaFile,
			IDCreator: idTgsTambah, // Use id_tgs_tambah as creator
		}

		if err := s.repo.MergeDokumen(dokumen); err != nil {
			log.Printf("⚠️ Failed to merge dokumen %s: %v", dok.ID, err)
			continue
		}

		// Link dokumen to tugas tambahan
		if err := s.repo.MergeDokTugTam(idTgsTambah, dok.ID); err != nil {
			log.Printf("⚠️ Failed to link dokumen %s to tugas tambahan %s: %v", dok.ID, idTgsTambah, err)
		}
	}

	return nil
}

// BatchSyncAllTugasTambahan syncs tugas tambahan for all active dosen
func (s *SyncService) BatchSyncAllTugasTambahan(trigger string) (*BatchSyncResult, error) {
	startTime := timeutil.NowWIB()
	log.Printf("🚀 [%s] Starting batch sync for all dosen tugas tambahan", trigger)

	// Get all active dosen
	dosenList, err := s.repo.GetAllActiveDosenIDSDM()
	if err != nil {
		return nil, fmt.Errorf("failed to get active dosen list: %w", err)
	}

	log.Printf("📊 Found %d active dosen to sync", len(dosenList))

	result := &BatchSyncResult{
		TotalDosen: len(dosenList),
		Results:    make([]SyncResult, 0, len(dosenList)),
		StartTime:  startTime,
	}

	// Sync each dosen
	for i, idSDM := range dosenList {
		log.Printf("🔄 Syncing dosen %d/%d: %s", i+1, len(dosenList), idSDM)

		syncResult, err := s.SyncTugasTambahanByIDSDM(idSDM, trigger)
		if err != nil {
			result.TotalFailed++
			if syncResult != nil {
				result.Results = append(result.Results, *syncResult)
			}
		} else {
			if syncResult.Success > 0 {
				result.TotalSuccess++
			}
			if syncResult.Failed > 0 {
				result.TotalFailed++
			}
			result.Results = append(result.Results, *syncResult)
		}

		// Small delay to avoid overwhelming the API
		time.Sleep(100 * time.Millisecond)
	}

	result.EndTime = timeutil.NowWIB()
	result.Duration = result.EndTime.Sub(result.StartTime)

	log.Printf("✅ Batch sync completed - Success: %d, Failed: %d, Duration: %s",
		result.TotalSuccess, result.TotalFailed, result.Duration)

	return result, nil
}