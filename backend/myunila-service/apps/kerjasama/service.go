package kerjasama

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/monitoring"
)

// Service — orchestrates SIKERMA fetch + pdut upsert.
type Service interface {
	GetMouList(ctx context.Context, page, limit int, search string) (items []MouListItem, total int, err error)
	GetMouStats(ctx context.Context) (*MouStats, error)
	GetMouByID(ctx context.Context, id string) (*MoU, error)

	// Unit mapping (audit + manual override)
	GetUnitMappingList(ctx context.Context, page, limit int, search, strategy string) (items []UnitMapping, total int, err error)
	GetUnitMappingStats(ctx context.Context) (*UnitMappingStats, error)
	UpdateUnitMappingManual(ctx context.Context, sikermaUnitID int, idSms *string, notes *string) error

	// Sync from SIKERMA
	SyncFromSikerma(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error)
	// Generic adapter signature untuk scheduler runner
	SyncKerjasama(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error)
}

type service struct {
	repo       Repository
	client     *SikermaClient
	monitorSvc monitoring.Service
	loggerSvc  logger.Service
}

// NewService — constructor
func NewService(repo Repository, client *SikermaClient) Service {
	return &service{
		repo:       repo,
		client:     client,
		monitorSvc: monitoring.GetInstance(),
		loggerSvc:  logger.GetService(),
	}
}

// =============================================================================
// READ pass-through
// =============================================================================

func (s *service) GetMouList(ctx context.Context, page, limit int, search string) ([]MouListItem, int, error) {
	return s.repo.GetMouList(ctx, page, limit, search)
}

func (s *service) GetMouStats(ctx context.Context) (*MouStats, error) {
	return s.repo.GetMouStats(ctx)
}

func (s *service) GetMouByID(ctx context.Context, id string) (*MoU, error) {
	return s.repo.GetMouByID(ctx, id)
}

// =============================================================================
// UNIT MAPPING — admin CRUD pass-through
// =============================================================================

func (s *service) GetUnitMappingList(ctx context.Context, page, limit int, search, strategy string) ([]UnitMapping, int, error) {
	return s.repo.GetUnitMappingList(ctx, page, limit, search, strategy)
}

func (s *service) GetUnitMappingStats(ctx context.Context) (*UnitMappingStats, error) {
	return s.repo.GetUnitMappingStats(ctx)
}

func (s *service) UpdateUnitMappingManual(ctx context.Context, sikermaUnitID int, idSms *string, notes *string) error {
	return s.repo.UpdateUnitMappingManual(ctx, sikermaUnitID, idSms, notes)
}

// =============================================================================
// SYNC orchestration
// =============================================================================

