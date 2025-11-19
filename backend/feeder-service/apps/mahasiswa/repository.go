package mahasiswa

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for mahasiswa data access
type Repository interface {
	// Bulk operations
	BulkUpsertPesertaDidik(ctx context.Context, data []*PesertaDidik) error
	BulkUpsertRegPd(ctx context.Context, data []*RegPd) error
	BulkUpsertKuliahMhs(ctx context.Context, data []*KuliahMhs) error

	// List operations with filters
	GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string) (*MahasiswaListResult, error)
	GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error)
	GetRegPdByID(ctx context.Context, idRegPd string) (*RegPd, error)

	// Statistics
	GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error)

	// Utility - Get available angkatan list
	GetAngkatanList(ctx context.Context) ([]string, error)

	// Utility - Get prodi list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)

	// Reference cache for validation
	GetReferenceCache(ctx context.Context) (*ReferenceCache, error)

	// Sync log operations
	CheckOrCreateSyncLog(ctx context.Context, idSms, angkatan string) error
	UpdateSyncLogProgress(ctx context.Context, idSms, angkatan string, totalMhs, berhasil, gagal int) error
	CompleteSyncLog(ctx context.Context, idSms, angkatan string) error

	// Get sync logs with filtering
	GetSyncLogs(ctx context.Context, page, limit int, search, angkatan string, status *string) (*SyncLogListResult, error)
	GetSyncLogStats(ctx context.Context) (map[string]interface{}, error)
}

// ReferenceCache holds reference data for lookup and validation
type ReferenceCache struct {
	JenisDaftar     map[int]string    // id_jns_daftar -> nama
	JalurDaftar     map[int]string    // id_jalur_daftar -> nama
	StatusMahasiswa map[string]string // id_stat_mhs -> nama
	JenisKeluar     map[int]string    // id_jns_keluar -> nama
	Agama           map[int]string    // id_agama -> nama
	Wilayah         map[string]string // id_wil -> nama
}

// repository implementation
type repository struct {
	db    *sqlx.DB
	cache *ReferenceCache
}

