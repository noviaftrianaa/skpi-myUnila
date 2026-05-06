package kkn

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
	"github.com/myunila/myunila-service/external/kkn_api"
)

type Service interface {
	GetStats(ctx context.Context) (*SyncStats, error)
	SyncGroup(ctx context.Context, group string, syncedBy string) (*SyncResult, error)
	SyncAll(ctx context.Context, syncedBy string) (*SyncAllResult, error)

	// List endpoints
	ListPeriode(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListLokasi(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListRegistrasi(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListKelompok(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListDPL(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListNilai(ctx context.Context, f ListFilter) (*ListResponse, error)
	ListProgramKerja(ctx context.Context, f ListFilter) (*ListResponse, error)
}

type service struct {
	repo       Repository
	kknAPI     *kkn_api.KKNClient
	loggerSvc  logger.Service
	monitorSvc monitoring.Service
}

func NewService(repo Repository, kknAPI *kkn_api.KKNClient) Service {
	return &service{
		repo:       repo,
		kknAPI:     kknAPI,
		loggerSvc:  logger.GetService(),
		monitorSvc: monitoring.GetInstance(),
	}
}

func (s *service) GetStats(ctx context.Context) (*SyncStats, error) {
	apiStats, err := s.kknAPI.GetStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get API stats: %w", err)
	}

	var tableStats []TableStat
	totalRows := 0
	for _, st := range apiStats {
		table := getString(st, "table")
		count := getInt(st, "count")
		tableStats = append(tableStats, TableStat{Table: table, Count: count})
		totalRows += count
	}

	sqlStats, _ := s.repo.GetSQLServerStats(ctx)

	return &SyncStats{
		TotalTables:    len(tableStats),
		TotalRows:      totalRows,
		TableStats:     tableStats,
		SQLServerStats: sqlStats,
	}, nil
}

func (s *service) SyncGroup(ctx context.Context, group string, syncedBy string) (*SyncResult, error) {
	tables, ok := SyncTableGroups[group]
	if !ok {
		return nil, fmt.Errorf("unknown sync group: %s", group)
	}

	start := time.Now()
	result := &SyncResult{Table: group}

	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("KKN "+group, "kkn_"+group, "manual", syncedBy, 0)
	}

	for _, table := range tables {
		log.Printf("🔄 [KKN Sync] Fetching %s...", table)
		data, err := s.kknAPI.GetAllData(table, 2000)
		if err != nil {
			log.Printf("⚠️  [KKN Sync] Failed to fetch %s: %v", table, err)
			result.Failed++
			continue
		}
		result.Fetched += len(data)
		log.Printf("📊 [KKN Sync] Fetched %d rows from %s", len(data), table)

		switch group {
		case "referensi":
			s.syncReferensi(ctx, table, data, result)
		case "lokasi":
			s.syncLokasi(ctx, table, data, result)
		case "pendaftaran":
			s.syncPendaftaran(ctx, table, data, result)
		case "penempatan":
			s.syncPenempatan(ctx, table, data, result)
		case "nilai":
			s.syncNilai(ctx, table, data, result)
		case "laporan":
			s.syncLaporan(ctx, table, data, result)
		}
	}

	if group == "pendaftaran" || group == "penempatan" {
		s.repo.EnrichAfterSync(ctx)
	}

	result.Duration = time.Since(start).Milliseconds()

	if s.monitorSvc != nil && syncID != "" {
		msg := fmt.Sprintf("fetched=%d, inserted=%d, updated=%d, failed=%d", result.Fetched, result.Inserted, result.Updated, result.Failed)
		s.monitorSvc.CompleteSync(syncID, msg)
	}
	s.logSync(ctx, group, "success", syncedBy, result)

	log.Printf("✅ [KKN Sync] %s done: fetched=%d, inserted=%d, updated=%d, failed=%d (%dms)",
		group, result.Fetched, result.Inserted, result.Updated, result.Failed, result.Duration)

	return result, nil
}

func (s *service) SyncAll(ctx context.Context, syncedBy string) (*SyncAllResult, error) {
	start := time.Now()
	allResult := &SyncAllResult{SyncedBy: syncedBy}

	if repo, ok := s.repo.(*repository); ok {
		repo.EnsureKomponenPenilaian(ctx)
	}

	for _, group := range SyncOrder {
		result, err := s.SyncGroup(ctx, group, syncedBy)
		if err != nil {
			log.Printf("⚠️  [KKN Sync] Group %s failed: %v", group, err)
			allResult.Results = append(allResult.Results, &SyncResult{Table: group, Failed: 1})
			continue
		}
		allResult.Results = append(allResult.Results, result)
	}

	log.Printf("🔄 [KKN Sync] Running post-sync enrichment...")
	if err := s.repo.EnrichAfterSync(ctx); err != nil {
		log.Printf("⚠️  [KKN Sync] Post-sync enrichment error: %v", err)
	} else {
		log.Printf("✅ [KKN Sync] Post-sync enrichment completed")
	}

	allResult.Duration = time.Since(start).Milliseconds()
	return allResult, nil
}

func (s *service) syncReferensi(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	if table != "kkn_periode" {
		result.Skipped += len(data)
		return
	}
	for _, row := range data {
		isNew, err := s.repo.UpsertPeriode(ctx, row)
		if err != nil {
			result.Failed++
			continue
		}
		if isNew {
			result.Inserted++
		} else {
			result.Updated++
		}
	}
}

func (s *service) syncLokasi(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	if table == "lokasi_kabupaten" || table == "lokasi_kecamatan" {
		result.Skipped += len(data)
		return
	}

	if table == "lokasi_desa" {
		kabData, _ := s.kknAPI.GetAllData("lokasi_kabupaten", 5000)
		kecData, _ := s.kknAPI.GetAllData("lokasi_kecamatan", 5000)

		kabMap := make(map[int]string)
		for _, k := range kabData {
			kabMap[getInt(k, "id_kabupaten")] = getString(k, "nama_kabupaten")
		}
		kecMap := make(map[int]struct {
			nama      string
			idKab     int
		})
		for _, k := range kecData {
			kecMap[getInt(k, "id_kecamatan")] = struct {
				nama  string
				idKab int
			}{getString(k, "nama_kecamatan"), getInt(k, "id_kabupaten")}
		}

		for _, desa := range data {
			idKec := getInt(desa, "id_kecamatan")
			kec := kecMap[idKec]
			kab := kabMap[kec.idKab]

			isNew, err := s.repo.UpsertLokasi(ctx, desa, kec.nama, kab)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Updated++
			}
		}
		return
	}

	result.Skipped += len(data)
}

func (s *service) syncPendaftaran(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	if table == "mahasiswa_pendaftar" {
		for _, row := range data {
			idPeriode := getInt(row, "id_periode")
			periodeUUID, err := s.repo.GetPeriodeUUID(ctx, idPeriode)
			if err != nil || periodeUUID == "" {
				result.Skipped++
				continue
			}
			isNew, err := s.repo.UpsertRegistrasi(ctx, row, periodeUUID)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Updated++
			}
		}
		return
	}

	if table == "mahasiswa_biodata" {
		for _, row := range data {
			npm := getString(row, "npm")
			var regUUID string
			s.repo.(*repository).db.GetContext(ctx, &regUUID,
				"SELECT CAST(id_registrasi AS VARCHAR(36)) FROM kkn.registrasi_kkn WHERE npm = @p1", npm)
			if regUUID == "" {
				result.Skipped++
				continue
			}
			isNew, err := s.repo.UpsertDataPemohon(ctx, row, regUUID)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Updated++
			}
		}
		return
	}
}

