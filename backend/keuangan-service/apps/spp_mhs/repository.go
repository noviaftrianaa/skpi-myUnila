package spp_mhs

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetSppMhsList(ctx context.Context, page, limit int, npm *string, idSmt *string) (*SppMhsListResult, error)
	GetSppMhsByID(ctx context.Context, id uuid.UUID) (*SppMhsDetail, error)
	GetSppMhsByNPM(ctx context.Context, npm string) ([]SppMhsDetail, error)
	GetStats(ctx context.Context) (*SppMhsStats, error)
	UpsertSppMhs(ctx context.Context, data *SppMhs) error
	BulkUpsertSppMhs(ctx context.Context, dataList []*SppMhs) (int, int, error)
	GetRegPdByNPM(ctx context.Context, npm string) (*RegPdMapping, error)
	GetAllRegPdMappings(ctx context.Context) (map[string]*RegPdMapping, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSppMhsList(ctx context.Context, page, limit int, npm *string, idSmt *string) (*SppMhsListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereClause := "WHERE s.soft_delete = 0"
	args := []interface{}{}
	argIdx := 1

	if npm != nil && *npm != "" {
		whereClause += fmt.Sprintf(" AND rp.nipd LIKE @p%d", argIdx)
		args = append(args, "%"+*npm+"%")
		argIdx++
	}
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
