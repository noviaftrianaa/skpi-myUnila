package akademik

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for akademik data access
type Repository interface {
	EnsureAkademikSchema(ctx context.Context) error

	// Kelas
	UpsertKelasKuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)

	// Kurikulum
	UpsertKurikulum(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)

	// MataKuliah
	UpsertMatakuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)

	// Jadwal
	UpsertJadwalKelas(ctx context.Context, data map[string]interface{}) (bool, error)
	GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)

	// Batch helpers
	GetAllProdiIDs(ctx context.Context) ([]ProdiInfo, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// Helper functions
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

func getStringOrDefault(data map[string]interface{}, key, def string) string {
	v := getString(data, key)
	if v == nil {
		return def
	}
	return *v
}

const defaultUUID = "00000000-0000-0000-0000-000000000000"

// EnsureAkademikSchema creates mapping tables + seeds reference data
func (r *repository) EnsureAkademikSchema(ctx context.Context) error {
	now := time.Now()

	// 1. Create mapping tables
	mappingTables := []string{
		`IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_matkul')
		 CREATE TABLE siakadu.mapping_matkul (
			kode_mk_siakadu varchar(20) NOT NULL,
			id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
			id_mk uniqueidentifier NOT NULL,
			a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0,
			create_date datetime NOT NULL DEFAULT GETDATE(),
			CONSTRAINT pk_mapping_matkul PRIMARY KEY (kode_mk_siakadu, id_unit_siakadu)
		 )`,
		`IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_kurikulum')
		 CREATE TABLE siakadu.mapping_kurikulum (
			kode_mk_siakadu varchar(20) NOT NULL,
			thn_kurikulum int NOT NULL,
			id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
			id_kurikulum_sp uniqueidentifier NOT NULL,
			id_mk uniqueidentifier NOT NULL,
			a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0,
			create_date datetime NOT NULL DEFAULT GETDATE(),
			CONSTRAINT pk_mapping_kurikulum PRIMARY KEY (kode_mk_siakadu, thn_kurikulum)
		 )`,
	}
	for _, q := range mappingTables {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureAkademikSchema] create table: %v", err)
		}
	}

	// 2. Seed jenjang_pendidikan (PDDIKTI standard)
	type jenjang struct {
		ID   int
		Name string
	}
	jenjangs := []jenjang{
		{1, "SD"}, {2, "SMP"}, {3, "SMA/SMK"}, {4, "D1"}, {5, "D2"},
		{6, "D3"}, {7, "D4"}, {8, "S1"}, {9, "Profesi"}, {10, "S2"},
		{11, "Sp1"}, {12, "S3"}, {13, "Sp2"}, {14, "S1 Terapan"},
		{15, "S2 Terapan"}, {16, "S3 Terapan"},
	}
	for _, j := range jenjangs {
		_, _ = r.db.ExecContext(ctx, `
			IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = @p1)
			INSERT INTO siakadu.jenjang_pendidikan
				(id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3)
		`, j.ID, j.Name, now)
	}

	// 3. Seed semester for common periods (20001 - 20251)
	// Format: YYYYS where S=1(ganjil) or 2(genap)
	// Seed semester 2000-2026, 3 variants per year (1=ganjil, 2=genap, 3=antara)
	smtNames := map[int]string{1: "Ganjil", 2: "Genap", 3: "Antara"}
	for yr := 2000; yr <= 2025; yr++ {
		for smtN := 1; smtN <= 3; smtN++ {
			idSmt := fmt.Sprintf("%d%d", yr, smtN)
			nmSmt := fmt.Sprintf("%s %d/%d", smtNames[smtN], yr, yr+1)
			_, _ = r.db.ExecContext(ctx, `
				IF NOT EXISTS (SELECT 1 FROM siakadu.semester WHERE id_smt = @p1)
				INSERT INTO siakadu.semester
					(id_smt, nm_smt, id_thn_ajaran, smt, tgl_mulai, tgl_selesai, create_date, last_update, last_sync)
				VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p7, @p7)
			`, idSmt, nmSmt, yr, smtN, now, now, now)
		}
	}

	// 4. Drop problematic FKs that block sync (id_sms in kelas_kuliah, id_sms in matkul)
	// These reference sms (prodi) table which may be empty during initial sync
	dropFKs := []string{
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kelas_kuliah_sms')
		 ALTER TABLE siakadu.kelas_kuliah DROP CONSTRAINT fk_kelas_kuliah_sms`,
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_matkul_sms')
		 ALTER TABLE siakadu.matkul DROP CONSTRAINT fk_matkul_sms`,
	}
	for _, q := range dropFKs {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureAkademikSchema] drop FK: %v", err)
		}
	}

	// 5. Fix column sizes if needed
	colFixes := []string{
		`IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'id_jns_mk' AND max_length = 1)
		 ALTER TABLE siakadu.matkul ALTER COLUMN id_jns_mk varchar(5) NULL`,
		`IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'jns_mk' AND max_length = 1)
		 ALTER TABLE siakadu.matkul ALTER COLUMN jns_mk varchar(5) NULL`,
		`IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'kel_mk' AND max_length = 1)
		 ALTER TABLE siakadu.matkul ALTER COLUMN kel_mk varchar(5) NULL`,
		`IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'id_kel_mk' AND max_length = 1)
		 ALTER TABLE siakadu.matkul ALTER COLUMN id_kel_mk varchar(5) NULL`,
	}
	for _, q := range colFixes {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureAkademikSchema] col fix: %v", err)
		}
	}

	log.Printf("✅ [EnsureAkademikSchema] Mapping tables + reference data ensured")
	return nil
}

