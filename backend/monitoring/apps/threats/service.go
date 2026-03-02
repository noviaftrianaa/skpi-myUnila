package threats

import "strconv"

func formatScore(n int) string { return strconv.Itoa(n) }

type Service interface {
	List(filter ThreatFilter) ([]*DetectedThreat, int, error)
	GetByID(id int) (*DetectedThreat, error)
	UpdateStatus(id int, req UpdateStatusRequest, updaterID string) (*DetectedThreat, error)
	Stats() (*ThreatStats, error)
	// Called by detector
	Report(threat *DetectedThreat) (int, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(f ThreatFilter) ([]*DetectedThreat, int, error) {
	return s.repo.List(f)
}

func (s *service) GetByID(id int) (*DetectedThreat, error) {
	return s.repo.GetByID(id)
}

func (s *service) UpdateStatus(id int, req UpdateStatusRequest, updaterID string) (*DetectedThreat, error) {
	if err := s.repo.UpdateStatus(id, req, updaterID); err != nil {
		return nil, err
	}
	return s.repo.GetByID(id)
}

func (s *service) Stats() (*ThreatStats, error) {
	return s.repo.Stats()
}

func (s *service) Report(threat *DetectedThreat) (int, error) {
	// Check if this URL is already detected and not resolved
	exists, err := s.repo.ExistsByURL(threat.PageURL)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, nil // already tracked
	}
	id, err := s.repo.Insert(threat)
	if err != nil || id == 0 {
		return id, err
	}
	// Insert dashboard alert notification
	now := threat.CreateDate
	subject := "[JUDOL ALERT] " + threat.PageURL
	body := "Terdeteksi konten terlarang: " + threat.MatchedKeywords + " (score=" + formatScore(threat.ThreatScore) + ")"
	_ = s.repo.InsertAlert(&AlertNotification{
		ThreatID:   &id,
		Channel:    "dashboard",
		Recipient:  "admin",
		Subject:    subject,
		Body:       &body,
		IsSent:     1,
		CreateDate: now,
		IDCreator:  threat.IDCreator,
		LastUpdate: now,
	})
	return id, nil
}
