package akademik

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for akademik business logic
type Service interface {
	// Kelas
	GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)
	SyncKelas(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)

	// Kurikulum
	GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	SyncKurikulum(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)

	// MataKuliah
	GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	SyncMatakuliah(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)

	// Jadwal
	GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)
	SyncJadwal(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)

	// Batch
	SyncAllAkademik(ctx context.Context, idSemester, syncedBy string) ([]*ProdiAkademikSyncResult, error)
}

// SiakaduAPIClient interface
type SiakaduAPIClient interface {
	GetKelas(idSemester, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error)
	GetKurikulum(thnKurikulum int, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error)
	GetMataKuliah(thnKurikulum int, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error)
	GetJadwalKuliah(idSemester, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error)
}

type service struct {
	repo       Repository
	siakaduAPI SiakaduAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

func NewService(repo Repository, siakaduAPI SiakaduAPIClient) Service {
	return &service{
		repo:       repo,
		siakaduAPI: siakaduAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// ========================================
// List Operations
// ========================================

func (s *service) GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	return s.repo.GetKelasList(ctx, page, limit, search, idSemester)
}

func (s *service) GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	return s.repo.GetKurikulumList(ctx, page, limit, search)
}

func (s *service) GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	return s.repo.GetMatakuliahList(ctx, page, limit, search)
}

func (s *service) GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	return s.repo.GetJadwalList(ctx, page, limit, search, idSemester)
}

// ========================================
// Sync Operations
// ========================================

// genericSync is a helper for all sync operations
func (s *service) genericSync(
	ctx context.Context,
	name string,
	endpointKey string,
	filter *SyncFilter,
	syncedBy string,
	fetchFn func(page, pageSize int) ([]map[string]interface{}, int, error),
	upsertFn func(ctx context.Context, data map[string]interface{}) (bool, error),
) (*SyncResult, error) {
	startTime := time.Now()

	syncType := "manual"
	if filter != nil && filter.SyncType != "" {
		syncType = filter.SyncType
	}

	batchSize := 500
	if filter != nil && filter.PageSize > 0 {
		batchSize = filter.PageSize
	}

	log.Printf("🔄 [%s Sync] Starting %s sync from SIAKADU API", name, syncType)

	// Ensure mapping tables exist
	if err := s.repo.EnsureAkademikSchema(ctx); err != nil {
		log.Printf("⚠️  [%s Sync] EnsureAkademikSchema warning: %v", name, err)
	}

	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync(name+" SIAKADU", endpointKey, syncType, syncedBy, 0)
	}

	// Fetch all data with pagination
	allData := make([]map[string]interface{}, 0)
	currentPage := 1

	for {
		data, _, err := fetchFn(currentPage, batchSize)
		if err != nil {
			if len(allData) == 0 {
				errMsg := fmt.Sprintf("failed to fetch %s from SIAKADU: %v", name, err)
				s.logSyncResult(ctx, name, endpointKey, syncType, "failed", syncedBy, 0, 0, 0, 0, 0,
					int(time.Since(startTime).Milliseconds()), &errMsg, nil)
				if s.monitorSvc != nil && syncID != "" {
					s.monitorSvc.FailSync(syncID, errMsg)
				}
				return nil, fmt.Errorf(errMsg)
			}
			log.Printf("⚠️  [%s Sync] Fetch failed at page=%d, continuing with %d records", name, currentPage, len(allData))
			break
		}

		if len(data) == 0 {
			break
		}

		allData = append(allData, data...)
		log.Printf("📊 [%s Sync] Fetched page %d: %d records (total: %d)", name, currentPage, len(data), len(allData))

		if len(data) < batchSize {
			break
		}
		currentPage++
	}

	log.Printf("📊 [%s Sync] Total fetched: %d records", name, len(allData))

	// Debug: dump first record fields
	if len(allData) > 0 {
		log.Printf("🔍 [%s Sync] Sample record fields:", name)
		for k, v := range allData[0] {
			log.Printf("   %s = %v (type: %T)", k, v, v)
		}
	}

	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, len(allData))
	}

	// Process records
	totalInserted := 0
	totalUpdated := 0
	totalErrors := 0
	allErrors := make([]string, 0)

	for i, item := range allData {
		isNew, err := upsertFn(ctx, item)
		if err != nil {
			totalErrors++
			allErrors = append(allErrors, err.Error())
			if totalErrors <= 3 {
				log.Printf("⚠️  [%s Sync] Error #%d: %v | data: %v", name, totalErrors, err, item)
			}
			continue
		}
		if isNew {
			totalInserted++
		} else {
			totalUpdated++
		}

		if s.monitorSvc != nil && syncID != "" && (i+1)%100 == 0 {
			s.monitorSvc.UpdateProgress(syncID, i+1, fmt.Sprintf("Processing %d/%d", i+1, len(allData)))
		}
	}

	duration := time.Since(startTime)

	status := "success"
	if totalErrors > 0 && (totalInserted+totalUpdated) > 0 {
		status = "partial"
	} else if totalErrors > 0 && (totalInserted+totalUpdated) == 0 {
		status = "failed"
	}

	var errDetails *string
	if len(allErrors) > 0 {
		maxErrors := 10
		if len(allErrors) > maxErrors {
			summary := fmt.Sprintf("First %d of %d errors:\n%s", maxErrors, len(allErrors), joinErrors(allErrors[:maxErrors]))
			errDetails = &summary
		} else {
			summary := joinErrors(allErrors)
			errDetails = &summary
		}
	}

	s.logSyncResult(ctx, name, endpointKey, syncType, status, syncedBy, len(allData), totalInserted, totalUpdated, totalErrors, 0,
		int(duration.Milliseconds()), nil, errDetails)

	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d inserted, %d updated, %d errors",
			totalInserted, totalUpdated, totalErrors))
	}

	result := &SyncResult{
		TotalFetched:  len(allData),
		TotalInserted: totalInserted,
		TotalUpdated:  totalUpdated,
		TotalErrors:   totalErrors,
		Duration:      duration.String(),
		SyncedBy:      syncedBy,
	}

	log.Printf("✅ [%s Sync] Complete - %d fetched, %d inserted, %d updated, %d errors, duration: %s",
		name, result.TotalFetched, result.TotalInserted, result.TotalUpdated, result.TotalErrors, result.Duration)

	return result, nil
}

