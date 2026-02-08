package spp_mhs

import (
	"context"
	"fmt"
	"log"
	"strconv"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetSppMhsList(ctx context.Context, page, limit int, idSmt *string) (*SppMhsListResult, error)
	GetSppMhsByID(ctx context.Context, id uuid.UUID) (*SppMhsDetail, error)
	GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error)
	GetStats(ctx context.Context) (*SppMhsStats, error)
	GetAvailableSemesters(ctx context.Context) ([]SemesterOption, error)
	GetAllSemestersFromRef(ctx context.Context) ([]SemesterOption, error)
	UpsertSppMhs(ctx context.Context, data *SppMhs) error
	BulkUpsertSppMhs(ctx context.Context, dataList []*SppMhs) (int, int, error)
	GetRegPdByNPM(ctx context.Context, npm string) (*RegPdMapping, error)
	GetAllRegPdMappings(ctx context.Context) (map[string]*RegPdMapping, error)
	GetActiveRegPdMappings(ctx context.Context, targetSmt string) (map[string]*RegPdMapping, error)
	GetSyncedNpmsBySemester(ctx context.Context, idSmt string) (map[string]bool, error)
	AutoUpdateDaftarUktIdSms(ctx context.Context) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSppMhsList(ctx context.Context, page, limit int, idSmt *string) (*SppMhsListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereClause := "WHERE s.soft_delete = 0"
	args := []interface{}{}
	argIdx := 1

	// Filter by specific semester id
	if idSmt != nil && *idSmt != "" {
		whereClause += fmt.Sprintf(" AND s.id_smt = @p%d", argIdx)
		args = append(args, *idSmt)
		argIdx++
	}

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		%s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count spp_mhs: %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT s.id_spp_mhs, s.id_kelas_ukt, s.id_smt, s.id_reg_pd,
			   s.tgl_bayar, s.nominal, s.kode_pembayaran, s.nomor_pin,
			   s.kode_akses, s.bill_ref, s.flag_by, s.ket,
			   s.create_date, s.id_creator, s.last_update, s.id_updater,
			   s.soft_delete, s.last_sync,
			   rp.nipd as npm,
			   pd.nm_pd as nama_mahasiswa,
			   ISNULL(didik.nm_jenj_didik + ' - ', '') + ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
		LEFT JOIN ref.jenjang_pendidikan didik ON sms.id_jenj_didik = didik.id_jenj_didik
		LEFT JOIN keuangan.kelas_ukt k ON s.id_kelas_ukt = k.id_kelas_ukt
		%s
		ORDER BY s.tgl_bayar DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, argIdx, argIdx+1)

	args = append(args, offset, limit)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get spp_mhs list: %w", err)
	}
	defer rows.Close()

	var data []SppMhsDetail
	for rows.Next() {
		var d SppMhsDetail
		err := rows.Scan(
			&d.IDSppMhs, &d.IDKelasUKT, &d.IDSmt, &d.IDRegPd,
			&d.TglBayar, &d.Nominal, &d.KodePembayaran, &d.NomorPin,
			&d.KodeAkses, &d.BillRef, &d.FlagBy, &d.Ket,
			&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater,
			&d.SoftDelete, &d.LastSync,
			&d.NPM, &d.NamaMahasiswa, &d.NamaProdi,
			&d.NamaKelasUKT, &d.NominalUKT,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan spp_mhs: %w", err)
		}
		data = append(data, d)
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	return &SppMhsListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetSppMhsByID(ctx context.Context, id uuid.UUID) (*SppMhsDetail, error) {
	query := `
		SELECT s.id_spp_mhs, s.id_kelas_ukt, s.id_smt, s.id_reg_pd,
			   s.tgl_bayar, s.nominal, s.kode_pembayaran, s.nomor_pin,
			   s.kode_akses, s.bill_ref, s.flag_by, s.ket,
			   s.create_date, s.id_creator, s.last_update, s.id_updater,
			   s.soft_delete, s.last_sync,
			   rp.nipd as npm,
			   pd.nm_pd as nama_mahasiswa,
			   ISNULL(didik.nm_jenj_didik + ' - ', '') + ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
		LEFT JOIN ref.jenjang_pendidikan didik ON sms.id_jenj_didik = didik.id_jenj_didik
		LEFT JOIN keuangan.kelas_ukt k ON s.id_kelas_ukt = k.id_kelas_ukt
		WHERE s.id_spp_mhs = @p1 AND s.soft_delete = 0
	`

	var d SppMhsDetail
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&d.IDSppMhs, &d.IDKelasUKT, &d.IDSmt, &d.IDRegPd,
		&d.TglBayar, &d.Nominal, &d.KodePembayaran, &d.NomorPin,
		&d.KodeAkses, &d.BillRef, &d.FlagBy, &d.Ket,
		&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater,
		&d.SoftDelete, &d.LastSync,
		&d.NPM, &d.NamaMahasiswa, &d.NamaProdi,
		&d.NamaKelasUKT, &d.NominalUKT,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get spp_mhs by id: %w", err)
	}

	return &d, nil
}

