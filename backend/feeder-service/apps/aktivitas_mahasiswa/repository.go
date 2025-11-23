package aktivitas_mahasiswa

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for aktivitas_mahasiswa data access
type Repository interface {
	// Bulk operations
	BulkUpsertAktMhs(ctx context.Context, data []*AktMhs) error
	BulkUpsertAnggotaAktMhs(ctx context.Context, data []*AnggotaAktMhs) error

	// List operations with filters
	GetAktivitasList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, idJenisAktivitas *int, sortBy, sortOrder string) (*AktivitasListResult, error)
	GetAktivitasByID(ctx context.Context, idAktMhs string) (*AktMhs, error)
	GetAnggotaByAktivitas(ctx context.Context, idAktMhs string) ([]*AnggotaAktMhs, error)

	// Utility - Get prodi list and semester list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*AktivitasStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new aktivitas_mahasiswa repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
// Database stores as DATETIME2 without timezone info, so we need to explicitly set WIB
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertAktMhs performs bulk upsert for akt_mhs
func (r *repository) BulkUpsertAktMhs(ctx context.Context, data []*AktMhs) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// SQL Server MERGE query for upsert
	query := `
		MERGE pdrd.akt_mhs AS target
		USING (SELECT @p1 AS id_akt_mhs) AS source
		ON target.id_akt_mhs = source.id_akt_mhs
		WHEN MATCHED THEN
			UPDATE SET
				id_jns_akt_mhs = @p2,
				id_sms = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_smt = @p4,
				judul_akt_mhs = @p5,
				lokasi_kegiatan = @p6,
				sk_tugas = @p7,
				tgl_sk_tugas = @p8,
				ket_akt = @p9,
				a_komunal = @p10,
				last_update = @p11,
				id_updater = @p15,
				last_sync = @p12
		WHEN NOT MATCHED THEN
			INSERT (
				id_akt_mhs, id_jns_akt_mhs, id_sms, id_smt,
				judul_akt_mhs, lokasi_kegiatan, sk_tugas, tgl_sk_tugas, ket_akt, a_komunal,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, CAST(@p3 AS UNIQUEIDENTIFIER), @p4,
				@p5, @p6, @p7, @p8, @p9, @p10,
				@p13, @p14, @p11, @p15, @p16, @p12
			);
	`

	for _, akt := range data {
		var idSms interface{}
		if akt.IDSMS != nil {
			idSms = *akt.IDSMS
		}

		var idSmt interface{}
		if akt.IDSmt != nil {
			idSmt = *akt.IDSmt
		}

		_, err = tx.ExecContext(ctx, query,
			akt.IDAktMhs,       // @p1
			akt.IDJnsAktMhs,    // @p2
			idSms,              // @p3
			idSmt,              // @p4
			akt.JudulAktMhs,    // @p5
			akt.LokasiKegiatan, // @p6
			akt.SKTugas,        // @p7
			akt.TglSKTugas,     // @p8
			akt.KetAkt,         // @p9
			akt.AKomunal,       // @p10
			akt.LastUpdate,     // @p11 - for UPDATE
			akt.LastSync,       // @p12 - for both
			akt.CreateDate,     // @p13 - for INSERT
			akt.IDCreator,      // @p14 - for INSERT
			akt.IDUpdater,      // @p15 - for both
			akt.SoftDelete,     // @p16 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert akt_mhs %s: %w", akt.IDAktMhs, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertAnggotaAktMhs performs bulk upsert for anggota_akt_mhs
func (r *repository) BulkUpsertAnggotaAktMhs(ctx context.Context, data []*AnggotaAktMhs) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.anggota_akt_mhs AS target
		USING (SELECT @p1 AS id_ang_akt_mhs) AS source
		ON target.id_ang_akt_mhs = source.id_ang_akt_mhs
		WHEN MATCHED THEN
			UPDATE SET
				id_akt_mhs = @p2,
				id_reg_pd = CAST(@p3 AS UNIQUEIDENTIFIER),
				nm_pd = @p4,
				nipd = @p5,
				jns_peran_mhs = @p6,
				last_update = @p7,
				id_updater = @p11,
				last_sync = @p8
		WHEN NOT MATCHED THEN
			INSERT (
				id_ang_akt_mhs, id_akt_mhs, id_reg_pd, nm_pd, nipd, jns_peran_mhs,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, CAST(@p3 AS UNIQUEIDENTIFIER), @p4, @p5, @p6,
				@p9, @p10, @p7, @p11, @p12, @p8
			);
	`

	for _, anggota := range data {
		var idRegPd interface{}
		if anggota.IDRegPd != nil {
			idRegPd = *anggota.IDRegPd
		}

		_, err = tx.ExecContext(ctx, query,
			anggota.IDAngAktMhs, // @p1
			anggota.IDAktMhs,    // @p2
			idRegPd,             // @p3
			anggota.NmPd,        // @p4
			anggota.NIPD,        // @p5
			anggota.JnsPeranMhs, // @p6
			anggota.LastUpdate,  // @p7 - for UPDATE
			anggota.LastSync,    // @p8 - for both
			anggota.CreateDate,  // @p9 - for INSERT
			anggota.IDCreator,   // @p10 - for INSERT
			anggota.IDUpdater,   // @p11 - for both
			anggota.SoftDelete,  // @p12 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert anggota_akt_mhs %s: %w", anggota.IDAngAktMhs, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetAktivitasList retrieves paginated list of aktivitas with filters
func (r *repository) GetAktivitasList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, idJenisAktivitas *int, sortBy, sortOrder string) (*AktivitasListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"akt.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// ID Semester filter (MANDATORY - minimum 1 value)
	if len(idSemester) > 0 {
		placeholders := []string{}
		for _, sem := range idSemester {
			placeholders = append(placeholders, fmt.Sprintf("@p%d", paramIndex))
			args = append(args, sem)
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("akt.id_smt IN (%s)", strings.Join(placeholders, ", ")))
	}

	// Prodi filter (Optional)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("akt.id_sms = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Jenis Aktivitas filter (Optional)
	if idJenisAktivitas != nil && *idJenisAktivitas != 0 {
		whereConditions = append(whereConditions, fmt.Sprintf("akt.id_jns_akt_mhs = @p%d", paramIndex))
		args = append(args, *idJenisAktivitas)
		paramIndex++
	}

	// Search filter (search by judul aktivitas)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("akt.judul_akt_mhs LIKE @p%d", paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Build ORDER BY clause
	orderByClause := "akt.id_smt DESC, akt.judul_akt_mhs ASC" // Default: newest semester first, then by title
	if sortBy != "" {
		// Map frontend column keys to database columns
		var dbColumn string
		switch sortBy {
		case "judul_akt_mhs":
			dbColumn = "akt.judul_akt_mhs"
		case "id_semester":
			dbColumn = "akt.id_smt"
		case "jenis_aktivitas":
			dbColumn = "ja.nm_jns_akt_mhs"
		case "last_sync":
			dbColumn = "akt.last_sync"
		default:
			dbColumn = "" // Invalid sort field, use default
		}

		// Validate and set sort order
		order := "ASC"
		if sortOrder == "desc" || sortOrder == "DESC" {
			order = "DESC"
		}

		// Apply custom sorting if valid column
		if dbColumn != "" {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// ============================================================================
	// PARALLEL EXECUTION with Goroutines
	// Execute COUNT and SELECT queries concurrently for better performance
	// ============================================================================

	// Count total query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.akt_mhs AS akt
		WHERE %s
	`, whereClause)

	// Get paginated data with JOIN to get prodi name, jenis aktivitas name, and semester name
	dataQuery := fmt.Sprintf(`
		WITH anggota_counts AS (
			-- Pre-compute anggota counts using GROUP BY (much faster than correlated subquery)
			SELECT
				ang.id_akt_mhs,
				COUNT(*) AS jumlah_anggota
			FROM pdrd.anggota_akt_mhs ang
			WHERE ang.soft_delete = 0
			GROUP BY ang.id_akt_mhs
		)
		SELECT
			CAST(akt.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			akt.judul_akt_mhs,
			ja.nm_jns_akt_mhs AS nama_jenis_aktivitas,
			akt.id_smt AS id_semester,
			sem.nm_smt AS nama_semester,
			akt.lokasi_kegiatan,
			akt.sk_tugas,
			akt.tgl_sk_tugas,
			akt.a_komunal,
			COALESCE(ac.jumlah_anggota, 0) AS jumlah_anggota,
			akt.last_sync,
			CAST(akt.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang
		FROM pdrd.akt_mhs AS akt
		LEFT JOIN ref.jenis_akt_mhs AS ja ON ja.id_jns_akt_mhs = akt.id_jns_akt_mhs
		LEFT JOIN ref.semester AS sem ON sem.id_smt = akt.id_smt
		LEFT JOIN pdrd.sms AS sms ON sms.id_sms = akt.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN anggota_counts ac ON ac.id_akt_mhs = akt.id_akt_mhs
		WHERE %s
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, orderByClause, paramIndex, paramIndex+1)

	// Add pagination parameters to args
	dataArgs := append(args, offset, limit)

	// ============================================================================
	// Execute COUNT and SELECT in parallel using goroutines
	// ============================================================================
	type countResult struct {
		total int
		err   error
	}
	type dataResult struct {
		data []*AktivitasListItem
		err  error
	}

	countChan := make(chan countResult, 1)
	dataChan := make(chan dataResult, 1)

	// Goroutine 1: Execute COUNT query
	go func() {
		var total int
		err := r.db.GetContext(ctx, &total, countQuery, args...)
		countChan <- countResult{total: total, err: err}
	}()

	// Goroutine 2: Execute SELECT query
	go func() {
		var aktivitasList []*AktivitasListItem
		err := r.db.SelectContext(ctx, &aktivitasList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: aktivitasList, err: err}
	}()

	// Wait for both goroutines to complete
	countRes := <-countChan
	dataRes := <-dataChan

	// Check errors
	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count aktivitas: %w", countRes.err)
	}
	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get aktivitas list: %w", dataRes.err)
	}

	// Convert all timestamps to WIB timezone
	for _, item := range dataRes.data {
		item.LastSync = convertToWIB(item.LastSync)
		if item.TglSKTugas != nil {
			converted := convertToWIB(*item.TglSKTugas)
			item.TglSKTugas = &converted
		}
	}

	// Calculate total pages
	totalPages := (countRes.total + limit - 1) / limit

	return &AktivitasListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetAktivitasByID retrieves a single aktivitas by ID
func (r *repository) GetAktivitasByID(ctx context.Context, idAktMhs string) (*AktMhs, error) {
	query := `
		SELECT
			CAST(id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			id_jns_akt_mhs,
			CAST(id_sms AS VARCHAR(50)) AS id_sms,
			id_smt,
			judul_akt_mhs, lokasi_kegiatan, sk_tugas, tgl_sk_tugas, ket_akt, a_komunal,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.akt_mhs
		WHERE id_akt_mhs = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var akt AktMhs
	err := r.db.GetContext(ctx, &akt, query, idAktMhs)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("aktivitas not found")
		}
		return nil, fmt.Errorf("failed to get aktivitas: %w", err)
	}

	// Convert timestamps to WIB timezone
	akt.CreateDate = convertToWIB(akt.CreateDate)
	akt.LastUpdate = convertToWIB(akt.LastUpdate)
	akt.LastSync = convertToWIB(akt.LastSync)
	if akt.TglSKTugas != nil {
		converted := convertToWIB(*akt.TglSKTugas)
		akt.TglSKTugas = &converted
	}

	return &akt, nil
}

