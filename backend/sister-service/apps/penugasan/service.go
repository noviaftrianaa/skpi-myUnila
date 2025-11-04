package penugasan

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	// Sync operations
	SyncPenugasanByIDSDM(idSDM string, syncedBy string) (*BatchPenugasanSyncResult, error)
	BatchSyncPenugasan(syncedBy string) (*BatchPenugasanSyncAllResult, error)

	// Query operations
	GetAllPenugasanByIDSDM(idSDM string) ([]Penugasan, error)
	GetPenugasanByIDRegPTK(idRegPTK string) (*Penugasan, error)
	GetPenugasanList(page, limit int, search string) (*PenugasanListResult, error)
	GetPenugasanStats() (*PenugasanStats, error)

	// Utility
	ForceRefreshToken() error
}

type service struct {
	repo          Repository
	sisterAPI     *sister_api.Client
	loggerService appLogger.Service
}

func NewService(repo Repository, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          repo,
		sisterAPI:     sisterAPI,
		loggerService: loggerSvc,
	}
}

// SyncPenugasanByIDSDM syncs all penugasan for a dosen from Sister API
func (s *service) SyncPenugasanByIDSDM(idSDM string, syncedBy string) (*BatchPenugasanSyncResult, error) {
	startTime := time.Now()

	log.Printf("🔄 Starting sync penugasan for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	// Fetch list of penugasan from Sister API
	log.Printf("📋 Fetching list of penugasan from Sister API...")
	rawList, err := s.sisterAPI.GetPenugasanByIDSDM(idSDM)
	if err != nil {
		s.logSyncResult("Penugasan", "penugasan", "by_dosen", syncedBy, 0, 0, 0, startTime, err)
		return nil, fmt.Errorf("failed to fetch penugasan list: %w", err)
	}

	// Parse list response
	var penugasanList []SisterPenugasanListItem
	if err := json.Unmarshal(rawList, &penugasanList); err != nil {
		s.logSyncResult("Penugasan", "penugasan", "by_dosen", syncedBy, 0, 0, 0, startTime, err)
		return nil, fmt.Errorf("failed to parse penugasan list: %w", err)
	}

	totalPenugasan := len(penugasanList)
	log.Printf("✅ Found %d penugasan to sync", totalPenugasan)

	// Process each penugasan
	results := make([]PenugasanSyncResult, 0, totalPenugasan)
	successCount := 0
	failedCount := 0

	for _, item := range penugasanList {
		result := s.processPenugasan(item.ID, idSDM)
		results = append(results, result)

		if result.Success {
			successCount++
		} else {
			failedCount++
			log.Printf("❌ Failed to sync penugasan %s: %s", item.ID, result.Error)
		}
	}

	duration := time.Since(startTime)
	log.Printf("📊 Sync completed: %d success, %d failed, duration: %s", successCount, failedCount, duration)

	// Log the sync result
	var syncErr error
	if failedCount > 0 {
		syncErr = fmt.Errorf("%d of %d penugasan failed to sync", failedCount, totalPenugasan)
	}
	s.logSyncResult("Penugasan", "penugasan", "by_dosen", syncedBy, totalPenugasan, successCount, failedCount, startTime, syncErr)

	return &BatchPenugasanSyncResult{
		TotalProcessed: len(results),
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		Duration:       duration.String(),
		Results:        results,
		SyncedBy:       syncedBy,
	}, nil
}

// processPenugasan processes a single penugasan sync (without individual logging)
func (s *service) processPenugasan(idRegPTK string, idSDM string) PenugasanSyncResult {
	// Fetch detail from Sister API
	rawDetail, err := s.sisterAPI.GetPenugasanDetail(idRegPTK)
	if err != nil {
		return PenugasanSyncResult{
			IDRegPTK: idRegPTK,
			IDSDM:    idSDM,
			Success:  false,
			Error:    fmt.Sprintf("failed to fetch detail: %v", err),
		}
	}

	// Parse detail response
	var detail SisterPenugasanDetail
	if err := json.Unmarshal(rawDetail, &detail); err != nil {
		return PenugasanSyncResult{
			IDRegPTK: idRegPTK,
			IDSDM:    idSDM,
			Success:  false,
			Error:    fmt.Sprintf("failed to parse detail: %v", err),
		}
	}

	// Transform to domain entity
	penugasan := s.transformToPenugasan(detail)

	// Upsert to database
	if err := s.repo.UpsertPenugasan(&penugasan); err != nil {
		return PenugasanSyncResult{
			IDRegPTK: idRegPTK,
			IDSDM:    idSDM,
			Success:  false,
			Error:    fmt.Sprintf("failed to upsert penugasan: %v", err),
		}
	}

	// Process keaktifan data
	if err := s.processKeaktifan(idRegPTK, detail.Keaktifan); err != nil {
		return PenugasanSyncResult{
			IDRegPTK: idRegPTK,
			IDSDM:    idSDM,
			Success:  false,
			Error:    fmt.Sprintf("failed to process keaktifan: %v", err),
		}
	}

	return PenugasanSyncResult{
		IDRegPTK: idRegPTK,
		IDSDM:    idSDM,
		Success:  true,
	}
}

// transformToPenugasan transforms Sister API response to domain entity
func (s *service) transformToPenugasan(detail SisterPenugasanDetail) Penugasan {
	now := time.Now()

	// Parse dates
	var tglSrtTgs, tmtSrtTgs, tglPTKKeluar *time.Time

	if detail.TanggalSuratTugas != nil && *detail.TanggalSuratTugas != "" {
		if t, err := time.Parse("2006-01-02", *detail.TanggalSuratTugas); err == nil {
			tglSrtTgs = &t
		}
	}

	if detail.TanggalMulai != "" {
		if t, err := time.Parse("2006-01-02", detail.TanggalMulai); err == nil {
			tmtSrtTgs = &t
		}
	}

	if detail.TanggalKeluar != nil && *detail.TanggalKeluar != "" {
		if t, err := time.Parse("2006-01-02", *detail.TanggalKeluar); err == nil {
			tglPTKKeluar = &t
		}
	}

	// Lookup NIDN from sdm table
	nidn, _ := s.repo.GetNIDNByIDSDM(detail.IDSDM)

	// Validate surat_tugas - handle NULL/empty/undefined
	var noSrtTgs *string
	if detail.SuratTugas != nil && *detail.SuratTugas != "" && *detail.SuratTugas != "null" && *detail.SuratTugas != "undefined" {
		noSrtTgs = detail.SuratTugas
	}

	// Validate id_sms (unit kerja) - handle empty string
	var idSMS *string
	if detail.IDUnitKerja != "" {
		idSMS = &detail.IDUnitKerja
	}

	return Penugasan{
		IDRegPTK:      detail.ID,
		IDSDM:         detail.IDSDM,
		IDSP:          detail.IDPerguruanTinggi,
		IDStatPegawai: detail.IDStatusKepegawaian,
		IDIkatanKerja: detail.IDIkatanKerja,
		IDSMS:         idSMS,
		IDJnsKeluar:   detail.IDJenisKeluar,
		NoSrtTgs:      noSrtTgs,
		TglSrtTgs:     tglSrtTgs,
		TMTSrtTgs:     tmtSrtTgs,
		TglPTKKeluar:  tglPTKKeluar,
		NIDN:          nidn,
		JnsReg:        nil, // Not from API
		CreateDate:    now,
		IDCreator:     "00000000-0000-0000-0000-000000000000", // System UUID for sync
		LastUpdate:    now,
		IDUpdater:     detail.IDUpdater,
		SoftDelete:    0,
		LastSync:      &now,
	}
}

// processKeaktifan processes keaktifan data (DELETE old + INSERT new)
func (s *service) processKeaktifan(idRegPTK string, keaktifanList []SisterPenugasanKeaktifan) error {
	// DELETE existing keaktifan records for this penugasan
	if err := s.repo.DeleteKeaktifanByIDRegPTK(idRegPTK); err != nil {
		return fmt.Errorf("failed to delete existing keaktifan: %w", err)
	}

	// INSERT new keaktifan records
	now := time.Now()
	for _, item := range keaktifanList {
		// Convert apakah_pt_homebase to int (1 or 0)
		homebase := 0
		if item.ApakahPTHomebase == "1" {
			homebase = 1
		}

		keaktifan := KeaktifanPTK{
			IDKeaktifanPTK: uuid.New().String(),
			IDRegPTK:       idRegPTK,
			IDThnAjaran:    item.IDThnAjaran,
			ASPHomebase:    homebase,
			CreateDate:     now,
			IDCreator:      "00000000-0000-0000-0000-000000000000", // System UUID
			LastUpdate:     now,
			IDUpdater:      nil,
			SoftDelete:     0,
			LastSync:       &now,
		}

		if err := s.repo.InsertKeaktifan(&keaktifan); err != nil {
			return fmt.Errorf("failed to insert keaktifan for tahun %s: %w", item.IDThnAjaran, err)
		}
	}

	log.Printf("✅ Processed %d keaktifan records for penugasan %s", len(keaktifanList), idRegPTK)
	return nil
}

// GetAllPenugasanByIDSDM retrieves all penugasan for a dosen
func (s *service) GetAllPenugasanByIDSDM(idSDM string) ([]Penugasan, error) {
	return s.repo.GetAllPenugasanByIDSDM(idSDM)
}

// GetPenugasanByIDRegPTK retrieves a single penugasan by id_reg_ptk
func (s *service) GetPenugasanByIDRegPTK(idRegPTK string) (*Penugasan, error) {
	return s.repo.GetPenugasanByIDRegPTK(idRegPTK)
}

// ForceRefreshToken forces a token refresh for Sister API
func (s *service) ForceRefreshToken() error {
	return s.sisterAPI.ForceRefreshToken()
}

// GetPenugasanList retrieves paginated list of penugasan with search
func (s *service) GetPenugasanList(page, limit int, search string) (*PenugasanListResult, error) {
	return s.repo.GetPenugasanList(page, limit, search)
}

// GetPenugasanStats retrieves penugasan statistics
func (s *service) GetPenugasanStats() (*PenugasanStats, error) {
	return s.repo.GetPenugasanStats()
}

// logSyncResult logs the sync operation to the database
func (s *service) logSyncResult(endpointName, endpointKey, syncType, syncedBy string, totalRecords, successCount, failedCount int, startTime time.Time, err error) {
	duration := time.Since(startTime)

	// Auto-detect sync type based on syncedBy value
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	var errorMessage, errorDetails *string
	status := "success"

	if err != nil {
		status = "failed"
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	durationMs := int(duration.Milliseconds())
	req := &appLogger.CreateSyncLogRequest{
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: successCount,
		UpdatedCount:  0,
		FailedCount:   failedCount,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
		ErrorMessage:  errorMessage,
		ErrorDetails:  errorDetails,
	}

	if status == "failed" && totalRecords == 0 {
		req.FailedCount = 1
		req.InsertedCount = 0
	}

	_, logErr := s.loggerService.LogSync(context.Background(), req)
	if logErr != nil {
		log.Printf("⚠️  Failed to log sync result: %v", logErr)
	}
}
