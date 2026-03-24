package referensi

import (
	"context"
	"fmt"
	"log"
	"time"
)

type Service interface {
	SyncUnits(ctx context.Context) (*SyncResult, error)
	GetProdiList(ctx context.Context) ([]RefUnit, error)
}

type SiakaduAPIClient interface {
	GetReferensi(refType string) ([]map[string]interface{}, error)
}

type service struct {
	repo       Repository
	siakaduAPI SiakaduAPIClient
}

func NewService(repo Repository, siakaduAPI SiakaduAPIClient) Service {
	return &service{repo: repo, siakaduAPI: siakaduAPI}
}

func (s *service) GetProdiList(ctx context.Context) ([]RefUnit, error) {
	return s.repo.GetProdiList(ctx)
}

func (s *service) SyncUnits(ctx context.Context) (*SyncResult, error) {
	startTime := time.Now()
	log.Printf("🔄 [Unit Sync] Starting unit/prodi reference sync from SIAKADU API")

	data, err := s.siakaduAPI.GetReferensi("unit")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch units: %v", err)
	}

	log.Printf("📊 [Unit Sync] Fetched %d units", len(data))

	totalInserted := 0
	totalUpdated := 0
	totalErrors := 0

	for _, item := range data {
		isNew, err := s.repo.UpsertUnit(ctx, item)
		if err != nil {
			totalErrors++
			continue
		}
		if isNew {
			totalInserted++
		} else {
			totalUpdated++
		}
	}

	duration := time.Since(startTime)
	result := &SyncResult{
		TotalFetched:  len(data),
		TotalInserted: totalInserted,
		TotalUpdated:  totalUpdated,
		TotalErrors:   totalErrors,
		Duration:      duration.String(),
	}

	log.Printf("✅ [Unit Sync] Complete - %d fetched, %d inserted, %d updated, %d errors, duration: %s",
		len(data), totalInserted, totalUpdated, totalErrors, duration)

	return result, nil
}
