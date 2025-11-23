package mahasiswa

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/myunila/feeder-service/apps/logger"
)

// logSyncResult logs the sync operation result to database
func (s *service) logSyncResult(ctx context.Context, filter *SyncFilter, syncedBy string, result *BatchMahasiswaSyncResult, startTime time.Time, err error) {
	if s.loggerService == nil {
		log.Printf("⚠️  Logger service not initialized, skipping sync log")
		return
	}

	// Determine sync type
	syncType := "manual"
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	} else if filter != nil && len(filter.Angkatan) > 1 {
		syncType = "batch"
	}

	// Calculate duration
	duration := int(time.Since(startTime).Milliseconds())

	// Determine status
	status := "success"
	var errorMsg *string
	var errorDetails *string
	totalRecords := 0
	insertedCount := 0
	failedCount := 0

	if result != nil {
		totalRecords = result.TotalProcessed
		insertedCount = result.TotalSuccess
		failedCount = result.TotalFailed
	}

	if err != nil {
		if totalRecords > 0 {
			status = "partial"
		} else {
			status = "failed"
		}
		errMsg := err.Error()
		errorMsg = &errMsg
		errDetails := fmt.Sprintf("%+v", err)
		errorDetails = &errDetails
	}

	// Build endpoint name with filter info
	endpointName := "Sync Mahasiswa"
	if filter != nil && len(filter.Angkatan) > 0 {
		endpointName = fmt.Sprintf("Sync Mahasiswa Angkatan %s", strings.Join(filter.Angkatan, ", "))
	}

	// Create log request
	// Note: APICode is auto-filled by logger service from config
	logReq := &logger.CreateSyncLogRequest{
		EndpointName:  endpointName,
		EndpointKey:   "mahasiswa",
		SyncType:      syncType,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: insertedCount,
		UpdatedCount:  0, // Not tracked for mahasiswa sync
		FailedCount:   failedCount,
		SkippedCount:  0,
		DurationMs:    &duration,
		ErrorMessage:  errorMsg,
		ErrorDetails:  errorDetails,
		SyncedBy:      syncedBy,
	}

	// Log to database
	_, logErr := s.loggerService.LogSync(ctx, logReq)
	if logErr != nil {
		log.Printf("⚠️  Failed to write sync log: %v", logErr)
	} else {
		log.Printf("✅ Sync log written for %s (status: %s, records: %d, duration: %dms)", endpointName, status, totalRecords, duration)
	}
}
