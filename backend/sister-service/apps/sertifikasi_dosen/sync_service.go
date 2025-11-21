package sertifikasi_dosen

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sister-service/external/sister_api"
	"sister-service/pkg/timeutil"
)

type SyncService interface {
	SyncSertifikasiByIDSDM(idSDM string) (*SyncResult, error)
	BatchSyncAllSertifikasi(syncedBy string) (*BatchSyncResult, error)
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

// SyncSertifikasiByIDSDM syncs sertifikasi for a single dosen
func (s *syncService) SyncSertifikasiByIDSDM(idSDM string) (*SyncResult, error) {
	log.Printf("🔄 [manual] Starting sertifikasi sync for id_sdm: %s", idSDM)

	result := &SyncResult{
		IDSDM:   idSDM,
		Success: 0,
		Failed:  0,
	}

	// Call SISTER API to get list of sertifikasi
	rawData, err := s.sisterAPI.GetSertifikasiDosenByIDSDM(idSDM)
	if err != nil {
		result.Failed++
		result.Message = fmt.Sprintf("Failed to fetch sertifikasi list: %v", err)
		log.Printf("❌ Failed to fetch sertifikasi list for %s: %v", idSDM, err)
		return result, err
	}

	// Unmarshal response
	var sertifikasiList []SertifikasiDosenListItem
	if err := json.Unmarshal(rawData, &sertifikasiList); err != nil {
		result.Failed++
		result.Message = fmt.Sprintf("Failed to parse sertifikasi list: %v", err)
		log.Printf("❌ Failed to parse sertifikasi list for %s: %v", idSDM, err)
		return result, err
	}

	log.Printf("📊 Found %d sertifikasi records for id_sdm: %s", len(sertifikasiList), idSDM)

	if len(sertifikasiList) == 0 {
		result.Message = "No sertifikasi records found"
		log.Printf("ℹ️  No sertifikasi records found for id_sdm: %s", idSDM)
		return result, nil
	}

	// Process each sertifikasi
	for i, item := range sertifikasiList {
		log.Printf("🔄 Processing sertifikasi %d/%d: %s (%s)", i+1, len(sertifikasiList), item.JenisSertifikasi, item.ID)

		// Get detail for this sertifikasi
		err := s.syncSertifikasiDetail(item.ID, idSDM)
		if err != nil {
			log.Printf("❌ Failed to sync %s: %v", item.ID, err)
			result.Failed++
			continue
		}

		result.Success++
	}

	result.Message = fmt.Sprintf("Synced %d/%d sertifikasi successfully", result.Success, len(sertifikasiList))
	log.Printf("✅ Sertifikasi sync completed for id_sdm: %s - Success: %d, Failed: %d", idSDM, result.Success, result.Failed)

	return result, nil
}

// syncSertifikasiDetail fetches detail and syncs to database
func (s *syncService) syncSertifikasiDetail(idRwySert, idSDM string) error {
	// Fetch detail from SISTER API
	detailData, err := s.sisterAPI.GetSertifikasiDosenDetail(idRwySert)
	if err != nil {
		return fmt.Errorf("failed to fetch sertifikasi detail: %w", err)
	}

	// Unmarshal response
	var detail SertifikasiDosenDetail
	if err := json.Unmarshal(detailData, &detail); err != nil {
		return fmt.Errorf("failed to parse sertifikasi detail: %w", err)
	}

	// Lookup jenis_sertifikasi ID
	var idJnsSert sql.NullInt32
	if detail.JenisSertifikasi != "" {
		jnsID, err := s.repo.GetJenisSertifikasiIDByName(detail.JenisSertifikasi)
		if err != nil {
			log.Printf("⚠️  Warning: Could not find jenis_sertifikasi for '%s', will use NULL", detail.JenisSertifikasi)
			idJnsSert = sql.NullInt32{Valid: false}
		} else {
			idJnsSert = sql.NullInt32{Int32: int32(jnsID), Valid: true}
		}
	}

	// Map id_bidang_studi
	var idBidStudi sql.NullInt32
	if detail.IDBidangStudi > 0 {
		idBidStudi = sql.NullInt32{Int32: int32(detail.IDBidangStudi), Valid: true}
	}

	// Map id_lemb_sert
	var idLembSert sql.NullInt32
	if detail.IDLembSert != nil && *detail.IDLembSert > 0 {
		idLembSert = sql.NullInt32{Int32: int32(*detail.IDLembSert), Valid: true}
	}

	// Map tahun_sertifikasi
	var thnSert sql.NullInt32
	if detail.TahunSertifikasi > 0 {
		thnSert = sql.NullInt32{Int32: int32(detail.TahunSertifikasi), Valid: true}
	}

	// Map tmt_sert and tst_sert
	var tmtSert, tstSert sql.NullTime
	if detail.TmtSert != nil {
		if t, err := time.Parse("2006-01-02", *detail.TmtSert); err == nil {
			tmtSert = sql.NullTime{Time: t, Valid: true}
		} else if t, err := time.Parse("2006-01-02 15:04:05", *detail.TmtSert); err == nil {
			tmtSert = sql.NullTime{Time: t, Valid: true}
		}
	}
	if detail.TstSert != nil {
		if t, err := time.Parse("2006-01-02", *detail.TstSert); err == nil {
			tstSert = sql.NullTime{Time: t, Valid: true}
		} else if t, err := time.Parse("2006-01-02 15:04:05", *detail.TstSert); err == nil {
			tstSert = sql.NullTime{Time: t, Valid: true}
		}
	}

	// Prepare rwy_sertifikasi
	rwySertifikasi := &RwySertifikasi{
		IDRwySert:  detail.ID,
		IDJnsSert:  idJnsSert,
		IDBidStudi: idBidStudi,
		IDLembSert: idLembSert,
		IDSDM:      idSDM,
		ThnSert:    thnSert,
		SKSert:     sql.NullString{String: detail.SKSertifikasi, Valid: detail.SKSertifikasi != ""},
		Nrg:        sql.NullString{String: detail.NomorRegistrasi, Valid: detail.NomorRegistrasi != ""},
		NoPeserta:  sql.NullString{String: detail.NomorPeserta, Valid: detail.NomorPeserta != ""},
		TmtSert:    tmtSert,
		TstSert:    tstSert,
		LastSync:   sql.NullTime{Time: timeutil.NowWIB(), Valid: true},
	}

	// Merge rwy_sertifikasi
	err = s.repo.MergeRwySertifikasi(rwySertifikasi)
	if err != nil {
		return fmt.Errorf("failed to merge rwy_sertifikasi: %w", err)
	}

	// Get jenis_dokumen mapping
	jenisDokMap, err := s.repo.GetJenisDokumenMap()
	if err != nil {
		log.Printf("⚠️  Warning: Failed to get jenis_dokumen map: %v", err)
		jenisDokMap = make(map[string]int)
	}

	// Process documents
	activeDokIDs := []string{}
	now := timeutil.NowWIB()
	for _, dok := range detail.Dokumen {
		// Skip if nama is empty - required field
		if dok.Nama == "" {
			log.Printf("⚠️  Warning: Skipping dokumen %s with empty nama", dok.ID)
			continue
		}

		// Find jenis_dokumen ID
		idJnsDok := 0
		if jnsID, ok := jenisDokMap[dok.JenisDokumen]; ok {
			idJnsDok = jnsID
		} else {
			log.Printf("⚠️  Warning: Jenis dokumen '%s' not found in reference table, using 0", dok.JenisDokumen)
		}

		// Parse tanggal_upload
		wktUnggah := now // Default to current time
		if dok.TanggalUpload != "" {
			if t, err := time.Parse("2006-01-02 15:04:05", dok.TanggalUpload); err == nil {
				wktUnggah = t
			} else if t, err := time.Parse("2006-01-02", dok.TanggalUpload); err == nil {
				wktUnggah = t
			}
		}

		// Prepare dokumen with pointers
		dokumen := &Dokumen{
			IDDok:      dok.ID,
			IDJnsDok:   &idJnsDok,
			NmDok:      &dok.Nama,
			KetDok:     dok.Keterangan,
			WktUnggah:  wktUnggah,
			URL:        dok.Tautan,
			MediaType:  &dok.JenisFile,
			FileName:   &dok.NamaFile,
			IDCreator:  idSDM,
			CreateDate: now,
			LastUpdate: now,
			IDUpdater:  &idSDM,
			SoftDelete: 0,
			LastSync:   now,
		}

		// Merge dokumen
		err = s.repo.MergeDokumen(dokumen)
		if err != nil {
			log.Printf("⚠️  Warning: Failed to merge dokumen %s: %v", dok.ID, err)
			continue
		}

		// Link dokumen to sertifikasi
		err = s.repo.MergeDokRwySertifikasi(detail.ID, dok.ID)
		if err != nil {
			log.Printf("⚠️  Warning: Failed to link dokumen %s: %v", dok.ID, err)
			continue
		}

		activeDokIDs = append(activeDokIDs, dok.ID)
	}

	// Soft delete old documents
	err = s.repo.SoftDeleteDokumenNotInList(detail.ID, activeDokIDs)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to soft delete old dokumen: %v", err)
	}

	return nil
}