// ========================================
// lookupOrCreateMatkul resolves kode_mk → id_mk UUID
// Creates matkul record if not exists, returns UUID
// ========================================
func (r *repository) lookupOrCreateMatkul(ctx context.Context, data map[string]interface{}) (string, error) {
	kodeMK := getString(data, "kode_mk")
	if kodeMK == nil {
		return "", fmt.Errorf("kode_mk is required")
	}
	idUnit := getStringOrDefault(data, "id_unit", "")

	// Check mapping first
	var idMKStr string
	err := r.db.GetContext(ctx, &idMKStr,
		"SELECT CAST(id_mk AS VARCHAR(36)) FROM siakadu.mapping_matkul WHERE kode_mk_siakadu = @p1 AND id_unit_siakadu = @p2",
		*kodeMK, idUnit)
	if err == nil && idMKStr != "" {
		return idMKStr, nil
	}

	// Create new matkul + mapping
	newIDMK := uuid.New().String()
	now := time.Now()

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.matkul (
			id_mk, kode_mk, nm_mk, sks_mk, id_jns_mk,
			id_jenj_didik,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), @p2, @p3, @p4, @p5,
			@p6,
			@p7, @p8, @p9, @p10
		)
	`,
		newIDMK,                         // @p1
		*kodeMK,                         // @p2
		getString(data, "nm_mk"),        // @p3
		getFloat(data, "sks_mk"),        // @p4
		getString(data, "id_jns_mk"),    // @p5
		3,                               // @p6 id_jenj_didik NOT NULL (3=S1)
		now, defaultUUID, now, now,
	)
	if err != nil {
		return "", fmt.Errorf("failed to insert matkul: %w", err)
	}

	// Create mapping
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.mapping_matkul (kode_mk_siakadu, id_unit_siakadu, id_mk, create_date)
		VALUES (@p1, @p2, CONVERT(uniqueidentifier, @p3), @p4)
	`, *kodeMK, idUnit, newIDMK, now)

	return newIDMK, nil
}

// ========================================
// MataKuliah Operations
// API fields: kode_mk, nm_mk, sks_mk, id_jns_mk, id_unit, thn_kurikulum
// Schema: siakadu.matkul (PK: id_mk UUID)
// Mapping: mapping_matkul (kode_mk+id_unit → id_mk UUID)
// ========================================

