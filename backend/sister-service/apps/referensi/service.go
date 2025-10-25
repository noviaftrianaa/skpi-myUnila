package referensi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Service defines business logic for referensi domain
type Service interface {
	// Agama methods
	GetAllAgama(ctx context.Context) ([]Agama, error)
	GetAgamaByID(ctx context.Context, id int) (*Agama, error)
	SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error)

	// Negara methods
	GetAllNegara(ctx context.Context) ([]Negara, error)
	GetNegaraByID(ctx context.Context, id string) (*Negara, error)
	SyncNegaraFromSister(ctx context.Context, syncedBy string) (int, error)

	// Jenjang Pendidikan methods
	GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error)
	SyncJenjangPendidikanFromSister(ctx context.Context, syncedBy string) (int, error)

	// Gelar Akademik methods
	GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error)
	SyncGelarAkademikFromSister(ctx context.Context, syncedBy string) (int, error)

	// Semester methods
	GetAllSemester(ctx context.Context) ([]Semester, error)
	SyncSemesterFromSister(ctx context.Context, syncedBy string) (int, error)

	// Metadata & Batch Sync methods
	GetAllReferensiMetadata(ctx context.Context) ([]ReferensiMetadata, error)
	BatchSyncFromSister(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error)
}

type service struct {
	repo          Repository
	sisterAPI     *sister_api.Client
	loggerService appLogger.Service
}

// NewService creates a new service instance
func NewService(repo Repository, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          repo,
		sisterAPI:     sisterAPI,
		loggerService: loggerSvc,
	}
}

// GetAllAgama retrieves all agama
func (s *service) GetAllAgama(ctx context.Context) ([]Agama, error) {
	return s.repo.GetAllAgama(ctx)
}

// GetAgamaByID retrieves agama by ID
func (s *service) GetAgamaByID(ctx context.Context, id int) (*Agama, error) {
	return s.repo.GetAgamaByID(ctx, id)
}

// SyncAgamaFromSister synchronizes agama data from Sister API
func (s *service) SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error) {
	startTime := time.Now()
	var totalRecords int
	var syncErr error

	defer func() {
		s.logSyncResult(ctx, "Agama", "agama", "manual", syncedBy, totalRecords, startTime, syncErr)
	}()

	log.Println("🔄 Starting sync agama from Sister API...")

	// 1. Fetch data from Sister API
	rawData, err := s.sisterAPI.GetReferensiAgama()
	if err != nil {
		log.Printf("Error fetching agama from Sister API: %v", err)
		syncErr = fmt.Errorf("failed to fetch from Sister API: %w", err)
		return 0, syncErr
	}

	// 2. Parse Sister API response
	var sisterAgamaList []SisterAgama
	if err := json.Unmarshal(rawData, &sisterAgamaList); err != nil {
		log.Printf("Error parsing Sister API response: %v", err)
		syncErr = fmt.Errorf("failed to parse Sister API response: %w", err)
		return 0, syncErr
	}

	totalRecords = len(sisterAgamaList)
	log.Printf("✅ Fetched %d agama from Sister API", totalRecords)

	// 3. Transform to domain entity
	agamaList := make([]Agama, len(sisterAgamaList))
	for i, sa := range sisterAgamaList {
		agamaList[i] = Agama{
			IDAgama:   sa.ID,
			NamaAgama: sa.Nama,
		}
	}

	// Log who synced for audit trail
	log.Printf("📝 Sync requested by: %s", syncedBy)

	// 4. Bulk upsert to database
	if err := s.repo.BulkUpsertAgama(ctx, agamaList); err != nil {
		log.Printf("Error upserting agama to database: %v", err)
		syncErr = fmt.Errorf("failed to save to database: %w", err)
		return 0, syncErr
	}

	log.Printf("✅ Successfully synced %d agama records", len(agamaList))
	return len(agamaList), nil
}

// ==================== NEGARA SERVICE METHODS ====================

// GetAllNegara retrieves all negara from database
func (s *service) GetAllNegara(ctx context.Context) ([]Negara, error) {
	return s.repo.GetAllNegara(ctx)
}

// GetNegaraByID retrieves a negara by ID
func (s *service) GetNegaraByID(ctx context.Context, id string) (*Negara, error) {
	return s.repo.GetNegaraByID(ctx, id)
}

