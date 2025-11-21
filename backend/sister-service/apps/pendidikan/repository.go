package pendidikan

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"sister-service/pkg/timeutil"
)

type Repository interface {
	MergePendidikanFormal(pendidikan *RwyPendFormal) error
	GetPendidikanFormalByIDSDM(idSDM string) ([]*RwyPendFormal, error)
	GetPendidikanFormalByID(idRwyDidikFormal string) (*RwyPendFormal, error)
	GetPendidikanFormalStats() (*PendidikanFormalStats, error)
	GetPendidikanFormalList(page, limit int, search, sortBy, sortOrder string) (*PendidikanFormalListResult, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// truncateString truncates a string pointer to maxLen if it exceeds the limit
func truncateString(s *string, maxLen int) *string {
	if s == nil {
		return nil
	}
	if len(*s) > maxLen {
		truncated := (*s)[:maxLen]
		return &truncated
	}
	return s
}

// truncateStringValue truncates a regular string to maxLen if it exceeds the limit
func truncateStringValue(s string, maxLen int) string {
	if len(s) > maxLen {
		return s[:maxLen]
	}
	return s
}

// MergePendidikanFormal performs MERGE (upsert) operation for pendidikan formal
func (r *repository) MergePendidikanFormal(pendidikan *RwyPendFormal) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate ALL string fields in Go before passing to SQL Server
	// This prevents SQL Server parameter type inference issues

	// UUID fields - no truncation needed, UUID is always 36 characters
	idRwyDidikFormal := pendidikan.IDRwyDidikFormal
	idSDM := pendidikan.IDSDM
	idSMS := pendidikan.IDSMS // Can be nil, Go SQL driver handles NULL properly

	// Regular string pointer fields - truncate to match database column sizes
	nmSpFormal := truncateString(pendidikan.NmSpFormal, 255)
	fak := truncateString(pendidikan.Fak, 255)
	skSetara := truncateString(pendidikan.SkSetara, 255)
	noIjazah := truncateString(pendidikan.NoIjazah, 100)
	judulTesis := truncateString(pendidikan.JudulTesis, 1000)

	// Handle nipd: default to "-" if nil, truncate to 50
	var nipd string
	if pendidikan.NIPD != nil {
		if len(*pendidikan.NIPD) > 50 {
			nipd = (*pendidikan.NIPD)[:50]
		} else {
			nipd = *pendidikan.NIPD
		}
	} else {
		nipd = "-"
	}

	// Handle stat_kul: truncate to 1 character
	statKul := pendidikan.StatKul
	if len(statKul) > 1 {
		statKul = statKul[:1]
	}

	query := `
		MERGE INTO pdrd.rwy_pend_formal WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_didik_formal,
				CAST(@p2 AS uniqueidentifier) AS id_sms,
				CAST(@p3 AS int) AS id_katgiat,
				CAST(@p4 AS uniqueidentifier) AS id_sdm,
				CAST(@p5 AS int) AS id_jenj_didik,
				CAST(@p6 AS int) AS id_bid_studi,
				CAST(@p7 AS int) AS id_gelar_akad,
				CAST(@p8 AS varchar(255)) AS nm_sp_formal,
				CAST(@p9 AS varchar(255)) AS fak,
				CAST(@p10 AS int) AS a_kependidikan,
				CAST(@p11 AS int) AS thn_masuk,
				CAST(@p12 AS int) AS thn_lulus,
				CAST(@p13 AS varchar(50)) AS nipd,
				CAST(@p14 AS varchar(1)) AS stat_kul,
				CAST(@p15 AS int) AS smt,
				CAST(@p16 AS int) AS sks_lulus,
				CAST(@p17 AS decimal(3,2)) AS ipk,
				CAST(@p18 AS varchar(255)) AS sk_setara,
				CAST(@p19 AS datetime) AS tgl_sk_setara,
				CAST(@p20 AS varchar(100)) AS no_ijazah,
				CAST(@p21 AS varchar(1000)) AS judul_tesis,
				CAST(@p22 AS datetime) AS tgl_lulus,
				CAST(@p23 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_didik_formal = source.id_rwy_didik_formal
		WHEN MATCHED THEN
			UPDATE SET
				id_sms = source.id_sms,
				id_katgiat = source.id_katgiat,
				id_sdm = source.id_sdm,
				id_jenj_didik = source.id_jenj_didik,
				id_bid_studi = source.id_bid_studi,
				id_gelar_akad = source.id_gelar_akad,
				nm_sp_formal = source.nm_sp_formal,
				fak = source.fak,
				a_kependidikan = source.a_kependidikan,
				thn_masuk = ISNULL(source.thn_masuk, target.thn_masuk),
				thn_lulus = source.thn_lulus,
				nipd = source.nipd,
				stat_kul = source.stat_kul,
				smt = source.smt,
				sks_lulus = ISNULL(source.sks_lulus, target.sks_lulus),
				ipk = ISNULL(source.ipk, target.ipk),
				sk_setara = source.sk_setara,
				tgl_sk_setara = source.tgl_sk_setara,
				no_ijazah = source.no_ijazah,
				judul_tesis = source.judul_tesis,
				tgl_lulus = source.tgl_lulus,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_didik_formal,
				id_sms,
				id_katgiat,
				id_sdm,
				id_jenj_didik,
				id_bid_studi,
				id_gelar_akad,
				nm_sp_formal,
				fak,
				a_kependidikan,
				thn_masuk,
				thn_lulus,
				nipd,
				stat_kul,
				smt,
				sks_lulus,
				ipk,
				sk_setara,
				tgl_sk_setara,
				no_ijazah,
				judul_tesis,
				tgl_lulus,
				create_date,
				id_creator,
				last_update,
				id_updater,
				soft_delete,
				last_sync
			) VALUES (
				source.id_rwy_didik_formal,
				source.id_sms,
				source.id_katgiat,
				source.id_sdm,
				source.id_jenj_didik,
				source.id_bid_studi,
				source.id_gelar_akad,
				source.nm_sp_formal,
				source.fak,
				source.a_kependidikan,
				source.thn_masuk,
				source.thn_lulus,
				source.nipd,
				source.stat_kul,
				source.smt,
				source.sks_lulus,
				source.ipk,
				source.sk_setara,
				source.tgl_sk_setara,
				source.no_ijazah,
				source.judul_tesis,
				source.tgl_lulus,
				GETDATE(),
				source.id_sdm,
				GETDATE(),
				source.id_sdm,
				0,
				source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		idRwyDidikFormal,
		idSMS,
		pendidikan.IDKatgiat,
		idSDM,
		pendidikan.IDJenjDidik,
		pendidikan.IDBidStudi,
		pendidikan.IDGelarAkad,
		nmSpFormal,
		fak,
		pendidikan.AKependidikan,
		pendidikan.ThnMasuk,
		pendidikan.ThnLulus,
		nipd,
		statKul,
		pendidikan.Smt,
		pendidikan.SksLulus,
		pendidikan.IPK,
		skSetara,
		pendidikan.TglSkSetara,
		noIjazah,
		judulTesis,
		pendidikan.TglLulus,
		timeutil.NowWIB(),
	)

	if err != nil {
		log.Printf("❌ Error merging pendidikan formal: %v", err)
		return fmt.Errorf("failed to merge pendidikan formal: %w", err)
	}

	return nil
}

// GetPendidikanFormalByIDSDM retrieves all pendidikan formal for a dosen
func (r *repository) GetPendidikanFormalByIDSDM(idSDM string) ([]*RwyPendFormal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			id_rwy_didik_formal,
			id_sms,
			id_katgiat,
			id_sdm,
			id_jenj_didik,
			id_bid_studi,
			id_gelar_akad,
			nm_sp_formal,
			fak,
			a_kependidikan,
			thn_masuk,
			thn_lulus,
			nipd,
			stat_kul,
			smt,
			sks_lulus,
			ipk,
			sk_setara,
			tgl_sk_setara,
			no_ijazah,
			judul_tesis,
			tgl_lulus,
			create_date,
			id_creator,
			last_update,
			id_updater,
			soft_delete,
			last_sync
		FROM pdrd.rwy_pend_formal WITH (NOLOCK)
		WHERE id_sdm = @id_sdm
			AND soft_delete = 0
		ORDER BY thn_lulus DESC, thn_masuk DESC
	`

	var pendidikanList []*RwyPendFormal
	err := r.db.SelectContext(ctx, &pendidikanList, query, sql.Named("id_sdm", idSDM))
	if err != nil {
		if err == sql.ErrNoRows {
			return []*RwyPendFormal{}, nil
		}
		log.Printf("❌ Error getting pendidikan formal by id_sdm: %v", err)
		return nil, fmt.Errorf("failed to get pendidikan formal: %w", err)
	}

	return pendidikanList, nil
}

// GetPendidikanFormalByID retrieves a single pendidikan formal by ID
func (r *repository) GetPendidikanFormalByID(idRwyDidikFormal string) (*RwyPendFormal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			id_rwy_didik_formal,
			id_sms,
			id_katgiat,
			id_sdm,
			id_jenj_didik,
			id_bid_studi,
			id_gelar_akad,
			nm_sp_formal,
			fak,
			a_kependidikan,
			thn_masuk,
			thn_lulus,
			nipd,
			stat_kul,
			smt,
			sks_lulus,
			ipk,
			sk_setara,
			tgl_sk_setara,
			no_ijazah,
			judul_tesis,
			tgl_lulus,
			create_date,
			id_creator,
			last_update,
			id_updater,
			soft_delete,
			last_sync
		FROM pdrd.rwy_pend_formal WITH (NOLOCK)
		WHERE id_rwy_didik_formal = @id_rwy_didik_formal
			AND soft_delete = 0
	`

	var pendidikan RwyPendFormal
	err := r.db.GetContext(ctx, &pendidikan, query, sql.Named("id_rwy_didik_formal", idRwyDidikFormal))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		log.Printf("❌ Error getting pendidikan formal by ID: %v", err)
		return nil, fmt.Errorf("failed to get pendidikan formal: %w", err)
	}

	return &pendidikan, nil
}

// GetPendidikanFormalStats retrieves statistics for pendidikan formal
func (r *repository) GetPendidikanFormalStats() (*PendidikanFormalStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(*) as total_pendidikan_formal,
			SUM(CASE WHEN id_jenj_didik = 30 THEN 1 ELSE 0 END) as total_s1,
			SUM(CASE WHEN id_jenj_didik = 35 THEN 1 ELSE 0 END) as total_s2,
			SUM(CASE WHEN id_jenj_didik = 40 THEN 1 ELSE 0 END) as total_s3,
			MAX(last_sync) as last_sync
		FROM pdrd.rwy_pend_formal WITH (NOLOCK)
		WHERE soft_delete = 0
	`

	var stats PendidikanFormalStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		log.Printf("❌ Error getting pendidikan formal stats: %v", err)
		return nil, fmt.Errorf("failed to get pendidikan formal stats: %w", err)
	}

	return &stats, nil
}

