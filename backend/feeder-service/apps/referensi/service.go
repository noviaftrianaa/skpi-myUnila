package referensi

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

type Service interface {
	// Stats
	GetAllStats(ctx context.Context) (*AllReferensiStats, error)
	GetStats(ctx context.Context, endpointKey string) (*ReferensiStats, error)

	// Data retrieval
	GetData(ctx context.Context, endpointKey string, page, limit int, search string) (*ReferensiListResponse, error)
	GetDetail(ctx context.Context, endpointKey, id string) (map[string]interface{}, error)

	// Sync
	SyncEndpoint(ctx context.Context, endpointKey, syncedBy string) (*SyncResult, error)
	SyncMultiple(ctx context.Context, endpointKeys []string, syncedBy string) (*BatchSyncResult, error)
}

type service struct {
	repo      Repository
	feederAPI *feeder_api.FeederClient
	loggerSvc logger.Service
}

func NewService(repo Repository, feederAPI *feeder_api.FeederClient, loggerSvc logger.Service) Service {
	return &service{
		repo:      repo,
		feederAPI: feederAPI,
		loggerSvc: loggerSvc,
	}
}

// GetAllStats returns stats for all referensi endpoints
func (s *service) GetAllStats(ctx context.Context) (*AllReferensiStats, error) {
	return s.repo.GetAllStats(ctx)
}

// GetStats returns stats for a specific endpoint
func (s *service) GetStats(ctx context.Context, endpointKey string) (*ReferensiStats, error) {
	return s.repo.GetStats(ctx, endpointKey)
}

// GetData returns paginated data for an endpoint
func (s *service) GetData(ctx context.Context, endpointKey string, page, limit int, search string) (*ReferensiListResponse, error) {
	ep := FindEndpoint(endpointKey)
	if ep == nil {
		return nil, fmt.Errorf("unknown endpoint: %s", endpointKey)
	}

	// Determine name field based on endpoint
	nameField := s.getNameField(endpointKey)

	data, total, err := s.repo.GetData(ctx, ep.TableName, ep.PKField, nameField, page, limit, search)
	if err != nil {
		return nil, err
	}

	return &ReferensiListResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// GetDetail returns detail for a specific record
func (s *service) GetDetail(ctx context.Context, endpointKey, id string) (map[string]interface{}, error) {
	ep := FindEndpoint(endpointKey)
	if ep == nil {
		return nil, fmt.Errorf("unknown endpoint: %s", endpointKey)
	}

	return s.repo.GetDetail(ctx, ep.TableName, ep.PKField, id)
}

// SyncEndpoint syncs a single endpoint from Feeder API
func (s *service) SyncEndpoint(ctx context.Context, endpointKey, syncedBy string) (*SyncResult, error) {
	ep := FindEndpoint(endpointKey)
	if ep == nil {
		return nil, fmt.Errorf("unknown endpoint: %s", endpointKey)
	}

	startTime := time.Now()
	log.Printf("📥 [Referensi] Starting sync for %s...", ep.Name)

	// Fetch data from Feeder API
	data, err := s.fetchFromFeeder(endpointKey)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to fetch %s: %v", ep.Name, err)
		log.Printf("❌ [Referensi] %s", errMsg)
		s.logSyncResult(ctx, endpointKey, "failed", syncedBy, 0, 0, int(time.Since(startTime).Milliseconds()), &errMsg)
		return &SyncResult{
			EndpointKey:  endpointKey,
			EndpointName: ep.Name,
			Status:       "failed",
			Message:      errMsg,
		}, nil
	}

	if len(data) == 0 {
		log.Printf("⚠️  [Referensi] No data returned for %s", ep.Name)
		return &SyncResult{
			EndpointKey:  endpointKey,
			EndpointName: ep.Name,
			Status:       "skipped",
			Message:      "No data from Feeder API",
		}, nil
	}

	log.Printf("📊 [Referensi] Fetched %d records for %s", len(data), ep.Name)

	// Upsert to database
	result, err := s.upsertData(ctx, endpointKey, data)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to upsert %s: %v", ep.Name, err)
		log.Printf("❌ [Referensi] %s", errMsg)
		s.logSyncResult(ctx, endpointKey, "failed", syncedBy, len(data), 0, int(time.Since(startTime).Milliseconds()), &errMsg)
		return &SyncResult{
			EndpointKey:  endpointKey,
			EndpointName: ep.Name,
			Status:       "failed",
			Message:      errMsg,
		}, nil
	}

	duration := int(time.Since(startTime).Milliseconds())
	log.Printf("✅ [Referensi] Synced %s: %d records in %dms", ep.Name, result.TotalRecords, duration)

	// Log sync result
	s.logSyncResult(ctx, endpointKey, "success", syncedBy, result.TotalRecords, result.InsertedCount, duration, nil)

	return result, nil
}

