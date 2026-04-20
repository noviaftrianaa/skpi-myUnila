package nilai

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for nilai data access
type Repository interface {
	// Schema management
	EnsureNilaiSchema(ctx context.Context) error

	// Batch helpers
	GetAllNPMs(ctx context.Context) ([]string, error)

	// KHS (nilai_smt_mhs)
	UpsertKHS(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKHSList(ctx context.Context, filter *KHSListFilter) (*PaginatedResult, error)
	GetKHSStats(ctx context.Context) (*KHSStats, error)
	GetKHSFilterOptions(ctx context.Context) (*KHSFilterOptions, error)

	// Transkrip (nilai_transkrip)
	UpsertTranskrip(ctx context.Context, data map[string]interface{}) (bool, error)
	GetTranskripList(ctx context.Context, filter *TranskripListFilter) (*PaginatedResult, error)
	GetTranskripStats(ctx context.Context) (*TranskripStats, error)
	GetTranskripFilterOptions(ctx context.Context) (*TranskripFilterOptions, error)

	// Kuliah (kuliah_mhs)
	UpsertKuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKuliahList(ctx context.Context, filter *KuliahListFilter) (*PaginatedResult, error)
	GetKuliahStats(ctx context.Context) (*KuliahStats, error)
	GetKuliahFilterOptions(ctx context.Context) (*KuliahFilterOptions, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

const defaultUUID = "00000000-0000-0000-0000-000000000000"

func getString(data map[string]interface{}, key string) *string {
	if v, ok := data[key]; ok && v != nil {
		switch s := v.(type) {
		case string:
			if s != "" {
				return &s
			}
		case float64:
			str := fmt.Sprintf("%v", s)
			return &str
		}
	}
	return nil
}

func getFloat(data map[string]interface{}, key string) *float64 {
	if v, ok := data[key]; ok && v != nil {
		switch f := v.(type) {
		case float64:
			return &f
		case float32:
			ff := float64(f)
			return &ff
		}
	}
	return nil
}

func getInt(data map[string]interface{}, key string) *int {
	if v, ok := data[key]; ok && v != nil {
		switch i := v.(type) {
		case float64:
			ii := int(i)
			return &ii
		case int:
			return &i
		}
	}
	return nil
}

func getStringOrDefault(data map[string]interface{}, key, def string) string {
	v := getString(data, key)
	if v == nil {
		return def
	}
	return *v
}

// getSemesterStr extracts id_semester as char(5) string from various types
// API returns int16/float64 like 20241, DB needs char(5) "20241"
func getSemesterStr(data map[string]interface{}, key string) string {
	if v, ok := data[key]; ok && v != nil {
		switch s := v.(type) {
		case string:
			if len(s) >= 5 {
				return s[:5]
			}
			return s
		case float64:
			return fmt.Sprintf("%d", int(s))
		case int:
			return fmt.Sprintf("%d", s)
		case int16:
			return fmt.Sprintf("%d", s)
		}
	}
	return ""
}

// mapStatKuliah maps full status name from API to char(1) for DB
// API returns: "Aktif", "Cuti", "Drop Out", "Keluar", "Lulus", "Non-Aktif", etc.
// DB expects: char(1) — A, C, D, K, L, N, G, M, W
func mapStatKuliah(statKuliah string) string {
	mapping := map[string]string{
		"aktif":        "A",
		"cuti":         "C",
		"drop out":     "D",
		"do":           "D",
		"keluar":       "K",
		"lulus":        "L",
		"non-aktif":    "N",
		"non aktif":    "N",
		"nonaktif":     "N",
		"double degree": "G",
		"mutasi":       "M",
		"wafat":        "W",
	}

	lower := strings.ToLower(strings.TrimSpace(statKuliah))
	if code, ok := mapping[lower]; ok {
		return code
	}

	// If it's already a single char code, use it
	if len(statKuliah) == 1 {
		return strings.ToUpper(statKuliah)
	}

	// Fallback: first char uppercased
	if len(statKuliah) > 0 {
		return strings.ToUpper(statKuliah[:1])
	}

	return "A" // default to Aktif
}

// ========================================
// Schema Management
// ========================================

// EnsureNilaiSchema fixes schema issues for nilai tables before sync
func (r *repository) EnsureNilaiSchema(ctx context.Context) error {
	log.Printf("🔧 [EnsureNilaiSchema] Checking and fixing schema...")

	// 1. Fix nilai_transkrip PK: should be (id_reg_pd, id_mk) not just (id_reg_pd)
	// Check if PK only has 1 column
	fixTranskripPK := `
		DECLARE @pkName NVARCHAR(200)
		SELECT @pkName = kc.CONSTRAINT_NAME
		FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
		JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kc ON tc.CONSTRAINT_NAME = kc.CONSTRAINT_NAME
		WHERE tc.TABLE_SCHEMA = 'siakadu' AND tc.TABLE_NAME = 'nilai_transkrip'
			AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
		GROUP BY kc.CONSTRAINT_NAME
		HAVING COUNT(*) = 1

		IF @pkName IS NOT NULL
		BEGIN
			-- Delete any duplicate (id_reg_pd, id_mk) rows before adding composite PK
			;WITH cte AS (
				SELECT *, ROW_NUMBER() OVER (PARTITION BY id_reg_pd, id_mk ORDER BY last_update DESC) AS rn
				FROM siakadu.nilai_transkrip
			)
			DELETE FROM cte WHERE rn > 1

			EXEC('ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT ' + @pkName)
			ALTER TABLE siakadu.nilai_transkrip ADD CONSTRAINT pk_nilai_transkrip PRIMARY KEY (id_reg_pd, id_mk)
			PRINT 'Fixed nilai_transkrip PK to (id_reg_pd, id_mk)'
		END
	`
	if _, err := r.db.ExecContext(ctx, fixTranskripPK); err != nil {
		log.Printf("⚠️  [EnsureNilaiSchema] Fix transkrip PK: %v", err)
	}

	// 2. Drop blocking FKs that reference potentially empty tables
	dropFKs := []string{
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kuliah_mhs_status_mahasiswa')
		 ALTER TABLE siakadu.kuliah_mhs DROP CONSTRAINT fk_kuliah_mhs_status_mahasiswa`,
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_transkrip_matkul')
		 ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT fk_nilai_transkrip_matkul`,
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_transkrip_kelas_kuliah')
		 ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT fk_nilai_transkrip_kelas_kuliah`,
	}
	for _, q := range dropFKs {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureNilaiSchema] drop FK: %v", err)
		}
	}

	// 3. Ensure status_mahasiswa reference data exists (kuliah_mhs needs it)
	type statMhs struct {
		ID   string
		Name string
	}
	statuses := []statMhs{
		{"A", "Aktif"}, {"C", "Cuti"}, {"D", "Drop Out"}, {"K", "Keluar"},
		{"L", "Lulus"}, {"N", "Non-Aktif"}, {"G", "Double Degree"},
		{"M", "Mutasi"}, {"W", "Wafat"},
	}
	now := time.Now()
	for _, s := range statuses {
		_, err := r.db.ExecContext(ctx, `
			IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = @p1)
			INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
			VALUES (@p1, 1, 1, @p2, @p3, @p3, @p3)
		`, s.ID, s.Name, now)
		if err != nil {
			log.Printf("⚠️  [EnsureNilaiSchema] seed status %s: %v", s.ID, err)
		}
	}

	log.Printf("✅ [EnsureNilaiSchema] Schema checks complete")
	return nil
}

// ========================================
// Batch Helpers
// ========================================

// GetAllNPMs returns all NPMs from mahasiswa for batch sync
func (r *repository) GetAllNPMs(ctx context.Context) ([]string, error) {
	var npms []string
	err := r.db.SelectContext(ctx, &npms,
		"SELECT nim FROM siakadu.mahasiswa WHERE nim IS NOT NULL AND nim != '' ORDER BY nim")
	if err != nil {
		return nil, fmt.Errorf("failed to get NPMs: %w", err)
	}
	return npms, nil
}

// ========================================
// UUID Resolution Helpers
// ========================================

// resolveRegPd resolves npm/nim → id_reg_pd UUID via siakadu.mahasiswa
func (r *repository) resolveRegPd(ctx context.Context, npm string) string {
	var idRegPd string
	err := r.db.GetContext(ctx, &idRegPd,
		"SELECT CAST(id_reg_pd AS VARCHAR(36)) FROM siakadu.mahasiswa WHERE nim = @p1 AND id_reg_pd IS NOT NULL", npm)
	if err == nil && idRegPd != "" {
		return idRegPd
	}
	return ""
}

// resolveIdKls resolves id_kelas (int from API) → id_kls UUID via mapping_kelas
func (r *repository) resolveIdKls(ctx context.Context, idKelas int) string {
	var idKls string
	err := r.db.GetContext(ctx, &idKls,
		"SELECT CAST(id_kls AS VARCHAR(36)) FROM siakadu.mapping_kelas WHERE id_kelas_siakadu = @p1", idKelas)
	if err == nil && idKls != "" {
		return idKls
	}
	return ""
}

// resolveIdMk resolves kode_mk → id_mk UUID via mapping_matkul
func (r *repository) resolveIdMk(ctx context.Context, kodeMK, idUnit string) string {
	var idMk string
	if idUnit != "" {
		err := r.db.GetContext(ctx, &idMk,
			"SELECT CAST(id_mk AS VARCHAR(36)) FROM siakadu.mapping_matkul WHERE kode_mk_siakadu = @p1 AND id_unit_siakadu = @p2",
			kodeMK, idUnit)
		if err == nil && idMk != "" {
			return idMk
		}
	}
	// Fallback: try without id_unit
	err := r.db.GetContext(ctx, &idMk,
		"SELECT TOP 1 CAST(id_mk AS VARCHAR(36)) FROM siakadu.mapping_matkul WHERE kode_mk_siakadu = @p1", kodeMK)
	if err == nil && idMk != "" {
		return idMk
	}
	return ""
}

// ========================================
// KHS Operations
// Schema: siakadu.nilai_smt_mhs
//   PK: (id_reg_pd UUID, id_kls UUID)
//   API fields (JSON keys from SIAKADU):
//     id_kls(int), id_semester(int16), npm, nm_mhs, kode_mk, nm_mk, sks_mk,
//     nilai_huruf, nilai_angka, nilai_index, a_lulus, a_ulang, id_unit
// ========================================

func (r *repository) UpsertKHS(ctx context.Context, data map[string]interface{}) (bool, error) {
	npm := getString(data, "npm")
	if npm == nil {
		return false, fmt.Errorf("npm is required")
	}

	// Resolve npm → id_reg_pd
	idRegPd := r.resolveRegPd(ctx, *npm)
	if idRegPd == "" {
		return false, fmt.Errorf("npm %s not found in reg_pd (sync mahasiswa first)", *npm)
	}

	// Resolve id_kls (int from API) → UUID
	idKlsStr := defaultUUID
	if idKelas := getInt(data, "id_kls"); idKelas != nil {
		if resolved := r.resolveIdKls(ctx, *idKelas); resolved != "" {
			idKlsStr = resolved
		}
	}

	now := time.Now()

	// Try UPDATE by composite PK (id_reg_pd + id_kls)
	updateQuery := `
		UPDATE siakadu.nilai_smt_mhs SET
			nilai_angka = @p1,
			nilai_huruf = @p2,
			nilai_indeks = @p3,
			last_update = @p4,
			last_sync = @p5
		WHERE id_reg_pd = CONVERT(uniqueidentifier, @p6)
			AND id_kls = CONVERT(uniqueidentifier, @p7)
	`
	result, err := r.db.ExecContext(ctx, updateQuery,
		getFloat(data, "nilai_angka"),  // @p1
		getString(data, "nilai_huruf"), // @p2
		getFloat(data, "nilai_index"),  // @p3
		now, now,                       // @p4, @p5
		idRegPd,                        // @p6
		idKlsStr,                       // @p7
	)
	if err != nil {
		return false, fmt.Errorf("failed to update nilai_smt_mhs: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	// INSERT
	insertQuery := `
		INSERT INTO siakadu.nilai_smt_mhs (
			id_reg_pd, id_kls,
			nilai_angka, nilai_huruf, nilai_indeks,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), CONVERT(uniqueidentifier, @p2),
			@p3, @p4, @p5,
			@p6, @p7, @p8, @p9
		)
	`
	_, err = r.db.ExecContext(ctx, insertQuery,
		idRegPd,                        // @p1
		idKlsStr,                       // @p2
		getFloat(data, "nilai_angka"),  // @p3
		getString(data, "nilai_huruf"), // @p4
		getFloat(data, "nilai_index"),  // @p5
		now, defaultUUID, now, now,     // @p6-9
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert nilai_smt_mhs: %w", err)
	}
	return true, nil
}

func (r *repository) GetKHSList(ctx context.Context, filter *KHSListFilter) (*PaginatedResult, error) {
	page := filter.Page
	limit := filter.Limit
	offset := (page - 1) * limit
	where := []string{}
	args := []interface{}{}
	pi := 1

	if filter.NIM != "" {
		where = append(where, fmt.Sprintf("m.nim = @p%d", pi))
		args = append(args, filter.NIM)
		pi++
	}
	if filter.IdSmt != "" {
		where = append(where, fmt.Sprintf("kk.id_smt = @p%d", pi))
		args = append(args, filter.IdSmt)
		pi++
	}
	if filter.IdUnit != "" {
		where = append(where, fmt.Sprintf("m.id_unit = @p%d", pi))
		args = append(args, filter.IdUnit)
		pi++
	}
	if filter.Angkatan != "" {
		where = append(where, fmt.Sprintf("m.angkatan = @p%d", pi))
		args = append(args, filter.Angkatan)
		pi++
	}
	if filter.Search != "" {
		where = append(where, fmt.Sprintf("(mk.nm_mk LIKE @p%d OR m.nim LIKE @p%d OR m.nama LIKE @p%d)", pi, pi, pi))
		args = append(args, "%"+filter.Search+"%")
		pi++
	}

	wc := ""
	if len(where) > 0 {
		wc = "WHERE " + strings.Join(where, " AND ")
	}

	// Validate sort_by against whitelist
	sortBy := "m.nim"
	allowedSorts := map[string]string{
		"nim":          "m.nim",
		"id_semester":  "kk.id_smt",
		"kode_mk":     "mk.kode_mk",
		"nilai_huruf":  "n.nilai_huruf",
		"nilai_angka":  "n.nilai_angka",
	}
	if col, ok := allowedSorts[filter.SortBy]; ok {
		sortBy = col
	}
	sortOrder := "ASC"
	if strings.EqualFold(filter.SortOrder, "desc") {
		sortOrder = "DESC"
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM siakadu.nilai_smt_mhs n
		INNER JOIN siakadu.kuliah_mhs km2 ON km2.id_reg_pd = n.id_reg_pd
		INNER JOIN siakadu.mahasiswa m ON m.nim = km2.nim
		LEFT JOIN siakadu.kelas_kuliah kk ON n.id_kls = kk.id_kls
		LEFT JOIN siakadu.matkul mk ON kk.id_mk = mk.id_mk %s`, wc)
	err := r.db.GetContext(ctx, &total, countQ, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count khs: %w", err)
	}

	dataQ := fmt.Sprintf(`
		SELECT m.nim, m.nama AS nama_mahasiswa,
			ISNULL(jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END, m.nm_prodi) AS nm_prodi,
			m.angkatan,
			kk.id_smt AS id_semester,
			ISNULL(mk.kode_mk, '') AS kode_mk, ISNULL(mk.nm_mk, '') AS nama_mk,
			mk.sks_mk, n.nilai_huruf, n.nilai_angka, n.nilai_indeks AS nilai_index,
			n.last_sync
		FROM siakadu.nilai_smt_mhs n
		INNER JOIN siakadu.kuliah_mhs km2 ON km2.id_reg_pd = n.id_reg_pd
		INNER JOIN siakadu.mahasiswa m ON m.nim = km2.nim
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		LEFT JOIN siakadu.kelas_kuliah kk ON n.id_kls = kk.id_kls
		LEFT JOIN siakadu.matkul mk ON kk.id_mk = mk.id_mk
		%s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, wc, sortBy, sortOrder, pi, pi+1)
	dataArgs := append(args, offset, limit)
	var list []*KHSListItem
	err = r.db.SelectContext(ctx, &list, dataQ, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get khs list: %w", err)
	}

	return &PaginatedResult{Data: list, Total: total, Page: page, Limit: limit, TotalPages: (total + limit - 1) / limit}, nil
}

func (r *repository) GetKHSStats(ctx context.Context) (*KHSStats, error) {
	stats := &KHSStats{}
	err := r.db.GetContext(ctx, &stats.TotalRecords,
		"SELECT COUNT(*) FROM siakadu.nilai_smt_mhs")
	if err != nil {
		return nil, fmt.Errorf("failed to get khs count: %w", err)
	}
	_ = r.db.GetContext(ctx, &stats.LastSync,
		"SELECT MAX(last_sync) FROM siakadu.nilai_smt_mhs")
	return stats, nil
}

func (r *repository) GetKHSFilterOptions(ctx context.Context) (*KHSFilterOptions, error) {
	opts := &KHSFilterOptions{}

	// Distinct semesters from kelas_kuliah joined via nilai_smt_mhs
	var semesters []string
	err := r.db.SelectContext(ctx, &semesters, `
		SELECT DISTINCT kk.id_smt
		FROM siakadu.nilai_smt_mhs n
		INNER JOIN siakadu.kelas_kuliah kk ON kk.id_kls = n.id_kls
		WHERE kk.id_smt IS NOT NULL
		ORDER BY kk.id_smt DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester options: %w", err)
	}
	opts.Semester = semesters

	// Distinct prodi via pdrd.sms JOIN (same pattern as kuliah)
	var prodis []KuliahProdiOption
	err = r.db.SelectContext(ctx, &prodis, `
		SELECT
			sub.id_unit,
			jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END AS nm_prodi
		FROM (
			SELECT DISTINCT m.id_unit, m.id_sms
			FROM siakadu.nilai_smt_mhs n
			INNER JOIN siakadu.kuliah_mhs km2 ON km2.id_reg_pd = n.id_reg_pd
			INNER JOIN siakadu.mahasiswa m ON m.nim = km2.nim
			WHERE m.id_unit IS NOT NULL AND m.id_sms IS NOT NULL
		) sub
		INNER JOIN pdrd.sms s ON s.id_sms = sub.id_sms AND s.soft_delete = 0
		INNER JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		ORDER BY jp.id_jenj_didik, s.nm_lemb`)
	if err != nil {
		// Fallback to mahasiswa nm_prodi
		err = r.db.SelectContext(ctx, &prodis, `
			SELECT DISTINCT m.id_unit, m.nm_prodi
			FROM siakadu.nilai_smt_mhs n
			INNER JOIN siakadu.kuliah_mhs km2 ON km2.id_reg_pd = n.id_reg_pd
			INNER JOIN siakadu.mahasiswa m ON m.nim = km2.nim
			WHERE m.id_unit IS NOT NULL AND m.nm_prodi IS NOT NULL
			ORDER BY m.nm_prodi`)
		if err != nil {
			return nil, fmt.Errorf("failed to get prodi options: %w", err)
		}
	}
	opts.Prodi = prodis

	// Distinct angkatan
	var angkatanList []string
	err = r.db.SelectContext(ctx, &angkatanList, `
		SELECT DISTINCT m.angkatan
		FROM siakadu.nilai_smt_mhs n
		INNER JOIN siakadu.kuliah_mhs km2 ON km2.id_reg_pd = n.id_reg_pd
			INNER JOIN siakadu.mahasiswa m ON m.nim = km2.nim
		WHERE m.angkatan IS NOT NULL
		ORDER BY m.angkatan DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan options: %w", err)
	}
	opts.Angkatan = angkatanList

	return opts, nil
}

// ========================================
// Transkrip Operations
// Schema: siakadu.nilai_transkrip
//   PK: (id_reg_pd UUID, id_mk UUID) — FIXED: was (id_reg_pd) only
//   API fields (JSON keys from SIAKADU):
//     id_semester(int16), nm_semester, npm, nm_mhs, id_kurikulum(int16),
//     kode_mk, nm_mk, sks_mk(int8), nilai_huruf, nilai_index, nilai_bobot,
//     a_lulus, smt_mk(string — semester ke-N), jns_mk
// ========================================

func (r *repository) UpsertTranskrip(ctx context.Context, data map[string]interface{}) (bool, error) {
	npm := getString(data, "npm")
	if npm == nil {
		return false, fmt.Errorf("npm is required")
	}

	idRegPd := r.resolveRegPd(ctx, *npm)
	if idRegPd == "" {
		return false, fmt.Errorf("npm %s not found in reg_pd", *npm)
	}

	// Resolve kode_mk → id_mk
	idMkStr := defaultUUID
	kodeMK := getString(data, "kode_mk")
	idUnit := getStringOrDefault(data, "id_unit", "")
	if kodeMK != nil {
		if resolved := r.resolveIdMk(ctx, *kodeMK, idUnit); resolved != "" {
			idMkStr = resolved
		}
	}

	now := time.Now()
	sksVal := getFloat(data, "sks_mk")
	var sksMk float64 = 0
	if sksVal != nil {
		sksMk = *sksVal
	}

	// smt_ke from smt_mk field (semester ke-N, e.g., "1", "2", "3")
	// NOT from id_semester which is period like 20241
	var smtKe int = 1
	if smtMk := getString(data, "smt_mk"); smtMk != nil {
		var parsed int
		if _, err := fmt.Sscanf(*smtMk, "%d", &parsed); err == nil && parsed > 0 {
			smtKe = parsed
		}
	}

	// Try UPDATE by composite PK (id_reg_pd + id_mk)
	updateQuery := `
		UPDATE siakadu.nilai_transkrip SET
			nilai_angka = @p1,
			nilai_huruf = @p2,
			nilai_indeks = @p3,
			sks_mk = @p4,
			smt_ke = @p5,
			last_update = @p6,
			last_sync = @p7
		WHERE id_reg_pd = CONVERT(uniqueidentifier, @p8)
			AND id_mk = CONVERT(uniqueidentifier, @p9)
	`
	result, err := r.db.ExecContext(ctx, updateQuery,
		getFloat(data, "nilai_angka"),  // @p1 (transkrip may not have this)
		getString(data, "nilai_huruf"), // @p2
		getFloat(data, "nilai_index"),  // @p3
		sksMk,                          // @p4
		smtKe,                          // @p5
		now, now,                       // @p6, @p7
		idRegPd,                        // @p8
		idMkStr,                        // @p9
	)
	if err != nil {
		return false, fmt.Errorf("failed to update nilai_transkrip: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	// INSERT
	insertQuery := `
		INSERT INTO siakadu.nilai_transkrip (
			id_reg_pd, id_mk,
			nilai_angka, nilai_huruf, nilai_indeks,
			smt_ke, sks_mk,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), CONVERT(uniqueidentifier, @p2),
			@p3, @p4, @p5,
			@p6, @p7,
			@p8, @p9, @p10, @p11
		)
	`
	_, err = r.db.ExecContext(ctx, insertQuery,
		idRegPd, idMkStr,
		getFloat(data, "nilai_angka"),
		getString(data, "nilai_huruf"),
		getFloat(data, "nilai_index"),
		smtKe, sksMk,
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert nilai_transkrip: %w", err)
	}
	return true, nil
}

func (r *repository) GetTranskripList(ctx context.Context, filter *TranskripListFilter) (*PaginatedResult, error) {
	page := filter.Page
	limit := filter.Limit
	offset := (page - 1) * limit
	where := []string{}
	args := []interface{}{}
	pi := 1

	if filter.NIM != "" {
		where = append(where, fmt.Sprintf("m.nim = @p%d", pi))
		args = append(args, filter.NIM)
		pi++
	}
	if filter.Search != "" {
		where = append(where, fmt.Sprintf("(mk.nm_mk LIKE @p%d OR m.nim LIKE @p%d OR m.nama LIKE @p%d)", pi, pi, pi))
		args = append(args, "%"+filter.Search+"%")
		pi++
	}
	if filter.IdUnit != "" {
		where = append(where, fmt.Sprintf("m.id_unit = @p%d", pi))
		args = append(args, filter.IdUnit)
		pi++
	}
	if filter.Angkatan != "" {
		where = append(where, fmt.Sprintf("m.angkatan = @p%d", pi))
		args = append(args, filter.Angkatan)
		pi++
	}

	wc := ""
	if len(where) > 0 {
		wc = "WHERE " + strings.Join(where, " AND ")
	}

	// Validate sort_by against whitelist
	sortBy := "m.nim"
	allowedSorts := map[string]string{
		"nim":         "m.nim",
		"nama":        "m.nama",
		"kode_mk":     "mk.kode_mk",
		"nama_mk":     "mk.nm_mk",
		"nilai_huruf": "nt.nilai_huruf",
		"nilai_index": "nt.nilai_indeks",
		"smt_ke":      "nt.smt_ke",
	}
	if col, ok := allowedSorts[filter.SortBy]; ok {
		sortBy = col
	}
	sortOrder := "ASC"
	if strings.EqualFold(filter.SortOrder, "desc") {
		sortOrder = "DESC"
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM siakadu.nilai_transkrip nt
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = nt.id_reg_pd AND rp.soft_delete = 0
		LEFT JOIN siakadu.mahasiswa m ON m.nim = rp.nipd
		LEFT JOIN siakadu.matkul mk ON nt.id_mk = mk.id_mk %s`, wc)
	err := r.db.GetContext(ctx, &total, countQ, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count transkrip: %w", err)
	}

	dataQ := fmt.Sprintf(`
		SELECT rp.nipd AS nim, ISNULL(m.nama, '') AS nama_mahasiswa,
			ISNULL(jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END, ISNULL(m.nm_prodi, '')) AS nm_prodi,
			m.angkatan,
			ISNULL(mk.kode_mk, '') AS kode_mk, ISNULL(mk.nm_mk, '') AS nama_mk,
			nt.sks_mk, nt.nilai_huruf, nt.nilai_indeks AS nilai_index,
			nt.smt_ke, nt.last_sync
		FROM siakadu.nilai_transkrip nt
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = nt.id_reg_pd AND rp.soft_delete = 0
		LEFT JOIN siakadu.mahasiswa m ON m.nim = rp.nipd
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		LEFT JOIN siakadu.matkul mk ON nt.id_mk = mk.id_mk
		%s ORDER BY %s %s, nt.smt_ke ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, wc, sortBy, sortOrder, pi, pi+1)
	dataArgs := append(args, offset, limit)
	var list []*TranskripListItem
	err = r.db.SelectContext(ctx, &list, dataQ, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get transkrip list: %w", err)
	}

	return &PaginatedResult{Data: list, Total: total, Page: page, Limit: limit, TotalPages: (total + limit - 1) / limit}, nil
}

func (r *repository) GetTranskripStats(ctx context.Context) (*TranskripStats, error) {
	stats := &TranskripStats{}
	err := r.db.GetContext(ctx, &stats.TotalRecords,
		"SELECT COUNT(*) FROM siakadu.nilai_transkrip")
	if err != nil {
		return nil, fmt.Errorf("failed to get transkrip count: %w", err)
	}
	_ = r.db.GetContext(ctx, &stats.LastSync,
		"SELECT MAX(last_sync) FROM siakadu.nilai_transkrip")
	return stats, nil
}

func (r *repository) GetTranskripFilterOptions(ctx context.Context) (*TranskripFilterOptions, error) {
	opts := &TranskripFilterOptions{}

	// Distinct prodi via pdrd.sms JOIN
	var prodis []KuliahProdiOption
	err := r.db.SelectContext(ctx, &prodis, `
		SELECT
			m.id_unit,
			jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END AS nm_prodi
		FROM (
			SELECT DISTINCT m2.id_unit, m2.id_sms
			FROM siakadu.nilai_transkrip nt
			LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = nt.id_reg_pd AND rp.soft_delete = 0
			LEFT JOIN siakadu.mahasiswa m2 ON m2.nim = rp.nipd
			WHERE m2.id_unit IS NOT NULL AND m2.id_sms IS NOT NULL
		) m
		INNER JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		INNER JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		ORDER BY 2`)
	if err != nil {
		// Fallback to mahasiswa nm_prodi
		err = r.db.SelectContext(ctx, &prodis, `
			SELECT DISTINCT m.id_unit, m.nm_prodi
			FROM siakadu.nilai_transkrip nt
			LEFT JOIN pdrd.reg_pd rp2 ON rp2.id_reg_pd = nt.id_reg_pd AND rp2.soft_delete = 0
		LEFT JOIN siakadu.mahasiswa m ON m.nim = rp2.nipd
			WHERE m.id_unit IS NOT NULL AND m.nm_prodi IS NOT NULL
			ORDER BY m.nm_prodi`)
		if err != nil {
			return nil, fmt.Errorf("failed to get prodi options: %w", err)
		}
	}
	opts.Prodi = prodis

	// Distinct angkatan
	var angkatanList []string
	err = r.db.SelectContext(ctx, &angkatanList, `
		SELECT DISTINCT m.angkatan
		FROM siakadu.nilai_transkrip nt
		LEFT JOIN pdrd.reg_pd rp2 ON rp2.id_reg_pd = nt.id_reg_pd AND rp2.soft_delete = 0
		LEFT JOIN siakadu.mahasiswa m ON m.nim = rp2.nipd
		WHERE m.angkatan IS NOT NULL
		ORDER BY m.angkatan DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan options: %w", err)
	}
	opts.Angkatan = angkatanList

	return opts, nil
}

