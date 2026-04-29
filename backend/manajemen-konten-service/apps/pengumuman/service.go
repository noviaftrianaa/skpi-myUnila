package pengumuman

import "context"

type Service interface {
	List(ctx context.Context, f *ListFilter) (*ListResult, error)
	GetByID(ctx context.Context, id string, incrementView bool) (*Pengumuman, error)
	GetBySlug(ctx context.Context, slug string, incrementView bool) (*Pengumuman, error)
	Create(ctx context.Context, req *CreatePengumumanRequest, creatorID string) (string, error)
	Update(ctx context.Context, id string, req *UpdatePengumumanRequest, updaterID string) error
	SoftDelete(ctx context.Context, id string) error
	UpdateStatus(ctx context.Context, id, status string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(ctx context.Context, f *ListFilter) (*ListResult, error) {
	return s.repo.List(ctx, f)
}

func (s *service) GetByID(ctx context.Context, id string, incrementView bool) (*Pengumuman, error) {
	if incrementView {
		_ = s.repo.IncrementView(ctx, id)
	}
	return s.repo.GetByID(ctx, id)
}

func (s *service) GetBySlug(ctx context.Context, slug string, incrementView bool) (*Pengumuman, error) {
	p, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if incrementView {
		_ = s.repo.IncrementView(ctx, p.IDPengumuman)
	}
	return p, nil
}

func (s *service) Create(ctx context.Context, req *CreatePengumumanRequest, creatorID string) (string, error) {
	return s.repo.Create(ctx, req, creatorID)
}

func (s *service) Update(ctx context.Context, id string, req *UpdatePengumumanRequest, updaterID string) error {
	return s.repo.Update(ctx, id, req, updaterID)
}

func (s *service) SoftDelete(ctx context.Context, id string) error {
	return s.repo.SoftDelete(ctx, id)
}

func (s *service) UpdateStatus(ctx context.Context, id, status string) error {
	return s.repo.UpdateStatus(ctx, id, status)
}
