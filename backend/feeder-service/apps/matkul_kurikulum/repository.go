package matkul_kurikulum

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for matkul_kurikulum data access
type Repository interface {
	// Bulk operations
	BulkUpsertKurikulumSP(ctx context.Context, data []*KurikulumSP) error
	BulkUpsertMatkulKurikulum(ctx context.Context, data []*MatkulKurikulum) error
	BulkUpsertMatkul(ctx context.Context, data []*Matkul) error

	// List operations with filters
	GetKurikulumList(ctx context.Context, page, limit int, search string, idProdi *string, sortBy, sortOrder string) (*KurikulumListResult, error)
	GetKurikulumByID(ctx context.Context, idKurikulumSP string) (*KurikulumSP, error)
	GetMatkulByKurikulum(ctx context.Context, idKurikulumSP string) ([]*MatkulKurikulum, error)

	// Utility - Get prodi list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*KurikulumStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new matkul_kurikulum repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertKurikulumSP performs bulk upsert for kurikulum_sp
func (r *repository) BulkUpsertKurikulumSP(ctx context.Context, data []*KurikulumSP) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.kurikulum_sp AS target
		USING (SELECT @p1 AS id_kurikulum_sp) AS source
		ON target.id_kurikulum_sp = source.id_kurikulum_sp
		WHEN MATCHED THEN
			UPDATE SET
				id_smt = @p2,
				id_jenj_didik = @p3,
				id_sms = CAST(@p4 AS UNIQUEIDENTIFIER),
				nm_kurikulum_sp = @p5,
				jmlh_smt_normal = @p6,
				jmlh_sks_lulus = @p7,
				jmlh_sks_wajib = @p8,
				jmlh_sks_pilihan = @p9,
				jmlh_sks_mk_wajib = @p10,
				jmlh_sks_mk_pilih = @p11,
				last_update = @p12,
				id_updater = @p16,
				last_sync = @p13
		WHEN NOT MATCHED THEN
			INSERT (
				id_kurikulum_sp, id_smt, id_jenj_didik, id_sms,
				nm_kurikulum_sp, jmlh_smt_normal, jmlh_sks_lulus, jmlh_sks_wajib,
				jmlh_sks_pilihan, jmlh_sks_mk_wajib, jmlh_sks_mk_pilih,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, @p3, CAST(@p4 AS UNIQUEIDENTIFIER),
				@p5, @p6, @p7, @p8,
				@p9, @p10, @p11,
				@p14, @p15, @p12, @p16, @p17, @p13
			);
	`

	for _, kur := range data {
		var idSms interface{}
		if kur.IDSMS != nil {
			idSms = *kur.IDSMS
		}

		_, err = tx.ExecContext(ctx, query,
			kur.IDKurikulumSP,     // @p1
			kur.IDSmt,             // @p2
			kur.IDJenjDidik,       // @p3
			idSms,                 // @p4
			kur.NmKurikulumSP,     // @p5
			kur.JmlhSmtNormal,     // @p6
			kur.JmlhSksLulus,      // @p7
			kur.JmlhSksWajib,      // @p8
			kur.JmlhSksPilihan,    // @p9
			kur.JmlhSksMkWajib,    // @p10
			kur.JmlhSksMkPilih,    // @p11
			kur.LastUpdate,        // @p12 - for UPDATE
			kur.LastSync,          // @p13 - for both
			kur.CreateDate,        // @p14 - for INSERT
			kur.IDCreator,         // @p15 - for INSERT
			kur.IDUpdater,         // @p16 - for both
			kur.SoftDelete,        // @p17 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert kurikulum_sp %s: %w", kur.IDKurikulumSP, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertMatkulKurikulum performs bulk upsert for matkul_kurikulum
func (r *repository) BulkUpsertMatkulKurikulum(ctx context.Context, data []*MatkulKurikulum) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.matkul_kurikulum AS target
		USING (SELECT @p1 AS id_kurikulum_sp, CAST(@p2 AS UNIQUEIDENTIFIER) AS id_mk) AS source
		ON target.id_kurikulum_sp = source.id_kurikulum_sp AND target.id_mk = source.id_mk
		WHEN MATCHED THEN
			UPDATE SET
				smt = @p3,
				sks_mk = @p4,
				sks_tm = @p5,
				sks_prak = @p6,
				sks_prak_lap = @p7,
				sks_sim = @p8,
				a_wajib = @p9,
				last_update = @p10,
				id_updater = @p14,
				last_sync = @p11
		WHEN NOT MATCHED THEN
			INSERT (
				id_kurikulum_sp, id_mk, smt, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, a_wajib,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, CAST(@p2 AS UNIQUEIDENTIFIER), @p3, @p4, @p5, @p6, @p7, @p8, @p9,
				@p12, @p13, @p10, @p14, @p15, @p11
			);
	`

	for _, mk := range data {
		var idMk interface{}
		if mk.IDMk != nil {
			idMk = *mk.IDMk
		}

		_, err = tx.ExecContext(ctx, query,
			mk.IDKurikulumSP, // @p1
			idMk,             // @p2
			mk.Smt,           // @p3
			mk.SksMk,         // @p4
			mk.SksTm,         // @p5
			mk.SksPrak,       // @p6
			mk.SksPrakLap,    // @p7
			mk.SksSim,        // @p8
			mk.AWajib,        // @p9
			mk.LastUpdate,    // @p10 - for UPDATE
			mk.LastSync,      // @p11 - for both
			mk.CreateDate,    // @p12 - for INSERT
			mk.IDCreator,     // @p13 - for INSERT
			mk.IDUpdater,     // @p14 - for both
			mk.SoftDelete,    // @p15 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert matkul_kurikulum %s-%v: %w", mk.IDKurikulumSP, idMk, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertMatkul performs bulk upsert for matkul
func (r *repository) BulkUpsertMatkul(ctx context.Context, data []*Matkul) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.matkul AS target
		USING (SELECT @p1 AS id_mk) AS source
		ON target.id_mk = source.id_mk
		WHEN MATCHED THEN
			UPDATE SET
				id_jenj_didik = @p2,
				id_sms = CAST(@p3 AS UNIQUEIDENTIFIER),
				sks_mk = @p4,
				sks_tm = @p5,
				sks_prak = @p6,
				sks_prak_lap = @p7,
				sks_sim = @p8,
				kode_mk = @p9,
				nm_mk = @p10,
				jns_mk = @p11,
				kel_mk = @p12,
				metode_pelaksanaan_kuliah = @p13,
				a_sap = @p14,
				a_silabus = @p15,
				a_bahan_ajar = @p16,
				acara_prak = @p17,
				a_diktat = @p18,
				tgl_mulai_efektif = @p19,
				tgl_akhir_efektif = @p20,
				last_update = @p21,
				id_updater = @p25,
				last_sync = @p22
		WHEN NOT MATCHED THEN
			INSERT (
				id_mk, id_jenj_didik, id_sms, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim,
				kode_mk, nm_mk, jns_mk, kel_mk, metode_pelaksanaan_kuliah,
				a_sap, a_silabus, a_bahan_ajar, acara_prak, a_diktat,
				tgl_mulai_efektif, tgl_akhir_efektif,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, CAST(@p3 AS UNIQUEIDENTIFIER), @p4, @p5, @p6, @p7, @p8,
				@p9, @p10, @p11, @p12, @p13,
				@p14, @p15, @p16, @p17, @p18,
				@p19, @p20,
				@p23, @p24, @p21, @p25, @p26, @p22
			);
	`

	for _, mk := range data {
		var idSms interface{}
		if mk.IDSMS != nil {
			idSms = *mk.IDSMS
		}

		_, err = tx.ExecContext(ctx, query,
			mk.IDMkPDDikti,                // @p1
			mk.IDJenjDidik,                // @p2
			idSms,                         // @p3
			mk.SksMk,                      // @p4
			mk.SksTm,                      // @p5
			mk.SksPrak,                    // @p6
			mk.SksPrakLap,                 // @p7
			mk.SksSim,                     // @p8
			mk.KodeMk,                     // @p9
			mk.NmMk,                       // @p10
			mk.JnsMk,                      // @p11
			mk.KelMk,                      // @p12
			mk.MetodePelaksanaanKuliah,   // @p13
			mk.ASap,                       // @p14
			mk.ASilabus,                   // @p15
			mk.ABahanAjar,                 // @p16
			mk.AcaraPrak,                  // @p17
			mk.ADiktat,                    // @p18
			mk.TglMulaiEfektif,            // @p19
			mk.TglAkhirEfektif,            // @p20
			mk.LastUpdate,                 // @p21 - for UPDATE
			mk.LastSync,                   // @p22 - for both
			mk.CreateDate,                 // @p23 - for INSERT
			mk.IDCreator,                  // @p24 - for INSERT
			mk.IDUpdater,                  // @p25 - for both
			mk.SoftDelete,                 // @p26 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert matkul %s: %w", mk.IDMkPDDikti, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetKurikulumList retrieves paginated list of kurikulum with filters
func (r *repository) GetKurikulumList(ctx context.Context, page, limit int, search string, idProdi *string, sortBy, sortOrder string) (*KurikulumListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"kur.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Prodi filter (MANDATORY for kurikulum - by id_sms)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("kur.id_sms = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Search filter (search by nama kurikulum)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("kur.nm_kurikulum_sp LIKE @p%d", paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Build ORDER BY clause
	orderByClause := "kur.id_smt DESC, kur.nm_kurikulum_sp ASC" // Default: newest semester first
	if sortBy != "" {
		var dbColumn string
		switch sortBy {
		case "nm_kurikulum_sp":
			dbColumn = "kur.nm_kurikulum_sp"
		case "id_semester":
			dbColumn = "kur.id_smt"
		case "last_sync":
			dbColumn = "kur.last_sync"
		default:
			dbColumn = ""
		}

		order := "ASC"
		if sortOrder == "desc" || sortOrder == "DESC" {
			order = "DESC"
		}

		if dbColumn != "" {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.kurikulum_sp AS kur
		WHERE %s
	`, whereClause)

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		WITH matkul_counts AS (
			SELECT
				mk.id_kurikulum_sp,
				COUNT(*) AS jumlah_matkul
			FROM pdrd.matkul_kurikulum mk
			WHERE mk.soft_delete = 0
			GROUP BY mk.id_kurikulum_sp
		)
		SELECT
			CAST(kur.id_kurikulum_sp AS VARCHAR(50)) AS id_kurikulum_sp,
			kur.nm_kurikulum_sp,
			kur.id_smt AS id_semester,
			sem.nm_smt AS nama_semester,
			CAST(kur.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang,
			kur.jmlh_smt_normal,
			kur.jmlh_sks_lulus,
			kur.jmlh_sks_wajib,
			kur.jmlh_sks_pilihan,
			COALESCE(mc.jumlah_matkul, 0) AS jumlah_matkul,
			kur.last_sync
		FROM pdrd.kurikulum_sp AS kur
		LEFT JOIN ref.semester AS sem ON sem.id_smt = kur.id_smt
		LEFT JOIN pdrd.sms AS sms ON sms.id_sms = kur.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = kur.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN matkul_counts mc ON mc.id_kurikulum_sp = kur.id_kurikulum_sp
		WHERE %s
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, orderByClause, paramIndex, paramIndex+1)

	// Add pagination parameters
	dataArgs := append(args, offset, limit)

	// Execute queries in parallel
	type countResult struct {
		total int
		err   error
	}
	type dataResult struct {
		data []*KurikulumListItem
		err  error
	}

	countChan := make(chan countResult, 1)
	dataChan := make(chan dataResult, 1)

	go func() {
		var total int
		err := r.db.GetContext(ctx, &total, countQuery, args...)
		countChan <- countResult{total: total, err: err}
	}()

	go func() {
		var kurikulumList []*KurikulumListItem
		err := r.db.SelectContext(ctx, &kurikulumList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: kurikulumList, err: err}
	}()

	countRes := <-countChan
	dataRes := <-dataChan

	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count kurikulum: %w", countRes.err)
	}
	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get kurikulum list: %w", dataRes.err)
	}

	// Convert timestamps to WIB
	for _, item := range dataRes.data {
		item.LastSync = convertToWIB(item.LastSync)
	}

	totalPages := (countRes.total + limit - 1) / limit

	return &KurikulumListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetKurikulumByID retrieves a single kurikulum by ID
