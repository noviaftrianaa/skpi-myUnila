package mahasiswa

import (
	"context"
	"database/sql"
	"fmt"
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
}

// ReferenceCache holds reference data for lookup and validation
type ReferenceCache struct {
	JenisDaftar      map[int]string    // id_jns_daftar -> nama
	JalurDaftar      map[int]string    // id_jalur_daftar -> nama
	StatusMahasiswa  map[string]string // id_stat_mhs -> nama
	JenisKeluar      map[int]string    // id_jns_keluar -> nama
	Agama            map[int]string    // id_agama -> nama
	Wilayah          map[string]string // id_wil -> nama
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
			pd.IDPD,                 // @p1
			pd.NamaPD,              // @p2
			pd.JK,                  // @p3
			pd.NISN,                // @p4
			pd.NIK,                 // @p5
			pd.TempatLahir,         // @p6
			pd.TglLahir,            // @p7
			pd.Jalan,               // @p8
			pd.RT,                  // @p9
			pd.RW,                  // @p10
			pd.NamaDusun,           // @p11
			pd.Kelurahan,           // @p12
			pd.KodePos,             // @p13
			pd.TeleponRumah,        // @p14
			pd.TeleponHP,           // @p15
			pd.Email,               // @p16
			pd.NamaWali,            // @p17
			pd.TglLahirWali,        // @p18
			pd.IDPekerjaanWali,     // @p19
			pd.IDPenghasilanWali,   // @p20
			pd.IDPendidikanWali,    // @p21
			pd.NamaIbu,             // @p22
			pd.TglLahirIbu,         // @p23
			pd.NIKIbu,              // @p24
			pd.IDPekerjaanIbu,      // @p25
			pd.IDPenghasilanIbu,    // @p26
			pd.IDPendidikanIbu,     // @p27
			pd.IDKKIbu,             // @p28
			pd.NamaAyah,            // @p29
			pd.TglLahirAyah,        // @p30
			pd.NIKAyah,             // @p31
			pd.IDPekerjaanAyah,     // @p32
			pd.IDPenghasilanAyah,   // @p33
			pd.IDPendidikanAyah,    // @p34
			pd.IDKKAyah,            // @p35
			pd.ATerimaKPS,          // @p36
			pd.NoKPS,               // @p37
			pd.IDKK,                // @p38
			pd.IDAlatTransport,     // @p39
			pd.IDKewarganegaraan,   // @p40
			pd.IDAgama,             // @p41
			pd.IDJenisTinggal,      // @p42
			pd.IDWilayah,           // @p43
			pd.IDStatMhs,           // @p44
			pd.LastUpdate,          // @p45 - for UPDATE
			pd.LastSync,            // @p46 - for both
			pd.CreateDate,          // @p47 - for INSERT
			pd.IDCreator,           // @p48 - for INSERT
			pd.IDUpdater,           // @p49 - for INSERT
			pd.SoftDelete,          // @p50 - for INSERT
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
			reg.IDRegPd,            // @p1
			reg.IDSMS,              // @p2
			idJnsDaftar,            // @p3
			idJalurDaftar,          // @p4
			idPembiayaan,           // @p5
			reg.IDJenisKeluar,      // @p6
			reg.NIPD,               // @p7
			reg.TglMasukSP,         // @p8
			reg.SKSDiakui,          // @p9
			reg.IDPTAsal,           // @p10
			reg.NamaPTAsal,         // @p11
			reg.IDProdiAsal,        // @p12
			reg.NamaProdiAsal,      // @p13
			reg.TglKeluar,          // @p14
			reg.Keterangan,         // @p15
			reg.SKYudisium,         // @p16
			reg.TglSKYudisium,      // @p17
			reg.IPK,                // @p18
			reg.NoSeriIjazah,       // @p19
			reg.JalurSkripsi,       // @p20
			reg.JudulSkripsi,       // @p21
			reg.BlnAwalBimbingan,   // @p22
			reg.BlnAkhirBimbingan,  // @p23
			asalDataIjazah,         // @p24
			reg.LastUpdate,         // @p25 - for UPDATE
			reg.LastSync,           // @p26 - for both
			reg.IDSP,               // @p27 - for INSERT
			reg.IDPD,               // @p28 - for INSERT
			reg.IDSemesterMasuk,    // @p29 - for INSERT
			reg.CreateDate,         // @p30 - for INSERT
			reg.IDCreator,          // @p31 - for INSERT
			reg.IDUpdater,          // @p32 - for INSERT
			reg.SoftDelete,         // @p33 - for INSERT
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
			kuliah.IDRegPd,      // @p1
			kuliah.IDSmt,        // @p2
			kuliah.IDStatMhs,    // @p3
			kuliah.IPS,          // @p4
			kuliah.IPK,          // @p5
			kuliah.SKSSemester,  // @p6
			kuliah.TotalSKS,     // @p7
			kuliah.BiayaSemester,// @p8
			kuliah.LastUpdate,   // @p9
			kuliah.LastSync,     // @p10
			kuliah.CreateDate,   // @p11 - for INSERT
			kuliah.IDCreator,    // @p12 - for INSERT
			kuliah.IDUpdater,    // @p13 - for INSERT
			kuliah.SoftDelete,   // @p14 - for INSERT
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
	whereConditions := []string{"pd.soft_delete = 0", "reg.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// Angkatan filter (WAJIB)
	if len(angkatan) > 0 {
		placeholders := make([]string, len(angkatan))
		for i, ang := range angkatan {
			placeholders[i] = fmt.Sprintf("@p%d", paramIndex)
			// Extract year from semester like "20211" -> "2021"
			args = append(args, ang+"%")
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("(LEFT(reg.id_semester_masuk, 4) IN (%s))", strings.Join(placeholders, ",")))
	}

	// Prodi filter (Optional)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("reg.id_sms = @p%d", paramIndex))
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

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.peserta_didik AS pd
		INNER JOIN pdrd.reg_pd AS reg ON reg.id_pd = pd.id_pd AND reg.soft_delete = 0
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count mahasiswa: %w", err)
	}

	// Get paginated data with calculated fields
	dataQuery := fmt.Sprintf(`
		SELECT
			pd.id_pd,
			pd.nm_pd AS nama,
			reg.nipd AS npm,
			LEFT(reg.id_semester_masuk, 4) AS angkatan,
			jd.nm_jalur_daftar AS jalur_masuk,
			jdf.nm_jns_daftar AS jenis_pendaftaran,
			(
				SELECT COUNT(*)
				FROM pdrd.kuliah_mhs kmh
				WHERE kmh.id_reg_pd = reg.id_reg_pd
					AND kmh.soft_delete = 0
					AND RIGHT(kmh.id_smt, 1) != '3'
			) AS semester_sekarang,
			sm.nm_stat_mhs AS status_mahasiswa,
			jk.nm_jns_keluar AS jenis_keluar,
			pd.last_sync,
			reg.id_sms AS id_prodi,
			sms.nm_lemb AS nama_prodi
		FROM pdrd.peserta_didik AS pd
		INNER JOIN pdrd.reg_pd AS reg ON reg.id_pd = pd.id_pd AND reg.soft_delete = 0
		LEFT JOIN ref.jalur_daftar AS jd ON jd.id_jalur_daftar = reg.id_jalur_daftar
		LEFT JOIN ref.jenis_daftar AS jdf ON jdf.id_jns_daftar = reg.id_jns_daftar
		LEFT JOIN ref.status_mahasiswa AS sm ON sm.id_stat_mhs = pd.id_stat_mhs
		LEFT JOIN ref.jenis_keluar AS jk ON jk.id_jns_keluar = reg.id_jns_keluar
		LEFT JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		WHERE %s
		ORDER BY pd.nm_pd ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	args = append(args, offset, limit)

	var mahasiswaList []*MahasiswaListItem
	err = r.db.SelectContext(ctx, &mahasiswaList, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get mahasiswa list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &MahasiswaListResult{
		Data:       mahasiswaList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetMahasiswaByID retrieves a single mahasiswa by ID
func (r *repository) GetMahasiswaByID(ctx context.Context, idPD string) (*PesertaDidik, error) {
	query := `SELECT * FROM pdrd.peserta_didik WHERE id_pd = @p1 AND soft_delete = 0`

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
	query := `SELECT * FROM pdrd.reg_pd WHERE id_reg_pd = @p1 AND soft_delete = 0`

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

// GetMahasiswaStats retrieves statistics for dashboard
func (r *repository) GetMahasiswaStats(ctx context.Context) (*MahasiswaStats, error) {
	stats := &MahasiswaStats{}

	// Total mahasiswa
	err := r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(*) FROM pdrd.peserta_didik WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Total aktif
	err = r.db.GetContext(ctx, &stats.TotalAktif, `
		SELECT COUNT(*) FROM pdrd.peserta_didik WHERE id_stat_mhs = 'A' AND soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total aktif: %w", err)
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

	// Last sync
	var lastSync time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM pdrd.peserta_didik WHERE soft_delete = 0
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

// GetProdiList retrieves list of prodi from pdrd.sms
func (r *repository) GetProdiList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT
			id_sms,
			nm_lemb AS nama_prodi,
			kode_prodi,
			id_jenj_didik
		FROM pdrd.sms
		WHERE soft_delete = 0
			AND id_jns_sms = 3
		ORDER BY nm_lemb ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	defer rows.Close()

	var prodiList []map[string]interface{}
	for rows.Next() {
		var idSMS, namaProdi, kodeProdi string
		var idJenjDidik int
		err := rows.Scan(&idSMS, &namaProdi, &kodeProdi, &idJenjDidik)
		if err != nil {
			continue
		}

		prodi := map[string]interface{}{
			"id_sms":       idSMS,
			"nama_prodi":   namaProdi,
			"kode_prodi":   kodeProdi,
			"id_jenj_didik": idJenjDidik,
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

	// Load jenis daftar
	rows, _ := r.db.QueryContext(ctx, "SELECT id_jns_daftar, nm_jns_daftar FROM ref.jenis_daftar")
	defer rows.Close()
	for rows.Next() {
		var id int
		var nama string
		rows.Scan(&id, &nama)
		cache.JenisDaftar[id] = nama
	}

	// Load jalur daftar
	rows2, _ := r.db.QueryContext(ctx, "SELECT id_jalur_daftar, nm_jalur_daftar FROM ref.jalur_daftar")
	defer rows2.Close()
	for rows2.Next() {
		var id int
		var nama string
		rows2.Scan(&id, &nama)
		cache.JalurDaftar[id] = nama
	}

	// Load status mahasiswa
	rows3, _ := r.db.QueryContext(ctx, "SELECT id_stat_mhs, nm_stat_mhs FROM ref.status_mahasiswa")
	defer rows3.Close()
	for rows3.Next() {
		var id, nama string
		rows3.Scan(&id, &nama)
		cache.StatusMahasiswa[id] = nama
	}

	r.cache = cache
	return cache, nil
}