// NewRepository creates a new mahasiswa repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// BulkUpsertPesertaDidik performs bulk upsert for peserta_didik
func (r *repository) BulkUpsertPesertaDidik(ctx context.Context, data []*PesertaDidik) error {
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
		MERGE pdrd.peserta_didik AS target
		USING (SELECT @p1 AS id_pd) AS source
		ON target.id_pd = source.id_pd
		WHEN MATCHED THEN
			UPDATE SET
				nm_pd = @p2,
				jk = @p3,
				nisn = @p4,
				nik = @p5,
				tmpt_lahir = @p6,
				tgl_lahir = @p7,
				jln = @p8,
				rt = @p9,
				rw = @p10,
				nm_dsn = @p11,
				ds_kel = @p12,
				kode_pos = @p13,
				tlpn_rumah = @p14,
				tlpn_hp = @p15,
				email = @p16,
				nm_wali = @p17,
				tgl_lahir_wali = @p18,
				id_pekerjaan_wali = @p19,
				id_penghasilan_wali = @p20,
				id_pendidikan_wali = @p21,
				nm_ibu_kandung = @p22,
				tgl_lahir_ibu = @p23,
				nik_ibu = @p24,
				id_pekerjaan_ibu = @p25,
				id_penghasilan_ibu = @p26,
				id_pendidikan_ibu = @p27,
				id_kk_ibu = @p28,
				nm_ayah = @p29,
				tgl_lahir_ayah = @p30,
				nik_ayah = @p31,
				id_pekerjaan_ayah = @p32,
				id_penghasilan_ayah = @p33,
				id_pendidikan_ayah = @p34,
				id_kk_ayah = @p35,
				a_terima_kps = @p36,
				no_kps = @p37,
				id_kk = @p38,
				id_alat_transport = @p39,
				id_kewarganegaraan = @p40,
				id_agama = @p41,
				id_jns_tinggal = @p42,
				id_wil = @p43,
				id_stat_mhs = @p44,
				last_update = @p45,
				id_updater = @p49,
				last_sync = @p46
		WHEN NOT MATCHED THEN
			INSERT (
				id_pd, nm_pd, jk, nisn, nik, tmpt_lahir, tgl_lahir,
				jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, email,
				nm_wali, tgl_lahir_wali, id_pekerjaan_wali, id_penghasilan_wali, id_pendidikan_wali,
				nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_pendidikan_ibu, id_kk_ibu,
				nm_ayah, tgl_lahir_ayah, nik_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_pendidikan_ayah, id_kk_ayah,
				a_terima_kps, no_kps, id_kk, id_alat_transport,
				id_kewarganegaraan, id_agama, id_jns_tinggal, id_wil, id_stat_mhs,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6, @p7,
				@p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16,
				@p17, @p18, @p19, @p20, @p21,
				@p22, @p23, @p24, @p25, @p26, @p27, @p28,
				@p29, @p30, @p31, @p32, @p33, @p34, @p35,
				@p36, @p37, @p38, @p39,
				@p40, @p41, @p42, @p43, @p44,
				@p47, @p48, @p45, @p49, @p50, @p46
			);
	`

	for _, pd := range data {
		_, err = tx.ExecContext(ctx, query,
			pd.IDPD,              // @p1
			pd.NamaPD,            // @p2
			pd.JK,                // @p3
			pd.NISN,              // @p4
			pd.NIK,               // @p5
			pd.TempatLahir,       // @p6
			pd.TglLahir,          // @p7
			pd.Jalan,             // @p8
			pd.RT,                // @p9
			pd.RW,                // @p10
			pd.NamaDusun,         // @p11
			pd.Kelurahan,         // @p12
			pd.KodePos,           // @p13
			pd.TeleponRumah,      // @p14
			pd.TeleponHP,         // @p15
			pd.Email,             // @p16
			pd.NamaWali,          // @p17
			pd.TglLahirWali,      // @p18
			pd.IDPekerjaanWali,   // @p19
			pd.IDPenghasilanWali, // @p20
			pd.IDPendidikanWali,  // @p21
			pd.NamaIbu,           // @p22
			pd.TglLahirIbu,       // @p23
			pd.NIKIbu,            // @p24
			pd.IDPekerjaanIbu,    // @p25
			pd.IDPenghasilanIbu,  // @p26
			pd.IDPendidikanIbu,   // @p27
			pd.IDKKIbu,           // @p28
			pd.NamaAyah,          // @p29
			pd.TglLahirAyah,      // @p30
			pd.NIKAyah,           // @p31
			pd.IDPekerjaanAyah,   // @p32
			pd.IDPenghasilanAyah, // @p33
			pd.IDPendidikanAyah,  // @p34
			pd.IDKKAyah,          // @p35
			pd.ATerimaKPS,        // @p36
			pd.NoKPS,             // @p37
			pd.IDKK,              // @p38
			pd.IDAlatTransport,   // @p39
			pd.IDKewarganegaraan, // @p40
			pd.IDAgama,           // @p41
			pd.IDJenisTinggal,    // @p42
			pd.IDWilayah,         // @p43
			pd.IDStatMhs,         // @p44
			pd.LastUpdate,        // @p45 - for UPDATE
			pd.LastSync,          // @p46 - for both
			pd.CreateDate,        // @p47 - for INSERT
			pd.IDCreator,         // @p48 - for INSERT
			pd.IDUpdater,         // @p49 - for INSERT
			pd.SoftDelete,        // @p50 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert peserta_didik %s: %w", pd.IDPD, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertRegPd performs bulk upsert for reg_pd
func (r *repository) BulkUpsertRegPd(ctx context.Context, data []*RegPd) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.reg_pd AS target
		USING (SELECT @p1 AS id_reg_pd) AS source
		ON target.id_reg_pd = source.id_reg_pd
		WHEN MATCHED THEN
			UPDATE SET
				id_sms = @p2,
				id_jns_daftar = @p3,
				id_jalur_daftar = @p4,
				id_pembiayaan = @p5,
				id_jns_keluar = @p6,
				nipd = @p7,
				tgl_masuk_sp = @p8,
				sks_diakui = @p9,
				id_pt_asal = @p10,
				nm_pt_asal = @p11,
				id_prodi_asal = @p12,
				nm_prodi_asal = @p13,
				tgl_keluar = @p14,
				ket = @p15,
				sk_yudisium = @p16,
				tgl_sk_yudisium = @p17,
				ipk = @p18,
				no_seri_ijazah = @p19,
				jalur_skripsi = @p20,
				judul_skripsi = @p21,
				bln_awal_bimbingan = @p22,
				bln_akhir_bimbingan = @p23,
				asal_data_ijazah = @p24,
				last_update = @p25,
				id_updater = @p32,
				last_sync = @p26
		WHEN NOT MATCHED THEN
			INSERT (
				id_reg_pd, id_sp, id_sms, id_pd,
				id_jns_daftar, id_jalur_daftar, id_pembiayaan, id_semester_masuk, id_jns_keluar,
				nipd, tgl_masuk_sp, sks_diakui,
				id_pt_asal, nm_pt_asal, id_prodi_asal, nm_prodi_asal,
				tgl_keluar, ket, sk_yudisium, tgl_sk_yudisium, ipk, no_seri_ijazah,
				jalur_skripsi, judul_skripsi, bln_awal_bimbingan, bln_akhir_bimbingan, asal_data_ijazah,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p27, @p2, @p28,
				@p3, @p4, @p5, @p29, @p6,
				@p7, @p8, @p9,
				@p10, @p11, @p12, @p13,
				@p14, @p15, @p16, @p17, @p18, @p19,
				@p20, @p21, @p22, @p23, @p24,
				@p30, @p31, @p25, @p32, @p33, @p26
			);
	`

	for _, reg := range data {
		// Set defaults for required NOT NULL fields
		idJnsDaftar := 1
		if reg.IDJenisDaftar != nil {
			idJnsDaftar = *reg.IDJenisDaftar
		}

		idJalurDaftar := 5
		if reg.IDJalurDaftar != nil {
			idJalurDaftar = *reg.IDJalurDaftar
		}

		idPembiayaan := 1
		if reg.IDPembiayaan != nil {
			idPembiayaan = *reg.IDPembiayaan
		}

		asalDataIjazah := 0
		if reg.AsalDataIjazah != nil {
			asalDataIjazah = *reg.AsalDataIjazah
		}

		_, err = tx.ExecContext(ctx, query,
			reg.IDRegPd,           // @p1
			reg.IDSMS,             // @p2
			idJnsDaftar,           // @p3
			idJalurDaftar,         // @p4
			idPembiayaan,          // @p5
			reg.IDJenisKeluar,     // @p6
			reg.NIPD,              // @p7
			reg.TglMasukSP,        // @p8
			reg.SKSDiakui,         // @p9
			reg.IDPTAsal,          // @p10
			reg.NamaPTAsal,        // @p11
			reg.IDProdiAsal,       // @p12
			reg.NamaProdiAsal,     // @p13
			reg.TglKeluar,         // @p14
			reg.Keterangan,        // @p15
			reg.SKYudisium,        // @p16
			reg.TglSKYudisium,     // @p17
			reg.IPK,               // @p18
			reg.NoSeriIjazah,      // @p19
			reg.JalurSkripsi,      // @p20
			reg.JudulSkripsi,      // @p21
			reg.BlnAwalBimbingan,  // @p22
			reg.BlnAkhirBimbingan, // @p23
			asalDataIjazah,        // @p24
			reg.LastUpdate,        // @p25 - for UPDATE
			reg.LastSync,          // @p26 - for both
			reg.IDSP,              // @p27 - for INSERT
			reg.IDPD,              // @p28 - for INSERT
			reg.IDSemesterMasuk,   // @p29 - for INSERT
			reg.CreateDate,        // @p30 - for INSERT
			reg.IDCreator,         // @p31 - for INSERT
			reg.IDUpdater,         // @p32 - for INSERT
			reg.SoftDelete,        // @p33 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert reg_pd %s: %w", reg.IDRegPd, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertKuliahMhs performs bulk upsert for kuliah_mhs
func (r *repository) BulkUpsertKuliahMhs(ctx context.Context, data []*KuliahMhs) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.kuliah_mhs AS target
		USING (SELECT @p1 AS id_reg_pd, @p2 AS id_smt) AS source
		ON target.id_reg_pd = source.id_reg_pd AND target.id_smt = source.id_smt
		WHEN MATCHED THEN
			UPDATE SET
				id_stat_mhs = @p3,
				ips = @p4,
				ipk = @p5,
				sks_semester = @p6,
				total_sks = @p7,
				biaya_smt = @p8,
				last_update = @p9,
				id_updater = @p13,
				last_sync = @p10
		WHEN NOT MATCHED THEN
			INSERT (
				id_reg_pd, id_smt, id_stat_mhs, ips, ipk, sks_semester, total_sks, biaya_smt,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8,
				@p11, @p12, @p9, @p13, @p14, @p10
			);
	`

	for _, kuliah := range data {
		_, err = tx.ExecContext(ctx, query,
			kuliah.IDRegPd,       // @p1
			kuliah.IDSmt,         // @p2
			kuliah.IDStatMhs,     // @p3
			kuliah.IPS,           // @p4
			kuliah.IPK,           // @p5
			kuliah.SKSSemester,   // @p6
			kuliah.TotalSKS,      // @p7
			kuliah.BiayaSemester, // @p8
			kuliah.LastUpdate,    // @p9
			kuliah.LastSync,      // @p10
			kuliah.CreateDate,    // @p11 - for INSERT
			kuliah.IDCreator,     // @p12 - for INSERT
			kuliah.IDUpdater,     // @p13 - for INSERT
			kuliah.SoftDelete,    // @p14 - for INSERT
		)
		if err != nil {
			return fmt.Errorf("failed to upsert kuliah_mhs %s-%s: %w", kuliah.IDRegPd, kuliah.IDSmt, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetMahasiswaList retrieves paginated list of mahasiswa with filters
func (r *repository) GetMahasiswaList(ctx context.Context, page, limit int, search string, angkatan []string, idProdi *string) (*MahasiswaListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	// Note: reg.soft_delete = 0 is already filtered in filtered_reg_pd CTE
	whereConditions := []string{"pd.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Angkatan filter (WAJIB)
	if len(angkatan) > 0 {
		placeholders := make([]string, len(angkatan))
		for i, ang := range angkatan {
			placeholders[i] = fmt.Sprintf("@p%d", paramIndex)
			args = append(args, ang)
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("(LEFT(reg.id_semester_masuk, 4) IN (%s))", strings.Join(placeholders, ",")))
	}

	// Prodi filter (Optional)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("reg.id_sms = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Search filter
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(pd.nm_pd LIKE @p%d OR reg.nipd LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// ============================================================================
	// PARALLEL EXECUTION with Goroutines
	// Execute COUNT and SELECT queries concurrently for better performance
	// ============================================================================

	// Count total query
	// Use filtered_reg_pd CTE for consistency (already filtered soft_delete = 0)
	// Include all columns needed for WHERE clause filters (search, angkatan, prodi)
	countQuery := fmt.Sprintf(`
		WITH filtered_reg_pd AS (
			SELECT id_reg_pd, id_pd, id_semester_masuk, id_sms, nipd
			FROM pdrd.reg_pd
			WHERE soft_delete = 0
		)
		SELECT COUNT(*)
		FROM pdrd.peserta_didik AS pd
		INNER JOIN filtered_reg_pd AS reg ON reg.id_pd = pd.id_pd
		WHERE %s
	`, whereClause)

	// Get paginated data with optimized CTE (Common Table Expression)
	// This avoids expensive correlated subquery by pre-computing semester counts
	// Performance: O(n) instead of O(n*m) where n=students, m=avg kuliah_mhs per student
	dataQuery := fmt.Sprintf(`
		WITH filtered_reg_pd AS (
			-- First, filter reg_pd to reduce dataset early
			SELECT
				reg.id_reg_pd,
				reg.id_pd,
				reg.nipd,
				reg.id_semester_masuk,
				reg.id_jalur_daftar,
				reg.id_jns_daftar,
				reg.id_sms,
				reg.id_jns_keluar
			FROM pdrd.reg_pd AS reg
			WHERE reg.soft_delete = 0
		),
		semester_counts AS (
			-- Pre-compute semester counts using GROUP BY (much faster than correlated subquery)
			SELECT
				kmh.id_reg_pd,
				COUNT(*) AS semester_sekarang
			FROM pdrd.kuliah_mhs kmh
			INNER JOIN filtered_reg_pd freg ON freg.id_reg_pd = kmh.id_reg_pd
			WHERE kmh.soft_delete = 0
				AND RIGHT(kmh.id_smt, 1) != '3'
			GROUP BY kmh.id_reg_pd
		)
		SELECT
			CAST(pd.id_pd AS VARCHAR(50)) AS id_pd,
			pd.nm_pd AS nama,
			reg.nipd AS npm,
			LEFT(reg.id_semester_masuk, 4) AS angkatan,
			jd.nm_jalur_daftar AS jalur_masuk,
			jdf.nm_jns_daftar AS jenis_pendaftaran,
			COALESCE(sc.semester_sekarang, 0) AS semester_sekarang,
			-- Prioritas status: jika id_jns_keluar ada, tampilkan jenis_keluar; jika tidak, tampilkan status_mahasiswa
			CASE
				WHEN reg.id_jns_keluar IS NOT NULL THEN jk.ket_keluar
				ELSE sm.nm_stat_mhs
			END AS status_mahasiswa,
			jk.ket_keluar AS jenis_keluar,
			pd.last_sync,
			CAST(reg.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang
		FROM pdrd.peserta_didik AS pd
		INNER JOIN filtered_reg_pd AS reg ON reg.id_pd = pd.id_pd
		LEFT JOIN ref.jalur_daftar AS jd ON jd.id_jalur_daftar = reg.id_jalur_daftar
		LEFT JOIN ref.jenis_pendaftaran AS jdf ON jdf.id_jns_daftar = reg.id_jns_daftar
		LEFT JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN pdrd.kuliah_mhs AS kmh_aktif ON kmh_aktif.id_reg_pd = reg.id_reg_pd AND kmh_aktif.soft_delete = 0 AND kmh_aktif.id_smt = '20251'
		LEFT JOIN ref.status_mahasiswa AS sm ON sm.id_stat_mhs = COALESCE(kmh_aktif.id_stat_mhs, pd.id_stat_mhs)
		LEFT JOIN ref.jenis_keluar AS jk ON jk.id_jns_keluar = reg.id_jns_keluar
		LEFT JOIN semester_counts sc ON sc.id_reg_pd = reg.id_reg_pd
		WHERE %s
		ORDER BY pd.nm_pd ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

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
		data []*MahasiswaListItem
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
		var mahasiswaList []*MahasiswaListItem
		err := r.db.SelectContext(ctx, &mahasiswaList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: mahasiswaList, err: err}
	}()

	// Wait for both goroutines to complete
	countRes := <-countChan
	dataRes := <-dataChan

	// Check errors
	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count mahasiswa: %w", countRes.err)
	}
	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get mahasiswa list: %w", dataRes.err)
	}

	// Calculate total pages
	totalPages := (countRes.total + limit - 1) / limit

	return &MahasiswaListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetMahasiswaByID retrieves a single mahasiswa by ID
func (r *repository) GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error) {
	query := `
		SELECT
			CAST(id_pd AS VARCHAR(50)) AS id_pd,
			nm_pd, jk, nik, nisn, tmpt_lahir, tgl_lahir,
			jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, email,
			nm_wali, tgl_lahir_wali, id_pekerjaan_wali, id_penghasilan_wali, id_pendidikan_wali,
			nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_pendidikan_ibu, id_kk_ibu,
			nm_ayah, tgl_lahir_ayah, nik_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_pendidikan_ayah, id_kk_ayah,
			a_terima_kps, no_kps, id_kk, id_alat_transport,
			id_kewarganegaraan, id_agama, id_jns_tinggal, id_wil, id_stat_mhs,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.peserta_didik
		WHERE id_pd = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var pd PesertaDidik
	err := r.db.GetContext(ctx, &pd, query, idPD)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mahasiswa not found")
		}
		return nil, fmt.Errorf("failed to get mahasiswa: %w", err)
	}

	return &pd, nil
}

// GetRegPdByID retrieves registration data by ID
func (r *repository) GetRegPdByID(ctx context.Context, idRegPd string) (*RegPd, error) {
	query := `
		SELECT
			CAST(id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			CAST(id_sp AS VARCHAR(50)) AS id_sp,
			CAST(id_sms AS VARCHAR(50)) AS id_sms,
			CAST(id_pd AS VARCHAR(50)) AS id_pd,
			id_jns_daftar, id_jalur_daftar, id_pembiayaan, id_semester_masuk, id_jns_keluar, nipd, tgl_masuk_sp,
			sks_diakui, id_pt_asal, nm_pt_asal, id_prodi_asal, nm_prodi_asal,
			tgl_keluar, ket, sk_yudisium, tgl_sk_yudisium, ipk, no_seri_ijazah, jalur_skripsi, judul_skripsi, bln_awal_bimbingan, bln_akhir_bimbingan, asal_data_ijazah,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.reg_pd
		WHERE id_reg_pd = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var reg RegPd
	err := r.db.GetContext(ctx, &reg, query, idRegPd)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("registration not found")
		}
		return nil, fmt.Errorf("failed to get registration: %w", err)
	}

	return &reg, nil
}

