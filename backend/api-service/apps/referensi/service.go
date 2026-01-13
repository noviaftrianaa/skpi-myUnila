package referensi

import (
	"context"
)

// Service adalah interface untuk business logic referensi
type Service interface {
	GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error)
	GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error)
	GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error)
	GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error)
}

type service struct {
	repo Repository
}

// NewService membuat instance service baru
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// GetSemesters mengambil daftar semester dengan pagination
func (s *service) GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error) {
	return s.repo.GetSemesters(ctx, params)
}

// GetTahunAjarans mengambil daftar tahun ajaran dengan pagination
func (s *service) GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error) {
	return s.repo.GetTahunAjarans(ctx, params)
}

// GetAgamas mengambil daftar agama dengan pagination
func (s *service) GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error) {
	return s.repo.GetAgamas(ctx, params)
}

// GetWilayahs mengambil daftar wilayah dengan pagination dan filter level
func (s *service) GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error) {
	return s.repo.GetWilayahs(ctx, params)
}
