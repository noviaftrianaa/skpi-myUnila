package notif

import "context"

type Service interface {
	Broadcast(ctx context.Context, req *BroadcastRequest, creatorID string) (*BroadcastResult, error)
	GetInbox(ctx context.Context, f *InboxFilter) (*InboxResult, error)
	UnreadCount(ctx context.Context, idPengguna string) (int, error)
	MarkRead(ctx context.Context, idRecipient, idPengguna string) error
	MarkAllRead(ctx context.Context, idPengguna string) error
	Dismiss(ctx context.Context, idRecipient, idPengguna string) error
	ListBroadcasts(ctx context.Context, page, limit int) ([]Notifikasi, int, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Broadcast(ctx context.Context, req *BroadcastRequest, creatorID string) (*BroadcastResult, error) {
	id, err := s.repo.Broadcast(ctx, req, creatorID)
	if err != nil {
		return nil, err
	}
	return &BroadcastResult{IDNotif: id, TotalRecipient: len(req.TargetUserIDs)}, nil
}

func (s *service) GetInbox(ctx context.Context, f *InboxFilter) (*InboxResult, error) {
	return s.repo.GetInbox(ctx, f)
}

func (s *service) UnreadCount(ctx context.Context, idPengguna string) (int, error) {
	return s.repo.UnreadCount(ctx, idPengguna)
}

func (s *service) MarkRead(ctx context.Context, idRecipient, idPengguna string) error {
	return s.repo.MarkRead(ctx, idRecipient, idPengguna)
}

func (s *service) MarkAllRead(ctx context.Context, idPengguna string) error {
	return s.repo.MarkAllRead(ctx, idPengguna)
}

func (s *service) Dismiss(ctx context.Context, idRecipient, idPengguna string) error {
	return s.repo.Dismiss(ctx, idRecipient, idPengguna)
}

func (s *service) ListBroadcasts(ctx context.Context, page, limit int) ([]Notifikasi, int, error) {
	return s.repo.ListBroadcasts(ctx, page, limit)
}
