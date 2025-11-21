package riwayat_fungsional

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sister-service/external/sister_api"
	"sister-service/pkg/timeutil"
)

// SyncService handles syncing riwayat fungsional from Sister API
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

// SyncRwyFungsionalByIDSDM syncs riwayat fungsional for a single dosen
func (s *SyncService) SyncRwyFungsionalByIDSDM(idSDM string, trigger string) (*SyncResult, error) {
	log.Printf("🔄 [%s] Starting riwayat fungsional sync for id_sdm: %s", trigger, idSDM)

	result := &SyncResult{
		IDSDM: idSDM,
	}

	// Step 1: Get list from Sister API
	rawData, err := s.sisterAPI.GetJabatanFungsionalByIDSDM(idSDM)
	if err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to fetch riwayat fungsional list: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	var rwyFungsionalList []SisterJabatanFungsionalListItem
	if err := json.Unmarshal(rawData, &rwyFungsionalList); err != nil {
		result.Failed++
		result.ErrorMessage = fmt.Sprintf("failed to decode response: %v", err)
		log.Printf("❌ %s", result.ErrorMessage)
		return result, fmt.Errorf(result.ErrorMessage)
	}

	log.Printf("📊 Found %d riwayat fungsional records for id_sdm: %s", len(rwyFungsionalList), idSDM)

	if len(rwyFungsionalList) == 0 {
		log.Printf("ℹ️ No riwayat fungsional records found for id_sdm: %s", idSDM)
		return result, nil
	}

	// Step 2: For each riwayat fungsional, get detail and sync
	for i, item := range rwyFungsionalList {
		log.Printf("🔄 Processing riwayat fungsional %d/%d: %s (%s)", i+1, len(rwyFungsionalList), item.JabatanFungsional, item.ID)

		// Get detail from Sister API
		detailData, err := s.sisterAPI.GetJabatanFungsionalDetail(item.ID)
		if err != nil {
			log.Printf("❌ Failed to fetch detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		var detail SisterJabatanFungsionalDetail
		if err := json.Unmarshal(detailData, &detail); err != nil {
			log.Printf("❌ Failed to decode detail for %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		// Sync to database
		if err := s.syncSingleRwyFungsional(idSDM, &item, &detail); err != nil {
			log.Printf("❌ Failed to sync %s: %v", item.ID, err)
			result.Failed++
		} else {
			result.Success++
		}
	}

	log.Printf("✅ Riwayat fungsional sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)
	return result, nil
}

// syncSingleRwyFungsional syncs a single riwayat fungsional record
func (s *SyncService) syncSingleRwyFungsional(idSDM string, item *SisterJabatanFungsionalListItem, detail *SisterJabatanFungsionalDetail) error {
	// Parse dates
	tmtSkJabfung, _ := time.Parse("2006-01-02", detail.TanggalMulai)

	// Map API data to database entity
	rwyFungsional := &RwyFungsional{
		IDRwyJabfung:   item.ID,
		IDSDM:          idSDM,
		IDKelBidang:    nil, // Set to NULL as per requirements (will be populated later if available)
		IDJabfung:      detail.IDJabatanFungsional,
		SkJabfung:      detail.SK,
		TmtSkJabfung:   tmtSkJabfung,
		AngkaKredit:    sql.NullFloat64{Float64: detail.AngkaKredit, Valid: true},
		LebihAjar:      sql.NullFloat64{Float64: detail.KelebihanPengajaran, Valid: true},
		LebihLit:       sql.NullFloat64{Float64: detail.KelebihanPenelitian, Valid: true},
		LebihPengmas:   sql.NullFloat64{Float64: detail.KelebihanPengabdian, Valid: true},
		LebihTunjang:   sql.NullFloat64{Float64: detail.KelebihanPenunjang, Valid: true},
		BidangIlmu:     nil, // Set to NULL as per requirements
	}

	// Save to database
	if err := s.repo.MergeRwyFungsional(rwyFungsional); err != nil {
		return fmt.Errorf("failed to merge rwy_fungsional: %w", err)
	}

	return nil
}

// BatchSyncAllRwyFungsional syncs riwayat fungsional for all active dosen
func (s *SyncService) BatchSyncAllRwyFungsional(trigger string) (*BatchSyncResult, error) {
	log.Printf("🚀 [%s] Starting batch riwayat fungsional sync for all dosen", trigger)

	startTime := timeutil.NowWIB()
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

		syncResult, err := s.SyncRwyFungsionalByIDSDM(idSDM, trigger)
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

	result.EndTime = timeutil.NowWIB()
	result.Duration = result.EndTime.Sub(startTime)

	log.Printf("✅ Batch sync completed - Success: %d, Failed: %d, Duration: %s", result.TotalSuccess, result.TotalFailed, result.Duration)
	return result, nil
}

// ResyncFailedRwyFungsional re-syncs riwayat fungsional for failed dosen
func (s *SyncService) ResyncFailedRwyFungsional(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	log.Printf("🔄 [%s] Re-syncing %d failed dosen", trigger, len(failedIDSDMs))

	startTime := timeutil.NowWIB()
	result := &BatchSyncResult{
		StartTime:  startTime,
		TotalDosen: len(failedIDSDMs),
		Results:    []SyncResult{},
	}

	for i, idSDM := range failedIDSDMs {
		log.Printf("🔄 Re-syncing dosen %d/%d: %s", i+1, result.TotalDosen, idSDM)

		syncResult, err := s.SyncRwyFungsionalByIDSDM(idSDM, trigger)
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

	result.EndTime = timeutil.NowWIB()
	result.Duration = result.EndTime.Sub(startTime)

	return result, nil
}

// ForceRefreshToken forces a token refresh
func (s *SyncService) ForceRefreshToken() error {
	return s.sisterAPI.ForceRefreshToken()
}
