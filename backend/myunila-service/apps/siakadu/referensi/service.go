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
	GetPimpinanByUnit(ctx context.Context, idUnit string) ([]PimpinanUnit, error)
	ListUnits(ctx context.Context, f *UnitListFilter) (*UnitListResult, error)
	GetUnitStats(ctx context.Context) (*UnitStats, error)
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

func (s *service) GetPimpinanByUnit(ctx context.Context, idUnit string) ([]PimpinanUnit, error) {
	return s.repo.GetPimpinanByUnit(ctx, idUnit)
}

func (s *service) ListUnits(ctx context.Context, f *UnitListFilter) (*UnitListResult, error) {
	return s.repo.ListUnits(ctx, f)
}

func (s *service) GetUnitStats(ctx context.Context) (*UnitStats, error) {
	return s.repo.GetUnitStats(ctx)
}

func (s *service) SyncUnits(ctx context.Context) (*SyncResult, error) {
	startTime := time.Now()

	// Ensure pimpinan schema
	if err := s.repo.EnsureSchema(ctx); err != nil {
		log.Printf("⚠️  [Unit Sync] EnsureSchema: %v", err)
	}

	log.Printf("🔄 [Unit Sync] Starting unit/prodi reference sync from SIAKADU API")

	data, err := s.siakaduAPI.GetReferensi("unit")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch units: %v", err)
	}

	log.Printf("📊 [Unit Sync] Fetched %d units", len(data))

	totalInserted := 0
	totalUpdated := 0
	totalErrors := 0
	pimpinanSynced := 0

	for _, item := range data {
		isNew, err := s.repo.UpsertUnit(ctx, item)
		if err != nil {
			totalErrors++
			if totalErrors <= 5 {
				idUnit := ""
				if v, ok := item["id_unit"].(string); ok {
					idUnit = v
				}
				log.Printf("⚠️  [Unit Sync] UpsertUnit fail %s: %v", idUnit, err)
			}
			continue
		}
		if isNew {
			totalInserted++
		} else {
			totalUpdated++
		}

		// Sync pimpinan if present
		if pimpinanRaw, ok := item["pimpinan"]; ok && pimpinanRaw != nil {
			if pArr, ok := pimpinanRaw.([]interface{}); ok && len(pArr) > 0 {
				idUnit := ""
				if v, ok := item["id_unit"].(string); ok {
					idUnit = v
				}
				if idUnit != "" {
					if err := s.repo.UpsertPimpinan(ctx, idUnit, pArr); err != nil {
						log.Printf("⚠️  [Unit Sync] Pimpinan sync failed for %s: %v", idUnit, err)
					} else {
						pimpinanSynced += len(pArr)
					}
				}
			}
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

	log.Printf("✅ [Unit Sync] Complete - %d fetched, %d inserted, %d updated, %d errors, %d pimpinan synced, duration: %s",
		len(data), totalInserted, totalUpdated, totalErrors, pimpinanSynced, duration)

	return result, nil
}
