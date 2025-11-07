package tugas_tambahan

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

type Repository interface {
	// Tugas Tambahan operations
	MergeTugasTambahan(tugasTambahan *TugasTambahan) error
	GetTugasTambahanByID(idTgsTambah string) (*TugasTambahanWithDetail, error)
	GetTugasTambahanList(page, limit int, search, sortBy, sortOrder string) (*TugasTambahanListResult, error)
	GetTugasTambahanStats() (*TugasTambahanStats, error)

	// Dokumen operations
	MergeDokumen(dokumen *Dokumen) error
	GetDokumenByTugasTambahan(idTgsTambah string) ([]*Dokumen, error)
	MergeDokTugTam(idTgsTambah, idDok string) error
	SoftDeleteDokumenNotInList(idTgsTambah string, activeDokIDs []string) error

	// Helper operations
	GetAllIDSDMWithTugasTambahan() ([]string, error)
	GetAllActiveDosenIDSDM() ([]string, error)
	GetJenisDokumenMap() (map[string]int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// MergeTugasTambahan performs MERGE (upsert) operation for tugas_tambahan
func (r *repository) MergeTugasTambahan(tugasTambahan *TugasTambahan) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	skTugasTambah := truncateString(tugasTambahan.SKTugasTambah, 80)

	query := `
		MERGE INTO pdrd.tugas_tambahan WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_tgs_tambah,
				CAST(@p2 AS uniqueidentifier) AS id_sdm,
				CAST(@p3 AS numeric(5,0)) AS id_jab_tgs,
				CAST(@p4 AS int) AS id_katgiat,
				CAST(@p5 AS uniqueidentifier) AS id_sms,
				CAST(@p6 AS uniqueidentifier) AS id_sp,
				CAST(@p7 AS numeric(4,0)) AS jml_jam,
				CAST(@p8 AS varchar(80)) AS sk_tugas_tambah,
				CAST(@p9 AS date) AS tmt_sk_tambah,
				CAST(@p10 AS date) AS tst_sk_tambah,
				CAST(@p11 AS datetime) AS last_sync
		) AS source
		ON target.id_tgs_tambah = source.id_tgs_tambah
		WHEN MATCHED THEN
			UPDATE SET
				id_sdm = source.id_sdm,
				id_jab_tgs = source.id_jab_tgs,
				id_katgiat = source.id_katgiat,
				id_sms = source.id_sms,
				id_sp = source.id_sp,
				jml_jam = source.jml_jam,
				sk_tugas_tambah = source.sk_tugas_tambah,
				tmt_sk_tambah = source.tmt_sk_tambah,
				tst_sk_tambah = source.tst_sk_tambah,
				last_update = GETDATE(),
				id_updater = source.id_sdm,
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_tgs_tambah, id_sdm, id_jab_tgs, id_katgiat, id_sms, id_sp,
				jml_jam, sk_tugas_tambah, tmt_sk_tambah, tst_sk_tambah,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_tgs_tambah, source.id_sdm, source.id_jab_tgs, source.id_katgiat, source.id_sms, source.id_sp,
				source.jml_jam, source.sk_tugas_tambah, source.tmt_sk_tambah, source.tst_sk_tambah,
				GETDATE(), source.id_sdm, GETDATE(), source.id_sdm, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		tugasTambahan.IDTgsTambah,  // @p1
		tugasTambahan.IDSDM,         // @p2
		tugasTambahan.IDJabTgs,      // @p3
		tugasTambahan.IDKatGiat,     // @p4
		tugasTambahan.IDSMS,         // @p5
		tugasTambahan.IDSP,          // @p6
		tugasTambahan.JmlJam,        // @p7
		skTugasTambah,               // @p8
		tugasTambahan.TmtSKTambah,   // @p9
		tugasTambahan.TstSKTambah,   // @p10
		time.Now(),                  // @p11
	)

	if err != nil {
		log.Printf("❌ Error merging tugas_tambahan: %v", err)
		return fmt.Errorf("failed to merge tugas_tambahan: %w", err)
	}

	return nil
}

// MergeDokumen performs MERGE (upsert) operation for dokumen
func (r *repository) MergeDokumen(dokumen *Dokumen) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Truncate string fields to match database column sizes
	nmDok := truncateString(dokumen.NmDok, 60)
	ketDok := truncateString(dokumen.KetDok, 200)
	url := truncateString(dokumen.URL, 256)
	mediaType := truncateString(dokumen.MediaType, 250)
	fileName := truncateString(dokumen.FileName, 500)

	query := `
		MERGE INTO dok.dokumen WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_dok,
				CAST(@p2 AS int) AS id_jns_dok,
				CAST(@p3 AS varchar(60)) AS nm_dok,
				CAST(@p4 AS varchar(200)) AS ket_dok,
				CAST(@p5 AS datetime) AS wkt_unggah,
				CAST(@p6 AS varchar(256)) AS url,
				CAST(@p7 AS varchar(250)) AS media_type,
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

// MergeDokTugTam performs MERGE (upsert) operation for dok_tugtam junction table
func (r *repository) MergeDokTugTam(idTgsTambah, idDok string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		MERGE INTO dok.dok_tugtam WITH (HOLDLOCK) AS target
		USING (
			SELECT
				CAST(@p1 AS uniqueidentifier) AS id_tgs_tambah,
				CAST(@p2 AS uniqueidentifier) AS id_dok,
				CAST(@p3 AS datetime) AS last_sync
		) AS source
		ON target.id_tgs_tambah = source.id_tgs_tambah AND target.id_dok = source.id_dok
		WHEN MATCHED THEN
			UPDATE SET
				last_update = GETDATE(),
				last_sync = source.last_sync,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_tgs_tambah, id_dok, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				source.id_tgs_tambah, source.id_dok, GETDATE(), source.id_tgs_tambah, GETDATE(), source.id_tgs_tambah, 0, source.last_sync
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		idTgsTambah, // @p1
		idDok,       // @p2
		time.Now(),  // @p3
	)

	if err != nil {
		log.Printf("❌ Error merging dok_tugtam: %v", err)
		return fmt.Errorf("failed to merge dok_tugtam: %w", err)
	}

	return nil
}

// GetTugasTambahanByID retrieves tugas tambahan by ID with related display fields
func (r *repository) GetTugasTambahanByID(idTgsTambah string) (*TugasTambahanWithDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			tt.id_tgs_tambah,
			tt.id_sdm,
			tt.id_jab_tgs,
			tt.id_katgiat,
			tt.id_sms,
			tt.id_sp,
			tt.jml_jam,
			tt.sk_tugas_tambah,
			tt.tmt_sk_tambah,
			tt.tst_sk_tambah,
			tt.create_date,
			tt.id_creator,
			tt.last_update,
			tt.id_updater,
			tt.soft_delete,
			tt.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			jt.nm_jab_tgs AS jenis_tugas_name,
			sms.nm_lemb AS unit_kerja_name,
			sp.nm_lemb AS perguruan_tinggi_name,
			kk.nm_katgiat AS kategori_kegiatan_name
		FROM pdrd.tugas_tambahan tt
		LEFT JOIN pdrd.sdm s ON tt.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON tt.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN pdrd.sms sms ON tt.id_sms = sms.id_sms
		LEFT JOIN pdrd.satuan_pendidikan sp ON tt.id_sp = sp.id_sp
		LEFT JOIN ref.kategori_kegiatan kk ON tt.id_katgiat = kk.id_katgiat
		WHERE tt.id_tgs_tambah = @p1 AND tt.soft_delete = 0
	`

	var result TugasTambahanWithDetail
	err := r.db.GetContext(ctx, &result, query, idTgsTambah)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("tugas tambahan not found")
		}
		log.Printf("❌ Error getting tugas tambahan by ID: %v", err)
		return nil, fmt.Errorf("failed to get tugas tambahan: %w", err)
	}

	return &result, nil
}

// GetTugasTambahanList retrieves paginated list of tugas tambahan with search and sort
func (r *repository) GetTugasTambahanList(page, limit int, search, sortBy, sortOrder string) (*TugasTambahanListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Default sorting
	if sortBy == "" {
		sortBy = "tt.last_sync"
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
	whereClause := "WHERE tt.soft_delete = 0"
	var args []interface{}
	argIndex := 1

	if search != "" {
		whereClause += fmt.Sprintf(` AND (
			s.nm_sdm LIKE @p%d OR
			s.nidn LIKE @p%d OR
			jt.nm_jab_tgs LIKE @p%d OR
			sms.nm_lemb LIKE @p%d OR
			sp.nm_lemb LIKE @p%d
		)`, argIndex, argIndex, argIndex, argIndex, argIndex)
		args = append(args, "%"+search+"%")
		argIndex++
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.tugas_tambahan tt
		LEFT JOIN pdrd.sdm s ON tt.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON tt.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN pdrd.sms sms ON tt.id_sms = sms.id_sms
		LEFT JOIN pdrd.satuan_pendidikan sp ON tt.id_sp = sp.id_sp
		%s
	`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		log.Printf("❌ Error counting tugas tambahan: %v", err)
		return nil, fmt.Errorf("failed to count tugas tambahan: %w", err)
	}

	// Calculate pagination
	offset := (page - 1) * limit
	totalPages := (total + limit - 1) / limit

	// Get data
	dataQuery := fmt.Sprintf(`
		SELECT
			tt.id_tgs_tambah,
			tt.id_sdm,
			tt.id_jab_tgs,
			tt.id_katgiat,
			tt.id_sms,
			tt.id_sp,
			tt.jml_jam,
			tt.sk_tugas_tambah,
			tt.tmt_sk_tambah,
			tt.tst_sk_tambah,
			tt.create_date,
			tt.id_creator,
			tt.last_update,
			tt.id_updater,
			tt.soft_delete,
			tt.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nidn,
			jt.nm_jab_tgs AS jenis_tugas_name,
			sms.nm_lemb AS unit_kerja_name,
			sp.nm_lemb AS perguruan_tinggi_name,
			kk.nm_katgiat AS kategori_kegiatan_name
		FROM pdrd.tugas_tambahan tt
		LEFT JOIN pdrd.sdm s ON tt.id_sdm = s.id_sdm
		LEFT JOIN ref.jab_tgs jt ON tt.id_jab_tgs = jt.id_jab_tgs
		LEFT JOIN pdrd.sms sms ON tt.id_sms = sms.id_sms
		LEFT JOIN pdrd.satuan_pendidikan sp ON tt.id_sp = sp.id_sp
		LEFT JOIN ref.kategori_kegiatan kk ON tt.id_katgiat = kk.id_katgiat
		%s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	args = append(args, offset, limit)

	var data []*TugasTambahanWithDetail
	err = r.db.SelectContext(ctx, &data, dataQuery, args...)
	if err != nil {
		log.Printf("❌ Error getting tugas tambahan list: %v", err)
		return nil, fmt.Errorf("failed to get tugas tambahan list: %w", err)
	}

	return &TugasTambahanListResult{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetTugasTambahanStats retrieves statistics for tugas tambahan
func (r *repository) GetTugasTambahanStats() (*TugasTambahanStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(*) AS total_tugas,
			SUM(CASE WHEN tst_sk_tambah IS NULL OR tst_sk_tambah > GETDATE() THEN 1 ELSE 0 END) AS total_aktif,
			SUM(CASE WHEN tst_sk_tambah IS NOT NULL AND tst_sk_tambah <= GETDATE() THEN 1 ELSE 0 END) AS total_selesai,
			MAX(last_sync) AS last_sync_date
		FROM pdrd.tugas_tambahan
		WHERE soft_delete = 0
	`

	var stats TugasTambahanStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		log.Printf("❌ Error getting tugas tambahan stats: %v", err)
		return nil, fmt.Errorf("failed to get tugas tambahan stats: %w", err)
	}

	return &stats, nil
}

