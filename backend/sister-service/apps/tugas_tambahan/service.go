package tugas_tambahan

import (
	"log"
)

// Service provides business logic for tugas tambahan
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

// GetTugasTambahanByID retrieves a single tugas tambahan by ID
func (s *Service) GetTugasTambahanByID(idTgsTambah string) (*TugasTambahanWithDetail, error) {
	return s.repo.GetTugasTambahanByID(idTgsTambah)
}

// GetTugasTambahanList retrieves paginated list of tugas tambahan
func (s *Service) GetTugasTambahanList(page, limit int, search, sortBy, sortOrder string) (*TugasTambahanListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return s.repo.GetTugasTambahanList(page, limit, search, sortBy, sortOrder)
}

// GetTugasTambahanStats retrieves statistics
func (s *Service) GetTugasTambahanStats() (*TugasTambahanStats, error) {
	return s.repo.GetTugasTambahanStats()
}

// SyncTugasTambahanByIDSDM syncs tugas tambahan for a single dosen
func (s *Service) SyncTugasTambahanByIDSDM(idSDM, trigger string) (*SyncResult, error) {
	log.Printf("📞 Service: Syncing tugas tambahan for id_sdm: %s (trigger: %s)", idSDM, trigger)
	return s.syncService.SyncTugasTambahanByIDSDM(idSDM, trigger)
}

// BatchSyncAllTugasTambahan syncs tugas tambahan for all dosen
func (s *Service) BatchSyncAllTugasTambahan(trigger string) (*BatchSyncResult, error) {
	log.Printf("📞 Service: Starting batch sync for all dosen (trigger: %s)", trigger)
	return s.syncService.BatchSyncAllTugasTambahan(trigger)
}