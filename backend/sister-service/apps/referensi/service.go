package referensi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sister-service/external/sister_api"
)

// Service defines business logic for referensi domain
type Service interface {
	GetAllAgama(ctx context.Context) ([]Agama, error)
	GetAgamaByID(ctx context.Context, id int) (*Agama, error)
	SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error)
}

type service struct {
	repo      Repository
	sisterAPI *sister_api.Client
}

// NewService creates a new service instance
func NewService(repo Repository, sisterAPI *sister_api.Client) Service {
	return &service{
		repo:      repo,
		sisterAPI: sisterAPI,
	}
}

// GetAllAgama retrieves all agama
func (s *service) GetAllAgama(ctx context.Context) ([]Agama, error) {
	return s.repo.GetAllAgama(ctx)
}

// GetAgamaByID retrieves agama by ID
func (s *service) GetAgamaByID(ctx context.Context, id int) (*Agama, error) {
	return s.repo.GetAgamaByID(ctx, id)
}

// SyncAgamaFromSister synchronizes agama data from Sister API
func (s *service) SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync agama from Sister API...")

	// 1. Fetch data from Sister API
	rawData, err := s.sisterAPI.GetReferensiAgama()
	if err != nil {
		log.Printf("Error fetching agama from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	// 2. Parse Sister API response
	var sisterAgamaList []SisterAgama
	if err := json.Unmarshal(rawData, &sisterAgamaList); err != nil {
		log.Printf("Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d agama from Sister API", len(sisterAgamaList))

	// 3. Transform to domain entity
	agamaList := make([]Agama, len(sisterAgamaList))
	for i, sa := range sisterAgamaList {
		agamaList[i] = Agama{
			IDAgama:   sa.ID,
			NamaAgama: sa.Nama,
		}
	}

	// Log who synced for audit trail
	log.Printf("📝 Sync requested by: %s", syncedBy)

	// 4. Bulk upsert to database
	if err := s.repo.BulkUpsertAgama(ctx, agamaList); err != nil {
		log.Printf("Error upserting agama to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d agama records", len(agamaList))
	return len(agamaList), nil
}