func (r *repository) UpsertMatakuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	kodeMK := getString(data, "kode_mk")
	if kodeMK == nil {
		return false, fmt.Errorf("kode_mk is required")
	}
	idUnit := getStringOrDefault(data, "id_unit", "")
	now := time.Now()

	// Check if already mapped
	var existingIDMK string
	err := r.db.GetContext(ctx, &existingIDMK,
		"SELECT CAST(id_mk AS VARCHAR(36)) FROM siakadu.mapping_matkul WHERE kode_mk_siakadu = @p1 AND id_unit_siakadu = @p2",
		*kodeMK, idUnit)

	if err == nil && existingIDMK != "" {
		// Update existing matkul
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.matkul SET
				nm_mk = @p1, sks_mk = @p2, id_jns_mk = @p3,
				last_update = @p4, last_sync = @p5
			WHERE id_mk = CONVERT(uniqueidentifier, @p6)
		`,
			getString(data, "nm_mk"),     // @p1
			getFloat(data, "sks_mk"),     // @p2
			getString(data, "id_jns_mk"), // @p3
			now, now,                     // @p4, @p5
			existingIDMK,                 // @p6
		)
		if err != nil {
			return false, fmt.Errorf("failed to update matkul: %w", err)
		}
		return false, nil
	}

	// Insert new
	newIDMK := uuid.New().String()
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.matkul (
			id_mk, kode_mk, nm_mk, sks_mk, id_jns_mk,
			id_jenj_didik,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), @p2, @p3, @p4, @p5,
			@p6,
			@p7, @p8, @p9, @p10
		)
	`,
		newIDMK,                         // @p1
		*kodeMK,                         // @p2
		getString(data, "nm_mk"),        // @p3
		getFloat(data, "sks_mk"),        // @p4
		getString(data, "id_jns_mk"),    // @p5
		3,                               // @p6 id_jenj_didik
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert matkul: %w", err)
	}

	// Create mapping
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.mapping_matkul (kode_mk_siakadu, id_unit_siakadu, id_mk, create_date)
		VALUES (@p1, @p2, CONVERT(uniqueidentifier, @p3), @p4)
	`, *kodeMK, idUnit, newIDMK, now)

	return true, nil
}

func (r *repository) GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(nm_mk LIKE @p%d OR kode_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.matkul %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count matakuliah: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT CAST(id_mk AS VARCHAR(36)) AS id_mata_kuliah,
			ISNULL(nm_mk, '') AS nama_mata_kuliah,
			ISNULL(kode_mk, '') AS kode_mk,
			sks_mk AS sks,
			last_sync
		FROM siakadu.matkul
		%s ORDER BY nm_mk ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*MatakuliahListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get matakuliah list: %w", err)
	}

	return &PaginatedResult{
		Data: list, Total: total, Page: page, Limit: limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// ========================================
// Kurikulum Operations
// API fields: kode_mk, nm_mk, sks_mk, jns_mk, semester, thn_kurikulum, id_unit
// Schema: siakadu.matkul_kurikulum (PK: id_kurikulum_sp UUID + id_mk UUID)
// Mapping: mapping_kurikulum (kode_mk+thn → id_kurikulum_sp UUID)
// ========================================

func (r *repository) UpsertKurikulum(ctx context.Context, data map[string]interface{}) (bool, error) {
	kodeMK := getString(data, "kode_mk")
	if kodeMK == nil {
		return false, fmt.Errorf("kode_mk is required")
	}
	thnKurikulum := getInt(data, "thn_kurikulum")
	if thnKurikulum == nil {
		defaultThn := 2020
		thnKurikulum = &defaultThn
	}
	now := time.Now()

	// Resolve kode_mk → id_mk (create matkul if needed)
	idMKStr, err := r.lookupOrCreateMatkul(ctx, data)
	if err != nil {
		return false, fmt.Errorf("failed to resolve matkul: %w", err)
	}

	// Check mapping
	var existingKurSP string
	err = r.db.GetContext(ctx, &existingKurSP,
		"SELECT CAST(id_kurikulum_sp AS VARCHAR(36)) FROM siakadu.mapping_kurikulum WHERE kode_mk_siakadu = @p1 AND thn_kurikulum = @p2",
		*kodeMK, *thnKurikulum)

	if err == nil && existingKurSP != "" {
		// Update
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.matkul_kurikulum SET
				smt = @p1, sks_mk = @p2,
				last_update = @p3, last_sync = @p4
			WHERE id_kurikulum_sp = CONVERT(uniqueidentifier, @p5) AND id_mk = CONVERT(uniqueidentifier, @p6)
		`,
			getInt(data, "semester"),  // @p1
			getFloat(data, "sks_mk"), // @p2
			now, now,                 // @p3, @p4
			existingKurSP,            // @p5
			idMKStr,                  // @p6
		)
		if err != nil {
			return false, fmt.Errorf("failed to update matkul_kurikulum: %w", err)
		}
		return false, nil
	}

	// Insert new
	newKurSP := uuid.New().String()
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.matkul_kurikulum (
			id_kurikulum_sp, id_mk, smt, sks_mk,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), CONVERT(uniqueidentifier, @p2), @p3, @p4,
			@p5, @p6, @p7, @p8
		)
	`,
		newKurSP, idMKStr,
		getInt(data, "semester"),
		getFloat(data, "sks_mk"),
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert matkul_kurikulum: %w", err)
	}

	// Create mapping
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.mapping_kurikulum (kode_mk_siakadu, thn_kurikulum, id_unit_siakadu, id_kurikulum_sp, id_mk, create_date)
		VALUES (@p1, @p2, @p3, CONVERT(uniqueidentifier, @p4), CONVERT(uniqueidentifier, @p5), @p6)
	`, *kodeMK, *thnKurikulum, getStringOrDefault(data, "id_unit", ""), newKurSP, idMKStr, now)

	return true, nil
}