// getActivePeriod retrieves the active semester from ref.semester table
// Mimics the Laravel dashboard service's getActivePeriod() method
func (r *repository) getActivePeriod(ctx context.Context) (string, error) {
	// First query: Try to get active period with a_periode_aktif = 1
	var idSmt string
	err := r.db.GetContext(ctx, &idSmt, `
		SELECT TOP 1 id_smt
		FROM ref.semester
		WHERE expired_date IS NULL
			AND a_periode_aktif = 1
	`)

	// If found, return it
	if err == nil {
		log.Printf("✅ [Active Period] Found active semester: %s", idSmt)
		return idSmt, nil
	}

	// If not found, fallback to latest semester with RIGHT(id_smt, 1) < '3'
	err = r.db.GetContext(ctx, &idSmt, `
		SELECT TOP 1 id_smt
		FROM ref.semester
		WHERE expired_date IS NULL
			AND RIGHT(id_smt, 1) < '3'
		ORDER BY id_smt DESC
	`)

	if err != nil {
		// Last resort: return default value
		log.Printf("⚠️  [Active Period] Could not determine active semester, using default: 20242")
		return "20242", nil
	}

	log.Printf("✅ [Active Period] Using latest semester: %s", idSmt)
	return idSmt, nil
}

// GetMahasiswaStats retrieves statistics for dashboard
func (r *repository) GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error) {
	stats := &MahasiswaStats{}

	// Get active semester dynamically from database
	activePeriod, err := r.getActivePeriod(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active period: %w", err)
	}
	log.Printf("📊 [Stats] Using active period: %s", activePeriod)

	// Card 1: Total mahasiswa - Count ALL from reg_pd (seluruh mahasiswa di database)
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(*)
		FROM pdrd.reg_pd
		WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Card 2: Total mahasiswa AKTIF - Berdasarkan semester aktif/berjalan (kuliah_mhs)
	err = r.db.GetContext(ctx, &stats.TotalAktif, `
		SELECT COUNT(DISTINCT pd.id_pd) AS total
		FROM pdrd.kuliah_mhs AS kmh
		JOIN pdrd.reg_pd AS reg
			ON reg.id_reg_pd = kmh.id_reg_pd
			AND reg.soft_delete = 0
		JOIN pdrd.peserta_didik AS pd
			ON pd.id_pd = reg.id_pd
			AND pd.soft_delete = 0
			AND pd.id_stat_mhs = 'A'
		INNER JOIN pdrd.sms AS sms
			ON sms.id_sms = reg.id_sms
			AND sms.soft_delete = 0
			AND sms.stat_prodi = 'A'
		INNER JOIN ref.jenjang_pendidikan AS didik
			ON didik.id_jenj_didik = sms.id_jenj_didik
			AND didik.expired_date IS NULL
		WHERE kmh.soft_delete = 0
			AND kmh.id_stat_mhs = 'A'
			AND kmh.id_smt = @p1
	`, activePeriod)
	if err != nil {
		return nil, fmt.Errorf("failed to get total aktif: %w", err)
	}

	// Card 3: Total mahasiswa TIDAK AKTIF - Di semester berjalan
	err = r.db.GetContext(ctx, &stats.TotalTidakAktif, `
		SELECT COUNT(DISTINCT pd.id_pd)
		FROM pdrd.kuliah_mhs AS kmh
		JOIN pdrd.reg_pd AS reg
			ON reg.id_reg_pd = kmh.id_reg_pd
			AND reg.soft_delete = 0
		JOIN pdrd.peserta_didik AS pd
			ON pd.id_pd = reg.id_pd
			AND pd.soft_delete = 0
			AND pd.id_stat_mhs = 'A'
		INNER JOIN pdrd.sms AS sms
			ON sms.id_sms = reg.id_sms
			AND sms.soft_delete = 0
			AND sms.stat_prodi = 'A'
		INNER JOIN ref.jenjang_pendidikan AS didik
			ON didik.id_jenj_didik = sms.id_jenj_didik
			AND didik.expired_date IS NULL
		WHERE kmh.soft_delete = 0
			AND kmh.id_stat_mhs != 'A'
			AND kmh.id_smt = @p1
	`, activePeriod)
	if err != nil {
		return nil, fmt.Errorf("failed to get total tidak aktif: %w", err)
	}

	// By angkatan
	rows, err := r.db.QueryContext(ctx, `
		SELECT
			LEFT(reg.id_semester_masuk, 4) AS angkatan,
			COUNT(*) AS total
		FROM pdrd.reg_pd AS reg
		WHERE reg.soft_delete = 0
		GROUP BY LEFT(reg.id_semester_masuk, 4)
		ORDER BY angkatan DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get by angkatan: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item map[string]interface{} = make(map[string]interface{})
		var angkatan string
		var total int
		rows.Scan(&angkatan, &total)
		item["angkatan"] = angkatan
		item["total"] = total
		stats.ByAngkatan = append(stats.ByAngkatan, item)
	}

	// Last sync - dari reg_pd
	var lastSync time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM pdrd.reg_pd WHERE soft_delete = 0
	`)
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}

