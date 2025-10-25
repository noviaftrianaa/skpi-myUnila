package referensi

import (
	"context"
	"database/sql"
	"fmt"
	"log"

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