func (r *repository) GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error) {
	query := `
		SELECT s.id_spp_mhs, s.id_kelas_ukt, s.id_smt, s.id_reg_pd,
			   s.tgl_bayar, s.nominal, s.kode_pembayaran, s.nomor_pin,
			   s.kode_akses, s.bill_ref, s.flag_by, s.ket,
			   s.create_date, s.id_creator, s.last_update, s.id_updater,
			   s.soft_delete, s.last_sync,
			   rp.nipd as npm,
			   pd.nm_pd as nama_mahasiswa,
			   ISNULL(didik.nm_jenj_didik + ' - ', '') + ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
		LEFT JOIN ref.jenjang_pendidikan didik ON sms.id_jenj_didik = didik.id_jenj_didik
		LEFT JOIN keuangan.kelas_ukt k ON s.id_kelas_ukt = k.id_kelas_ukt
		WHERE rp.nipd = @p1 AND s.soft_delete = 0
		ORDER BY s.id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query, npm)
	if err != nil {
		return nil, fmt.Errorf("failed to get spp_mhs by npm: %w", err)
	}
	defer rows.Close()

	var data []SppMhsDetail
	for rows.Next() {
		var d SppMhsDetail
		err := rows.Scan(
			&d.IDSppMhs, &d.IDKelasUKT, &d.IDSmt, &d.IDRegPd,
			&d.TglBayar, &d.Nominal, &d.KodePembayaran, &d.NomorPin,
			&d.KodeAkses, &d.BillRef, &d.FlagBy, &d.Ket,
			&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater,
			&d.SoftDelete, &d.LastSync,
			&d.NPM, &d.NamaMahasiswa, &d.NamaProdi,
			&d.NamaKelasUKT, &d.NominalUKT,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan spp_mhs: %w", err)
		}
		data = append(data, d)
	}

	return data, nil
}

func (r *repository) GetStats(ctx context.Context) (*SppMhsStats, error) {
	query := `
		SELECT
			COUNT(*) as total_spp_mhs,
			COUNT(DISTINCT s.id_reg_pd) as total_mahasiswa,
			ISNULL(SUM(s.nominal), 0) as total_bayar,
			(SELECT CONVERT(VARCHAR(30), MAX(last_sync), 126) FROM keuangan.spp_mhs WHERE soft_delete = 0) as last_sync
		FROM keuangan.spp_mhs s
		WHERE s.soft_delete = 0
	`

	var stats SppMhsStats
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalSppMhs,
		&stats.TotalMahasiswa,
		&stats.TotalBayar,
		&stats.LastSync,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get spp_mhs stats: %w", err)
	}

	return &stats, nil
}

func (r *repository) GetAvailableSemesters(ctx context.Context) ([]SemesterOption, error) {
	// Get distinct semesters that have SPP data, joined with ref.semester for nm_smt
	query := `
		SELECT DISTINCT s.id_smt, ISNULL(sem.nm_smt, s.id_smt) as nm_smt
		FROM keuangan.spp_mhs s
		LEFT JOIN ref.semester sem ON s.id_smt = sem.id_smt
		WHERE s.soft_delete = 0
		ORDER BY s.id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get available semesters: %w", err)
	}
	defer rows.Close()

	var semesters []SemesterOption
	for rows.Next() {
		var s SemesterOption
		if err := rows.Scan(&s.IDSmt, &s.NmSmt); err != nil {
			return nil, fmt.Errorf("failed to scan semester: %w", err)
		}
		semesters = append(semesters, s)
	}

	return semesters, nil
}

