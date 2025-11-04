package publikasi

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"regexp"
	"time"

	"github.com/jmoiron/sqlx"
)

// UUID validation regex
var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// isValidUUID checks if a string is a valid UUID
func isValidUUID(uuid string) bool {
	return uuidRegex.MatchString(uuid)
}

type Repository interface {
	// Publikasi operations
	UpsertPublikasi(pub *Publikasi) error
	GetPublikasiByID(idPublikasi string) (*Publikasi, error)
	GetPublikasiList(page, limit int, search string) (*PublikasiListResult, error)
	GetPublikasiStats() (*PublikasiStats, error)

	// TulisPub operations
	GetTulisPubByPublikasi(idPublikasi string) ([]*TulisPub, error)
	MergeTulisPub(idPublikasi string, tulisPubList []*TulisPub) error

	// Helper operations
	GetAllIDSDMWithPublikasi() ([]string, error)
	CheckPesertaDidikExists(idPD string) (bool, error)
	CheckOrangExists(idOrang string) (bool, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// UpsertPublikasi upserts a publikasi record
func (r *repository) UpsertPublikasi(pub *Publikasi) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		MERGE INTO pdrd.publikasi AS target
		USING (SELECT @p1 AS id_publikasi) AS source
		ON target.id_publikasi = source.id_publikasi
		WHEN MATCHED THEN
			UPDATE SET
				id_jns_pub = @p2,
				judul = @p3,
				judul_chapter = @p4,
				judul_asli = @p5,
				nama_jurnal = @p6,
				tgl_terbit = @p7,
				edisi = @p8,
				vol = @p9,
				no = @p10,
				hal = @p11,
				jml_hal = @p12,
				penerbit = @p13,
				a_seminar = @p14,
				a_prosiding = @p15,
				no_paten = @p16,
				pemberi_paten = @p17,
				doi = @p18,
				isbn = @p19,
				issn = @p20,
				e_issn = @p21,
				url = @p22,
				ket = @p23,
				stat_impor_sinta = @p24,
				quartile = @p25,
				id_kat_capaian = @p26,
				id_litabmas = @p27,
				last_update = @p28,
				id_updater = @p29,
				last_sync = @p30,
				soft_delete = 0
		WHEN NOT MATCHED THEN
			INSERT (
				id_publikasi, id_jns_pub, judul, judul_chapter, judul_asli, nama_jurnal,
				tgl_terbit, edisi, vol, no, hal, jml_hal, penerbit,
				a_seminar, a_prosiding, no_paten, pemberi_paten,
				doi, isbn, issn, e_issn, url, ket,
				stat_impor_sinta, quartile, id_kat_capaian, id_litabmas,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6,
				@p7, @p8, @p9, @p10, @p11, @p12, @p13,
				@p14, @p15, @p16, @p17,
				@p18, @p19, @p20, @p21, @p22, @p23,
				@p24, @p25, @p26, @p27,
				@p31, @p32, @p28, @p29, 0, @p30
			);
	`

	_, err := r.db.ExecContext(ctx, query,
		pub.IDPublikasi,    // @p1
		pub.IDJnsPub,       // @p2
		pub.Judul,          // @p3
		pub.JudulChapter,   // @p4
		pub.JudulAsli,      // @p5
		pub.NamaJurnal,     // @p6
		pub.TglTerbit,      // @p7
		pub.Edisi,          // @p8
		pub.Vol,            // @p9
		pub.No,             // @p10
		pub.Hal,            // @p11
		pub.JmlHal,         // @p12
		pub.Penerbit,       // @p13
		pub.ASeminar,       // @p14
		pub.AProsiding,     // @p15
		pub.NoPaten,        // @p16
		pub.PemberiPaten,   // @p17
		pub.DOI,            // @p18
		pub.ISBN,           // @p19
		pub.ISSN,           // @p20
		pub.EISSN,          // @p21
		pub.URL,            // @p22
		pub.Ket,            // @p23
		pub.StatImporSinta, // @p24
		pub.Quartile,       // @p25
		pub.IDKatCapaian,   // @p26
		pub.IDLitabmas,     // @p27
		pub.LastUpdate,     // @p28
		pub.IDUpdater,      // @p29
		pub.LastSync,       // @p30
		pub.CreateDate,     // @p31
		pub.IDCreator,      // @p32
	)

	if err != nil {
		return fmt.Errorf("failed to upsert publikasi: %w", err)
	}

	return nil
}

// GetPublikasiByID retrieves a single publikasi by ID
func (r *repository) GetPublikasiByID(idPublikasi string) (*Publikasi, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			CONVERT(VARCHAR(36), id_publikasi) as id_publikasi,
			id_jns_pub, judul, judul_chapter, judul_asli, nama_jurnal,
			tgl_terbit, edisi, vol, no, hal, jml_hal, penerbit,
			a_seminar, a_prosiding, no_paten, pemberi_paten,
			doi, isbn, issn, e_issn, url, ket,
			stat_impor_sinta, quartile, id_kat_capaian,
			CONVERT(VARCHAR(36), id_litabmas) as id_litabmas,
			create_date, CONVERT(VARCHAR(36), id_creator) as id_creator,
			last_update, CONVERT(VARCHAR(36), id_updater) as id_updater,
			soft_delete, last_sync
		FROM pdrd.publikasi
		WHERE id_publikasi = @p1 AND soft_delete = 0
	`

	var pub Publikasi
	err := r.db.GetContext(ctx, &pub, query, idPublikasi)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("publikasi not found")
		}
		return nil, fmt.Errorf("failed to get publikasi: %w", err)
	}

	return &pub, nil
}

