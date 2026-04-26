package ktwraw

import "context"

// Service: business logic layer (thin, mostly delegate to repository).
type Service interface {
	GetPerFakultas(ctx context.Context, p PerFakultasParams) ([]PerFakultasRow, error)
	GetPerProdi(ctx context.Context, p PerProdiParams) ([]PerProdiRow, error)
	GetPerJenjang(ctx context.Context, p PerJenjangParams) ([]PerJenjangRow, error)
	ListMahasiswa(ctx context.Context, p MahasiswaListParams) ([]MahasiswaRow, int, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetPerFakultas(ctx context.Context, p PerFakultasParams) ([]PerFakultasRow, error) {
	if p.Jenjang == "" {
		p.Jenjang = "S1"
	}
	return s.repo.GetPerFakultas(ctx, p)
}

func (s *service) GetPerProdi(ctx context.Context, p PerProdiParams) ([]PerProdiRow, error) {
	if p.Jenjang == "" {
		p.Jenjang = "S1"
	}
	return s.repo.GetPerProdi(ctx, p)
}

func (s *service) GetPerJenjang(ctx context.Context, p PerJenjangParams) ([]PerJenjangRow, error) {
	return s.repo.GetPerJenjang(ctx, p)
}

func (s *service) ListMahasiswa(ctx context.Context, p MahasiswaListParams) ([]MahasiswaRow, int, error) {
	if p.Jenjang == "" {
		p.Jenjang = "S1"
	}
	return s.repo.ListMahasiswa(ctx, p)
}