// GetDokumenByTugasTambahan retrieves all dokumen for a tugas tambahan
func (r *repository) GetDokumenByTugasTambahan(idTgsTambah string) ([]*Dokumen, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT
			d.id_dok,
			d.id_jns_dok,
			d.nm_dok,
			d.ket_dok,
			d.wkt_unggah,
			d.url,
			d.media_type,
			d.file_name,
			d.create_date,
			d.id_creator,
			d.last_update,
			d.id_updater,
			d.soft_delete,
			d.last_sync
		FROM dok.dokumen d
		INNER JOIN dok.dok_tugtam dt ON d.id_dok = dt.id_dok
		WHERE dt.id_tgs_tambah = @p1 AND dt.soft_delete = 0 AND d.soft_delete = 0
	`

	var dokumen []*Dokumen
	err := r.db.SelectContext(ctx, &dokumen, query, idTgsTambah)
	if err != nil {
		log.Printf("❌ Error getting dokumen by tugas tambahan: %v", err)
		return nil, fmt.Errorf("failed to get dokumen: %w", err)
	}

	return dokumen, nil
}

// SoftDeleteDokumenNotInList soft deletes dokumen that are not in the active list
func (r *repository) SoftDeleteDokumenNotInList(idTgsTambah string, activeDokIDs []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if len(activeDokIDs) == 0 {
		// If no active dokumen, soft delete all
		query := `
			UPDATE dok.dok_tugtam
			SET soft_delete = 1, last_update = GETDATE()
			WHERE id_tgs_tambah = @p1 AND soft_delete = 0
		`
		_, err := r.db.ExecContext(ctx, query, idTgsTambah)
		return err
	}

	// Build placeholders for IN clause
	placeholders := make([]string, len(activeDokIDs))
	args := []interface{}{idTgsTambah}
	for i, id := range activeDokIDs {
		placeholders[i] = fmt.Sprintf("@p%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE dok.dok_tugtam
		SET soft_delete = 1, last_update = GETDATE()
		WHERE id_tgs_tambah = @p1 AND id_dok NOT IN (%s) AND soft_delete = 0
	`, strings.Join(placeholders, ","))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		log.Printf("❌ Error soft deleting dokumen: %v", err)
		return fmt.Errorf("failed to soft delete dokumen: %w", err)
	}

	return nil
}

