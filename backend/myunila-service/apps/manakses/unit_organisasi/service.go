package unit_organisasi

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service interface for unit organisasi business logic
type Service interface {
	GetStats(ctx context.Context) (*SyncStats, error)
	GetSMSList(ctx context.Context, page, limit int, search string) (*UnitOrganisasiListResult, error)
	GetUnitOrganisasiList(ctx context.Context, page, limit int, search string) (*UnitOrganisasiListResult, error)
	SyncFromSMS(ctx context.Context, syncedBy string) (*SyncResult, error)
	GetComparisonList(ctx context.Context, page, limit int, search string, filter string) (*ComparisonListResult, error)
}

// ComparisonListResult holds paginated comparison result
type ComparisonListResult struct {
	Data       []*ComparisonItem `json:"data"`
	Total      int               `json:"total"`
	Page       int               `json:"page"`
	Limit      int               `json:"limit"`
	TotalPages int               `json:"total_pages"`
}

type service struct {
	repo       Repository
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

// NewService creates a new unit organisasi service
func NewService(repo Repository) Service {
	return &service{
		repo:       repo,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

// GetStats returns statistics for dashboard
func (s *service) GetStats(ctx context.Context) (*SyncStats, error) {
	return s.repo.GetStats(ctx)
}

// GetSMSList returns paginated list of SMS
func (s *service) GetSMSList(ctx context.Context, page, limit int, search string) (*UnitOrganisasiListResult, error) {
	smsList, total, err := s.repo.GetSMSList(ctx, page, limit, search)
	if err != nil {
		return nil, err
	}

	// Convert SMS to UnitOrganisasiListItem for consistent response
	items := make([]*UnitOrganisasiListItem, len(smsList))
	for i, sms := range smsList {
		dsKel := "Bandar Lampung"
		if sms.DsKel != nil && *sms.DsKel != "" {
			dsKel = *sms.DsKel
		}
		items[i] = &UnitOrganisasiListItem{
			IDOrganisasi: sms.IDSMS,
			NmLemb:       sms.NmLemb,
			DsKel:        dsKel,
			KodePos:      sms.KodePos,
			NoTel:        sms.NoTel,
			Email:        sms.Email,
			AAktif:       1,
			LastSync:     &sms.LastSync,
		}
	}

	totalPages := (total + limit - 1) / limit

	return &UnitOrganisasiListResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetUnitOrganisasiList returns paginated list of unit organisasi
func (s *service) GetUnitOrganisasiList(ctx context.Context, page, limit int, search string) (*UnitOrganisasiListResult, error) {
	list, total, err := s.repo.GetUnitOrganisasiList(ctx, page, limit, search)
	if err != nil {
		return nil, err
	}

	totalPages := (total + limit - 1) / limit

	return &UnitOrganisasiListResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// SyncFromSMS syncs data from pdrd.sms to man_akses.unit_organisasi with logging
func (s *service) SyncFromSMS(ctx context.Context, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()
	syncType := "manual"

	log.Printf("🔄 [Unit Organisasi Sync] Starting %s sync from SMS to Unit Organisasi", syncType)

	// Start monitoring
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Unit Organisasi SMS", "unit_organisasi", syncType, syncedBy, 0)
	}

	// Execute sync
	result, err := s.repo.SyncFromSMS(ctx, syncedBy)
	if err != nil {
		errMsg := fmt.Sprintf("failed to sync unit organisasi: %v", err)
		log.Printf("❌ [Unit Organisasi Sync] %s", errMsg)

		durationMs := int(time.Since(startTime).Milliseconds())
		s.logSyncResult(ctx, syncType, "failed", syncedBy, 0, 0, 0, 0, 0, durationMs, &errMsg, nil)

		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.FailSync(syncID, errMsg)
		}
		return nil, err
	}

	// Update monitoring with total records
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, result.TotalProcessed)
		s.monitorSvc.UpdateProgress(syncID, result.TotalProcessed, "Sync completed")
	}

	duration := time.Since(startTime)
	durationMs := int(duration.Milliseconds())

	// Determine status
	status := "success"
	if result.TotalFailed > 0 && (result.TotalInserted > 0 || result.TotalUpdated > 0) {
		status = "partial"
	} else if result.TotalFailed > 0 && result.TotalInserted == 0 && result.TotalUpdated == 0 {
		status = "failed"
	}

	// Prepare error details for logging
	var errDetails *string
	if len(result.Errors) > 0 {
		// Limit error details to first 10 errors
		maxErrors := 10
		if len(result.Errors) > maxErrors {
			errSummary := fmt.Sprintf("First %d of %d errors:\n%s\n... and %d more errors",
				maxErrors, len(result.Errors),
				joinErrors(result.Errors[:maxErrors]),
				len(result.Errors)-maxErrors)
			errDetails = &errSummary
		} else {
			errSummary := joinErrors(result.Errors)
			errDetails = &errSummary
		}
	}

	// Log sync result
	s.logSyncResult(ctx, syncType, status, syncedBy, result.TotalProcessed, result.TotalInserted, result.TotalUpdated, result.TotalFailed, 0, durationMs, nil, errDetails)

	// Complete monitoring
	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.CompleteSync(syncID, fmt.Sprintf("Sync completed: %d inserted, %d updated, %d failed", result.TotalInserted, result.TotalUpdated, result.TotalFailed))
	}

	log.Printf("✅ [Unit Organisasi Sync] Complete - %d processed, %d inserted, %d updated, %d failed, duration: %s",
		result.TotalProcessed, result.TotalInserted, result.TotalUpdated, result.TotalFailed, result.Duration)

	return result, nil
}

// joinErrors joins error messages with newline
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

// logSyncResult logs the sync result to database
func (s *service) logSyncResult(ctx context.Context, syncType, status, syncedBy string, total, inserted, updated, failed, skipped, durationMs int, errMsg, errDetails *string) {
	// Get logger service lazily at runtime
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		log.Printf("⚠️  [Unit Organisasi Sync] Logger service not available, skipping log")
		return
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Unit Organisasi SMS",
		EndpointKey:   "unit_organisasi",
		SyncType:      syncType,
		Status:        status,
		APICode:       "SMS",
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

	_, err := loggerSvc.LogSync(ctx, req)
	if err != nil {
		log.Printf("⚠️  [Unit Organisasi Sync] Failed to log sync result: %v", err)
	}
}

// GetComparisonList returns comparison between SMS and unit_organisasi
func (s *service) GetComparisonList(ctx context.Context, page, limit int, search string, filter string) (*ComparisonListResult, error) {
	list, total, err := s.repo.GetComparisonList(ctx, page, limit, search, filter)
	if err != nil {
		return nil, err
	}

	totalPages := (total + limit - 1) / limit

	return &ComparisonListResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}