// SyncFromSikerma — full sync flow:
//
//  1. Fetch list unit-kerja from SIKERMA
//  2. Build mapping cache: kode_unit → pdrd.sms.id_sms (lookup by kode_prodi atau nama_pendek)
//  3. Foreach unit (atau filter unit_ids):
//     a. Fetch /unit-kerja/{id}/kerjasama
//     b. Foreach kerjasama:
//     i.  Foreach mitra: upsert ke pdrd.dudi (by id_mitra → id_sikerma column)
//     ii. Pick mitra pertama sebagai primary (id_dudi di mou). Sisanya stored di
//         pdrd.dudi tapi tidak link langsung ke MoU ini (1 mou bisa banyak mitra,
//         schema kerjasama.mou cuma punya 1 id_dudi — accept primary mitra).
//     iii. Upsert kerjasama.mou (idempotent by id_sikerma).
//     iv.  Link ke kerjasama.sms_kerjasama (id_sms dari mapping cache).
//  4. Return SyncResult dengan ringkasan.
func (s *service) SyncFromSikerma(ctx context.Context, filter *SyncFilter, syncedBy string) (*SyncResult, error) {
	res := &SyncResult{StartedAt: time.Now()}

	log.Println("🔄 [Kerjasama] Starting sync from SIKERMA...")

	// Start monitoring (real-time progress untuk halaman /integrator/monitoring)
	syncID := ""
	if s.monitorSvc != nil {
		syncID = s.monitorSvc.StartSync("Kerjasama SIKERMA", "kerjasama", "manual", syncedBy, 0)
	}

	// Step 1: Fetch unit-kerja
	units, err := s.client.GetUnitKerja(ctx)
	if err != nil {
		res.FinishedAt = time.Now()
		res.DurationMs = res.FinishedAt.Sub(res.StartedAt).Milliseconds()
		errMsg := fmt.Sprintf("fetch unit-kerja: %v", err)
		res.Errors = append(res.Errors, errMsg)
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.FailSync(syncID, errMsg)
		}
		s.logSyncResult(ctx, syncedBy, "failed", res, &errMsg)
		return res, err
	}
	res.UnitTotal = len(units)
	log.Printf("   ✓ Fetched %d units from SIKERMA", len(units))

	if s.monitorSvc != nil && syncID != "" {
		s.monitorSvc.UpdateTotalRecords(syncID, len(units))
	}

	// Filter kalau ada
	if filter != nil && len(filter.UnitIDs) > 0 {
		filtered := []SikermaUnitKerja{}
		set := make(map[int]bool)
		for _, id := range filter.UnitIDs {
			set[id] = true
		}
		for _, u := range units {
			if set[u.ID] {
				filtered = append(filtered, u)
			}
		}
		units = filtered
		log.Printf("   → After filter: %d units", len(units))
	}

	// Step 2: Build mapping cache (parallel-ish but serial first untuk safety)
	mapping := make(map[int]string) // sikerma_unit_id → pdut_id_sms (kosong kalau univ-level)
	for _, u := range units {
		idSms := s.resolveSmsForUnit(ctx, u)
		mapping[u.ID] = idSms
	}
	mapped := 0
	for _, v := range mapping {
		if v != "" {
			mapped++
		}
	}
	log.Printf("   ✓ Mapping cache: %d/%d units mapped to pdrd.sms", mapped, len(mapping))

	// Step 3: Loop fetch kerjasama per unit
	for idx, u := range units {
		ksResp, err := s.client.GetKerjasamaByUnit(ctx, u.ID)
		if err != nil {
			res.UnitFailed++
			errMsg := fmt.Sprintf("unit %d (%s): %v", u.ID, u.NamaPendek, err)
			res.Errors = append(res.Errors, errMsg)
			log.Printf("   ✗ %s", errMsg)
			continue
		}
		res.UnitProcessed++
		idSms := mapping[u.ID]

		// Update real-time progress untuk monitoring page
		if s.monitorSvc != nil && syncID != "" {
			s.monitorSvc.UpdateProgress(syncID, idx+1,
				fmt.Sprintf("Unit %d/%d: %s (%d kerjasama)", idx+1, len(units), u.NamaPendek, len(ksResp.Data)))
		}

		for _, ks := range ksResp.Data {
			// Step 3a: Upsert mitra (loop daftar_mitra → pdrd.dudi)
			var primaryDudiID *string
			for _, m := range ks.DaftarMitra {
				dudi := &DUDI{IDSikerma: &m.IDMitra, NmDudi: &m.NamaMitra}
				if err := s.repo.UpsertDudi(ctx, dudi); err != nil {
					res.Errors = append(res.Errors, fmt.Sprintf("upsert dudi mitra %d: %v", m.IDMitra, err))
					continue
				}
				res.MitraUpserted++
				if primaryDudiID == nil {
					id := dudi.IDDudi
					primaryDudiID = &id
				}
			}

			// Step 3b: Upsert MoU
			tglMulai, _ := time.Parse("2006-01-02", ks.TglAwal)
			tglSelesai, _ := time.Parse("2006-01-02", ks.TglBerakhir)
			ksID := ks.ID
			jenisDokumen := ks.IDJenisDokumen
			nomorDok := ks.NomorDokumen
			judul := ks.JudulKerjasama

			// Primary mitra info → save di mou.nm_dudi/cp
			var nmDudi, cpName, cpJab *string
			if len(ks.DaftarMitra) > 0 {
				m := ks.DaftarMitra[0]
				nm := m.NamaMitra
				nmDudi = &nm
				if m.NamaPenandatangan != nil {
					cpName = m.NamaPenandatangan
				}
				if m.JabatanPenandatangan != nil {
					cpJab = m.JabatanPenandatangan
				}
			}

			mou := &MoU{
				IDSikerma:      &ksID,
				IDJenisDokumen: &jenisDokumen,
				SkMou:          &nomorDok,
				JudulMou:       &judul,
				TglMulai:       &tglMulai,
				TglSelesai:     &tglSelesai,
				NmDudi:         nmDudi,
				Cp:             cpName,
				JabCp:          cpJab,
				IDDudi:         primaryDudiID,
			}
			if err := s.repo.UpsertMou(ctx, mou); err != nil {
				res.Errors = append(res.Errors, fmt.Sprintf("upsert mou unit %d ks %d: %v", u.ID, ks.ID, err))
				continue
			}
			res.MouUpserted++

			// Step 3c: Link ke sms_kerjasama (kalau prodi/fakultas mapped)
			if idSms != "" && mou.IDMou != "" {
				if err := s.repo.LinkSmsKerjasama(ctx, mou.IDMou, idSms, nil); err != nil {
					res.Errors = append(res.Errors, fmt.Sprintf("link sms_kerjasama unit %d: %v", u.ID, err))
				}
			}
		}
	}

	res.FinishedAt = time.Now()
	res.DurationMs = res.FinishedAt.Sub(res.StartedAt).Milliseconds()

	// Complete monitoring + log to DB
	status := "success"
	if res.UnitFailed > 0 || len(res.Errors) > 0 {
		if res.UnitProcessed == 0 {
			status = "failed"
		} else {
			status = "partial"
		}
	}
	completionMsg := fmt.Sprintf("%d unit OK, %d failed, %d mou upserted, %d mitra upserted",
		res.UnitProcessed, res.UnitFailed, res.MouUpserted, res.MitraUpserted)
	if s.monitorSvc != nil && syncID != "" {
		if status == "failed" {
			s.monitorSvc.FailSync(syncID, completionMsg)
		} else {
			s.monitorSvc.CompleteSync(syncID, completionMsg)
		}
	}
	s.logSyncResult(ctx, syncedBy, status, res, nil)

	log.Printf("✅ [Kerjasama] Sync done: %s, took %dms", completionMsg, res.DurationMs)
	return res, nil
}

