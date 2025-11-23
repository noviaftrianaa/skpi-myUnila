package referensi

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/jmoiron/sqlx"
)

// Repository defines methods for referensi data access
type Repository interface {
	// Agama methods
	GetAllAgama(ctx context.Context) ([]Agama, error)
	GetAgamaByID(ctx context.Context, id int) (*Agama, error)
	UpsertAgama(ctx context.Context, agama *Agama) error
	BulkUpsertAgama(ctx context.Context, agamaList []Agama) error

	// Negara methods
	GetAllNegara(ctx context.Context) ([]Negara, error)
	GetNegaraByID(ctx context.Context, id string) (*Negara, error)
	BulkUpsertNegara(ctx context.Context, negaraList []Negara) error

	// Jenjang Pendidikan methods
	GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error)
	BulkUpsertJenjangPendidikan(ctx context.Context, list []JenjangPendidikan) error

	// Gelar Akademik methods
	GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error)
	BulkUpsertGelarAkademik(ctx context.Context, list []GelarAkademik) error

	// Semester methods
	GetAllSemester(ctx context.Context) ([]Semester, error)
	BulkUpsertSemester(ctx context.Context, list []Semester) error

	// New Referensi methods (29 endpoints)
	GetAllBidangStudi() ([]BidangStudi, error)
	BulkUpsertBidangStudi(data []SisterBidangStudi, syncedBy string) error
	GetAllBidangUsaha() ([]BidangUsaha, error)
	BulkUpsertBidangUsaha(data []SisterBidangUsaha, syncedBy string) error
	GetAllJabatanFungsional() ([]JabatanFungsional, error)
	BulkUpsertJabatanFungsional(data []SisterJabatanFungsional, syncedBy string) error
	GetAllJabatanTugasTambahan() ([]JabatanTugasTambahan, error)
	BulkUpsertJabatanTugasTambahan(data []SisterJabatanTugasTambahan, syncedBy string) error
	GetAllJenisBahanAjar() ([]JenisBahanAjar, error)
	BulkUpsertJenisBahanAjar(data []SisterJenisBahanAjar, syncedBy string) error
	GetAllJenisBeasiswa() ([]JenisBeasiswa, error)
	BulkUpsertJenisBeasiswa(data []SisterJenisBeasiswa, syncedBy string) error
	GetAllJenisDiklat() ([]JenisDiklat, error)
	BulkUpsertJenisDiklat(data []SisterJenisDiklat, syncedBy string) error
	GetAllJenisDokumen() ([]JenisDokumen, error)
	BulkUpsertJenisDokumen(data []SisterJenisDokumen, syncedBy string) error
	GetAllJenisKeluar() ([]JenisKeluar, error)
	BulkUpsertJenisKeluar(data []SisterJenisKeluar, syncedBy string) error
	GetAllJenisKepanitiaan() ([]JenisKepanitiaan, error)
	BulkUpsertJenisKepanitiaan(data []SisterJenisKepanitiaan, syncedBy string) error
	GetAllJenisKesejahteraan() ([]JenisKesejahteraan, error)
	BulkUpsertJenisKesejahteraan(data []SisterJenisKesejahteraan, syncedBy string) error
	GetAllJenisPublikasi() ([]JenisPublikasi, error)
	BulkUpsertJenisPublikasi(data []SisterJenisPublikasi, syncedBy string) error
	GetAllJenisTes() ([]JenisTes, error)
	BulkUpsertJenisTes(data []SisterJenisTes, syncedBy string) error
	GetAllJenisTunjangan() ([]JenisTunjangan, error)
	BulkUpsertJenisTunjangan(data []SisterJenisTunjangan, syncedBy string) error
	GetAllMediaPublikasi() ([]MediaPublikasi, error)
	BulkUpsertMediaPublikasi(data []SisterMediaPublikasi, syncedBy string) error
	GetAllSkimKegiatan() ([]SkimKegiatan, error)
	BulkUpsertSkimKegiatan(data []SisterSkimKegiatan, syncedBy string) error
	GetAllStatusKepegawaian() ([]StatusKepegawaian, error)
	BulkUpsertStatusKepegawaian(data []SisterStatusKepegawaian, syncedBy string) error
	GetAllSumberGaji() ([]SumberGaji, error)
	BulkUpsertSumberGaji(data []SisterSumberGaji, syncedBy string) error
	GetAllTingkatPenghargaan() ([]TingkatPenghargaan, error)
	BulkUpsertTingkatPenghargaan(data []SisterTingkatPenghargaan, syncedBy string) error
	GetAllWilayah() ([]Wilayah, error)
	BulkUpsertWilayah(data []SisterWilayah, syncedBy string) error
	GetAllKategoriCapaianLuaran() ([]KategoriCapaianLuaran, error)
	BulkUpsertKategoriCapaianLuaran(data []SisterKategoriCapaianLuaran, syncedBy string) error
	GetAllKategoriKegiatan() ([]KategoriKegiatan, error)
	BulkUpsertKategoriKegiatan(data []SisterKategoriKegiatan, syncedBy string) error
	GetAllKelompokBidang() ([]KelompokBidang, error)
	BulkUpsertKelompokBidang(data []SisterKelompokBidang, syncedBy string) error
	GetAllLembagaSertifikasi() ([]LembagaSertifikasi, error)
	BulkUpsertLembagaSertifikasi(data []SisterLembagaSertifikasi, syncedBy string) error
	GetAllGolonganPangkat() ([]GolonganPangkat, error)
	BulkUpsertGolonganPangkat(data []SisterGolonganPangkat, syncedBy string) error
	GetAllIkatanKerja() ([]IkatanKerja, error)
	BulkUpsertIkatanKerja(data []SisterIkatanKerja, syncedBy string) error
	GetAllJenisPenghargaan() ([]JenisPenghargaan, error)
	BulkUpsertJenisPenghargaan(data []SisterJenisPenghargaan, syncedBy string) error
	GetAllJenisPekerjaan() ([]JenisPekerjaan, error)
	BulkUpsertJenisPekerjaan(data []SisterJenisPekerjaan, syncedBy string) error
	GetAllBidangPekerjaan() ([]BidangPekerjaan, error)
	BulkUpsertBidangPekerjaan(data []SisterBidangPekerjaan, syncedBy string) error

	// Unit Kerja methods
	GetAllUnitKerja() ([]UnitKerja, error)
	CountAllUnitKerja() (int, error)
	GetUnitKerjaByID(id string) (*UnitKerja, error)
	UpsertUnitKerja(unitKerja *UnitKerja) error
	GetUnitKerjaJenisUnit(idSMS string) (*int, error)
	LookupJenjangPendidikan(namaUnit, gelarLulusan string) (*int, error)
	UpdateFakultasHierarchy() error
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new repository instance
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetAllAgama retrieves all agama from database
func (r *repository) GetAllAgama(ctx context.Context) ([]Agama, error) {
	query := `
		SELECT
			id_agama,
			nm_agama as nama_agama,
			expired_date,
			last_sync
		FROM ref.agama
		WHERE expired_date IS NULL
		ORDER BY id_agama ASC
	`

	var agamaList []Agama
	err := r.db.SelectContext(ctx, &agamaList, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return []Agama{}, nil
		}
		log.Printf("Error fetching agama: %v", err)
		return nil, fmt.Errorf("failed to fetch agama: %w", err)
	}

	return agamaList, nil
}

