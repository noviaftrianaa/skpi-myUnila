package dashboard

import (
	"context"
)

type Service interface {
	GetDashboardStats(ctx context.Context) (*DashboardStats, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// GetDashboardStats returns comprehensive dashboard statistics
func (s *service) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{
		APIStatus: "healthy", // Default to healthy, can be checked later
	}

	// Get module stats
	moduleStats, err := s.repo.GetModuleStats(ctx)
	if err != nil {
		return nil, err
	}
	stats.ModuleStats = moduleStats

	// Calculate synced endpoints
	stats.TotalEndpoints = len(moduleStats)
	syncedCount := 0
	for _, m := range moduleStats {
		if m.Status == "active" {
			syncedCount++
		}
	}
	stats.SyncedEndpoints = syncedCount

	// Calculate success rate
	if stats.TotalEndpoints > 0 {
		stats.SuccessRate = float64(syncedCount) / float64(stats.TotalEndpoints) * 100
	}

	// Get recent syncs
	recentSyncs, err := s.repo.GetRecentSyncs(ctx, 10)
	if err != nil {
		return nil, err
	}
	stats.RecentSyncs = recentSyncs

	// Get quick stats
	quickStats, err := s.repo.GetQuickStats(ctx)
	if err != nil {
		return nil, err
	}
	stats.QuickStats = *quickStats

	// Get last sync time
	lastSync, err := s.repo.GetLastSyncTime(ctx)
	if err != nil {
		return nil, err
	}
	stats.LastSyncTime = lastSync

	// Get total records synced
	totalRecords, err := s.repo.GetTotalRecordsSynced(ctx)
	if err != nil {
		return nil, err
	}
	stats.TotalRecordsSynced = totalRecords

	return stats, nil
}