// SyncMultiple syncs multiple endpoints
func (s *service) SyncMultiple(ctx context.Context, endpointKeys []string, syncedBy string) (*BatchSyncResult, error) {
	result := &BatchSyncResult{
		TotalEndpoints: len(endpointKeys),
		Details:        make([]SyncResult, 0, len(endpointKeys)),
	}

	for _, key := range endpointKeys {
		syncResult, err := s.SyncEndpoint(ctx, key, syncedBy)
		if err != nil {
			result.FailedCount++
			result.Details = append(result.Details, SyncResult{
				EndpointKey: key,
				Status:      "failed",
				Message:     err.Error(),
			})
			continue
		}

		result.Details = append(result.Details, *syncResult)
		result.TotalRecords += syncResult.TotalRecords
		result.InsertedCount += syncResult.InsertedCount
		result.UpdatedCount += syncResult.UpdatedCount
		result.FailedCount += syncResult.FailedCount

		if syncResult.Status == "skipped" {
			result.SkippedCount++
		}
	}

	result.Message = fmt.Sprintf("Synced %d endpoints: %d records", len(endpointKeys), result.TotalRecords)
	return result, nil
}

// fetchFromFeeder fetches data from Feeder API based on endpoint key
func (s *service) fetchFromFeeder(endpointKey string) ([]map[string]interface{}, error) {
	if s.feederAPI == nil {
		return nil, fmt.Errorf("feeder API client not initialized")
	}

	// Map endpoint key to Feeder API action
	actMap := map[string]string{
		"jalur_masuk":       "GetJalurMasuk",
		"jenis_evaluasi":    "GetJenisEvaluasi",
		"jenis_pendaftaran": "GetJenisPendaftaran",
		"jenis_keluar":      "GetJenisKeluar",
		"status_mahasiswa":  "GetStatusMahasiswa",
		"tahun_ajaran":      "GetTahunAjaran",
		"semester":          "GetSemester",
		"jenis_prestasi":    "GetJenisPrestasi",
		"tingkat_prestasi":  "GetTingkatPrestasi",
		"kebutuhan_khusus":  "GetKebutuhanKhusus",
		"wilayah":           "GetWilayah",
		"agama":             "GetAgama",
		"jenis_tinggal":     "GetJenisTinggal",
		"pekerjaan":         "GetPekerjaan",
		"penghasilan":       "GetPenghasilan",
		"jenjang_pendidikan": "GetJenjangPendidikan",
		"pembiayaan":        "GetPembiayaan",
	}

	act, ok := actMap[endpointKey]
	if !ok {
		return nil, fmt.Errorf("no feeder action for endpoint: %s", endpointKey)
	}

	// Use direct API call for referensi data (act is the action name like GetJalurMasuk, GetAgama, etc.)
	return s.feederAPI.GetReferensiData(act, "", 0, 0)
}

