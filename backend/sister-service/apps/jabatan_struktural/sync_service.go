package jabatan_struktural

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sister-service/external/sister_api"
)

// SyncService handles syncing jabatan struktural from Sister API
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

// SyncJabatanStrukturalByIDSDM syncs jabatan struktural for a single dosen
func (s *SyncService) SyncJabatanStrukturalByIDSDM(idSDM string, trigger string) (*SyncResult, error) {
	log.Printf("🔄 [%s] Starting jabatan struktural sync for id_sdm: %s", trigger, idSDM)

	result := &SyncResult{
		IDSDM: idSDM,
	}

	// Step 1: Get list from Sister API
	rawData, err := s.sisterAPI.GetJabatanStrukturalByIDSDM(idSDM)
	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to fetch jabatan struktural list: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	var jabatanList []SisterJabatanStruktural
	if err := json.Unmarshal(rawData, &jabatanList); err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to decode response: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	log.Printf("📊 Found %d jabatan struktural records for id_sdm: %s", len(jabatanList), idSDM)

	if len(jabatanList) == 0 {
		log.Printf("ℹ️ No jabatan struktural records found for id_sdm: %s", idSDM)
		return result, nil
	}

	// Step 2: For each jabatan, sync to database
	for i, item := range jabatanList {
		log.Printf("🔄 Processing jabatan struktural %d/%d: %s (%s)", i+1, len(jabatanList), item.Jabatan, item.ID)

		// Sync to database
		if err := s.syncSingleJabatanStruktural(idSDM, &item); err != nil {
			log.Printf("❌ Failed to sync %s: %v", item.ID, err)
			result.Failed++
		} else {
			result.Success++
		}
	}

	log.Printf("✅ Jabatan struktural sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)
	return result, nil
}

// syncSingleJabatanStruktural syncs a single jabatan struktural record
func (s *SyncService) syncSingleJabatanStruktural(idSDM string, item *SisterJabatanStruktural) error {
	// Parse dates
	tmtSKJabStruk, _ := time.Parse("2006-01-02", item.TanggalMulaiJabatan)
	var tstSKJabStruk sql.NullTime
	if item.TanggalSelesaiJabatan != nil && *item.TanggalSelesaiJabatan != "" {
		t, _ := time.Parse("2006-01-02", *item.TanggalSelesaiJabatan)
		tstSKJabStruk = sql.NullTime{Time: t, Valid: true}
	}

	// Map API data to database entity
	rwyStruktural := &RwyStruktural{
		IDRwyJabStruk: item.ID,
		IDSDM:         idSDM,
		IDKatGiat:     sql.NullInt32{Int32: int32(item.IDKategoriKegiatan), Valid: item.IDKategoriKegiatan > 0},
		IDJabTgs:      sql.NullInt64{Int64: int64(item.IDJabatanNegara), Valid: item.IDJabatanNegara > 0},
		SKJabStruk:    sql.NullString{String: item.SKJabatan, Valid: item.SKJabatan != ""},
		TmtSKJabStruk: sql.NullTime{Time: tmtSKJabStruk, Valid: !tmtSKJabStruk.IsZero()},
		TstSKJabStruk: tstSKJabStruk,
		LokasiTugas:   sql.NullString{String: item.Lokasi, Valid: item.Lokasi != ""},
	}

	// Save to database
	if err := s.repo.MergeRwyStruktural(rwyStruktural); err != nil {
		return fmt.Errorf("failed to merge rwy_struktural: %w", err)
	}

	return nil
}

// BatchSyncAllJabatanStruktural syncs jabatan struktural for all active dosen
func (s *SyncService) BatchSyncAllJabatanStruktural(trigger string) (*BatchSyncResult, error) {
	log.Printf("🚀 [%s] Starting batch jabatan struktural sync for all dosen", trigger)

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

		syncResult, err := s.SyncJabatanStrukturalByIDSDM(idSDM, trigger)
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

// ResyncFailedJabatanStruktural re-syncs jabatan struktural for failed dosen
func (s *SyncService) ResyncFailedJabatanStruktural(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	log.Printf("🔄 [%s] Re-syncing %d failed dosen", trigger, len(failedIDSDMs))

	startTime := time.Now()
	result := &BatchSyncResult{
		StartTime:  startTime,
		TotalDosen: len(failedIDSDMs),
		Results:    []SyncResult{},
	}

	for i, idSDM := range failedIDSDMs {
		log.Printf("🔄 Re-syncing dosen %d/%d: %s", i+1, result.TotalDosen, idSDM)

		syncResult, err := s.SyncJabatanStrukturalByIDSDM(idSDM, trigger)
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
