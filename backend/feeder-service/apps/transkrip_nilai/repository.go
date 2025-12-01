package transkrip_nilai

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetList(ctx context.Context, filter *ListFilter) (*PaginatedResponse, error)
	GetStats(ctx context.Context) (*TranskripNilaiStats, error)
	GetProdiList(ctx context.Context) ([]*ProdiListItem, error)
	GetSemesterList(ctx context.Context) ([]*SemesterListItem, error)
	BulkUpsert(ctx context.Context, items []*TranskripNilai) (int, error)
	UpsertSingle(ctx context.Context, item *TranskripNilai) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// convertToWIB converts UTC time to WIB (UTC+7)
func convertToWIB(t time.Time) time.Time {
	wib := time.FixedZone("WIB", 7*60*60)
	return t.In(wib)
}

func (r *repository) GetList(ctx context.Context, filter *ListFilter) (*PaginatedResponse, error) {
	// Set defaults
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	// Build WHERE conditions
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "nt.soft_delete = 0")

	// Filter by sumber_nilai (source of grade)
	includeTipe := filter.SumberNilai == nil || *filter.SumberNilai == "" || *filter.SumberNilai == "all"
	includeKelas := includeTipe || *filter.SumberNilai == "kelas"
	includeKonversi := includeTipe || *filter.SumberNilai == "konversi"
	includeTransfer := includeTipe || *filter.SumberNilai == "transfer"

	if filter.SumberNilai != nil && *filter.SumberNilai != "" && *filter.SumberNilai != "all" {
		switch *filter.SumberNilai {
		case "kelas":
			conditions = append(conditions, "nt.id_kls IS NOT NULL AND nt.id_konversi_aktivitas IS NULL AND nt.id_ekuivalensi IS NULL")
		case "konversi":
			conditions = append(conditions, "nt.id_konversi_aktivitas IS NOT NULL")
		case "transfer":
			conditions = append(conditions, "nt.id_ekuivalensi IS NOT NULL")
		}
	}

	// Filter by prodi
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("sms.id_sms = @p%d", argIndex))
		args = append(args, *filter.IDProdi)
		argIndex++
	}

	// Filter by id_reg_pd (mahasiswa)
	if filter.IDRegPD != nil && *filter.IDRegPD != "" {
		conditions = append(conditions, fmt.Sprintf("nt.id_reg_pd = @p%d", argIndex))
		args = append(args, *filter.IDRegPD)
		argIndex++
	}

	// Filter by smt_ke
	if filter.SmtKe != nil && *filter.SmtKe > 0 {
		conditions = append(conditions, fmt.Sprintf("nt.smt_ke = @p%d", argIndex))
		args = append(args, *filter.SmtKe)
		argIndex++
	}

	// Search by NIM, nama mahasiswa, or nama matkul
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(rpd.nipd LIKE @p%d OR p.nm_pd LIKE @p%d OR m.nm_mk LIKE @p%d)", argIndex, argIndex+1, argIndex+2))
		searchPattern := "%" + filter.Search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
		argIndex += 3
	}

	whereClause := strings.Join(conditions, " AND ")

	// Determine sumber_nilai in SQL
	sumberNilaiCase := `
		CASE
			WHEN nt.id_konversi_aktivitas IS NOT NULL THEN 'konversi'
			WHEN nt.id_ekuivalensi IS NOT NULL THEN 'transfer'
			ELSE 'kelas'
		END
	`

	// Build main query
	query := fmt.Sprintf(`
		SELECT
			CONCAT(CAST(nt.id_reg_pd AS VARCHAR(50)), '-', CAST(nt.id_mk AS VARCHAR(50)), '-', CAST(nt.id_kls AS VARCHAR(50))) AS id,
			CAST(nt.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			rpd.nipd AS nim,
			p.nm_pd AS nama_mahasiswa,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang,
			CAST(nt.id_mk AS VARCHAR(50)) AS id_mk,
			m.kode_mk AS kode_mk,
			m.nm_mk AS nama_mk,
			nt.sks_mk,
			nt.nilai_angka,
			nt.nilai_huruf,
			nt.nilai_indeks,
			nt.smt_ke,
			CAST(nt.id_kls AS VARCHAR(50)) AS id_kls,
			kk.nm_kls AS nama_kelas,
			CAST(nt.id_konversi_aktivitas AS VARCHAR(50)) AS id_konversi_aktivitas,
			CAST(nt.id_ekuivalensi AS VARCHAR(50)) AS id_ekuivalensi,
			%s AS sumber_nilai,
			nt.last_sync
		FROM pdrd.nilai_transkrip AS nt WITH(NOLOCK)
		LEFT JOIN pdrd.reg_pd AS rpd WITH(NOLOCK) ON rpd.id_reg_pd = nt.id_reg_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.peserta_didik AS p WITH(NOLOCK) ON p.id_pd = rpd.id_pd AND p.soft_delete = 0
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = rpd.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik WITH(NOLOCK) ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN pdrd.matkul AS m WITH(NOLOCK) ON m.id_mk = nt.id_mk AND m.soft_delete = 0
		LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_kls = nt.id_kls AND kk.soft_delete = 0
		WHERE %s
	`, sumberNilaiCase, whereClause)

	// Order by
	orderBy := "nt.last_sync"
	orderDir := "DESC"
	if filter.OrderBy != "" {
		switch filter.OrderBy {
		case "nim":
			orderBy = "rpd.nipd"
		case "nama_mahasiswa":
			orderBy = "p.nm_pd"
		case "nama_prodi":
			orderBy = "sms.nm_lemb"
		case "nama_mk":
			orderBy = "m.nm_mk"
		case "nilai_huruf":
			orderBy = "nt.nilai_huruf"
		case "smt_ke":
			orderBy = "nt.smt_ke"
		case "last_sync":
			orderBy = "nt.last_sync"
		}
	}
	if filter.OrderDir != "" && (strings.ToUpper(filter.OrderDir) == "ASC" || strings.ToUpper(filter.OrderDir) == "DESC") {
		orderDir = strings.ToUpper(filter.OrderDir)
	}

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.nilai_transkrip AS nt WITH(NOLOCK)
		LEFT JOIN pdrd.reg_pd AS rpd WITH(NOLOCK) ON rpd.id_reg_pd = nt.id_reg_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.peserta_didik AS p WITH(NOLOCK) ON p.id_pd = rpd.id_pd AND p.soft_delete = 0
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = rpd.id_sms AND sms.soft_delete = 0
		LEFT JOIN pdrd.matkul AS m WITH(NOLOCK) ON m.id_mk = nt.id_mk AND m.soft_delete = 0
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count transkrip nilai: %w", err)
	}

	// Add pagination
	offset := (filter.Page - 1) * filter.Limit
	query = fmt.Sprintf(`%s ORDER BY %s %s OFFSET %d ROWS FETCH NEXT %d ROWS ONLY`,
		query, orderBy, orderDir, offset, filter.Limit)

	var items []*TranskripNilaiListItem
	err = r.db.SelectContext(ctx, &items, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get transkrip nilai list: %w", err)
	}

	// Convert times to WIB
	for _, item := range items {
		if item.LastSync != nil {
			converted := convertToWIB(*item.LastSync)
			item.LastSync = &converted
		}
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit

	// Ignore unused variables for now
	_ = includeKelas
	_ = includeKonversi
	_ = includeTransfer

	return &PaginatedResponse{
		Data:       items,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetStats(ctx context.Context) (*TranskripNilaiStats, error) {
	stats := &TranskripNilaiStats{}

	// Get total transkrip
	err := r.db.GetContext(ctx, &stats.TotalTranskrip, `
		SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total transkrip: %w", err)
	}

	// Get total unique mahasiswa
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(DISTINCT id_reg_pd) FROM pdrd.nilai_transkrip WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Get total unique prodi
	err = r.db.GetContext(ctx, &stats.TotalProdi, `
		SELECT COUNT(DISTINCT rpd.id_sms)
		FROM pdrd.nilai_transkrip nt WITH(NOLOCK)
		LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = nt.id_reg_pd
		WHERE nt.soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total prodi: %w", err)
	}

	// Get total nilai from kelas (id_kls is not null, no konversi/transfer)
	err = r.db.GetContext(ctx, &stats.TotalNilaiKelas, `
		SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK)
		WHERE soft_delete = 0
		AND id_kls IS NOT NULL
		AND id_konversi_aktivitas IS NULL
		AND id_ekuivalensi IS NULL
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total nilai kelas: %w", err)
	}

	// Get total konversi
	err = r.db.GetContext(ctx, &stats.TotalKonversi, `
		SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK)
		WHERE soft_delete = 0 AND id_konversi_aktivitas IS NOT NULL
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total konversi: %w", err)
	}

	// Get total transfer
	err = r.db.GetContext(ctx, &stats.TotalTransfer, `
		SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK)
		WHERE soft_delete = 0 AND id_ekuivalensi IS NOT NULL
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total transfer: %w", err)
	}

	// Get last sync
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM pdrd.nilai_transkrip WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get last sync: %w", err)
	}

	if lastSync != nil {
		converted := convertToWIB(*lastSync)
		stats.LastSync = &converted
	}

	return stats, nil
}

func (r *repository) GetProdiList(ctx context.Context) ([]*ProdiListItem, error) {
	query := `
		SELECT DISTINCT
			CAST(sms.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.kode_prodi AS kode_prodi,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang
		FROM pdrd.nilai_transkrip nt WITH(NOLOCK)
		INNER JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = nt.id_reg_pd AND rpd.soft_delete = 0
		INNER JOIN pdrd.sms sms WITH(NOLOCK) ON sms.id_sms = rpd.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan didik WITH(NOLOCK) ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		WHERE nt.soft_delete = 0
		ORDER BY sms.nm_lemb
	`

	var items []*ProdiListItem
	err := r.db.SelectContext(ctx, &items, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}

	return items, nil
}

func (r *repository) GetSemesterList(ctx context.Context) ([]*SemesterListItem, error) {
	// Get semester list from kelas kuliah that have transkrip nilai
	query := `
		SELECT DISTINCT
			CAST(kk.id_smt AS VARCHAR(10)) AS id_semester,
			sem.nm_smt AS nama_semester
		FROM pdrd.nilai_transkrip nt WITH(NOLOCK)
		INNER JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = nt.id_kls AND kk.soft_delete = 0
		LEFT JOIN ref.semester sem WITH(NOLOCK) ON sem.id_smt = kk.id_smt
		WHERE nt.soft_delete = 0
		ORDER BY id_semester DESC
	`

	var items []*SemesterListItem
	err := r.db.SelectContext(ctx, &items, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester list: %w", err)
	}

	return items, nil
}

func (r *repository) BulkUpsert(ctx context.Context, items []*TranskripNilai) (int, error) {
	if len(items) == 0 {
		return 0, nil
	}

	// Use MERGE for upsert
	query := `
		MERGE pdrd.nilai_transkrip AS target
		USING (VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11))
		AS source (id_reg_pd, id_mk, id_kls, id_konversi_aktivitas, id_ekuivalensi, nilai_angka, nilai_huruf, nilai_indeks, smt_ke, sks_mk, last_sync)
		ON target.id_reg_pd = source.id_reg_pd AND target.id_mk = source.id_mk AND target.id_kls = source.id_kls
		WHEN MATCHED THEN
			UPDATE SET
				id_konversi_aktivitas = source.id_konversi_aktivitas,
				id_ekuivalensi = source.id_ekuivalensi,
				nilai_angka = source.nilai_angka,
				nilai_huruf = source.nilai_huruf,
				nilai_indeks = source.nilai_indeks,
				smt_ke = source.smt_ke,
				sks_mk = source.sks_mk,
				last_update = GETUTCDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (id_reg_pd, id_mk, id_kls, id_konversi_aktivitas, id_ekuivalensi, nilai_angka, nilai_huruf, nilai_indeks, smt_ke, sks_mk, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (source.id_reg_pd, source.id_mk, source.id_kls, source.id_konversi_aktivitas, source.id_ekuivalensi, source.nilai_angka, source.nilai_huruf, source.nilai_indeks, source.smt_ke, source.sks_mk, GETUTCDATE(), '00000000-0000-0000-0000-000000000000', GETUTCDATE(), 0, source.last_sync);
	`

	synced := 0
	for _, item := range items {
		_, err := r.db.ExecContext(ctx, query,
			item.IDRegPD,
			item.IDMK,
			item.IDKls,
			item.IDKonversiAktivitas,
			item.IDEkuivalensi,
			item.NilaiAngka,
			item.NilaiHuruf,
			item.NilaiIndeks,
			item.SmtKe,
			item.SksMK,
			item.LastSync,
		)
		if err != nil {
			return synced, fmt.Errorf("failed to upsert transkrip nilai: %w", err)
		}
		synced++
	}

	return synced, nil
}

// UpsertSingle performs single record upsert with UUID validation and FK constraint handling
// Uses TRY_CAST to validate UUIDs and gracefully handle invalid data
func (r *repository) UpsertSingle(ctx context.Context, item *TranskripNilai) error {
	// Use MERGE with TRY_CAST for UUID validation
	// If id_kls is invalid UUID or doesn't exist in kelas_kuliah, we skip inserting (but still track)
	query := `
		DECLARE @id_reg_pd UNIQUEIDENTIFIER = TRY_CAST(@p1 AS UNIQUEIDENTIFIER);
		DECLARE @id_mk UNIQUEIDENTIFIER = TRY_CAST(@p2 AS UNIQUEIDENTIFIER);
		DECLARE @id_kls UNIQUEIDENTIFIER = TRY_CAST(@p3 AS UNIQUEIDENTIFIER);
		DECLARE @id_konversi_aktivitas UNIQUEIDENTIFIER = TRY_CAST(@p4 AS UNIQUEIDENTIFIER);
		DECLARE @id_ekuivalensi UNIQUEIDENTIFIER = TRY_CAST(@p5 AS UNIQUEIDENTIFIER);

		-- Check if required UUIDs are valid
		IF @id_reg_pd IS NULL OR @id_mk IS NULL
		BEGIN
			-- Invalid required UUID, skip this record
			RETURN;
		END

		-- Check if id_kls exists in kelas_kuliah (if provided and valid)
		IF @id_kls IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pdrd.kelas_kuliah WHERE id_kls = @id_kls)
		BEGIN
			-- id_kls doesn't exist in kelas_kuliah, skip this record
			-- This prevents FK constraint violation
			RAISERROR('FK_KELAS_KULIAH_NOT_FOUND', 16, 1);
			RETURN;
		END

		MERGE pdrd.nilai_transkrip AS target
		USING (SELECT
			@id_reg_pd AS id_reg_pd,
			@id_mk AS id_mk,
			@id_kls AS id_kls,
			@id_konversi_aktivitas AS id_konversi_aktivitas,
			@id_ekuivalensi AS id_ekuivalensi,
			@p6 AS nilai_angka,
			@p7 AS nilai_huruf,
			@p8 AS nilai_indeks,
			@p9 AS smt_ke,
			@p10 AS sks_mk,
			@p11 AS last_sync
		) AS source
		ON target.id_reg_pd = source.id_reg_pd
			AND target.id_mk = source.id_mk
			AND (target.id_kls = source.id_kls OR (target.id_kls IS NULL AND source.id_kls IS NULL))
		WHEN MATCHED THEN
			UPDATE SET
				id_konversi_aktivitas = source.id_konversi_aktivitas,
				id_ekuivalensi = source.id_ekuivalensi,
				nilai_angka = source.nilai_angka,
				nilai_huruf = source.nilai_huruf,
				nilai_indeks = source.nilai_indeks,
				smt_ke = source.smt_ke,
				sks_mk = source.sks_mk,
				last_update = GETUTCDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (id_reg_pd, id_mk, id_kls, id_konversi_aktivitas, id_ekuivalensi, nilai_angka, nilai_huruf, nilai_indeks, smt_ke, sks_mk, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (source.id_reg_pd, source.id_mk, source.id_kls, source.id_konversi_aktivitas, source.id_ekuivalensi, source.nilai_angka, source.nilai_huruf, source.nilai_indeks, source.smt_ke, source.sks_mk, GETUTCDATE(), '00000000-0000-0000-0000-000000000000', GETUTCDATE(), 0, source.last_sync);
	`

	_, err := r.db.ExecContext(ctx, query,
		item.IDRegPD,
		item.IDMK,
		item.IDKls,
		item.IDKonversiAktivitas,
		item.IDEkuivalensi,
		item.NilaiAngka,
		item.NilaiHuruf,
		item.NilaiIndeks,
		item.SmtKe,
		item.SksMK,
		item.LastSync,
	)

	return err
}