// GetAnggotaByAktivitas retrieves list of anggota for an aktivitas
func (r *repository) GetAnggotaByAktivitas(ctx context.Context, idAktMhs string) ([]*AnggotaAktMhs, error) {
	query := `
		SELECT
			CAST(id_ang_akt_mhs AS VARCHAR(50)) AS id_ang_akt_mhs,
			CAST(id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			CAST(id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			nm_pd, nipd, jns_peran_mhs,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.anggota_akt_mhs
		WHERE id_akt_mhs = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
		ORDER BY nm_pd ASC
	`

	var anggotaList []*AnggotaAktMhs
	err := r.db.SelectContext(ctx, &anggotaList, query, idAktMhs)
	if err != nil {
		return nil, fmt.Errorf("failed to get anggota list: %w", err)
	}

	// Convert timestamps to WIB timezone
	for _, anggota := range anggotaList {
		anggota.CreateDate = convertToWIB(anggota.CreateDate)
		anggota.LastUpdate = convertToWIB(anggota.LastUpdate)
		anggota.LastSync = convertToWIB(anggota.LastSync)
	}

	return anggotaList, nil
}

// GetProdiList retrieves list of active prodi from pdrd.sms for Unila only
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

// GetSemesterList retrieves list of semesters that have aktivitas mahasiswa data
func (r *repository) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT DISTINCT
			sem.id_smt,
			sem.nm_smt,
			sem.a_periode_aktif
		FROM ref.semester AS sem
		INNER JOIN pdrd.akt_mhs AS akt ON akt.id_smt = sem.id_smt AND akt.soft_delete = 0
		ORDER BY sem.id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester list: %w", err)
	}
	defer rows.Close()

	var semesterList []map[string]interface{}
	for rows.Next() {
		var idSmt, nmSmt string
		var aPeriodeAktif int
		err := rows.Scan(&idSmt, &nmSmt, &aPeriodeAktif)
		if err != nil {
			continue
		}

		semester := map[string]interface{}{
			"id_smt":         idSmt,
			"nm_smt":         nmSmt,
			"a_periode_aktif": aPeriodeAktif,
		}
		semesterList = append(semesterList, semester)
	}

	return semesterList, nil
}

// GetStats retrieves statistics for aktivitas mahasiswa
func (r *repository) GetStats(ctx context.Context) (*AktivitasStats, error) {
	query := `
		SELECT
			COUNT(DISTINCT akt.id_akt_mhs) AS total_aktivitas,
			COUNT(DISTINCT ang.id_ang_akt_mhs) AS total_anggota,
			COUNT(DISTINCT akt.id_sms) AS total_prodi,
			MAX(akt.last_sync) AS last_sync
		FROM pdrd.akt_mhs AS akt
		LEFT JOIN pdrd.anggota_akt_mhs AS ang ON ang.id_akt_mhs = akt.id_akt_mhs AND ang.soft_delete = 0
		WHERE akt.soft_delete = 0
	`

	var stats AktivitasStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	// Convert last_sync timestamp to WIB timezone
	if stats.LastSync != nil {
		converted := convertToWIB(*stats.LastSync)
		stats.LastSync = &converted
	}

	return &stats, nil
}