// SyncNegaraFromSister fetches negara from Sister API and syncs to database
func (s *service) SyncNegaraFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync negara from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiNegara()
	if err != nil {
		log.Printf("Error fetching negara from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterNegaraList []SisterNegara
	if err := json.Unmarshal(rawData, &sisterNegaraList); err != nil {
		log.Printf("Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d negara from Sister API", len(sisterNegaraList))

	negaraList := make([]Negara, len(sisterNegaraList))
	for i, sn := range sisterNegaraList {
		negaraList[i] = Negara{
			IDNegara:   sn.ID,
			NamaNegara: sn.Nama,
			SyncedBy:   &syncedBy,
		}
	}

	if err := s.repo.BulkUpsertNegara(ctx, negaraList); err != nil {
		log.Printf("Error upserting negara to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d negara records", len(negaraList))
	return len(negaraList), nil
}

// ==================== JENJANG PENDIDIKAN SERVICE METHODS ====================

// GetAllJenjangPendidikan retrieves all jenjang pendidikan from database
func (s *service) GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error) {
	return s.repo.GetAllJenjangPendidikan(ctx)
}

// SyncJenjangPendidikanFromSister fetches jenjang pendidikan from Sister API and syncs to database
func (s *service) SyncJenjangPendidikanFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync jenjang pendidikan from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiJenjangPendidikan()
	if err != nil {
		log.Printf("❌ Error fetching jenjang pendidikan from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterJenjangPendidikan
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d jenjang pendidikan from Sister API", len(sisterList))

	list := make([]JenjangPendidikan, 0, len(sisterList))
	for _, item := range sisterList {
		id, err := strconv.Atoi(item.ID)
		if err != nil {
			log.Printf("⚠️ Skipping invalid ID: %s", item.ID)
			continue
		}

		list = append(list, JenjangPendidikan{
			IDJenjangPendidikan: id,
			NamaJenjang:         item.Nama,
			SyncedBy:            &syncedBy,
		})
	}

	if err := s.repo.BulkUpsertJenjangPendidikan(ctx, list); err != nil {
		log.Printf("❌ Error upserting jenjang pendidikan to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d jenjang pendidikan records", len(list))
	return len(list), nil
}

// ==================== GELAR AKADEMIK SERVICE METHODS ====================

// GetAllGelarAkademik retrieves all gelar akademik from database
func (s *service) GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error) {
	return s.repo.GetAllGelarAkademik(ctx)
}

// SyncGelarAkademikFromSister fetches gelar akademik from Sister API and syncs to database
func (s *service) SyncGelarAkademikFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync gelar akademik from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiGelarAkademik()
	if err != nil {
		log.Printf("❌ Error fetching gelar akademik from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterGelarAkademik
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d gelar akademik from Sister API", len(sisterList))

	list := make([]GelarAkademik, 0, len(sisterList))
	for _, item := range sisterList {
		list = append(list, GelarAkademik{
			IDGelarAkademik: item.ID,
			NamaGelar:       item.Nama,
			SyncedBy:        &syncedBy,
		})
	}

	if err := s.repo.BulkUpsertGelarAkademik(ctx, list); err != nil {
		log.Printf("❌ Error upserting gelar akademik to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d gelar akademik records", len(list))
	return len(list), nil
}

// ==================== SEMESTER SERVICE METHODS ====================

// GetAllSemester retrieves all semester from database
func (s *service) GetAllSemester(ctx context.Context) ([]Semester, error) {
	return s.repo.GetAllSemester(ctx)
}

// SyncSemesterFromSister fetches semester from Sister API and syncs to database
func (s *service) SyncSemesterFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync semester from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiSemester()
	if err != nil {
		log.Printf("❌ Error fetching semester from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterSemester
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d semester from Sister API", len(sisterList))

	list := make([]Semester, len(sisterList))
	for i, item := range sisterList {
		list[i] = Semester{
			IDSemester:   item.ID,
			NamaSemester: item.Nama,
			SyncedBy:     &syncedBy,
		}
	}

	if err := s.repo.BulkUpsertSemester(ctx, list); err != nil {
		log.Printf("❌ Error upserting semester to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d semester records", len(list))
	return len(list), nil
}

// ==================== METADATA & BATCH SYNC METHODS ====================

// GetAllReferensiMetadata returns metadata for all available referensi endpoints
func (s *service) GetAllReferensiMetadata(ctx context.Context) ([]ReferensiMetadata, error) {
	log.Println("📊 Fetching metadata for all referensi endpoints...")

	metadata := []ReferensiMetadata{
		{
			Key:         "agama",
			Name:        "Agama",
			Description: "Data referensi agama/kepercayaan",
			Available:   true,
		},
		{
			Key:         "negara",
			Name:        "Negara",
			Description: "Data referensi negara",
			Available:   true,
		},
		{
			Key:         "jenjang_pendidikan",
			Name:        "Jenjang Pendidikan",
			Description: "Data referensi jenjang pendidikan",
			Available:   true,
		},
		{
			Key:         "gelar_akademik",
			Name:        "Gelar Akademik",
			Description: "Data referensi gelar/titel akademik",
			Available:   true,
		},
		{
			Key:         "semester",
			Name:        "Semester",
			Description: "Data referensi semester",
			Available:   true,
		},
	}

	// Get counts and last sync info for each endpoint
	for i := range metadata {
		switch metadata[i].Key {
		case "agama":
			agamaList, _ := s.repo.GetAllAgama(ctx)
			metadata[i].TotalRecords = len(agamaList)
			if len(agamaList) > 0 && agamaList[0].LastSync != nil {
				metadata[i].LastSync = agamaList[0].LastSync
			}
		case "negara":
			negaraList, _ := s.repo.GetAllNegara(ctx)
			metadata[i].TotalRecords = len(negaraList)
			if len(negaraList) > 0 && negaraList[0].LastSync != nil {
				metadata[i].LastSync = negaraList[0].LastSync
				if negaraList[0].SyncedBy != nil {
					metadata[i].SyncedBy = *negaraList[0].SyncedBy
				}
			}
		case "jenjang_pendidikan":
			list, _ := s.repo.GetAllJenjangPendidikan(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "gelar_akademik":
			list, _ := s.repo.GetAllGelarAkademik(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "semester":
			list, _ := s.repo.GetAllSemester(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		}
	}

	log.Printf("✅ Fetched metadata for %d endpoints", len(metadata))
	return metadata, nil
}

// BatchSyncFromSister syncs multiple endpoints in parallel using goroutines
func (s *service) BatchSyncFromSister(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error) {
	startTime := time.Now()
	log.Printf("🔄 Starting batch sync for %d endpoints: %v", len(endpoints), endpoints)

	// Create channels for results and WaitGroup for synchronization
	var wg sync.WaitGroup
	resultChan := make(chan BatchSyncResult, len(endpoints))

	// Launch goroutine for each endpoint
	for _, endpoint := range endpoints {
		wg.Add(1)
		go func(ep string) {
			defer wg.Done()

			result := BatchSyncResult{
				Endpoint: ep,
			}

			// Call appropriate sync method based on endpoint
			var totalRecords int
			var err error

			switch ep {
			case "agama":
				totalRecords, err = s.SyncAgamaFromSister(ctx, syncedBy)
			case "negara":
				totalRecords, err = s.SyncNegaraFromSister(ctx, syncedBy)
			case "jenjang_pendidikan":
				totalRecords, err = s.SyncJenjangPendidikanFromSister(ctx, syncedBy)
			case "gelar_akademik":
				totalRecords, err = s.SyncGelarAkademikFromSister(ctx, syncedBy)
			case "semester":
				totalRecords, err = s.SyncSemesterFromSister(ctx, syncedBy)
			default:
				err = fmt.Errorf("unknown endpoint: %s", ep)
			}

			if err != nil {
				result.Success = false
				result.Error = err.Error()
				result.Message = fmt.Sprintf("Failed to sync %s", ep)
				log.Printf("❌ Batch sync failed for %s: %v", ep, err)
			} else {
				result.Success = true
				result.TotalRecords = totalRecords
				result.Message = fmt.Sprintf("Successfully synced %d records", totalRecords)
				log.Printf("✅ Batch sync succeeded for %s: %d records", ep, totalRecords)
			}

			resultChan <- result
		}(endpoint)
	}

	// Wait for all goroutines to complete
	wg.Wait()
	close(resultChan)

	// Collect results
	var results []BatchSyncResult
	totalSuccess := 0
	totalFailed := 0

	for result := range resultChan {
		results = append(results, result)
		if result.Success {
			totalSuccess++
		} else {
			totalFailed++
		}
	}

	duration := time.Since(startTime)

	response := &BatchSyncResponse{
		TotalRequested: len(endpoints),
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		Results:        results,
		Duration:       duration.String(),
	}

	log.Printf("✅ Batch sync completed: %d succeeded, %d failed in %s",
		totalSuccess, totalFailed, duration.String())

	return response, nil
}
