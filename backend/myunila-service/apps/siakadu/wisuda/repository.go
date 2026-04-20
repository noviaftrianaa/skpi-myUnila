package wisuda

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for wisuda data access
type Repository interface {
	EnsureWisudaSchema(ctx context.Context) error
	GetWisudaList(ctx context.Context, filter *WisudaListFilter) (*WisudaPaginatedResult, error)
	GetWisudaStats(ctx context.Context) (*WisudaStats, error)
	GetWisudaFilterOptions(ctx context.Context) (*WisudaFilterOptions, error)
	GetPeriodeList(ctx context.Context) ([]*WisudaPeriode, error)
	UpsertPeriode(ctx context.Context, data map[string]interface{}) (isNew bool, err error)
	UpsertPeserta(ctx context.Context, data map[string]interface{}) (isNew bool, err error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
		case string:
			if i == "" {
				return nil
			}
			var ii int
			if _, err := fmt.Sscanf(i, "%d", &ii); err == nil {
				return &ii
			}
		}
	}
	return nil
}

// ============================================================================
// EnsureWisudaSchema - check tables exist
// ============================================================================

func (r *repository) EnsureWisudaSchema(ctx context.Context) error {
	tables := []string{"periode_wisuda", "wisuda_mahasiswa"}
	for _, t := range tables {
		var exists int
		err := r.db.GetContext(ctx, &exists,
			fmt.Sprintf("SELECT CASE WHEN OBJECT_ID('siakadu.%s', 'U') IS NOT NULL THEN 1 ELSE 0 END", t))
		if err != nil || exists == 0 {
			return fmt.Errorf("siakadu.%s table not found", t)
		}
	}
	log.Printf("✅ [EnsureWisudaSchema] siakadu.periode_wisuda and siakadu.wisuda_mahasiswa ready")
	return nil
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

// allowedSortColumns is a whitelist of columns allowed for sorting to prevent SQL injection
var allowedSortColumns = map[string]string{
	"nim":           "w.nipd",
	"nipd":          "w.nipd",
	"nama":          "w.nm_mahasiswa",
	"nm_mahasiswa":  "w.nm_mahasiswa",
	"ipk_lulusan":   "w.ipk_lulusan",
	"no_ijasah":     "w.no_ijasah",
	"nm_prodi":      "s.nm_lemb",
	"id_yudisium":   "w.id_yudisium",
}

func (r *repository) GetWisudaList(ctx context.Context, filter *WisudaListFilter) (*WisudaPaginatedResult, error) {
	offset := (filter.Page - 1) * filter.Limit

	whereConditions := []string{"w.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	if filter.Search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(w.nipd LIKE @p%d OR w.nm_mahasiswa LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+filter.Search+"%")
		paramIndex++
	}

	if filter.IdPeriode != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("w.id_periode_wisuda = @p%d", paramIndex))
		args = append(args, filter.IdPeriode)
		paramIndex++
	}

	if filter.IdUnit != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("m.id_unit = @p%d", paramIndex))
		args = append(args, filter.IdUnit)
		paramIndex++
	}

	if filter.Angkatan != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("m.angkatan = @p%d", paramIndex))
		args = append(args, filter.Angkatan)
		paramIndex++
	}

	whereClause := "WHERE " + strings.Join(whereConditions, " AND ")

	joinClause := `
		LEFT JOIN siakadu.mahasiswa m ON m.nim = w.nipd AND m.soft_delete = 0
		LEFT JOIN pdrd.sms s ON s.id_sms = w.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		LEFT JOIN siakadu.periode_wisuda pw ON pw.id_periode_wisuda = w.id_periode_wisuda AND pw.soft_delete = 0
	`

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM siakadu.wisuda_mahasiswa w %s %s", joinClause, whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count wisuda peserta: %w", err)
	}

	// Validate sort column against whitelist
	sortColumn := "w.nm_mahasiswa"
	if col, ok := allowedSortColumns[filter.SortBy]; ok {
		sortColumn = col
	}

	sortOrder := "ASC"
	if strings.EqualFold(filter.SortOrder, "desc") {
		sortOrder = "DESC"
	}

	dataQuery := fmt.Sprintf(`
		SELECT
			w.id_yudisium,
			w.id_periode_wisuda,
			pw.nm_periode,
			w.nipd,
			w.nm_mahasiswa,
			ISNULL(jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END, m.nm_prodi) AS nm_prodi,
			m.angkatan,
			w.no_sk_yudisium,
			w.tgl_sk_yudisium,
			w.no_ijasah,
			w.is_wisuda,
			w.is_hadir_wisuda,
			w.is_valid_wisuda,
			w.keterangan,
			w.ipk_lulusan,
			w.last_sync
		FROM siakadu.wisuda_mahasiswa w
		%s
		%s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, joinClause, whereClause, sortColumn, sortOrder, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, filter.Limit)
	var list []*WisudaPeserta
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get wisuda list: %w", err)
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit
	return &WisudaPaginatedResult{
		Data:       list,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetWisudaStats(ctx context.Context) (*WisudaStats, error) {
	stats := &WisudaStats{}

	r.db.GetContext(ctx, &stats.TotalPeserta,
		"SELECT COUNT(*) FROM siakadu.wisuda_mahasiswa WHERE soft_delete = 0")

	r.db.GetContext(ctx, &stats.TotalPeriode,
		"SELECT COUNT(*) FROM siakadu.periode_wisuda WHERE soft_delete = 0")

	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync,
		"SELECT ISNULL(MAX(last_sync), '1900-01-01') FROM siakadu.wisuda_mahasiswa")
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}

func (r *repository) GetWisudaFilterOptions(ctx context.Context) (*WisudaFilterOptions, error) {
	opts := &WisudaFilterOptions{}

	// Distinct periode
	var periodes []PeriodeOption
	err := r.db.SelectContext(ctx, &periodes, `
		SELECT id_periode_wisuda, nm_periode
		FROM siakadu.periode_wisuda
		WHERE soft_delete = 0
		ORDER BY id_periode_wisuda DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get periode options: %w", err)
	}
	opts.Periode = periodes

	// Distinct prodi — from pdrd.sms joined with jenjang for consistent naming
	var prodis []ProdiOption
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
			SELECT DISTINCT mhs.id_unit, mhs.id_sms
			FROM siakadu.wisuda_mahasiswa w
			INNER JOIN siakadu.mahasiswa mhs ON mhs.nim = w.nipd AND mhs.soft_delete = 0
			WHERE w.soft_delete = 0 AND mhs.id_unit IS NOT NULL AND mhs.id_sms IS NOT NULL
		) m
		INNER JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		INNER JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		ORDER BY jp.id_jenj_didik, s.nm_lemb`)
	if err != nil {
		// Fallback to mahasiswa table
		err = r.db.SelectContext(ctx, &prodis, `
			SELECT DISTINCT mhs.id_unit, mhs.nm_prodi
			FROM siakadu.wisuda_mahasiswa w
			INNER JOIN siakadu.mahasiswa mhs ON mhs.nim = w.nipd AND mhs.soft_delete = 0
			WHERE w.soft_delete = 0 AND mhs.id_unit IS NOT NULL AND mhs.nm_prodi IS NOT NULL
			ORDER BY mhs.nm_prodi`)
		if err != nil {
			return nil, fmt.Errorf("failed to get prodi options: %w", err)
		}
	}
	opts.Prodi = prodis

	// Distinct angkatan
	var angkatanList []string
	err = r.db.SelectContext(ctx, &angkatanList, `
		SELECT DISTINCT mhs.angkatan
		FROM siakadu.wisuda_mahasiswa w
		INNER JOIN siakadu.mahasiswa mhs ON mhs.nim = w.nipd AND mhs.soft_delete = 0
		WHERE w.soft_delete = 0 AND mhs.angkatan IS NOT NULL
		ORDER BY mhs.angkatan DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan options: %w", err)
	}
	opts.Angkatan = angkatanList

	return opts, nil
}

