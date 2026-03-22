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
	UpsertPesertaDidik(ctx context.Context, data map[string]interface{}) (bool, error)
	UpsertRegPd(ctx context.Context, data map[string]interface{}) (bool, error)
	GetMahasiswaList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error)
	GetStats(ctx context.Context) (*SyncStats, error)
	ResolveUnit(ctx context.Context, kodeSiakad string) (string, error)
}

// repository implementation
type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new mahasiswa repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
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

// UpsertPesertaDidik upserts peserta_didik record by NIK
// Returns true if inserted (new), false if updated
func (r *repository) UpsertPesertaDidik(ctx context.Context, data map[string]interface{}) (bool, error) {
	nik := getString(data, "nik")
	nim := getString(data, "nim")

	// We need at least NIM to identify the record
	if nim == nil || *nim == "" {
		return false, fmt.Errorf("nim is required for peserta_didik upsert")
	}

	now := time.Now()

	// Try UPDATE first by NIM (nipd)
	updateQuery := `
		UPDATE siakadu.peserta_didik SET
			nm_pd = @p1,
			jk = @p2,
			nik = @p3,
			tmpt_lahir = @p4,
			tgl_lahir = @p5,
			alamat_jalan = @p6,
			email = @p7,
			handphone = @p8,
			id_agama = @p9,
			id_kota = @p10,
			last_sync = @p11
		WHERE nipd = @p12
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getString(data, "nama"),       // @p1
		getString(data, "jk"),         // @p2
		nik,                           // @p3
		getString(data, "tmplahir"),   // @p4
		getString(data, "tgllahir"),   // @p5
		getString(data, "alamat"),     // @p6
		getString(data, "email"),      // @p7
		getString(data, "hp"),         // @p8
		getString(data, "idagama"),    // @p9
		getString(data, "idkota"),     // @p10
		now,                           // @p11
		nim,                           // @p12
	)
	if err != nil {
		return false, fmt.Errorf("failed to update peserta_didik: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil // Updated
	}

	// INSERT new record
	newID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.peserta_didik (
			id_pd, nipd, nm_pd, jk, nik, tmpt_lahir, tgl_lahir,
			alamat_jalan, email, handphone, id_agama, id_kota,
			create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7,
			@p8, @p9, @p10, @p11, @p12,
			@p13, @p14
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newID,                         // @p1 id_pd
		nim,                           // @p2 nipd (NIM)
		getString(data, "nama"),       // @p3
		getString(data, "jk"),         // @p4
		nik,                           // @p5
		getString(data, "tmplahir"),   // @p6
		getString(data, "tgllahir"),   // @p7
		getString(data, "alamat"),     // @p8
		getString(data, "email"),      // @p9
		getString(data, "hp"),         // @p10
		getString(data, "idagama"),    // @p11
		getString(data, "idkota"),     // @p12
		now,                           // @p13
		now,                           // @p14
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert peserta_didik: %w", err)
	}

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

	// Try UPDATE first
	updateQuery := `
		UPDATE siakadu.reg_pd SET
			id_sms = @p1,
			id_periode = @p2,
			angkatan = @p3,
			ipk = @p4,
			sks_total = @p5,
			sks_lulus = @p6,
			semester = @p7,
			id_status_mahasiswa = @p8,
			last_sync = @p9
		WHERE nipd = @p10
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		idSms,                                 // @p1
		getString(data, "idperiode"),           // @p2
		getString(data, "angkatan"),            // @p3
		getFloat(data, "ipk"),                 // @p4
		getInt(data, "skstotal"),              // @p5
		getInt(data, "skslulus"),              // @p6
		getString(data, "semmhs"),             // @p7
		getString(data, "idstatusmhs"),         // @p8
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

	// Get id_pd from peserta_didik
	var idPd string
	err = r.db.GetContext(ctx, &idPd, "SELECT id_pd FROM siakadu.peserta_didik WHERE nipd = @p1", nim)
	if err != nil {
		// If peserta_didik doesn't exist yet, generate a new UUID
		idPd = uuid.New().String()
	}

	insertQuery := `
		INSERT INTO siakadu.reg_pd (
			id_reg_pd, id_pd, id_sms, nipd, id_periode,
			angkatan, ipk, sks_total, sks_lulus, semester,
			id_status_mahasiswa, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newID,                                 // @p1 id_reg_pd
		idPd,                                  // @p2 id_pd
		idSms,                                 // @p3
		nim,                                   // @p4 nipd (NIM)
		getString(data, "idperiode"),           // @p5
		getString(data, "angkatan"),            // @p6
		getFloat(data, "ipk"),                 // @p7
		getInt(data, "skstotal"),              // @p8
		getInt(data, "skslulus"),              // @p9
		getString(data, "semmhs"),             // @p10
		getString(data, "idstatusmhs"),         // @p11
		now,                                   // @p12
		now,                                   // @p13
	)
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
			pd.alamat_jalan AS alamat,
			pd.email,
			CAST(NULL AS VARCHAR(100)) AS email_kampus,
			pd.handphone AS hp,
			CAST(NULL AS VARCHAR(50)) AS id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_fakultas,
			CAST(NULL AS VARCHAR(200)) AS nm_jurusan,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi,
			rp.semester,
			rp.ipk,
			rp.sks_total,
			rp.sks_lulus,
			rp.id_status_mahasiswa AS status,
			rp.id_periode,
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

// ResolveUnit resolves SIAKADU id_unit code to id_sms UUID via mapping_unit table
func (r *repository) ResolveUnit(ctx context.Context, kodeSiakad string) (string, error) {
	var idSms string
	err := r.db.GetContext(ctx, &idSms,
		"SELECT id_sms FROM siakadu.mapping_unit WHERE kode_siakad = @p1", kodeSiakad)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil // No mapping found
		}
		return "", fmt.Errorf("failed to resolve unit: %w", err)
	}
	return idSms, nil
}
