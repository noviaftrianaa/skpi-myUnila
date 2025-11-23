package logger

import (
	"context"
	"fmt"
	"math"
	"sister-service/internal/config"
)

type Service interface {
	LogSync(ctx context.Context, req *CreateSyncLogRequest) (*SyncLog, error)
	GetSyncLogs(ctx context.Context, filter *SyncLogFilter) (*SyncLogResponse, error)
	GetSyncLogByID(ctx context.Context, id int64) (*SyncLog, error)
	GetRecentSyncLogs(ctx context.Context, limit int) ([]SyncLog, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// LogSync creates a new sync log entry
func (s *service) LogSync(ctx context.Context, req *CreateSyncLogRequest) (*SyncLog, error) {
	// Validate request
	if req.EndpointName == "" {
		return nil, fmt.Errorf("endpoint_name is required")
	}
	if req.EndpointKey == "" {
		return nil, fmt.Errorf("endpoint_key is required")
	}
	if req.SyncType == "" {
		req.SyncType = "manual"
	}
	if req.Status == "" {
		return nil, fmt.Errorf("status is required")
	}

	// Set default api_code from config if not provided
	if req.APICode == "" {
		req.APICode = config.Cfg.SisterAPI.APICode
		if req.APICode == "" {
			req.APICode = "SISTER" // Fallback default
		}
	}

	// Validate status value
	validStatuses := map[string]bool{"success": true, "failed": true, "partial": true}
	if !validStatuses[req.Status] {
		return nil, fmt.Errorf("invalid status: must be one of 'success', 'failed', 'partial'")
	}

	// Validate sync type
	validSyncTypes := map[string]bool{"manual": true, "batch": true, "scheduled": true}
	if !validSyncTypes[req.SyncType] {
		return nil, fmt.Errorf("invalid sync_type: must be one of 'manual', 'batch', 'scheduled'")
	}

	return s.repo.CreateSyncLog(ctx, req)
}

// GetSyncLogs retrieves sync logs with filtering and pagination
func (s *service) GetSyncLogs(ctx context.Context, filter *SyncLogFilter) (*SyncLogResponse, error) {
	if filter == nil {
		filter = &SyncLogFilter{}
	}

	// Set default pagination
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	if filter.Offset < 0 {
		filter.Offset = 0
	}

	logs, total, err := s.repo.GetSyncLogs(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Calculate pagination info
	page := (filter.Offset / filter.Limit) + 1
	totalPages := int(math.Ceil(float64(total) / float64(filter.Limit)))

	return &SyncLogResponse{
		Data:       logs,
		Total:      total,
		Page:       page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

// GetSyncLogByID retrieves a single sync log by ID
func (s *service) GetSyncLogByID(ctx context.Context, id int64) (*SyncLog, error) {
	if id <= 0 {
		return nil, fmt.Errorf("invalid id")
	}

	log, err := s.repo.GetSyncLogByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if log == nil {
		return nil, fmt.Errorf("sync log not found")
	}

	return log, nil
}

// GetRecentSyncLogs retrieves the most recent sync logs
func (s *service) GetRecentSyncLogs(ctx context.Context, limit int) ([]SyncLog, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // Max limit
	}

	return s.repo.GetRecentSyncLogs(ctx, limit)
}