// GetAgamaByID retrieves agama by ID
func (r *repository) GetAgamaByID(ctx context.Context, id int) (*Agama, error) {
	query := `
		SELECT
			id_agama,
			nm_agama as nama_agama,
			expired_date,
			last_sync
		FROM ref.agama
		WHERE id_agama = @p1
			AND expired_date IS NULL
	`

	var agama Agama
	err := r.db.GetContext(ctx, &agama, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		log.Printf("Error fetching agama by ID: %v", err)
		return nil, fmt.Errorf("failed to fetch agama: %w", err)
	}

	return &agama, nil
}

// UpsertAgama inserts or updates agama data
func (r *repository) UpsertAgama(ctx context.Context, agama *Agama) error {
	query := `
		MERGE ref.agama AS target
		USING (SELECT @p1 AS id_agama, @p2 AS nm_agama) AS source
		ON target.id_agama = source.id_agama
		WHEN MATCHED THEN
			UPDATE SET
				nm_agama = source.nm_agama,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_agama, a_ref_pddikti, a_ref_unila, nm_agama, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_agama, 0, 0, source.nm_agama, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
	`

	_, err := r.db.ExecContext(ctx, query, agama.IDAgama, agama.NamaAgama)
	if err != nil {
		log.Printf("Error upserting agama ID %d: %v", agama.IDAgama, err)
		return fmt.Errorf("failed to upsert agama: %w", err)
	}

	log.Printf("✅ Upserted agama ID %d: %s", agama.IDAgama, agama.NamaAgama)
	return nil
}

// BulkUpsertAgama performs bulk insert/update for agama list
func (r *repository) BulkUpsertAgama(ctx context.Context, agamaList []Agama) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		log.Printf("❌ Error starting transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("🔄 Transaction rolled back")
		}
	}()

	query := `
		MERGE ref.agama AS target
		USING (SELECT @p1 AS id_agama, @p2 AS nm_agama) AS source
		ON target.id_agama = source.id_agama
		WHEN MATCHED THEN
			UPDATE SET
				nm_agama = source.nm_agama,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_agama, a_ref_pddikti, a_ref_unila, nm_agama, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_agama, 0, 0, source.nm_agama, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
	`

	stmt, err := tx.PreparexContext(ctx, query)
	if err != nil {
		log.Printf("❌ Error preparing statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, agama := range agamaList {
		_, err := stmt.ExecContext(ctx, agama.IDAgama, agama.NamaAgama)
		if err != nil {
			log.Printf("❌ Error executing statement for agama %d (%s): %v", agama.IDAgama, agama.NamaAgama, err)
			return fmt.Errorf("failed to execute statement: %w", err)
		}

		log.Printf("   ✓ ID %d: %s", agama.IDAgama, agama.NamaAgama)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("❌ Error committing transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Bulk upsert completed: %d records processed", len(agamaList))
	return nil
}

// ==================== NEGARA METHODS ====================

// GetAllNegara retrieves all negara from database
func (r *repository) GetAllNegara(ctx context.Context) ([]Negara, error) {
	query := `
		SELECT
			id_negara,
			nm_negara as nama_negara,
			expired_date,
			last_sync
		FROM ref.negara
		WHERE expired_date IS NULL
		ORDER BY nm_negara ASC
	`

	var negaraList []Negara
	err := r.db.SelectContext(ctx, &negaraList, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return []Negara{}, nil
		}
		log.Printf("Error fetching negara: %v", err)
		return nil, fmt.Errorf("failed to fetch negara: %w", err)
	}

	return negaraList, nil
}

// GetNegaraByID retrieves negara by ID (2-letter code)
func (r *repository) GetNegaraByID(ctx context.Context, id string) (*Negara, error) {
	query := `
		SELECT
			id_negara,
			nm_negara as nama_negara,
			expired_date,
			last_sync
		FROM ref.negara
		WHERE id_negara = @p1
			AND expired_date IS NULL
	`

	var negara Negara
	err := r.db.GetContext(ctx, &negara, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		log.Printf("Error fetching negara by ID: %v", err)
		return nil, fmt.Errorf("failed to fetch negara: %w", err)
	}

	return &negara, nil
}

// BulkUpsertNegara performs bulk insert/update for negara list
func (r *repository) BulkUpsertNegara(ctx context.Context, negaraList []Negara) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		log.Printf("❌ Error starting transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("🔄 Transaction rolled back")
		}
	}()

	query := `
		MERGE ref.negara AS target
		USING (SELECT @p1 AS id_negara, @p2 AS nm_negara) AS source
		ON target.id_negara = source.id_negara
		WHEN MATCHED THEN
			UPDATE SET
				nm_negara = source.nm_negara,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_negara, a_ref_pddikti, a_ref_unila, nm_negara, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_negara, 0, 0, source.nm_negara, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
	`

	stmt, err := tx.PreparexContext(ctx, query)
	if err != nil {
		log.Printf("❌ Error preparing statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, negara := range negaraList {
		_, err := stmt.ExecContext(ctx, negara.IDNegara, negara.NamaNegara)
		if err != nil {
			log.Printf("❌ Error executing statement for negara %s (%s): %v", negara.IDNegara, negara.NamaNegara, err)
			return fmt.Errorf("failed to execute statement: %w", err)
		}

		log.Printf("   ✓ ID %s: %s", negara.IDNegara, negara.NamaNegara)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("❌ Error committing transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Bulk upsert negara completed: %d records processed", len(negaraList))
	return nil
}

// ==================== JENJANG PENDIDIKAN METHODS ====================

func (r *repository) GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error) {
	query := `
		SELECT id_jenj_didik, nm_jenj_didik as nama_jenjang,
		       expired_date, last_sync
		FROM ref.jenjang_pendidikan
		WHERE expired_date IS NULL
		ORDER BY nm_jenj_didik ASC`

	var list []JenjangPendidikan
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch jenjang pendidikan: %w", err)
	}
	return list, nil
}

func (r *repository) BulkUpsertJenjangPendidikan(ctx context.Context, list []JenjangPendidikan) error {
	log.Printf("🔄 Starting bulk upsert for %d jenjang pendidikan records...", len(list))

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		log.Printf("❌ Error starting transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("🔄 Transaction rolled back")
		}
	}()

	query := `
		MERGE ref.jenjang_pendidikan AS target
		USING (SELECT @p1 AS id_jenj_didik, @p2 AS nm_jenj_didik) AS source
		ON target.id_jenj_didik = source.id_jenj_didik
		WHEN MATCHED THEN
			UPDATE SET
				nm_jenj_didik = source.nm_jenj_didik,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_jenj_didik, a_ref_pddikti, a_ref_unila, nm_jenj_didik, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_jenj_didik, 0, 0, source.nm_jenj_didik, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));`

	stmt, err := tx.PreparexContext(ctx, query)
	if err != nil {
		log.Printf("❌ Error preparing statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, item := range list {
		_, err = stmt.ExecContext(ctx, item.IDJenjangPendidikan, item.NamaJenjang)
		if err != nil {
			log.Printf("❌ Error executing statement for ID %d: %v", item.IDJenjangPendidikan, err)
			return fmt.Errorf("failed to execute statement: %w", err)
		}

		log.Printf("   ✓ ID %d: %s", item.IDJenjangPendidikan, item.NamaJenjang)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("❌ Error committing transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Bulk upsert jenjang pendidikan completed: %d records processed", len(list))
	return nil
}

// ==================== GELAR AKADEMIK METHODS ====================

func (r *repository) GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error) {
	query := `
		SELECT id_gelar_akad, nm_gelar_akad as nama_gelar, singkat_gelar, posisi_gelar,
		       expired_date, last_sync
		FROM ref.gelar_akademik
		WHERE expired_date IS NULL
		ORDER BY nm_gelar_akad ASC`

	var list []GelarAkademik
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch gelar akademik: %w", err)
	}
	return list, nil
}

