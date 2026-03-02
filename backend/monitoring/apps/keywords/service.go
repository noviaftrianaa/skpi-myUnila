package keywords

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Service interface {
	List(filter KeywordFilter) ([]*ThreatKeyword, int, error)
	GetByID(id int) (*ThreatKeyword, error)
	Create(req CreateKeywordRequest, creatorID string) (*ThreatKeyword, error)
	Update(id int, req UpdateKeywordRequest, updaterID string) (*ThreatKeyword, error)
	Delete(id int, updaterID string) error
	ListActive() ([]*ThreatKeyword, error)
	// Seed resets keywords to default from DB seed (re-runs seed)
	Seed(creatorID string, db *sqlx.DB) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(f KeywordFilter) ([]*ThreatKeyword, int, error) {
	return s.repo.List(f)
}

func (s *service) GetByID(id int) (*ThreatKeyword, error) {
	return s.repo.GetByID(id)
}

func (s *service) Create(req CreateKeywordRequest, creatorID string) (*ThreatKeyword, error) {
	if req.Weight <= 0 {
		req.Weight = 1
	}
	now := time.Now()
	kw := &ThreatKeyword{
		Keyword:    req.Keyword,
		Category:   req.Category,
		Weight:     req.Weight,
		IsActive:   1,
		Notes:      req.Notes,
		CreateDate: now,
		IDCreator:  creatorID,
		LastUpdate: now,
	}
	if req.IsActive == 0 {
		kw.IsActive = 0
	}
	id, err := s.repo.Create(kw)
	if err != nil {
		return nil, err
	}
	kw.ID = id
	return kw, nil
}

func (s *service) Update(id int, req UpdateKeywordRequest, updaterID string) (*ThreatKeyword, error) {
	if err := s.repo.Update(id, req, updaterID); err != nil {
		return nil, err
	}
	return s.repo.GetByID(id)
}

func (s *service) Delete(id int, updaterID string) error {
	return s.repo.SoftDelete(id, updaterID)
}

func (s *service) ListActive() ([]*ThreatKeyword, error) {
	return s.repo.ListActive()
}

func (s *service) Seed(creatorID string, db *sqlx.DB) error {
	// Soft-delete all existing keywords first
	_, err := db.Exec(`
		UPDATE monitoring.threat_keywords
		SET soft_delete = 1, last_update = GETDATE(), id_updater = @p1
		WHERE soft_delete = 0`, creatorID)
	if err != nil {
		return fmt.Errorf("clear keywords: %w", err)
	}

	// Re-run the seed (same keywords as monitoring_14_seed_keywords.sql)
	seeds := []struct{ kw, cat string; w int }{
		{"slot", "slot", 5}, {"slot gacor", "slot", 5}, {"slot online", "slot", 5},
		{"situs slot", "slot", 5}, {"link slot", "slot", 4}, {"daftar slot", "slot", 4},
		{"login slot", "slot", 4}, {"agen slot", "slot", 4}, {"rtp slot", "slot", 3},
		{"slot777", "slot", 5}, {"slot88", "slot", 5}, {"pragmatic play", "slot", 4},
		{"togel", "togel", 5}, {"toto gelap", "togel", 5}, {"prediksi togel", "togel", 4},
		{"angka jitu", "togel", 4}, {"keluaran togel", "togel", 4}, {"data togel", "togel", 3},
		{"syair togel", "togel", 3}, {"bandar togel", "togel", 5}, {"togel online", "togel", 5},
		{"casino", "casino", 5}, {"casino online", "casino", 5}, {"live casino", "casino", 4},
		{"baccarat", "casino", 4}, {"roulette", "casino", 3}, {"sicbo", "casino", 3},
		{"poker", "poker", 4}, {"poker online", "poker", 5}, {"idn poker", "poker", 5},
		{"domino", "poker", 3}, {"capsa", "poker", 3}, {"ceme", "poker", 4},
		{"judi", "generic", 5}, {"judi online", "generic", 5}, {"taruhan", "generic", 4},
		{"bandar judi", "generic", 5}, {"situs judi", "generic", 5},
		{"bonus new member", "promo", 3}, {"bonus deposit", "promo", 3},
		{"freespin", "promo", 3}, {"jackpot", "generic", 4},
	}

	now := time.Now()
	for _, seed := range seeds {
		kw := &ThreatKeyword{
			Keyword:    seed.kw,
			Category:   seed.cat,
			Weight:     seed.w,
			IsActive:   1,
			CreateDate: now,
			IDCreator:  creatorID,
			LastUpdate: now,
		}
		if _, err := s.repo.Create(kw); err != nil {
			return fmt.Errorf("seed keyword '%s': %w", seed.kw, err)
		}
	}
	return nil
}
