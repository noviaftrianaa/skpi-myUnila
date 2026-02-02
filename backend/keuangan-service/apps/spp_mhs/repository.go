package spp_mhs

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetSppMhsList(ctx context.Context, page, limit int, idSmt *string, semesterType *string, idDaftarUkt *string) (*SppMhsListResult, error)
	GetSppMhsByID(ctx context.Context, id uuid.UUID) (*SppMhsDetail, error)
	GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error)
	GetStats(ctx context.Context) (*SppMhsStats, error)
	UpsertSppMhs(ctx context.Context, data *SppMhs) error
	BulkUpsertSppMhs(ctx context.Context, dataList []*SppMhs) (int, int, error)
	GetRegPdByNPM(ctx context.Context, npm string) (*RegPdMapping, error)
	GetAllRegPdMappings(ctx context.Context) (map[string]*RegPdMapping, error)
	AutoUpdateDaftarUktIdSms(ctx context.Context) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSppMhsList(ctx context.Context, page, limit int, idSmt *string, semesterType *string, idDaftarUkt *string) (*SppMhsListResult, error) {
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

	// Filter by semester type (ganjil/genap)
	if semesterType != nil && *semesterType != "" {
		if *semesterType == "ganjil" {
			whereClause += " AND RIGHT(s.id_smt, 1) = '1'"
		} else if *semesterType == "genap" {
			whereClause += " AND RIGHT(s.id_smt, 1) = '2'"
		}
	}

	// Filter by daftar_ukt - disabled until schema is updated
	// TODO: Enable after running ALTER script to add id_daftar_ukt column
	_ = idDaftarUkt // Placeholder - filter disabled

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
			   ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
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
			   ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
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
			   ISNULL(sms.nm_lemb, '') as nama_prodi,
			   k.nm_kelas_ukt as nama_kelas_ukt,
			   k.nominal_ukt as nominal_ukt
		FROM keuangan.spp_mhs s
		INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
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

	for _, data := range dataList {
		var exists int
		checkQuery := `SELECT COUNT(*) FROM keuangan.spp_mhs WHERE id_spp_mhs = @p1`
		if err := r.db.QueryRowContext(ctx, checkQuery, data.IDSppMhs).Scan(&exists); err != nil {
			return inserted, updated, fmt.Errorf("failed to check existing: %w", err)
		}

		if err := r.UpsertSppMhs(ctx, data); err != nil {
			return inserted, updated, err
		}

		if exists > 0 {
			updated++
		} else {
			inserted++
		}
	}

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
