package kerjasama

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository — pdut.kerjasama queries via sqlx.
// DB di-share dengan service lain (siakadu, radius, dst).
type Repository interface {
	// Read
	GetMouList(ctx context.Context, page, limit int, search string) (items []MouListItem, total int, err error)
	GetMouStats(ctx context.Context) (*MouStats, error)
	GetMouByID(ctx context.Context, id string) (*MoU, error)
	GetSmsByKodeProdi(ctx context.Context, kodeProdi string) (idSms string, err error)
	GetFakultasByName(ctx context.Context, namaPendek string) (idSms string, err error)

	// Upsert kerjasama
	UpsertMou(ctx context.Context, mou *MoU) error
	UpsertDudi(ctx context.Context, dudi *DUDI) error
	GetDudiBySikermaID(ctx context.Context, sikermaID int) (*DUDI, error)
	LinkSmsKerjasama(ctx context.Context, idMou, idSms string, idKriteriaMitra *int) error

	// Unit mapping (audit + manual override)
	UpsertUnitMapping(ctx context.Context, m *UnitMapping) error
	GetUnitMappingList(ctx context.Context, page, limit int, search, strategy string) (items []UnitMapping, total int, err error)
	GetUnitMappingStats(ctx context.Context) (*UnitMappingStats, error)
	UpdateUnitMappingManual(ctx context.Context, sikermaUnitID int, idSms *string, notes *string) error
}

type repository struct {
	db *sqlx.DB
}

// NewRepository — constructor
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// =============================================================================
// READ — listing + stats untuk frontend
// =============================================================================

