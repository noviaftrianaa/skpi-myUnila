package spp_mhs

import (
	"context"

	"github.com/google/uuid"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/external/simpedam"
)

type Service interface {
	GetSppMhsList(ctx context.Context, page, limit int, npm *string, idSmt *string) (*SppMhsListResult, error)
	GetSppMhsByID(ctx context.Context, id string) (*SppMhsDetail, error)
	GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error)
	GetMahasiswaPaymentSummary(ctx context.Context, npm string) (*MahasiswaPaymentSummary, error)
	GetStats(ctx context.Context) (*SppMhsStats, error)
	SyncSppMhs(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
}

type service struct {
	repo        Repository
	simpedamAPI *simpedam.Client
	loggerSvc   logger.Service
}

func NewService(repo Repository, simpedamAPI *simpedam.Client, loggerSvc logger.Service) Service {
	return &service{
		repo:        repo,
		simpedamAPI: simpedamAPI,
		loggerSvc:   loggerSvc,
	}
}

func (s *service) GetSppMhsList(ctx context.Context, page, limit int, npm *string, idSmt *string) (*SppMhsListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetSppMhsList(ctx, page, limit, npm, idSmt)
}

func (s *service) GetSppMhsByID(ctx context.Context, id string) (*SppMhsDetail, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetSppMhsByID(ctx, uid)
}

func (s *service) GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error) {
	return s.repo.GetSppMhsByNPM(ctx, npm)
}

func (s *service) GetMahasiswaPaymentSummary(ctx context.Context, npm string) (*MahasiswaPaymentSummary, error) {
	// Get payment history from database
	payments, err := s.repo.GetSppMhsByNPM(ctx, npm)
	if err != nil {
		return nil, err
	}

	if len(payments) == 0 {
		return nil, nil
	}

	// Build summary
	summary := &MahasiswaPaymentSummary{
		NPM:           npm,
		NamaMahasiswa: payments[0].NamaMahasiswa,
		NamaProdi:     payments[0].NamaProdi,
		RiwayatBayar:  []RiwayatBayar{},
	}

	if payments[0].NamaKelasUKT != nil {
		summary.KelasUKT = *payments[0].NamaKelasUKT
	}
	if payments[0].NominalUKT != nil {
		summary.NominalUKT = *payments[0].NominalUKT
	}

	// Calculate totals
	for _, p := range payments {
		summary.TotalBayar += p.Nominal

		riwayat := RiwayatBayar{
			IDSemester:      p.IDSmt,
			NominalUKT:      p.Nominal,
			FlagBayar:       true, // We have a record, so it's paid
			KeteranganBayar: p.FlagBy,
			TglBayar:        &p.TglBayar,
		}
		summary.RiwayatBayar = append(summary.RiwayatBayar, riwayat)
	}

	return summary, nil
}

func (s *service) GetStats(ctx context.Context) (*SppMhsStats, error) {
	return s.repo.GetStats(ctx)
}
