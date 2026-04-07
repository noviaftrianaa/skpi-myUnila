package daftar_ukt

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetDaftarUKTList(ctx context.Context, tahun int, idSms string, search string, page, limit int, sortBy string, sortOrder string) (*DaftarUKTListResult, error)
	GetDaftarUKTByID(ctx context.Context, id uuid.UUID) (*DaftarUKT, error)
	UpsertDaftarUKT(ctx context.Context, data *DaftarUKT) error
	BulkUpsertDaftarUKT(ctx context.Context, dataList []*DaftarUKT) (int, int, error)
	GetProdiMapping(ctx context.Context, idProdiSimpedam uuid.UUID, kodeStrata int) (*ProdiMapping, error)
	GetAllProdiMappings(ctx context.Context) ([]ProdiMapping, error)
	GetStats(ctx context.Context) (*DaftarUktStats, error)
	GetFakultasList(ctx context.Context) ([]FakultasOption, error)
	GetProdiList(ctx context.Context) ([]ProdiOption, error)

	// Auto-mapping from NPM (via reg_pd)
	GetRegPdByNIPD(ctx context.Context, nipd string) (*RegPdInfo, error)
	UpdateDaftarUKTMapping(ctx context.Context, idProdiSimpedam uuid.UUID, kodeStrata int, idSMS uuid.UUID) error
	BuildProdiMappingFromNPM(ctx context.Context) (int, error)

	// Kelas UKT
	UpsertKelasUKT(ctx context.Context, data *KelasUKT) error
	GetKelasUKTByID(ctx context.Context, id uuid.UUID) (*KelasUKT, error)
	GetAllKelasUKT(ctx context.Context) ([]KelasUKT, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetDaftarUKTList(ctx context.Context, tahun int, idSms string, search string, page, limit int, sortBy string, sortOrder string) (*DaftarUKTListResult, error) {
	offset := (page - 1) * limit

	// INNER JOIN to only show records with id_sms mapped (from pdrd.sms)
	joins := `
		INNER JOIN pdrd.sms sms ON d.id_sms = sms.id_sms
		INNER JOIN ref.jenjang_pendidikan didik ON sms.id_jenj_didik = didik.id_jenj_didik
		LEFT JOIN pdrd.sms fak ON sms.id_fak_unila = fak.id_sms AND fak.soft_delete = 0
	`

	// Build WHERE conditions
	whereClause := `WHERE d.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1

	if tahun > 0 {
		whereClause += fmt.Sprintf(` AND d.tahun = @p%d`, argIdx)
		args = append(args, tahun)
		argIdx++
	}

	if idSms != "" {
		whereClause += fmt.Sprintf(` AND CAST(d.id_sms AS NVARCHAR(36)) = @p%d`, argIdx)
		args = append(args, idSms)
		argIdx++
	}

	if search != "" {
		whereClause += fmt.Sprintf(` AND (sms.nm_lemb LIKE '%%' + @p%d + '%%' OR fak.nm_lemb LIKE '%%' + @p%d + '%%')`, argIdx, argIdx)
		args = append(args, search)
		argIdx++
	}

	// Count query
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM keuangan.daftar_ukt d %s %s`, joins, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count daftar_ukt: %w", err)
	}

	// Determine ORDER BY
	orderClause := "ORDER BY ISNULL(fak.nm_lemb, ''), sms.nm_lemb, d.nama_kelas"
	if sortBy != "" {
		allowedSorts := map[string]string{
			"nama_prodi":    "sms.nm_lemb",
			"tahun":         "d.tahun",
			"nama_kelas":    "d.nama_kelas",
			"nominal":       "d.nominal",
			"last_sync":     "d.last_sync",
			"nama_fakultas": "ISNULL(fak.nm_lemb, '')",
		}
		if col, ok := allowedSorts[sortBy]; ok {
			dir := "ASC"
			if sortOrder == "desc" {
				dir = "DESC"
			}
			orderClause = fmt.Sprintf("ORDER BY %s %s", col, dir)
		}
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT d.id_daftar_ukt, d.id_prodi_simpedam, d.nama_prodi, d.tahun,
			   d.kode_fakultas, d.nama_fakultas, d.kode_kelas, d.nama_kelas,
			   d.nominal, d.kode_strata, d.id_sms, d.id_jenj_didik,
			   d.create_date, d.id_creator, d.last_update, d.id_updater,
			   d.soft_delete, d.last_sync,
			   sms.nm_lemb as nama_prodi_sms,
			   didik.nm_jenj_didik as nama_jenjang,
			   ISNULL(fak.nm_lemb, '') as nama_fakultas_sms
		FROM keuangan.daftar_ukt d
		%s
		%s
		%s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, joins, whereClause, orderClause, argIdx, argIdx+1)

	args = append(args, offset, limit)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get daftar_ukt list: %w", err)
	}
	defer rows.Close()

	var data []DaftarUKT
	for rows.Next() {
		var d DaftarUKT
		err := rows.Scan(
			&d.IDDaftarUKT, &d.IDProdiSimpedam, &d.NamaProdi, &d.Tahun,
			&d.KodeFakultas, &d.NamaFakultas, &d.KodeKelas, &d.NamaKelas,
			&d.Nominal, &d.KodeStrata, &d.IDSMS, &d.IDJenjDidik,
			&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater,
			&d.SoftDelete, &d.LastSync,
			&d.NamaProdiSMS, &d.NamaJenjang, &d.NamaFakultasSMS,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan daftar_ukt: %w", err)
		}
		data = append(data, d)
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	return &DaftarUKTListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetDaftarUKTByID(ctx context.Context, id uuid.UUID) (*DaftarUKT, error) {
	query := `
		SELECT id_daftar_ukt, id_prodi_simpedam, nama_prodi, tahun,
			   kode_fakultas, nama_fakultas, kode_kelas, nama_kelas,
			   nominal, kode_strata, id_sms, id_jenj_didik,
			   create_date, id_creator, last_update, id_updater,
			   soft_delete, last_sync
		FROM keuangan.daftar_ukt
		WHERE id_daftar_ukt = @p1 AND soft_delete = 0
	`

	var d DaftarUKT
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&d.IDDaftarUKT, &d.IDProdiSimpedam, &d.NamaProdi, &d.Tahun,
		&d.KodeFakultas, &d.NamaFakultas, &d.KodeKelas, &d.NamaKelas,
		&d.Nominal, &d.KodeStrata, &d.IDSMS, &d.IDJenjDidik,
		&d.CreateDate, &d.IDCreator, &d.LastUpdate, &d.IDUpdater,
		&d.SoftDelete, &d.LastSync,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get daftar_ukt by id: %w", err)
	}

	return &d, nil
}