func (r *repository) GetPeriodeList(ctx context.Context) ([]*WisudaPeriode, error) {
	var list []*WisudaPeriode
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_periode_wisuda, id_smt, nm_periode, tgl_yudisium,
			tgl_awal_daftar, tgl_akhir_daftar,
			create_date, last_update, soft_delete, last_sync
		FROM siakadu.periode_wisuda
		WHERE soft_delete = 0
		ORDER BY id_periode_wisuda DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get periode list: %w", err)
	}
	return list, nil
}

// ============================================================================
// UPSERT OPERATIONS — for sync from SIAKADU API
// ============================================================================

func (r *repository) UpsertPeriode(ctx context.Context, data map[string]interface{}) (bool, error) {
	idPeriode := getString(data, "id_periode_wisuda")
	if idPeriode == nil || *idPeriode == "" {
		return false, fmt.Errorf("id_periode_wisuda is required")
	}

	now := time.Now()

	// Check if exists
	var existing string
	err := r.db.GetContext(ctx, &existing,
		"SELECT id_periode_wisuda FROM siakadu.periode_wisuda WHERE id_periode_wisuda = @p1", *idPeriode)

	if err == nil && existing != "" {
		// UPDATE
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.periode_wisuda SET
				id_smt = COALESCE(@p2, id_smt),
				nm_periode = COALESCE(@p3, nm_periode),
				tgl_yudisium = COALESCE(@p4, tgl_yudisium),
				tgl_awal_daftar = COALESCE(@p5, tgl_awal_daftar),
				tgl_akhir_daftar = COALESCE(@p6, tgl_akhir_daftar),
				last_update = @p7,
				last_sync = @p8
			WHERE id_periode_wisuda = @p1
		`,
			*idPeriode,
			getString(data, "id_smt"),
			getString(data, "nm_periode"),
			getString(data, "tgl_yudisium"),
			getString(data, "tgl_awal_daftar"),
			getString(data, "tgl_akhir_daftar"),
			now,
			now,
		)
		if err != nil {
			return false, fmt.Errorf("failed to update periode_wisuda %s: %w", *idPeriode, err)
		}
		return false, nil
	}

	// INSERT
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.periode_wisuda (
			id_periode_wisuda, id_smt, nm_periode, tgl_yudisium,
			tgl_awal_daftar, tgl_akhir_daftar,
			create_date, last_update, soft_delete, last_sync
		) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, 0, @p9)
	`,
		*idPeriode,
		getString(data, "id_smt"),
		getString(data, "nm_periode"),
		getString(data, "tgl_yudisium"),
		getString(data, "tgl_awal_daftar"),
		getString(data, "tgl_akhir_daftar"),
		now,
		now,
		now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert periode_wisuda %s: %w", *idPeriode, err)
	}
	return true, nil
}