// GetAngkatanList retrieves available angkatan (years) from reg_pd
func (r *repository) GetAngkatanList(ctx context.Context) ([]string, error) {
	query := `
		SELECT DISTINCT LEFT(id_semester_masuk, 4) AS angkatan
		FROM pdrd.reg_pd
		WHERE soft_delete = 0
		ORDER BY angkatan DESC
	`

	var angkatanList []string
	err := r.db.SelectContext(ctx, &angkatanList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan list: %w", err)
	}

	return angkatanList, nil
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
			AND sms.id_jns_sms = '3'
			AND CAST(sms.id_sp AS VARCHAR(50)) = 'e2b705a7-173e-464a-9fac-509128709515'
		ORDER BY sms.nm_lemb ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var prodiList []map[string]interface{}
	for rows.Next() {
		var idSMS, namaProdi, kodeProdi, idJenjDidik, namaJenjang, idSP, statProdi string
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

// GetReferenceCache loads reference data for validation
func (r *repository) GetReferenceCache(ctx context.Context) (*ReferenceCache, error) {
	if r.cache != nil {
		return r.cache, nil
	}

	cache := &ReferenceCache{
		JenisDaftar:     make(map[int]string),
		JalurDaftar:     make(map[int]string),
		StatusMahasiswa: make(map[string]string),
		JenisKeluar:     make(map[int]string),
		Agama:           make(map[int]string),
		Wilayah:         make(map[string]string),
	}

	// Load jenis daftar (with error handling for missing table)
	rows, err := r.db.QueryContext(ctx, "SELECT id_jns_daftar, nm_jns_daftar FROM ref.jenis_pendaftaran")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var id int
			var nama string
			rows.Scan(&id, &nama)
			cache.JenisDaftar[id] = nama
		}
	}

	// Load jalur daftar (with error handling for missing table)
	rows2, err2 := r.db.QueryContext(ctx, "SELECT id_jalur_daftar, nm_jalur_daftar FROM ref.jalur_daftar")
	if err2 == nil {
		defer rows2.Close()
		for rows2.Next() {
			var id int
			var nama string
			rows2.Scan(&id, &nama)
			cache.JalurDaftar[id] = nama
		}
	}

	// Load status mahasiswa (with error handling for missing table)
	rows3, err3 := r.db.QueryContext(ctx, "SELECT id_stat_mhs, nm_stat_mhs FROM ref.status_mahasiswa")
	if err3 == nil {
		defer rows3.Close()
		for rows3.Next() {
			var id, nama string
			rows3.Scan(&id, &nama)
			cache.StatusMahasiswa[id] = nama
		}
	}

	r.cache = cache
	return cache, nil
}

