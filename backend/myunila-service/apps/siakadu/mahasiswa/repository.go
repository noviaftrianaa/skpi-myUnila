package mahasiswa

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for mahasiswa data access
type Repository interface {
	EnsureReferenceData(ctx context.Context) error
	UpsertPesertaDidik(ctx context.Context, data map[string]interface{}) (bool, error)
	UpsertRegPd(ctx context.Context, data map[string]interface{}) (bool, error)
	GetMahasiswaList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error)
	GetStats(ctx context.Context) (*SyncStats, error)
	ResolveUnit(ctx context.Context, kodeSiakad string) (string, error)
	GetAllProdiIDs(ctx context.Context) ([]struct {
		IdUnit string  `db:"id_unit"`
		NmUnit *string `db:"nm_unit"`
	}, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new mahasiswa repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// EnsureReferenceData seeds required reference tables if empty
func (r *repository) EnsureReferenceData(ctx context.Context) error {
	// Ensure sync columns exist in reg_pd
	alterQueries := []string{
		"IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'angkatan') ALTER TABLE siakadu.reg_pd ADD angkatan varchar(4) NULL",
		"IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'sks_total') ALTER TABLE siakadu.reg_pd ADD sks_total int NULL",
		"IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'sks_lulus') ALTER TABLE siakadu.reg_pd ADD sks_lulus int NULL",
		"IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'semester') ALTER TABLE siakadu.reg_pd ADD semester varchar(10) NULL",
		"IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'id_status_mahasiswa') ALTER TABLE siakadu.reg_pd ADD id_status_mahasiswa varchar(10) NULL",
	}
	for _, q := range alterQueries {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureReferenceData] ALTER failed: %v", err)
		}
	}

	// Seed status_mahasiswa
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
			log.Printf("⚠️  [EnsureReferenceData] Failed to seed status_mahasiswa %s: %v", s.ID, err)
		}
	}

	// Drop FK constraints that block sync (id_sms references sms/prodi which may be empty)
	dropFKs := []string{
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_sms')
		 ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_sms`,
		`IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_semester')
		 ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_semester`,
	}
	for _, q := range dropFKs {
		if _, err := r.db.ExecContext(ctx, q); err != nil {
			log.Printf("⚠️  [EnsureReferenceData] drop FK: %v", err)
		}
	}

	log.Printf("✅ [EnsureReferenceData] Reference data ensured")
	return nil
}

// getString safely extracts a string from map
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

// getFloat safely extracts a float64 from map
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

// getInt safely extracts an int from map
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

// getSmallint safely extracts a smallint from map
func getSmallint(data map[string]interface{}, key string) *int16 {
	if v, ok := data[key]; ok && v != nil {
		switch i := v.(type) {
		case float64:
			ii := int16(i)
			return &ii
		case int:
			ii := int16(i)
			return &ii
		case string:
			// try parse
			var ii int16
			if _, err := fmt.Sscanf(i, "%d", &ii); err == nil {
				return &ii
			}
		}
	}
	return nil
}

// getSmallintDefault returns smallint with default if nil
func getSmallintDefault(data map[string]interface{}, key string, def int16) *int16 {
	v := getSmallint(data, key)
	if v == nil {
		return &def
	}
	return v
}

// getStringDefault returns string with default if nil/empty
func getStringDefault(data map[string]interface{}, key string, def string) *string {
	v := getString(data, key)
	if v == nil || *v == "" {
		return &def
	}
	return v
}

// UpsertPesertaDidik upserts peserta_didik record
// Lookup existing via reg_pd.nipd JOIN (peserta_didik has no nipd column)
// Returns true if inserted (new), false if updated
func (r *repository) UpsertPesertaDidik(ctx context.Context, data map[string]interface{}) (bool, error) {
	nik := getString(data, "nik")
	nim := getString(data, "nim")

	// We need at least NIM to identify the record
	if nim == nil || *nim == "" {
		return false, fmt.Errorf("nim is required for peserta_didik upsert")
	}

	now := time.Now()

	// Find existing id_pd via reg_pd (peserta_didik doesn't have nipd)
	var existingIdPd string
	err := r.db.GetContext(ctx, &existingIdPd,
		"SELECT CAST(id_pd AS VARCHAR(36)) FROM siakadu.reg_pd WHERE nipd = @p1", nim)

	if err == nil && existingIdPd != "" {
		// UPDATE existing peserta_didik by id_pd
		// Only update fields available from list API — skip NOT NULL fields like tmpt_lahir
		// that are only available in detail API
		updateQuery := `
			UPDATE siakadu.peserta_didik SET
				nm_pd = @p1,
				jk = @p2,
				nik = ISNULL(@p3, nik),
				last_update = @p4,
				last_sync = @p5
			WHERE id_pd = CONVERT(uniqueidentifier, @p6)
		`

		_, err := r.db.ExecContext(ctx, updateQuery,
			getString(data, "nama"),  // @p1
			getString(data, "jk"),    // @p2
			nik,                      // @p3
			now,                      // @p4
			now,                      // @p5
			existingIdPd,             // @p6
		)
		if err != nil {
			return false, fmt.Errorf("failed to update peserta_didik: %w", err)
		}
		return false, nil // Updated
	}

	// INSERT new record
	newID := uuid.New().String()
	defaultCreator := "00000000-0000-0000-0000-000000000000"
	insertQuery := `
		INSERT INTO siakadu.peserta_didik (
			id_pd, nm_pd, jk, nik, tmpt_lahir, tgl_lahir,
			jln, email, tlpn_hp, id_agama, id_wil,
			id_kewarganegaraan, id_stat_mhs,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6,
			@p7, @p8, @p9, @p10, @p11,
			@p12, @p13,
			@p14, @p15, @p16, @p17
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newID,                           // @p1 id_pd
		getString(data, "nama"),         // @p2
		getString(data, "jk"),           // @p3
		nik,                             // @p4
		getStringDefault(data, "tmplahir", "-"), // @p5 NOT NULL
		getString(data, "tgllahir"),     // @p6
		getString(data, "alamat"),       // @p7
		getString(data, "email"),        // @p8
		getString(data, "hp"),           // @p9
		getSmallintDefault(data, "idagama", 99), // @p10 NOT NULL
		getString(data, "idkota"),       // @p11
		getStringDefault(data, "kewarganegaraan", "ID"), // @p12 NOT NULL
		getStringDefault(data, "idstatusmhs", "A"),      // @p13 NOT NULL
		now,                             // @p14 create_date
		defaultCreator,                  // @p15 id_creator NOT NULL
		now,                             // @p16 last_update NOT NULL
		now,                             // @p17 last_sync
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert peserta_didik: %w", err)
	}

	// Store the new id_pd in data for reg_pd to use
	data["_id_pd"] = newID

	return true, nil // Inserted
}