// ========================================
// Kuliah Operations
// Schema: siakadu.kuliah_mhs
//   PK: (id_reg_pd UUID, id_smt char(5))
//   API fields (JSON keys from SIAKADU):
//     npm, id_semester(int16), nama_periode, smt_kuliah, smt_mk,
//     stat_kuliah(string full name!), stat_akademik, stat_keuangan,
//     sks_smt(int8), ips(*float32), total_sks(int), ipk(*float32),
//     sks_lulus(int), ipk_lulus(*float32), ukt, tgl_bayar, sumber_dana,
//     dosen_wali, dosen_penasehat, nip_dosen, no_sk, tgl_sk
// ========================================

func (r *repository) UpsertKuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	npm := getString(data, "npm")
	if npm == nil {
		return false, fmt.Errorf("npm is required")
	}

	idRegPd := r.resolveRegPd(ctx, *npm)
	if idRegPd == "" {
		return false, fmt.Errorf("npm %s not found in reg_pd", *npm)
	}

	// id_semester: API returns int16 (e.g., 20241), DB needs char(5)
	idSmtStr := getSemesterStr(data, "id_semester")
	if idSmtStr == "" {
		idSmtStr = "20241" // fallback
	}
	if len(idSmtStr) > 5 {
		idSmtStr = idSmtStr[:5]
	}

	// Map stat_kuliah: API returns full name ("Aktif"), DB needs char(1) ("A")
	statKuliah := mapStatKuliah(getStringOrDefault(data, "stat_kuliah", "A"))

	now := time.Now()

	// Try UPDATE (v2.0: also set nim)
	updateQuery := `
		UPDATE siakadu.kuliah_mhs SET
			id_stat_mhs = @p1,
			ips = @p2,
			sks_semester = @p3,
			ipk = @p4,
			total_sks = @p5,
			nim = @p6,
			last_update = @p7,
			last_sync = @p8
		WHERE id_reg_pd = CONVERT(uniqueidentifier, @p9) AND id_smt = @p10
	`
	result, err := r.db.ExecContext(ctx, updateQuery,
		statKuliah,                  // @p1
		getFloat(data, "ips"),       // @p2
		getFloat(data, "sks_smt"),   // @p3
		getFloat(data, "ipk"),       // @p4
		getFloat(data, "total_sks"), // @p5
		npm,                         // @p6 nim
		now, now,                    // @p7, @p8
		idRegPd, idSmtStr,           // @p9, @p10
	)
	if err != nil {
		return false, fmt.Errorf("failed to update kuliah_mhs: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	// INSERT (v2.0: include nim column)
	insertQuery := `
		INSERT INTO siakadu.kuliah_mhs (
			id_reg_pd, id_smt, id_stat_mhs,
			ips, sks_semester, ipk, total_sks,
			nim,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), @p2, @p3,
			@p4, @p5, @p6, @p7,
			@p8,
			@p9, @p10, @p11, @p12
		)
	`
	_, err = r.db.ExecContext(ctx, insertQuery,
		idRegPd, idSmtStr, statKuliah,
		getFloat(data, "ips"),
		getFloat(data, "sks_smt"),
		getFloat(data, "ipk"),
		getFloat(data, "total_sks"),
		npm,
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert kuliah_mhs: %w", err)
	}
	return true, nil
}

func (r *repository) GetKuliahList(ctx context.Context, filter *KuliahListFilter) (*PaginatedResult, error) {
	page := filter.Page
	limit := filter.Limit
	offset := (page - 1) * limit
	where := []string{}
	args := []interface{}{}
	pi := 1

	if filter.Search != "" {
		where = append(where, fmt.Sprintf("(km.nim LIKE @p%d OR m.nama LIKE @p%d)", pi, pi))
		args = append(args, "%"+filter.Search+"%")
		pi++
	}
	if filter.IdSmt != "" {
		where = append(where, fmt.Sprintf("km.id_smt = @p%d", pi))
		args = append(args, filter.IdSmt)
		pi++
	}
	if filter.IdUnit != "" {
		where = append(where, fmt.Sprintf("m.id_unit = @p%d", pi))
		args = append(args, filter.IdUnit)
		pi++
	}
	if filter.Angkatan != "" {
		where = append(where, fmt.Sprintf("m.angkatan = @p%d", pi))
		args = append(args, filter.Angkatan)
		pi++
	}
	if filter.Status != "" {
		where = append(where, fmt.Sprintf("km.id_stat_mhs = @p%d", pi))
		args = append(args, filter.Status)
		pi++
	}

	wc := ""
	if len(where) > 0 {
		wc = "WHERE " + strings.Join(where, " AND ")
	}

	// Validate sort_by against whitelist
	sortBy := "km.nim"
	allowedSorts := map[string]string{
		"nim":   "km.nim",
		"id_smt": "km.id_smt",
		"ips":   "km.ips",
		"ipk":   "km.ipk",
	}
	if col, ok := allowedSorts[filter.SortBy]; ok {
		sortBy = col
	}
	sortOrder := "ASC"
	if strings.EqualFold(filter.SortOrder, "desc") {
		sortOrder = "DESC"
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM siakadu.kuliah_mhs km
		INNER JOIN siakadu.mahasiswa m ON m.nim = km.nim %s`, wc)
	err := r.db.GetContext(ctx, &total, countQ, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kuliah: %w", err)
	}

	dataQ := fmt.Sprintf(`
		SELECT km.nim, m.nama AS nama_mahasiswa,
			ISNULL(jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END, m.nm_prodi) AS nm_prodi,
			m.angkatan,
			km.id_smt AS id_semester,
			km.id_stat_mhs AS status_kuliah,
			km.ips, km.sks_semester AS sks_smt, km.ipk, km.total_sks,
			km.last_sync
		FROM siakadu.kuliah_mhs km
		INNER JOIN siakadu.mahasiswa m ON m.nim = km.nim
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		%s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, wc, sortBy, sortOrder, pi, pi+1)
	dataArgs := append(args, offset, limit)
	var list []*KuliahListItem
	err = r.db.SelectContext(ctx, &list, dataQ, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kuliah list: %w", err)
	}

	return &PaginatedResult{Data: list, Total: total, Page: page, Limit: limit, TotalPages: (total + limit - 1) / limit}, nil
}

func (r *repository) GetKuliahStats(ctx context.Context) (*KuliahStats, error) {
	stats := &KuliahStats{}
	err := r.db.GetContext(ctx, &stats.TotalRecords,
		"SELECT COUNT(*) FROM siakadu.kuliah_mhs")
	if err != nil {
		return nil, fmt.Errorf("failed to get kuliah count: %w", err)
	}
	_ = r.db.GetContext(ctx, &stats.LastSync,
		"SELECT MAX(last_sync) FROM siakadu.kuliah_mhs")
	return stats, nil
}

func (r *repository) GetKuliahFilterOptions(ctx context.Context) (*KuliahFilterOptions, error) {
	opts := &KuliahFilterOptions{}

	// Distinct semesters from kuliah_mhs
	var semesters []string
	err := r.db.SelectContext(ctx, &semesters, `
		SELECT DISTINCT id_smt
		FROM siakadu.kuliah_mhs
		WHERE id_smt IS NOT NULL
		ORDER BY id_smt DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get semester options: %w", err)
	}
	opts.Semester = semesters

	// Distinct prodi via pdrd.sms JOIN (same pattern as mahasiswa)
	var prodis []KuliahProdiOption
	err = r.db.SelectContext(ctx, &prodis, `
		SELECT
			m.id_unit,
			jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END AS nm_prodi
		FROM (
			SELECT DISTINCT m2.id_unit, m2.id_sms
			FROM siakadu.kuliah_mhs km
			INNER JOIN siakadu.mahasiswa m2 ON m2.nim = km.nim
			WHERE m2.id_unit IS NOT NULL AND m2.id_sms IS NOT NULL
		) m
		INNER JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		INNER JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		ORDER BY jp.id_jenj_didik, s.nm_lemb`)
	if err != nil {
		// Fallback to mahasiswa nm_prodi
		err = r.db.SelectContext(ctx, &prodis, `
			SELECT DISTINCT m.id_unit, m.nm_prodi
			FROM siakadu.kuliah_mhs km
			INNER JOIN siakadu.mahasiswa m ON m.nim = km.nim
			WHERE m.id_unit IS NOT NULL AND m.nm_prodi IS NOT NULL
			ORDER BY m.nm_prodi`)
		if err != nil {
			return nil, fmt.Errorf("failed to get prodi options: %w", err)
		}
	}
	opts.Prodi = prodis

	// Distinct angkatan
	var angkatanList []string
	err = r.db.SelectContext(ctx, &angkatanList, `
		SELECT DISTINCT m.angkatan
		FROM siakadu.kuliah_mhs km
		INNER JOIN siakadu.mahasiswa m ON m.nim = km.nim
		WHERE m.angkatan IS NOT NULL
		ORDER BY m.angkatan DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan options: %w", err)
	}
	opts.Angkatan = angkatanList

	// Distinct status — map char(1) codes to readable names
	var statusList []string
	err = r.db.SelectContext(ctx, &statusList, `
		SELECT DISTINCT
			CASE km.id_stat_mhs
				WHEN 'A' THEN 'Aktif' WHEN 'C' THEN 'Cuti' WHEN 'D' THEN 'Drop Out'
				WHEN 'K' THEN 'Keluar' WHEN 'L' THEN 'Lulus' WHEN 'N' THEN 'Non-Aktif'
				WHEN 'G' THEN 'Double Degree' WHEN 'M' THEN 'Mutasi' WHEN 'W' THEN 'Wafat'
				ELSE km.id_stat_mhs
			END AS status_label
		FROM siakadu.kuliah_mhs km
		WHERE km.id_stat_mhs IS NOT NULL
		ORDER BY status_label`)
	if err != nil {
		return nil, fmt.Errorf("failed to get status options: %w", err)
	}
	opts.Status = statusList

	return opts, nil
}