func (s *service) SyncKelas(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	idSemester := ""
	idUnit := ""
	if filter != nil {
		idSemester = filter.IdSemester
		idUnit = filter.IdUnit
	}

	return s.genericSync(ctx, "Kelas", "siakadu_kelas", filter, syncedBy,
		func(page, pageSize int) ([]map[string]interface{}, int, error) {
			return s.siakaduAPI.GetKelas(idSemester, idUnit, page, pageSize)
		},
		s.repo.UpsertKelasKuliah,
	)
}

func (s *service) SyncKurikulum(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	thnKurikulum := 0
	idUnit := ""
	if filter != nil {
		thnKurikulum = filter.ThnKurikulum
		idUnit = filter.IdUnit
	}

	return s.genericSync(ctx, "Kurikulum", "siakadu_kurikulum", filter, syncedBy,
		func(page, pageSize int) ([]map[string]interface{}, int, error) {
			return s.siakaduAPI.GetKurikulum(thnKurikulum, idUnit, page, pageSize)
		},
		s.repo.UpsertKurikulum,
	)
}

func (s *service) SyncMatakuliah(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	thnKurikulum := 0
	idUnit := ""
	if filter != nil {
		thnKurikulum = filter.ThnKurikulum
		idUnit = filter.IdUnit
	}

	return s.genericSync(ctx, "Matakuliah", "siakadu_matakuliah", filter, syncedBy,
		func(page, pageSize int) ([]map[string]interface{}, int, error) {
			return s.siakaduAPI.GetMataKuliah(thnKurikulum, idUnit, page, pageSize)
		},
		s.repo.UpsertMatakuliah,
	)
}