func (r *repository) GetKurikulumByID(ctx context.Context, idKurikulumSP string) (*KurikulumSP, error) {
	query := `
		SELECT
			CAST(id_kurikulum_sp AS VARCHAR(50)) AS id_kurikulum_sp,
			id_smt,
			id_jenj_didik,
			CAST(id_sms AS VARCHAR(50)) AS id_sms,
			nm_kurikulum_sp, jmlh_smt_normal, jmlh_sks_lulus, jmlh_sks_wajib,
			jmlh_sks_pilihan, jmlh_sks_mk_wajib, jmlh_sks_mk_pilih,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.kurikulum_sp
		WHERE id_kurikulum_sp = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var kur KurikulumSP
	err := r.db.GetContext(ctx, &kur, query, idKurikulumSP)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("kurikulum not found")
		}
		return nil, fmt.Errorf("failed to get kurikulum: %w", err)
	}

	kur.CreateDate = convertToWIB(kur.CreateDate)
	kur.LastUpdate = convertToWIB(kur.LastUpdate)
	kur.LastSync = convertToWIB(kur.LastSync)

	return &kur, nil
}

// GetMatkulByKurikulum retrieves list of matkul for a kurikulum
func (r *repository) GetMatkulByKurikulum(ctx context.Context, idKurikulumSP string) ([]*MatkulKurikulum, error) {
	query := `
		SELECT
			CAST(id_kurikulum_sp AS VARCHAR(50)) AS id_kurikulum_sp,
			CAST(id_mk AS VARCHAR(50)) AS id_mk,
			smt, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, a_wajib,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.matkul_kurikulum
		WHERE id_kurikulum_sp = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
		ORDER BY smt ASC, a_wajib DESC
	`

	var matkulList []*MatkulKurikulum
	err := r.db.SelectContext(ctx, &matkulList, query, idKurikulumSP)
	if err != nil {
		return nil, fmt.Errorf("failed to get matkul list: %w", err)
	}

	for _, mk := range matkulList {
		mk.CreateDate = convertToWIB(mk.CreateDate)
		mk.LastUpdate = convertToWIB(mk.LastUpdate)
		mk.LastSync = convertToWIB(mk.LastSync)
	}

	return matkulList, nil
}

// GetMatkulByKurikulumWithDetails retrieves detailed matkul info with search support
func (r *repository) GetMatkulByKurikulumWithDetails(ctx context.Context, idKurikulumSP string, search string) ([]map[string]interface{}, error) {
	whereConditions := []string{
		"mk.id_kurikulum_sp = CAST(@p1 AS UNIQUEIDENTIFIER)",
		"mk.soft_delete = 0",
	}
	args := []interface{}{idKurikulumSP}
	paramIndex := 2

	// Add search filter
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(m.nm_mk LIKE @p%d OR m.kode_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := strings.Join(whereConditions, " AND ")

	query := fmt.Sprintf(`
		SELECT
			CAST(mk.id_mk AS VARCHAR(50)) AS id_mk,
			m.kode_mk,
			m.nm_mk,
			mk.smt,
			mk.sks_mk,
			mk.sks_tm,
			mk.sks_prak,
			mk.sks_prak_lap,
			mk.sks_sim,
			mk.a_wajib,
			m.jns_mk,
			m.kel_mk
		FROM pdrd.matkul_kurikulum mk
		LEFT JOIN pdrd.matkul m ON m.id_mk = mk.id_mk AND m.soft_delete = 0
		WHERE %s
		ORDER BY mk.smt ASC, mk.a_wajib DESC, m.nm_mk ASC
	`, whereClause)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get detailed matkul list: %w", err)
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var idMk, kodeMk, nmMk, jnsMk, kelMk sql.NullString
		var smt, aWajib sql.NullInt32
		var sksMk, sksTm, sksPrak, sksPrakLap, sksSim sql.NullFloat64

		err := rows.Scan(&idMk, &kodeMk, &nmMk, &smt, &sksMk, &sksTm, &sksPrak, &sksPrakLap, &sksSim, &aWajib, &jnsMk, &kelMk)
		if err != nil {
			continue
		}

		item := map[string]interface{}{
			"id_mk":        getValue(idMk),
			"kode_mk":      getValue(kodeMk),
			"nm_mk":        getValue(nmMk),
			"smt":          getValue(smt),
			"sks_mk":       getValue(sksMk),
			"sks_tm":       getValue(sksTm),
			"sks_prak":     getValue(sksPrak),
			"sks_prak_lap": getValue(sksPrakLap),
			"sks_sim":      getValue(sksSim),
			"a_wajib":      getValue(aWajib),
			"jns_mk":       getValue(jnsMk),
			"kel_mk":       getValue(kelMk),
		}
		result = append(result, item)
	}

	return result, nil
}

// getValue helper to handle sql.Null types
func getValue(v interface{}) interface{} {
	switch val := v.(type) {
	case sql.NullString:
		if val.Valid {
			return val.String
		}
		return nil
	case sql.NullInt32:
		if val.Valid {
			return val.Int32
		}
		return nil
	case sql.NullFloat64:
		if val.Valid {
			return val.Float64
		}
		return nil
	default:
		return nil
	}
}

// GetProdiList retrieves list of active prodi
func (r *repository) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT
			CAST(sms.id_sms AS VARCHAR(50)) AS id_sms,
			sms.nm_lemb AS nama_prodi,
			sms.kode_prodi,
			sms.id_jenj_didik,
			didik.nm_jenj_didik,
			CAST(sms.id_sp AS VARCHAR(50)) AS id_sp,
			sms.stat_prodi
		FROM pdrd.sms AS sms
		INNER JOIN ref.jenjang_pendidikan AS didik
			ON didik.id_jenj_didik = sms.id_jenj_didik
			AND didik.expired_date IS NULL
		WHERE sms.soft_delete = 0
			AND sms.stat_prodi = 'A'
			AND sms.id_jns_sms = 3
			AND sms.id_sp = CAST('e2b705a7-173e-464a-9fac-509128709515' AS UNIQUEIDENTIFIER)
		ORDER BY sms.nm_lemb ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var prodiList []map[string]interface{}
	for rows.Next() {
		var idSMS, namaProdi, kodeProdi, idSP, statProdi string
		var idJenjDidik int
		var namaJenjang string
		err := rows.Scan(&idSMS, &namaProdi, &kodeProdi, &idJenjDidik, &namaJenjang, &idSP, &statProdi)
		if err != nil {
			continue
		}

		prodi := map[string]interface{}{
			"id_sms":        idSMS,
			"nama_prodi":    namaProdi,
			"kode_prodi":    kodeProdi,
			"id_jenj_didik": idJenjDidik,
			"nm_jenj_didik": namaJenjang,
			"id_sp":         idSP,
			"stat_prodi":    statProdi,
		}
		prodiList = append(prodiList, prodi)
	}

	return prodiList, nil
}

// GetStats retrieves statistics for kurikulum
func (r *repository) GetStats(ctx context.Context) (*KurikulumStats, error) {
	query := `
		SELECT
			COUNT(DISTINCT kur.id_kurikulum_sp) AS total_kurikulum,
			COUNT(DISTINCT mk.id_mk) AS total_matkul,
			COUNT(DISTINCT kur.id_sms) AS total_prodi,
			MAX(kur.last_sync) AS last_sync
		FROM pdrd.kurikulum_sp AS kur
		LEFT JOIN pdrd.matkul_kurikulum AS mk ON mk.id_kurikulum_sp = kur.id_kurikulum_sp AND mk.soft_delete = 0
		WHERE kur.soft_delete = 0
	`

	var stats KurikulumStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	if stats.LastSync != nil {
		converted := convertToWIB(*stats.LastSync)
		stats.LastSync = &converted
	}

	return &stats, nil
}
