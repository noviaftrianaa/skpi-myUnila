package referensi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	EnsureSchema(ctx context.Context) error
	UpsertUnit(ctx context.Context, data map[string]interface{}) (bool, error)
	UpsertPimpinan(ctx context.Context, idUnit string, pimpinanList []interface{}) error
	GetProdiList(ctx context.Context) ([]RefUnit, error)
	GetPimpinanByUnit(ctx context.Context, idUnit string) ([]PimpinanUnit, error)
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

// EnsureSchema creates pimpinan_unit table and adds pimpinan_json column to ref_unit
func (r *repository) EnsureSchema(ctx context.Context) error {
	log.Printf("🔧 [Referensi] Ensuring pimpinan schema...")

	// 1. Create pimpinan_unit table
	createTable := `
		IF NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
			WHERE s.name = 'siakadu' AND t.name = 'pimpinan_unit')
		BEGIN
			CREATE TABLE siakadu.pimpinan_unit (
				id_unit    varchar(20)          NOT NULL,
				nip        varchar(30)          NOT NULL,
				nama       nvarchar(200)        NULL,
				peran      varchar(30)          NOT NULL,
				id_sdm     uniqueidentifier     NULL,
				last_sync  datetime             NOT NULL DEFAULT GETDATE(),
				CONSTRAINT pk_pimpinan_unit PRIMARY KEY (id_unit, nip, peran)
			)
			CREATE INDEX idx_pimpinan_unit_nip ON siakadu.pimpinan_unit (nip)
			CREATE INDEX idx_pimpinan_unit_id_sdm ON siakadu.pimpinan_unit (id_sdm) WHERE id_sdm IS NOT NULL
			PRINT 'Created siakadu.pimpinan_unit table'
		END
	`
	if _, err := r.db.ExecContext(ctx, createTable); err != nil {
		log.Printf("⚠️  [Referensi] Create pimpinan_unit: %v", err)
	}

	// 2. Add pimpinan_json column to ref_unit (convenience column for fast reads)
	addCol := `
		IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'pimpinan_json')
		ALTER TABLE siakadu.ref_unit ADD pimpinan_json nvarchar(max) NULL
	`
	if _, err := r.db.ExecContext(ctx, addCol); err != nil {
		log.Printf("⚠️  [Referensi] Add pimpinan_json column: %v", err)
	}

	log.Printf("✅ [Referensi] Pimpinan schema ensured")
	return nil
}

// UpsertUnit upserts a ref_unit record
func (r *repository) UpsertUnit(ctx context.Context, data map[string]interface{}) (bool, error) {
	idUnit := getString(data, "id_unit")
	if idUnit == nil || *idUnit == "" {
		return false, fmt.Errorf("id_unit is required")
	}

	now := time.Now()

	// Build pimpinan JSON from array if present
	var pimpinanJSON *string
	if pimpinanRaw, ok := data["pimpinan"]; ok && pimpinanRaw != nil {
		if pArr, ok := pimpinanRaw.([]interface{}); ok && len(pArr) > 0 {
			jsonBytes, err := json.Marshal(pArr)
			if err == nil {
				s := string(jsonBytes)
				pimpinanJSON = &s
			}
		}
	}

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
			pimpinan_json = ISNULL(@p8, pimpinan_json),
			last_update = @p9
		WHERE id_unit = @p10`,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "is_aktif"),
		pimpinanJSON,
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
		INSERT INTO siakadu.ref_unit (id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, pimpinan_json, last_update)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10)`,
		idUnit,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "is_aktif"),
		pimpinanJSON,
		now,
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert ref_unit: %w", err)
	}
	return true, nil
}

// UpsertPimpinan syncs pimpinan for a unit — delete old + insert new, resolves nip→id_sdm
func (r *repository) UpsertPimpinan(ctx context.Context, idUnit string, pimpinanList []interface{}) error {
	now := time.Now()

	// Delete existing pimpinan for this unit
	_, _ = r.db.ExecContext(ctx, "DELETE FROM siakadu.pimpinan_unit WHERE id_unit = @p1", idUnit)

	for _, pRaw := range pimpinanList {
		p, ok := pRaw.(map[string]interface{})
		if !ok {
			continue
		}

		nip := getStringOrDefault(p, "nip", "")
		if nip == "" {
			continue
		}
		nama := getStringOrDefault(p, "nama", "")
		peran := getStringOrDefault(p, "peran", "")
		if peran == "" {
			peran = getStringOrDefault(p, "role", "")
		}

		// Resolve nip → id_sdm via mapping_pegawai
		var idSdm *string
		var sdmUUID string
		err := r.db.GetContext(ctx, &sdmUUID,
			"SELECT CAST(id_sdm AS VARCHAR(36)) FROM siakadu.mapping_pegawai WHERE nip = @p1", nip)
		if err == nil && sdmUUID != "" {
			idSdm = &sdmUUID
		}

		_, err = r.db.ExecContext(ctx, `
			INSERT INTO siakadu.pimpinan_unit (id_unit, nip, nama, peran, id_sdm, last_sync)
			VALUES (@p1, @p2, @p3, @p4, CASE WHEN @p5 = '' THEN NULL ELSE CONVERT(uniqueidentifier, @p5) END, @p6)`,
			idUnit, nip, nama, peran,
			func() string {
				if idSdm != nil {
					return *idSdm
				}
				return ""
			}(),
			now,
		)
		if err != nil {
			log.Printf("⚠️  [Pimpinan] Insert failed for %s/%s: %v", idUnit, nip, err)
		}
	}

	return nil
}

// GetProdiList returns all active prodi (jns_unit=P, is_aktif=1)
func (r *repository) GetProdiList(ctx context.Context) ([]RefUnit, error) {
	var units []RefUnit
	err := r.db.SelectContext(ctx, &units,
		`SELECT id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, pimpinan_json, last_update
		FROM siakadu.ref_unit WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL) ORDER BY id_unit`)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	return units, nil
}

// GetPimpinanByUnit returns pimpinan for a specific unit
func (r *repository) GetPimpinanByUnit(ctx context.Context, idUnit string) ([]PimpinanUnit, error) {
	var list []PimpinanUnit
	err := r.db.SelectContext(ctx, &list,
		`SELECT id_unit, nip, nama, peran, CAST(id_sdm AS VARCHAR(36)) AS id_sdm
		FROM siakadu.pimpinan_unit WHERE id_unit = @p1
		ORDER BY CASE peran
			WHEN 'Ketua' THEN 0 WHEN 'Sekretaris' THEN 1
			WHEN 'Wakil 1' THEN 2 WHEN 'Wakil 2' THEN 3
			WHEN 'Wakil 3' THEN 4 WHEN 'Wakil 4' THEN 5
			ELSE 9 END`, idUnit)
	if err != nil {
		return nil, fmt.Errorf("failed to get pimpinan: %w", err)
	}
	return list, nil
}
