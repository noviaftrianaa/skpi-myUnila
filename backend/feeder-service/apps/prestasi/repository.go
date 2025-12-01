package prestasi

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetList(ctx context.Context, filter *ListFilter) (*PrestasiListResult, error)
	GetStats(ctx context.Context) (*PrestasiStats, error)
	GetTahunList(ctx context.Context) ([]*TahunListItem, error)
	UpsertSingle(ctx context.Context, item *Prestasi) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ListFilter - Filter for list query
type ListFilter struct {
	Page          int     `query:"page"`
	Limit         int     `query:"limit"`
	Search        string  `query:"search"`
	TahunPrestasi *int    `query:"tahun_prestasi"`
	IDProdi       *string `query:"id_prodi"`
	OrderBy       string  `query:"order_by"`
	OrderDir      string  `query:"order_dir"`
}

// convertToWIB converts UTC time to WIB (UTC+7)
func convertToWIB(t time.Time) time.Time {
	wib := time.FixedZone("WIB", 7*60*60)
	return t.In(wib)
}

func (r *repository) GetList(ctx context.Context, filter *ListFilter) (*PrestasiListResult, error) {
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

	conditions = append(conditions, "p.soft_delete = 0")

	// Filter by tahun prestasi
	if filter.TahunPrestasi != nil && *filter.TahunPrestasi > 0 {
		conditions = append(conditions, fmt.Sprintf("p.thn_prestasi = @p%d", argIndex))
		args = append(args, *filter.TahunPrestasi)
		argIndex++
	}

	// Filter by prodi (through reg_pd)
	if filter.IDProdi != nil && *filter.IDProdi != "" {
		conditions = append(conditions, fmt.Sprintf("rpd.id_sms = @p%d", argIndex))
		args = append(args, *filter.IDProdi)
		argIndex++
	}

	// Search by NIM, nama mahasiswa, or nama prestasi
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(rpd.nipd LIKE @p%d OR pd.nm_pd LIKE @p%d OR p.nm_prestasi LIKE @p%d)", argIndex, argIndex+1, argIndex+2))
		searchPattern := "%" + filter.Search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
		argIndex += 3
	}

	whereClause := strings.Join(conditions, " AND ")

	// Build main query
	query := fmt.Sprintf(`
		SELECT
			CAST(p.id_prestasi AS VARCHAR(50)) AS id_prestasi,
			CAST(p.id_pd AS VARCHAR(50)) AS id_pd,
			rpd.nipd AS nim,
			pd.nm_pd AS nama_mahasiswa,
			sms.nm_lemb AS nama_prodi,
			p.id_jenis_prestasi,
			jp.nm_jenis_prestasi AS nama_jenis_prestasi,
			p.id_tkt_prestasi,
			tp.nm_tkt_prestasi AS nama_tingkat_prestasi,
			p.nm_prestasi,
			p.thn_prestasi,
			p.penyelenggara,
			p.peringkat,
			CAST(p.id_akt_mhs AS VARCHAR(50)) AS id_akt_mhs,
			p.last_sync
		FROM pdrd.prestasi AS p WITH(NOLOCK)
		LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
		LEFT JOIN pdrd.reg_pd AS rpd WITH(NOLOCK) ON rpd.id_pd = pd.id_pd AND rpd.soft_delete = 0
		LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = rpd.id_sms AND sms.soft_delete = 0
		LEFT JOIN ref.jenis_prestasi AS jp WITH(NOLOCK) ON jp.id_jenis_prestasi = p.id_jenis_prestasi
		LEFT JOIN ref.tingkat_prestasi AS tp WITH(NOLOCK) ON tp.id_tkt_prestasi = p.id_tkt_prestasi
		WHERE %s
	`, whereClause)

	// Order by
	orderBy := "p.last_sync"
	orderDir := "DESC"
	if filter.OrderBy != "" {
		switch filter.OrderBy {
		case "nim":
			orderBy = "rpd.nipd"
		case "nama_mahasiswa":
			orderBy = "pd.nm_pd"
		case "nama_prodi":
			orderBy = "sms.nm_lemb"
		case "nm_prestasi":
			orderBy = "p.nm_prestasi"
		case "thn_prestasi":
			orderBy = "p.thn_prestasi"
		case "peringkat":
			orderBy = "p.peringkat"
		case "last_sync":
			orderBy = "p.last_sync"
		}
	}
	if filter.OrderDir != "" && (strings.ToUpper(filter.OrderDir) == "ASC" || strings.ToUpper(filter.OrderDir) == "DESC") {
		orderDir = strings.ToUpper(filter.OrderDir)
	}

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.prestasi AS p WITH(NOLOCK)
		LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = p.id_pd AND pd.soft_delete = 0
		LEFT JOIN pdrd.reg_pd AS rpd WITH(NOLOCK) ON rpd.id_pd = pd.id_pd AND rpd.soft_delete = 0
		WHERE %s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count prestasi: %w", err)
	}

	// Add pagination
	offset := (filter.Page - 1) * filter.Limit
	query = fmt.Sprintf(`%s ORDER BY %s %s OFFSET %d ROWS FETCH NEXT %d ROWS ONLY`,
		query, orderBy, orderDir, offset, filter.Limit)

	var items []*PrestasiListItem
	err = r.db.SelectContext(ctx, &items, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get prestasi list: %w", err)
	}

	// Convert times to WIB
	for _, item := range items {
		if item.LastSync != nil {
			converted := convertToWIB(*item.LastSync)
			item.LastSync = &converted
		}
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit

	return &PrestasiListResult{
		Data:       items,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetStats(ctx context.Context) (*PrestasiStats, error) {
	stats := &PrestasiStats{}

	// Get total prestasi
	err := r.db.GetContext(ctx, &stats.TotalPrestasi, `
		SELECT COUNT(*) FROM pdrd.prestasi WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total prestasi: %w", err)
	}

	// Get total unique mahasiswa
	err = r.db.GetContext(ctx, &stats.TotalMahasiswa, `
		SELECT COUNT(DISTINCT id_pd) FROM pdrd.prestasi WITH(NOLOCK) WHERE soft_delete = 0
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total mahasiswa: %w", err)
	}

	// Get total nasional (tingkat 5 = Nasional typically)
	err = r.db.GetContext(ctx, &stats.TotalNasional, `
		SELECT COUNT(*) FROM pdrd.prestasi WITH(NOLOCK)
		WHERE soft_delete = 0 AND id_tkt_prestasi = 5
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total nasional: %w", err)
	}

	// Get total internasional (tingkat > 5 typically)
	err = r.db.GetContext(ctx, &stats.TotalInternasional, `
		SELECT COUNT(*) FROM pdrd.prestasi WITH(NOLOCK)
		WHERE soft_delete = 0 AND id_tkt_prestasi > 5
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get total internasional: %w", err)
	}

	// Get last sync
	var lastSync *time.Time
	err = r.db.GetContext(ctx, &lastSync, `
		SELECT MAX(last_sync) FROM pdrd.prestasi WITH(NOLOCK) WHERE soft_delete = 0
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

func (r *repository) GetTahunList(ctx context.Context) ([]*TahunListItem, error) {
	query := `
		SELECT DISTINCT thn_prestasi
		FROM pdrd.prestasi WITH(NOLOCK)
		WHERE soft_delete = 0
		ORDER BY thn_prestasi DESC
	`

	var items []*TahunListItem
	err := r.db.SelectContext(ctx, &items, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get tahun list: %w", err)
	}

	return items, nil
}

// UpsertSingle performs single record upsert with UUID validation and FK constraint handling
func (r *repository) UpsertSingle(ctx context.Context, item *Prestasi) error {
	// Default id_sp for Universitas Lampung
	const defaultIDSP = "e2b705a7-173e-464a-9fac-509128709515"

	// Use default id_sp if not provided or empty
	idSP := item.IDSP
	if idSP == "" {
		idSP = defaultIDSP
	}

	// Set id_akt_mhs to nil if empty (to avoid FK constraint)
	var idAktMhs interface{}
	if item.IDAktMhs != nil && *item.IDAktMhs != "" {
		idAktMhs = *item.IDAktMhs
	} else {
		idAktMhs = nil
	}

	query := `
		DECLARE @id_prestasi UNIQUEIDENTIFIER = TRY_CAST(@p1 AS UNIQUEIDENTIFIER);
		DECLARE @id_pd UNIQUEIDENTIFIER = TRY_CAST(@p2 AS UNIQUEIDENTIFIER);
		DECLARE @id_sp UNIQUEIDENTIFIER = TRY_CAST(@p3 AS UNIQUEIDENTIFIER);
		DECLARE @id_akt_mhs_input UNIQUEIDENTIFIER = TRY_CAST(@p4 AS UNIQUEIDENTIFIER);

		-- Set id_akt_mhs to NULL if it doesn't exist in akt_mhs table
		DECLARE @id_akt_mhs UNIQUEIDENTIFIER = NULL;
		IF @id_akt_mhs_input IS NOT NULL AND EXISTS (SELECT 1 FROM pdrd.akt_mhs WHERE id_akt_mhs = @id_akt_mhs_input)
		BEGIN
			SET @id_akt_mhs = @id_akt_mhs_input;
		END

		-- Check if required UUIDs are valid
		IF @id_prestasi IS NULL OR @id_pd IS NULL
		BEGIN
			RAISERROR('INVALID_UUID', 16, 1);
			RETURN;
		END

		-- Check if id_pd exists in peserta_didik
		IF NOT EXISTS (SELECT 1 FROM pdrd.peserta_didik WHERE id_pd = @id_pd)
		BEGIN
			RAISERROR('FK_PESERTA_DIDIK_NOT_FOUND', 16, 1);
			RETURN;
		END

		MERGE pdrd.prestasi AS target
		USING (SELECT
			@id_prestasi AS id_prestasi,
			@p5 AS id_jenis_prestasi,
			@id_akt_mhs AS id_akt_mhs,
			@p6 AS nm_prestasi,
			@p7 AS thn_prestasi,
			@p8 AS penyelenggara,
			@p9 AS peringkat,
			@id_sp AS id_sp,
			@id_pd AS id_pd,
			@p10 AS id_tkt_prestasi,
			@p11 AS last_sync
		) AS source
		ON target.id_prestasi = source.id_prestasi
		WHEN MATCHED THEN
			UPDATE SET
				id_jenis_prestasi = source.id_jenis_prestasi,
				id_akt_mhs = source.id_akt_mhs,
				nm_prestasi = source.nm_prestasi,
				thn_prestasi = source.thn_prestasi,
				penyelenggara = source.penyelenggara,
				peringkat = source.peringkat,
				id_sp = source.id_sp,
				id_pd = source.id_pd,
				id_tkt_prestasi = source.id_tkt_prestasi,
				last_update = GETUTCDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (id_prestasi, id_jenis_prestasi, id_akt_mhs, nm_prestasi, thn_prestasi, penyelenggara, peringkat, id_sp, id_pd, id_tkt_prestasi, create_date, id_creator, last_update, soft_delete, last_sync)
			VALUES (source.id_prestasi, source.id_jenis_prestasi, source.id_akt_mhs, source.nm_prestasi, source.thn_prestasi, source.penyelenggara, source.peringkat, source.id_sp, source.id_pd, source.id_tkt_prestasi, GETUTCDATE(), '00000000-0000-0000-0000-000000000000', GETUTCDATE(), 0, source.last_sync);
	`

	_, err := r.db.ExecContext(ctx, query,
		item.IDPrestasi,      // @p1
		item.IDPD,            // @p2
		idSP,                 // @p3 - Use default if empty
		idAktMhs,             // @p4 - Use nil if empty/not exists
		item.IDJenisPrestasi, // @p5
		item.NmPrestasi,      // @p6
		item.ThnPrestasi,     // @p7
		item.Penyelenggara,   // @p8
		item.Peringkat,       // @p9
		item.IDTktPrestasi,   // @p10
		item.LastSync,        // @p11
	)

	return err
}
