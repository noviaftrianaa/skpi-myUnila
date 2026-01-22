package daftar_ukt

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetDaftarUKTList(ctx context.Context, tahun int, page, limit int) (*DaftarUKTListResult, error)
	GetDaftarUKTByID(ctx context.Context, id uuid.UUID) (*DaftarUKT, error)
	UpsertDaftarUKT(ctx context.Context, data *DaftarUKT) error
	BulkUpsertDaftarUKT(ctx context.Context, dataList []*DaftarUKT) (int, int, error)
	GetProdiMapping(ctx context.Context, idProdiSimpedam uuid.UUID, kodeStrata int) (*ProdiMapping, error)
	GetAllProdiMappings(ctx context.Context) ([]ProdiMapping, error)
	GetStats(ctx context.Context) (*DaftarUktStats, error)
	GetFakultasList(ctx context.Context) ([]FakultasOption, error)
	GetProdiList(ctx context.Context) ([]ProdiOption, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetDaftarUKTList(ctx context.Context, tahun int, page, limit int) (*DaftarUKTListResult, error) {
	offset := (page - 1) * limit

	// Count query
	var total int
	countQuery := `SELECT COUNT(*) FROM keuangan.daftar_ukt WHERE soft_delete = 0`
	args := []interface{}{}

	if tahun > 0 {
		countQuery += ` AND tahun = @p1`
		args = append(args, tahun)
	}

	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count daftar_ukt: %w", err)
	}

	// Data query
	dataQuery := `
		SELECT d.id_daftar_ukt, d.id_prodi_simpedam, d.nama_prodi, d.tahun,
			   d.kode_fakultas, d.nama_fakultas, d.kode_kelas, d.nama_kelas,
			   d.nominal, d.kode_strata, d.id_sms, d.id_jenj_didik,
			   d.create_date, d.id_creator, d.last_update, d.id_updater,
			   d.soft_delete, d.last_sync
		FROM keuangan.daftar_ukt d
		WHERE d.soft_delete = 0
	`

	dataArgs := []interface{}{}
	argIdx := 1

	if tahun > 0 {
		dataQuery += fmt.Sprintf(` AND d.tahun = @p%d`, argIdx)
		dataArgs = append(dataArgs, tahun)
		argIdx++
	}

	dataQuery += fmt.Sprintf(` ORDER BY d.nama_fakultas, d.nama_prodi, d.nama_kelas
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, argIdx, argIdx+1)
	dataArgs = append(dataArgs, offset, limit)

	rows, err := r.db.QueryContext(ctx, dataQuery, dataArgs...)
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
			   id_sms, nama_prodi_myunila, is_active
		FROM keuangan.mapping_prodi_simpedam
		WHERE id_prodi_simpedam = @p1 AND kode_strata = @p2 AND is_active = 1 AND soft_delete = 0
	`

	var m ProdiMapping
	err := r.db.QueryRowContext(ctx, query, idProdiSimpedam, kodeStrata).Scan(
		&m.IDMapping, &m.IDProdiSimpedam, &m.NamaProdiSimpedam, &m.KodeStrata,
		&m.IDSMS, &m.NamaProdiMyunila, &m.IsActive,
	)
	if err != nil {
		return nil, err // Could be sql.ErrNoRows
	}

	return &m, nil
}

func (r *repository) GetAllProdiMappings(ctx context.Context) ([]ProdiMapping, error) {
	query := `
		SELECT id_mapping, id_prodi_simpedam, nama_prodi_simpedam, kode_strata,
			   id_sms, nama_prodi_myunila, is_active
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
		err := rows.Scan(
			&m.IDMapping, &m.IDProdiSimpedam, &m.NamaProdiSimpedam, &m.KodeStrata,
			&m.IDSMS, &m.NamaProdiMyunila, &m.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan prodi mapping: %w", err)
		}
		mappings = append(mappings, m)
	}

	return mappings, nil
}

func (r *repository) GetStats(ctx context.Context) (*DaftarUktStats, error) {
	query := `
		SELECT
			COALESCE(COUNT(*), 0) as total_daftar_ukt,
			COALESCE(COUNT(DISTINCT id_prodi_simpedam), 0) as total_prodi,
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
		SELECT DISTINCT CAST(id_prodi_simpedam AS NVARCHAR(36)) as id_prodi_simpedam, nama_prodi
		FROM keuangan.daftar_ukt
		WHERE soft_delete = 0
		ORDER BY nama_prodi
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var prodi []ProdiOption
	for rows.Next() {
		var p ProdiOption
		if err := rows.Scan(&p.IDProdiSimpedam, &p.NamaProdi); err != nil {
			return nil, fmt.Errorf("failed to scan prodi: %w", err)
		}
		prodi = append(prodi, p)
	}

	return prodi, nil
}