func (s *service) syncPenempatan(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	if table == "penempatan_mahasiswa" {
		for _, row := range data {
			idPeriode := getInt(row, "id_periode")
			periodeUUID, _ := s.repo.GetPeriodeUUID(ctx, idPeriode)
			if periodeUUID == "" {
				result.Skipped++
				continue
			}
			kelompokNo := getInt(row, "kelompok")
			idDesa := getInt(row, "id_desa")
			lokasiUUID, _ := s.repo.GetLokasiUUID(ctx, idDesa)

			kelompokUUID, isNewKlp, err := s.repo.UpsertKelompok(ctx, fmt.Sprintf("%d", idPeriode), kelompokNo, idDesa, lokasiUUID, periodeUUID)
			if err != nil {
				result.Failed++
				continue
			}
			if isNewKlp {
				result.Inserted++
			}

			npm := getString(row, "npm")
			var regUUID string
			s.repo.(*repository).db.GetContext(ctx, &regUUID,
				"SELECT CAST(id_registrasi AS VARCHAR(36)) FROM kkn.registrasi_kkn WHERE npm = @p1", npm)

			isNew, err := s.repo.UpsertAnggota(ctx, row, kelompokUUID, regUUID)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Updated++
			}
		}
		return
	}

	if table == "penempatan_dpl" || table == "penempatan_kdpl" {
		peran := "pembimbing"
		if table == "penempatan_kdpl" {
			peran = "pendamping"
		}

		biodataTable := "biodata_dpl"
		if table == "penempatan_kdpl" {
			biodataTable = "biodata_kdpl"
		}

		biodata, _ := s.kknAPI.GetAllData(biodataTable, 5000)
		bioMap := make(map[string]map[string]interface{})
		for _, b := range biodata {
			nip := getString(b, "nip")
			bioMap[nip] = b
		}

		for _, row := range data {
			nip := getString(row, "nip")
			idDesa := getInt(row, "id_desa")
			idPeriode := getInt(row, "id_periode")

			periodeUUID, _ := s.repo.GetPeriodeUUID(ctx, idPeriode)
			if periodeUUID == "" {
				result.Skipped++
				continue
			}

			var kelompokUUID string
			s.repo.(*repository).db.GetContext(ctx, &kelompokUUID,
				"SELECT TOP 1 CAST(id_kelompok AS VARCHAR(36)) FROM kkn.kelompok_kkn WHERE legacy_id_desa = @p1 AND id_periode_kkn = @p2",
				idDesa, periodeUUID)
			if kelompokUUID == "" {
				result.Skipped++
				continue
			}

			dplData := bioMap[nip]
			if dplData == nil {
				dplData = map[string]interface{}{"nip": nip}
			}
			dplData["nip"] = nip

			isNew, err := s.repo.UpsertDPL(ctx, dplData, kelompokUUID, peran)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Updated++
			}
		}
		return
	}

	result.Skipped += len(data)
}

