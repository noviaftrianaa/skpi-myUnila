package sertifikasi_dosen

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

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

// truncateNullString truncates a sql.NullString pointer to maxLen if it exceeds the limit
func truncateNullString(s *sql.NullString, maxLen int) *sql.NullString {
	if s == nil || !s.Valid {
		return s
	}
	if len(s.String) > maxLen {
		truncated := s.String[:maxLen]
		return &sql.NullString{String: truncated, Valid: true}
	}
	return s
}

type Repository interface {
	// Sertifikasi operations
	MergeRwySertifikasi(sertifikasi *RwySertifikasi) error
	GetRwySertifikasiByID(idRwySert string) (*RwySertifikasiWithDetail, error)
	GetRwySertifikasiList(page, limit int, search, sortBy, sortOrder string) (*SertifikasiListResult, error)
	GetRwySertifikasiStats() (*SertifikasiStats, error)

	// Dokumen operations
	MergeDokumen(dokumen *Dokumen) error
	GetDokumenBySertifikasi(idRwySert string) ([]*Dokumen, error)
	MergeDokRwySertifikasi(idRwySert, idDok string) error
	SoftDeleteDokumenNotInList(idRwySert string, activeDokIDs []string) error

	// Helper operations
	GetAllIDSDMWithSertifikasi() ([]string, error)
	GetAllActiveDosenIDSDM() ([]string, error)
	GetJenisSertifikasiIDByName(name string) (int, error)
	GetJenisDokumenMap() (map[string]int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// MergeRwySertifikasi performs MERGE (upsert) operation for rwy_sertifikasi
func (r *repository) MergeRwySertifikasi(sertifikasi *RwySertifikasi) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	skSert := truncateNullString(&sertifikasi.SKSert, 80)
	nrg := truncateNullString(&sertifikasi.Nrg, 15)
	noPeserta := truncateNullString(&sertifikasi.NoPeserta, 16)

	query := `
		MERGE INTO pdrd.rwy_sertifikasi WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_sert,
				CAST(@p2 AS numeric(3,0)) AS id_jns_sert,
				CAST(@p3 AS int) AS id_bid_studi,
				CAST(@p4 AS numeric(4,0)) AS id_lemb_sert,
				CAST(@p5 AS uniqueidentifier) AS id_sdm,
				CAST(@p6 AS numeric(4,0)) AS thn_sert,
				CAST(@p7 AS varchar(80)) AS sk_sert,
				CAST(@p8 AS varchar(15)) AS nrg,
				CAST(@p9 AS varchar(16)) AS no_peserta,
				CAST(@p10 AS datetime) AS tmt_sert,
				CAST(@p11 AS datetime) AS tst_sert,
				CAST(@p12 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_sert = source.id_rwy_sert
		WHEN MATCHED THEN
			UPDATE SET
				id_jns_sert = source.id_jns_sert,
				id_bid_studi = source.id_bid_studi,
				id_lemb_sert = source.id_lemb_sert,
				id_sdm = source.id_sdm,
				thn_sert = source.thn_sert,
				sk_sert = source.sk_sert,
				nrg = source.nrg,
				no_peserta = source.no_peserta,
				tmt_sert = source.tmt_sert,
				tst_sert = source.tst_sert,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_sert, id_jns_sert, id_bid_studi, id_lemb_sert, id_sdm,
				thn_sert, sk_sert, nrg, no_peserta, tmt_sert, tst_sert,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_rwy_sert, source.id_jns_sert, source.id_bid_studi, source.id_lemb_sert, source.id_sdm,
				source.thn_sert, source.sk_sert, source.nrg, source.no_peserta, source.tmt_sert, source.tst_sert,
				GETDATE(), source.id_sdm, GETDATE(), source.id_sdm, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		sertifikasi.IDRwySert,  // @p1
		sertifikasi.IDJnsSert,  // @p2
		sertifikasi.IDBidStudi, // @p3
		sertifikasi.IDLembSert, // @p4
		sertifikasi.IDSDM,      // @p5
		sertifikasi.ThnSert,    // @p6
		skSert,                 // @p7
		nrg,                    // @p8
		noPeserta,              // @p9
		sertifikasi.TmtSert,    // @p10
		sertifikasi.TstSert,    // @p11
		time.Now(),             // @p12
	)

	if err != nil {
		log.Printf("❌ Error merging rwy_sertifikasi: %v", err)
		return fmt.Errorf("failed to merge rwy_sertifikasi: %w", err)
	}

	return nil
}

// MergeDokumen performs MERGE (upsert) operation for dokumen
func (r *repository) MergeDokumen(dokumen *Dokumen) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	nmDok := truncateString(dokumen.NmDok, 200)
	ketDok := truncateString(dokumen.KetDok, 500)
	url := truncateString(dokumen.URL, 500)
	mediaType := truncateString(dokumen.MediaType, 100)
	fileName := truncateString(dokumen.FileName, 500)

	query := `
		MERGE INTO dok.dokumen WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_dok,
				CAST(@p2 AS int) AS id_jns_dok,
				CAST(@p3 AS varchar(200)) AS nm_dok,
				CAST(@p4 AS varchar(500)) AS ket_dok,
				CAST(@p5 AS datetime) AS wkt_unggah,
				CAST(@p6 AS varchar(500)) AS url,
				CAST(@p7 AS varchar(100)) AS media_type,
				CAST(@p8 AS varchar(500)) AS file_name,
				CAST(@p9 AS uniqueidentifier) AS id_creator,
				CAST(@p10 AS datetime) AS last_sync
		) AS source
		ON target.id_dok = source.id_dok
		WHEN MATCHED THEN
			UPDATE SET
				id_jns_dok = source.id_jns_dok,
				nm_dok = source.nm_dok,
				ket_dok = source.ket_dok,
				wkt_unggah = source.wkt_unggah,
				url = source.url,
				media_type = source.media_type,
				file_name = source.file_name,
				last_update = GETDATE(),
				id_updater = source.id_creator,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_dok, id_jns_dok, nm_dok, ket_dok, wkt_unggah, url, media_type, file_name,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_dok, source.id_jns_dok, source.nm_dok, source.ket_dok, source.wkt_unggah,
				source.url, source.media_type, source.file_name,
				GETDATE(), source.id_creator, GETDATE(), source.id_creator, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		dokumen.IDDok,      // @p1
		dokumen.IDJnsDok,   // @p2
		nmDok,              // @p3
		ketDok,             // @p4
		dokumen.WktUnggah,  // @p5
		url,                // @p6
		mediaType,          // @p7
		fileName,           // @p8
		dokumen.IDCreator,  // @p9
		time.Now(),         // @p10
	)

	if err != nil {
		log.Printf("❌ Error merging dokumen: %v", err)
		return fmt.Errorf("failed to merge dokumen: %w", err)
	}

	return nil
}