// GetMouList — paginated MoU table buat tampil di frontend.
func (r *repository) GetMouList(ctx context.Context, page, limit int, search string) ([]MouListItem, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit

	args := []any{}
	whereClause := "WHERE m.soft_delete = 0"
	if search != "" {
		whereClause += " AND (m.judul_mou LIKE @p1 OR m.nm_dudi LIKE @p1 OR m.sk_mou LIKE @p1)"
		args = append(args, "%"+search+"%")
	}

	// Count total
	var total int
	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM kerjasama.mou m %s", whereClause)
	if err := r.db.GetContext(ctx, &total, countSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("count mou: %w", err)
	}

	// List
	listSQL := fmt.Sprintf(`
		SELECT
			CAST(m.id_mou AS VARCHAR(36))   AS id_mou,
			m.id_sikerma,
			m.id_jenis_dokumen,
			m.sk_mou,
			m.judul_mou,
			m.nm_dudi,
			CONVERT(VARCHAR(10), m.tgl_mulai, 23)   AS tgl_mulai,
			CONVERT(VARCHAR(10), m.tgl_selesai, 23) AS tgl_selesai,
			CONVERT(VARCHAR(19), m.last_sync, 120)  AS last_sync
		FROM kerjasama.mou m
		%s
		ORDER BY m.tgl_mulai DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, len(args)+1, len(args)+2)
	args = append(args, offset, limit)

	var items []MouListItem
	if err := r.db.SelectContext(ctx, &items, listSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("list mou: %w", err)
	}
	return items, total, nil
}

// GetMouStats — total + aktif + expired + total mitra.
func (r *repository) GetMouStats(ctx context.Context) (*MouStats, error) {
	row := struct {
		TotalMou     int     `db:"total_mou"`
		TotalAktif   int     `db:"total_aktif"`
		TotalExpired int     `db:"total_expired"`
		TotalMitra   int     `db:"total_mitra"`
		LastSync     *string `db:"last_sync"`
	}{}

	err := r.db.GetContext(ctx, &row, `
		SELECT
			(SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete = 0)                                                                AS total_mou,
			(SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete = 0 AND (tgl_selesai IS NULL OR tgl_selesai >= CAST(GETDATE() AS DATE))) AS total_aktif,
			(SELECT COUNT(*) FROM kerjasama.mou WHERE soft_delete = 0 AND tgl_selesai < CAST(GETDATE() AS DATE))                       AS total_expired,
			(SELECT COUNT(DISTINCT id_dudi) FROM kerjasama.mou WHERE soft_delete = 0 AND id_dudi IS NOT NULL)                          AS total_mitra,
			CONVERT(VARCHAR(19), (SELECT MAX(last_sync) FROM kerjasama.mou WHERE soft_delete = 0), 120)                                AS last_sync
	`)
	if err != nil {
		return nil, fmt.Errorf("mou stats: %w", err)
	}
	return &MouStats{
		TotalMou:     row.TotalMou,
		TotalAktif:   row.TotalAktif,
		TotalExpired: row.TotalExpired,
		TotalMitra:   row.TotalMitra,
		LastSync:     row.LastSync,
	}, nil
}

// GetMouByID — detail satu MoU.
func (r *repository) GetMouByID(ctx context.Context, id string) (*MoU, error) {
	var m MoU
	err := r.db.GetContext(ctx, &m, `
		SELECT
			CAST(id_mou AS VARCHAR(36))  AS id_mou,
			CAST(id_sp  AS VARCHAR(36))  AS id_sp,
			id_akt_kerjasama, CAST(id_dudi AS VARCHAR(36)) AS id_dudi,
			sk_mou, judul_mou, uraian_mou, tgl_mulai, tgl_selesai,
			nm_dudi, npwp_dudi, nm_bu, tel_kantor, fax, cp, tel_cp, jab_cp,
			id_sikerma, id_jenis_dokumen,
			create_date, last_update, soft_delete, last_sync
		FROM kerjasama.mou
		WHERE id_mou = @p1 AND soft_delete = 0
	`, id)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// =============================================================================
// MAPPING helpers (kode_unit SIKERMA → pdrd.sms id_sms)
// =============================================================================

// GetSmsByKodeProdi — lookup id_sms dari pdrd.sms by kode_prodi (5-digit dikti).
// SIKERMA kode_unit prodi pakai 5-digit kode_dikti yang sama dengan pdrd.sms.kode_prodi.
func (r *repository) GetSmsByKodeProdi(ctx context.Context, kodeProdi string) (string, error) {
	var idSms string
	err := r.db.GetContext(ctx, &idSms, `
		SELECT TOP 1 CAST(id_sms AS VARCHAR(36))
		FROM pdrd.sms
		WHERE kode_prodi = @p1 AND id_jns_sms = 3 AND soft_delete = 0
	`, kodeProdi)
	if err != nil {
		return "", err
	}
	return idSms, nil
}

// GetFakultasByName — lookup fakultas (id_jns_sms=1) by partial nama_lemb match.
// SIKERMA "FK" / "FT" / "FEB" mapping ke nama lengkap fakultas Unila.
func (r *repository) GetFakultasByName(ctx context.Context, namaPendek string) (string, error) {
	// Pattern map SIKERMA singkatan → keyword di pdrd.sms.nm_lemb
	keywordMap := map[string]string{
		"FK":         "Kedokteran",
		"FT":         "Teknik",
		"FP":         "Pertanian",
		"FH":         "Hukum",
		"FEB":        "Ekonomi",
		"FKIP":       "Keguruan",
		"FISIP":      "Sosial",
		"MIPA":       "Matematika",
		"Pascasarjana": "Pascasarjana",
	}
	keyword, ok := keywordMap[namaPendek]
	if !ok {
		return "", fmt.Errorf("nama_pendek '%s' belum dimapping", namaPendek)
	}

	var idSms string
	err := r.db.GetContext(ctx, &idSms, `
		SELECT TOP 1 CAST(id_sms AS VARCHAR(36))
		FROM pdrd.sms
		WHERE id_jns_sms = 1
		  AND soft_delete = 0
		  AND nm_lemb LIKE '%' + @p1 + '%'
	`, keyword)
	return idSms, err
}

// =============================================================================
// UPSERT — write to pdut
// =============================================================================

// UpsertMou — insert atau update kerjasama.mou.
// Idempotent by id_sikerma.
//
// kerjasama.mou NOT NULL columns yang tidak diisi PDDikti dari SIKERMA:
//   - id_sp          uniqueidentifier  → UNILA_ID_SP
//   - sk_mou         varchar(80)       → fallback "-"
//   - judul_mou      varchar(500)      → fallback "(tanpa judul)"
//   - tgl_mulai      date              → fallback hari ini
//   - tgl_selesai    date              → fallback hari ini
//   - nm_bu          varchar(50)       → fallback "-"
//   - id_creator     uniqueidentifier  → system user UUID
//
// Plus VARCHAR truncation untuk kolom yang lebih pendek dari payload SIKERMA:
//   - sk_mou (80), nm_dudi (300), cp (100), jab_cp (40)
func (r *repository) UpsertMou(ctx context.Context, mou *MoU) error {
	const (
		unilaIDSp       = "E2B705A7-173E-464A-9FAC-509128709515"   // UNILA SP UUID
		systemIDCreator = "26004417-6E92-463C-BF35-F741817121DC"   // system user
	)

	// Sanitize fields ke ukuran kolom DB untuk hindari "String or binary data
	// would be truncated". Mou yang gagal dengan id_sikerma stale tidak akan
	// dimasukkan diam-diam — kita potong sesuai limit dan biarkan SIKERMA tetap
	// jadi source-of-truth.
	skMou := "-"
	if mou.SkMou != nil && *mou.SkMou != "" {
		skMou = truncate(*mou.SkMou, 80)
	}
	judulMou := "(tanpa judul)"
	if mou.JudulMou != nil && *mou.JudulMou != "" {
		judulMou = truncate(*mou.JudulMou, 500)
	}
	var nmDudi *string
	if mou.NmDudi != nil {
		v := truncate(*mou.NmDudi, 300)
		nmDudi = &v
	}
	var cp *string
	if mou.Cp != nil {
		v := truncate(*mou.Cp, 100)
		cp = &v
	}
	var jabCp *string
	if mou.JabCp != nil {
		v := truncate(*mou.JabCp, 40)
		jabCp = &v
	}

	tglMulai := mou.TglMulai
	tglSelesai := mou.TglSelesai
	if tglMulai == nil || tglMulai.IsZero() {
		now := time.Now()
		tglMulai = &now
	}
	if tglSelesai == nil || tglSelesai.IsZero() {
		now := time.Now()
		tglSelesai = &now
	}

	// Kalau id_sikerma di-set, cek apakah row dengan id_sikerma sudah ada.
	if mou.IDSikerma != nil {
		var existing string
		err := r.db.GetContext(ctx, &existing, `
			SELECT TOP 1 CAST(id_mou AS VARCHAR(36))
			FROM kerjasama.mou
			WHERE id_sikerma = @p1 AND soft_delete = 0
		`, *mou.IDSikerma)
		if err == nil && existing != "" {
			_, err = r.db.ExecContext(ctx, `
				UPDATE kerjasama.mou
				SET sk_mou = @p2, judul_mou = @p3, tgl_mulai = @p4, tgl_selesai = @p5,
				    nm_dudi = @p6, cp = @p7, jab_cp = @p8, id_jenis_dokumen = @p9,
				    id_dudi = @p10, last_update = GETDATE(), last_sync = GETDATE()
				WHERE id_mou = @p1
			`, existing, skMou, judulMou, tglMulai, tglSelesai,
				nmDudi, cp, jabCp, mou.IDJenisDokumen, mou.IDDudi)
			if err != nil {
				return fmt.Errorf("update mou: %w", err)
			}
			mou.IDMou = existing
			return nil
		}
	}

	// INSERT new — supply id_sp, nm_bu, id_creator agar lolos NOT NULL.
	row := r.db.QueryRowxContext(ctx, `
		INSERT INTO kerjasama.mou
			(id_mou, id_sp, id_sikerma, id_jenis_dokumen, sk_mou, judul_mou,
			 tgl_mulai, tgl_selesai, nm_dudi, nm_bu, cp, jab_cp, id_dudi,
			 id_creator, create_date, last_update, soft_delete, last_sync)
		OUTPUT CAST(INSERTED.id_mou AS VARCHAR(36))
		VALUES
			(NEWID(), @p1, @p2, @p3, @p4, @p5,
			 @p6, @p7, @p8, '-', @p9, @p10, @p11,
			 @p12, GETDATE(), GETDATE(), 0, GETDATE())
	`, unilaIDSp, mou.IDSikerma, mou.IDJenisDokumen, skMou, judulMou,
		tglMulai, tglSelesai, nmDudi, cp, jabCp, mou.IDDudi, systemIDCreator)
	if err := row.Scan(&mou.IDMou); err != nil {
		return fmt.Errorf("insert mou: %w", err)
	}
	return nil
}

// truncate — slice string to max bytes (safe for ASCII; for UTF-8 multibyte,
// avoid splitting mid-rune by trimming to last full rune boundary).
func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	// Walk back to nearest rune start to avoid breaking multi-byte char.
	cut := max
	for cut > 0 && (s[cut]&0xC0) == 0x80 {
		cut--
	}
	return s[:cut]
}

// UpsertDudi — insert atau update pdrd.dudi by id_sikerma (mitra).
//
// pdrd.dudi punya beberapa kolom NOT NULL tanpa default:
//   - nm_lemb varchar(100) NOT NULL (nama lembaga mitra)
//   - id_wil  char(8)      NOT NULL (kode wilayah PDDikti)
//   - id_bu   char(10)     NOT NULL (kode bidang usaha PDDikti)
//   - id_creator uniqueidentifier NOT NULL
//   - create_date / last_update datetime NOT NULL
//
// Karena SIKERMA tidak menyediakan id_wil/id_bu per mitra, pakai default
// "Lainnya" supaya idempotent insert tidak gagal. Admin bisa edit later.
func (r *repository) UpsertDudi(ctx context.Context, dudi *DUDI) error {
	if dudi.IDSikerma == nil {
		return fmt.Errorf("dudi.IDSikerma required for upsert")
	}

	const (
		defaultIDWil     = "126000"                                 // Kota Bandar Lampung (placeholder)
		defaultIDBu      = "9999999999"                             // ref.bidang_usaha "Lainnya"
		systemIDCreator  = "26004417-6E92-463C-BF35-F741817121DC"   // system user (Unila baseline)
	)

	// nm_lemb NOT NULL — fallback ke "(unnamed)" kalau payload kosong.
	nmLemb := "(unnamed)"
	if dudi.NmDudi != nil && *dudi.NmDudi != "" {
		nmLemb = *dudi.NmDudi
		// pdrd.dudi.nm_lemb is varchar(100) — truncate.
		if len(nmLemb) > 100 {
			nmLemb = nmLemb[:100]
		}
	}

	var existing string
	err := r.db.GetContext(ctx, &existing, `
		SELECT TOP 1 CAST(id_dudi AS VARCHAR(36))
		FROM pdrd.dudi
		WHERE id_sikerma = @p1 AND soft_delete = 0
	`, *dudi.IDSikerma)
	if err == nil && existing != "" {
		_, err = r.db.ExecContext(ctx, `
			UPDATE pdrd.dudi SET nm_lemb = @p2, last_update = GETDATE(), last_sync = GETDATE()
			WHERE id_dudi = @p1
		`, existing, nmLemb)
		if err != nil {
			return fmt.Errorf("update dudi: %w", err)
		}
		dudi.IDDudi = existing
		return nil
	}

	// INSERT — generate new UUID, return ke caller via dudi.IDDudi
	row := r.db.QueryRowxContext(ctx, `
		INSERT INTO pdrd.dudi
			(id_dudi, nm_lemb, id_wil, id_bu, id_sikerma,
			 id_creator, create_date, last_update, last_sync, soft_delete)
		OUTPUT CAST(INSERTED.id_dudi AS VARCHAR(36))
		VALUES (NEWID(), @p1, @p2, @p3, @p4,
		        @p5, GETDATE(), GETDATE(), GETDATE(), 0)
	`, nmLemb, defaultIDWil, defaultIDBu, *dudi.IDSikerma, systemIDCreator)
	if err := row.Scan(&dudi.IDDudi); err != nil {
		return fmt.Errorf("insert dudi: %w", err)
	}
	return nil
}

// GetDudiBySikermaID — find existing dudi via SIKERMA mitra id.
func (r *repository) GetDudiBySikermaID(ctx context.Context, sikermaID int) (*DUDI, error) {
	var d DUDI
	err := r.db.GetContext(ctx, &d, `
		SELECT TOP 1
			CAST(id_dudi AS VARCHAR(36)) AS id_dudi,
			nm_dudi, id_sikerma
		FROM pdrd.dudi
		WHERE id_sikerma = @p1 AND soft_delete = 0
	`, sikermaID)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

// =============================================================================
// UNIT MAPPING — audit + manual override (kerjasama.unit_mapping)
// =============================================================================

// UpsertUnitMapping — record SIKERMA unit ke audit table.
// Strategy = "kode_prodi" / "fakultas" / "univ" / "unmapped".
// Kalau row sudah ada (by sikerma_unit_id) dan strategy lama "manual" + id_sms terisi,
// JANGAN overwrite (preserve admin manual override). Else update.
func (r *repository) UpsertUnitMapping(ctx context.Context, m *UnitMapping) error {
	// Check existing
	var existingStrategy *string
	var existingIdSms *string
	row := r.db.QueryRowxContext(ctx, `
		SELECT strategy, CAST(id_sms AS VARCHAR(36))
		FROM kerjasama.unit_mapping
		WHERE sikerma_unit_id = @p1 AND soft_delete = 0
	`, m.SikermaUnitID)
	err := row.Scan(&existingStrategy, &existingIdSms)
	if err == nil {
		// Existing row found — preserve manual override
		preserveManual := existingStrategy != nil && *existingStrategy == "manual" && existingIdSms != nil
		if preserveManual {
			// Cuma update last_check, jangan overwrite id_sms
			_, err = r.db.ExecContext(ctx, `
				UPDATE kerjasama.unit_mapping
				SET kode_unit = @p2, jenjang = @p3, unit_nama = @p4, nama_pendek = @p5,
				    last_check = GETDATE(), last_update = GETDATE()
				WHERE sikerma_unit_id = @p1
			`, m.SikermaUnitID, m.KodeUnit, m.Jenjang, m.UnitNama, m.NamaPendek)
			return err
		}
		// Else update full
		_, err = r.db.ExecContext(ctx, `
			UPDATE kerjasama.unit_mapping
			SET kode_unit = @p2, jenjang = @p3, unit_nama = @p4, nama_pendek = @p5,
			    id_sms = @p6, strategy = @p7,
			    last_check = GETDATE(), last_match = CASE WHEN @p6 IS NOT NULL THEN GETDATE() ELSE last_match END,
			    last_update = GETDATE()
			WHERE sikerma_unit_id = @p1
		`, m.SikermaUnitID, m.KodeUnit, m.Jenjang, m.UnitNama, m.NamaPendek, m.IDSms, m.Strategy)
		return err
	}

	// Insert new
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kerjasama.unit_mapping
			(id_unit_mapping, sikerma_unit_id, kode_unit, jenjang, unit_nama, nama_pendek,
			 id_sms, strategy, last_check, last_match, soft_delete)
		VALUES
			(NEWID(), @p1, @p2, @p3, @p4, @p5,
			 @p6, @p7, GETDATE(),
			 CASE WHEN @p6 IS NOT NULL THEN GETDATE() ELSE NULL END,
			 0)
	`, m.SikermaUnitID, m.KodeUnit, m.Jenjang, m.UnitNama, m.NamaPendek, m.IDSms, m.Strategy)
	return err
}

