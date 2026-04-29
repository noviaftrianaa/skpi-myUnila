package kategori

import "context"

type Service interface {
	List(ctx context.Context, jenis string, isActive *bool) ([]Kategori, error)
	GetByID(ctx context.Context, id string) (*Kategori, error)
	Create(ctx context.Context, req *CreateKategoriRequest) (string, error)
	Update(ctx context.Context, id string, req *UpdateKategoriRequest) error
	SoftDelete(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(ctx context.Context, jenis string, isActive *bool) ([]Kategori, error) {
	return s.repo.List(ctx, jenis, isActive)
}

func (s *service) GetByID(ctx context.Context, id string) (*Kategori, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *service) Create(ctx context.Context, req *CreateKategoriRequest) (string, error) {
	return s.repo.Create(ctx, req)
}

func (s *service) Update(ctx context.Context, id string, req *UpdateKategoriRequest) error {
	return s.repo.Update(ctx, id, req)
}

func (s *service) SoftDelete(ctx context.Context, id string) error {
	return s.repo.SoftDelete(ctx, id)
}