// CheckOrCreateSyncLog checks if sync log exists for this month and angkatan, create if not
func (r *repository) CheckOrCreateSyncLog(ctx context.Context, idSms, angkatan string) error {
	// Check if log exists for this month AND angkatan (allows multiple angkatan syncs per month)
	checkQuery := `
		SELECT COUNT(*)
		FROM logger.log_sync_pd_sms
		WHERE id_sms = @p1
			AND angkatan = @p2
			AND tgl_sync >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)
			AND a_selesai = 1
	`

	var count int
	err := r.db.QueryRowContext(ctx, checkQuery, idSms, angkatan).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check sync log: %w", err)
	}

	// If already synced this month for this angkatan, skip
	if count > 0 {
		return fmt.Errorf("prodi %s angkatan %s already synced this month", idSms, angkatan)
	}

	// Create new sync log with angkatan (allows multiple angkatan syncs per month)
	insertQuery := `
		INSERT INTO logger.log_sync_pd_sms (id_sms, angkatan, tgl_sync, waktu_mulai_sync, a_selesai)
		VALUES (@p1, @p2, CAST(GETDATE() AS DATE), GETDATE(), 0)
	`

	_, err = r.db.ExecContext(ctx, insertQuery, idSms, angkatan)
	if err != nil {
		return fmt.Errorf("failed to create sync log: %w", err)
	}

	return nil
}

