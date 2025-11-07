package jabatan_struktural

import (
	"fmt"
	"log"
)

// Service provides business logic for jabatan struktural
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

// GetRwyStrukturalByID retrieves a single riwayat jabatan struktural by ID
func (s *Service) GetRwyStrukturalByID(idRwyJabStruk string) (*RwyStrukturalWithDetail, error) {
	return s.repo.GetRwyStrukturalByID(idRwyJabStruk)
}

// GetRwyStrukturalList retrieves paginated list of riwayat jabatan struktural
func (s *Service) GetRwyStrukturalList(page, limit int, search, sortBy, sortOrder string) (*JabatanStrukturalListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return s.repo.GetRwyStrukturalList(page, limit, search, sortBy, sortOrder)
}

// GetRwyStrukturalStats retrieves statistics
func (s *Service) GetRwyStrukturalStats() (*JabatanStrukturalStats, error) {
	return s.repo.GetRwyStrukturalStats()
}

// SyncJabatanStrukturalByIDSDM syncs jabatan struktural for a single dosen
func (s *Service) SyncJabatanStrukturalByIDSDM(idSDM, trigger string) (*SyncResult, error) {
	log.Printf("📞 Service: Syncing jabatan struktural for id_sdm: %s (trigger: %s)", idSDM, trigger)
	return s.syncService.SyncJabatanStrukturalByIDSDM(idSDM, trigger)
}

// BatchSyncAllJabatanStruktural syncs jabatan struktural for all dosen
func (s *Service) BatchSyncAllJabatanStruktural(trigger string) (*BatchSyncResult, error) {
	log.Printf("📞 Service: Starting batch sync for all dosen (trigger: %s)", trigger)
	return s.syncService.BatchSyncAllJabatanStruktural(trigger)
}

// ResyncFailedJabatanStruktural re-syncs jabatan struktural for failed dosen
func (s *Service) ResyncFailedJabatanStruktural(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	if len(failedIDSDMs) == 0 {
		return nil, fmt.Errorf("no failed id_sdm provided")
	}
	log.Printf("📞 Service: Re-syncing %d failed dosen (trigger: %s)", len(failedIDSDMs), trigger)
	return s.syncService.ResyncFailedJabatanStruktural(failedIDSDMs, trigger)
}

// ForceRefreshToken forces a token refresh
func (s *Service) ForceRefreshToken() error {
	log.Printf("📞 Service: Forcing token refresh")
	return s.syncService.ForceRefreshToken()
}
