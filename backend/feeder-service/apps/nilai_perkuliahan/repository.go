package nilai_perkuliahan

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for nilai_perkuliahan data access
type Repository interface {
	// Bulk operations
	BulkUpsertNilaiSmtMhs(ctx context.Context, data []*NilaiSmtMhs) error

	// List operations with filters
	GetNilaiPerkuliahanList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, idKelas *string, sortBy, sortOrder string) (*NilaiPerkuliahanListResult, error)
	GetNilaiByKelas(ctx context.Context, idKls string) ([]*NilaiPerkuliahanListItem, error)

	// Utility - Get prodi list and semester list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)
	GetKelasListBySemesterAndProdi(ctx context.Context, idSemester []string, idProdi *string) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*NilaiPerkuliahanStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new nilai_perkuliahan repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertNilaiSmtMhs performs bulk upsert for nilai_smt_mhs
func (r *repository) BulkUpsertNilaiSmtMhs(ctx context.Context, data []*NilaiSmtMhs) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// SQL Server MERGE query for upsert
	// Composite PK: id_reg_pd + id_kls
	query := `
		MERGE pdrd.nilai_smt_mhs AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_reg_pd, CAST(@p2 AS UNIQUEIDENTIFIER) AS id_kls) AS source
		ON target.id_reg_pd = source.id_reg_pd AND target.id_kls = source.id_kls
		WHEN MATCHED THEN
			UPDATE SET
				nilai_angka = @p3,
				nilai_huruf = @p4,
				nilai_indeks = @p5,
				last_update = @p6,
				id_updater = @p7,
				last_sync = @p8
		WHEN NOT MATCHED THEN
			INSERT (
				id_reg_pd, id_kls, nilai_angka, nilai_huruf, nilai_indeks,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), CAST(@p2 AS UNIQUEIDENTIFIER), @p3, @p4, @p5,
				@p9, @p10, @p6, @p7, @p11, @p8
			);
	`

	for _, nilai := range data {
		_, err = tx.ExecContext(ctx, query,
			nilai.IDRegPd,     // @p1
			nilai.IDKls,       // @p2
			nilai.NilaiAngka,  // @p3
			nilai.NilaiHuruf,  // @p4
			nilai.NilaiIndeks, // @p5
			nilai.LastUpdate,  // @p6
			nilai.IDUpdater,   // @p7
			nilai.LastSync,    // @p8
			nilai.CreateDate,  // @p9
			nilai.IDCreator,   // @p10
			nilai.SoftDelete,  // @p11
		)
		if err != nil {
			return fmt.Errorf("failed to upsert nilai_smt_mhs for reg_pd=%s, kls=%s: %w", nilai.IDRegPd, nilai.IDKls, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetNilaiPerkuliahanList retrieves paginated list of nilai perkuliahan with search and filters
func (r *repository) GetNilaiPerkuliahanList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi, idKelas *string, sortBy, sortOrder string) (*NilaiPerkuliahanListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"nsm.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Filter by semester(s)
	if len(idSemester) > 0 {
		placeholders := make([]string, len(idSemester))
		for i, sem := range idSemester {
			placeholders[i] = fmt.Sprintf("@p%d", paramIndex)
			args = append(args, sem)
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("kk.id_smt IN (%s)", strings.Join(placeholders, ",")))
	}

	// Filter by prodi
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("CAST(kk.id_sms AS VARCHAR(50)) = @p%d", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Filter by kelas
	if idKelas != nil && *idKelas != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("CAST(nsm.id_kls AS VARCHAR(50)) = @p%d", paramIndex))
		args = append(args, *idKelas)
		paramIndex++
	}

	// Search filter
	if search != "" {
		searchPattern := "%" + search + "%"
		whereConditions = append(whereConditions,
			fmt.Sprintf("(rpd.nipd LIKE @p%d OR p.nm_pd LIKE @p%d OR m.nm_mk LIKE @p%d OR kk.nm_kls LIKE @p%d)",
				paramIndex, paramIndex, paramIndex, paramIndex))
		args = append(args, searchPattern)
		paramIndex++
	}

	// Build ORDER BY clause
	orderByClause := "nsm.last_sync DESC"
	if sortBy != "" {
		order := "DESC"
		if sortOrder == "asc" {
			order = "ASC"
		}
		// Map frontend column keys to database columns
		columnMap := map[string]string{
			"nim":            "rpd.nipd",
			"nama_mahasiswa": "p.nm_pd",
			"nama_matkul":    "m.nm_mk",
			"nilai_huruf":    "nsm.nilai_huruf",
			"nilai_angka":    "nsm.nilai_angka",
			"nilai_indeks":   "nsm.nilai_indeks",
			"last_sync":      "nsm.last_sync",
			"id_semester":    "kk.id_smt",
		}
		if dbColumn, ok := columnMap[sortBy]; ok {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.nilai_smt_mhs AS nsm WITH(NOLOCK)
		LEFT JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = nsm.id_kls AND kk.soft_delete = 0
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = nsm.id_reg_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.peserta_didik p WITH(NOLOCK) ON p.id_pd = rpd.id_pd AND p.soft_delete = 0
		WHERE %s
	`, whereClause)

	// Get paginated data with JOINs
	dataQuery := fmt.Sprintf(`
		SELECT
			CAST(nsm.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			CAST(nsm.id_kls AS VARCHAR(50)) AS id_kls,
			rpd.nipd AS nim,
			p.nm_pd AS nama_mahasiswa,
			kk.nm_kls,
			m.kode_mk AS kode_matkul,
			m.nm_mk AS nama_matkul,
			kk.sks_mk,
			kk.id_smt AS id_semester,
			sem.nm_smt AS nama_semester,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang,
			nsm.nilai_angka,
			nsm.nilai_huruf,
			nsm.nilai_indeks,
			nsm.last_sync
		FROM pdrd.nilai_smt_mhs AS nsm WITH(NOLOCK)
		LEFT JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = nsm.id_kls AND kk.soft_delete = 0
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		LEFT JOIN ref.semester AS sem WITH(NOLOCK) ON sem.id_smt = kk.id_smt
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik WITH(NOLOCK) ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = nsm.id_reg_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.peserta_didik p WITH(NOLOCK) ON p.id_pd = rpd.id_pd AND p.soft_delete = 0
		WHERE %s
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, orderByClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)

	// Execute COUNT and SELECT in parallel
	type countResult struct {
		total int
		err   error
	}
	type dataResult struct {
		data []*NilaiPerkuliahanListItem
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
		var nilaiList []*NilaiPerkuliahanListItem
		err := r.db.SelectContext(ctx, &nilaiList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: nilaiList, err: err}
	}()

	countRes := <-countChan
	dataRes := <-dataChan

	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count nilai perkuliahan: %w", countRes.err)
	}

	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get nilai perkuliahan list: %w", dataRes.err)
	}

	// Convert last_sync to WIB
	for _, nilai := range dataRes.data {
		nilai.LastSync = convertToWIB(nilai.LastSync)
	}

	totalPages := (countRes.total + limit - 1) / limit

	return &NilaiPerkuliahanListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetNilaiByKelas retrieves all nilai for a specific kelas
func (r *repository) GetNilaiByKelas(ctx context.Context, idKls string) ([]*NilaiPerkuliahanListItem, error) {
	query := `
		SELECT
			CAST(nsm.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			CAST(nsm.id_kls AS VARCHAR(50)) AS id_kls,
			rpd.nipd AS nim,
			p.nm_pd AS nama_mahasiswa,
			kk.nm_kls,
			m.kode_mk AS kode_matkul,
			m.nm_mk AS nama_matkul,
			kk.sks_mk,
			kk.id_smt AS id_semester,
			sem.nm_smt AS nama_semester,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang,
			nsm.nilai_angka,
			nsm.nilai_huruf,
			nsm.nilai_indeks,
			nsm.last_sync
		FROM pdrd.nilai_smt_mhs AS nsm WITH(NOLOCK)
		LEFT JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = nsm.id_kls AND kk.soft_delete = 0
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		LEFT JOIN ref.semester AS sem WITH(NOLOCK) ON sem.id_smt = kk.id_smt
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik WITH(NOLOCK) ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = nsm.id_reg_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.peserta_didik p WITH(NOLOCK) ON p.id_pd = rpd.id_pd AND p.soft_delete = 0
		WHERE nsm.soft_delete = 0 AND CAST(nsm.id_kls AS VARCHAR(50)) = @p1
		ORDER BY rpd.nipd ASC
	`

	var nilaiList []*NilaiPerkuliahanListItem
	err := r.db.SelectContext(ctx, &nilaiList, query, idKls)
	if err != nil {
		if err == sql.ErrNoRows {
			return []*NilaiPerkuliahanListItem{}, nil
		}
		return nil, fmt.Errorf("failed to get nilai by kelas: %w", err)
	}

	// Convert last_sync to WIB
	for _, nilai := range nilaiList {
		nilai.LastSync = convertToWIB(nilai.LastSync)
	}

	return nilaiList, nil
}

// GetProdiList retrieves list of active prodi from pdrd.sms for Unila only
func (r *repository) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT
			CAST(sms.id_sms AS VARCHAR(50)) AS id_sms,
			sms.nm_lemb AS nama_prodi,
			sms.kode_prodi,
			didik.nm_jenj_didik
		FROM pdrd.sms AS sms WITH(NOLOCK)
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
		var idSMS, namaProdi, kodeProdi, nmJenjDidik string
		err := rows.Scan(&idSMS, &namaProdi, &kodeProdi, &nmJenjDidik)
		if err != nil {
			continue
		}
		prodiList = append(prodiList, map[string]interface{}{
			"id_sms":       idSMS,
			"nama_prodi":   namaProdi,
			"kode_prodi":   kodeProdi,
			"nm_jenj_didik": nmJenjDidik,
		})
	}

	return prodiList, nil
}

