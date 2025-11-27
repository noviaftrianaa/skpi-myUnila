package kelas_kuliah

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for kelas_kuliah data access
type Repository interface {
	// Bulk operations
	BulkUpsertKelasKuliah(ctx context.Context, data []*KelasKuliah) error
	BulkUpsertAktAjarDosen(ctx context.Context, data []*AktAjarDosen) error

	// List operations with filters
	GetKelasKuliahList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, sortBy, sortOrder string) (*KelasKuliahListResult, error)
	GetKelasKuliahByID(ctx context.Context, idKls string) (*KelasKuliah, error)
	GetDosenPengajarByKelas(ctx context.Context, idKls string) ([]*DosenPengajarListItem, error)

	// Utility - Get prodi list and semester list
	GetProdiList(ctx context.Context) ([]map[string]interface{}, error)
	GetSemesterList(ctx context.Context) ([]map[string]interface{}, error)

	// Stats operations
	GetStats(ctx context.Context) (*KelasKuliahStats, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new kelas_kuliah repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// convertToWIB converts timestamp to WIB timezone
func convertToWIB(t time.Time) time.Time {
	return t.In(time.FixedZone("WIB", 7*60*60))
}

// BulkUpsertKelasKuliah performs bulk upsert for kelas_kuliah
func (r *repository) BulkUpsertKelasKuliah(ctx context.Context, data []*KelasKuliah) error {
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
		MERGE pdrd.kelas_kuliah AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_kls) AS source
		ON target.id_kls = source.id_kls
		WHEN MATCHED THEN
			UPDATE SET
				id_smt = @p2,
				id_sms = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_mk = CAST(@p4 AS UNIQUEIDENTIFIER),
				sks_mk = @p5,
				sks_tm = @p6,
				sks_prak = @p7,
				sks_prak_lap = @p8,
				sks_sim = @p9,
				nm_kls = @p10,
				bahasan_case = @p11,
				a_selenggara_pditt = @p12,
				a_pengguna_pditt = @p13,
				kuota_pditt = @p14,
				kode_vclass = @p15,
				url_vclass = @p16,
				lingkup_kelas = @p17,
				mode_kuliah = @p18,
				last_update = @p19,
				id_updater = @p20,
				last_sync = @p21
		WHEN NOT MATCHED THEN
			INSERT (
				id_kls, id_smt, id_sms, id_mk,
				sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim,
				nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt,
				kode_vclass, url_vclass, lingkup_kelas, mode_kuliah,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), @p2, CAST(@p3 AS UNIQUEIDENTIFIER), CAST(@p4 AS UNIQUEIDENTIFIER),
				@p5, @p6, @p7, @p8, @p9,
				@p10, @p11, @p12, @p13, @p14,
				@p15, @p16, @p17, @p18,
				@p22, @p23, @p19, @p20, @p24, @p21
			);
	`

	for _, kelas := range data {
		_, err = tx.ExecContext(ctx, query,
			kelas.IDKls,           // @p1
			kelas.IDSmt,           // @p2
			kelas.IDSMS,           // @p3
			kelas.IDMk,            // @p4
			kelas.SksMk,           // @p5
			kelas.SksTm,           // @p6
			kelas.SksPrak,         // @p7
			kelas.SksPrakLap,      // @p8
			kelas.SksSim,          // @p9
			kelas.NmKls,           // @p10
			kelas.BahasanCase,     // @p11
			kelas.ASelenggaraPditt, // @p12
			kelas.APenggunaPditt,   // @p13
			kelas.KuotaPditt,       // @p14
			kelas.KodeVclass,       // @p15
			kelas.UrlVclass,        // @p16
			kelas.LingkupKelas,     // @p17
			kelas.ModeKuliah,       // @p18
			kelas.LastUpdate,       // @p19
			kelas.IDUpdater,        // @p20
			kelas.LastSync,         // @p21
			kelas.CreateDate,       // @p22
			kelas.IDCreator,        // @p23
			kelas.SoftDelete,       // @p24
		)
		if err != nil {
			return fmt.Errorf("failed to upsert kelas_kuliah %s: %w", kelas.IDKls, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkUpsertAktAjarDosen performs bulk upsert for akt_ajar_dosen
func (r *repository) BulkUpsertAktAjarDosen(ctx context.Context, data []*AktAjarDosen) error {
	if len(data) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE pdrd.akt_ajar_dosen AS target
		USING (SELECT CAST(@p1 AS UNIQUEIDENTIFIER) AS id_ajar) AS source
		ON target.id_ajar = source.id_ajar
		WHEN MATCHED THEN
			UPDATE SET
				id_reg_ptk = CAST(@p2 AS UNIQUEIDENTIFIER),
				id_subst = CAST(@p3 AS UNIQUEIDENTIFIER),
				id_katgiat = @p4,
				katgiat_ajar_id_katgiat = @p5,
				id_jns_eval = @p6,
				id_kls = CAST(@p7 AS UNIQUEIDENTIFIER),
				sks_subst_tot = @p8,
				sks_tm_subst = @p9,
				sks_prak_subst = @p10,
				sks_prak_lap_subst = @p11,
				sks_sim_subst = @p12,
				jml_tm_renc = @p13,
				jml_tm_real = @p14,
				jml_mhs = @p15,
				last_update = @p16,
				id_updater = @p17,
				last_sync = @p18
		WHEN NOT MATCHED THEN
			INSERT (
				id_ajar, id_reg_ptk, id_subst, id_katgiat, katgiat_ajar_id_katgiat,
				id_jns_eval, id_kls, sks_subst_tot, sks_tm_subst, sks_prak_subst,
				sks_prak_lap_subst, sks_sim_subst, jml_tm_renc, jml_tm_real, jml_mhs,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			)
			VALUES (
				CAST(@p1 AS UNIQUEIDENTIFIER), CAST(@p2 AS UNIQUEIDENTIFIER), CAST(@p3 AS UNIQUEIDENTIFIER), @p4, @p5,
				@p6, CAST(@p7 AS UNIQUEIDENTIFIER), @p8, @p9, @p10,
				@p11, @p12, @p13, @p14, @p15,
				@p19, @p20, @p16, @p17, @p21, @p18
			);
	`

	for _, ajar := range data {
		_, err = tx.ExecContext(ctx, query,
			ajar.IDAjar,              // @p1
			ajar.IDRegPtk,            // @p2
			ajar.IDSubst,             // @p3
			ajar.IDKatgiat,           // @p4
			ajar.KatgiatAjarIDKatgiat, // @p5
			ajar.IDJnsEval,           // @p6
			ajar.IDKls,               // @p7
			ajar.SksSubstTot,         // @p8
			ajar.SksTmSubst,          // @p9
			ajar.SksPrakSubst,        // @p10
			ajar.SksPrakLapSubst,     // @p11
			ajar.SksSimSubst,         // @p12
			ajar.JmlTmRenc,           // @p13
			ajar.JmlTmReal,           // @p14
			ajar.JmlMhs,              // @p15
			ajar.LastUpdate,          // @p16
			ajar.IDUpdater,           // @p17
			ajar.LastSync,            // @p18
			ajar.CreateDate,          // @p19
			ajar.IDCreator,           // @p20
			ajar.SoftDelete,          // @p21
		)
		if err != nil {
			return fmt.Errorf("failed to upsert akt_ajar_dosen %s: %w", ajar.IDAjar, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetKelasKuliahList retrieves paginated list of kelas kuliah with filters
func (r *repository) GetKelasKuliahList(ctx context.Context, page, limit int, search string, idSemester []string, idProdi *string, sortBy, sortOrder string) (*KelasKuliahListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions
	whereConditions := []string{"kk.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	// ID Semester filter (MANDATORY - minimum 1 value)
	if len(idSemester) > 0 {
		placeholders := []string{}
		for _, sem := range idSemester {
			placeholders = append(placeholders, fmt.Sprintf("@p%d", paramIndex))
			args = append(args, sem)
			paramIndex++
		}
		whereConditions = append(whereConditions, fmt.Sprintf("kk.id_smt IN (%s)", strings.Join(placeholders, ", ")))
	}

	// Prodi filter (Optional)
	if idProdi != nil && *idProdi != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("kk.id_sms = CAST(@p%d AS UNIQUEIDENTIFIER)", paramIndex))
		args = append(args, *idProdi)
		paramIndex++
	}

	// Search filter (search by nama kelas or nama matkul)
	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(kk.nm_kls LIKE @p%d OR m.nm_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Build ORDER BY clause
	orderByClause := "kk.id_smt DESC, kk.nm_kls ASC" // Default: newest semester first, then by class name
	if sortBy != "" {
		var dbColumn string
		switch sortBy {
		case "nm_kls":
			dbColumn = "kk.nm_kls"
		case "id_semester":
			dbColumn = "kk.id_smt"
		case "nama_matkul":
			dbColumn = "m.nm_mk"
		case "sks_mk":
			dbColumn = "kk.sks_mk"
		case "jumlah_dosen":
			dbColumn = "jumlah_dosen"
		case "last_sync":
			dbColumn = "kk.last_sync"
		default:
			dbColumn = ""
		}

		order := "ASC"
		if sortOrder == "desc" || sortOrder == "DESC" {
			order = "DESC"
		}

		if dbColumn != "" {
			orderByClause = fmt.Sprintf("%s %s", dbColumn, order)
		}
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.kelas_kuliah AS kk WITH(NOLOCK)
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		WHERE %s
	`, whereClause)

	// Get paginated data with JOINs
	// Note: akt_ajar_dosen.id_reg_ptk -> reg_ptk.id_reg_ptk -> sdm.id_sdm -> sdm.nm_sdm (nama dosen)
	dataQuery := fmt.Sprintf(`
		WITH dosen_info AS (
			SELECT
				aad.id_kls,
				COUNT(*) AS jumlah_dosen,
				STRING_AGG(sdm.nm_sdm, ', ') WITHIN GROUP (ORDER BY sdm.nm_sdm) AS nama_dosen
			FROM pdrd.akt_ajar_dosen aad WITH(NOLOCK)
			INNER JOIN pdrd.reg_ptk rp WITH(NOLOCK) ON rp.id_reg_ptk = aad.id_reg_ptk AND rp.soft_delete = 0
			INNER JOIN pdrd.sdm sdm WITH(NOLOCK) ON sdm.id_sdm = rp.id_sdm AND sdm.soft_delete = 0
			WHERE aad.soft_delete = 0
			GROUP BY aad.id_kls
		)
		SELECT
			CAST(kk.id_kls AS VARCHAR(50)) AS id_kls,
			kk.nm_kls,
			kk.id_smt AS id_semester,
			sem.nm_smt AS nama_semester,
			CAST(kk.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.nm_lemb AS nama_prodi,
			didik.nm_jenj_didik AS nama_jenjang,
			m.kode_mk AS kode_matkul,
			m.nm_mk AS nama_matkul,
			kk.sks_mk,
			COALESCE(di.jumlah_dosen, 0) AS jumlah_dosen,
			di.nama_dosen,
			kk.last_sync
		FROM pdrd.kelas_kuliah AS kk WITH(NOLOCK)
		LEFT JOIN pdrd.matkul m WITH(NOLOCK) ON m.id_mk = kk.id_mk AND m.soft_delete = 0
		LEFT JOIN ref.semester AS sem WITH(NOLOCK) ON sem.id_smt = kk.id_smt
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan AS didik WITH(NOLOCK) ON didik.id_jenj_didik = sms.id_jenj_didik AND didik.expired_date IS NULL
		LEFT JOIN dosen_info di ON di.id_kls = kk.id_kls
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
		data []*KelasKuliahListItem
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
		var kelasList []*KelasKuliahListItem
		err := r.db.SelectContext(ctx, &kelasList, dataQuery, dataArgs...)
		dataChan <- dataResult{data: kelasList, err: err}
	}()

	countRes := <-countChan
	dataRes := <-dataChan

	if countRes.err != nil {
		return nil, fmt.Errorf("failed to count kelas kuliah: %w", countRes.err)
	}
	if dataRes.err != nil {
		return nil, fmt.Errorf("failed to get kelas kuliah list: %w", dataRes.err)
	}

	// Convert timestamps to WIB
	for _, item := range dataRes.data {
		item.LastSync = convertToWIB(item.LastSync)
	}

	totalPages := (countRes.total + limit - 1) / limit

	return &KelasKuliahListResult{
		Data:       dataRes.data,
		Total:      countRes.total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetKelasKuliahByID retrieves a single kelas kuliah by ID
func (r *repository) GetKelasKuliahByID(ctx context.Context, idKls string) (*KelasKuliah, error) {
	query := `
		SELECT
			CAST(id_kls AS VARCHAR(50)) AS id_kls,
			id_smt,
			CAST(id_sms AS VARCHAR(50)) AS id_sms,
			CAST(id_mk AS VARCHAR(50)) AS id_mk,
			sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim,
			nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt,
			kode_vclass, url_vclass, lingkup_kelas, mode_kuliah,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.kelas_kuliah WITH(NOLOCK)
		WHERE id_kls = CAST(@p1 AS UNIQUEIDENTIFIER) AND soft_delete = 0
	`

	var kelas KelasKuliah
	err := r.db.GetContext(ctx, &kelas, query, idKls)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("kelas kuliah not found")
		}
		return nil, fmt.Errorf("failed to get kelas kuliah: %w", err)
	}

	kelas.CreateDate = convertToWIB(kelas.CreateDate)
	kelas.LastUpdate = convertToWIB(kelas.LastUpdate)
	kelas.LastSync = convertToWIB(kelas.LastSync)

	return &kelas, nil
}

// GetDosenPengajarByKelas retrieves list of dosen pengajar for a kelas
func (r *repository) GetDosenPengajarByKelas(ctx context.Context, idKls string) ([]*DosenPengajarListItem, error) {
	query := `
		SELECT
			CAST(aad.id_ajar AS VARCHAR(50)) AS id_ajar,
			CAST(aad.id_kls AS VARCHAR(50)) AS id_kls,
			kk.nm_kls,
			CAST(aad.id_reg_ptk AS VARCHAR(50)) AS id_reg_ptk,
			ptk.nm_ptk AS nama_dosen,
			ptk.nidn,
			aad.sks_subst_tot,
			aad.jml_tm_renc,
			aad.jml_tm_real,
			je.nm_jns_eval AS nama_jenis_evaluasi,
			aad.last_sync
		FROM pdrd.akt_ajar_dosen aad WITH(NOLOCK)
		LEFT JOIN pdrd.kelas_kuliah kk WITH(NOLOCK) ON kk.id_kls = aad.id_kls AND kk.soft_delete = 0
		LEFT JOIN pdrd.ptk ptk WITH(NOLOCK) ON ptk.id_reg_ptk = aad.id_reg_ptk AND ptk.soft_delete = 0
		LEFT JOIN ref.jenis_evaluasi je WITH(NOLOCK) ON je.id_jns_eval = aad.id_jns_eval
		WHERE aad.id_kls = CAST(@p1 AS UNIQUEIDENTIFIER) AND aad.soft_delete = 0
		ORDER BY ptk.nm_ptk ASC
	`

	var dosenList []*DosenPengajarListItem
	err := r.db.SelectContext(ctx, &dosenList, query, idKls)
	if err != nil {
		return nil, fmt.Errorf("failed to get dosen pengajar list: %w", err)
	}

	for _, dosen := range dosenList {
		dosen.LastSync = convertToWIB(dosen.LastSync)
	}

	return dosenList, nil
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
		var idSMS, namaProdi, kodeProdi, idSP, statProdi string
		var idJenjDidik int
		var namaJenjang string
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

// GetSemesterList retrieves list of semesters that have kelas kuliah data
func (r *repository) GetSemesterList(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT DISTINCT
			sem.id_smt,
			sem.nm_smt,
			sem.a_periode_aktif
		FROM ref.semester AS sem WITH(NOLOCK)
		INNER JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_smt = sem.id_smt AND kk.soft_delete = 0
		ORDER BY sem.id_smt DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester list: %w", err)
	}
	defer rows.Close()

	var semesterList []map[string]interface{}
	for rows.Next() {
		var idSmt, nmSmt string
		var aPeriodeAktif int
		err := rows.Scan(&idSmt, &nmSmt, &aPeriodeAktif)
		if err != nil {
			continue
		}

		semester := map[string]interface{}{
			"id_smt":          idSmt,
			"nm_smt":          nmSmt,
			"a_periode_aktif": aPeriodeAktif,
		}
		semesterList = append(semesterList, semester)
	}

	return semesterList, nil
}

// GetStats retrieves statistics for kelas kuliah
func (r *repository) GetStats(ctx context.Context) (*KelasKuliahStats, error) {
	query := `
		SELECT
			COUNT(DISTINCT kk.id_kls) AS total_kelas,
			COUNT(DISTINCT aad.id_reg_ptk) AS total_dosen,
			COUNT(DISTINCT kk.id_sms) AS total_prodi,
			COUNT(DISTINCT kk.id_mk) AS total_matkul,
			MAX(kk.last_sync) AS last_sync
		FROM pdrd.kelas_kuliah AS kk WITH(NOLOCK)
		LEFT JOIN pdrd.akt_ajar_dosen AS aad WITH(NOLOCK) ON aad.id_kls = kk.id_kls AND aad.soft_delete = 0
		WHERE kk.soft_delete = 0
	`

	var stats KelasKuliahStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	if stats.LastSync != nil {
		converted := convertToWIB(*stats.LastSync)
		stats.LastSync = &converted
	}

	return &stats, nil
}
