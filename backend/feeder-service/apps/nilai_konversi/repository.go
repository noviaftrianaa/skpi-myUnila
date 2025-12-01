package nilai_konversi

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for nilai_konversi data access
type Repository interface {
	// Bulk operations
	BulkUpsertKonversiAktMhs(ctx context.Context, data []*KonversiAktMhs) error
	BulkUpsertEkuivTransfer(ctx context.Context, data []*EkuivTransfer) error

	// Single record operations
	UpsertKonversiAktMhs(ctx context.Context, data *KonversiAktMhs) error
	UpsertEkuivTransfer(ctx context.Context, data *EkuivTransfer) error

	// List operations with filters
	GetNilaiKonversiList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, jenisKonversi *string, sortBy, sortOrder string) (*PaginatedResponse, error)

	// Utility - Get prodi list and semester list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*NilaiKonversiStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new nilai_konversi repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertKonversiAktMhs performs bulk upsert for mbkm.konversi_akt_mhs
func (r *repository) BulkUpsertKonversiAktMhs(ctx context.Context, data []*KonversiAktMhs) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// SQL Server MERGE query for upsert
	// PK: id_konversi_aktivitas
	query := `
		MERGE mbkm.konversi_akt_mhs AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_konversi_aktivitas) AS source
		ON target.id_konversi_aktivitas = source.id_konversi_aktivitas
		WHEN MATCHED THEN
			UPDATE SET
				id_mk = CAST(@p2 AS UNIQUEIDENTIFIER),
				id_ang_akt_mhs = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_smt = @p4,
				id_akt_mhs = CAST(@p5 AS UNIQUEIDENTIFIER),
				id_daftar_kampus_merdeka = @p6,
				nilai_angka = @p7,
				nilai_huruf = @p8,
				nilai_indeks = @p9,
				sks_mk = @p10,
				last_update = @p11,
				id_updater = @p12,
				last_sync = @p13
		WHEN NOT MATCHED THEN
			INSERT (
				id_konversi_aktivitas, id_mk, id_ang_akt_mhs, id_smt, id_akt_mhs,
				id_daftar_kampus_merdeka, nilai_angka, nilai_huruf, nilai_indeks, sks_mk,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), CAST(@p2 AS UNIQUEIDENTIFIER), CAST(@p3 AS UNIQUEIDENTIFIER), @p4, CAST(@p5 AS UNIQUEIDENTIFIER),
				@p6, @p7, @p8, @p9, @p10,
				@p14, @p15, @p11, @p12, @p16, @p13
			);
	`

	for _, konversi := range data {
		_, err = tx.ExecContext(ctx, query,
			konversi.IDKonversiAktivitas,   // @p1
			konversi.IDMK,                  // @p2
			konversi.IDAngAktMhs,           // @p3
			konversi.IDSmt,                 // @p4
			konversi.IDAktMhs,              // @p5
			konversi.IDDaftarKampusMerdeka, // @p6
			konversi.NilaiAngka,            // @p7
			konversi.NilaiHuruf,            // @p8
			konversi.NilaiIndeks,           // @p9
			konversi.SksMK,                 // @p10
			konversi.LastUpdate,            // @p11
			konversi.IDUpdater,             // @p12
			konversi.LastSync,              // @p13
			konversi.CreateDate,            // @p14
			konversi.IDCreator,             // @p15
			konversi.SoftDelete,            // @p16
		)
		if err != nil {
			return fmt.Errorf("failed to upsert konversi_akt_mhs id=%s: %w", konversi.IDKonversiAktivitas, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// UpsertKonversiAktMhs performs single record upsert for mbkm.konversi_akt_mhs
func (r *repository) UpsertKonversiAktMhs(ctx context.Context, konversi *KonversiAktMhs) error {
	query := `
		MERGE mbkm.konversi_akt_mhs AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_konversi_aktivitas) AS source
		ON target.id_konversi_aktivitas = source.id_konversi_aktivitas
		WHEN MATCHED THEN
			UPDATE SET
				id_mk = CAST(@p2 AS UNIQUEIDENTIFIER),
				id_ang_akt_mhs = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_smt = @p4,
				id_akt_mhs = CAST(@p5 AS UNIQUEIDENTIFIER),
				id_daftar_kampus_merdeka = @p6,
				nilai_angka = @p7,
				nilai_huruf = @p8,
				nilai_indeks = @p9,
				sks_mk = @p10,
				last_update = @p11,
				id_updater = @p12,
				last_sync = @p13
		WHEN NOT MATCHED THEN
			INSERT (
				id_konversi_aktivitas, id_mk, id_ang_akt_mhs, id_smt, id_akt_mhs,
				id_daftar_kampus_merdeka, nilai_angka, nilai_huruf, nilai_indeks, sks_mk,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), CAST(@p2 AS UNIQUEIDENTIFIER), CAST(@p3 AS UNIQUEIDENTIFIER), @p4, CAST(@p5 AS UNIQUEIDENTIFIER),
				@p6, @p7, @p8, @p9, @p10,
				@p14, @p15, @p11, @p12, @p16, @p13
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		konversi.IDKonversiAktivitas,   // @p1
		konversi.IDMK,                  // @p2
		konversi.IDAngAktMhs,           // @p3
		konversi.IDSmt,                 // @p4
		konversi.IDAktMhs,              // @p5
		konversi.IDDaftarKampusMerdeka, // @p6
		konversi.NilaiAngka,            // @p7
		konversi.NilaiHuruf,            // @p8
		konversi.NilaiIndeks,           // @p9
		konversi.SksMK,                 // @p10
		konversi.LastUpdate,            // @p11
		konversi.IDUpdater,             // @p12
		konversi.LastSync,              // @p13
		konversi.CreateDate,            // @p14
		konversi.IDCreator,             // @p15
		konversi.SoftDelete,            // @p16
	)
	return err
}

// UpsertEkuivTransfer performs single record upsert for mbkm.ekuiv_transfer
// IMPORTANT: Requires reg_pd (mahasiswa) data to be synced first for id_reg_pd FK
func (r *repository) UpsertEkuivTransfer(ctx context.Context, transfer *EkuivTransfer) error {
	// Convert pointer to string for nullable UUIDs
	var idAktMhs interface{} = nil
	if transfer.IDAktMhs != nil && *transfer.IDAktMhs != "" {
		idAktMhs = *transfer.IDAktMhs
	}

	var idSP interface{} = nil
	if transfer.IDSP != nil && *transfer.IDSP != "" {
		idSP = *transfer.IDSP
	}

	query := `
		MERGE mbkm.ekuiv_transfer AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_ekuivalensi) AS source
		ON target.id_ekuivalensi = source.id_ekuivalensi
		WHEN MATCHED THEN
			UPDATE SET
				id_akt_mhs = CASE WHEN @p2 IS NULL OR @p2 = '' THEN NULL ELSE TRY_CAST(@p2 AS UNIQUEIDENTIFIER) END,
				id_mk = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_smt = @p4,
				id_reg_pd = CAST(@p5 AS UNIQUEIDENTIFIER),
				kode_mk_asal = @p6,
				nm_mk_asal = @p7,
				sks_asal = @p8,
				sks_diakui = @p9,
				nilai_huruf_asal = @p10,
				nilai_huruf_diakui = @p11,
				nilai_angka_diakui = @p12,
				id_sp = CASE WHEN @p13 IS NULL OR @p13 = '' THEN NULL ELSE TRY_CAST(@p13 AS UNIQUEIDENTIFIER) END,
				last_update = @p14,
				id_updater = @p15,
				last_sync = @p16
		WHEN NOT MATCHED THEN
			INSERT (
				id_ekuivalensi, id_akt_mhs, id_mk, id_smt, id_reg_pd,
				kode_mk_asal, nm_mk_asal, sks_asal, sks_diakui,
				nilai_huruf_asal, nilai_huruf_diakui, nilai_angka_diakui, id_sp,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER),
				CASE WHEN @p2 IS NULL OR @p2 = '' THEN NULL ELSE TRY_CAST(@p2 AS UNIQUEIDENTIFIER) END,
				CAST(@p3 AS UNIQUEIDENTIFIER),
				@p4,
				CAST(@p5 AS UNIQUEIDENTIFIER),
				@p6, @p7, @p8, @p9,
				@p10, @p11, @p12,
				CASE WHEN @p13 IS NULL OR @p13 = '' THEN NULL ELSE TRY_CAST(@p13 AS UNIQUEIDENTIFIER) END,
				@p17, @p18, @p14, @p15, @p19, @p16
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		transfer.IDEkuivalensi, // @p1
		idAktMhs,               // @p2 - nullable
		transfer.IDMK,          // @p3
		transfer.IDSmt,         // @p4
		transfer.IDRegPD,       // @p5 - requires reg_pd to exist
		transfer.KodeMKAsal,    // @p6
		transfer.NmMKAsal,      // @p7
		transfer.SksAsal,       // @p8
		transfer.SksDiakui,     // @p9
		transfer.NilaiHurufAsal,   // @p10
		transfer.NilaiHurufDiakui, // @p11
		transfer.NilaiAngkaDiakui, // @p12
		idSP,                   // @p13 - nullable
		transfer.LastUpdate,    // @p14
		transfer.IDUpdater,     // @p15
		transfer.LastSync,      // @p16
		transfer.CreateDate,    // @p17
		transfer.IDCreator,     // @p18
		transfer.SoftDelete,    // @p19
	)
	return err
}

// BulkUpsertEkuivTransfer performs bulk upsert for mbkm.ekuiv_transfer
func (r *repository) BulkUpsertEkuivTransfer(ctx context.Context, data []*EkuivTransfer) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// SQL Server MERGE query for upsert
	// PK: id_ekuivalensi
	// Note: id_akt_mhs is nullable - use CASE WHEN to handle null properly and avoid FK constraint
	query := `
		MERGE mbkm.ekuiv_transfer AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_ekuivalensi) AS source
		ON target.id_ekuivalensi = source.id_ekuivalensi
		WHEN MATCHED THEN
			UPDATE SET
				id_akt_mhs = CASE WHEN @p2 IS NULL OR @p2 = '' THEN NULL ELSE TRY_CAST(@p2 AS UNIQUEIDENTIFIER) END,
				id_mk = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_smt = @p4,
				id_reg_pd = CAST(@p5 AS UNIQUEIDENTIFIER),
				kode_mk_asal = @p6,
				nm_mk_asal = @p7,
				sks_asal = @p8,
				sks_diakui = @p9,
				nilai_huruf_asal = @p10,
				nilai_huruf_diakui = @p11,
				nilai_angka_diakui = @p12,
				id_sp = CASE WHEN @p13 IS NULL OR @p13 = '' THEN NULL ELSE TRY_CAST(@p13 AS UNIQUEIDENTIFIER) END,
				last_update = @p14,
				id_updater = @p15,
				last_sync = @p16
		WHEN NOT MATCHED THEN
			INSERT (
				id_ekuivalensi, id_akt_mhs, id_mk, id_smt, id_reg_pd,
				kode_mk_asal, nm_mk_asal, sks_asal, sks_diakui,
				nilai_huruf_asal, nilai_huruf_diakui, nilai_angka_diakui, id_sp,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER),
				CASE WHEN @p2 IS NULL OR @p2 = '' THEN NULL ELSE TRY_CAST(@p2 AS UNIQUEIDENTIFIER) END,
				CAST(@p3 AS UNIQUEIDENTIFIER), @p4, CAST(@p5 AS UNIQUEIDENTIFIER),
				@p6, @p7, @p8, @p9,
				@p10, @p11, @p12,
				CASE WHEN @p13 IS NULL OR @p13 = '' THEN NULL ELSE TRY_CAST(@p13 AS UNIQUEIDENTIFIER) END,
				@p17, @p18, @p14, @p15, @p19, @p16
			);
	`

	successCount := 0
	failCount := 0

	for _, transfer := range data {
		// Convert pointer to string for nullable UUIDs
		var idAktMhs interface{} = nil
		if transfer.IDAktMhs != nil && *transfer.IDAktMhs != "" {
			idAktMhs = *transfer.IDAktMhs
		}

		var idSP interface{} = nil
		if transfer.IDSP != nil && *transfer.IDSP != "" {
			idSP = *transfer.IDSP
		}

		_, err = tx.ExecContext(ctx, query,
			transfer.IDEkuivalensi, // @p1
			idAktMhs,               // @p2 - nullable
			transfer.IDMK,          // @p3
			transfer.IDSmt,         // @p4
			transfer.IDRegPD,       // @p5
			transfer.KodeMKAsal,    // @p6
			transfer.NmMKAsal,      // @p7
			transfer.SksAsal,       // @p8
			transfer.SksDiakui,     // @p9
			transfer.NilaiHurufAsal,   // @p10
			transfer.NilaiHurufDiakui, // @p11
			transfer.NilaiAngkaDiakui, // @p12
			idSP,                   // @p13 - nullable
			transfer.LastUpdate,    // @p14
			transfer.IDUpdater,     // @p15
			transfer.LastSync,      // @p16
			transfer.CreateDate,    // @p17
			transfer.IDCreator,     // @p18
			transfer.SoftDelete,    // @p19
		)
		if err != nil {
			failCount++
			// Log but continue with other records
			fmt.Printf("⚠️  [EkuivTransfer] Failed id=%s: %v\n", transfer.IDEkuivalensi, err)
			continue
		}
		successCount++
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	if failCount > 0 {
		fmt.Printf("📊 [EkuivTransfer] Completed: %d success, %d failed\n", successCount, failCount)
	}

	return nil
}

// GetNilaiKonversiList retrieves paginated list of nilai konversi (combined view)
func (r *repository) GetNilaiKonversiList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, jenisKonversi *string, sortBy, sortOrder string) (*PaginatedResponse, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions for both queries
	konversiConditions := []string{"k.soft_delete = 0"}
	transferConditions := []string{"t.soft_delete = 0"}
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
		semesterFilter := fmt.Sprintf("(%s)", strings.Join(placeholders, ","))
		konversiConditions = append(konversiConditions, fmt.Sprintf("k.id_smt IN %s", semesterFilter))
		transferConditions = append(transferConditions, fmt.Sprintf("t.id_smt IN %s", semesterFilter))
	}

	// Filter by prodi
	if idProdi != nil && *idProdi != "" {
		konversiConditions = append(konversiConditions, fmt.Sprintf("CAST(sms_k.id_sms AS VARCHAR(50)) = @p%d", paramIndex))
		transferConditions = append(transferConditions, fmt.Sprintf("CAST(sms_t.id_sms AS VARCHAR(50)) = @p%d", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Search filter
	searchParamIdx := 0
	if search != "" {
		searchPattern := "%" + search + "%"
		searchParamIdx = paramIndex
		args = append(args, searchPattern)
		paramIndex++
	}

	konversiWhere := strings.Join(konversiConditions, " AND ")
	transferWhere := strings.Join(transferConditions, " AND ")

	// Add search to WHERE clauses
	if search != "" {
		konversiWhere += fmt.Sprintf(" AND (rpd_k.nipd LIKE @p%d OR p_k.nm_pd LIKE @p%d OR m_k.nm_mk LIKE @p%d)", searchParamIdx, searchParamIdx, searchParamIdx)
		transferWhere += fmt.Sprintf(" AND (rpd_t.nipd LIKE @p%d OR p_t.nm_pd LIKE @p%d OR m_t.nm_mk LIKE @p%d OR t.kode_mk_asal LIKE @p%d OR t.nm_mk_asal LIKE @p%d)", searchParamIdx, searchParamIdx, searchParamIdx, searchParamIdx, searchParamIdx)
	}

	// Build ORDER BY clause
	orderByClause := "last_sync DESC"
	if sortBy != "" {
		order := "DESC"
		if sortOrder == "asc" {
			order = "ASC"
		}
		// Map frontend column keys to database columns
		columnMap := map[string]string{
			"nim":            "nim",
			"nama_mahasiswa": "nama_mahasiswa",
			"nama_mk":        "nama_mk",
			"nilai_huruf":    "nilai_huruf",
			"nilai_angka":    "nilai_angka",
			"jenis_konversi": "jenis_konversi",
			"last_sync":      "last_sync",
			"id_semester":    "id_semester",
		}
		if dbColumn, ok := columnMap[sortBy]; ok {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	// Filter by jenis_konversi (only one type)
	includeKonversi := true
	includeTransfer := true
	if jenisKonversi != nil && *jenisKonversi != "" {
		if *jenisKonversi == "konversi" {
			includeTransfer = false
		} else if *jenisKonversi == "transfer" {
			includeKonversi = false
		}
	}

	// Build UNION query for combined view
	var unionParts []string

	if includeKonversi {
		konversiQuery := fmt.Sprintf(`
			SELECT
				CAST(k.id_konversi_aktivitas AS VARCHAR(50)) AS id,
				'konversi' AS jenis_konversi,
				CAST(aam.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
				rpd_k.nipd AS nim,
				p_k.nm_pd AS nama_mahasiswa,
				sms_k.nm_lemb AS nama_prodi,
				didik_k.nm_jenj_didik AS nama_jenjang,
				CAST(k.id_mk AS VARCHAR(50)) AS id_mk,
				m_k.kode_mk AS kode_mk,
				m_k.nm_mk AS nama_mk,
				k.sks_mk,
				k.nilai_angka,
				k.nilai_huruf,
				k.nilai_indeks,
				NULL AS kode_mk_asal,
				NULL AS nama_mk_asal,
				NULL AS sks_asal,
				NULL AS nilai_huruf_asal,
				NULL AS nama_pt_asal,
				k.id_smt AS id_semester,
				sem_k.nm_smt AS nama_semester,
				CAST(k.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
				ja_k.nm_jns_akt_mhs AS nama_aktivitas,
				k.last_sync
			FROM mbkm.konversi_akt_mhs AS k WITH(NOLOCK)
			LEFT JOIN pdrd.anggota_akt_mhs AS aam WITH(NOLOCK) ON aam.id_ang_akt_mhs = k.id_ang_akt_mhs AND aam.soft_delete = 0
			LEFT JOIN pdrd.reg_pd AS rpd_k WITH(NOLOCK) ON rpd_k.id_reg_pd = aam.id_reg_pd AND rpd_k.soft_delete = 0
			LEFT JOIN pdrd.peserta_didik AS p_k WITH(NOLOCK) ON p_k.id_pd = rpd_k.id_pd AND p_k.soft_delete = 0
			LEFT JOIN pdrd.sms AS sms_k WITH(NOLOCK) ON sms_k.id_sms = rpd_k.id_sms AND sms_k.soft_delete = 0
			LEFT JOIN ref.jenjang_pendidikan AS didik_k WITH(NOLOCK) ON didik_k.id_jenj_didik = sms_k.id_jenj_didik AND didik_k.expired_date IS NULL
			LEFT JOIN pdrd.matkul AS m_k WITH(NOLOCK) ON m_k.id_mk = k.id_mk AND m_k.soft_delete = 0
			LEFT JOIN ref.semester AS sem_k WITH(NOLOCK) ON sem_k.id_smt = k.id_smt
			LEFT JOIN pdrd.akt_mhs AS akt_k WITH(NOLOCK) ON akt_k.id_akt_mhs = k.id_akt_mhs AND akt_k.soft_delete = 0
			LEFT JOIN ref.jenis_akt_mhs AS ja_k WITH(NOLOCK) ON ja_k.id_jns_akt_mhs = akt_k.id_jns_akt_mhs
			WHERE %s
		`, konversiWhere)
		unionParts = append(unionParts, konversiQuery)
	}

	if includeTransfer {
		transferQuery := fmt.Sprintf(`
			SELECT
				CAST(t.id_ekuivalensi AS VARCHAR(50)) AS id,
				'transfer' AS jenis_konversi,
				CAST(t.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
				rpd_t.nipd AS nim,
				p_t.nm_pd AS nama_mahasiswa,
				sms_t.nm_lemb AS nama_prodi,
				didik_t.nm_jenj_didik AS nama_jenjang,
				CAST(t.id_mk AS VARCHAR(50)) AS id_mk,
				m_t.kode_mk AS kode_mk,
				m_t.nm_mk AS nama_mk,
				CAST(t.sks_diakui AS FLOAT) AS sks_mk,
				t.nilai_angka_diakui AS nilai_angka,
				t.nilai_huruf_diakui AS nilai_huruf,
				NULL AS nilai_indeks,
				t.kode_mk_asal,
				t.nm_mk_asal AS nama_mk_asal,
				t.sks_asal,
				t.nilai_huruf_asal,
				NULL AS nama_pt_asal,
				t.id_smt AS id_semester,
				sem_t.nm_smt AS nama_semester,
				CAST(t.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
				ja_t.nm_jns_akt_mhs AS nama_aktivitas,
				t.last_sync
			FROM mbkm.ekuiv_transfer AS t WITH(NOLOCK)
			LEFT JOIN pdrd.reg_pd AS rpd_t WITH(NOLOCK) ON rpd_t.id_reg_pd = t.id_reg_pd AND rpd_t.soft_delete = 0
			LEFT JOIN pdrd.peserta_didik AS p_t WITH(NOLOCK) ON p_t.id_pd = rpd_t.id_pd AND p_t.soft_delete = 0
			LEFT JOIN pdrd.sms AS sms_t WITH(NOLOCK) ON sms_t.id_sms = rpd_t.id_sms AND sms_t.soft_delete = 0
			LEFT JOIN ref.jenjang_pendidikan AS didik_t WITH(NOLOCK) ON didik_t.id_jenj_didik = sms_t.id_jenj_didik AND didik_t.expired_date IS NULL
			LEFT JOIN pdrd.matkul AS m_t WITH(NOLOCK) ON m_t.id_mk = t.id_mk AND m_t.soft_delete = 0
			LEFT JOIN ref.semester AS sem_t WITH(NOLOCK) ON sem_t.id_smt = t.id_smt
			LEFT JOIN pdrd.akt_mhs AS akt_t WITH(NOLOCK) ON akt_t.id_akt_mhs = t.id_akt_mhs AND akt_t.soft_delete = 0
			LEFT JOIN ref.jenis_akt_mhs AS ja_t WITH(NOLOCK) ON ja_t.id_jns_akt_mhs = akt_t.id_jns_akt_mhs
			WHERE %s
		`, transferWhere)
		unionParts = append(unionParts, transferQuery)
	}

	if len(unionParts) == 0 {
		return &PaginatedResponse{
			Data:  []*NilaiKonversiListItem{},
			Total: 0,
			Page:  page,
			Limit: limit,
		}, nil
	}

	unionQuery := strings.Join(unionParts, " UNION ALL ")

	// Count query
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM (%s) AS combined`, unionQuery)

	// Data query with pagination
	dataQuery := fmt.Sprintf(`
		SELECT * FROM (%s) AS combined
		ORDER BY %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, unionQuery, orderByClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)

	// Execute COUNT and SELECT in parallel
	type countResult struct {
		total int
		err   error
	}
	type dataResult struct {
		data []*NilaiKonversiListItem
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
		var nilaiList []*NilaiKonversiListItem
		err := r.db.SelectContext(ctx, &nilaiList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: nilaiList, err: err}
	}()

	countRes := <-countChan
	dataRes := <-dataChan

	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count nilai konversi: %w", countRes.err)
	}

	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get nilai konversi list: %w", dataRes.err)
	}

	// Convert last_sync to WIB
	for _, nilai := range dataRes.data {
		nilai.LastSync = convertToWIB(nilai.LastSync)
	}

	return &PaginatedResponse{
		Data:  dataRes.data,
		Total: countRes.total,
		Page:  page,
		Limit: limit,
	}, nil
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
			"id_sms":        idSMS,
			"nama_prodi":    namaProdi,
			"kode_prodi":    kodeProdi,
			"nm_jenj_didik": nmJenjDidik,
		})
	}

	return prodiList, nil
}

