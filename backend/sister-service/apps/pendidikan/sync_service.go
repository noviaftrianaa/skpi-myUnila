package pendidikan

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sister-service/external/sister_api"
)

type SyncService interface {
	SyncPendidikanFormalByIDSDM(idSDM, syncedBy string) (*BatchPendidikanFormalSyncResult, error)
}

type syncService struct {
	repo      Repository
	sisterAPI *sister_api.Client
}

func NewSyncService(repo Repository, sisterAPI *sister_api.Client) SyncService {
	return &syncService{
		repo:      repo,
		sisterAPI: sisterAPI,
	}
}

// SyncPendidikanFormalByIDSDM syncs all pendidikan formal for a dosen from SISTER API
func (s *syncService) SyncPendidikanFormalByIDSDM(idSDM, syncedBy string) (*BatchPendidikanFormalSyncResult, error) {
	startTime := time.Now()
	log.Printf("📚 Starting pendidikan formal sync for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	// Get list of pendidikan formal from SISTER API
	listResp, err := s.sisterAPI.GetPendidikanFormalByIDSDM(idSDM)
	if err != nil {
		log.Printf("❌ Failed to get pendidikan formal list from SISTER API: %v", err)
		return nil, fmt.Errorf("failed to get pendidikan formal list: %w", err)
	}

	var pendidikanList []SisterPendidikanFormalListItem
	if err := json.Unmarshal(listResp, &pendidikanList); err != nil {
		log.Printf("❌ Failed to unmarshal pendidikan formal list: %v", err)
		return nil, fmt.Errorf("failed to unmarshal pendidikan formal list: %w", err)
	}

	log.Printf("📋 Found %d pendidikan formal records for id_sdm: %s", len(pendidikanList), idSDM)

	results := make([]PendidikanFormalSyncResult, 0, len(pendidikanList))
	totalSuccess := 0
	totalFailed := 0

	// Process each pendidikan formal
	for _, item := range pendidikanList {
		result := s.syncSinglePendidikanFormal(item.ID, idSDM)
		results = append(results, result)

		if result.Success {
			totalSuccess++
		} else {
			totalFailed++
		}
	}

	duration := time.Since(startTime)
	log.Printf("✅ Pendidikan formal sync completed for id_sdm: %s - Success: %d, Failed: %d, Duration: %s",
		idSDM, totalSuccess, totalFailed, duration)

	return &BatchPendidikanFormalSyncResult{
		TotalProcessed: len(pendidikanList),
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		Duration:       duration.String(),
		Results:        results,
		SyncedBy:       syncedBy,
	}, nil
}

// syncSinglePendidikanFormal syncs a single pendidikan formal record
func (s *syncService) syncSinglePendidikanFormal(idPendidikan, idSDM string) PendidikanFormalSyncResult {
	// Get detail from SISTER API
	detailResp, err := s.sisterAPI.GetPendidikanFormalDetail(idPendidikan)
	if err != nil {
		log.Printf("❌ Failed to get pendidikan formal detail %s: %v", idPendidikan, err)
		return PendidikanFormalSyncResult{
			IDRwyDidikFormal: idPendidikan,
			Success:          false,
			Error:            fmt.Sprintf("failed to get detail: %v", err),
		}
	}

	var detail SisterPendidikanFormalDetail
	if err := json.Unmarshal(detailResp, &detail); err != nil {
		log.Printf("❌ Failed to unmarshal pendidikan formal detail %s: %v", idPendidikan, err)
		return PendidikanFormalSyncResult{
			IDRwyDidikFormal: idPendidikan,
			Success:          false,
			Error:            fmt.Sprintf("failed to unmarshal detail: %v", err),
		}
	}

	// Map SISTER API response to database entity
	pendidikan := s.mapSisterResponseToEntity(&detail, idSDM)

	// Merge to database
	if err := s.repo.MergePendidikanFormal(pendidikan); err != nil {
		log.Printf("❌ Failed to merge pendidikan formal %s: %v", idPendidikan, err)
		return PendidikanFormalSyncResult{
			IDRwyDidikFormal:    idPendidikan,
			NamaPerguruanTinggi: detail.NamaPerguruanTinggi,
			Success:             false,
			Error:               fmt.Sprintf("failed to merge: %v", err),
		}
	}

	log.Printf("✅ Successfully synced pendidikan formal: %s - %s", idPendidikan, detail.NamaPerguruanTinggi)
	return PendidikanFormalSyncResult{
		IDRwyDidikFormal:    idPendidikan,
		NamaPerguruanTinggi: detail.NamaPerguruanTinggi,
		Success:             true,
	}
}

// mapSisterResponseToEntity maps SISTER API response to database entity
func (s *syncService) mapSisterResponseToEntity(detail *SisterPendidikanFormalDetail, idSDM string) *RwyPendFormal {
	now := time.Now()

	// Map id_sms (id_program_studi) - insert if has value
	var idSMS *string
	if detail.IDProgramStudi != nil && *detail.IDProgramStudi != "" {
		idSMS = detail.IDProgramStudi
	}

	// Map id_katgiat - use -1 if undefined, otherwise use API value
	idKatgiat := -1
	// If kategori_kegiatan is not "(undefined)", we could parse it here
	// For now, keeping -1 as default

	// Map stat_kul - 'L' if tahun_lulus exists, else '1'
	statKul := "1"
	if detail.TahunLulus > 0 {
		statKul = "L"
	}

	// Map tahun_masuk
	var thnMasuk *int
	if detail.TahunMasuk > 0 {
		thnMasuk = &detail.TahunMasuk
	}

	// Map tahun_lulus
	var thnLulus *int
	if detail.TahunLulus > 0 {
		thnLulus = &detail.TahunLulus
	}

	// Map tanggal_lulus
	var tglLulus *time.Time
	if detail.TanggalLulus != nil && *detail.TanggalLulus != "" {
		if parsed, err := time.Parse("2006-01-02", *detail.TanggalLulus); err == nil {
			tglLulus = &parsed
		}
	}

	// Map tanggal_sk_penyetaraan
	var tglSkSetara *time.Time
	if detail.TanggalSkPenyetaraan != nil && *detail.TanggalSkPenyetaraan != "" {
		if parsed, err := time.Parse("2006-01-02", *detail.TanggalSkPenyetaraan); err == nil {
			tglSkSetara = &parsed
		}
	}

	// Map id_jenj_didik
	var idJenjDidik *int
	if detail.IDJenjangPendidikan > 0 {
		idJenjDidik = &detail.IDJenjangPendidikan
	}

	// Map id_bid_studi
	var idBidStudi *int
	if detail.IDBidangStudi > 0 {
		idBidStudi = &detail.IDBidangStudi
	}

	// Map id_gelar_akad
	var idGelarAkad *int
	if detail.IDGelarAkademik > 0 {
		idGelarAkad = &detail.IDGelarAkademik
	}

	// Map jumlah_semester
	var smt *int
	if detail.JumlahSemester > 0 {
		smt = &detail.JumlahSemester
	}

	// Map jumlah_sks
	var sksLulus *int
	if detail.JumlahSKS > 0 {
		sksLulus = &detail.JumlahSKS
	}

	// Map ipk
	var ipk *float64
	if detail.IPK > 0 {
		ipk = &detail.IPK
	}

	// Map nomor_induk
	var nipd *string
	if detail.NomorInduk != "" && detail.NomorInduk != "-" {
		nipd = &detail.NomorInduk
	}

	return &RwyPendFormal{
		IDRwyDidikFormal: detail.ID,
		IDSMS:            idSMS,
		IDKatgiat:        idKatgiat,
		IDSDM:            idSDM,
		IDJenjDidik:      idJenjDidik,
		IDBidStudi:       idBidStudi,
		IDGelarAkad:      idGelarAkad,
		NmSpFormal:       &detail.NamaPerguruanTinggi,
		Fak:              nil, // Leave empty as per requirement
		AKependidikan:    0,   // Default 0 as per requirement
		ThnMasuk:         thnMasuk,
		ThnLulus:         thnLulus,
		NIPD:             nipd,
		StatKul:          statKul,
		Smt:              smt,
		SksLulus:         sksLulus,
		IPK:              ipk,
		SkSetara:         detail.SkPenyetaraan,
		TglSkSetara:      tglSkSetara,
		NoIjazah:         detail.NomorIjazah,
		JudulTesis:       detail.JudulTugasAkhir,
		TglLulus:         tglLulus,
		CreateDate:       now,
		IDCreator:        idSDM,
		LastUpdate:       now,
		IDUpdater:        &idSDM,
		SoftDelete:       0,
		LastSync:         &now,
	}
}