func (r *repository) GetAllSemestersFromRef(ctx context.Context) ([]SemesterOption, error) {
	// Show: active semester +1, and 10 years back only
	query := `
		WITH active_smt AS (
			SELECT TOP 1 id_smt,
				LEFT(id_smt, 4) as smt_year,
				RIGHT(id_smt, 1) as smt_sem
			FROM ref.semester
			WHERE a_periode_aktif = 1
			AND LEN(id_smt) = 5
		),
		bounds AS (
			SELECT
				CASE
					WHEN a.smt_sem = '2' THEN CAST(CAST(a.smt_year AS INT) + 1 AS VARCHAR) + '1'
					ELSE a.smt_year + '2'
				END as max_id_smt,
				CAST(CAST(a.smt_year AS INT) - 10 AS VARCHAR) as min_year
			FROM active_smt a
		)
		SELECT s.id_smt, s.nm_smt
		FROM ref.semester s
		CROSS JOIN bounds b
		WHERE LEN(s.id_smt) = 5
		  AND RIGHT(s.id_smt, 1) IN ('1', '2')
		  AND s.id_smt <= b.max_id_smt
		  AND LEFT(s.id_smt, 4) >= b.min_year
		ORDER BY s.id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		// Fallback: if a_periode_aktif field doesn't exist, use simple year-based filter
		log.Printf("⚠️ Active semester query failed, using fallback: %v", err)
		return r.getSemestersFallback(ctx)
	}
	defer rows.Close()

	var semesters []SemesterOption
	for rows.Next() {
		var s SemesterOption
		if err := rows.Scan(&s.IDSmt, &s.NmSmt); err != nil {
			return nil, fmt.Errorf("failed to scan semester: %w", err)
		}
		semesters = append(semesters, s)
	}

	if len(semesters) == 0 {
		return r.getSemestersFallback(ctx)
	}

	return semesters, nil
}

func (r *repository) getSemestersFallback(ctx context.Context) ([]SemesterOption, error) {
	query := `
		SELECT id_smt, nm_smt
		FROM ref.semester
		WHERE LEN(id_smt) = 5
		  AND RIGHT(id_smt, 1) IN ('1', '2')
		  AND CAST(LEFT(id_smt, 4) AS INT) >= YEAR(GETDATE()) - 10
		  AND CAST(LEFT(id_smt, 4) AS INT) <= YEAR(GETDATE()) + 1
		ORDER BY id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get semesters fallback: %w", err)
	}
	defer rows.Close()

	var semesters []SemesterOption
	for rows.Next() {
		var s SemesterOption
		if err := rows.Scan(&s.IDSmt, &s.NmSmt); err != nil {
			return nil, fmt.Errorf("failed to scan semester: %w", err)
		}
		semesters = append(semesters, s)
	}

	return semesters, nil
}