// GetSemesterList retrieves list of semesters that have konversi or transfer data
func (r *repository) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT DISTINCT
			sem.id_smt,
			sem.nm_smt,
			sem.a_periode_aktif
		FROM ref.semester AS sem WITH(NOLOCK)
		WHERE sem.expired_date IS NULL
			AND (
				EXISTS (
					SELECT 1 FROM mbkm.konversi_akt_mhs k WITH(NOLOCK)
					WHERE k.id_smt = sem.id_smt AND k.soft_delete = 0
				)
				OR EXISTS (
					SELECT 1 FROM mbkm.ekuiv_transfer t WITH(NOLOCK)
					WHERE t.id_smt = sem.id_smt AND t.soft_delete = 0
				)
			)
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

// GetStats retrieves nilai konversi statistics
func (r *repository) GetStats(ctx context.Context) (*NilaiKonversiStats, error) {
	stats := &NilaiKonversiStats{}

	// Get total konversi
	err := r.db.GetContext(ctx, &stats.TotalKonversi, `
		SELECT COUNT(*)
		FROM mbkm.konversi_akt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total konversi: %w", err)
	}

	// Get total transfer
	err = r.db.GetContext(ctx, &stats.TotalTransfer, `
		SELECT COUNT(*)
		FROM mbkm.ekuiv_transfer WITH(NOLOCK)
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total transfer: %w", err)
	}

	// Get total unique mahasiswa (from both tables)
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(DISTINCT id_reg_pd) FROM (
			SELECT aam.id_reg_pd
			FROM mbkm.konversi_akt_mhs k WITH(NOLOCK)
			LEFT JOIN pdrd.anggota_akt_mhs aam WITH(NOLOCK) ON aam.id_ang_akt_mhs = k.id_ang_akt_mhs
			WHERE k.soft_delete = 0
			UNION
			SELECT t.id_reg_pd
			FROM mbkm.ekuiv_transfer t WITH(NOLOCK)
			WHERE t.soft_delete = 0
		) AS combined
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Get total unique prodi (from both tables)
	err = r.db.GetContext(ctx, &stats.TotalProdi, `
		SELECT COUNT(DISTINCT id_sms) FROM (
			SELECT rpd.id_sms
			FROM mbkm.konversi_akt_mhs k WITH(NOLOCK)
			LEFT JOIN pdrd.anggota_akt_mhs aam WITH(NOLOCK) ON aam.id_ang_akt_mhs = k.id_ang_akt_mhs
			LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = aam.id_reg_pd
			WHERE k.soft_delete = 0
			UNION
			SELECT rpd.id_sms
			FROM mbkm.ekuiv_transfer t WITH(NOLOCK)
			LEFT JOIN pdrd.reg_pd rpd WITH(NOLOCK) ON rpd.id_reg_pd = t.id_reg_pd
			WHERE t.soft_delete = 0
		) AS combined
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total prodi: %w", err)
	}

	// Get last sync timestamp (most recent from both tables)
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM (
			SELECT TOP 1 last_sync FROM mbkm.konversi_akt_mhs WITH(NOLOCK) WHERE soft_delete = 0 ORDER BY last_sync DESC
			UNION ALL
			SELECT TOP 1 last_sync FROM mbkm.ekuiv_transfer WITH(NOLOCK) WHERE soft_delete = 0 ORDER BY last_sync DESC
		) AS combined
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