// GetUnitMappingList — list unit mapping dengan filter strategy/search.
func (r *repository) GetUnitMappingList(ctx context.Context, page, limit int, search, strategy string) ([]UnitMapping, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit

	args := []any{}
	where := "WHERE m.soft_delete = 0"
	if search != "" {
		where += fmt.Sprintf(" AND (m.unit_nama LIKE @p%d OR m.nama_pendek LIKE @p%d OR m.kode_unit LIKE @p%d)", len(args)+1, len(args)+1, len(args)+1)
		args = append(args, "%"+search+"%")
	}
	if strategy != "" {
		args = append(args, strategy)
		where += fmt.Sprintf(" AND m.strategy = @p%d", len(args))
	}

	// Count
	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM kerjasama.unit_mapping m "+where, args...); err != nil {
		return nil, 0, fmt.Errorf("count unit_mapping: %w", err)
	}

	// List with sms join for nm_sms
	args = append(args, offset, limit)
	listSQL := fmt.Sprintf(`
		SELECT
			CAST(m.id_unit_mapping AS VARCHAR(36)) AS id_unit_mapping,
			m.sikerma_unit_id,
			m.kode_unit,
			m.jenjang,
			m.unit_nama,
			m.nama_pendek,
			CAST(m.id_sms AS VARCHAR(36)) AS id_sms,
			s.nm_lemb AS nm_sms,
			m.strategy,
			m.notes,
			CONVERT(VARCHAR(19), m.last_check, 120) AS last_check,
			CONVERT(VARCHAR(19), m.last_match, 120) AS last_match
		FROM kerjasama.unit_mapping m
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		%s
		ORDER BY
			CASE WHEN m.id_sms IS NULL THEN 0 ELSE 1 END,  -- unmapped first
			m.sikerma_unit_id ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, where, len(args)-1, len(args))

	var items []UnitMapping
	if err := r.db.SelectContext(ctx, &items, listSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("list unit_mapping: %w", err)
	}
	return items, total, nil
}

// GetUnitMappingStats — total, mapped/unmapped, group by strategy.
func (r *repository) GetUnitMappingStats(ctx context.Context) (*UnitMappingStats, error) {
	var total, mapped int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM kerjasama.unit_mapping WHERE soft_delete = 0"); err != nil {
		return nil, err
	}
	if err := r.db.GetContext(ctx, &mapped, "SELECT COUNT(*) FROM kerjasama.unit_mapping WHERE soft_delete = 0 AND id_sms IS NOT NULL"); err != nil {
		return nil, err
	}

	// Group by strategy
	rows, err := r.db.QueryxContext(ctx, `
		SELECT ISNULL(strategy, 'unknown') AS strategy, COUNT(*) AS jml
		FROM kerjasama.unit_mapping WHERE soft_delete = 0
		GROUP BY strategy
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byStrategy := map[string]int{}
	for rows.Next() {
		var strategy string
		var jml int
		if err := rows.Scan(&strategy, &jml); err == nil {
			byStrategy[strategy] = jml
		}
	}
	return &UnitMappingStats{
		Total:      total,
		Mapped:     mapped,
		Unmapped:   total - mapped,
		ByStrategy: byStrategy,
	}, nil
}