func (r *repository) UpsertSppMhs(ctx context.Context, data *SppMhs) error {
	query := `
		MERGE INTO keuangan.spp_mhs AS target
		USING (SELECT @p1 AS id_spp_mhs) AS source
		ON target.id_spp_mhs = source.id_spp_mhs
		WHEN MATCHED THEN
			UPDATE SET
				id_kelas_ukt = @p2,
				id_smt = @p3,
				id_reg_pd = @p4,
				tgl_bayar = @p5,
				nominal = @p6,
				kode_pembayaran = @p7,
				nomor_pin = @p8,
				kode_akses = @p9,
				bill_ref = @p10,
				flag_by = @p11,
				ket = @p12,
				last_update = @p13,
				id_updater = @p14,
				last_sync = @p15
		WHEN NOT MATCHED THEN
			INSERT (id_spp_mhs, id_kelas_ukt, id_smt, id_reg_pd, tgl_bayar,
					nominal, kode_pembayaran, nomor_pin, kode_akses, bill_ref,
					flag_by, ket, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
					@p11, @p12, @p13, @p14, @p13, 0, @p15);
	`

	_, err := r.db.ExecContext(ctx, query,
		data.IDSppMhs, data.IDKelasUKT, data.IDSmt, data.IDRegPd, data.TglBayar,
		data.Nominal, data.KodePembayaran, data.NomorPin, data.KodeAkses, data.BillRef,
		data.FlagBy, data.Ket, data.LastUpdate, data.IDCreator, data.LastSync,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert spp_mhs: %w", err)
	}

	return nil
}

func (r *repository) BulkUpsertSppMhs(ctx context.Context, dataList []*SppMhs) (int, int, error) {
	inserted := 0
	updated := 0
	errCount := 0
	batchSize := 100
	totalBatches := (len(dataList) + batchSize - 1) / batchSize

	mergeQuery := `
		MERGE INTO keuangan.spp_mhs AS target
		USING (SELECT @p1 AS id_spp_mhs) AS source
		ON target.id_spp_mhs = source.id_spp_mhs
		WHEN MATCHED THEN
			UPDATE SET
				id_kelas_ukt = @p2,
				id_smt = @p3,
				id_reg_pd = @p4,
				tgl_bayar = @p5,
				nominal = @p6,
				kode_pembayaran = @p7,
				nomor_pin = @p8,
				kode_akses = @p9,
				bill_ref = @p10,
				flag_by = @p11,
				ket = @p12,
				last_update = @p13,
				id_updater = @p14,
				last_sync = @p15
		WHEN NOT MATCHED THEN
			INSERT (id_spp_mhs, id_kelas_ukt, id_smt, id_reg_pd, tgl_bayar,
					nominal, kode_pembayaran, nomor_pin, kode_akses, bill_ref,
					flag_by, ket, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
					@p11, @p12, @p13, @p14, @p13, 0, @p15);
	`

	for i := 0; i < len(dataList); i += batchSize {
		end := i + batchSize
		if end > len(dataList) {
			end = len(dataList)
		}
		batch := dataList[i:end]
		batchNum := (i / batchSize) + 1

		tx, err := r.db.BeginTx(ctx, nil)
		if err != nil {
			return inserted, updated, fmt.Errorf("failed to begin transaction batch %d: %w", batchNum, err)
		}

		batchInserted := 0
		batchUpdated := 0

		for _, data := range batch {
			// Check exists for counting insert vs update
			var exists int
			if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM keuangan.spp_mhs WHERE id_spp_mhs = @p1`, data.IDSppMhs).Scan(&exists); err != nil {
				errCount++
				if errCount <= 5 {
					log.Printf("⚠️  [BulkUpsert] Exists check error: %v", err)
				}
				continue
			}

			_, err := tx.ExecContext(ctx, mergeQuery,
				data.IDSppMhs, data.IDKelasUKT, data.IDSmt, data.IDRegPd, data.TglBayar,
				data.Nominal, data.KodePembayaran, data.NomorPin, data.KodeAkses, data.BillRef,
				data.FlagBy, data.Ket, data.LastUpdate, data.IDCreator, data.LastSync,
			)
			if err != nil {
				errCount++
				if errCount <= 5 {
					log.Printf("⚠️  [BulkUpsert] Upsert error (id_spp_mhs=%s): %v", data.IDSppMhs, err)
				}
				continue
			}

			if exists > 0 {
				batchUpdated++
			} else {
				batchInserted++
			}
		}

		if err := tx.Commit(); err != nil {
			tx.Rollback()
			return inserted, updated, fmt.Errorf("failed to commit batch %d: %w", batchNum, err)
		}

		inserted += batchInserted
		updated += batchUpdated

		log.Printf("💾 [BulkUpsert] Batch %d/%d committed (+%d inserted, +%d updated, total: %d/%d)",
			batchNum, totalBatches, batchInserted, batchUpdated, inserted+updated, len(dataList))
	}

	log.Printf("💾 [BulkUpsert] Done: inserted=%d, updated=%d, errors=%d (total=%d)",
		inserted, updated, errCount, len(dataList))
	return inserted, updated, nil
}

func (r *repository) GetRegPdByNPM(ctx context.Context, npm string) (*RegPdMapping, error) {
	query := `
		SELECT rp.nipd, rp.id_reg_pd, rp.id_pd
		FROM pdrd.reg_pd rp
		WHERE rp.nipd = @p1
	`

	var m RegPdMapping
	err := r.db.QueryRowContext(ctx, query, npm).Scan(&m.NPM, &m.IDRegPd, &m.IDPD)
	if err != nil {
		return nil, err
	}

	return &m, nil
}

func (r *repository) GetAllRegPdMappings(ctx context.Context) (map[string]*RegPdMapping, error) {
	query := `
		SELECT rp.nipd, rp.id_reg_pd, rp.id_pd
		FROM pdrd.reg_pd rp
		WHERE rp.nipd IS NOT NULL AND rp.nipd != ''
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get reg_pd mappings: %w", err)
	}
	defer rows.Close()

	mappings := make(map[string]*RegPdMapping)
	for rows.Next() {
		var m RegPdMapping
		err := rows.Scan(&m.NPM, &m.IDRegPd, &m.IDPD)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reg_pd mapping: %w", err)
		}
		mappings[m.NPM] = &m
	}

	return mappings, nil
}

