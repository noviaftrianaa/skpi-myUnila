package referensi

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// SikepAPIClient interface for SIKEP API operations
type SikepAPIClient interface {
	GetToken() error
	ForceRefreshToken() error
	GetOrganisasi() ([]map[string]interface{}, error)
	GetFungsional() ([]map[string]interface{}, error)
	GetStruktural() ([]map[string]interface{}, error)
	GetGolongan() ([]map[string]interface{}, error)
	GetGolonganPPPK() ([]map[string]interface{}, error)
	GetPendidikan() ([]map[string]interface{}, error)
}

// Service interface for referensi business logic
type Service interface {
	// Metadata operations
	GetMetadata(ctx context.Context) ([]ReferensiMetadata, error)

	// Get data operations
	GetOrganisasiList(ctx context.Context) ([]Organisasi, error)
	GetFungsionalList(ctx context.Context) ([]Fungsional, error)
	GetStrukturalList(ctx context.Context) ([]Struktural, error)
	GetGolonganPNSList(ctx context.Context) ([]GolonganPNS, error)
	GetGolonganPPPKList(ctx context.Context) ([]GolonganPPPK, error)
	GetPendidikanList(ctx context.Context) ([]Pendidikan, error)

	// Paginated data operations
	GetEndpointDataPaginated(ctx context.Context, key string, page, limit int, search string) (*PaginatedResult, error)

	// Sync operations
	SyncEndpoint(ctx context.Context, key, syncedBy string) (*BatchSyncResult, error)
	BatchSync(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error)
}

