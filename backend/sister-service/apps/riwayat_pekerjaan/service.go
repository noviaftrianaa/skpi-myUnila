package riwayat_pekerjaan

import (
	"fmt"
	"log"
)

// Service provides business logic for riwayat pekerjaan
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

// GetRwyPekerjaanByID retrieves a single riwayat pekerjaan by ID
func (s *Service) GetRwyPekerjaanByID(idRwyKerja string) (*RwyPekerjaanWithDetail, error) {
	return s.repo.GetRwyPekerjaanByID(idRwyKerja)
}

// GetRwyPekerjaanList retrieves paginated list of riwayat pekerjaan
func (s *Service) GetRwyPekerjaanList(page, limit int, search, sortBy, sortOrder string) (*RiwayatPekerjaanListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return s.repo.GetRwyPekerjaanList(page, limit, search, sortBy, sortOrder)
}

// GetRwyPekerjaanStats retrieves statistics
func (s *Service) GetRwyPekerjaanStats() (*RiwayatPekerjaanStats, error) {
	return s.repo.GetRwyPekerjaanStats()
}

// SyncRwyPekerjaanByIDSDM syncs riwayat pekerjaan for a single dosen
func (s *Service) SyncRwyPekerjaanByIDSDM(idSDM, trigger string) (*SyncResult, error) {
	log.Printf("📞 Service: Syncing riwayat pekerjaan for id_sdm: %s (trigger: %s)", idSDM, trigger)
	return s.syncService.SyncRwyPekerjaanByIDSDM(idSDM, trigger)
}

// BatchSyncAllRwyPekerjaan syncs riwayat pekerjaan for all dosen
func (s *Service) BatchSyncAllRwyPekerjaan(trigger string) (*BatchSyncResult, error) {
	log.Printf("📞 Service: Starting batch sync for all dosen (trigger: %s)", trigger)
	return s.syncService.BatchSyncAllRwyPekerjaan(trigger)
}

// ResyncFailedRwyPekerjaan re-syncs riwayat pekerjaan for failed dosen
func (s *Service) ResyncFailedRwyPekerjaan(failedIDSDMs []string, trigger string) (*BatchSyncResult, error) {
	if len(failedIDSDMs) == 0 {
		return nil, fmt.Errorf("no failed id_sdm provided")
	}
	log.Printf("📞 Service: Re-syncing %d failed dosen (trigger: %s)", len(failedIDSDMs), trigger)
	return s.syncService.ResyncFailedRwyPekerjaan(failedIDSDMs, trigger)
}

// ForceRefreshToken forces a token refresh
func (s *Service) ForceRefreshToken() error {
	log.Printf("📞 Service: Forcing token refresh")
	return s.syncService.ForceRefreshToken()
}