func (s *service) SyncJadwal(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	idSemester := ""
	idUnit := ""
	if filter != nil {
		idSemester = filter.IdSemester
		idUnit = filter.IdUnit
	}

	return s.genericSync(ctx, "Jadwal", "siakadu_jadwal", filter, syncedBy,
		func(page, pageSize int) ([]map[string]interface{}, int, error) {
			return s.siakaduAPI.GetJadwalKuliah(idSemester, idUnit, page, pageSize)
		},
		s.repo.UpsertJadwalKelas,
	)
}

// joinErrors joins error messages with newline
// SyncAllAkademik syncs matakuliah + kurikulum + kelas for all prodi
func (s *service) SyncAllAkademik(ctx context.Context, idSemester, syncedBy string) ([]*ProdiAkademikSyncResult, error) {
	prodis, err := s.repo.GetAllProdiIDs(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %v", err)
	}
	if len(prodis) == 0 {
		return nil, fmt.Errorf("no prodi found — sync units first")
	}

	log.Printf("🔄 [SyncAllAkademik] Starting for %d prodi, semester=%s", len(prodis), idSemester)

	results := make([]*ProdiAkademikSyncResult, 0, len(prodis))

	for i, prodi := range prodis {
		nmUnit := "Unknown"
		if prodi.NmUnit != nil {
			nmUnit = *prodi.NmUnit
		}
		log.Printf("📊 [SyncAllAkademik] [%d/%d] %s (%s)", i+1, len(prodis), nmUnit, prodi.IdUnit)

		pr := &ProdiAkademikSyncResult{IdUnit: prodi.IdUnit, NmUnit: nmUnit}

		// Matakuliah
		mkResult, err := s.SyncMatakuliah(ctx, &SyncFilter{IdUnit: prodi.IdUnit, PageSize: 500, SyncType: "auto-all"}, syncedBy)
		if err != nil {
			log.Printf("⚠️  [SyncAllAkademik] Matkul %s: %v", prodi.IdUnit, err)
		}
		pr.Matakuliah = mkResult

		// Kurikulum
		kurResult, err := s.SyncKurikulum(ctx, &SyncFilter{IdUnit: prodi.IdUnit, PageSize: 500, SyncType: "auto-all"}, syncedBy)
		if err != nil {
			log.Printf("⚠️  [SyncAllAkademik] Kurikulum %s: %v", prodi.IdUnit, err)
		}
		pr.Kurikulum = kurResult

		// Kelas (needs semester)
		if idSemester != "" {
			klsResult, err := s.SyncKelas(ctx, &SyncFilter{IdUnit: prodi.IdUnit, IdSemester: idSemester, PageSize: 500, SyncType: "auto-all"}, syncedBy)
			if err != nil {
				log.Printf("⚠️  [SyncAllAkademik] Kelas %s: %v", prodi.IdUnit, err)
			}
			pr.Kelas = klsResult
		}

		results = append(results, pr)
	}

	log.Printf("✅ [SyncAllAkademik] Done — %d prodi", len(results))
	return results, nil
}

func joinErrors(errors []string) string {
	result := ""
	for i, e := range errors {
		if i > 0 {
			result += "\n"
		}
		result += e
	}
	return result
}

// logSyncResult logs sync result to database
func (s *service) logSyncResult(ctx context.Context, name, endpointKey, syncType, status, syncedBy string,
	total, inserted, updated, failed, skipped, durationMs int, errMsg, errDetails *string) {
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  name + " SIAKADU",
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        status,
		APICode:       "SIAKADU",
		TotalRecords:  total,
		InsertedCount: inserted,
		UpdatedCount:  updated,
		FailedCount:   failed,
		SkippedCount:  skipped,
		DurationMs:    &durationMs,
		ErrorMessage:  errMsg,
		ErrorDetails:  errDetails,
		SyncedBy:      syncedBy,
	}

	if _, err := loggerSvc.LogSync(ctx, req); err != nil {
		log.Printf("⚠️  [%s Sync] Failed to log result: %v", name, err)
	}
}