// GetSemesterList retrieves list of semesters that have kelas kuliah data
// Note: Uses kelas_kuliah for performance - if kelas exists, nilai can be synced for it
func (r *repository) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT DISTINCT
			sem.id_smt,
			sem.nm_smt,
			sem.a_periode_aktif
		FROM ref.semester AS sem WITH(NOLOCK)
		INNER JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_smt = sem.id_smt AND kk.soft_delete = 0
		WHERE sem.expired_date IS NULL
		ORDER BY sem.id_smt DESC
	`

	rows, err := r.db.QueryxContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester list: %w", err)
	}
	defer rows.Close()

	var semesterList []map[string]interface{}
	for rows.Next() {
		row := make(map[string]interface{})
		if err := rows.MapScan(row); err != nil {
			return nil, fmt.Errorf("failed to scan semester row: %w", err)
		}
		// Convert []byte to string for each field
		for key, val := range row {
			if b, ok := val.([]byte); ok {
				row[key] = string(b)
			}
		}
		semesterList = append(semesterList, row)
	}

	return semesterList, nil
}

// GetKelasListBySemesterAndProdi retrieves list of kelas for sync dropdown
func (r *repository) GetKelasListBySemesterAndProdi(ctx context.Context, idSemester []string, idProdi *string) ([]map[string]interface{}, error) {
	whereConditions := []string{"kk.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Filter by semester(s)
	if len(idSemester) > 0 {
		placeholders := make([]string, len(idSemester))
		for i, sem := range idSemester {
			placeholders[i] = fmt.Sprintf("@p%d", paramIndex)
			args = append(args, sem)
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("kk.id_smt IN (%s)", strings.Join(placeholders, ",")))
	}

	// Filter by prodi
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("CAST(kk.id_sms AS VARCHAR(50)) = @p%d", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	whereClause := strings.Join(whereConditions, " AND ")

	query := fmt.Sprintf(`
		SELECT
			CAST(kk.id_kls AS VARCHAR(50)) AS id_kls,
			kk.nm_kls,
			kk.id_smt AS id_semester,
			m.kode_mk AS kode_matkul,
			m.nm_mk AS nama_matkul
		FROM pdrd.kelas_kuliah AS kk WITH(NOLOCK)
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		WHERE %s
		ORDER BY kk.id_smt DESC, m.nm_mk ASC
	`, whereClause)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kelas list: %w", err)
	}
	defer rows.Close()

	var kelasList []map[string]interface{}
	for rows.Next() {
		row := make(map[string]interface{})
		if err := rows.MapScan(row); err != nil {
			return nil, fmt.Errorf("failed to scan kelas row: %w", err)
		}
		// Convert []byte to string for each field
		for key, val := range row {
			if b, ok := val.([]byte); ok {
				row[key] = string(b)
			}
		}
		kelasList = append(kelasList, row)
	}

	return kelasList, nil
}

// GetStats retrieves nilai perkuliahan statistics
func (r *repository) GetStats(ctx context.Context) (*NilaiPerkuliahanStats, error) {
	stats := &NilaiPerkuliahanStats{}

	// Get total nilai
	err := r.db.GetContext(ctx, &stats.TotalNilai, `
		SELECT COUNT(*)
		FROM pdrd.nilai_smt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total nilai: %w", err)
	}

	// Get total unique mahasiswa
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(DISTINCT id_reg_pd)
		FROM pdrd.nilai_smt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Get total unique kelas
	err = r.db.GetContext(ctx, &stats.TotalKelas, `
		SELECT COUNT(DISTINCT id_kls)
		FROM pdrd.nilai_smt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total kelas: %w", err)
	}

	// Get total unique prodi
	err = r.db.GetContext(ctx, &stats.TotalProdi, `
		SELECT COUNT(DISTINCT kk.id_sms)
		FROM pdrd.nilai_smt_mhs nsm WITH(NOLOCK)
		INNER JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = nsm.id_kls AND kk.soft_delete = 0
		WHERE nsm.soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total prodi: %w", err)
	}

	// Get last sync timestamp
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT TOP 1 last_sync
		FROM pdrd.nilai_smt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
		ORDER BY last_sync DESC
	`)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to get last sync: %w", err)
	}

	if lastSync != nil {
		converted := convertToWIB(*lastSync)
		stats.LastSync = &converted
	}

	return stats, nil
}