func (r *repository) GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(mk.nm_mk LIKE @p%d OR mk.kode_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM siakadu.matkul_kurikulum k
		LEFT JOIN siakadu.matkul mk ON k.id_mk = mk.id_mk %s`, whereClause)
	err := r.db.GetContext(ctx, &total, countQ, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kurikulum: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT CAST(k.id_kurikulum_sp AS VARCHAR(36)) AS id_kurikulum,
			k.smt AS semester,
			CAST(k.id_mk AS VARCHAR(36)) AS id_mata_kuliah,
			ISNULL(mk.nm_mk, '') AS nama_mata_kuliah,
			ISNULL(mk.kode_mk, '') AS kode_mk,
			k.sks_mk AS sks,
			k.last_sync
		FROM siakadu.matkul_kurikulum k
		LEFT JOIN siakadu.matkul mk ON k.id_mk = mk.id_mk
		%s ORDER BY mk.nm_mk ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KurikulumListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kurikulum list: %w", err)
	}

	return &PaginatedResult{
		Data: list, Total: total, Page: page, Limit: limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// ========================================
// Kelas Operations
// API fields: id_kelas (int), id_semester, kode_mk, nm_kelas, nm_mk, sks_mk,
//   daya_tampung, jumlah_peserta, id_unit, dosen[]
// Schema: siakadu.kelas_kuliah (PK: id_kls UUID)
// Mapping: mapping_kelas (id_kelas_siakadu int → id_kls UUID)
// ========================================

func (r *repository) UpsertKelasKuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	idKelas := getInt(data, "id_kelas")
	if idKelas == nil {
		return false, fmt.Errorf("id_kelas is required")
	}
	now := time.Now()

	// Resolve kode_mk → id_mk
	idMKStr, err := r.lookupOrCreateMatkul(ctx, data)
	if err != nil {
		return false, fmt.Errorf("failed to resolve matkul for kelas: %w", err)
	}

	// Resolve id_unit → id_sms via mapping_unit
	idSmsStr := defaultUUID
	if idUnit := getString(data, "id_unit"); idUnit != nil {
		var resolved string
		err := r.db.GetContext(ctx, &resolved,
			"SELECT CAST(id_sms AS VARCHAR(36)) FROM siakadu.mapping_unit WHERE kode_siakad = @p1", *idUnit)
		if err == nil && resolved != "" {
			idSmsStr = resolved
		}
	}

	idSmt := getStringOrDefault(data, "id_semester", "20241")
	if len(idSmt) > 5 {
		idSmt = idSmt[:5]
	}
	nmKls := getStringOrDefault(data, "nm_kelas", "A")
	if len(nmKls) > 5 {
		nmKls = nmKls[:5]
	}

	// Check mapping
	var existingIdKls string
	err = r.db.GetContext(ctx, &existingIdKls,
		"SELECT CAST(id_kls AS VARCHAR(36)) FROM siakadu.mapping_kelas WHERE id_kelas_siakadu = @p1", *idKelas)

	if err == nil && existingIdKls != "" {
		// Update
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.kelas_kuliah SET
				id_smt = @p1, nm_kls = @p2,
				id_mk = CONVERT(uniqueidentifier, @p3),
				last_update = @p4, last_sync = @p5
			WHERE id_kls = CONVERT(uniqueidentifier, @p6)
		`,
			idSmt, nmKls, idMKStr,
			now, now,
			existingIdKls,
		)
		if err != nil {
			return false, fmt.Errorf("failed to update kelas_kuliah: %w", err)
		}
		return false, nil
	}

	// Insert new
	newIdKls := uuid.New().String()
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.kelas_kuliah (
			id_kls, id_smt, id_mk, nm_kls,
			id_sms,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), @p2, CONVERT(uniqueidentifier, @p3), @p4,
			CONVERT(uniqueidentifier, @p5),
			@p6, @p7, @p8, @p9
		)
	`,
		newIdKls, idSmt, idMKStr, nmKls,
		idSmsStr, // id_sms NOT NULL (from mapping_unit or placeholder)
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert kelas_kuliah: %w", err)
	}

	// Record mapping
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.mapping_kelas (id_kelas_siakadu, id_kls, id_smt, create_date)
		VALUES (@p1, CONVERT(uniqueidentifier, @p2), @p3, @p4)
	`, *idKelas, newIdKls, idSmt, now)

	return true, nil
}