// UpdateUnitMappingManual — admin override id_sms via frontend CRUD.
// Strategy auto-set ke "manual" supaya next sync tidak overwrite.
func (r *repository) UpdateUnitMappingManual(ctx context.Context, sikermaUnitID int, idSms *string, notes *string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE kerjasama.unit_mapping
		SET id_sms = @p2, notes = @p3, strategy = 'manual',
		    last_match = CASE WHEN @p2 IS NOT NULL THEN GETDATE() ELSE last_match END,
		    last_update = GETDATE()
		WHERE sikerma_unit_id = @p1 AND soft_delete = 0
	`, sikermaUnitID, idSms, notes)
	return err
}

// LinkSmsKerjasama — bridge mou ↔ sms (per prodi). Idempotent.
//
// kerjasama.sms_kerjasama NOT NULL columns:
//   - id_sms_kerjasama, id_sms, id_mou (struktur)
//   - id_creator, create_date, last_update, last_sync, soft_delete
func (r *repository) LinkSmsKerjasama(ctx context.Context, idMou, idSms string, idKriteriaMitra *int) error {
	// Skip kalau idSms kosong (univ-level kerjasama)
	if idSms == "" {
		return nil
	}

	const systemIDCreator = "26004417-6E92-463C-BF35-F741817121DC" // system user

	// Cek existing link dulu
	var existing int
	err := r.db.GetContext(ctx, &existing, `
		SELECT COUNT(*) FROM kerjasama.sms_kerjasama
		WHERE id_mou = @p1 AND id_sms = @p2 AND soft_delete = 0
	`, idMou, idSms)
	if err == nil && existing > 0 {
		return nil // already linked
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kerjasama.sms_kerjasama
			(id_sms_kerjasama, id_sms, id_mou, id_kriteria_mitra,
			 id_creator, create_date, last_update, last_sync, soft_delete)
		VALUES
			(NEWID(), @p1, @p2, @p3,
			 @p4, GETDATE(), GETDATE(), GETDATE(), 0)
	`, idSms, idMou, idKriteriaMitra, systemIDCreator)
	if err != nil {
		return fmt.Errorf("link sms_kerjasama: %w", err)
	}
	return nil
}
