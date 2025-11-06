package riwayat_pekerjaan

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

// truncateStringValue truncates a regular string to maxLen if it exceeds the limit
func truncateStringValue(s string, maxLen int) string {
	if len(s) > maxLen {
		return s[:maxLen]
	}
	return s
}

type Repository interface {
	// Riwayat Pekerjaan operations
	MergeRwyPekerjaan(rwyKerja *RwyPekerjaan) error
	GetRwyPekerjaanByID(idRwyKerja string) (*RwyPekerjaanWithDetail, error)
	GetRwyPekerjaanList(page, limit int, search, sortBy, sortOrder string) (*RiwayatPekerjaanListResult, error)
	GetRwyPekerjaanStats() (*RiwayatPekerjaanStats, error)

	// Dokumen operations
	MergeDokumen(dokumen *Dokumen) error
	GetDokumenByRwyKerja(idRwyKerja string) ([]*Dokumen, error)
	MergeDokRwyPekerjaan(idRwyKerja, idDok string) error
	SoftDeleteDokumenNotInList(idRwyKerja string, activeDokIDs []string) error

	// Helper operations
	GetAllIDSDMWithRwyPekerjaan() ([]string, error)
	GetAllActiveDosenIDSDM() ([]string, error)
	GetJenisDokumenMap() (map[string]int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// MergeRwyPekerjaan performs MERGE (upsert) operation for rwy_pekerjaan
func (r *repository) MergeRwyPekerjaan(rwyKerja *RwyPekerjaan) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	nmJabatan := truncateStringValue(rwyKerja.NmJabatan, 150)
	deskripsiKerja := truncateString(rwyKerja.DeskripsiKerja, 500)
	instansi := truncateString(rwyKerja.Instansi, 100)
	divisi := truncateString(rwyKerja.Divisi, 100)

	query := `
		MERGE INTO pdrd.rwy_pekerjaan WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_rwy_kerja,
				CAST(@p2 AS uniqueidentifier) AS id_sdm,
				CAST(@p3 AS uniqueidentifier) AS id_dudi,
				CAST(@p4 AS int) AS id_pekerjaan,
				CAST(@p5 AS numeric(7,0)) AS id_kbli,
				CAST(@p6 AS varchar(150)) AS nm_jabatan,
				CAST(@p7 AS varchar(500)) AS deskripsi_kerja,
				CAST(@p8 AS varchar(100)) AS instansi,
				CAST(@p9 AS varchar(100)) AS divisi,
				CAST(@p10 AS date) AS mulai_bekerja,
				CAST(@p11 AS date) AS selesai_bekerja,
				CAST(@p12 AS numeric(1,0)) AS a_ln,
				CAST(@p13 AS datetime) AS last_sync
		) AS source
		ON target.id_rwy_kerja = source.id_rwy_kerja
		WHEN MATCHED THEN
			UPDATE SET
				id_sdm = source.id_sdm,
				id_dudi = source.id_dudi,
				id_pekerjaan = source.id_pekerjaan,
				id_kbli = source.id_kbli,
				nm_jabatan = source.nm_jabatan,
				deskripsi_kerja = source.deskripsi_kerja,
				instansi = source.instansi,
				divisi = source.divisi,
				mulai_bekerja = source.mulai_bekerja,
				selesai_bekerja = source.selesai_bekerja,
				a_ln = source.a_ln,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_rwy_kerja, id_sdm, id_dudi, id_pekerjaan, id_kbli,
				nm_jabatan, deskripsi_kerja, instansi, divisi,
				mulai_bekerja, selesai_bekerja, a_ln,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_rwy_kerja, source.id_sdm, source.id_dudi, source.id_pekerjaan, source.id_kbli,
				source.nm_jabatan, source.deskripsi_kerja, source.instansi, source.divisi,
				source.mulai_bekerja, source.selesai_bekerja, source.a_ln,
				GETDATE(), source.id_sdm, GETDATE(), source.id_sdm, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		rwyKerja.IDRwyKerja,       // @p1
		rwyKerja.IDSDM,            // @p2
		rwyKerja.IDDudi,           // @p3
		rwyKerja.IDPekerjaan,      // @p4
		rwyKerja.IDKBLI,           // @p5
		nmJabatan,                 // @p6
		deskripsiKerja,            // @p7
		instansi,                  // @p8
		divisi,                    // @p9
		rwyKerja.MulaiBekerja,     // @p10
		rwyKerja.SelesaiBekerja,   // @p11
		rwyKerja.ALuarNegeri,      // @p12
		time.Now(),                // @p13
	)

	if err != nil {
		log.Printf("❌ Error merging rwy_pekerjaan: %v", err)
		return fmt.Errorf("failed to merge rwy_pekerjaan: %w", err)
	}

	return nil
}

// MergeDokumen performs MERGE (upsert) operation for dokumen
func (r *repository) MergeDokumen(dokumen *Dokumen) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Check if dokumen exists
	var exists bool
	checkQuery := `SELECT COUNT(*) FROM dok.dokumen WHERE id_dok = @p1`
	err := r.db.GetContext(ctx, &exists, checkQuery, dokumen.IDDok)
	if err != nil {
		return fmt.Errorf("failed to check dokumen existence: %w", err)
	}

	// Truncate string fields
	nmDok := truncateString(dokumen.NmDok, 60)
	ketDok := truncateString(dokumen.KetDok, 200)
	url := truncateString(dokumen.URL, 256)
	mediaType := truncateString(dokumen.MediaType, 250)
	fileName := truncateString(dokumen.FileName, 500)

	if exists {
		// UPDATE (without file_dok binary)
		updateSQL := `
			UPDATE dok.dokumen SET
				id_jns_dok = @p1,
				nm_dok = @p2,
				ket_dok = @p3,
				wkt_unggah = @p4,
				url = @p5,
				media_type = @p6,
				file_name = @p7,
				last_update = @p8,
				id_updater = @p9,
				last_sync = @p10,
				soft_delete = 0
			WHERE id_dok = @p11
		`
		_, err = r.db.ExecContext(ctx, updateSQL,
			dokumen.IDJnsDok,
			nmDok,
			ketDok,
			dokumen.WktUnggah,
			url,
			mediaType,
			fileName,
			time.Now(),
			dokumen.IDCreator,
			time.Now(),
			dokumen.IDDok,
		)
	} else {
		// INSERT (without file_dok binary)
		insertSQL := `
			INSERT INTO dok.dokumen (
				id_dok, id_jns_dok, nm_dok, ket_dok, wkt_unggah, url, media_type, file_name,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14)
		`
		_, err = r.db.ExecContext(ctx, insertSQL,
			dokumen.IDDok,
			dokumen.IDJnsDok,
			nmDok,
			ketDok,
			dokumen.WktUnggah,
			url,
			mediaType,
			fileName,
			time.Now(),
			dokumen.IDCreator,
			time.Now(),
			dokumen.IDCreator,
			0,
			time.Now(),
		)
	}

	if err != nil {
		log.Printf("❌ Error upserting dokumen: %v", err)
		return fmt.Errorf("failed to upsert dokumen: %w", err)
	}

	return nil
}

// MergeDokRwyPekerjaan merges dok_rwy_pekerjaan junction record
func (r *repository) MergeDokRwyPekerjaan(idRwyKerja, idDok string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mergeSQL := `
		MERGE INTO dok.dok_rwy_pekerjaan AS target
		USING (SELECT @p1 AS id_rwy_kerja, @p2 AS id_dok) AS source
		ON target.id_rwy_kerja = source.id_rwy_kerja AND target.id_dok = source.id_dok
		WHEN MATCHED THEN
			UPDATE SET
				last_update = @p3,
				last_sync = @p4,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (id_rwy_kerja, id_dok, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
			VALUES (@p1, @p2, @p5, @p6, @p3, @p6, 0, @p4);
	`

	// Use a system UUID for creator/updater (can be replaced with actual user ID if available)
	systemUUID := "00000000-0000-0000-0000-000000000000"

	_, err := r.db.ExecContext(ctx, mergeSQL,
		idRwyKerja,    // @p1
		idDok,         // @p2
		time.Now(),    // @p3 last_update
		time.Now(),    // @p4 last_sync
		time.Now(),    // @p5 create_date
		systemUUID,    // @p6 id_creator/id_updater
	)

	if err != nil {
		return fmt.Errorf("failed to merge dok_rwy_pekerjaan: %w", err)
	}

	return nil
}

// GetDokumenByRwyKerja retrieves all dokumen for a riwayat pekerjaan
func (r *repository) GetDokumenByRwyKerja(idRwyKerja string) ([]*Dokumen, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			d.id_dok, d.id_jns_dok, d.nm_dok, d.ket_dok, d.wkt_unggah, d.url, d.media_type, d.file_name,
			d.create_date, d.id_creator, d.last_update, d.id_updater, d.soft_delete, d.last_sync
		FROM dok.dokumen d
		INNER JOIN dok.dok_rwy_pekerjaan drp
			ON d.id_dok = drp.id_dok
		WHERE drp.id_rwy_kerja = @p1
			AND d.soft_delete = 0
			AND drp.soft_delete = 0
		ORDER BY d.wkt_unggah DESC
	`

	var dokumenList []*Dokumen
	err := r.db.SelectContext(ctx, &dokumenList, query, idRwyKerja)
	if err != nil {
		return nil, fmt.Errorf("failed to get dokumen by rwy_kerja: %w", err)
	}

	return dokumenList, nil
}

// SoftDeleteDokumenNotInList soft-deletes dokumen not in the active list
func (r *repository) SoftDeleteDokumenNotInList(idRwyKerja string, activeDokIDs []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if len(activeDokIDs) == 0 {
		// If no active dokumen, soft-delete all
		query := `
			UPDATE drp
			SET drp.soft_delete = 1, drp.last_update = GETDATE()
			FROM dok.dok_rwy_pekerjaan drp
			WHERE drp.id_rwy_kerja = @p1 AND drp.soft_delete = 0
		`
		_, err := r.db.ExecContext(ctx, query, idRwyKerja)
		return err
	}

	// Build NOT IN clause
	placeholders := make([]string, len(activeDokIDs))
	args := []interface{}{idRwyKerja}
	for i, id := range activeDokIDs {
		placeholders[i] = fmt.Sprintf("@p%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE drp
		SET drp.soft_delete = 1, drp.last_update = GETDATE()
		FROM dok.dok_rwy_pekerjaan drp
		WHERE drp.id_rwy_kerja = @p1
			AND drp.id_dok NOT IN (%s)
			AND drp.soft_delete = 0
	`, strings.Join(placeholders, ", "))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to soft-delete inactive dokumen: %w", err)
	}

	return nil
}

// GetRwyPekerjaanByID retrieves a single rwy_pekerjaan by ID with related data
func (r *repository) GetRwyPekerjaanByID(idRwyKerja string) (*RwyPekerjaanWithDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			rp.id_rwy_kerja, rp.id_sdm, rp.id_dudi, rp.id_pekerjaan, rp.id_kbli,
			rp.nm_jabatan, rp.deskripsi_kerja, rp.instansi, rp.divisi,
			rp.mulai_bekerja, rp.selesai_bekerja, rp.a_ln,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			p.nm_pekerjaan AS jenis_pekerjaan_name,
			NULL AS bidang_usaha_name
		FROM pdrd.rwy_pekerjaan rp
		LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm
		LEFT JOIN ref.pekerjaan p ON rp.id_pekerjaan = p.id_pekerjaan
		WHERE rp.id_rwy_kerja = @p1 AND rp.soft_delete = 0
	`

	var result RwyPekerjaanWithDetail
	err := r.db.GetContext(ctx, &result, query, idRwyKerja)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rwy_pekerjaan not found")
		}
		return nil, fmt.Errorf("failed to get rwy_pekerjaan: %w", err)
	}

	return &result, nil
}

// GetRwyPekerjaanList retrieves paginated list of rwy_pekerjaan
func (r *repository) GetRwyPekerjaanList(page, limit int, search, sortBy, sortOrder string) (*RiwayatPekerjaanListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	offset := (page - 1) * limit

	// Build WHERE clause
	whereClause := "WHERE rp.soft_delete = 0"
	args := []interface{}{}
	if search != "" {
		whereClause += ` AND (
			s.nm_sdm LIKE @p1 OR
			s.nidn LIKE @p1 OR
			rp.nm_jabatan LIKE @p1 OR
			rp.instansi LIKE @p1 OR
			rp.divisi LIKE @p1 OR
			p.nm_pekerjaan LIKE @p1
		)`
		args = append(args, "%"+search+"%")
	}

	// Build ORDER BY clause with validation
	orderByClause := "ORDER BY rp.last_sync DESC, rp.mulai_bekerja DESC"
	if sortBy != "" {
		// Map sortable columns
		validSortColumns := map[string]string{
			"last_sync":            "rp.last_sync",
			"nama_dosen":           "s.nm_sdm",
			"nm_jabatan":           "rp.nm_jabatan",
			"instansi":             "rp.instansi",
			"mulai_bekerja":        "rp.mulai_bekerja",
			"jenis_pekerjaan_name": "p.nm_pekerjaan",
		}

		if sortColumn, ok := validSortColumns[sortBy]; ok {
			order := "DESC"
			if sortOrder == "asc" {
				order = "ASC"
			}
			orderByClause = fmt.Sprintf("ORDER BY %s %s", sortColumn, order)
		}
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.rwy_pekerjaan rp
		LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm
		LEFT JOIN ref.pekerjaan p ON rp.id_pekerjaan = p.id_pekerjaan
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count rwy_pekerjaan: %w", err)
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			rp.id_rwy_kerja, rp.id_sdm, rp.id_dudi, rp.id_pekerjaan, rp.id_kbli,
			rp.nm_jabatan, rp.deskripsi_kerja, rp.instansi, rp.divisi,
			rp.mulai_bekerja, rp.selesai_bekerja, rp.a_ln,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			p.nm_pekerjaan AS jenis_pekerjaan_name,
			NULL AS bidang_usaha_name
		FROM pdrd.rwy_pekerjaan rp
		LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm
		LEFT JOIN ref.pekerjaan p ON rp.id_pekerjaan = p.id_pekerjaan
		%s
		%s
		OFFSET %d ROWS FETCH NEXT %d ROWS ONLY
	`, whereClause, orderByClause, offset, limit)

	var data []*RwyPekerjaanWithDetail
	err = r.db.SelectContext(ctx, &data, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_pekerjaan list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &RiwayatPekerjaanListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRwyPekerjaanStats retrieves statistics
func (r *repository) GetRwyPekerjaanStats() (*RiwayatPekerjaanStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(DISTINCT rp.id_rwy_kerja) AS total_riwayat,
			SUM(CASE WHEN rp.a_ln = 0 THEN 1 ELSE 0 END) AS total_dalam_negeri,
			SUM(CASE WHEN rp.a_ln = 1 THEN 1 ELSE 0 END) AS total_luar_negeri,
			MAX(rp.last_sync) AS last_sync_date
		FROM pdrd.rwy_pekerjaan rp
		WHERE rp.soft_delete = 0
	`

	var stats RiwayatPekerjaanStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get rwy_pekerjaan stats: %w", err)
	}

	return &stats, nil
}

// GetAllIDSDMWithRwyPekerjaan retrieves all unique id_sdm that have rwy_pekerjaan records
func (r *repository) GetAllIDSDMWithRwyPekerjaan() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT id_sdm
		FROM pdrd.rwy_pekerjaan
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

// GetJenisDokumenMap retrieves mapping of jenis dokumen name to id_jns_dok
func (r *repository) GetJenisDokumenMap() (map[string]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT id_jns_dok, nm_jns_dok
		FROM ref.jenis_dokumen WITH (NOLOCK)
		ORDER BY id_jns_dok
	`

	type JenisDok struct {
		IDJnsDok  int    `db:"id_jns_dok"`
		NmJnsDok  string `db:"nm_jns_dok"`
	}

	var jenisDokList []JenisDok
	err := r.db.SelectContext(ctx, &jenisDokList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get jenis dokumen map: %w", err)
	}

	// Build map: lowercase name -> id
	jenisDokMap := make(map[string]int)
	for _, jd := range jenisDokList {
		jenisDokMap[strings.ToLower(jd.NmJnsDok)] = jd.IDJnsDok
	}

	return jenisDokMap, nil
}
