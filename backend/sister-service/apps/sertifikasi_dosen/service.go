package sertifikasi_dosen

type Service struct {
	repo        Repository
	syncService SyncService
}

func NewService(repo Repository, syncService SyncService) *Service {
	return &Service{
		repo:        repo,
		syncService: syncService,
	}
}

// SyncSertifikasiByIDSDM handles manual sync for specific dosen
func (s *Service) SyncSertifikasiByIDSDM(idSDM string) (*SyncResult, error) {
	return s.syncService.SyncSertifikasiByIDSDM(idSDM)
}

// BatchSyncAllSertifikasi handles batch sync for all dosen
func (s *Service) BatchSyncAllSertifikasi(syncedBy string) (*BatchSyncResult, error) {
	return s.syncService.BatchSyncAllSertifikasi(syncedBy)
}

// GetSertifikasiStats retrieves statistics
func (s *Service) GetSertifikasiStats() (*SertifikasiStats, error) {
	return s.repo.GetRwySertifikasiStats()
}

// GetSertifikasiList retrieves paginated list
func (s *Service) GetSertifikasiList(page, limit int, search, sortBy, sortOrder string) (*SertifikasiListResult, error) {
	return s.repo.GetRwySertifikasiList(page, limit, search, sortBy, sortOrder)
}

// GetSertifikasiDetail retrieves detail by ID
func (s *Service) GetSertifikasiDetail(idRwySert string) (*RwySertifikasiWithDetail, error) {
	return s.repo.GetRwySertifikasiByID(idRwySert)
}