type service struct {
	repo       Repository
	sikepAPI   SikepAPIClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new referensi service
func NewService(repo Repository, sikepAPI SikepAPIClient) Service {
	return &service{
		repo:       repo,
		sikepAPI:   sikepAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// ========================================
// Metadata Operations
// ========================================

func (s *service) GetMetadata(ctx context.Context) ([]ReferensiMetadata, error) {
	return s.repo.GetMetadata(ctx)
}

// ========================================
// Get Data Operations
// ========================================

func (s *service) GetOrganisasiList(ctx context.Context) ([]Organisasi, error) {
	return s.repo.GetOrganisasiList(ctx)
}

func (s *service) GetFungsionalList(ctx context.Context) ([]Fungsional, error) {
	return s.repo.GetFungsionalList(ctx)
}

func (s *service) GetStrukturalList(ctx context.Context) ([]Struktural, error) {
	return s.repo.GetStrukturalList(ctx)
}

func (s *service) GetGolonganPNSList(ctx context.Context) ([]GolonganPNS, error) {
	return s.repo.GetGolonganPNSList(ctx)
}

func (s *service) GetGolonganPPPKList(ctx context.Context) ([]GolonganPPPK, error) {
	return s.repo.GetGolonganPPPKList(ctx)
}

func (s *service) GetPendidikanList(ctx context.Context) ([]Pendidikan, error) {
	return s.repo.GetPendidikanList(ctx)
}

// ========================================
// Paginated Data Operations
// ========================================

func (s *service) GetEndpointDataPaginated(ctx context.Context, key string, page, limit int, search string) (*PaginatedResult, error) {
	switch key {
	case "organisasi":
		return s.repo.GetOrganisasiPaginated(ctx, page, limit, search)
	case "fungsional":
		return s.repo.GetFungsionalPaginated(ctx, page, limit, search)
	case "struktural":
		return s.repo.GetStrukturalPaginated(ctx, page, limit, search)
	case "golongan_pns", "golongan-pns":
		return s.repo.GetGolonganPNSPaginated(ctx, page, limit, search)
	case "golongan_pppk", "golongan-pppk":
		return s.repo.GetGolonganPPPKPaginated(ctx, page, limit, search)
	case "pendidikan":
		return s.repo.GetPendidikanPaginated(ctx, page, limit, search)
	default:
		return nil, fmt.Errorf("unknown endpoint: %s", key)
	}
}

// ========================================
// Sync Operations
// ========================================

func (s *service) SyncEndpoint(ctx context.Context, key, syncedBy string) (*BatchSyncResult, error) {
	startTime := time.Now()
	result := &BatchSyncResult{
		Endpoint: key,
		Success:  false,
	}

	log.Printf("🔄 [SIKEP Referensi] Starting sync for %s", key)

	var totalRecords int
	var err error

	switch key {
	case "organisasi":
		totalRecords, err = s.syncOrganisasi(ctx)
	case "fungsional":
		totalRecords, err = s.syncFungsional(ctx)
	case "struktural":
		totalRecords, err = s.syncStruktural(ctx)
	case "golongan_pns":
		totalRecords, err = s.syncGolonganPNS(ctx)
	case "golongan_pppk":
		totalRecords, err = s.syncGolonganPPPK(ctx)
	case "pendidikan":
		totalRecords, err = s.syncPendidikan(ctx)
	default:
		err = fmt.Errorf("unknown endpoint: %s", key)
	}

	duration := time.Since(startTime)

	if err != nil {
		result.Error = err.Error()
		result.Message = fmt.Sprintf("Sync failed: %v", err)
		log.Printf("❌ [SIKEP Referensi] Failed to sync %s: %v", key, err)

		// Log to database
		s.logSyncResult(ctx, key, "failed", syncedBy, 0, int(duration.Milliseconds()), &result.Error)
		return result, err
	}

	result.Success = true
	result.TotalRecords = totalRecords
	result.Message = fmt.Sprintf("Successfully synced %d records", totalRecords)
	log.Printf("✅ [SIKEP Referensi] Synced %s: %d records in %s", key, totalRecords, duration)

	// Log to database
	s.logSyncResult(ctx, key, "success", syncedBy, totalRecords, int(duration.Milliseconds()), nil)

	return result, nil
}

func (s *service) BatchSync(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error) {
	startTime := time.Now()

	response := &BatchSyncResponse{
		TotalRequested: len(endpoints),
		Results:        make([]BatchSyncResult, 0, len(endpoints)),
	}

	log.Printf("🔄 [SIKEP Referensi] Starting batch sync for %d endpoints", len(endpoints))

	// Use goroutines for parallel sync
	var wg sync.WaitGroup
	resultChan := make(chan BatchSyncResult, len(endpoints))

	for _, endpoint := range endpoints {
		wg.Add(1)
		go func(ep string) {
			defer wg.Done()
			result, _ := s.SyncEndpoint(ctx, ep, syncedBy)
			if result != nil {
				resultChan <- *result
			}
		}(endpoint)
	}

	// Wait for all goroutines to complete
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// Collect results
	for result := range resultChan {
		response.Results = append(response.Results, result)
		if result.Success {
			response.TotalSuccess++
		} else {
			response.TotalFailed++
		}
	}

	response.Duration = time.Since(startTime).String()

	log.Printf("✅ [SIKEP Referensi] Batch sync complete: %d success, %d failed in %s",
		response.TotalSuccess, response.TotalFailed, response.Duration)

	return response, nil
}

// ========================================
// Individual Sync Implementations
// ========================================

func (s *service) syncOrganisasi(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetOrganisasi()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch organisasi from SIKEP: %w", err)
	}

	// Transform and flatten hierarchical data
	orgList := s.flattenOrganisasi(data, nil)
	return s.repo.BulkUpsertOrganisasi(ctx, orgList)
}

func (s *service) flattenOrganisasi(data []map[string]interface{}, parentID *string) []Organisasi {
	result := make([]Organisasi, 0)

	for _, item := range data {
		org := Organisasi{
			IDUnitOrgaInduk: parentID,
		}

		if v, ok := item["idorg"].(string); ok {
			org.IDUnitOrga = v
		}
		if v, ok := item["kode"].(string); ok {
			org.KdUnitOrga = &v
		}
		if v, ok := item["nama"].(string); ok {
			org.NmUnitOrga = v
		}
		if v, ok := item["alamat"].(string); ok {
			org.Alamat = &v
		}
		if v, ok := item["notelp"].(string); ok {
			org.NoTlp = &v
		}
		if v, ok := item["nofax"].(string); ok {
			org.NoFax = &v
		}
		if v, ok := item["kodepos"].(string); ok {
			org.KdPos = &v
		}
		if v, ok := item["nmsingkat"].(string); ok {
			org.NmSingkat = &v
		}
		if v, ok := item["nminisial"].(string); ok {
			org.NmInisial = &v
		}

		result = append(result, org)

		// Process children recursively
		if items, ok := item["items"].([]interface{}); ok {
			children := make([]map[string]interface{}, 0, len(items))
			for _, child := range items {
				if childMap, ok := child.(map[string]interface{}); ok {
					children = append(children, childMap)
				}
			}
			if len(children) > 0 {
				childResults := s.flattenOrganisasi(children, &org.IDUnitOrga)
				result = append(result, childResults...)
			}
		}
	}

	return result
}

func (s *service) syncFungsional(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetFungsional()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch fungsional from SIKEP: %w", err)
	}

	list := make([]Fungsional, 0, len(data))
	for _, item := range data {
		f := Fungsional{}

		if v, ok := item["idfungsional"].(string); ok {
			f.IDJabfung = v
		}
		if v, ok := item["nmfungsional"].(string); ok {
			f.NmJabfung = v
		}
		if v, ok := item["kum"].(string); ok {
			f.Kum = &v
		}
		if v, ok := item["ispak"].(string); ok {
			f.IsPak = &v
		}
		if v, ok := item["idgolongan"].(string); ok {
			f.IDGol = &v
		}
		if v, ok := item["tipe"].(string); ok {
			f.Tipe = &v
		}
		if v, ok := item["grade"].(string); ok {
			f.Grade = &v
		}

		list = append(list, f)
	}

	return s.repo.BulkUpsertFungsional(ctx, list)
}

func (s *service) syncStruktural(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetStruktural()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch struktural from SIKEP: %w", err)
	}

	list := make([]Struktural, 0, len(data))
	for _, item := range data {
		st := Struktural{}

		if v, ok := item["idjabatan"].(string); ok {
			st.IDJabstruk = v
		}
		if v, ok := item["kdjabatan"].(string); ok {
			st.KdJabstruk = &v
		}
		if v, ok := item["nmjabatan"].(string); ok {
			st.NmJabstruk = v
		}

		list = append(list, st)
	}

	return s.repo.BulkUpsertStruktural(ctx, list)
}

