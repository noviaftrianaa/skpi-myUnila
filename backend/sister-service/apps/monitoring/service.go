package monitoring

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
	"sister-service/pkg/timeutil"
)

// Service handles in-memory monitoring of sync operations
type Service struct {
	mu            sync.RWMutex
	activeSyncs   map[string]*SyncProgress // Map of sync ID to progress
	completedToday int
	failedToday    int
	lastResetDate  time.Time
}

var (
	instance *Service
	once     sync.Once
)

// GetInstance returns singleton instance of monitoring service
func GetInstance() *Service {
	once.Do(func() {
		instance = &Service{
			activeSyncs:   make(map[string]*SyncProgress),
			lastResetDate: timeutil.NowWIB(),
		}
		// Start cleanup goroutine
		go instance.cleanupRoutine()
	})
	return instance
}

// StartSync registers a new sync operation
func (s *Service) StartSync(endpointName, endpointKey, syncType, syncedBy string, totalRecords int) string {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Reset daily stats if new day
	s.checkDailyReset()

	id := uuid.New().String()
	now := timeutil.NowWIB()

	progress := &SyncProgress{
		ID:            id,
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        "running",
		Progress:      0,
		CurrentRecord: 0,
		TotalRecords:  totalRecords,
		StartedAt:     now,
		UpdatedAt:     now,
		Message:       "Memulai sinkronisasi...",
		SyncedBy:      syncedBy,
	}

	s.activeSyncs[id] = progress
	return id
}

// UpdateProgress updates sync progress
func (s *Service) UpdateProgress(id string, currentRecord int, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	progress, exists := s.activeSyncs[id]
	if !exists {
		return
	}

	progress.CurrentRecord = currentRecord
	progress.UpdatedAt = timeutil.NowWIB()
	progress.Message = message

	if progress.TotalRecords > 0 {
		progress.Progress = (currentRecord * 100) / progress.TotalRecords
		if progress.Progress > 100 {
			progress.Progress = 100
		}
	}
}

// UpdateTotalRecords updates the total records count (useful when initial count is unknown)
func (s *Service) UpdateTotalRecords(id string, totalRecords int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	progress, exists := s.activeSyncs[id]
	if !exists {
		return
	}

	progress.TotalRecords = totalRecords
	progress.UpdatedAt = timeutil.NowWIB()

	// Recalculate progress with new total
	if totalRecords > 0 {
		progress.Progress = (progress.CurrentRecord * 100) / totalRecords
		if progress.Progress > 100 {
			progress.Progress = 100
		}
	}
}

// CompleteSync marks sync as completed
func (s *Service) CompleteSync(id string, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	progress, exists := s.activeSyncs[id]
	if !exists {
		return
	}

	progress.Status = "completed"
	progress.Progress = 100
	progress.UpdatedAt = timeutil.NowWIB()
	progress.Message = message

	s.completedToday++

	// Remove after 30 seconds
	go s.removeAfterDelay(id, 30*time.Second)
}

// FailSync marks sync as failed
func (s *Service) FailSync(id string, errorMsg string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	progress, exists := s.activeSyncs[id]
	if !exists {
		return
	}

	progress.Status = "failed"
	progress.UpdatedAt = timeutil.NowWIB()
	progress.Error = errorMsg
	progress.Message = "Sinkronisasi gagal"

	s.failedToday++

	// Remove after 60 seconds
	go s.removeAfterDelay(id, 60*time.Second)
}

// GetActiveSyncs returns all active sync operations
func (s *Service) GetActiveSyncs(ctx context.Context) *MonitoringListResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	syncs := make([]SyncProgress, 0, len(s.activeSyncs))
	activeSyncsCount := 0
	var totalDuration int64 = 0
	var lastSyncAt time.Time

	for _, progress := range s.activeSyncs {
		syncs = append(syncs, *progress)

		if progress.Status == "running" {
			activeSyncsCount++
		}

		// Calculate duration for completed/failed syncs
		if progress.Status != "running" {
			duration := progress.UpdatedAt.Sub(progress.StartedAt).Milliseconds()
			totalDuration += duration
		}

		if progress.StartedAt.After(lastSyncAt) {
			lastSyncAt = progress.StartedAt
		}
	}

	stats := MonitoringStats{
		ActiveSyncs:    activeSyncsCount,
		CompletedToday: s.completedToday,
		FailedToday:    s.failedToday,
		TotalDuration:  totalDuration,
		LastSyncAt:     lastSyncAt,
	}

	return &MonitoringListResponse{
		ActiveSyncs: syncs,
		Stats:       stats,
		UpdatedAt:   timeutil.NowWIB(),
	}
}

// GetSyncByID returns specific sync progress
func (s *Service) GetSyncByID(id string) *SyncProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	progress, exists := s.activeSyncs[id]
	if !exists {
		return nil
	}

	// Return a copy
	copy := *progress
	return &copy
}

// removeAfterDelay removes sync from memory after delay
func (s *Service) removeAfterDelay(id string, delay time.Duration) {
	time.Sleep(delay)

	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.activeSyncs, id)
}

// checkDailyReset resets daily counters if new day
func (s *Service) checkDailyReset() {
	now := timeutil.NowWIB()
	if now.Day() != s.lastResetDate.Day() || now.Month() != s.lastResetDate.Month() || now.Year() != s.lastResetDate.Year() {
		s.completedToday = 0
		s.failedToday = 0
		s.lastResetDate = now
	}
}

// cleanupRoutine periodically cleans up old completed/failed syncs
func (s *Service) cleanupRoutine() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := timeutil.NowWIB()

		for id, progress := range s.activeSyncs {
			// Remove completed/failed syncs older than 5 minutes
			if progress.Status != "running" {
				if now.Sub(progress.UpdatedAt) > 5*time.Minute {
					delete(s.activeSyncs, id)
				}
			}
		}

		s.mu.Unlock()
	}
}