func (r *repository) UpsertPeserta(ctx context.Context, data map[string]interface{}) (bool, error) {
	// API might use "nim" or "nipd" — try both
	nim := getString(data, "nim")
	if nim == nil {
		nim = getString(data, "nipd")
	}
	if nim == nil || *nim == "" {
		return false, fmt.Errorf("nim/nipd is required")
	}

	idPeriode := getString(data, "id_periode_wisuda")
	if idPeriode == nil || *idPeriode == "" {
		return false, fmt.Errorf("id_periode_wisuda is required")
	}

	now := time.Now()

	// Check if exists by nim+periode (API doesn't return id_yudisium reliably)
	var existing int
	err := r.db.GetContext(ctx, &existing,
		"SELECT id_yudisium FROM siakadu.wisuda_mahasiswa WHERE nipd = @p1 AND id_periode_wisuda = @p2", *nim, *idPeriode)
	idYudisium := &existing

	// API returns "nama_mahasiswa", fallback to "nm_mahasiswa"
	namaMhs := getString(data, "nama_mahasiswa")
	if namaMhs == nil {
		namaMhs = getString(data, "nm_mahasiswa")
	}
	// API returns "tanggal_yudisium" for tgl_sk_yudisium
	tglSkYudisium := getString(data, "tgl_sk_yudisium")
	if tglSkYudisium == nil {
		tglSkYudisium = getString(data, "tanggal_yudisium")
	}

	if err == nil && existing > 0 {
		// UPDATE
		_, err := r.db.ExecContext(ctx, `
			UPDATE siakadu.wisuda_mahasiswa SET
				nm_mahasiswa = COALESCE(@p3, nm_mahasiswa),
				no_sk_yudisium = COALESCE(@p4, no_sk_yudisium),
				tgl_sk_yudisium = COALESCE(@p5, tgl_sk_yudisium),
				no_ijasah = COALESCE(@p6, no_ijasah),
				is_hadir_wisuda = COALESCE(@p7, is_hadir_wisuda),
				is_valid_wisuda = COALESCE(@p8, is_valid_wisuda),
				ipk_lulusan = COALESCE(@p9, ipk_lulusan),
				last_update = @p10,
				last_sync = @p11
			WHERE nipd = @p1 AND id_periode_wisuda = @p2
		`,
			*nim, *idPeriode,
			namaMhs,
			getString(data, "no_sk_yudisium"),
			tglSkYudisium,
			getString(data, "no_ijasah"),
			getInt(data, "is_hadir_wisuda"),
			getInt(data, "is_valid_wisuda"),
			getFloat(data, "ipk_lulusan"),
			now, now,
		)
		if err != nil {
			return false, fmt.Errorf("failed to update wisuda_mahasiswa %s: %w", *nim, err)
		}
		return false, nil
	}

	// Generate new id_yudisium from max+1
	var maxID int
	r.db.GetContext(ctx, &maxID, "SELECT ISNULL(MAX(id_yudisium), 0) FROM siakadu.wisuda_mahasiswa")
	newIdYudisium := maxID + 1
	idYudisium = &newIdYudisium

	// Resolve id_sms from mahasiswa table via nim
	var idSms *string
	nipd := nim
	{
		var sms string
		smsErr := r.db.GetContext(ctx, &sms,
			"SELECT CAST(id_sms AS VARCHAR(36)) FROM siakadu.mahasiswa WHERE nim = @p1 AND id_sms IS NOT NULL", *nipd)
		if smsErr == nil && sms != "" {
			idSms = &sms
		}
	}

	// INSERT
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.wisuda_mahasiswa (
			id_yudisium, id_periode_wisuda, nipd, nm_mahasiswa,
			no_sk_yudisium, tgl_sk_yudisium, no_ijasah,
			is_wisuda, is_hadir_wisuda, is_valid_wisuda,
			keterangan, ipk_lulusan, id_sms,
			create_date, last_update, soft_delete, last_sync
		) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, 0, @p16)
	`,
		*idYudisium,
		*idPeriode,
		*nipd,
		namaMhs,
		getString(data, "no_sk_yudisium"),
		tglSkYudisium,
		getString(data, "no_ijasah"),
		getString(data, "is_wisuda"),
		getInt(data, "is_hadir_wisuda"),
		getInt(data, "is_valid_wisuda"),
		getString(data, "keterangan"),
		getFloat(data, "ipk_lulusan"),
		idSms,
		now,
		now,
		now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert wisuda_mahasiswa %d: %w", *idYudisium, err)
	}
	return true, nil
}