func (r *repository) BulkUpsertGelarAkademik(ctx context.Context, list []GelarAkademik) error {
	log.Printf("🔄 Starting bulk upsert for %d gelar akademik records...", len(list))

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		log.Printf("❌ Error starting transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("🔄 Transaction rolled back")
		}
	}()

	query := `
		MERGE ref.gelar_akademik AS target
		USING (SELECT @p1 AS id_gelar_akad, @p2 AS nm_gelar_akad) AS source
		ON target.id_gelar_akad = source.id_gelar_akad
		WHEN MATCHED THEN
			UPDATE SET
				nm_gelar_akad = source.nm_gelar_akad,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_gelar_akad, a_ref_pddikti, a_ref_unila, singkat_gelar, nm_gelar_akad, posisi_gelar, create_date, last_update, expired_date, last_sync)
			VALUES (
				source.id_gelar_akad,
				0,
				0,
				COALESCE((SELECT TOP 1 singkat_gelar FROM ref.gelar_akademik WHERE nm_gelar_akad LIKE '%' + LEFT(source.nm_gelar_akad, 10) + '%' AND singkat_gelar IS NOT NULL AND singkat_gelar != ''), '-'),
				source.nm_gelar_akad,
				COALESCE((SELECT TOP 1 posisi_gelar FROM ref.gelar_akademik WHERE nm_gelar_akad LIKE '%' + LEFT(source.nm_gelar_akad, 10) + '%' AND posisi_gelar IS NOT NULL), 2),
				DATEADD(HOUR, 7, GETUTCDATE()),
				DATEADD(HOUR, 7, GETUTCDATE()),
				NULL,
				DATEADD(HOUR, 7, GETUTCDATE())
			);`

	stmt, err := tx.PreparexContext(ctx, query)
	if err != nil {
		log.Printf("❌ Error preparing statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, item := range list {
		_, err = stmt.ExecContext(ctx, item.IDGelarAkademik, item.NamaGelar)
		if err != nil {
			log.Printf("❌ Error executing statement for ID %d: %v", item.IDGelarAkademik, err)
			return fmt.Errorf("failed to execute statement: %w", err)
		}

		log.Printf("   ✓ ID %d: %s", item.IDGelarAkademik, item.NamaGelar)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("❌ Error committing transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Bulk upsert gelar akademik completed: %d records processed", len(list))
	return nil
}

// ==================== SEMESTER METHODS ====================

func (r *repository) GetAllSemester(ctx context.Context) ([]Semester, error) {
	query := `
		SELECT id_smt, nm_smt as nama_semester, a_periode_aktif as tahun_ajaran,
		       expired_date, last_sync
		FROM ref.semester
		WHERE expired_date IS NULL
		ORDER BY id_smt DESC`

	var list []Semester
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch semester: %w", err)
	}
	return list, nil
}

