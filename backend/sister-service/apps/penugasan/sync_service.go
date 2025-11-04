package penugasan

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)

// BatchSyncPenugasan syncs penugasan for all active dosen with 3-worker pool
func (s *service) BatchSyncPenugasan(syncedBy string) (*BatchPenugasanSyncAllResult, error) {
	startTime := time.Now()

	log.Printf("🔄 Starting batch penugasan sync (synced_by: %s)", syncedBy)

	// Step 1: Get total count of active dosen
	log.Printf("📋 Counting active dosen from database...")
	totalDosen, err := s.repo.GetActiveDosenCount()
	if err != nil {
		s.logSyncResult("Penugasan", "penugasan", "batch", syncedBy, 0, 0, 0, startTime, err)
		return nil, fmt.Errorf("failed to count active dosen: %w", err)
	}

	log.Printf("✅ Found %d active dosen to process", totalDosen)

	if totalDosen == 0 {
		log.Printf("⚠️  No active dosen found")
		s.logSyncResult("Penugasan", "penugasan", "batch", syncedBy, 0, 0, 0, startTime, nil)
		return &BatchPenugasanSyncAllResult{
			TotalDosen:     0,
			TotalProcessed: 0,
			TotalSuccess:   0,
			TotalFailed:    0,
			Duration:       time.Since(startTime).String(),
			Results:        []PenugasanSyncResult{},
			SyncedBy:       syncedBy,
		}, nil
	}

	// Step 2: Setup worker pool with 3 goroutines
	numWorkers := 3
	batchSize := 100 // Fetch 100 dosen at a time from DB
	jobs := make(chan DosenInfo, numWorkers*2) // Smaller buffer since we're fetching in batches
	results := make(chan []PenugasanSyncResult, numWorkers*2)

	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.penugasanWorker(w, jobs, results, syncedBy, &wg)
	}

	// Step 3: Feed dosen to workers in batches
	go func() {
		offset := 0
		for offset < totalDosen {
			log.Printf("📥 Fetching dosen batch: offset=%d, limit=%d", offset, batchSize)

			dosenBatch, err := s.repo.GetActiveDosenBatch(offset, batchSize)
			if err != nil {
				log.Printf("❌ Failed to fetch dosen batch at offset %d: %v", offset, err)
				break
			}

			if len(dosenBatch) == 0 {
				log.Printf("⚠️  No more dosen to fetch")
				break
			}

			log.Printf("✅ Fetched %d dosen in current batch", len(dosenBatch))

			// Send batch to workers
			for _, dosen := range dosenBatch {
				jobs <- dosen
			}

			offset += batchSize
		}
		close(jobs)
		log.Printf("✅ All dosen batches sent to workers")
	}()

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect all results
	allResults := []PenugasanSyncResult{}
	totalProcessed := 0
	totalSuccess := 0
	totalFailed := 0
	dosenProcessed := 0

	// Track unique error messages
	errorCounts := make(map[string]int)

	for workerResults := range results {
		allResults = append(allResults, workerResults...)
		dosenProcessed++

		for _, r := range workerResults {
			totalProcessed++
			if r.Success {
				totalSuccess++
			} else {
				totalFailed++
				// Track error frequency
				if r.Error != "" {
					errorCounts[r.Error]++
				}
			}
		}

		// Progress logging every 100 dosen
		if dosenProcessed%100 == 0 {
			log.Printf("📊 Progress: %d/%d dosen processed (%d penugasan: %d success, %d failed)",
				dosenProcessed, totalDosen, totalProcessed, totalSuccess, totalFailed)
		}
	}

	// Log error summary
	if len(errorCounts) > 0 {
		log.Printf("⚠️  Error Summary:")
		for errMsg, count := range errorCounts {
			log.Printf("   - [%d occurrences] %s", count, errMsg)
		}
	}

	duration := time.Since(startTime)
	log.Printf("📊 Batch sync completed: %d dosen, %d penugasan processed, %d success, %d failed, duration: %s",
		totalDosen, totalProcessed, totalSuccess, totalFailed, duration)

	// Log the batch sync result
	var syncErr error
	if totalFailed > 0 {
		syncErr = fmt.Errorf("%d of %d penugasan failed to sync", totalFailed, totalProcessed)
	}
	s.logSyncResult("Penugasan", "penugasan", "batch", syncedBy, totalProcessed, totalSuccess, totalFailed, startTime, syncErr)

	return &BatchPenugasanSyncAllResult{
		TotalDosen:     totalDosen,
		TotalProcessed: totalProcessed,
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		Duration:       duration.String(),
		Results:        allResults,
		SyncedBy:       syncedBy,
	}, nil
}

// penugasanWorker is the worker goroutine that processes penugasan sync for each dosen
func (s *service) penugasanWorker(id int, jobs <-chan DosenInfo, results chan<- []PenugasanSyncResult, syncedBy string, wg *sync.WaitGroup) {
	defer wg.Done()

	for dosen := range jobs {
		log.Printf("🔧 Worker %d: Processing penugasan for dosen %s (%s)", id, dosen.Nama, dosen.IDSDM)

		workerResults := s.syncPenugasanForDosen(dosen, syncedBy)
		results <- workerResults

		// Rate limiting to avoid overwhelming Sister API
		time.Sleep(200 * time.Millisecond)
	}

	log.Printf("✅ Worker %d: Finished", id)
}

// syncPenugasanForDosen syncs all penugasan for a single dosen (used by worker)
func (s *service) syncPenugasanForDosen(dosen DosenInfo, syncedBy string) []PenugasanSyncResult {
	results := []PenugasanSyncResult{}

	// Fetch list of penugasan from Sister API
	rawList, err := s.sisterAPI.GetPenugasanByIDSDM(dosen.IDSDM)
	if err != nil {
		// Return error result for this dosen
		errMsg := fmt.Sprintf("failed to fetch penugasan list: %v", err)
		log.Printf("❌ %s for dosen %s (%s)", errMsg, dosen.Nama, dosen.IDSDM)
		results = append(results, PenugasanSyncResult{
			IDRegPTK: "",
			IDSDM:    dosen.IDSDM,
			Nama:     dosen.Nama,
			Success:  false,
			Error:    errMsg,
		})
		return results
	}

	// Parse list response
	var penugasanList []SisterPenugasanListItem
	if err := json.Unmarshal(rawList, &penugasanList); err != nil {
		results = append(results, PenugasanSyncResult{
			IDRegPTK: "",
			IDSDM:    dosen.IDSDM,
			Nama:     dosen.Nama,
			Success:  false,
			Error:    fmt.Sprintf("failed to parse penugasan list: %v", err),
		})
		return results
	}

	// If no penugasan, return empty success
	if len(penugasanList) == 0 {
		log.Printf("ℹ️  No penugasan found for dosen %s", dosen.Nama)
		return results
	}

	// Process each penugasan
	for _, item := range penugasanList {
		result := s.processPenugasan(item.ID, dosen.IDSDM)
		result.Nama = dosen.Nama // Add dosen name for display
		results = append(results, result)

		if !result.Success {
			log.Printf("❌ Failed to sync penugasan %s for %s: %s", item.ID, dosen.Nama, result.Error)
		}
	}

	log.Printf("✅ Synced %d penugasan for dosen %s", len(penugasanList), dosen.Nama)
	return results
}