func (r *repository) UpsertDaftarUKT(ctx context.Context, data *DaftarUKT) error {
	query := `
		MERGE INTO keuangan.daftar_ukt AS target
		USING (SELECT @p1 AS id_daftar_ukt) AS source
		ON target.id_daftar_ukt = source.id_daftar_ukt
		WHEN MATCHED THEN
			UPDATE SET
				id_prodi_simpedam = @p2,
				nama_prodi = @p3,
				tahun = @p4,
				kode_fakultas = @p5,
				nama_fakultas = @p6,
				kode_kelas = @p7,
				nama_kelas = @p8,
				nominal = @p9,
				kode_strata = @p10,
				id_sms = @p11,
				id_jenj_didik = @p12,
				last_update = @p13,
				id_updater = @p14,
				last_sync = @p15
		WHEN NOT MATCHED THEN
			INSERT (id_daftar_ukt, id_prodi_simpedam, nama_prodi, tahun,
					kode_fakultas, nama_fakultas, kode_kelas, nama_kelas,
					nominal, kode_strata, id_sms, id_jenj_didik,
					create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
					@p11, @p12, @p13, @p14, @p13, 0, @p15);
	`

	_, err := r.db.ExecContext(ctx, query,
		data.IDDaftarUKT, data.IDProdiSimpedam, data.NamaProdi, data.Tahun,
		data.KodeFakultas, data.NamaFakultas, data.KodeKelas, data.NamaKelas,
		data.Nominal, data.KodeStrata, data.IDSMS, data.IDJenjDidik,
		data.LastUpdate, data.IDCreator, data.LastSync,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert daftar_ukt: %w", err)
	}

	return nil
}

