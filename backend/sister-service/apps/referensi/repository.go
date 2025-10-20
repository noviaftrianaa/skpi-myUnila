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
	GetAllAgama(ctx context.Context) ([]Agama, error)
	GetAgamaByID(ctx context.Context, id int) (*Agama, error)
	UpsertAgama(ctx context.Context, agama *Agama) error
	BulkUpsertAgama(ctx context.Context, agamaList []Agama) error
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
				last_update = GETDATE(),
				last_sync = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (id_agama, a_ref_pddikti, a_ref_unila, nm_agama, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_agama, 0, 0, source.nm_agama, GETDATE(), GETDATE(), NULL, GETDATE());
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
				last_update = GETDATE(),
				last_sync = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (id_agama, a_ref_pddikti, a_ref_unila, nm_agama, create_date, last_update, expired_date, last_sync)
			VALUES (source.id_agama, 0, 0, source.nm_agama, GETDATE(), GETDATE(), NULL, GETDATE());
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
