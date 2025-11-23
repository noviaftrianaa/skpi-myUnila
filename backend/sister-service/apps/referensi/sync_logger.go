package referensi

import (
	"context"
	"fmt"
	"log"
	"sister-service/apps/logger"
	"time"
)

// syncLogger wraps logger service for sync operations
type syncLogger struct {
	service logger.Service
}

// logSyncResult logs the sync operation result
func (s *service) logSyncResult(ctx context.Context, endpointName, endpointKey, syncType, syncedBy string, totalRecords int, startTime time.Time, err error) {
	if s.loggerService == nil {
		log.Printf("⚠️  Logger service not initialized, skipping sync log")
		return
	}

	// Auto-detect sync type based on syncedBy value
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	// Calculate duration
	duration := int(time.Since(startTime).Milliseconds())

	// Determine status
	status := "success"
	var errorMsg *string
	var errorDetails *string

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

	// Create log request
	// Note: APICode is auto-filled by logger service from config
	logReq := &logger.CreateSyncLogRequest{
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        status,
		TotalRecords:  totalRecords,
		InsertedCount: 0, // Will be populated when we track individual operations
		UpdatedCount:  0, // Will be populated when we track individual operations
		FailedCount:   0,
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
