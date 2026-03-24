package referensi

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	UpsertUnit(ctx context.Context, data map[string]interface{}) (bool, error)
	GetProdiList(ctx context.Context) ([]RefUnit, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

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

func getStringOrDefault(data map[string]interface{}, key, def string) string {
	v := getString(data, key)
	if v == nil {
		return def
	}
	return *v
}

// UpsertUnit upserts a ref_unit record
func (r *repository) UpsertUnit(ctx context.Context, data map[string]interface{}) (bool, error) {
	idUnit := getString(data, "id_unit")
	if idUnit == nil || *idUnit == "" {
		return false, fmt.Errorf("id_unit is required")
	}

	now := time.Now()

	// Try UPDATE
	result, err := r.db.ExecContext(ctx, `
		UPDATE siakadu.ref_unit SET
			id_parent_unit = @p1,
			jns_unit = @p2,
			nm_unit = @p3,
			nm_singkat = @p4,
			id_jenjang = @p5,
			akreditasi = @p6,
			is_aktif = @p7,
			last_update = @p8
		WHERE id_unit = @p9`,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "is_aktif"),
		now,
		idUnit,
	)
	if err != nil {
		return false, fmt.Errorf("failed to update ref_unit: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows > 0 {
		return false, nil
	}

	// INSERT
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.ref_unit (id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, last_update)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9)`,
		idUnit,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "is_aktif"),
		now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert ref_unit: %w", err)
	}
	return true, nil
}

// GetProdiList returns all active prodi (jns_unit=P, is_aktif=1)
func (r *repository) GetProdiList(ctx context.Context) ([]RefUnit, error) {
	var units []RefUnit
	err := r.db.SelectContext(ctx, &units,
		"SELECT id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, last_update FROM siakadu.ref_unit WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL) ORDER BY id_unit")
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	return units, nil
}