// MergeDokRwySertifikasi performs MERGE (upsert) operation for dok_rwy_sertifikasi junction table
func (r *repository) MergeDokRwySertifikasi(idRwySert, idDok string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		MERGE INTO dok.dok_rwy_sertifikasi WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_sert,
				CAST(@p2 AS uniqueidentifier) AS id_dok,
				CAST(@p3 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_sert = source.id_rwy_sert AND target.id_dok = source.id_dok
		WHEN MATCHED THEN
			UPDATE SET
				last_update = GETDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_sert, id_dok, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_rwy_sert, source.id_dok, GETDATE(), source.id_rwy_sert, GETDATE(), source.id_rwy_sert, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		idRwySert,  // @p1
		idDok,      // @p2
		time.Now(), // @p3
	)

	if err != nil {
		log.Printf("❌ Error merging dok_rwy_sertifikasi: %v", err)
		return fmt.Errorf("failed to merge dok_rwy_sertifikasi: %w", err)
	}

	return nil
}

// GetRwySertifikasiByID retrieves sertifikasi by ID with related display fields
func (r *repository) GetRwySertifikasiByID(idRwySert string) (*RwySertifikasiWithDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			rs.id_rwy_sert,
			rs.id_sdm,
			rs.thn_sert,
			rs.sk_sert,
			rs.nrg,
			rs.no_peserta,
			rs.tmt_sert,
			rs.tst_sert,
			rs.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			js.nm_jns_sert AS jenis_sertifikasi,
			bs.nm_bid_studi AS bidang_studi,
			ls.nm_lemb_sert AS lembaga_sertifikasi
		FROM pdrd.rwy_sertifikasi rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jenis_sert js ON rs.id_jns_sert = js.id_jns_sert
		LEFT JOIN ref.bidang_studi bs ON rs.id_bid_studi = bs.id_bid_studi
		LEFT JOIN ref.lembaga_sertifikasi ls ON rs.id_lemb_sert = ls.id_lemb_sert
		WHERE rs.id_rwy_sert = @p1 AND rs.soft_delete = 0
	`

	var result RwySertifikasiWithDetail
	err := r.db.GetContext(ctx, &result, query, idRwySert)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rwy_sertifikasi not found")
		}
		log.Printf("❌ Error getting rwy_sertifikasi by ID: %v", err)
		return nil, fmt.Errorf("failed to get rwy_sertifikasi: %w", err)
	}

	return &result, nil
}

// GetRwySertifikasiList retrieves paginated list of sertifikasi with search and sort
func (r *repository) GetRwySertifikasiList(page, limit int, search, sortBy, sortOrder string) (*SertifikasiListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Default sorting
	if sortBy == "" {
		sortBy = "rs.last_sync"
	}
	if sortOrder == "" {
		sortOrder = "DESC"
	}

	// Validate sort order
	sortOrder = strings.ToUpper(sortOrder)
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "DESC"
	}

	// Build WHERE clause for search
	whereClause := "WHERE rs.soft_delete = 0"
	var args []interface{}
	argIndex := 1

	if search != "" {
		whereClause += fmt.Sprintf(` AND (
			s.nm_sdm LIKE @p%d OR
			s.nidn LIKE @p%d OR
			rs.sk_sert LIKE @p%d OR
			rs.nrg LIKE @p%d OR
			js.nm_jns_sert LIKE @p%d OR
			bs.nm_bid_studi LIKE @p%d
		)`, argIndex, argIndex, argIndex, argIndex, argIndex, argIndex)
		args = append(args, "%"+search+"%")
		argIndex++
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.rwy_sertifikasi rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jenis_sert js ON rs.id_jns_sert = js.id_jns_sert
		LEFT JOIN ref.bidang_studi bs ON rs.id_bid_studi = bs.id_bid_studi
		LEFT JOIN ref.lembaga_sertifikasi ls ON rs.id_lemb_sert = ls.id_lemb_sert
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		log.Printf("❌ Error counting sertifikasi: %v", err)
		return nil, fmt.Errorf("failed to count sertifikasi: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Build ORDER BY clause
	validSortColumns := map[string]string{
		"last_sync":            "rs.last_sync",
		"nama_dosen":           "s.nm_sdm",
		"thn_sert":             "rs.thn_sert",
		"jenis_sertifikasi":    "js.nm_jns_sert",
		"bidang_studi":         "bs.nm_bid_studi",
		"lembaga_sertifikasi":  "ls.nm_lemb_sert",
	}

	orderByClause := fmt.Sprintf("ORDER BY %s %s", sortBy, sortOrder)
	if sortColumn, ok := validSortColumns[sortBy]; ok {
		orderByClause = fmt.Sprintf("ORDER BY %s %s", sortColumn, sortOrder)
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			rs.id_rwy_sert,
			rs.id_sdm,
			rs.thn_sert,
			rs.sk_sert,
			rs.nrg,
			rs.no_peserta,
			rs.tmt_sert,
			rs.tst_sert,
			rs.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			js.nm_jns_sert AS jenis_sertifikasi,
			bs.nm_bid_studi AS bidang_studi,
			ls.nm_lemb_sert AS lembaga_sertifikasi
		FROM pdrd.rwy_sertifikasi rs
		LEFT JOIN pdrd.sdm s ON rs.id_sdm = s.id_sdm
		LEFT JOIN ref.jenis_sert js ON rs.id_jns_sert = js.id_jns_sert
		LEFT JOIN ref.bidang_studi bs ON rs.id_bid_studi = bs.id_bid_studi
		LEFT JOIN ref.lembaga_sertifikasi ls ON rs.id_lemb_sert = ls.id_lemb_sert
		%s
		%s
		OFFSET %d ROWS FETCH NEXT %d ROWS ONLY
	`, whereClause, orderByClause, offset, limit)

	var data []*RwySertifikasiWithDetail
	err = r.db.SelectContext(ctx, &data, dataQuery, args...)
	if err != nil {
		log.Printf("❌ Error getting sertifikasi list: %v", err)
		return nil, fmt.Errorf("failed to get sertifikasi list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &SertifikasiListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRwySertifikasiStats retrieves statistics
func (r *repository) GetRwySertifikasiStats() (*SertifikasiStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(DISTINCT rs.id_rwy_sert) AS total_sertifikasi,
			SUM(CASE WHEN rs.tst_sert IS NULL OR rs.tst_sert > GETDATE() THEN 1 ELSE 0 END) AS total_aktif,
			SUM(CASE WHEN rs.tst_sert IS NOT NULL AND rs.tst_sert <= GETDATE() THEN 1 ELSE 0 END) AS total_kadaluarsa,
			MAX(rs.last_sync) AS last_sync_date
		FROM pdrd.rwy_sertifikasi rs
		WHERE rs.soft_delete = 0
	`

	var stats SertifikasiStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get sertifikasi stats: %w", err)
	}

	return &stats, nil
}

// GetDokumenBySertifikasi retrieves all documents for a sertifikasi
func (r *repository) GetDokumenBySertifikasi(idRwySert string) ([]*Dokumen, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			d.id_dok, d.id_jns_dok, d.nm_dok, d.ket_dok, d.wkt_unggah,
			d.url, d.media_type, d.file_name, d.create_date, d.id_creator,
			d.last_update, d.id_updater, d.soft_delete, d.last_sync
		FROM dok.dokumen d
		INNER JOIN dok.dok_rwy_sertifikasi drs ON d.id_dok = drs.id_dok
		WHERE drs.id_rwy_sert = @p1 AND d.soft_delete = 0
		ORDER BY d.wkt_unggah DESC
	`

	var dokumen []*Dokumen
	err := r.db.SelectContext(ctx, &dokumen, query, idRwySert)
	if err != nil {
		log.Printf("❌ Error getting dokumen for sertifikasi %s: %v", idRwySert, err)
		return nil, fmt.Errorf("failed to get dokumen: %w", err)
	}

	return dokumen, nil
}

// SoftDeleteDokumenNotInList soft deletes dokumen not in the active list
func (r *repository) SoftDeleteDokumenNotInList(idRwySert string, activeDokIDs []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if len(activeDokIDs) == 0 {
		// If no active dokumen, soft delete all
		query := `
			UPDATE drs
			SET drs.soft_delete = 1, drs.last_update = GETDATE()
			FROM dok.dok_rwy_sertifikasi drs
			WHERE drs.id_rwy_sert = @p1
		`
		_, err := r.db.ExecContext(ctx, query, idRwySert)
		return err
	}

	// Build placeholders for IN clause
	placeholders := make([]string, len(activeDokIDs))
	args := []interface{}{idRwySert}
	for i, id := range activeDokIDs {
		placeholders[i] = fmt.Sprintf("@p%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE drs
		SET drs.soft_delete = 1, drs.last_update = GETDATE()
		FROM dok.dok_rwy_sertifikasi drs
		WHERE drs.id_rwy_sert = @p1
		AND drs.id_dok NOT IN (%s)
	`, strings.Join(placeholders, ","))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		log.Printf("❌ Error soft deleting old dokumen: %v", err)
		return fmt.Errorf("failed to soft delete old dokumen: %w", err)
	}

	return nil
}

// GetAllIDSDMWithSertifikasi retrieves all unique id_sdm that have sertifikasi records
func (r *repository) GetAllIDSDMWithSertifikasi() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT id_sdm
		FROM pdrd.rwy_sertifikasi
		WHERE soft_delete = 0
		ORDER BY id_sdm
	`

	var idSDMList []string
	err := r.db.SelectContext(ctx, &idSDMList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get id_sdm list: %w", err)
	}

	return idSDMList, nil
}

// GetAllActiveDosenIDSDM retrieves all active dosen id_sdm for batch sync
func (r *repository) GetAllActiveDosenIDSDM() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT CONVERT(VARCHAR(36), id_sdm) as id_sdm
		FROM pdrd.sdm WITH (NOLOCK)
		WHERE soft_delete = 0 AND id_sdm IS NOT NULL
		ORDER BY nm_sdm
	`

	var idSDMList []string
	err := r.db.SelectContext(ctx, &idSDMList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query active dosen: %w", err)
	}

	return idSDMList, nil
}

// GetJenisSertifikasiIDByName retrieves jenis_sertifikasi ID by name
func (r *repository) GetJenisSertifikasiIDByName(name string) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT id_jns_sert
		FROM ref.jenis_sert
		WHERE nm_jns_sert = @p1 OR LOWER(nm_jns_sert) LIKE LOWER(@p2)
	`

	var idJnsSert int
	err := r.db.GetContext(ctx, &idJnsSert, query, name, "%"+name+"%")
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("⚠️  Jenis sertifikasi not found for name: %s, using default", name)
			// Return a default ID or 0 if not found
			return 0, fmt.Errorf("jenis_sertifikasi not found: %s", name)
		}
		return 0, fmt.Errorf("failed to get jenis_sertifikasi ID: %w", err)
	}

	return idJnsSert, nil
}

// GetJenisDokumenMap retrieves mapping of jenis_dokumen name to ID
func (r *repository) GetJenisDokumenMap() (map[string]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT id_jns_dok, nm_jns_dok
		FROM ref.jenis_dokumen
	`

	type JenisDokumen struct {
		IDJnsDok int    `db:"id_jns_dok"`
		NmJnsDok string `db:"nm_jns_dok"`
	}

	var jenisDokList []JenisDokumen
	err := r.db.SelectContext(ctx, &jenisDokList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get jenis_dokumen list: %w", err)
	}

	// Create map
	jenisDokMap := make(map[string]int)
	for _, jd := range jenisDokList {
		jenisDokMap[jd.NmJnsDok] = jd.IDJnsDok
	}

	return jenisDokMap, nil
}