func (s *service) syncNilai(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	source := "dpl"
	if table == "nilai_kdpl" {
		source = "kdpl"
	}
	for _, row := range data {
		isNew, err := s.repo.UpsertNilai(ctx, row, source)
		if err != nil {
			result.Failed++
			continue
		}
		if isNew {
			result.Inserted++
		} else {
			result.Skipped++
		}
	}
}

func (s *service) syncLaporan(ctx context.Context, table string, data []map[string]interface{}, result *SyncResult) {
	if table == "mahasiswa_laporan_p" {
		for _, row := range data {
			isNew, err := s.repo.UpsertLaporan(ctx, row)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Skipped++
			}
		}
		return
	}
	if table == "mahasiswa_laporan_rk" {
		for _, row := range data {
			isNew, err := s.repo.UpsertProgramKerja(ctx, row)
			if err != nil {
				result.Failed++
				continue
			}
			if isNew {
				result.Inserted++
			} else {
				result.Skipped++
			}
		}
		return
	}
}

// ============================================================================
// LIST SERVICE METHODS
// ============================================================================

func (s *service) ListPeriode(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListPeriode(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListLokasi(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListLokasi(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListRegistrasi(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListRegistrasi(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListKelompok(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListKelompok(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListDPL(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListDPL(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListNilai(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListNilai(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) ListProgramKerja(ctx context.Context, f ListFilter) (*ListResponse, error) {
	items, total, err := s.repo.ListProgramKerja(ctx, f)
	if err != nil {
		return nil, err
	}
	totalPages := (total + f.Limit - 1) / f.Limit
	return &ListResponse{
		Items: items,
		Meta:  ListMeta{Total: total, Page: f.Page, Limit: f.Limit, TotalPages: totalPages},
	}, nil
}

func (s *service) logSync(ctx context.Context, group, status, syncedBy string, result *SyncResult) {
	if s.loggerSvc == nil {
		return
	}
	durationMs := int(result.Duration)
	s.loggerSvc.LogSync(ctx, &logger.CreateSyncLogRequest{
		EndpointName:  "KKN " + group,
		EndpointKey:   "kkn_" + group,
		SyncType:      "manual",
		Status:        status,
		APICode:       "KKN_WS_API",
		TotalRecords:  result.Fetched,
		InsertedCount: result.Inserted,
		UpdatedCount:  result.Updated,
		FailedCount:   result.Failed,
		SkippedCount:  result.Skipped,
		DurationMs:    &durationMs,
		SyncedBy:      syncedBy,
	})
}