func (r *repository) BulkUpsertSemester(ctx context.Context, list []Semester) error {
	log.Printf("🔄 Starting bulk upsert for %d semester records...", len(list))

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		log.Printf("❌ Error starting transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("🔄 Transaction rolled back")
		}
	}()

	query := `
		MERGE ref.semester AS target
		USING (SELECT @p1 AS id_smt, @p2 AS nm_smt) AS source
		ON target.id_smt = source.id_smt
		WHEN MATCHED THEN
			UPDATE SET
				nm_smt = source.nm_smt,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (id_smt, a_ref_pddikti, a_ref_unila, nm_smt, a_periode_aktif, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_smt, 0, 0, source.nm_smt, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));`

	stmt, err := tx.PreparexContext(ctx, query)
	if err != nil {
		log.Printf("❌ Error preparing statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, item := range list {
		_, err = stmt.ExecContext(ctx, item.IDSemester, item.NamaSemester)
		if err != nil {
			log.Printf("❌ Error executing statement for ID %s: %v", item.IDSemester, err)
			return fmt.Errorf("failed to execute statement: %w", err)
		}

		log.Printf("   ✓ ID %s: %s", item.IDSemester, item.NamaSemester)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("❌ Error committing transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Bulk upsert semester completed: %d records processed", len(list))
	return nil
}

// GetAllBidangStudi retrieves all active bidangStudi records
func (r *repository) GetAllBidangStudi() ([]BidangStudi, error) {
	var result []BidangStudi
	query := `SELECT id_bid_studi, nm_bid_studi, expired_date, last_sync FROM ref.bidang_studi WHERE expired_date IS NULL ORDER BY nm_bid_studi`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertBidangStudi performs bulk upsert for bidangStudi
func (r *repository) BulkUpsertBidangStudi(data []SisterBidangStudi, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.bidang_studi AS target
			USING (SELECT @p1 AS id_bid_studi, @p2 AS nm_bid_studi) AS source
			ON target.id_bid_studi = source.id_bid_studi
			WHEN MATCHED THEN
				UPDATE SET nm_bid_studi = source.nm_bid_studi,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_bid_studi, nm_bid_studi, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_bid_studi, source.nm_bid_studi, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert bidang_studi %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllBidangUsaha retrieves all active bidangUsaha records
func (r *repository) GetAllBidangUsaha() ([]BidangUsaha, error) {
	var result []BidangUsaha
	query := `SELECT id_bu, nm_bu, expired_date, last_sync FROM ref.bidang_usaha WHERE expired_date IS NULL ORDER BY nm_bu`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertBidangUsaha performs bulk upsert for bidangUsaha
func (r *repository) BulkUpsertBidangUsaha(data []SisterBidangUsaha, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.bidang_usaha AS target
			USING (SELECT @p1 AS id_bu, @p2 AS nm_bu) AS source
			ON target.id_bu = source.id_bu
			WHEN MATCHED THEN
				UPDATE SET nm_bu = source.nm_bu,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_bu, nm_bu, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_bu, source.nm_bu, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert bidang_usaha %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJabatanFungsional retrieves all active jabatanFungsional records
func (r *repository) GetAllJabatanFungsional() ([]JabatanFungsional, error) {
	var result []JabatanFungsional
	query := `SELECT id_jabfung, nm_jabfung, expired_date, last_sync FROM ref.jabfung WHERE expired_date IS NULL ORDER BY nm_jabfung`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJabatanFungsional performs bulk upsert for jabatanFungsional
func (r *repository) BulkUpsertJabatanFungsional(data []SisterJabatanFungsional, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jabfung AS target
			USING (SELECT @p1 AS id_jabfung, @p2 AS nm_jabfung) AS source
			ON target.id_jabfung = source.id_jabfung
			WHEN MATCHED THEN
				UPDATE SET nm_jabfung = source.nm_jabfung,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jabfung, nm_jabfung, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jabfung, source.nm_jabfung, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jabfung %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJabatanTugasTambahan retrieves all active jabatanTugasTambahan records
func (r *repository) GetAllJabatanTugasTambahan() ([]JabatanTugasTambahan, error) {
	var result []JabatanTugasTambahan
	query := `SELECT id_jab_tgs, nm_jab_tgs, expired_date, last_sync FROM ref.jab_tgs WHERE expired_date IS NULL ORDER BY nm_jab_tgs`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJabatanTugasTambahan performs bulk upsert for jabatanTugasTambahan
func (r *repository) BulkUpsertJabatanTugasTambahan(data []SisterJabatanTugasTambahan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jab_tgs AS target
			USING (SELECT @p1 AS id_jab_tgs, @p2 AS nm_jab_tgs) AS source
			ON target.id_jab_tgs = source.id_jab_tgs
			WHEN MATCHED THEN
				UPDATE SET nm_jab_tgs = source.nm_jab_tgs,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jab_tgs, nm_jab_tgs, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jab_tgs, source.nm_jab_tgs, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jab_tgs %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisBahanAjar retrieves all active jenisBahanAjar records
func (r *repository) GetAllJenisBahanAjar() ([]JenisBahanAjar, error) {
	var result []JenisBahanAjar
	query := `SELECT id_jns_bhn_ajar, nm_jns_bhn_ajar, expired_date, last_sync FROM ref.jenis_bahan_ajar WHERE expired_date IS NULL ORDER BY nm_jns_bhn_ajar`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisBahanAjar performs bulk upsert for jenisBahanAjar
func (r *repository) BulkUpsertJenisBahanAjar(data []SisterJenisBahanAjar, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_bahan_ajar AS target
			USING (SELECT @p1 AS id_jns_bhn_ajar, @p2 AS nm_jns_bhn_ajar) AS source
			ON target.id_jns_bhn_ajar = source.id_jns_bhn_ajar
			WHEN MATCHED THEN
				UPDATE SET nm_jns_bhn_ajar = source.nm_jns_bhn_ajar,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_bhn_ajar, nm_jns_bhn_ajar, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_bhn_ajar, source.nm_jns_bhn_ajar, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_bahan_ajar %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisBeasiswa retrieves all active jenisBeasiswa records
func (r *repository) GetAllJenisBeasiswa() ([]JenisBeasiswa, error) {
	var result []JenisBeasiswa
	query := `SELECT id_jns_beasiswa, nm_jns_beasiswa, expired_date, last_sync FROM ref.jenis_beasiswa WHERE expired_date IS NULL ORDER BY nm_jns_beasiswa`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisBeasiswa performs bulk upsert for jenisBeasiswa
func (r *repository) BulkUpsertJenisBeasiswa(data []SisterJenisBeasiswa, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_beasiswa AS target
			USING (SELECT @p1 AS id_jns_beasiswa, @p2 AS nm_jns_beasiswa) AS source
			ON target.id_jns_beasiswa = source.id_jns_beasiswa
			WHEN MATCHED THEN
				UPDATE SET nm_jns_beasiswa = source.nm_jns_beasiswa,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_beasiswa, nm_jns_beasiswa, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_beasiswa, source.nm_jns_beasiswa, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_beasiswa %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisDiklat retrieves all active jenisDiklat records
func (r *repository) GetAllJenisDiklat() ([]JenisDiklat, error) {
	var result []JenisDiklat
	query := `SELECT id_jns_diklat, nm_jns_diklat, expired_date, last_sync FROM ref.jenis_diklat WHERE expired_date IS NULL ORDER BY nm_jns_diklat`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisDiklat performs bulk upsert for jenisDiklat
func (r *repository) BulkUpsertJenisDiklat(data []SisterJenisDiklat, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_diklat AS target
			USING (SELECT @p1 AS id_jns_diklat, @p2 AS nm_jns_diklat) AS source
			ON target.id_jns_diklat = source.id_jns_diklat
			WHEN MATCHED THEN
				UPDATE SET nm_jns_diklat = source.nm_jns_diklat,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_diklat, nm_jns_diklat, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_diklat, source.nm_jns_diklat, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_diklat %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisDokumen retrieves all active jenisDokumen records
func (r *repository) GetAllJenisDokumen() ([]JenisDokumen, error) {
	var result []JenisDokumen
	query := `SELECT id_jns_dok, nm_jns_dok, expired_date, last_sync FROM ref.jenis_dokumen WHERE expired_date IS NULL ORDER BY nm_jns_dok`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisDokumen performs bulk upsert for jenisDokumen
func (r *repository) BulkUpsertJenisDokumen(data []SisterJenisDokumen, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_dokumen AS target
			USING (SELECT @p1 AS id_jns_dok, @p2 AS nm_jns_dok) AS source
			ON target.id_jns_dok = source.id_jns_dok
			WHEN MATCHED THEN
				UPDATE SET nm_jns_dok = source.nm_jns_dok,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_dok, nm_jns_dok, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_dok, source.nm_jns_dok, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_dokumen %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisKeluar retrieves all active jenisKeluar records
func (r *repository) GetAllJenisKeluar() ([]JenisKeluar, error) {
	var result []JenisKeluar
	query := `SELECT id_jns_keluar, ket_keluar, expired_date, last_sync FROM ref.jenis_keluar WHERE expired_date IS NULL ORDER BY ket_keluar`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisKeluar performs bulk upsert for jenisKeluar
func (r *repository) BulkUpsertJenisKeluar(data []SisterJenisKeluar, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_keluar AS target
			USING (SELECT @p1 AS id_jns_keluar, @p2 AS ket_keluar) AS source
			ON target.id_jns_keluar = source.id_jns_keluar
			WHEN MATCHED THEN
				UPDATE SET ket_keluar = source.ket_keluar,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_keluar, ket_keluar, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_keluar, source.ket_keluar, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_keluar %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisKepanitiaan retrieves all active jenisKepanitiaan records
func (r *repository) GetAllJenisKepanitiaan() ([]JenisKepanitiaan, error) {
	var result []JenisKepanitiaan
	query := `SELECT id_jns_panitia, nm_jns_panitia, expired_date, last_sync FROM ref.jenis_kepanitiaan WHERE expired_date IS NULL ORDER BY nm_jns_panitia`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisKepanitiaan performs bulk upsert for jenisKepanitiaan
func (r *repository) BulkUpsertJenisKepanitiaan(data []SisterJenisKepanitiaan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_kepanitiaan AS target
			USING (SELECT @p1 AS id_jns_panitia, @p2 AS nm_jns_panitia) AS source
			ON target.id_jns_panitia = source.id_jns_panitia
			WHEN MATCHED THEN
				UPDATE SET nm_jns_panitia = source.nm_jns_panitia,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_panitia, nm_jns_panitia, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_panitia, source.nm_jns_panitia, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_kepanitiaan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisKesejahteraan retrieves all active jenisKesejahteraan records
func (r *repository) GetAllJenisKesejahteraan() ([]JenisKesejahteraan, error) {
	var result []JenisKesejahteraan
	query := `SELECT id_jns_sejahtera, nm_jns_sejahtera, expired_date, last_sync FROM ref.jenis_kesejahteraan WHERE expired_date IS NULL ORDER BY nm_jns_sejahtera`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisKesejahteraan performs bulk upsert for jenisKesejahteraan
func (r *repository) BulkUpsertJenisKesejahteraan(data []SisterJenisKesejahteraan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_kesejahteraan AS target
			USING (SELECT @p1 AS id_jns_sejahtera, @p2 AS nm_jns_sejahtera) AS source
			ON target.id_jns_sejahtera = source.id_jns_sejahtera
			WHEN MATCHED THEN
				UPDATE SET nm_jns_sejahtera = source.nm_jns_sejahtera,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_sejahtera, nm_jns_sejahtera, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_sejahtera, source.nm_jns_sejahtera, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_kesejahteraan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisPublikasi retrieves all active jenisPublikasi records
func (r *repository) GetAllJenisPublikasi() ([]JenisPublikasi, error) {
	var result []JenisPublikasi
	query := `SELECT id_jns_pub, nm_jns_pub, expired_date, last_sync FROM ref.jenis_publikasi WHERE expired_date IS NULL ORDER BY nm_jns_pub`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisPublikasi performs bulk upsert for jenisPublikasi
func (r *repository) BulkUpsertJenisPublikasi(data []SisterJenisPublikasi, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_publikasi AS target
			USING (SELECT @p1 AS id_jns_pub, @p2 AS nm_jns_pub) AS source
			ON target.id_jns_pub = source.id_jns_pub
			WHEN MATCHED THEN
				UPDATE SET nm_jns_pub = source.nm_jns_pub,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_pub, nm_jns_pub, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_pub, source.nm_jns_pub, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_publikasi %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisTes retrieves all active jenisTes records
func (r *repository) GetAllJenisTes() ([]JenisTes, error) {
	var result []JenisTes
	query := `SELECT id_jns_tes, nm_jns_tes, expired_date, last_sync FROM ref.jenis_tes WHERE expired_date IS NULL ORDER BY nm_jns_tes`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisTes performs bulk upsert for jenisTes
func (r *repository) BulkUpsertJenisTes(data []SisterJenisTes, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_tes AS target
			USING (SELECT @p1 AS id_jns_tes, @p2 AS nm_jns_tes) AS source
			ON target.id_jns_tes = source.id_jns_tes
			WHEN MATCHED THEN
				UPDATE SET nm_jns_tes = source.nm_jns_tes,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_tes, nm_jns_tes, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_tes, source.nm_jns_tes, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_tes %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisTunjangan retrieves all active jenisTunjangan records
func (r *repository) GetAllJenisTunjangan() ([]JenisTunjangan, error) {
	var result []JenisTunjangan
	query := `SELECT id_jns_tunj, nm_jns_tunj, expired_date, last_sync FROM ref.jenis_tunjangan WHERE expired_date IS NULL ORDER BY nm_jns_tunj`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisTunjangan performs bulk upsert for jenisTunjangan
func (r *repository) BulkUpsertJenisTunjangan(data []SisterJenisTunjangan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_tunjangan AS target
			USING (SELECT @p1 AS id_jns_tunj, @p2 AS nm_jns_tunj) AS source
			ON target.id_jns_tunj = source.id_jns_tunj
			WHEN MATCHED THEN
				UPDATE SET nm_jns_tunj = source.nm_jns_tunj,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_tunj, nm_jns_tunj, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_tunj, source.nm_jns_tunj, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_tunjangan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllMediaPublikasi retrieves all active mediaPublikasi records
func (r *repository) GetAllMediaPublikasi() ([]MediaPublikasi, error) {
	var result []MediaPublikasi
	query := `SELECT id_media_pub, nm_media_pub, expired_date, last_sync FROM ref.media_publikasi WHERE expired_date IS NULL ORDER BY nm_media_pub`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertMediaPublikasi performs bulk upsert for mediaPublikasi
func (r *repository) BulkUpsertMediaPublikasi(data []SisterMediaPublikasi, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.media_publikasi AS target
			USING (SELECT @p1 AS id_media_pub, @p2 AS nm_media_pub) AS source
			ON target.id_media_pub = source.id_media_pub
			WHEN MATCHED THEN
				UPDATE SET nm_media_pub = source.nm_media_pub,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_media_pub, nm_media_pub, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_media_pub, source.nm_media_pub, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert media_publikasi %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllSkimKegiatan retrieves all active skimKegiatan records
func (r *repository) GetAllSkimKegiatan() ([]SkimKegiatan, error) {
	var result []SkimKegiatan
	query := `SELECT id_skim, nm_skim, expired_date, last_sync FROM ref.skim_kegiatan WHERE expired_date IS NULL ORDER BY nm_skim`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertSkimKegiatan performs bulk upsert for skimKegiatan
func (r *repository) BulkUpsertSkimKegiatan(data []SisterSkimKegiatan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.skim_kegiatan AS target
			USING (SELECT @p1 AS id_skim, @p2 AS nm_skim) AS source
			ON target.id_skim = source.id_skim
			WHEN MATCHED THEN
				UPDATE SET nm_skim = source.nm_skim,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_skim, nm_skim, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_skim, source.nm_skim, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert skim_kegiatan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllStatusKepegawaian retrieves all active statusKepegawaian records
func (r *repository) GetAllStatusKepegawaian() ([]StatusKepegawaian, error) {
	var result []StatusKepegawaian
	query := `SELECT id_stat_pegawai, nm_stat_pegawai, expired_date, last_sync FROM ref.status_kepegawaian WHERE expired_date IS NULL ORDER BY nm_stat_pegawai`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertStatusKepegawaian performs bulk upsert for statusKepegawaian
func (r *repository) BulkUpsertStatusKepegawaian(data []SisterStatusKepegawaian, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.status_kepegawaian AS target
			USING (SELECT @p1 AS id_stat_pegawai, @p2 AS nm_stat_pegawai) AS source
			ON target.id_stat_pegawai = source.id_stat_pegawai
			WHEN MATCHED THEN
				UPDATE SET nm_stat_pegawai = source.nm_stat_pegawai,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_stat_pegawai, nm_stat_pegawai, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_stat_pegawai, source.nm_stat_pegawai, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert status_kepegawaian %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllSumberGaji retrieves all active sumberGaji records
func (r *repository) GetAllSumberGaji() ([]SumberGaji, error) {
	var result []SumberGaji
	query := `SELECT id_sumber_gaji, nm_sumber_gaji, expired_date, last_sync FROM ref.sumber_gaji WHERE expired_date IS NULL ORDER BY nm_sumber_gaji`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertSumberGaji performs bulk upsert for sumberGaji
func (r *repository) BulkUpsertSumberGaji(data []SisterSumberGaji, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.sumber_gaji AS target
			USING (SELECT @p1 AS id_sumber_gaji, @p2 AS nm_sumber_gaji) AS source
			ON target.id_sumber_gaji = source.id_sumber_gaji
			WHEN MATCHED THEN
				UPDATE SET nm_sumber_gaji = source.nm_sumber_gaji,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_sumber_gaji, nm_sumber_gaji, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_sumber_gaji, source.nm_sumber_gaji, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert sumber_gaji %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllTingkatPenghargaan retrieves all active tingkatPenghargaan records
func (r *repository) GetAllTingkatPenghargaan() ([]TingkatPenghargaan, error) {
	var result []TingkatPenghargaan
	query := `SELECT id_tkt_penghargaan, nm_tkt_penghargaan, expired_date, last_sync FROM ref.tingkat_penghargaan WHERE expired_date IS NULL ORDER BY nm_tkt_penghargaan`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertTingkatPenghargaan performs bulk upsert for tingkatPenghargaan
func (r *repository) BulkUpsertTingkatPenghargaan(data []SisterTingkatPenghargaan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.tingkat_penghargaan AS target
			USING (SELECT @p1 AS id_tkt_penghargaan, @p2 AS nm_tkt_penghargaan) AS source
			ON target.id_tkt_penghargaan = source.id_tkt_penghargaan
			WHEN MATCHED THEN
				UPDATE SET nm_tkt_penghargaan = source.nm_tkt_penghargaan,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_tkt_penghargaan, nm_tkt_penghargaan, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_tkt_penghargaan, source.nm_tkt_penghargaan, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert tingkat_penghargaan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllWilayah retrieves all active wilayah records
func (r *repository) GetAllWilayah() ([]Wilayah, error) {
	var result []Wilayah
	query := `SELECT id_wil, nm_wil, expired_date, last_sync FROM ref.wilayah WHERE expired_date IS NULL ORDER BY nm_wil`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertWilayah performs bulk upsert for wilayah
func (r *repository) BulkUpsertWilayah(data []SisterWilayah, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.wilayah AS target
			USING (SELECT @p1 AS id_wil, @p2 AS nm_wil) AS source
			ON target.id_wil = source.id_wil
			WHEN MATCHED THEN
				UPDATE SET nm_wil = source.nm_wil,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_wil, nm_wil, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_wil, source.nm_wil, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert wilayah %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllKategoriCapaianLuaran retrieves all active kategoriCapaianLuaran records
func (r *repository) GetAllKategoriCapaianLuaran() ([]KategoriCapaianLuaran, error) {
	var result []KategoriCapaianLuaran
	query := `SELECT id_kat_capaian, nm_kat_capaian, expired_date, last_sync FROM ref.kategori_capaian_luaran WHERE expired_date IS NULL ORDER BY nm_kat_capaian`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertKategoriCapaianLuaran performs bulk upsert for kategoriCapaianLuaran
func (r *repository) BulkUpsertKategoriCapaianLuaran(data []SisterKategoriCapaianLuaran, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.kategori_capaian_luaran AS target
			USING (SELECT @p1 AS id_kat_capaian, @p2 AS nm_kat_capaian) AS source
			ON target.id_kat_capaian = source.id_kat_capaian
			WHEN MATCHED THEN
				UPDATE SET nm_kat_capaian = source.nm_kat_capaian,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_kat_capaian, nm_kat_capaian, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_kat_capaian, source.nm_kat_capaian, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert kategori_capaian_luaran %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllKategoriKegiatan retrieves all active kategoriKegiatan records
func (r *repository) GetAllKategoriKegiatan() ([]KategoriKegiatan, error) {
	var result []KategoriKegiatan
	query := `SELECT id_katgiat, nm_kat, expired_date, last_sync FROM ref.kategori_kegiatan WHERE expired_date IS NULL ORDER BY nm_kat`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertKategoriKegiatan performs bulk upsert for kategoriKegiatan
func (r *repository) BulkUpsertKategoriKegiatan(data []SisterKategoriKegiatan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.kategori_kegiatan AS target
			USING (SELECT @p1 AS id_katgiat, @p2 AS nm_kat) AS source
			ON target.id_katgiat = source.id_katgiat
			WHEN MATCHED THEN
				UPDATE SET nm_kat = source.nm_kat,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_katgiat, nm_kat, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_katgiat, source.nm_kat, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert kategori_kegiatan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllKelompokBidang retrieves all active kelompokBidang records
func (r *repository) GetAllKelompokBidang() ([]KelompokBidang, error) {
	var result []KelompokBidang
	query := `SELECT id_kel_bidang, kode_kel_bidang, nm_kel_bidang, expired_date, last_sync FROM ref.kelompok_bidang WHERE expired_date IS NULL ORDER BY nm_kel_bidang`
	err := r.db.Select(&result, query)
	return result, err
}

// extractKodeAndCleanNama extracts kode from nama like "[381209] Hukum..." and returns (kode, cleanedNama)
func extractKodeAndCleanNama(nama string) (string, string) {
	// Regex to match [kode] at the beginning
	re := regexp.MustCompile(`^\[(\d+)\]\s*(.+)$`)
	matches := re.FindStringSubmatch(nama)

	if len(matches) == 3 {
		kode := matches[1]
		cleanNama := strings.TrimSpace(matches[2])
		return kode, cleanNama
	}

	// If no kode found, return empty kode and original nama
	return "", nama
}

// BulkUpsertKelompokBidang performs bulk upsert for kelompokBidang
func (r *repository) BulkUpsertKelompokBidang(data []SisterKelompokBidang, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		// Extract kode and clean nama
		kode, cleanNama := extractKodeAndCleanNama(item.Nama)

		query := `
			MERGE ref.kelompok_bidang AS target
			USING (SELECT @p1 AS id_kel_bidang, @p2 AS kode_kel_bidang, @p3 AS nm_kel_bidang) AS source
			ON target.id_kel_bidang = source.id_kel_bidang
			WHEN MATCHED THEN
				UPDATE SET kode_kel_bidang = source.kode_kel_bidang,
						   nm_kel_bidang = source.nm_kel_bidang,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_kel_bidang, kode_kel_bidang, nm_kel_bidang, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_kel_bidang, source.kode_kel_bidang, source.nm_kel_bidang, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, kode, cleanNama)
		if err != nil {
			return fmt.Errorf("failed to upsert kelompok_bidang %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllLembagaSertifikasi retrieves all active lembagaSertifikasi records
func (r *repository) GetAllLembagaSertifikasi() ([]LembagaSertifikasi, error) {
	var result []LembagaSertifikasi
	query := `SELECT id_lemb_sert, nm_lemb_sert, expired_date, last_sync FROM ref.lembaga_sertifikasi WHERE expired_date IS NULL ORDER BY nm_lemb_sert`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertLembagaSertifikasi performs bulk upsert for lembagaSertifikasi
func (r *repository) BulkUpsertLembagaSertifikasi(data []SisterLembagaSertifikasi, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.lembaga_sertifikasi AS target
			USING (SELECT @p1 AS id_lemb_sert, @p2 AS nm_lemb_sert) AS source
			ON target.id_lemb_sert = source.id_lemb_sert
			WHEN MATCHED THEN
				UPDATE SET nm_lemb_sert = source.nm_lemb_sert,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_lemb_sert, nm_lemb_sert, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_lemb_sert, source.nm_lemb_sert, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert lembaga_sertifikasi %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllGolonganPangkat retrieves all active golonganPangkat records
func (r *repository) GetAllGolonganPangkat() ([]GolonganPangkat, error) {
	var result []GolonganPangkat
	query := `SELECT id_pangkat_gol, nm_pangkat, expired_date, last_sync FROM ref.pangkat_golongan WHERE expired_date IS NULL ORDER BY nm_pangkat`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertGolonganPangkat performs bulk upsert for golonganPangkat
func (r *repository) BulkUpsertGolonganPangkat(data []SisterGolonganPangkat, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.pangkat_golongan AS target
			USING (SELECT @p1 AS id_pangkat_gol, @p2 AS nm_pangkat) AS source
			ON target.id_pangkat_gol = source.id_pangkat_gol
			WHEN MATCHED THEN
				UPDATE SET nm_pangkat = source.nm_pangkat,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_pangkat_gol, nm_pangkat, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_pangkat_gol, source.nm_pangkat, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert pangkat_golongan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllIkatanKerja retrieves all active ikatanKerja records
func (r *repository) GetAllIkatanKerja() ([]IkatanKerja, error) {
	var result []IkatanKerja
	query := `SELECT id_ikatan_kerja, nm_ikatan_kerja, expired_date, last_sync FROM ref.ikatan_kerja_sdm WHERE expired_date IS NULL ORDER BY nm_ikatan_kerja`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertIkatanKerja performs bulk upsert for ikatanKerja
func (r *repository) BulkUpsertIkatanKerja(data []SisterIkatanKerja, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.ikatan_kerja_sdm AS target
			USING (SELECT @p1 AS id_ikatan_kerja, @p2 AS nm_ikatan_kerja) AS source
			ON target.id_ikatan_kerja = source.id_ikatan_kerja
			WHEN MATCHED THEN
				UPDATE SET nm_ikatan_kerja = source.nm_ikatan_kerja,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_ikatan_kerja, nm_ikatan_kerja, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_ikatan_kerja, source.nm_ikatan_kerja, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert ikatan_kerja_sdm %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisPenghargaan retrieves all active jenisPenghargaan records
func (r *repository) GetAllJenisPenghargaan() ([]JenisPenghargaan, error) {
	var result []JenisPenghargaan
	query := `SELECT id_jns_penghargaan, nm_jns_penghargaan, expired_date, last_sync FROM ref.jenis_penghargaan WHERE expired_date IS NULL ORDER BY nm_jns_penghargaan`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisPenghargaan performs bulk upsert for jenisPenghargaan
func (r *repository) BulkUpsertJenisPenghargaan(data []SisterJenisPenghargaan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.jenis_penghargaan AS target
			USING (SELECT @p1 AS id_jns_penghargaan, @p2 AS nm_jns_penghargaan) AS source
			ON target.id_jns_penghargaan = source.id_jns_penghargaan
			WHEN MATCHED THEN
				UPDATE SET nm_jns_penghargaan = source.nm_jns_penghargaan,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_jns_penghargaan, nm_jns_penghargaan, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_jns_penghargaan, source.nm_jns_penghargaan, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert jenis_penghargaan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllJenisPekerjaan retrieves all active jenisPekerjaan records
func (r *repository) GetAllJenisPekerjaan() ([]JenisPekerjaan, error) {
	var result []JenisPekerjaan
	query := `SELECT id_pekerjaan, nm_pekerjaan, expired_date, last_sync FROM ref.pekerjaan WHERE expired_date IS NULL ORDER BY nm_pekerjaan`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertJenisPekerjaan performs bulk upsert for jenisPekerjaan
func (r *repository) BulkUpsertJenisPekerjaan(data []SisterJenisPekerjaan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.pekerjaan AS target
			USING (SELECT @p1 AS id_pekerjaan, @p2 AS nm_pekerjaan) AS source
			ON target.id_pekerjaan = source.id_pekerjaan
			WHEN MATCHED THEN
				UPDATE SET nm_pekerjaan = source.nm_pekerjaan,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_pekerjaan, nm_pekerjaan, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_pekerjaan, source.nm_pekerjaan, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert pekerjaan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// GetAllBidangPekerjaan retrieves all active bidangPekerjaan records
func (r *repository) GetAllBidangPekerjaan() ([]BidangPekerjaan, error) {
	var result []BidangPekerjaan
	query := `SELECT id_bid_kerja, nm_bid_kerja, expired_date, last_sync FROM ref.bidang_pekerjaan WHERE expired_date IS NULL ORDER BY nm_bid_kerja`
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsertBidangPekerjaan performs bulk upsert for bidangPekerjaan
func (r *repository) BulkUpsertBidangPekerjaan(data []SisterBidangPekerjaan, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := `
			MERGE ref.bidang_pekerjaan AS target
			USING (SELECT @p1 AS id_bid_kerja, @p2 AS nm_bid_kerja) AS source
			ON target.id_bid_kerja = source.id_bid_kerja
			WHEN MATCHED THEN
				UPDATE SET nm_bid_kerja = source.nm_bid_kerja,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE())
			WHEN NOT MATCHED THEN
				INSERT (id_bid_kerja, nm_bid_kerja, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync)
				VALUES (source.id_bid_kerja, source.nm_bid_kerja, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()));
		`
		_, err = tx.Exec(query, item.ID, item.Nama)
		if err != nil {
			return fmt.Errorf("failed to upsert bidang_pekerjaan %v: %w", item.ID, err)
		}
	}

	return tx.Commit()
}

// ==================== UNIT KERJA REPOSITORY METHODS ====================

// GetAllUnitKerja retrieves all unit kerja from database
func (r *repository) GetAllUnitKerja() ([]UnitKerja, error) {
	query := `
		SELECT
			s.id_sms,
			s.id_sp,
			s.id_jns_sms,
			COALESCE(j.nm_jns_sms, '') AS nama_jenis_sms,
			s.nm_lemb,
			s.kode_prodi,
			s.stat_prodi,
			s.tgl_berdiri,
			s.sk_selenggara,
			s.tgl_sk_selenggara,
			s.tmt_sk_selenggara,
			s.tst_sk_selenggara,
			s.sks_lulus,
			s.gelar_lulusan,
			s.id_jenj_didik,
			s.id_wil,
			s.id_fak_unila,
			s.id_jur_unila,
			s.id_jur,
			s.id_induk_sms,
			s.create_date,
			s.id_creator,
			s.last_update,
			s.id_updater,
			s.soft_delete,
			s.last_sync
		FROM pdrd.sms s
		LEFT JOIN ref.jenis_sms j ON s.id_jns_sms = j.id_jns_sms
		WHERE s.soft_delete = 0
		ORDER BY s.id_jns_sms ASC, s.nm_lemb ASC
	`

	var unitKerjaList []UnitKerja
	err := r.db.Select(&unitKerjaList, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return []UnitKerja{}, nil
		}
		return nil, fmt.Errorf("failed to fetch unit kerja: %w", err)
	}

	return unitKerjaList, nil
}

// CountAllUnitKerja counts all unit kerja without filter (for metadata)
func (r *repository) CountAllUnitKerja() (int, error) {
	query := `SELECT COUNT(*) FROM pdrd.sms WHERE soft_delete = 0`

	var count int
	err := r.db.Get(&count, query)
	if err != nil {
		return 0, fmt.Errorf("failed to count unit kerja: %w", err)
	}

	return count, nil
}

// GetUnitKerjaByID retrieves unit kerja by ID
func (r *repository) GetUnitKerjaByID(id string) (*UnitKerja, error) {
	query := `
		SELECT
			id_sms,
			id_sp,
			id_jns_sms,
			nm_lemb,
			kode_prodi,
			stat_prodi,
			tgl_berdiri,
			sk_selenggara,
			tgl_sk_selenggara,
			tmt_sk_selenggara,
			tst_sk_selenggara,
			sks_lulus,
			gelar_lulusan,
			id_jenj_didik,
			id_wil,
			id_fak_unila,
			id_jur_unila,
			id_jur,
			id_induk_sms,
			create_date,
			id_creator,
			last_update,
			id_updater,
			soft_delete,
			last_sync
		FROM pdrd.sms
		WHERE id_sms = @p1 AND soft_delete = 0
	`

	var unitKerja UnitKerja
	err := r.db.Get(&unitKerja, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get unit kerja: %w", err)
	}

	return &unitKerja, nil
}

// UpsertUnitKerja inserts or updates unit kerja
func (r *repository) UpsertUnitKerja(uk *UnitKerja) error {
	// Check if exists (ignore soft_delete status for existence check)
	checkQuery := `SELECT COUNT(*) FROM pdrd.sms WHERE id_sms = @p1`
	var count int
	err := r.db.QueryRow(checkQuery, uk.IDSMS).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing unit kerja: %w", err)
	}

	if count == 0 {
		// INSERT - Use NULLIF to handle empty strings for UUID fields ONLY
		query := `
			INSERT INTO pdrd.sms (
				id_sms, id_sp, id_jns_sms, nm_lemb, kode_prodi, stat_prodi,
				tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara,
				sks_lulus, gelar_lulusan, id_jenj_didik, id_wil, id_fungsi_lab, id_kel_usaha,
				id_fak_unila, id_jur_unila, id_jur, id_induk_sms,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6,
				@p7, @p8, @p9, @p10, @p11,
				@p12, @p13, @p14, @p15, @p16, @p17,
				NULLIF(@p18, ''), NULLIF(@p19, ''), @p20, NULLIF(@p21, ''),
				@p22, @p23, @p24, @p25, @p26, @p27
			)
		`

		// For INSERT, id_updater should be NULL (not the same as id_creator for sync)
		// Use NULLIF for UUID fields (id_fak_unila, id_jur_unila, id_induk_sms) to convert empty strings to NULL
		// Note: id_jur is VARCHAR(25) for numeric jurusan ID, not UUID
		_, err = r.db.Exec(query,
			uk.IDSMS, uk.IDSatuanPendidikan, uk.IDJenisSMS, uk.NamaLembaga, uk.KodeProdi, uk.StatusProdi,
			uk.TanggalBerdiri, uk.SKPenyelenggara, uk.TanggalSK, uk.TMT, uk.TST,
			uk.SKSLulus, uk.GelarLulusan, uk.IDJenjangDidik, uk.IDWilayah, uk.IDFungsiLab, uk.IDKelUsaha,
			uk.IDFakultasUnila, uk.IDJurusanUnila, uk.IDJurusan, uk.IDIndukSMS,
			uk.CreateDate, uk.IDCreator, uk.LastUpdate, nil, uk.SoftDelete, uk.LastSync,
		)
		if err != nil {
			return fmt.Errorf("failed to insert unit kerja: %w", err)
		}
	} else {
		// UPDATE - hanya update field dari API, jangan overwrite field yang sudah ada
		// Use NULLIF for UUID fields to handle empty strings
		query := `
			UPDATE pdrd.sms SET
				nm_lemb = @p1,
				kode_prodi = COALESCE(@p2, kode_prodi),
				stat_prodi = COALESCE(@p3, stat_prodi),
				tgl_berdiri = COALESCE(@p4, tgl_berdiri),
				sk_selenggara = COALESCE(@p5, sk_selenggara),
				tgl_sk_selenggara = COALESCE(@p6, tgl_sk_selenggara),
				tmt_sk_selenggara = COALESCE(@p7, tmt_sk_selenggara),
				tst_sk_selenggara = COALESCE(@p8, tst_sk_selenggara),
				sks_lulus = COALESCE(@p9, sks_lulus),
				gelar_lulusan = COALESCE(@p10, gelar_lulusan),
				id_jenj_didik = COALESCE(@p11, id_jenj_didik),
				id_wil = COALESCE(@p12, id_wil),
				id_fungsi_lab = @p13,
				id_kel_usaha = @p14,
				id_fak_unila = COALESCE(NULLIF(@p15, ''), id_fak_unila),
				id_jur_unila = COALESCE(NULLIF(@p16, ''), id_jur_unila),
				id_jur = COALESCE(@p17, id_jur),
				id_induk_sms = COALESCE(NULLIF(@p18, ''), id_induk_sms),
				last_update = @p19,
				id_updater = NULLIF(@p20, ''),
				last_sync = @p21,
				soft_delete = 0
			WHERE id_sms = @p22
		`

		_, err = r.db.Exec(query,
			uk.NamaLembaga, uk.KodeProdi, uk.StatusProdi,
			uk.TanggalBerdiri, uk.SKPenyelenggara, uk.TanggalSK, uk.TMT, uk.TST,
			uk.SKSLulus, uk.GelarLulusan, uk.IDJenjangDidik, uk.IDWilayah, uk.IDFungsiLab, uk.IDKelUsaha,
			uk.IDFakultasUnila, uk.IDJurusanUnila, uk.IDJurusan, uk.IDIndukSMS,
			uk.LastUpdate, uk.IDUpdater, uk.LastSync,
			uk.IDSMS,
		)
		if err != nil {
			return fmt.Errorf("failed to update unit kerja: %w", err)
		}
	}

	return nil
}

// GetUnitKerjaJenisUnit retrieves jenis unit of a unit kerja by its ID
func (r *repository) GetUnitKerjaJenisUnit(idSMS string) (*int, error) {
	query := `SELECT id_jns_sms FROM pdrd.sms WHERE id_sms = @p1 AND soft_delete = 0`

	var jenisUnit int
	err := r.db.Get(&jenisUnit, query, idSMS)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get jenis unit: %w", err)
	}

	return &jenisUnit, nil
}

// LookupJenjangPendidikan tries to lookup jenjang pendidikan ID from nama unit or gelar lulusan
func (r *repository) LookupJenjangPendidikan(namaUnit, gelarLulusan string) (*int, error) {
	// Try to match by name patterns (S1, S2, S3, D3, D4, etc)
	query := `
		SELECT TOP 1 id_jenj_didik
		FROM ref.jenjang_pendidikan
		WHERE @p1 LIKE '%' + nama_jenjang + '%'
		   OR @p2 LIKE kode_jenjang + '%'
		ORDER BY id_jenj_didik ASC
	`

	var idJenjang int
	err := r.db.Get(&idJenjang, query, namaUnit, gelarLulusan)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found, return nil (no error)
		}
		return nil, fmt.Errorf("failed to lookup jenjang pendidikan: %w", err)
	}

	return &idJenjang, nil
}

// UpdateFakultasHierarchy updates id_fak_unila for all Jurusan and Prodi
// This is a post-processing step after sync to ensure all units have correct fakultas reference
func (r *repository) UpdateFakultasHierarchy() error {
	// Step 1: Update Jurusan (id_jns_sms = 2)
	// Set id_fak_unila = id_induk_sms (karena induk jurusan pasti fakultas)
	queryJurusan := `
		UPDATE pdrd.sms
		SET id_fak_unila = id_induk_sms
		WHERE id_jns_sms = 2
		  AND id_induk_sms IS NOT NULL
		  AND soft_delete = 0
	`

	_, err := r.db.Exec(queryJurusan)
	if err != nil {
		return fmt.Errorf("failed to update jurusan fakultas: %w", err)
	}

	// Step 2: Update Prodi yang induknya langsung Fakultas (id_jns_sms = 3)
	queryProdiLangsung := `
		UPDATE pdrd.sms
		SET id_fak_unila = id_induk_sms
		WHERE id_jns_sms = 3
		  AND id_induk_sms IS NOT NULL
		  AND soft_delete = 0
		  AND EXISTS (
			  SELECT 1 FROM pdrd.sms AS parent
			  WHERE parent.id_sms = pdrd.sms.id_induk_sms
			    AND parent.id_jns_sms = 1
			    AND parent.soft_delete = 0
		  )
	`

	_, err = r.db.Exec(queryProdiLangsung)
	if err != nil {
		return fmt.Errorf("failed to update prodi with fakultas parent: %w", err)
	}

	// Step 3: Update Prodi yang induknya Jurusan (trace ke fakultas)
	queryProdiViaJurusan := `
		UPDATE prodi
		SET prodi.id_fak_unila = jurusan.id_fak_unila,
		    prodi.id_jur_unila = prodi.id_induk_sms
		FROM pdrd.sms AS prodi
		INNER JOIN pdrd.sms AS jurusan
		  ON jurusan.id_sms = prodi.id_induk_sms
		  AND jurusan.id_jns_sms = 2
		  AND jurusan.soft_delete = 0
		WHERE prodi.id_jns_sms = 3
		  AND prodi.id_induk_sms IS NOT NULL
		  AND prodi.soft_delete = 0
		  AND jurusan.id_fak_unila IS NOT NULL
	`

	_, err = r.db.Exec(queryProdiViaJurusan)
	if err != nil {
		return fmt.Errorf("failed to update prodi with jurusan parent: %w", err)
	}

	return nil
}
