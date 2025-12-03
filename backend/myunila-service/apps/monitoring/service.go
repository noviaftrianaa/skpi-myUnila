package monitoring

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// Service interface for monitoring operations
type Service interface {
	StartSync(endpointName, endpointKey, syncType, syncedBy string, totalRecords int) string
	UpdateProgress(syncID string, currentRecord int, message string)
	UpdateTotalRecords(syncID string, totalRecords int)
	CompleteSync(syncID string, message string)
	FailSync(syncID string, errorMessage string)
	GetSyncProgress(syncID string) *SyncProgress
	GetActiveSyncs() []SyncProgress
	GetStats() MonitoringStats
}

type service struct {
	syncs     map[string]*SyncProgress
	mu        sync.RWMutex
	completed int
	failed    int
}

var (
	instance *service
	once     sync.Once
)

// GetInstance returns singleton instance of monitoring service
func GetInstance() Service {
	once.Do(func() {
		instance = &service{
			syncs: make(map[string]*SyncProgress),
		}
		// Start cleanup goroutine
		go instance.cleanup()
	})
	return instance
}

// NewService creates monitoring service (returns singleton)
func NewService() Service {
	return GetInstance()
}

// cleanup removes old completed/failed syncs
func (s *service) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for id, sync := range s.syncs {
			// Remove completed/failed syncs older than 30 minutes
			if (sync.Status == "completed" || sync.Status == "failed") &&
				now.Sub(sync.UpdatedAt) > 30*time.Minute {
				delete(s.syncs, id)
			}
		}
		s.mu.Unlock()
	}
}

// StartSync starts tracking a new sync operation
func (s *service) StartSync(endpointName, endpointKey, syncType, syncedBy string, totalRecords int) string {
	s.mu.Lock()
	defer s.mu.Unlock()

	syncID := uuid.New().String()
	now := time.Now()

	s.syncs[syncID] = &SyncProgress{
		ID:            syncID,
		EndpointName:  endpointName,
		EndpointKey:   endpointKey,
		SyncType:      syncType,
		Status:        "running",
		Progress:      0,
		CurrentRecord: 0,
		TotalRecords:  totalRecords,
		StartedAt:     now,
		UpdatedAt:     now,
		Message:       "Starting sync...",
		SyncedBy:      syncedBy,
	}

	return syncID
}

// UpdateProgress updates the progress of a sync operation
func (s *service) UpdateProgress(syncID string, currentRecord int, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sync, exists := s.syncs[syncID]; exists {
		sync.CurrentRecord = currentRecord
		sync.Message = message
		sync.UpdatedAt = time.Now()

		if sync.TotalRecords > 0 {
			sync.Progress = (currentRecord * 100) / sync.TotalRecords
		}
	}
}

// UpdateTotalRecords updates the total records count
func (s *service) UpdateTotalRecords(syncID string, totalRecords int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sync, exists := s.syncs[syncID]; exists {
		sync.TotalRecords = totalRecords
		sync.UpdatedAt = time.Now()

		if totalRecords > 0 {
			sync.Progress = (sync.CurrentRecord * 100) / totalRecords
		}
	}
}

// CompleteSync marks a sync as completed
func (s *service) CompleteSync(syncID string, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sync, exists := s.syncs[syncID]; exists {
		sync.Status = "completed"
		sync.Progress = 100
		sync.Message = message
		sync.UpdatedAt = time.Now()
		s.completed++
	}
}

// FailSync marks a sync as failed
func (s *service) FailSync(syncID string, errorMessage string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sync, exists := s.syncs[syncID]; exists {
		sync.Status = "failed"
		sync.Error = errorMessage
		sync.Message = "Sync failed"
		sync.UpdatedAt = time.Now()
		s.failed++
	}
}

// GetSyncProgress gets the progress of a specific sync
func (s *service) GetSyncProgress(syncID string) *SyncProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if sync, exists := s.syncs[syncID]; exists {
		// Return a copy
		copy := *sync
		return &copy
	}
	return nil
}

// GetActiveSyncs returns all active sync operations
func (s *service) GetActiveSyncs() []SyncProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	active := []SyncProgress{}
	for _, sync := range s.syncs {
		if sync.Status == "running" {
			active = append(active, *sync)
		}
	}
	return active
}

// GetStats returns overall monitoring statistics
func (s *service) GetStats() MonitoringStats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stats := MonitoringStats{
		CompletedToday: s.completed,
		FailedToday:    s.failed,
	}

	var lastSync time.Time
	for _, sync := range s.syncs {
		if sync.Status == "running" {
			stats.ActiveSyncs++
		}
		if sync.UpdatedAt.After(lastSync) {
			lastSync = sync.UpdatedAt
		}
	}
	stats.LastSyncAt = lastSync

	return stats
}