// GetAllIDSDMWithTugasTambahan retrieves all id_sdm that have tugas tambahan records
func (r *repository) GetAllIDSDMWithTugasTambahan() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT id_sdm
		FROM pdrd.tugas_tambahan
		WHERE soft_delete = 0
	`

	var idSDMs []string
	err := r.db.SelectContext(ctx, &idSDMs, query)
	if err != nil {
		log.Printf("❌ Error getting all id_sdm with tugas tambahan: %v", err)
		return nil, fmt.Errorf("failed to get id_sdm list: %w", err)
	}

	return idSDMs, nil
}

// GetAllActiveDosenIDSDM retrieves all active dosen id_sdm
func (r *repository) GetAllActiveDosenIDSDM() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT id_sdm
		FROM pdrd.sdm
		WHERE a_aktif_sdm = 1 AND soft_delete = 0
	`

	var idSDMs []string
	err := r.db.SelectContext(ctx, &idSDMs, query)
	if err != nil {
		log.Printf("❌ Error getting active dosen: %v", err)
		return nil, fmt.Errorf("failed to get active dosen: %w", err)
	}

	return idSDMs, nil
}

// GetJenisDokumenMap retrieves mapping of jenis_dokumen name to ID
func (r *repository) GetJenisDokumenMap() (map[string]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT id_jns_dok, nm_jns_dok
		FROM ref.jenis_dokumen
		WHERE soft_delete = 0
	`

	type JenisDokumen struct {
		IDJnsDok int    `db:"id_jns_dok"`
		NmJnsDok string `db:"nm_jns_dok"`
	}

	var jenisDokList []JenisDokumen
	err := r.db.SelectContext(ctx, &jenisDokList, query)
	if err != nil {
		log.Printf("❌ Error getting jenis dokumen map: %v", err)
		return nil, fmt.Errorf("failed to get jenis dokumen map: %w", err)
	}

	// Build map
	result := make(map[string]int)
	for _, jd := range jenisDokList {
		result[jd.NmJnsDok] = jd.IDJnsDok
	}

	return result, nil
}