// GetActiveRegPdMappings returns npm->id_reg_pd mappings filtered to recent students only
// Uses mulai_smt (id_semester_masuk) on pdrd.reg_pd, LEFT 4 digits = tahun masuk, 10 years back
func (r *repository) GetActiveRegPdMappings(ctx context.Context, targetSmt string) (map[string]*RegPdMapping, error) {
	targetYear, err := strconv.Atoi(targetSmt[:4])
	if err != nil {
		log.Printf("⚠️ Cannot parse target semester year, falling back to all mappings")
		return r.GetAllRegPdMappings(ctx)
	}
	minYear := targetYear - 10

	query := `
		SELECT rp.nipd, rp.id_reg_pd, rp.id_pd
		FROM pdrd.reg_pd rp
		WHERE rp.nipd IS NOT NULL AND rp.nipd != ''
		  AND rp.id_semester_masuk IS NOT NULL
		  AND CAST(LEFT(rp.id_semester_masuk, 4) AS INT) >= @p1
		  AND rp.id_jns_keluar IS NULL
	`

	rows, err := r.db.QueryContext(ctx, query, minYear)
	if err != nil {
		// Fallback: field might not exist
		log.Printf("⚠️ Active reg_pd query failed, falling back to all: %v", err)
		return r.GetAllRegPdMappings(ctx)
	}
	defer rows.Close()

	mappings := make(map[string]*RegPdMapping)
	for rows.Next() {
		var m RegPdMapping
		err := rows.Scan(&m.NPM, &m.IDRegPd, &m.IDPD)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reg_pd mapping: %w", err)
		}
		mappings[m.NPM] = &m
	}

	if len(mappings) == 0 {
		log.Printf("⚠️ No active reg_pd found with year filter, falling back to all")
		return r.GetAllRegPdMappings(ctx)
	}

	return mappings, nil
}