// GetPendidikanFormalList retrieves paginated list of pendidikan formal with search
func (r *repository) GetPendidikanFormalList(page, limit int, search, sortBy, sortOrder string) (*PendidikanFormalListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	offset := (page - 1) * limit

	// Build WHERE clause for search
	searchCondition := ""
	if search != "" {
		searchCondition = `
			AND (
				pf.nm_sp_formal LIKE '%' + @search + '%' OR
				pf.judul_tesis LIKE '%' + @search + '%' OR
				pf.nipd LIKE '%' + @search + '%' OR
				jd.nm_jenj_didik LIKE '%' + @search + '%' OR
				bs.nm_bid_studi LIKE '%' + @search + '%' OR
				ga.nm_gelar_akad LIKE '%' + @search + '%' OR
				ps.nm_lemb LIKE '%' + @search + '%' OR
				sdm.nm_sdm LIKE '%' + @search + '%'
			)
		`
	}

	// Validate and build ORDER BY clause
	orderByClause := "pf.thn_lulus DESC, pf.thn_masuk DESC"

	// Map frontend column names to database columns
	validSortColumns := map[string]string{
		"nama_dosen":    "sdm.nm_sdm",
		"nm_sp_formal":  "pf.nm_sp_formal",
		"thn_lulus":     "pf.thn_lulus",
		"thn_masuk":     "pf.thn_masuk",
	}

	if sortColumn, ok := validSortColumns[sortBy]; ok {
		// Validate sort order
		order := "DESC"
		if sortOrder == "asc" || sortOrder == "ASC" {
			order = "ASC"
		}
		orderByClause = fmt.Sprintf("%s %s", sortColumn, order)
	}

	// Count total records
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.rwy_pend_formal pf WITH (NOLOCK)
		LEFT JOIN ref.jenjang_pendidikan jd WITH (NOLOCK) ON pf.id_jenj_didik = jd.id_jenj_didik
		LEFT JOIN ref.bidang_studi bs WITH (NOLOCK) ON pf.id_bid_studi = bs.id_bid_studi
		LEFT JOIN ref.gelar_akademik ga WITH (NOLOCK) ON pf.id_gelar_akad = ga.id_gelar_akad
		LEFT JOIN pdrd.sms ps WITH (NOLOCK) ON pf.id_sms = ps.id_sms
		LEFT JOIN pdrd.sdm sdm WITH (NOLOCK) ON pf.id_sdm = sdm.id_sdm
		WHERE pf.soft_delete = 0
		%s
	`, searchCondition)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, sql.Named("search", search))
	if err != nil {
		log.Printf("❌ Error counting pendidikan formal: %v", err)
		return nil, fmt.Errorf("failed to count pendidikan formal: %w", err)
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			pf.id_rwy_didik_formal,
			pf.id_sms,
			pf.id_katgiat,
			pf.id_sdm,
			pf.id_jenj_didik,
			pf.id_bid_studi,
			pf.id_gelar_akad,
			pf.nm_sp_formal,
			pf.fak,
			pf.a_kependidikan,
			pf.thn_masuk,
			pf.thn_lulus,
			pf.nipd,
			pf.stat_kul,
			pf.smt,
			pf.sks_lulus,
			pf.ipk,
			pf.sk_setara,
			pf.tgl_sk_setara,
			pf.no_ijazah,
			pf.judul_tesis,
			pf.tgl_lulus,
			pf.create_date,
			pf.id_creator,
			pf.last_update,
			pf.id_updater,
			pf.soft_delete,
			pf.last_sync,
			jd.nm_jenj_didik as jenjang_pendidikan_nama,
			bs.nm_bid_studi as bidang_studi_nama,
			ga.nm_gelar_akad as gelar_akademik_nama,
			ps.nm_lemb as nama_program_studi,
			sdm.nm_sdm as nama_dosen
		FROM pdrd.rwy_pend_formal pf WITH (NOLOCK)
		LEFT JOIN ref.jenjang_pendidikan jd WITH (NOLOCK) ON pf.id_jenj_didik = jd.id_jenj_didik
		LEFT JOIN ref.bidang_studi bs WITH (NOLOCK) ON pf.id_bid_studi = bs.id_bid_studi
		LEFT JOIN ref.gelar_akademik ga WITH (NOLOCK) ON pf.id_gelar_akad = ga.id_gelar_akad
		LEFT JOIN pdrd.sms ps WITH (NOLOCK) ON pf.id_sms = ps.id_sms
		LEFT JOIN pdrd.sdm sdm WITH (NOLOCK) ON pf.id_sdm = sdm.id_sdm
		WHERE pf.soft_delete = 0
		%s
		ORDER BY %s
		OFFSET @offset ROWS
		FETCH NEXT @limit ROWS ONLY
	`, searchCondition, orderByClause)

	var data []*PendidikanFormalListItem
	err = r.db.SelectContext(ctx, &data, dataQuery,
		sql.Named("search", search),
		sql.Named("offset", offset),
		sql.Named("limit", limit),
	)
	if err != nil {
		log.Printf("❌ Error getting pendidikan formal list: %v", err)
		return nil, fmt.Errorf("failed to get pendidikan formal list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &PendidikanFormalListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}