// GetTulisPubByPublikasi retrieves all penulis for a publikasi
func (r *repository) GetTulisPubByPublikasi(idPublikasi string) ([]*TulisPub, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			CONVERT(VARCHAR(36), id_tulis_pub) as id_tulis_pub,
			CONVERT(VARCHAR(36), id_publikasi) as id_publikasi,
			CONVERT(VARCHAR(36), id_sdm) as id_sdm,
			id_katgiat,
			CONVERT(VARCHAR(36), id_pd) as id_pd,
			CONVERT(VARCHAR(36), id_orang) as id_orang,
			urutan, afiliasi, peran_tulis, jns_penulis, a_corr_author,
			nm_pd, nipd,
			CONVERT(VARCHAR(36), id_afiliasi) as id_afiliasi,
			jns_afiliasi,
			create_date, CONVERT(VARCHAR(36), id_creator) as id_creator,
			last_update, CONVERT(VARCHAR(36), id_updater) as id_updater,
			soft_delete, last_sync
		FROM pdrd.tulis_pub
		WHERE id_publikasi = @p1 AND soft_delete = 0
		ORDER BY urutan
	`

	var result []*TulisPub
	err := r.db.SelectContext(ctx, &result, query, idPublikasi)
	if err != nil {
		return nil, fmt.Errorf("failed to get tulis_pub: %w", err)
	}

	// Filter out records with invalid UUIDs
	validResult := make([]*TulisPub, 0, len(result))
	for _, tp := range result {
		if isValidUUID(tp.IDTulisPub) && isValidUUID(tp.IDPublikasi) {
			validResult = append(validResult, tp)
		} else {
			log.Printf("⚠️ Skipping tulis_pub with invalid UUID - id_tulis_pub: %s, id_publikasi: %s", tp.IDTulisPub, tp.IDPublikasi)
		}
	}

	return validResult, nil
}

// MergeTulisPub performs MERGE operation for tulis_pub (penulis)
func (r *repository) MergeTulisPub(idPublikasi string, tulisPubList []*TulisPub) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get existing tulis_pub
	existing, err := r.GetTulisPubByPublikasi(idPublikasi)
	if err != nil {
		return fmt.Errorf("failed to get existing tulis_pub: %w", err)
	}

	// Create maps for comparison
	existingMap := make(map[string]*TulisPub)
	for _, tp := range existing {
		existingMap[tp.IDTulisPub] = tp
	}

	newMap := make(map[string]*TulisPub)
	for _, tp := range tulisPubList {
		newMap[tp.IDTulisPub] = tp
	}

	// Delete removed penulis (soft delete)
	for key, tp := range existingMap {
		if _, exists := newMap[key]; !exists {
			// Validate UUID before delete operation
			if !isValidUUID(tp.IDTulisPub) {
				log.Printf("⚠️ Skipping delete - invalid id_tulis_pub UUID: %s", tp.IDTulisPub)
				continue
			}

			deleteSQL := `
				UPDATE pdrd.tulis_pub
				SET soft_delete = 1, last_update = @p1
				WHERE id_tulis_pub = @p2
			`
			_, err := r.db.ExecContext(ctx, deleteSQL, time.Now(), tp.IDTulisPub)
			if err != nil {
				log.Printf("⚠️ Failed to delete tulis_pub %s: %v", tp.IDTulisPub, err)
			} else {
				log.Printf("🗑️ Deleted tulis_pub: %s", tp.IDTulisPub)
			}
		}
	}

	// Insert new or update existing using MERGE
	for _, tp := range newMap {
		// FK Validation: Skip if id_pd doesn't exist in pdrd.peserta_didik
		if tp.IDPD != nil && *tp.IDPD != "" {
			pdExists, err := r.CheckPesertaDidikExists(*tp.IDPD)
			if err != nil {
				log.Printf("⚠️ Failed to check id_pd existence for %s: %v", *tp.IDPD, err)
				continue
			}
			if !pdExists {
				log.Printf("⚠️ Skipping tulis_pub %s: id_pd %s does not exist in pdrd.peserta_didik", tp.IDTulisPub, *tp.IDPD)
				continue
			}
		}

		// FK Validation: Skip if id_orang doesn't exist in pdrd.non_ca
		if tp.IDOrang != nil && *tp.IDOrang != "" {
			orangExists, err := r.CheckOrangExists(*tp.IDOrang)
			if err != nil {
				log.Printf("⚠️ Failed to check id_orang existence for %s: %v", *tp.IDOrang, err)
				continue
			}
			if !orangExists {
				log.Printf("⚠️ Skipping tulis_pub %s: id_orang %s does not exist in pdrd.non_ca", tp.IDTulisPub, *tp.IDOrang)
				continue
			}
		}

		mergeSQL := `
			MERGE INTO pdrd.tulis_pub AS target
			USING (SELECT @p1 AS id_tulis_pub) AS source
			ON target.id_tulis_pub = source.id_tulis_pub
			WHEN MATCHED THEN
				UPDATE SET
					id_publikasi = @p2,
					id_sdm = @p3,
					id_katgiat = @p4,
					id_pd = @p5,
					id_orang = @p6,
					urutan = @p7,
					afiliasi = @p8,
					peran_tulis = @p9,
					jns_penulis = @p10,
					a_corr_author = @p11,
					nm_pd = @p12,
					nipd = @p13,
					id_afiliasi = @p14,
					jns_afiliasi = @p15,
					last_update = @p16,
					id_updater = @p17,
					last_sync = @p18,
					soft_delete = 0
			WHEN NOT MATCHED THEN
				INSERT (
					id_tulis_pub, id_publikasi, id_sdm, id_katgiat, id_pd, id_orang,
					urutan, afiliasi, peran_tulis, jns_penulis, a_corr_author,
					nm_pd, nipd, id_afiliasi, jns_afiliasi,
					create_date, id_creator, last_update, id_updater, soft_delete, last_sync
				) VALUES (
					@p1, @p2, @p3, @p4, @p5, @p6,
					@p7, @p8, @p9, @p10, @p11,
					@p12, @p13, @p14, @p15,
					@p19, @p20, @p16, @p17, 0, @p18
				);
		`

		_, err := r.db.ExecContext(ctx, mergeSQL,
			tp.IDTulisPub,   // @p1
			tp.IDPublikasi,  // @p2
			tp.IDSDM,        // @p3
			tp.IDKatgiat,    // @p4
			tp.IDPD,         // @p5
			tp.IDOrang,      // @p6
			tp.Urutan,       // @p7
			tp.Afiliasi,     // @p8
			tp.PeranTulis,   // @p9
			tp.JnsPenulis,   // @p10
			tp.ACorrAuthor,  // @p11
			tp.NmPD,         // @p12
			tp.NIPD,         // @p13
			tp.IDAfiliasi,   // @p14
			tp.JnsAfiliasi,  // @p15
			tp.LastUpdate,   // @p16
			tp.IDUpdater,    // @p17
			tp.LastSync,     // @p18
			tp.CreateDate,   // @p19
			tp.IDCreator,    // @p20
		)

		if err != nil {
			log.Printf("⚠️ Failed to merge tulis_pub %s: %v", tp.IDTulisPub, err)
		}
	}

	log.Printf("✅ Merged %d tulis_pub for publikasi %s", len(tulisPubList), idPublikasi)
	return nil
}

// CheckPesertaDidikExists checks if a peserta_didik exists
func (r *repository) CheckPesertaDidikExists(idPD string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var exists bool
	query := `SELECT CASE WHEN EXISTS (
		SELECT 1 FROM pdrd.peserta_didik WHERE id_pd = @p1 AND soft_delete = 0
	) THEN 1 ELSE 0 END`

	err := r.db.QueryRowContext(ctx, query, idPD).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check peserta_didik existence: %w", err)
	}

	return exists, nil
}

// CheckOrangExists checks if a non_ca (orang) exists
func (r *repository) CheckOrangExists(idOrang string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var exists bool
	query := `SELECT CASE WHEN EXISTS (
		SELECT 1 FROM pdrd.non_ca WHERE id_orang = @p1 AND soft_delete = 0
	) THEN 1 ELSE 0 END`

	err := r.db.QueryRowContext(ctx, query, idOrang).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check non_ca existence: %w", err)
	}

	return exists, nil
}

// GetAllIDSDMWithPublikasi retrieves all unique id_sdm that have publikasi
func (r *repository) GetAllIDSDMWithPublikasi() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT CONVERT(VARCHAR(36), tp.id_sdm) as id_sdm
		FROM pdrd.tulis_pub tp
		INNER JOIN pdrd.publikasi p ON tp.id_publikasi = p.id_publikasi
		WHERE tp.id_sdm IS NOT NULL
			AND tp.soft_delete = 0
			AND p.soft_delete = 0
		ORDER BY id_sdm
	`

	var idSDMList []string
	err := r.db.SelectContext(ctx, &idSDMList, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get id_sdm list: %w", err)
	}

	log.Printf("✅ Found %d unique id_sdm with publikasi", len(idSDMList))
	return idSDMList, nil
}