// UpdateSyncLogProgress updates sync progress with stats
func (r *repository) UpdateSyncLogProgress(ctx context.Context, idSms, angkatan string, totalMhs, berhasil, gagal int) error {
	query := `
		UPDATE logger.log_sync_pd_sms
		SET total_mahasiswa = @p1,
			total_berhasil = @p2,
			total_gagal = @p3
		WHERE id_sms = @p4
			AND angkatan = @p5
			AND tgl_sync >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)
			AND a_selesai = 0
	`

	_, err := r.db.ExecContext(ctx, query, totalMhs, berhasil, gagal, idSms, angkatan)
	if err != nil {
		log.Printf("⚠️  [Sync Log] Failed to update progress for prodi %s: %v", idSms, err)
		return err
	}

	log.Printf("📊 [Sync Progress] Prodi %s Angkatan %s: %d total, %d success, %d failed", idSms, angkatan, totalMhs, berhasil, gagal)
	return nil
}

// CompleteSyncLog marks sync as completed for specific angkatan
func (r *repository) CompleteSyncLog(ctx context.Context, idSms, angkatan string) error {
	// Include angkatan in WHERE clause to complete only the correct sync log
	query := `
		UPDATE logger.log_sync_pd_sms
		SET a_selesai = 1,
			waktu_selesai_sync = GETDATE()
		WHERE id_sms = @p1
			AND angkatan = @p2
			AND tgl_sync >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)
	`

	_, err := r.db.ExecContext(ctx, query, idSms, angkatan)
	return err
}

