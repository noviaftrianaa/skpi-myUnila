package synclog

import (
	"context"
	"fmt"
	"math"
)

type Service interface {
	GetList(ctx context.Context, req SyncLogListRequest) (*SyncLogListResponse, error)
	GetByID(ctx context.Context, id int64) (*SyncLog, error)
	GetStats(ctx context.Context) (*SyncLogStats, error)
	GetStatsByEndpoint(ctx context.Context, endpointKey string) (*SyncLogStats, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{
		repo: repo,
	}
}

// GetList retrieves paginated sync logs with filtering
func (s *service) GetList(ctx context.Context, req SyncLogListRequest) (*SyncLogListResponse, error) {
	// Set default pagination
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}

	// Get data from repository
	logs, total, err := s.repo.GetList(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync logs: %w", err)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(req.Limit)))

	return &SyncLogListResponse{
		Data:       logs,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	}, nil
}

// GetByID retrieves a single sync log by ID
func (s *service) GetByID(ctx context.Context, id int64) (*SyncLog, error) {
	log, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync log: %w", err)
	}
	return log, nil
}

// GetStats retrieves overall sync log statistics
func (s *service) GetStats(ctx context.Context) (*SyncLogStats, error) {
	stats, err := s.repo.GetStats(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync log stats: %w", err)
	}
	return stats, nil
}

// GetStatsByEndpoint retrieves sync log statistics for a specific endpoint
func (s *service) GetStatsByEndpoint(ctx context.Context, endpointKey string) (*SyncLogStats, error) {
	if endpointKey == "" {
		return nil, fmt.Errorf("endpoint_key is required")
	}

	stats, err := s.repo.GetStatsByEndpoint(ctx, endpointKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync log stats by endpoint: %w", err)
	}
	return stats, nil
}
