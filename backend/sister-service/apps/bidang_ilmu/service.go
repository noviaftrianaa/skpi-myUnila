package bidang_ilmu

import (
	"fmt"
	"log"
	"sync"
	"time"

	"sister-service/external/sister_api"
)

// Service defines the business logic for bidang ilmu
type Service interface {
	GetStats() (*BidangIlmuStats, error)
	GetList(page, limit int, search, sortBy, sortOrder string) (*BidangIlmuListResult, error)
	GetByIDSDM(idSDM string) ([]BidangIlmuListItem, error)
	SyncBidangIlmuByIDSDM(idSDM string, syncedBy string) (*SyncResult, error)
	SyncAllDosen(syncedBy string) (*BatchSyncResult, error)
}

type service struct {
	repo        Repository
	syncService *SyncService
}

// NewService creates a new bidang ilmu service
func NewService(repo Repository, sisterAPI *sister_api.Client) Service {
	return &service{
		repo:        repo,
		syncService: NewSyncService(repo, sisterAPI),
	}
}

// GetStats retrieves bidang ilmu statistics
func (s *service) GetStats() (*BidangIlmuStats, error) {
	return s.repo.GetStats()
}

// GetList retrieves paginated list of bidang ilmu
func (s *service) GetList(page, limit int, search, sortBy, sortOrder string) (*BidangIlmuListResult, error) {
	return s.repo.GetList(page, limit, search, sortBy, sortOrder)
}

// GetByIDSDM retrieves bidang ilmu for a specific dosen
func (s *service) GetByIDSDM(idSDM string) ([]BidangIlmuListItem, error) {
	return s.repo.GetByIDSDM(idSDM)
}

// SyncBidangIlmuByIDSDM syncs bidang ilmu for a single dosen
func (s *service) SyncBidangIlmuByIDSDM(idSDM string, syncedBy string) (*SyncResult, error) {
	return s.syncService.SyncBidangIlmuByIDSDM(idSDM, syncedBy)
}

// SyncAllDosen syncs bidang ilmu for all dosen using concurrent workers
func (s *service) SyncAllDosen(syncedBy string) (*BatchSyncResult, error) {
	startTime := time.Now()
	log.Printf("🚀 Starting batch sync of all dosen bidang ilmu by %s", syncedBy)

	// Get all active dosen IDs from database
	dosenIDs, err := s.getAllActiveDosenIDs()
	if err != nil {
		return nil, fmt.Errorf("failed to get dosen list: %w", err)
	}

	totalDosen := len(dosenIDs)
	log.Printf("📊 Total dosen to sync: %d", totalDosen)

	if totalDosen == 0 {
		return &BatchSyncResult{
			TotalDosen:   0,
			TotalSuccess: 0,
			TotalFailed:  0,
			Duration:     time.Since(startTime).String(),
			SyncedBy:     syncedBy,
		}, nil
	}

	// Use concurrent workers
	numWorkers := 3 // Adjust based on performance needs
	jobs := make(chan string, totalDosen)
	results := make(chan *SyncResult, totalDosen)

	// Worker pool
	var wg sync.WaitGroup
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for idSDM := range jobs {
				log.Printf("👷 Worker %d processing: %s", workerID, idSDM)
				result, err := s.syncService.SyncBidangIlmuByIDSDM(idSDM, syncedBy)
				if err != nil {
					log.Printf("❌ Worker %d failed to sync %s: %v", workerID, idSDM, err)
					results <- &SyncResult{
						IDSDM:        idSDM,
						Failed:       1,
						ErrorMessage: err.Error(),
					}
				} else {
					results <- result
				}
			}
		}(w)
	}

	// Send jobs
	go func() {
		for _, idSDM := range dosenIDs {
			jobs <- idSDM
		}
		close(jobs)
	}()

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	totalSuccess := 0
	totalFailed := 0
	var failedDosen []string

	for result := range results {
		if result.Failed > 0 {
			totalFailed++
			failedDosen = append(failedDosen, result.IDSDM)
		} else if result.Success > 0 {
			totalSuccess++
		}
	}

	endTime := time.Now()
	duration := endTime.Sub(startTime)

	batchResult := &BatchSyncResult{
		TotalDosen:   totalDosen,
		TotalSuccess: totalSuccess,
		TotalFailed:  totalFailed,
		Duration:     duration.String(),
		SyncedBy:     syncedBy,
		FailedDosen:  failedDosen,
	}

	log.Printf("✅ Batch sync completed in %s - Total: %d, Success: %d, Failed: %d",
		duration, totalDosen, totalSuccess, totalFailed)

	return batchResult, nil
}

// getAllActiveDosenIDs retrieves all active dosen IDs from database
func (s *service) getAllActiveDosenIDs() ([]string, error) {
	// This is a simple implementation - you might want to adjust the query
	// to only get dosen that are actually active
	query := `
		SELECT CONVERT(VARCHAR(36), id_sdm) as id_sdm
		FROM pdrd.sdm WITH (NOLOCK)
		WHERE soft_delete = 0
		  AND id_stat_aktif IN (1, 2, 3, 4, 5, 6)
		ORDER BY id_sdm
	`

	type DosenID struct {
		IDSDM string `db:"id_sdm"`
	}

	var dosen []DosenID
	if err := s.repo.(*repository).db.Select(&dosen, query); err != nil {
		return nil, fmt.Errorf("failed to query dosen: %w", err)
	}

	ids := make([]string, len(dosen))
	for i, d := range dosen {
		ids[i] = d.IDSDM
	}

	return ids, nil
}