func (s *service) syncGolonganPNS(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetGolongan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch golongan PNS from SIKEP: %w", err)
	}

	list := make([]GolonganPNS, 0, len(data))
	for _, item := range data {
		g := GolonganPNS{}

		if v, ok := item["id"].(string); ok {
			g.IDGol = v
		}
		if v, ok := item["kode"].(string); ok {
			g.KdGol = &v
		}
		if v, ok := item["golongan"].(string); ok {
			g.NmGol = &v
		}
		if v, ok := item["pangkat"].(string); ok {
			g.NmPangkat = &v
		}
		if v, ok := item["deskripsi"].(string); ok {
			g.Deskripsi = &v
		}

		list = append(list, g)
	}

	return s.repo.BulkUpsertGolonganPNS(ctx, list)
}

func (s *service) syncGolonganPPPK(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetGolonganPPPK()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch golongan PPPK from SIKEP: %w", err)
	}

	list := make([]GolonganPPPK, 0, len(data))
	for _, item := range data {
		g := GolonganPPPK{}

		if v, ok := item["id"].(string); ok {
			g.ID = v
		}
		if v, ok := item["golongan"].(string); ok {
			g.Golongan = v
		}
		if v, ok := item["pangkat"].(string); ok {
			g.Pangkat = v
		}

		list = append(list, g)
	}

	return s.repo.BulkUpsertGolonganPPPK(ctx, list)
}

func (s *service) syncPendidikan(ctx context.Context) (int, error) {
	data, err := s.sikepAPI.GetPendidikan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch pendidikan from SIKEP: %w", err)
	}

	list := make([]Pendidikan, 0, len(data))
	for _, item := range data {
		p := Pendidikan{}

		if v, ok := item["idpendidikan"].(string); ok {
			p.IDPend = v
		}
		if v, ok := item["nmpendidikan"].(string); ok {
			p.NmPend = v
		}

		list = append(list, p)
	}

	return s.repo.BulkUpsertPendidikan(ctx, list)
}

// ========================================
// Logging
// ========================================

func (s *service) logSyncResult(ctx context.Context, endpoint, status, syncedBy string, totalRecords, durationMs int, errMsg *string) {
	if s.loggerSvc == nil {
		return
	}

	configs := GetEndpointConfigs()
	var endpointName string
	for _, cfg := range configs {
		if cfg.Key == endpoint {
			endpointName = cfg.Name
			break
		}
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  fmt.Sprintf("SIKEP Referensi - %s", endpointName),
		EndpointKey:   fmt.Sprintf("sikep_ref_%s", endpoint),
		SyncType:      "manual",
		Status:        status,
		APICode:       "SIKEP",
		TotalRecords:  totalRecords,
		UpdatedCount:  totalRecords,
		DurationMs:    &durationMs,
		ErrorMessage:  errMsg,
		SyncedBy:      syncedBy,
	}

	_, err := s.loggerSvc.LogSync(ctx, req)
	if err != nil {
		log.Printf("⚠️  [SIKEP Referensi] Failed to log sync result: %v", err)
	}
}
