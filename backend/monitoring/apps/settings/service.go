package settings

type Service interface {
	ListAll() ([]*Setting, error)
	ListByGroup(group string) ([]*Setting, error)
	GetByID(id int) (*Setting, error)
	Update(id int, value *string, updaterID string) error
	BulkUpdate(items []BulkItem, updaterID string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListAll() ([]*Setting, error) {
	list, err := s.repo.ListAll()
	if err != nil {
		return nil, err
	}
	// Mask sensitive values
	for _, item := range list {
		if item.IsSensitive == 1 && item.SettingValue != nil {
			masked := "********"
			item.SettingValue = &masked
		}
	}
	return list, nil
}

func (s *service) ListByGroup(group string) ([]*Setting, error) {
	list, err := s.repo.ListByGroup(group)
	if err != nil {
		return nil, err
	}
	for _, item := range list {
		if item.IsSensitive == 1 && item.SettingValue != nil {
			masked := "********"
			item.SettingValue = &masked
		}
	}
	return list, nil
}

func (s *service) GetByID(id int) (*Setting, error) {
	return s.repo.GetByID(id)
}

func (s *service) Update(id int, value *string, updaterID string) error {
	return s.repo.Update(id, value, updaterID)
}

func (s *service) BulkUpdate(items []BulkItem, updaterID string) error {
	for _, item := range items {
		if err := s.repo.Update(item.ID, item.SettingValue, updaterID); err != nil {
			return err
		}
	}
	return nil
}