// logSyncResult — persist sync attempt ke logger (visible di /dashboard/integrator/logs).
func (s *service) logSyncResult(ctx context.Context, syncedBy, status string, res *SyncResult, errMsg *string) {
	loggerSvc := s.loggerSvc
	if loggerSvc == nil {
		loggerSvc = logger.GetService()
	}
	if loggerSvc == nil {
		log.Println("⚠️  [Kerjasama] Logger service not available, skipping DB log")
		return
	}

	durationMs := int(res.DurationMs)
	var errDetails *string
	if len(res.Errors) > 0 {
		// Cap supaya tidak meledak ke text yang sangat panjang
		max := 5
		if len(res.Errors) < max {
			max = len(res.Errors)
		}
		joined := strings.Join(res.Errors[:max], "\n")
		if len(res.Errors) > max {
			joined += fmt.Sprintf("\n…(+%d more)", len(res.Errors)-max)
		}
		errDetails = &joined
	}

	syncType := "manual"
	if syncedBy == "scheduler" {
		syncType = "scheduled"
	}

	req := &logger.CreateSyncLogRequest{
		EndpointName:  "Kerjasama SIKERMA",
		EndpointKey:   "kerjasama",
		SyncType:      syncType,
		Status:        status,
		APICode:       "SIKERMA",
		TotalRecords:  res.UnitTotal,
		InsertedCount: res.MouUpserted + res.MitraUpserted,
		UpdatedCount:  0, // upsert counter agnostic — semua dianggap inserted di logger
		FailedCount:   res.UnitFailed,
		SkippedCount:  res.MouSkipped,
		DurationMs:    &durationMs,
		ErrorMessage:  errMsg,
		ErrorDetails:  errDetails,
		SyncedBy:      syncedBy,
	}
	if _, err := loggerSvc.LogSync(ctx, req); err != nil {
		log.Printf("⚠️  [Kerjasama] LogSync failed: %v", err)
	}
}