func (r *repository) GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(kk.nm_kls LIKE @p%d OR mk.nm_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if idSemester != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("kk.id_smt = @p%d", paramIndex))
		args = append(args, idSemester)
		paramIndex++
	}
	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.kelas_kuliah kk LEFT JOIN siakadu.matkul mk ON kk.id_mk = mk.id_mk %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kelas: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT CAST(kk.id_kls AS VARCHAR(36)) AS id_kelas,
			kk.id_smt AS id_semester,
			kk.nm_kls AS nama_kelas,
			CAST(kk.id_mk AS VARCHAR(36)) AS id_mk,
			ISNULL(mk.nm_mk, '') AS nama_mk,
			mk.sks_mk,
			kk.last_sync
		FROM siakadu.kelas_kuliah kk
		LEFT JOIN siakadu.matkul mk ON kk.id_mk = mk.id_mk
		%s ORDER BY kk.id_smt DESC, kk.nm_kls ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KelasListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kelas list: %w", err)
	}

	return &PaginatedResult{
		Data: list, Total: total, Page: page, Limit: limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// ========================================
// Jadwal Operations
// API fields: id_jadwal (int), id_kelas (int), id_semester, pertemuan_ke, tgl_jadwal, dll
// Schema: siakadu.jadwal_kelas (PK: id_jdwl_kls UUID)
// Mapping: mapping_jadwal (id_jadwal_siakadu int → id_jdwl_kls UUID)
// ========================================

func (r *repository) UpsertJadwalKelas(ctx context.Context, data map[string]interface{}) (bool, error) {
	idJadwal := getInt(data, "idjadwal")
	if idJadwal == nil {
		return false, fmt.Errorf("idjadwal is required")
	}
	now := time.Now()

	// Resolve id_kelas (int) → id_kls (UUID) via mapping_kelas
	var idKlsStr string
	if idKelasInt := getInt(data, "id_kelas"); idKelasInt != nil {
		_ = r.db.GetContext(context.Background(), &idKlsStr,
			"SELECT CAST(id_kls AS VARCHAR(36)) FROM siakadu.mapping_kelas WHERE id_kelas_siakadu = @p1", *idKelasInt)
	}
	if idKlsStr == "" {
		idKlsStr = defaultUUID
	}

	idSmt := getStringOrDefault(data, "id_semester", "20241")
	if len(idSmt) > 5 {
		idSmt = idSmt[:5]
	}

	// Check mapping
	var existingIdJdwl string
	err := r.db.GetContext(ctx, &existingIdJdwl,
		"SELECT CAST(id_jdwl_kls AS VARCHAR(36)) FROM siakadu.mapping_jadwal WHERE id_jadwal_siakadu = @p1", *idJadwal)

	if err == nil && existingIdJdwl != "" {
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.jadwal_kelas SET
				id_kls = CONVERT(uniqueidentifier, @p1),
				id_smt = @p2,
				pertemuan = @p3,
				tgl_jadwal = TRY_CONVERT(datetime, @p4, 120),
				waktu_mulai = @p5,
				waktu_selesai = @p6,
				lokasi = @p7,
				last_update = @p8, last_sync = @p9
			WHERE id_jdwl_kls = CONVERT(uniqueidentifier, @p10)
		`,
			idKlsStr, idSmt,
			getInt(data, "pertemuanke"),
			getString(data, "tgljadwal"),
			getString(data, "waktumulai"),
			getString(data, "waktuselesai"),
			getString(data, "idruang"),
			now, now,
			existingIdJdwl,
		)
		if err != nil {
			return false, fmt.Errorf("failed to update jadwal_kelas: %w", err)
		}
		return false, nil
	}

	// Insert
	newIdJdwl := uuid.New().String()
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.jadwal_kelas (
			id_jdwl_kls, id_kls, id_smt, pertemuan,
			tgl_jadwal, waktu_mulai, waktu_selesai, lokasi,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			CONVERT(uniqueidentifier, @p1), CONVERT(uniqueidentifier, @p2), @p3, @p4,
			TRY_CONVERT(datetime, @p5, 120), @p6, @p7, @p8,
			@p9, @p10, @p11, @p12
		)
	`,
		newIdJdwl, idKlsStr, idSmt,
		getInt(data, "pertemuanke"),
		getString(data, "tgljadwal"),
		getString(data, "waktumulai"),
		getString(data, "waktuselesai"),
		getString(data, "idruang"),
		now, defaultUUID, now, now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert jadwal_kelas: %w", err)
	}

	// Record mapping
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.mapping_jadwal (id_jadwal_siakadu, id_jdwl_kls, create_date)
		VALUES (@p1, CONVERT(uniqueidentifier, @p2), @p3)
	`, *idJadwal, newIdJdwl, now)

	return true, nil
}

func (r *repository) GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(j.lokasi LIKE @p%d)", paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if idSemester != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("j.id_smt = @p%d", paramIndex))
		args = append(args, idSemester)
		paramIndex++
	}
	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.jadwal_kelas j %s", whereClause), args...)
	if err != nil {
		log.Printf("⚠️  Failed to count jadwal: %v", err)
		return nil, fmt.Errorf("failed to count jadwal: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT CAST(j.id_jdwl_kls AS VARCHAR(36)) AS id_jadwal,
			CAST(j.id_kls AS VARCHAR(36)) AS id_kelas,
			j.id_smt AS id_semester,
			j.pertemuan AS pertemuan_ke,
			j.tgl_jadwal, j.waktu_mulai, j.waktu_selesai,
			j.lokasi, j.last_sync
		FROM siakadu.jadwal_kelas j
		%s ORDER BY j.tgl_jadwal DESC, j.waktu_mulai ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*JadwalListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get jadwal list: %w", err)
	}

	return &PaginatedResult{
		Data: list, Total: total, Page: page, Limit: limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// GetAllProdiIDs returns all active prodi from ref_unit
func (r *repository) GetAllProdiIDs(ctx context.Context) ([]ProdiInfo, error) {
	var result []ProdiInfo
	err := r.db.SelectContext(ctx, &result,
		`SELECT id_unit, nm_unit FROM siakadu.ref_unit
		WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL)
		ORDER BY id_unit`)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi IDs: %w", err)
	}
	return result, nil
}
