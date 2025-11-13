package riwayat_fungsional

import (
	"fmt"
	"log"
)

// Service provides business logic for riwayat fungsional
type Service struct {
	repo        Repository
	syncService *SyncService
}

// NewService creates a new Service
func NewService(repo Repository, syncService *SyncService) *Service {
	return &Service{
		repo:        repo,
		syncService: syncService,
	}
}

// GetRwyFungsionalByID retrieves a single riwayat fungsional by ID
func (s *Service) GetRwyFungsionalByID(idRwyJabfung string) (*RwyFungsionalWithDetail, error) {
	return s.repo.GetRwyFungsionalByID(idRwyJabfung)
}

// GetRwyFungsionalList retrieves paginated list of riwayat fungsional
func (s *Service) GetRwyFungsionalList(page, limit int, search, sortBy, sortOrder string) (*RiwayatFungsionalListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return s.repo.GetRwyFungsionalList(page, limit, search, sortBy, sortOrder)
}

// GetRwyFungsionalStats retrieves statistics
func (s *Service) GetRwyFungsionalStats() (*RiwayatFungsionalStats, error) {
	return s.repo.GetRwyFungsionalStats()
}

// SyncRwyFungsionalByIDSDM syncs riwayat fungsional for a single dosen
func (s *Service) SyncRwyFungsionalByIDSDM(idSDM, trigger string) (*SyncResult, error) {
	log.Printf("📞 Service: Syncing riwayat fungsional for id_sdm: %s (trigger: %s)", idSDM, trigger)
	return s.syncService.SyncRwyFungsionalByIDSDM(idSDM, trigger)
}

// BatchSyncAllRwyFungsional syncs riwayat fungsional for all dosen
func (s *Service) BatchSyncAllRwyFungsional(trigger string) (*BatchSyncResult, error) {
	log.Printf("📞 Service: Starting batch sync for all dosen (trigger: %s)", trigger)
	return s.syncService.BatchSyncAllRwyFungsional(trigger)
}

// ResyncFailedRwyFungsional re-syncs riwayat fungsional for failed dosen
func (s *Service) ResyncFailedRwyFungsional(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	if len(failedIDSDMs) == 0 {
		return nil, fmt.Errorf("no failed id_sdm provided")
	}
	log.Printf("📞 Service: Re-syncing %d failed dosen (trigger: %s)", len(failedIDSDMs), trigger)
	return s.syncService.ResyncFailedRwyFungsional(failedIDSDMs, trigger)
}

// ForceRefreshToken forces a token refresh
func (s *Service) ForceRefreshToken() error {
	log.Printf("📞 Service: Forcing token refresh")
	return s.syncService.ForceRefreshToken()
}
