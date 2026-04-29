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
	ListUnits(ctx context.Context, f *UnitListFilter) (*UnitListResult, error)
	GetUnitStats(ctx context.Context) (*UnitStats, error)
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

// UpsertUnit upserts a ref_unit record (extended fields supported via 01-extend-unit-pimpinan.sql).
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

	// Helper untuk parse numeric fields (sks_lulus_min, ipk_lulus_min)
	parseInt := func(key string) interface{} {
		s := getStringOrDefault(data, key, "")
		if s == "" {
			return nil
		}
		if v, ok := data[key].(float64); ok {
			return int(v)
		}
		var n int
		if _, err := fmt.Sscanf(s, "%d", &n); err == nil {
			return n
		}
		return nil
	}
	parseDecimal := func(key string) interface{} {
		s := getStringOrDefault(data, key, "")
		if s == "" {
			return nil
		}
		if v, ok := data[key].(float64); ok {
			return v
		}
		var f float64
		if _, err := fmt.Sscanf(s, "%f", &f); err == nil {
			return f
		}
		return nil
	}

	// Try UPDATE — include extended fields
	result, err := r.db.ExecContext(ctx, `
		UPDATE siakadu.ref_unit SET
			id_parent_unit = @p1,
			jns_unit       = @p2,
			nm_unit        = @p3,
			nm_singkat     = @p4,
			nm_uniten      = @p5,
			id_jenjang     = @p6,
			akreditasi     = @p7,
			sk_akreditasi  = @p8,
			sks_lulus_min  = @p9,
			gelar          = @p10,
			desk_gelar     = @p11,
			ipk_lulus_min  = @p12,
			is_aktif       = @p13,
			keterangan     = @p14,
			visi           = @p15,
			alamat         = @p16,
			telepon        = @p17,
			pimpinan_json  = ISNULL(@p18, pimpinan_json),
			last_update    = @p19
		WHERE id_unit = @p20`,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "nm_uniten"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "sk_akreditasi"),
		parseInt("sks_lulus_min"),
		getString(data, "gelar"),
		getString(data, "desk_gelar"),
		parseDecimal("ipk_lulus_min"),
		getString(data, "is_aktif"),
		getString(data, "keterangan"),
		getString(data, "visi"),
		getString(data, "alamat"),
		getString(data, "telepon"),
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

	// INSERT — extended fields
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO siakadu.ref_unit
			(id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, nm_uniten,
			 id_jenjang, akreditasi, sk_akreditasi, sks_lulus_min,
			 gelar, desk_gelar, ipk_lulus_min, is_aktif,
			 keterangan, visi, alamat, telepon,
			 pimpinan_json, last_update)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6,
		        @p7, @p8, @p9, @p10,
		        @p11, @p12, @p13, @p14,
		        @p15, @p16, @p17, @p18,
		        @p19, @p20)`,
		idUnit,
		getString(data, "id_parent_unit"),
		getStringOrDefault(data, "jns_unit", "P"),
		getString(data, "nm_unit"),
		getString(data, "nm_singkat"),
		getString(data, "nm_uniten"),
		getString(data, "id_jenjang"),
		getString(data, "akreditasi"),
		getString(data, "sk_akreditasi"),
		parseInt("sks_lulus_min"),
		getString(data, "gelar"),
		getString(data, "desk_gelar"),
		parseDecimal("ipk_lulus_min"),
		getString(data, "is_aktif"),
		getString(data, "keterangan"),
		getString(data, "visi"),
		getString(data, "alamat"),
		getString(data, "telepon"),
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

		// Existing schema: id_pimpinan UUID PK + nama + jabatan + peran (added) +
		// nip + id_sdm + tgl_mulai + tgl_selesai + create_date + last_update + last_sync.
		// Set jabatan=peran (best-effort — peran lebih akurat dari sample API).
		_, err = r.db.ExecContext(ctx, `
			INSERT INTO siakadu.pimpinan_unit
				(id_pimpinan, id_unit, nip, nama, jabatan, peran, id_sdm,
				 create_date, last_update, last_sync)
			VALUES (NEWID(), @p1, @p2, @p3, @p4, @p4,
			        CASE WHEN @p5 = '' THEN NULL ELSE CONVERT(uniqueidentifier, @p5) END,
			        GETDATE(), GETDATE(), @p6)`,
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

// Full column list — match RefUnit struct fields after extension migration.
const refUnitColumns = `
	id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, nm_uniten,
	id_jenjang, akreditasi, sk_akreditasi, sks_lulus_min,
	gelar, desk_gelar, ipk_lulus_min, is_aktif, alamat, telepon,
	CAST(id_sms AS VARCHAR(36)) AS id_sms,
	pimpinan_json, last_update, last_sync