// UpsertRegPd upserts reg_pd record by NIM (nipd)
// Returns true if inserted (new), false if updated
func (r *repository) UpsertRegPd(ctx context.Context, data map[string]interface{}) (bool, error) {
	nim := getString(data, "nim")
	if nim == nil || *nim == "" {
		return false, fmt.Errorf("nim is required for reg_pd upsert")
	}

	now := time.Now()

	// Resolve id_unit → id_sms
	var idSms *string
	if idUnit := getString(data, "id_unit"); idUnit != nil {
		resolved, err := r.ResolveUnit(ctx, *idUnit)
		if err == nil && resolved != "" {
			idSms = &resolved
		}
	}

	// Try UPDATE first — note: id_sms and id_smt are uniqueidentifier, must pass nil or valid UUID
	updateQuery := `
		UPDATE siakadu.reg_pd SET
			id_sms = CASE WHEN @p1 IS NULL THEN id_sms ELSE CONVERT(uniqueidentifier, @p1) END,
			angkatan = @p2,
			ipk = @p3,
			sks_total = @p4,
			sks_lulus = @p5,
			semester = @p6,
			id_status_mahasiswa = @p7,
			last_update = @p8,
			last_sync = @p9
		WHERE nipd = @p10
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		idSms,                                 // @p1 (nil or valid UUID string)
		getString(data, "angkatan"),            // @p2
		getFloat(data, "ipk"),                 // @p3
		getInt(data, "skstotal"),              // @p4
		getInt(data, "skslulus"),              // @p5
		getString(data, "semmhs"),             // @p6
		getString(data, "idstatusmhs"),         // @p7
		now,                                   // @p8
		now,                                   // @p9
		nim,                                   // @p10
	)
	if err != nil {
		return false, fmt.Errorf("failed to update reg_pd: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	// INSERT new record
	newID := uuid.New().String()
	defaultSP := "00000000-0000-0000-0000-000000000000"
	defaultCreator := "00000000-0000-0000-0000-000000000000"

	// Get id_pd — from peserta_didik just inserted, or from data
	var idPd string
	if storedIdPd, ok := data["_id_pd"].(string); ok && storedIdPd != "" {
		idPd = storedIdPd
	} else {
		// Try lookup via existing reg_pd or peserta_didik
		idPd = uuid.New().String()
	}

	// Derive id_semester_masuk from angkatan
	idSemesterMasuk := getStringDefault(data, "angkatan", "20241")
	// Append "1" to make it a valid semester ID (e.g., "2024" -> "20241")
	if idSemesterMasuk != nil && len(*idSemesterMasuk) == 4 {
		s := *idSemesterMasuk + "1"
		idSemesterMasuk = &s
	}

	// Build CONVERT for id_sms (uniqueidentifier) - only if we have a valid UUID
	var idSmsSQL interface{} = nil
	if idSms != nil && *idSms != "" {
		idSmsSQL = *idSms
	}

	insertQuery := `
		INSERT INTO siakadu.reg_pd (
			id_reg_pd, id_sp, id_pd, nipd,
			id_jns_daftar, tgl_masuk_sp, id_semester_masuk,
			angkatan, ipk, sks_total, sks_lulus, semester,
			id_status_mahasiswa,
			create_date, id_creator, last_update, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7,
			@p8, @p9, @p10, @p11, @p12,
			@p13,
			@p14, @p15, @p16, @p17
		)
	`
	// Note: id_sms set separately via UPDATE after insert (to avoid uniqueidentifier conversion issues)

	_, err = r.db.ExecContext(ctx, insertQuery,
		newID,                                 // @p1 id_reg_pd
		defaultSP,                             // @p2 id_sp NOT NULL
		idPd,                                  // @p3 id_pd NOT NULL
		nim,                                   // @p4 nipd
		1,                                     // @p5 id_jns_daftar NOT NULL (1=reguler)
		now,                                   // @p6 tgl_masuk_sp NOT NULL
		idSemesterMasuk,                       // @p7 id_semester_masuk NOT NULL (char(5))
		getString(data, "angkatan"),            // @p8
		getFloat(data, "ipk"),                 // @p9
		getInt(data, "skstotal"),              // @p10
		getInt(data, "skslulus"),              // @p11
		getString(data, "semmhs"),             // @p12
		getString(data, "idstatusmhs"),         // @p13
		now,                                   // @p14 create_date NOT NULL
		defaultCreator,                        // @p15 id_creator NOT NULL
		now,                                   // @p16 last_update NOT NULL
		now,                                   // @p17 last_sync NOT NULL
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert reg_pd: %w", err)
	}

	// Update id_sms if we have a valid mapping
	if idSmsSQL != nil {
		_, _ = r.db.ExecContext(ctx, `
			UPDATE siakadu.reg_pd SET id_sms = CONVERT(uniqueidentifier, @p1) WHERE id_reg_pd = @p2
		`, idSmsSQL, newID)
	}
	if err != nil {
		return false, fmt.Errorf("failed to insert reg_pd: %w", err)
	}

	return true, nil
}

// GetMahasiswaList retrieves paginated list of mahasiswa from siakadu schema
func (r *repository) GetMahasiswaList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(rp.nipd LIKE @p%d OR pd.nm_pd LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM siakadu.reg_pd rp
		LEFT JOIN siakadu.peserta_didik pd ON rp.id_pd = pd.id_pd
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count mahasiswa: %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT
			rp.nipd AS nim,
			ISNULL(pd.nm_pd, '') AS nama,
			rp.angkatan,
			pd.jk,
			CAST(NULL AS VARCHAR(50)) AS id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_fakultas,
			CAST(NULL AS VARCHAR(200)) AS nm_jurusan,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi,
			rp.semester,
			rp.ipk,
			rp.id_status_mahasiswa AS status,
			rp.last_sync
		FROM siakadu.reg_pd rp
		LEFT JOIN siakadu.peserta_didik pd ON rp.id_pd = pd.id_pd
		%s
		ORDER BY pd.nm_pd ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var mahasiswaList []*MahasiswaListItem
	err = r.db.SelectContext(ctx, &mahasiswaList, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get mahasiswa list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &PaginatedResult{
		Data:       mahasiswaList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetMahasiswaByNIM retrieves a single mahasiswa by NIM
func (r *repository) GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error) {
	query := `
		SELECT
			rp.nipd AS nim,
			ISNULL(pd.nm_pd, '') AS nama,
			rp.angkatan,
			pd.jk,
			pd.tmpt_lahir AS tmp_lahir,
			pd.tgl_lahir,
			pd.nik,
			pd.jln AS alamat,
			pd.email,
			CAST(NULL AS VARCHAR(100)) AS email_kampus,
			pd.tlpn_hp AS hp,
			CAST(NULL AS VARCHAR(50)) AS id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_fakultas,
			CAST(NULL AS VARCHAR(200)) AS nm_jurusan,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi,
			rp.semester,
			rp.ipk,
			rp.sks_total,
			rp.sks_lulus,
			rp.id_status_mahasiswa AS status,
			rp.id_smt AS id_periode,
			rp.last_sync
		FROM siakadu.reg_pd rp
		LEFT JOIN siakadu.peserta_didik pd ON rp.id_pd = pd.id_pd
		WHERE rp.nipd = @p1
	`

	var m MahasiswaDetail
	err := r.db.GetContext(ctx, &m, query, nim)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mahasiswa not found")
		}
		return nil, fmt.Errorf("failed to get mahasiswa: %w", err)
	}

	return &m, nil
}

// GetStats retrieves sync statistics
func (r *repository) GetStats(ctx context.Context) (*SyncStats, error) {
	stats := &SyncStats{}

	err := r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(*) FROM siakadu.reg_pd
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get total mahasiswa: %v", err)
	}

	err = r.db.GetContext(ctx, &stats.TotalAktif, `
		SELECT COUNT(*) FROM siakadu.reg_pd WHERE id_status_mahasiswa = 'A' OR id_status_mahasiswa = 'Aktif'
	`)
	if err != nil {
		log.Printf("⚠️  Failed to get total aktif: %v", err)
	}

	stats.TotalNonAktif = stats.TotalMahasiswa - stats.TotalAktif

	var lastSync time.Time
	err = r.db.GetContext(ctx, &lastSync, `SELECT ISNULL(MAX(last_sync), '1900-01-01') FROM siakadu.reg_pd`)
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}

// GetAllProdiIDs returns all active prodi IDs from ref_unit
func (r *repository) GetAllProdiIDs(ctx context.Context) ([]struct {
	IdUnit string  `db:"id_unit"`
	NmUnit *string `db:"nm_unit"`
}, error) {
	var result []struct {
		IdUnit string  `db:"id_unit"`
		NmUnit *string `db:"nm_unit"`
	}
	err := r.db.SelectContext(ctx, &result,
		`SELECT id_unit, nm_unit FROM siakadu.ref_unit
		WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL)
		ORDER BY id_unit`)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi IDs: %w", err)
	}
	return result, nil
}

// ResolveUnit resolves SIAKADU id_unit code to id_sms UUID via mapping_unit table
func (r *repository) ResolveUnit(ctx context.Context, kodeSiakad string) (string, error) {
	var idSms string
	err := r.db.GetContext(ctx, &idSms,
		"SELECT CAST(id_sms AS VARCHAR(36)) FROM siakadu.mapping_unit WHERE kode_siakad = @p1", kodeSiakad)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil // No mapping found
		}
		return "", fmt.Errorf("failed to resolve unit: %w", err)
	}
	return idSms, nil
}
