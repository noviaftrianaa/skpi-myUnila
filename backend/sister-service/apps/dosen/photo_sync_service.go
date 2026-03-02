package dosen

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"sister-service/apps/monitoring"
)

// SyncDosenPhotosToMinIO fetches all dosen photos from SISTER API and uploads to MinIO
func (s *service) SyncDosenPhotosToMinIO(syncedBy string) (*BatchPhotoSyncResult, error) {
	if s.minioClient == nil {
		return nil, fmt.Errorf("MinIO client not configured")
	}

	startTime := time.Now()

	// Start monitoring
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync("Sync Foto Dosen", "dosen-photo", "batch", syncedBy, 0)

	// Get all active dosen from database
	dosenList, err := s.repo.GetAllActiveDosenIDs()
	if err != nil {
		monitorSvc.FailSync(syncID, fmt.Sprintf("Failed to get dosen list: %v", err))
		s.logSyncResult("Foto Dosen", "dosen-photo", "batch", syncedBy, 0, startTime, err)
		return nil, fmt.Errorf("failed to get dosen list: %w", err)
	}

	totalDosen := len(dosenList)
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	log.Printf("📷 Starting photo sync for %d dosen...", totalDosen)

	// Worker pool setup
	numWorkers := 3
	jobs := make(chan DosenIDName, totalDosen)
	results := make(chan PhotoSyncResult, totalDosen)

	// Start workers
	var wg sync.WaitGroup
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.photoWorker(w, jobs, results, &wg)
	}

	// Send jobs
	for _, d := range dosenList {
		jobs <- d
	}
	close(jobs)

	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	var allResults []PhotoSyncResult
	successCount := 0
	failedCount := 0
	skippedCount := 0
	processed := 0

	for result := range results {
		allResults = append(allResults, result)
		processed++

		if result.Success {
			if result.MinIOPath == "skipped" {
				skippedCount++
			} else {
				successCount++
			}
		} else {
			failedCount++
		}

		// Update monitoring every 10 records
		if processed%10 == 0 || processed == totalDosen {
			monitorSvc.UpdateProgress(syncID, processed,
				fmt.Sprintf("Processing foto %d/%d (Success: %d, Skipped: %d, Failed: %d)",
					processed, totalDosen, successCount, skippedCount, failedCount))
		}
	}

	duration := time.Since(startTime)

	// Complete monitoring
	monitorSvc.CompleteSync(syncID,
		fmt.Sprintf("Photo sync completed: %d success, %d skipped, %d failed (duration: %s)",
			successCount, skippedCount, failedCount, duration.Round(time.Second)))

	// Log sync result
	s.logSyncResult("Foto Dosen", "dosen-photo", "batch", syncedBy, successCount, startTime, nil)

	log.Printf("✅ Photo sync completed: %d success, %d skipped, %d failed (duration: %s)",
		successCount, skippedCount, failedCount, duration.Round(time.Second))

	return &BatchPhotoSyncResult{
		TotalProcessed: totalDosen,
		TotalSuccess:   successCount,
		TotalFailed:    failedCount,
		TotalSkipped:   skippedCount,
		Duration:       duration.Round(time.Second).String(),
		SyncedBy:       syncedBy,
		Results:        allResults,
	}, nil
}

// photoWorker processes photo sync jobs
func (s *service) photoWorker(id int, jobs <-chan DosenIDName, results chan<- PhotoSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	for dosen := range jobs {
		result := s.syncSinglePhoto(dosen)
		results <- result

		// Rate limiting: 200ms delay per photo
		time.Sleep(200 * time.Millisecond)
	}
}

// syncSinglePhoto fetches a single dosen photo from SISTER and uploads to MinIO
func (s *service) syncSinglePhoto(dosen DosenIDName) PhotoSyncResult {
	objectPath := fmt.Sprintf("photos/sdm/%s.jpg", dosen.IDSDM)

	// Check if photo already exists in MinIO
	if s.minioClient.ObjectExists(objectPath) {
		return PhotoSyncResult{
			IDSDM:     dosen.IDSDM,
			Nama:      dosen.Nama,
			Success:   true,
			MinIOPath: "skipped", // Mark as skipped
		}
	}

	// Fetch photo from SISTER API
	photoBytes, contentType, err := s.sisterAPI.GetDosenPhoto(dosen.IDSDM)
	if err != nil {
		return PhotoSyncResult{
			IDSDM:   dosen.IDSDM,
			Nama:    dosen.Nama,
			Success: false,
			Error:   err.Error(),
		}
	}

	// Determine content type and file extension
	if contentType == "" {
		contentType = "image/jpeg"
	}

	// Upload to MinIO
	err = s.minioClient.PutObject(objectPath, photoBytes, contentType)
	if err != nil {
		return PhotoSyncResult{
			IDSDM:   dosen.IDSDM,
			Nama:    dosen.Nama,
			Success: false,
			Error:   fmt.Sprintf("upload failed: %v", err),
		}
	}

	// Also cache in Redis if available
	if s.redisClient != nil {
		cacheKey := fmt.Sprintf("dosen:photo:%s", dosen.IDSDM)
		cacheKeyType := fmt.Sprintf("dosen:photo:type:%s", dosen.IDSDM)
		cacheTTL := 7 * 24 * time.Hour
		s.redisClient.Set(context.Background(), cacheKey, photoBytes, cacheTTL)
		s.redisClient.Set(context.Background(), cacheKeyType, contentType, cacheTTL)
	}

	log.Printf("📷 Uploaded photo for %s (%s) - %d bytes", dosen.Nama, dosen.IDSDM, len(photoBytes))

	return PhotoSyncResult{
		IDSDM:       dosen.IDSDM,
		Nama:        dosen.Nama,
		Success:     true,
		FileSize:    len(photoBytes),
		ContentType: contentType,
		MinIOPath:   objectPath,
	}
}