`

// GetProdiList returns all active prodi (jns_unit=P, is_aktif=1)
func (r *repository) GetProdiList(ctx context.Context) ([]RefUnit, error) {
	var units []RefUnit
	err := r.db.SelectContext(ctx, &units, `SELECT `+refUnitColumns+`
		FROM siakadu.ref_unit WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL) ORDER BY id_unit`)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi list: %w", err)
	}
	return units, nil
}

// ListUnits — paginated + filter by jns_unit/search/is_aktif
func (r *repository) ListUnits(ctx context.Context, f *UnitListFilter) (*UnitListResult, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Limit < 1 || f.Limit > 200 {
		f.Limit = 50
	}
	args := []any{}
	where := "1=1"
	if f.JnsUnit != "" {
		args = append(args, f.JnsUnit)
		where += fmt.Sprintf(" AND jns_unit = @p%d", len(args))
	}
	if f.IsAktif != "" {
		args = append(args, f.IsAktif)
		where += fmt.Sprintf(" AND is_aktif = @p%d", len(args))
	}
	if f.Search != "" {
		args = append(args, "%"+f.Search+"%")
		where += fmt.Sprintf(" AND (nm_unit LIKE @p%d OR nm_singkat LIKE @p%d OR id_unit LIKE @p%d)", len(args), len(args), len(args))
	}

	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM siakadu.ref_unit WHERE "+where, args...); err != nil {
		return nil, fmt.Errorf("count unit: %w", err)
	}

	offset := (f.Page - 1) * f.Limit
	args = append(args, offset, f.Limit)
	q := fmt.Sprintf(`SELECT `+refUnitColumns+`
		FROM siakadu.ref_unit WHERE %s
		ORDER BY jns_unit, id_unit
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, len(args)-1, len(args))

	var items []RefUnit
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, fmt.Errorf("select unit: %w", err)
	}
	return &UnitListResult{Items: items, Total: total, Page: f.Page, Limit: f.Limit}, nil
}

// GetUnitStats — agregate stats
func (r *repository) GetUnitStats(ctx context.Context) (*UnitStats, error) {
	var total, aktif, totalPimpinan int
	_ = r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM siakadu.ref_unit")
	_ = r.db.GetContext(ctx, &aktif, "SELECT COUNT(*) FROM siakadu.ref_unit WHERE is_aktif = '1'")
	_ = r.db.GetContext(ctx, &totalPimpinan, "SELECT COUNT(*) FROM siakadu.pimpinan_unit")

	rows, err := r.db.QueryxContext(ctx, `
		SELECT jns_unit, COUNT(*) AS jml FROM siakadu.ref_unit
		GROUP BY jns_unit ORDER BY jml DESC
	`)
	byJenis := []map[string]interface{}{}
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var j string
			var n int
			if err := rows.Scan(&j, &n); err == nil {
				byJenis = append(byJenis, map[string]interface{}{"jns_unit": j, "jml": n})
			}
		}
	}

	var lastSync *string
	row := r.db.QueryRowxContext(ctx, "SELECT TOP 1 CONVERT(VARCHAR(19), MAX(last_sync), 120) FROM siakadu.ref_unit WHERE last_sync IS NOT NULL")
	var ls *string
	_ = row.Scan(&ls)
	lastSync = ls

	return &UnitStats{
		Total:         total,
		Aktif:         aktif,
		ByJenis:       byJenis,
		TotalPimpinan: totalPimpinan,
		LastSync:      lastSync,
	}, nil
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