// upsertData upserts data to database based on endpoint key
func (s *service) upsertData(ctx context.Context, endpointKey string, data []map[string]interface{}) (*SyncResult, error) {
	switch endpointKey {
	case "jalur_masuk":
		return s.repo.UpsertJalurMasuk(ctx, data)
	case "jenis_evaluasi":
		return s.repo.UpsertJenisEvaluasi(ctx, data)
	case "jenis_pendaftaran":
		return s.repo.UpsertJenisPendaftaran(ctx, data)
	case "jenis_keluar":
		return s.repo.UpsertJenisKeluar(ctx, data)
	case "status_mahasiswa":
		return s.repo.UpsertStatusMahasiswa(ctx, data)
	case "tahun_ajaran":
		return s.repo.UpsertTahunAjaran(ctx, data)
	case "semester":
		return s.repo.UpsertSemester(ctx, data)
	case "jenis_prestasi":
		return s.repo.UpsertJenisPrestasi(ctx, data)
	case "tingkat_prestasi":
		return s.repo.UpsertTingkatPrestasi(ctx, data)
	case "kebutuhan_khusus":
		return s.repo.UpsertKebutuhanKhusus(ctx, data)
	case "wilayah":
		return s.repo.UpsertWilayah(ctx, data)
	case "agama":
		return s.repo.UpsertAgama(ctx, data)
	case "jenis_tinggal":
		return s.repo.UpsertJenisTinggal(ctx, data)
	case "pekerjaan":
		return s.repo.UpsertPekerjaan(ctx, data)
	case "penghasilan":
		return s.repo.UpsertPenghasilan(ctx, data)
	case "jenjang_pendidikan":
		return s.repo.UpsertJenjangPendidikan(ctx, data)
	case "pembiayaan":
		return s.repo.UpsertPembiayaan(ctx, data)
	default:
		return nil, fmt.Errorf("no upsert handler for endpoint: %s", endpointKey)
	}
}

// getNameField returns the name field for an endpoint
func (s *service) getNameField(endpointKey string) string {
	nameFields := map[string]string{
		"jalur_masuk":        "nm_jalur_daftar",
		"jenis_evaluasi":     "nm_jns_eval",
		"jenis_pendaftaran":  "nm_jns_daftar",
		"jenis_keluar":       "ket_keluar",
		"status_mahasiswa":   "nm_stat_mhs",
		"tahun_ajaran":       "nm_thn_ajaran",
		"semester":           "nm_smt",
		"jenis_prestasi":     "nm_jenis_prestasi",
		"tingkat_prestasi":   "nm_tkt_prestasi",
		"kebutuhan_khusus":   "nm_kk",
		"wilayah":            "nm_wil",
		"agama":              "nm_agama",
		"jenis_tinggal":      "nm_jns_tinggal",
		"pekerjaan":          "nm_pekerjaan",
		"penghasilan":        "nm_penghasilan",
		"jenjang_pendidikan": "nm_jenj_didik",
		"pembiayaan":         "nm_pembiayaan",
	}

	if field, ok := nameFields[endpointKey]; ok {
		return field
	}
	return "nama"
}

// logSyncResult logs sync result to database
func (s *service) logSyncResult(ctx context.Context, endpoint, status, syncedBy string, totalRecords, insertedCount, durationMs int, errMsg *string) {
	if s.loggerSvc == nil {
		log.Printf("⚠️  [Referensi] Logger service not available, skipping log")
		return
	}

	ep := FindEndpoint(endpoint)
	endpointName := endpoint
	if ep != nil {
		endpointName = ep.Name
	}

	_, err := s.loggerSvc.LogSync(ctx, &logger.CreateSyncLogRequest{
		APICode:       "FEEDER",
		SyncType:      "manual",
		EndpointKey:   "referensi_" + endpoint,
		EndpointName:  endpointName,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: insertedCount,
		UpdatedCount:  0,
		FailedCount:   0,
		SkippedCount:  0,
		DurationMs:    &durationMs,
		ErrorMessage:  errMsg,
		SyncedBy:      syncedBy,
	})
	if err != nil {
		log.Printf("⚠️  [Referensi] Failed to log sync result: %v", err)
	}
}