// GetSyncLogs retrieves sync logs with filtering and pagination
func (r *repository) GetSyncLogs(ctx context.Context, page, limit int, search, angkatan string, status *string) (*SyncLogListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	var conditions []string
	var args []interface{}
	paramCount := 1

	// Search by prodi name
	if search != "" {
		conditions = append(conditions, fmt.Sprintf("sp.nm_sp LIKE @p%d", paramCount))
		args = append(args, "%"+search+"%")
		paramCount++
	}

	// Filter by angkatan
	if angkatan != "" {
		conditions = append(conditions, fmt.Sprintf("l.angkatan = @p%d", paramCount))
		args = append(args, angkatan)
		paramCount++
	}

	// Filter by status
	if status != nil && *status != "" {
		switch *status {
		case "completed":
			conditions = append(conditions, "l.a_selesai = 1")
		case "processing":
			conditions = append(conditions, "l.a_selesai = 0")
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM logger.log_sync_pd_sms l
		LEFT JOIN pdrd.satuan_pendidikan sp ON l.id_prodi = sp.id_sp
		%s
	`, whereClause)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count sync logs: %w", err)
	}

	// Get data with pagination
	args = append(args, offset, limit)
	query := fmt.Sprintf(`
		SELECT
			l.id_sms,
			l.tgl_sync,
			l.waktu_mulai_sync,
			l.waktu_selesai_sync,
			l.a_selesai,
			l.total_mahasiswa,
			l.total_berhasil,
			l.total_gagal,
			l.angkatan,
			sp.nm_sp as nama_prodi,
			sp.nm_jenj_didik as jenjang_prodi
		FROM logger.log_sync_pd_sms l
		LEFT JOIN pdrd.satuan_pendidikan sp ON l.id_prodi = sp.id_sp
		%s
		ORDER BY l.tgl_sync DESC, l.waktu_mulai_sync DESC
		OFFSET @p%d ROWS
		FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramCount, paramCount+1)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync logs: %w", err)
	}
	defer rows.Close()

	var logs []*LogSyncPdSmsWithProdi
	for rows.Next() {
		log := &LogSyncPdSmsWithProdi{}
		err := rows.Scan(
			&log.IDSMS,
			&log.TglSync,
			&log.WaktuMulaiSync,
			&log.WaktuSelesaiSync,
			&log.ASelesai,
			&log.TotalMahasiswa,
			&log.TotalBerhasil,
			&log.TotalGagal,
			&log.Angkatan,
			&log.NamaProdi,
			&log.JenjangProdi,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan sync log: %w", err)
		}

		// Calculate duration if completed
		if log.WaktuSelesaiSync != nil {
			duration := log.WaktuSelesaiSync.Sub(log.WaktuMulaiSync).Milliseconds()
			log.DurationMs = &duration
		}

		// Determine status
		if log.ASelesai == 0 {
			log.Status = "processing"
		} else if log.TotalGagal != nil && *log.TotalGagal > 0 {
			if log.TotalBerhasil != nil && *log.TotalBerhasil > 0 {
				log.Status = "partial"
			} else {
				log.Status = "failed"
			}
		} else {
			log.Status = "success"
		}

		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating sync logs: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &SyncLogListResult{
		Data:       logs,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetSyncLogStats retrieves statistics for sync logs
func (r *repository) GetSyncLogStats(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT
			COUNT(*) as total_syncs,
			SUM(CASE WHEN a_selesai = 1 THEN 1 ELSE 0 END) as completed_syncs,
			SUM(CASE WHEN a_selesai = 0 THEN 1 ELSE 0 END) as processing_syncs,
			SUM(CASE WHEN a_selesai = 1 AND total_gagal = 0 THEN 1 ELSE 0 END) as success_syncs,
			SUM(CASE WHEN a_selesai = 1 AND total_gagal > 0 THEN 1 ELSE 0 END) as failed_syncs,
			SUM(ISNULL(total_mahasiswa, 0)) as total_mahasiswa_processed,
			SUM(ISNULL(total_berhasil, 0)) as total_berhasil,
			SUM(ISNULL(total_gagal, 0)) as total_gagal,
			MAX(tgl_sync) as last_sync_date
		FROM logger.log_sync_pd_sms
		WHERE tgl_sync >= DATEADD(MONTH, -3, GETDATE())
	`

	var stats struct {
		TotalSyncs              int
		CompletedSyncs          int
		ProcessingSyncs         int
		SuccessSyncs            int
		FailedSyncs             int
		TotalMahasiswaProcessed int
		TotalBerhasil           int
		TotalGagal              int
		LastSyncDate            sql.NullTime
	}

	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalSyncs,
		&stats.CompletedSyncs,
		&stats.ProcessingSyncs,
		&stats.SuccessSyncs,
		&stats.FailedSyncs,
		&stats.TotalMahasiswaProcessed,
		&stats.TotalBerhasil,
		&stats.TotalGagal,
		&stats.LastSyncDate,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync log stats: %w", err)
	}

	result := map[string]interface{}{
		"total_syncs":               stats.TotalSyncs,
		"completed_syncs":           stats.CompletedSyncs,
		"processing_syncs":          stats.ProcessingSyncs,
		"success_syncs":             stats.SuccessSyncs,
		"failed_syncs":              stats.FailedSyncs,
		"total_mahasiswa_processed": stats.TotalMahasiswaProcessed,
		"total_berhasil":            stats.TotalBerhasil,
		"total_gagal":               stats.TotalGagal,
	}

	if stats.LastSyncDate.Valid {
		result["last_sync_date"] = stats.LastSyncDate.Time
	}

	successRate := 0.0
	if stats.TotalMahasiswaProcessed > 0 {
		successRate = float64(stats.TotalBerhasil) / float64(stats.TotalMahasiswaProcessed) * 100
	}
	result["success_rate"] = successRate

	return result, nil
}