// BatchSyncAllSertifikasi syncs sertifikasi for all active dosen
func (s *syncService) BatchSyncAllSertifikasi(syncedBy string) (*BatchSyncResult, error) {
	startTime := timeutil.NowWIB()
	log.Printf("🚀 Starting batch sync all sertifikasi - triggered by: %s", syncedBy)

	// Get all active dosen
	idSDMList, err := s.repo.GetAllActiveDosenIDSDM()
	if err != nil {
		log.Printf("❌ Failed to get active dosen list: %v", err)
		return nil, fmt.Errorf("failed to get active dosen list: %w", err)
	}

	totalDosen := len(idSDMList)
	log.Printf("📊 Found %d active dosen to sync", totalDosen)

	result := &BatchSyncResult{
		TotalDosen:   totalDosen,
		TotalSuccess: 0,
		TotalFailed:  0,
		SyncedBy:     syncedBy,
		FailedDosen:  []string{},
	}

	// Process each dosen
	for i, idSDM := range idSDMList {
		log.Printf("🔄 Syncing dosen %d/%d: %s", i+1, totalDosen, idSDM)

		syncResult, err := s.SyncSertifikasiByIDSDM(idSDM)
		if err != nil {
			log.Printf("❌ Failed to sync dosen %s: %v", idSDM, err)
			result.TotalFailed++
			result.FailedDosen = append(result.FailedDosen, idSDM)
			continue
		}

		if syncResult.Success > 0 {
			result.TotalSuccess++
		}
		if syncResult.Failed > 0 {
			result.TotalFailed++
			result.FailedDosen = append(result.FailedDosen, idSDM)
		}
	}

	duration := time.Since(startTime)
	result.Duration = duration.String()

	log.Printf("✅ Batch sync completed - Duration: %s, Success: %d, Failed: %d",
		result.Duration, result.TotalSuccess, result.TotalFailed)

	return result, nil
}