// GetSyncedNpmsBySemester returns NPMs that already have spp_mhs data for a given semester
func (r *repository) GetSyncedNpmsBySemester(ctx context.Context, idSmt string) (map[string]bool, error) {
	query := `
		SELECT DISTINCT rp.nipd
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		WHERE s.id_smt = @p1 AND s.soft_delete = 0
	`

	rows, err := r.db.QueryContext(ctx, query, idSmt)
	if err != nil {
		return nil, fmt.Errorf("failed to get synced npms: %w", err)
	}
	defer rows.Close()

	result := make(map[string]bool)
	for rows.Next() {
		var npm string
		if err := rows.Scan(&npm); err != nil {
			return nil, fmt.Errorf("failed to scan npm: %w", err)
		}
		result[npm] = true
	}

	return result, nil
}

// AutoUpdateDaftarUktIdSms updates daftar_ukt.id_sms based on prodi name matching
// from spp_mhs -> reg_pd -> sms. Returns number of records updated.
func (r *repository) AutoUpdateDaftarUktIdSms(ctx context.Context) (int, error) {
	// This query finds unmapped prodi in daftar_ukt and tries to match via:
	// 1. spp_mhs -> reg_pd -> sms to get prodi names from MyUnila
	// 2. Match daftar_ukt.nama_prodi with sms.nm_lemb using fuzzy matching
	query := `
		WITH sms_from_spp AS (
			-- Get unique id_sms from students who have SPP records
			SELECT DISTINCT
				rp.id_sms,
				sms.nm_lemb,
				sms.id_jenj_didik
			FROM keuangan.spp_mhs s
			INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
			INNER JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
			WHERE s.soft_delete = 0
			  AND rp.id_sms IS NOT NULL
		),
		prodi_match AS (
			-- Match unmapped daftar_ukt with sms based on prodi name similarity
			SELECT DISTINCT
				d.id_prodi_simpedam,
				d.kode_strata,
				d.nama_prodi,
				sf.id_sms,
				sf.nm_lemb,
				sf.id_jenj_didik,
				-- Calculate match score: higher is better
				CASE
					-- Exact match (case insensitive)
					WHEN UPPER(d.nama_prodi) = UPPER(sf.nm_lemb) THEN 100
					-- daftar_ukt name contains sms name
					WHEN UPPER(d.nama_prodi) LIKE '%' + UPPER(sf.nm_lemb) + '%' THEN 90
					-- sms name contains daftar_ukt name
					WHEN UPPER(sf.nm_lemb) LIKE '%' + UPPER(d.nama_prodi) + '%' THEN 90
					-- First 15 chars match
					WHEN UPPER(LEFT(d.nama_prodi, 15)) = UPPER(LEFT(sf.nm_lemb, 15)) THEN 80
					-- Partial match on first 10 chars
					WHEN UPPER(LEFT(d.nama_prodi, 10)) = UPPER(LEFT(sf.nm_lemb, 10)) THEN 70
					ELSE 0
				END as match_score
			FROM keuangan.daftar_ukt d
			CROSS JOIN sms_from_spp sf
			WHERE d.id_sms IS NULL
			  AND d.soft_delete = 0
		),
		best_match AS (
			-- Get best match for each prodi
			SELECT
				id_prodi_simpedam,
				kode_strata,
				id_sms,
				id_jenj_didik,
				ROW_NUMBER() OVER (PARTITION BY id_prodi_simpedam, kode_strata ORDER BY match_score DESC) as rn
			FROM prodi_match
			WHERE match_score >= 70  -- Only use matches with score >= 70
		)
		UPDATE d
		SET d.id_sms = bm.id_sms,
			d.id_jenj_didik = CASE
				WHEN d.kode_strata = 3 THEN 22  -- D3
				WHEN d.kode_strata IN (4, 7) THEN 30  -- S1
				ELSE bm.id_jenj_didik
			END,
			d.last_update = GETDATE()
		FROM keuangan.daftar_ukt d
		INNER JOIN best_match bm ON bm.id_prodi_simpedam = d.id_prodi_simpedam
			AND bm.kode_strata = d.kode_strata
			AND bm.rn = 1
		WHERE d.id_sms IS NULL AND d.soft_delete = 0
	`

	result, err := r.db.ExecContext(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("failed to auto-update daftar_ukt id_sms: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	return int(rowsAffected), nil
}