// GetPublikasiList retrieves paginated list of publikasi
func (r *repository) GetPublikasiList(page, limit int, search string) (*PublikasiListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	offset := (page - 1) * limit

	// Build WHERE clause for search
	whereClause := "WHERE p.soft_delete = 0"
	args := []interface{}{}
	paramCount := 1

	if search != "" {
		// Search in judul, nama_jurnal OR penulis names (dosen or non-dosen)
		whereClause += fmt.Sprintf(` AND (
			p.judul LIKE @p%d
			OR p.nama_jurnal LIKE @p%d
			OR EXISTS (
				SELECT 1 FROM pdrd.tulis_pub tp
				INNER JOIN pdrd.sdm s ON s.id_sdm = tp.id_sdm AND s.soft_delete = 0
				WHERE tp.id_publikasi = p.id_publikasi
				AND tp.soft_delete = 0
				AND s.nm_sdm LIKE @p%d
			)
			OR EXISTS (
				SELECT 1 FROM pdrd.tulis_pub tp2
				WHERE tp2.id_publikasi = p.id_publikasi
				AND tp2.soft_delete = 0
				AND tp2.nm_pd LIKE @p%d
			)
		)`, paramCount, paramCount+1, paramCount+2, paramCount+3)
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern, searchPattern)
		paramCount += 4
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.publikasi p WITH (NOLOCK)
		%s
	`, whereClause)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count publikasi: %w", err)
	}

	// Get paginated data with JOIN to ref.jenis_publikasi
	dataQuery := fmt.Sprintf(`
		SELECT
			CONVERT(VARCHAR(36), p.id_publikasi) as id_publikasi,
			p.id_jns_pub, p.judul, p.judul_chapter, p.judul_asli, p.nama_jurnal,
			p.tgl_terbit, p.edisi, p.vol, p.no, p.hal, p.jml_hal, p.penerbit,
			p.a_seminar, p.a_prosiding, p.no_paten, p.pemberi_paten,
			p.doi, p.isbn, p.issn, p.e_issn, p.url, p.ket,
			p.stat_impor_sinta, p.quartile, p.id_kat_capaian,
			CONVERT(VARCHAR(36), p.id_litabmas) as id_litabmas,
			p.create_date, CONVERT(VARCHAR(36), p.id_creator) as id_creator,
			p.last_update, CONVERT(VARCHAR(36), p.id_updater) as id_updater,
			p.soft_delete, p.last_sync,
			jp.nm_jns_pub as jenis_publikasi_nama
		FROM pdrd.publikasi p WITH (NOLOCK)
		LEFT JOIN ref.jenis_publikasi jp WITH (NOLOCK) ON jp.id_jns_pub = p.id_jns_pub
		%s
		ORDER BY p.tgl_terbit DESC, p.judul
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramCount, paramCount+1)

	args = append(args, offset, limit)

	var publikasiList []*PublikasiListItem
	err = r.db.SelectContext(ctx, &publikasiList, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get publikasi list: %w", err)
	}

	log.Printf("📊 Retrieved %d publikasi items, now populating penulis...", len(publikasiList))

	// Populate penulis for each item
	for _, item := range publikasiList {
		penulis, err := r.getPenulisInfoByPublikasi(item.IDPublikasi)
		if err != nil {
			log.Printf("⚠️ Failed to get penulis for publikasi %s: %v", item.IDPublikasi, err)
			item.Penulis = []*PenulisInfo{} // Empty array on error
		} else {
			item.Penulis = penulis
		}
	}

	totalPages := (total + limit - 1) / limit

	return &PublikasiListResult{
		Data:       publikasiList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetPublikasiStats retrieves publikasi statistics
func (r *repository) GetPublikasiStats() (*PublikasiStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(*) as total_publikasi,
			SUM(CASE
				WHEN jp.nm_jns_pub LIKE '%nasional%' AND jp.nm_jns_pub LIKE '%jurnal%'
				THEN 1 ELSE 0
			END) as total_jurnal_nasional,
			SUM(CASE
				WHEN jp.nm_jns_pub LIKE '%internasional%' AND jp.nm_jns_pub LIKE '%jurnal%'
				THEN 1 ELSE 0
			END) as total_jurnal_intl,
			SUM(CASE
				WHEN jp.nm_jns_pub LIKE '%prosiding%' OR jp.nm_jns_pub LIKE '%seminar%'
				THEN 1 ELSE 0
			END) as total_proseeding,
			SUM(CASE
				WHEN jp.nm_jns_pub LIKE '%buku%' OR jp.nm_jns_pub LIKE '%book%'
				THEN 1 ELSE 0
			END) as total_buku
		FROM pdrd.publikasi p WITH (NOLOCK)
		LEFT JOIN ref.jenis_publikasi jp WITH (NOLOCK) ON jp.id_jns_pub = p.id_jns_pub
		WHERE p.soft_delete = 0
	`

	var stats PublikasiStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get publikasi stats: %w", err)
	}

	return &stats, nil
}

// getPenulisInfoByPublikasi retrieves penulis information for a publikasi
func (r *repository) getPenulisInfoByPublikasi(idPublikasi string) ([]*PenulisInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Printf("🔍 Getting penulis for publikasi: %s", idPublikasi)

	var result []*PenulisInfo

	// Query to get all penulis (dosen, mahasiswa, and external) from tulis_pub
	query := `
		SELECT
			COALESCE(s.nm_sdm, tp.nm_pd, 'Unknown') as nama,
			CASE
				WHEN tp.peran_tulis = 'A' THEN 'Penulis'
				WHEN tp.peran_tulis = 'B' THEN 'Editor'
				WHEN tp.peran_tulis = 'C' THEN 'Penerjemah'
				WHEN tp.peran_tulis = 'D' THEN 'Penemu/Inventor'
				ELSE 'Unknown'
			END + ' (' +
			CASE
				WHEN tp.jns_penulis = '1' THEN 'Dosen'
				WHEN tp.jns_penulis = '2' THEN 'Mahasiswa'
				WHEN tp.jns_penulis = '3' THEN 'Profesional'
				ELSE 'Unknown'
			END + ')' as jenis_peran
		FROM pdrd.tulis_pub tp WITH (NOLOCK)
		LEFT JOIN pdrd.sdm s WITH (NOLOCK) ON s.id_sdm = tp.id_sdm AND s.soft_delete = 0
		WHERE tp.id_publikasi = CONVERT(UNIQUEIDENTIFIER, @p1)
		AND tp.soft_delete = 0
		ORDER BY tp.urutan
	`

	rows, err := r.db.QueryContext(ctx, query, idPublikasi)
	if err != nil {
		log.Printf("⚠️ Error querying penulis for %s: %v", idPublikasi, err)
		return result, nil // Return empty array on error
	}
	defer rows.Close()

	penulisCount := 0
	for rows.Next() {
		var penulis PenulisInfo
		if err := rows.Scan(&penulis.Nama, &penulis.JenisPeran); err != nil {
			log.Printf("⚠️ Error scanning penulis: %v", err)
			continue
		}
		result = append(result, &penulis)
		penulisCount++
	}

	log.Printf("✅ Found %d penulis for publikasi %s", penulisCount, idPublikasi)
	return result, nil
}
