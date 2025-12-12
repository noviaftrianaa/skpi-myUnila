package unit_organisasi

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/jmoiron/sqlx"
)

// isValidUUID checks if a string is a valid UUID format
func isValidUUID(s string) bool {
	uuidPattern := regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
	return uuidPattern.MatchString(s)
}

// Repository interface for unit organisasi operations
type Repository interface {
	// Stats
	GetStats(ctx context.Context) (*SyncStats, error)

	// SMS operations (source data)
	GetSMSList(ctx context.Context, page, limit int, search string) ([]*SMS, int, error)
	GetSMSByID(ctx context.Context, id string) (*SMS, error)

	// Unit Organisasi operations (target data)
	GetUnitOrganisasiList(ctx context.Context, page, limit int, search string) ([]*UnitOrganisasiListItem, int, error)
	GetUnitOrganisasiByID(ctx context.Context, id string) (*UnitOrganisasi, error)
	UpsertUnitOrganisasi(ctx context.Context, unit *UnitOrganisasi) error

	// Sync operations
	SyncFromSMS(ctx context.Context, syncedBy string) (*SyncResult, error)

	// Comparison
	GetComparisonList(ctx context.Context, page, limit int, search string, filter string) ([]*ComparisonItem, int, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new unit organisasi repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// Universitas Lampung id_sp - only sync SMS from this SP
const UnilaIDSP = "e2b705a7-173e-464a-9fac-509128709515"

// GetStats returns statistics for dashboard
func (r *repository) GetStats(ctx context.Context) (*SyncStats, error) {
	stats := &SyncStats{}

	// Count total unit organisasi
	err := r.db.GetContext(ctx, &stats.TotalUnitOrganisasi, `
		SELECT COUNT(*) FROM man_akses.unit_organisasi WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to count unit organisasi: %w", err)
	}

	// Count total SMS - only from Universitas Lampung (id_sp)
	err = r.db.GetContext(ctx, &stats.TotalSMS, `
		SELECT COUNT(*) FROM pdrd.sms
		WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_sp) = @p1
	`, UnilaIDSP)
	if err != nil {
		return nil, fmt.Errorf("failed to count sms: %w", err)
	}

	// Count synced (SMS that exist in unit_organisasi) - only from Universitas Lampung
	// Use CONVERT to ensure proper UUID string comparison
	err = r.db.GetContext(ctx, &stats.TotalSynced, `
		SELECT COUNT(*) FROM pdrd.sms s
		INNER JOIN man_akses.unit_organisasi u ON CONVERT(VARCHAR(36), s.id_sms) = CONVERT(VARCHAR(36), u.id_organisasi)
		WHERE s.soft_delete = 0 AND u.soft_delete = 0 AND CONVERT(VARCHAR(36), s.id_sp) = @p1
	`, UnilaIDSP)
	if err != nil {
		return nil, fmt.Errorf("failed to count synced: %w", err)
	}

	stats.TotalNotSynced = stats.TotalSMS - stats.TotalSynced

	// Get last sync time
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM man_akses.unit_organisasi WHERE soft_delete = 0
	`)
	if err == nil {
		stats.LastSync = lastSync
	}

	return stats, nil
}

// GetSMSList returns paginated list of SMS - filtered by Universitas Lampung id_sp
func (r *repository) GetSMSList(ctx context.Context, page, limit int, search string) ([]*SMS, int, error) {
	offset := (page - 1) * limit

	// Count total - only from Universitas Lampung
	var total int
	var countErr error
	if search != "" {
		countErr = r.db.GetContext(ctx, &total, `
			SELECT COUNT(*) FROM pdrd.sms
			WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_sp) = @p1 AND (nm_lemb LIKE @p2 OR singkatan LIKE @p2)
		`, UnilaIDSP, "%"+search+"%")
	} else {
		countErr = r.db.GetContext(ctx, &total, `
			SELECT COUNT(*) FROM pdrd.sms
			WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_sp) = @p1
		`, UnilaIDSP)
	}
	if countErr != nil {
		return nil, 0, fmt.Errorf("failed to count SMS: %w", countErr)
	}

	// Get data - use CONVERT(VARCHAR(36), ...) for uniqueidentifier columns to avoid binary data
	// Filtered by Universitas Lampung id_sp
	var smsList []*SMS
	var queryErr error
	smsSelectQuery := `
		SELECT
			CONVERT(VARCHAR(36), id_sms) as id_sms,
			CONVERT(VARCHAR(36), id_fak_unila) as id_fak_unila,
			CONVERT(VARCHAR(36), id_lemb_non_sp) as id_lemb_non_sp,
			CONVERT(VARCHAR(36), id_jur_unila) as id_jur_unila,
			CONVERT(VARCHAR(36), id_jur) as id_jur,
			id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai,
			stat_prodi_unila, tgl_tutup, kode_snpmb, kode_prodi, nm_prodi_english,
			kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai,
			a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos,
			lintang, bujur, no_tel, no_fax, email, website, singkatan,
			tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara,
			sistem_ajar, a_pjj, a_psdku,
			CONVERT(VARCHAR(36), id_sp) as id_sp,
			id_jns_sms,
			CONVERT(VARCHAR(36), id_fungsi_lab) as id_fungsi_lab,
			CONVERT(VARCHAR(36), id_kel_usaha) as id_kel_usaha,
			id_wil,
			CONVERT(VARCHAR(36), id_induk_sms) as id_induk_sms,
			create_date,
			CONVERT(VARCHAR(36), id_creator) as id_creator,
			last_update,
			CONVERT(VARCHAR(36), id_updater) as id_updater,
			soft_delete, last_sync
		FROM pdrd.sms
	`
	if search != "" {
		queryErr = r.db.SelectContext(ctx, &smsList, smsSelectQuery+`
			WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_sp) = @p1 AND (nm_lemb LIKE @p2 OR singkatan LIKE @p2)
			ORDER BY nm_lemb ASC
			OFFSET @p3 ROWS FETCH NEXT @p4 ROWS ONLY
		`, UnilaIDSP, "%"+search+"%", offset, limit)
	} else {
		queryErr = r.db.SelectContext(ctx, &smsList, smsSelectQuery+`
			WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_sp) = @p1
			ORDER BY nm_lemb ASC
			OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY
		`, UnilaIDSP, offset, limit)
	}
	if queryErr != nil {
		return nil, 0, fmt.Errorf("failed to get SMS list: %w", queryErr)
	}

	return smsList, total, nil
}

// GetSMSByID returns SMS by ID
func (r *repository) GetSMSByID(ctx context.Context, id string) (*SMS, error) {
	var sms SMS
	err := r.db.GetContext(ctx, &sms, `
		SELECT * FROM pdrd.sms WHERE id_sms = @p1 AND soft_delete = 0
	`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get SMS: %w", err)
	}
	return &sms, nil
}

// GetUnitOrganisasiList returns paginated list of unit organisasi
func (r *repository) GetUnitOrganisasiList(ctx context.Context, page, limit int, search string) ([]*UnitOrganisasiListItem, int, error) {
	offset := (page - 1) * limit

	// Count total
	var total int
	var countErr error
	if search != "" {
		countErr = r.db.GetContext(ctx, &total, `
			SELECT COUNT(*) FROM man_akses.unit_organisasi
			WHERE soft_delete = 0 AND nm_lemb LIKE @p1
		`, "%"+search+"%")
	} else {
		countErr = r.db.GetContext(ctx, &total, `
			SELECT COUNT(*) FROM man_akses.unit_organisasi WHERE soft_delete = 0
		`)
	}
	if countErr != nil {
		return nil, 0, fmt.Errorf("failed to count unit organisasi: %w", countErr)
	}

	// Get data
	var list []*UnitOrganisasiListItem
	var queryErr error
	if search != "" {
		queryErr = r.db.SelectContext(ctx, &list, `
			SELECT id_organisasi, nm_lemb, ds_kel, kode_pos, no_tel, email, a_aktif, last_sync
			FROM man_akses.unit_organisasi
			WHERE soft_delete = 0 AND nm_lemb LIKE @p1
			ORDER BY nm_lemb ASC
			OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY
		`, "%"+search+"%", offset, limit)
	} else {
		queryErr = r.db.SelectContext(ctx, &list, `
			SELECT id_organisasi, nm_lemb, ds_kel, kode_pos, no_tel, email, a_aktif, last_sync
			FROM man_akses.unit_organisasi
			WHERE soft_delete = 0
			ORDER BY nm_lemb ASC
			OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
		`, offset, limit)
	}
	if queryErr != nil {
		return nil, 0, fmt.Errorf("failed to get unit organisasi list: %w", queryErr)
	}

	return list, total, nil
}

// GetUnitOrganisasiByID returns unit organisasi by ID
func (r *repository) GetUnitOrganisasiByID(ctx context.Context, id string) (*UnitOrganisasi, error) {
	var unit UnitOrganisasi
	err := r.db.GetContext(ctx, &unit, `
		SELECT * FROM man_akses.unit_organisasi WHERE id_organisasi = @p1 AND soft_delete = 0
	`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get unit organisasi: %w", err)
	}
	return &unit, nil
}

// UpsertUnitOrganisasi upserts unit organisasi
// Note: Uses TRY_CONVERT to safely convert UUID strings to uniqueidentifier type
func (r *repository) UpsertUnitOrganisasi(ctx context.Context, unit *UnitOrganisasi) error {
	query := `
		MERGE INTO man_akses.unit_organisasi AS target
		USING (SELECT TRY_CONVERT(UNIQUEIDENTIFIER, @p1) AS id_organisasi) AS source
		ON target.id_organisasi = source.id_organisasi
		WHEN MATCHED THEN
			UPDATE SET
				nm_lemb = @p2,
				jln = @p3,
				rt = @p4,
				rw = @p5,
				nm_dsn = @p6,
				ds_kel = @p7,
				kode_pos = @p8,
				lintang = @p9,
				bujur = @p10,
				no_tel = @p11,
				no_fax = @p12,
				email = @p13,
				website = @p14,
				kd_kl = @p15,
				kd_satker = @p16,
				id_wil = @p17,
				last_update = @p18,
				last_sync = @p18,
				id_updater = TRY_CONVERT(UNIQUEIDENTIFIER, @p19)
		WHEN NOT MATCHED THEN
			INSERT (id_organisasi, nm_lemb, jln, rt, rw, nm_dsn, ds_kel, kode_pos,
			        lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker,
			        level_organisasi, id_lembaga_asal, a_aktif, id_jns_lemb,
			        id_induk_organisasi, id_wil, tgl_create, last_update, soft_delete,
			        last_sync, id_updater)
			VALUES (TRY_CONVERT(UNIQUEIDENTIFIER, @p1), @p2, @p3, @p4, @p5, @p6, @p7, @p8,
			        @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16,
			        @p20, TRY_CONVERT(UNIQUEIDENTIFIER, @p21), @p22, @p23,
			        TRY_CONVERT(UNIQUEIDENTIFIER, @p24), @p17, @p18, @p18, 0,
			        @p18, TRY_CONVERT(UNIQUEIDENTIFIER, @p19));
	`

	_, err := r.db.ExecContext(ctx, query,
		unit.IDOrganisasi,      // @p1 - UUID string (converted to uniqueidentifier)
		unit.NmLemb,            // @p2
		unit.Jln,               // @p3
		unit.Rt,                // @p4
		unit.Rw,                // @p5
		unit.NmDsn,             // @p6
		unit.DsKel,             // @p7
		unit.KodePos,           // @p8
		unit.Lintang,           // @p9
		unit.Bujur,             // @p10
		unit.NoTel,             // @p11
		unit.NoFax,             // @p12
		unit.Email,             // @p13
		unit.Website,           // @p14
		unit.KdKl,              // @p15
		unit.KdSatker,          // @p16
		unit.IDWil,             // @p17
		time.Now(),             // @p18 - timestamp
		unit.IDUpdater,         // @p19 - UUID string (converted to uniqueidentifier)
		unit.LevelOrganisasi,   // @p20
		unit.IDLembagaAsal,     // @p21 - UUID string (converted to uniqueidentifier)
		unit.AAktif,            // @p22
		unit.IDJnsLemb,         // @p23
		unit.IDIndukOrganisasi, // @p24 - UUID string (converted to uniqueidentifier)
	)
	if err != nil {
		return fmt.Errorf("failed to upsert unit organisasi: %w", err)
	}

	return nil
}

// SyncFromSMS syncs data from pdrd.sms to man_akses.unit_organisasi
func (r *repository) SyncFromSMS(ctx context.Context, syncedBy string) (*SyncResult, error) {
	startTime := time.Now()
	result := &SyncResult{
		SyncedBy: syncedBy,
		Errors:   make([]string, 0),
	}

	fmt.Printf("📥 [Unit Organisasi Sync] Fetching SMS list from database...\n")

	// Get all SMS data
	smsList, _, err := r.GetSMSList(ctx, 1, 10000, "") // Get all
	if err != nil {
		return nil, fmt.Errorf("failed to get SMS list: %w", err)
	}

	result.TotalProcessed = len(smsList)
	fmt.Printf("📊 [Unit Organisasi Sync] Found %d SMS records to process\n", len(smsList))

	// Default values for required fields
	defaultLembagaAsal := "e2b705a7-173e-464a-9fac-509128709515" // Universitas Lampung ID
	defaultJnsLemb := 5                                          // Prodi/Unit
	defaultWilayah := "180000"                                   // Default wilayah Lampung
	defaultUpdater := "00000000-0000-0000-0000-000000000000"     // System UUID for id_updater

	// Use syncedBy if it's a valid UUID, otherwise use default
	updaterID := defaultUpdater
	if isValidUUID(syncedBy) {
		updaterID = syncedBy
	}

	totalCount := len(smsList)
	for i, sms := range smsList {
		// Log progress every 50 records
		if (i+1)%50 == 0 || i == 0 {
			fmt.Printf("⏳ [Unit Organisasi Sync] Processing %d/%d records...\n", i+1, totalCount)
		}

		// Map SMS to UnitOrganisasi
		dsKel := "Bandar Lampung" // Default
		if sms.DsKel != nil && *sms.DsKel != "" {
			dsKel = *sms.DsKel
		}

		// Use default wilayah if empty
		idWil := sms.IDWil
		if idWil == "" {
			idWil = defaultWilayah
		}

		unit := &UnitOrganisasi{
			IDOrganisasi:      sms.IDSMS,
			NmLemb:            sms.NmLemb,
			Jln:               sms.Jln,
			Rt:                sms.Rt,
			Rw:                sms.Rw,
			NmDsn:             sms.NmDsn,
			DsKel:             dsKel,
			KodePos:           sms.KodePos,
			Lintang:           sms.Lintang,
			Bujur:             sms.Bujur,
			NoTel:             sms.NoTel,
			NoFax:             sms.NoFax,
			Email:             sms.Email,
			Website:           sms.Website,
			KdKl:              sms.KdKl,
			KdSatker:          sms.KdSatker,
			IDWil:             idWil,
			IDLembagaAsal:     defaultLembagaAsal,
			AAktif:            1,
			IDJnsLemb:         defaultJnsLemb,
			IDIndukOrganisasi: sms.IDIndukSMS,
			IDUpdater:         updaterID,
		}

		// Check if exists
		existing, _ := r.GetUnitOrganisasiByID(ctx, sms.IDSMS)
		isInsert := existing == nil

		err := r.UpsertUnitOrganisasi(ctx, unit)
		if err != nil {
			result.TotalFailed++
			errMsg := fmt.Sprintf("[%s] %s: %v", sms.IDSMS, sms.NmLemb, err)
			result.Errors = append(result.Errors, errMsg)
			// Log first 3 errors to help debugging
			if result.TotalFailed <= 3 {
				fmt.Printf("❌ [Unit Organisasi Sync] Error #%d: %s\n", result.TotalFailed, errMsg)
			}
			continue
		}

		if isInsert {
			result.TotalInserted++
		} else {
			result.TotalUpdated++
		}
	}

	result.Duration = time.Since(startTime).String()
	return result, nil
}

// GetComparisonList returns comparison between SMS and unit_organisasi
// Filtered by Universitas Lampung id_sp
func (r *repository) GetComparisonList(ctx context.Context, page, limit int, search string, filter string) ([]*ComparisonItem, int, error) {
	offset := (page - 1) * limit

	// Build base query - always filter by Universitas Lampung id_sp
	baseWhere := "WHERE s.soft_delete = 0 AND CONVERT(VARCHAR(36), s.id_sp) = '" + UnilaIDSP + "'"
	if search != "" {
		baseWhere += " AND s.nm_lemb LIKE @p1"
	}

	switch filter {
	case "synced":
		baseWhere += " AND u.id_organisasi IS NOT NULL"
	case "not_synced":
		baseWhere += " AND u.id_organisasi IS NULL"
	}

	// Count total
	var total int
	var countErr error

	// Use CONVERT for UUID comparison to ensure proper string matching
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.sms s
		LEFT JOIN man_akses.unit_organisasi u ON CONVERT(VARCHAR(36), s.id_sms) = CONVERT(VARCHAR(36), u.id_organisasi) AND u.soft_delete = 0
		%s
	`, baseWhere)

	if search != "" {
		countErr = r.db.GetContext(ctx, &total, countQuery, "%"+search+"%")
	} else {
		countErr = r.db.GetContext(ctx, &total, countQuery)
	}
	if countErr != nil {
		return nil, 0, fmt.Errorf("failed to count comparison: %w", countErr)
	}

	// Get data
	var list []*ComparisonItem
	var queryErr error

	// Use CONVERT for UUID columns to ensure proper string format
	dataQuery := fmt.Sprintf(`
		SELECT
			CONVERT(VARCHAR(36), s.id_sms) as id_sms,
			s.nm_lemb as nm_lemb_sms,
			CASE WHEN u.id_organisasi IS NOT NULL THEN 1 ELSE 0 END as exists_in_manakses,
			u.nm_lemb as nm_lemb_manakses
		FROM pdrd.sms s
		LEFT JOIN man_akses.unit_organisasi u ON CONVERT(VARCHAR(36), s.id_sms) = CONVERT(VARCHAR(36), u.id_organisasi) AND u.soft_delete = 0
		%s
		ORDER BY s.nm_lemb ASC
	`, baseWhere)

	if search != "" {
		dataQuery += " OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY"
		queryErr = r.db.SelectContext(ctx, &list, dataQuery, "%"+search+"%", offset, limit)
	} else {
		dataQuery += " OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY"
		queryErr = r.db.SelectContext(ctx, &list, dataQuery, offset, limit)
	}
	if queryErr != nil {
		return nil, 0, fmt.Errorf("failed to get comparison list: %w", queryErr)
	}

	return list, total, nil
}