// resolveSmsForUnit — try multiple strategy untuk dapat id_sms,
// PLUS record audit ke kerjasama.unit_mapping supaya admin bisa lihat
// unit yang belum termapping + override manual via CRUD frontend.
//
// Strategy ordering (preserve manual override):
//  1. Cek existing unit_mapping — kalau strategy=='manual' + id_sms terisi, pakai itu
//  2. kode_unit 5-digit → lookup pdrd.sms.kode_prodi (PRODI)
//  3. kode_unit "UN26" + nama_pendek fakultas → lookup id_jns_sms=1 (FAKULTAS)
//  4. Lainnya → strategy="univ" (univ-level kerjasama, skip sms_kerjasama bridge)
func (s *service) resolveSmsForUnit(ctx context.Context, u SikermaUnitKerja) string {
	idSms := ""
	strategy := "unmapped"

	// Strategy 1: Prodi (5-digit kode)
	if len(u.KodeUnit) == 5 && isAllDigit(u.KodeUnit) {
		if id, err := s.repo.GetSmsByKodeProdi(ctx, u.KodeUnit); err == nil && id != "" {
			idSms = id
			strategy = "kode_prodi"
		}
	}

	// Strategy 2: Fakultas (UN26 + nama_pendek)
	if idSms == "" && u.KodeUnit == "UN26" && isFakultasShortName(u.NamaPendek) {
		if id, err := s.repo.GetFakultasByName(ctx, u.NamaPendek); err == nil && id != "" {
			idSms = id
			strategy = "fakultas"
		}
	}

	// Strategy 3: univ-level (UN26.XX biro/UPT, atau UN26 yang bukan fakultas)
	if idSms == "" && (strings.HasPrefix(u.KodeUnit, "UN26") || u.KodeUnit == "UN26") {
		strategy = "univ"
	}

	// Audit: write/update kerjasama.unit_mapping
	mapping := &UnitMapping{
		SikermaUnitID: u.ID,
		KodeUnit:      &u.KodeUnit,
		Jenjang:       &u.Jenjang,
		UnitNama:      &u.Unit,
		NamaPendek:    &u.NamaPendek,
		Strategy:      &strategy,
	}
	if idSms != "" {
		mapping.IDSms = &idSms
	}
	if err := s.repo.UpsertUnitMapping(ctx, mapping); err != nil {
		log.Printf("⚠️  [Kerjasama] upsert unit_mapping unit %d: %v", u.ID, err)
	}

	return idSms
}

// SyncKerjasama — adapter untuk scheduler runner (mirror pattern radius/siakadu).
// Ignore filter param (sync all units).
func (s *service) SyncKerjasama(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error) {
	res, err := s.SyncFromSikerma(ctx, &SyncFilter{}, syncedBy)
	return res, err
}

// =============================================================================
// helpers
// =============================================================================

func isAllDigit(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

func isFakultasShortName(s string) bool {
	switch strings.TrimSpace(s) {
	case "FK", "FT", "FP", "FH", "FEB", "FKIP", "FISIP", "MIPA", "Pascasarjana":
		return true
	}
	return false
}
