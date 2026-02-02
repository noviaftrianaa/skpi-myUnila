package daftar_ukt

import (
	"context"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/apps/monitoring"
	"github.com/myunila/keuangan-service/external/simpedam"
)

type Service interface {
	GetDaftarUKTList(ctx context.Context, tahun int, idProdiSimpedam string, kodeStrata int, page, limit int) (*DaftarUKTListResult, error)
	GetDaftarUKTByID(ctx context.Context, id string) (*DaftarUKT, error)
	SyncDaftarUKT(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	SyncDaftarUKTWithID(ctx context.Context, syncID string, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	StartAsyncSync(ctx context.Context, filter *SyncFilter, syncedBy string) (string, error)
	GetProdiMappings(ctx context.Context) ([]ProdiMapping, error)
	GetStats(ctx context.Context) (*DaftarUktStats, error)
	GetFakultasList(ctx context.Context) ([]FakultasOption, error)
	GetProdiList(ctx context.Context) ([]ProdiOption, error)
}

type service struct {
	repo         Repository
	simpedamAPI  *simpedam.Client
	loggerSvc    logger.Service
}

func NewService(repo Repository, simpedamAPI *simpedam.Client, loggerSvc logger.Service) Service {
	return &service{
		repo:        repo,
		simpedamAPI: simpedamAPI,
		loggerSvc:   loggerSvc,
	}
}

func (s *service) GetDaftarUKTList(ctx context.Context, tahun int, idProdiSimpedam string, kodeStrata int, page, limit int) (*DaftarUKTListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetDaftarUKTList(ctx, tahun, idProdiSimpedam, kodeStrata, page, limit)
}

func (s *service) GetDaftarUKTByID(ctx context.Context, id string) (*DaftarUKT, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetDaftarUKTByID(ctx, uid)
}

func (s *service) GetProdiMappings(ctx context.Context) ([]ProdiMapping, error) {
	return s.repo.GetAllProdiMappings(ctx)
}

func (s *service) GetStats(ctx context.Context) (*DaftarUktStats, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) GetFakultasList(ctx context.Context) ([]FakultasOption, error) {
	return s.repo.GetFakultasList(ctx)
}

func (s *service) GetProdiList(ctx context.Context) ([]ProdiOption, error) {
	return s.repo.GetProdiList(ctx)
}

// StartAsyncSync starts sync in background and returns sync_id immediately
func (s *service) StartAsyncSync(ctx context.Context, filter *SyncFilter, syncedBy string) (string, error) {
	// Initialize monitoring first to get syncID
	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync(
		"Sync Daftar UKT",
		fmt.Sprintf("tahun=%d", filter.Tahun),
		"batch",
		syncedBy,
		0, // Will be updated during sync
	)

	// Start sync in background goroutine
	go func() {
		// Use background context to avoid cancellation when request completes
		bgCtx := context.Background()

		// Run the actual sync with existing syncID
		result, err := s.SyncDaftarUKTWithID(bgCtx, syncID, filter, syncedBy)
		if err != nil {
			// Log error in background sync
			log.Printf("❌ [Async Sync] Failed for tahun %d: %v", filter.Tahun, err)
			return
		}

		// Log success
		log.Printf("✅ [Async Sync] Completed for tahun %d - Inserted: %d, Updated: %d, Failed: %d",
			filter.Tahun, result.TotalInserted, result.TotalUpdated, result.TotalFailed)
	}()

	return syncID, nil
}