func (r *repository) BulkUpsertDaftarUKT(ctx context.Context, dataList []*DaftarUKT) (int, int, error) {
	inserted := 0
	updated := 0

	for _, data := range dataList {
		// Check if exists
		var exists int
		checkQuery := `SELECT COUNT(*) FROM keuangan.daftar_ukt WHERE id_daftar_ukt = @p1`
		if err := r.db.QueryRowContext(ctx, checkQuery, data.IDDaftarUKT).Scan(&exists); err != nil {
			return inserted, updated, fmt.Errorf("failed to check existing: %w", err)
		}

		if err := r.UpsertDaftarUKT(ctx, data); err != nil {
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

func (r *repository) GetProdiMapping(ctx context.Context, idProdiSimpedam uuid.UUID, kodeStrata int) (*ProdiMapping, error) {
	query := `
		SELECT id_mapping, id_prodi_simpedam, nama_prodi_simpedam, kode_strata,
			   id_sms, nama_prodi_myunila, CAST(is_active AS INT) as is_active
		FROM keuangan.mapping_prodi_simpedam
		WHERE id_prodi_simpedam = @p1 AND kode_strata = @p2 AND is_active = 1 AND soft_delete = 0
	`

	var m ProdiMapping
	var isActiveInt int
	err := r.db.QueryRowContext(ctx, query, idProdiSimpedam, kodeStrata).Scan(
		&m.IDMapping, &m.IDProdiSimpedam, &m.NamaProdiSimpedam, &m.KodeStrata,
		&m.IDSMS, &m.NamaProdiMyunila, &isActiveInt,
	)
	if err != nil {
		return nil, err // Could be sql.ErrNoRows
	}
	m.IsActive = isActiveInt == 1

	return &m, nil
}

func (r *repository) GetAllProdiMappings(ctx context.Context) ([]ProdiMapping, error) {
	query := `
		SELECT id_mapping, id_prodi_simpedam, nama_prodi_simpedam, kode_strata,
			   id_sms, nama_prodi_myunila, CAST(is_active AS INT) as is_active
		FROM keuangan.mapping_prodi_simpedam
		WHERE is_active = 1 AND soft_delete = 0
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi mappings: %w", err)
	}
	defer rows.Close()

	var mappings []ProdiMapping
	for rows.Next() {
		var m ProdiMapping
		var isActiveInt int
		err := rows.Scan(
			&m.IDMapping, &m.IDProdiSimpedam, &m.NamaProdiSimpedam, &m.KodeStrata,
			&m.IDSMS, &m.NamaProdiMyunila, &isActiveInt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan prodi mapping: %w", err)
		}
		m.IsActive = isActiveInt == 1
		mappings = append(mappings, m)
	}

	return mappings, nil
}

func (r *repository) GetStats(ctx context.Context) (*DaftarUktStats, error) {
	query := `
		SELECT
			COALESCE(SUM(CASE WHEN id_sms IS NOT NULL THEN 1 ELSE 0 END), 0) as total_daftar_ukt,
			COALESCE(COUNT(DISTINCT CASE WHEN id_sms IS NOT NULL THEN id_prodi_simpedam END), 0) as total_prodi,
			COALESCE(SUM(CASE WHEN id_sms IS NOT NULL THEN 1 ELSE 0 END), 0) as total_mapped,
			COALESCE(SUM(CASE WHEN id_sms IS NULL THEN 1 ELSE 0 END), 0) as total_unmapped,
			MAX(last_sync) as last_sync
		FROM keuangan.daftar_ukt
		WHERE soft_delete = 0
	`

	var stats DaftarUktStats
	var lastSync *string
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalDaftarUkt, &stats.TotalProdi, &stats.TotalMapped, &stats.TotalUnmapped, &lastSync,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}
	stats.LastSync = lastSync

	return &stats, nil
}

func (r *repository) GetFakultasList(ctx context.Context) ([]FakultasOption, error) {
	query := `
		SELECT DISTINCT kode_fakultas, nama_fakultas
		FROM keuangan.daftar_ukt
		WHERE soft_delete = 0
		ORDER BY kode_fakultas
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get fakultas list: %w", err)
	}
	defer rows.Close()

	var fakultas []FakultasOption
	for rows.Next() {
		var f FakultasOption
		if err := rows.Scan(&f.KodeFakultas, &f.NamaFakultas); err != nil {
			return nil, fmt.Errorf("failed to scan fakultas: %w", err)
		}
		fakultas = append(fakultas, f)
	}

	return fakultas, nil
}

func (r *repository) GetProdiList(ctx context.Context) ([]ProdiOption, error) {
	query := `
		SELECT DISTINCT
			CAST(sms.id_sms AS NVARCHAR(36)) as id_sms,
			sms.nm_lemb as nama_prodi,
			ISNULL(didik.nm_jenj_didik, '') as nama_jenjang
		FROM pdrd.sms sms
		INNER JOIN ref.jenjang_pendidikan didik ON didik.id_jenj_didik = sms.id_jenj_didik
		WHERE sms.soft_delete = 0
		  AND sms.stat_prodi = 'A'
		  AND sms.id_jns_sms = '3'
		  AND sms.id_fak_unila IS NOT NULL
		  AND sms.id_sms IN (SELECT DISTINCT id_sms FROM keuangan.daftar_ukt WHERE soft_delete = 0 AND id_sms IS NOT NULL)
		ORDER BY sms.nm_lemb
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var prodi []ProdiOption
	for rows.Next() {
		var p ProdiOption
		if err := rows.Scan(&p.IDSMS, &p.NamaProdi, &p.NamaJenjang); err != nil {
			return nil, fmt.Errorf("failed to scan prodi: %w", err)
		}
		prodi = append(prodi, p)
	}

	return prodi, nil
}

// ========================================
// Auto-mapping from NPM (via reg_pd)
// ========================================

func (r *repository) GetRegPdByNIPD(ctx context.Context, nipd string) (*RegPdInfo, error) {
	query := `
		SELECT id_reg_pd, nipd, id_sms
		FROM pdrd.reg_pd
		WHERE nipd = @p1
	`

	var info RegPdInfo
	err := r.db.QueryRowContext(ctx, query, nipd).Scan(&info.IDRegPd, &info.NIPD, &info.IDSMS)
	if err != nil {
		return nil, err
	}

	return &info, nil
}

func (r *repository) UpdateDaftarUKTMapping(ctx context.Context, idProdiSimpedam uuid.UUID, kodeStrata int, idSMS uuid.UUID) error {
	// Map kode_strata to id_jenj_didik
	var idJenjDidik int
	switch kodeStrata {
	case 3:
		idJenjDidik = 22 // D3
	case 4, 7:
		idJenjDidik = 30 // S1
	default:
		idJenjDidik = 30
	}

	query := `
		UPDATE keuangan.daftar_ukt
		SET id_sms = @p1, id_jenj_didik = @p2, last_update = GETDATE()
		WHERE id_prodi_simpedam = @p3 AND kode_strata = @p4 AND soft_delete = 0
	`

	_, err := r.db.ExecContext(ctx, query, idSMS, idJenjDidik, idProdiSimpedam, kodeStrata)
	if err != nil {
		return fmt.Errorf("failed to update daftar_ukt mapping: %w", err)
	}

	return nil
}

// BuildProdiMappingFromNPM builds prodi mapping by matching prodi names from daftar_ukt
// with sms table (via spp_mhs/reg_pd). Returns number of mappings updated.
func (r *repository) BuildProdiMappingFromNPM(ctx context.Context) (int, error) {
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
		return 0, fmt.Errorf("failed to build prodi mapping from NPM: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	return int(rowsAffected), nil
}

// ========================================
// Kelas UKT
// ========================================

func (r *repository) UpsertKelasUKT(ctx context.Context, data *KelasUKT) error {
	query := `
		MERGE INTO keuangan.kelas_ukt AS target
		USING (SELECT @p1 AS id_kelas_ukt) AS source
		ON target.id_kelas_ukt = source.id_kelas_ukt
		WHEN MATCHED THEN
			UPDATE SET
				nm_kelas_ukt = @p2,
				nominal_ukt = @p3,
				last_update = @p4,
				id_updater = @p5,
				last_sync = @p6
		WHEN NOT MATCHED THEN
			INSERT (id_kelas_ukt, nm_kelas_ukt, nominal_ukt,
					create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p4, 0, @p6);
	`

	_, err := r.db.ExecContext(ctx, query,
		data.IDKelasUKT, data.NmKelasUKT, data.NominalUKT,
		data.LastUpdate, data.IDCreator, data.LastSync,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert kelas_ukt: %w", err)
	}

	return nil
}

func (r *repository) GetKelasUKTByID(ctx context.Context, id uuid.UUID) (*KelasUKT, error) {
	query := `
		SELECT id_kelas_ukt, nm_kelas_ukt, nominal_ukt,
			   create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM keuangan.kelas_ukt
		WHERE id_kelas_ukt = @p1 AND soft_delete = 0
	`

	var k KelasUKT
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&k.IDKelasUKT, &k.NmKelasUKT, &k.NominalUKT,
		&k.CreateDate, &k.IDCreator, &k.LastUpdate, &k.IDUpdater, &k.SoftDelete, &k.LastSync,
	)
	if err != nil {
		return nil, err
	}

	return &k, nil
}

func (r *repository) GetAllKelasUKT(ctx context.Context) ([]KelasUKT, error) {
	query := `
		SELECT id_kelas_ukt, nm_kelas_ukt, nominal_ukt,
			   create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM keuangan.kelas_ukt
		WHERE soft_delete = 0
		ORDER BY nm_kelas_ukt
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get kelas_ukt list: %w", err)
	}
	defer rows.Close()

	var kelasList []KelasUKT
	for rows.Next() {
		var k KelasUKT
		err := rows.Scan(
			&k.IDKelasUKT, &k.NmKelasUKT, &k.NominalUKT,
			&k.CreateDate, &k.IDCreator, &k.LastUpdate, &k.IDUpdater, &k.SoftDelete, &k.LastSync,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan kelas_ukt: %w", err)
		}
		kelasList = append(kelasList, k)
	}

	return kelasList, nil
}
