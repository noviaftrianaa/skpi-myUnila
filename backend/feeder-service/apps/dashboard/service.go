package dashboard

import (
	"context"
	"sync"
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
// Uses parallel goroutines for faster response
func (s *service) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{
		APIStatus: "healthy",
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error

	// Run all queries in parallel
	wg.Add(5)

	// 1. Get module stats
	go func() {
		defer wg.Done()
		moduleStats, err := s.repo.GetModuleStats(ctx)
		mu.Lock()
		defer mu.Unlock()
		if err != nil && firstErr == nil {
			firstErr = err
			return
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
	}()

	// 2. Get recent syncs
	go func() {
		defer wg.Done()
		recentSyncs, err := s.repo.GetRecentSyncs(ctx, 10)
		mu.Lock()
		defer mu.Unlock()
		if err != nil && firstErr == nil {
			firstErr = err
			return
		}
		stats.RecentSyncs = recentSyncs
	}()

	// 3. Get quick stats
	go func() {
		defer wg.Done()
		quickStats, err := s.repo.GetQuickStats(ctx)
		mu.Lock()
		defer mu.Unlock()
		if err != nil && firstErr == nil {
			firstErr = err
			return
		}
		if quickStats != nil {
			stats.QuickStats = *quickStats
		}
	}()

	// 4. Get last sync time
	go func() {
		defer wg.Done()
		lastSync, err := s.repo.GetLastSyncTime(ctx)
		mu.Lock()
		defer mu.Unlock()
		if err != nil && firstErr == nil {
			firstErr = err
			return
		}
		stats.LastSyncTime = lastSync
	}()

	// 5. Get total records synced
	go func() {
		defer wg.Done()
		totalRecords, err := s.repo.GetTotalRecordsSynced(ctx)
		mu.Lock()
		defer mu.Unlock()
		if err != nil && firstErr == nil {
			firstErr = err
			return
		}
		stats.TotalRecordsSynced = totalRecords
	}()

	// Wait for all goroutines to complete
	wg.Wait()

	if firstErr != nil {
		return nil, firstErr
	}

	return stats, nil
}
