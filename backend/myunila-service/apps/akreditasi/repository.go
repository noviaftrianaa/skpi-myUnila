package akreditasi

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Pdrd reference reads
	ListProdi(ctx context.Context) ([]ProdiPdrd, error)
	ListAkreditasiAktif(ctx context.Context) ([]AkreditasiCurrent, error)

	// Public listing (untuk halaman /akreditasi)
	ListAkreditasi(ctx context.Context, p AkreditasiListParams) ([]AkreditasiRow, int64, error)

	// Sync log
	InsertSyncLog(ctx context.Context, l SyncLogRow) (string, error)
	UpdateSyncLogFinish(ctx context.Context, idLog string, r SyncResult) error
	InsertSyncLogDetails(ctx context.Context, idLog string, details []SyncLogDetail) error
	ListSyncLogs(ctx context.Context, limit, offset int) ([]SyncLogRow, int64, error)
	GetSyncLogDetails(ctx context.Context, idLog string, action string) ([]SyncLogDetail, error)
	GetSyncLog(ctx context.Context, idLog string) (*SyncLogRow, error)

	// Apply changes ke pdrd.akreditasi_prodi
	UpsertAkreditasi(ctx context.Context, idSms string, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time, asalData string) (action string, oldRow *AkreditasiCurrent, err error)

	// Mapping Unit CRUD (siakadu.mapping_unit)
	ListMappingUnit(ctx context.Context, p MappingUnitListParams) ([]MappingUnitRow, int64, error)
	GetMappingUnit(ctx context.Context, kodeSiakad string) (*MappingUnitRow, error)
	UpsertMappingUnit(ctx context.Context, req MappingUnitUpsertReq) error
	DeleteMappingUnit(ctx context.Context, kodeSiakad string) error
	MappingUnitStats(ctx context.Context) (mapped, unmapped, broken int, err error)

	// Manual akreditasi (untuk halaman Mapping Unit)
	DeactivateAkreditasi(ctx context.Context, idSms string) error
	RefAkreditasi(ctx context.Context) ([]RefRow, []RefRow, error)
	GetLatestUnmatched(ctx context.Context) ([]UnmatchedRow, error)

	// Alias BAN-PT name → pdrd.sms.id_sms (admin manual mapping)
	UpsertProdiAlias(ctx context.Context, nmProdiBanpt, jenjangBanpt, idSms string) error
	ListProdiAlias(ctx context.Context) (map[string]string, error) // key="nm|jenjang" lower → idSms
}

type repo struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repo{db: db} }

// ============================================================================
// Reads
// ============================================================================

func (r *repo) ListProdi(ctx context.Context) ([]ProdiPdrd, error) {
	// Hanya Program Studi (id_jns_sms=3) yang aktif + ber-fakultas — selaras
	// dengan filter ListAkreditasi. Jurusan/Lab/UPT tidak ada akreditasi BAN-PT.
	q := `
		SELECT CAST(s.id_sms AS VARCHAR(36)) AS id_sms,
		       s.nm_lemb, s.id_jenj_didik, jp.nm_jenj_didik, s.kode_prodi
		FROM pdrd.sms s
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		WHERE s.soft_delete = 0 AND s.stat_prodi = 'A'
		  AND s.id_fak_unila IS NOT NULL
		  AND s.id_jns_sms = 3
	`
	var out []ProdiPdrd
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *repo) ListAkreditasiAktif(ctx context.Context) ([]AkreditasiCurrent, error) {
	// Beberapa prodi punya >1 row a_aktif=1 (dirty data warisan SISTER seeding).
	// Pakai ROW_NUMBER untuk pilih row terbaru per id_sms (tgl_sk desc, then
	// last_update desc) supaya akredBySms map deterministik di service.Sync.
	q := `
		WITH RankedAkred AS (
			SELECT id_akreditasi_prodi, id_sms, id_lemb_akred, id_akred,
			       sk_akreditasi_prodi, tanggal_sk_akreditasi_prodi, tst_sk_akreditasi_prodi,
			       asal_data,
			       ROW_NUMBER() OVER (PARTITION BY id_sms
			                          ORDER BY ISNULL(tanggal_sk_akreditasi_prodi, '1900-01-01') DESC,
			                                   ISNULL(last_update, '1900-01-01') DESC) AS rn
			FROM pdrd.akreditasi_prodi
			WHERE a_aktif = 1 AND soft_delete = 0
		)
		SELECT CAST(a.id_akreditasi_prodi AS VARCHAR(36)) AS id_akreditasi_prodi,
		       CAST(a.id_sms AS VARCHAR(36)) AS id_sms,
		       a.id_lemb_akred, a.id_akred,
		       na.nm_akred,
		       a.sk_akreditasi_prodi, a.tanggal_sk_akreditasi_prodi, a.tst_sk_akreditasi_prodi,
		       a.asal_data
		FROM RankedAkred a
		LEFT JOIN ref.nilai_akred na ON na.id_akred = a.id_akred
		WHERE a.rn = 1
	`
	var out []AkreditasiCurrent
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *repo) ListAkreditasi(ctx context.Context, p AkreditasiListParams) ([]AkreditasiRow, int64, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}
	if p.Page <= 0 {
		p.Page = 1
	}
	offset := (p.Page - 1) * p.Limit

	args := []any{}
	// Filter selaras homepage public (ProgramStudiRepository):
	// - stat_prodi='A' (prodi aktif)
	// - id_fak_unila IS NOT NULL (punya fakultas yg valid — eliminate orphan prodi)
	// - id_jns_sms = 3 (hanya Program Studi — exclude Jurusan, Laboratorium, dll
	//   karena yg punya akreditasi BAN-PT cuma prodi level)
	conds := []string{"s.soft_delete = 0", "s.stat_prodi = 'A'", "s.id_fak_unila IS NOT NULL", "s.id_jns_sms = 3"}
	if strings.TrimSpace(p.Search) != "" {
		conds = append(conds, fmt.Sprintf("s.nm_lemb LIKE @p%d", len(args)+1))
		args = append(args, "%"+strings.TrimSpace(p.Search)+"%")
	}
	if strings.TrimSpace(p.IDLembAkred) != "" {
		conds = append(conds, fmt.Sprintf("a.id_lemb_akred = @p%d", len(args)+1))
		args = append(args, p.IDLembAkred)
	}
	if strings.TrimSpace(p.IDAkred) != "" {
		conds = append(conds, fmt.Sprintf("a.id_akred = @p%d", len(args)+1))
		args = append(args, p.IDAkred)
	}
	where := strings.Join(conds, " AND ")

	// Safelist sort columns supaya tidak SQL injection.
	sortBy := "s.nm_lemb"
	switch p.SortBy {
	case "nm_prodi":
		sortBy = "s.nm_lemb"
	case "nm_jenj_didik":
		sortBy = "jp.nm_jenj_didik"
	case "nm_fakultas":
		sortBy = "uo.nm_lemb"
	case "nm_akred":
		sortBy = "na.nm_akred"
	case "nm_lemb_akred":
		sortBy = "la.nm_lemb"
	case "tst_sk", "tanggal_sk", "last_update":
		sortBy = "a." + p.SortBy
	case "kode_prodi":
		sortBy = "s.kode_prodi"
	}
	order := "ASC"
	if strings.EqualFold(p.Order, "DESC") {
		order = "DESC"
	}

	// Subquery a: pick row akreditasi terbaru per id_sms (dedup karena 1 prodi
	// kadang punya >1 row a_aktif=1 — data legacy). Pakai ROW_NUMBER ORDER BY
	// tanggal SK terbaru / last_update.
	join := `
		FROM pdrd.sms s
		LEFT JOIN (
			SELECT id_akreditasi_prodi, id_sms, id_lemb_akred, id_akred,
			       sk_akreditasi_prodi, tanggal_sk_akreditasi_prodi, tst_sk_akreditasi_prodi,
			       asal_data, last_update,
			       ROW_NUMBER() OVER (PARTITION BY id_sms
			                          ORDER BY ISNULL(tanggal_sk_akreditasi_prodi, '1900-01-01') DESC,
			                                   ISNULL(last_update, '1900-01-01') DESC) AS rn
			FROM pdrd.akreditasi_prodi
			WHERE a_aktif = 1 AND soft_delete = 0
		) a ON a.id_sms = s.id_sms AND a.rn = 1
		LEFT JOIN ref.nilai_akred na ON na.id_akred = a.id_akred
		LEFT JOIN ref.lembaga_akred la ON la.id_lemb_akred = a.id_lemb_akred
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		LEFT JOIN man_akses.unit_organisasi uo ON CAST(uo.id_organisasi AS VARCHAR(50)) = CAST(s.id_fak_unila AS VARCHAR(50))`

	var total int64
	if err := r.db.QueryRowxContext(ctx, "SELECT COUNT(*) "+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT CAST(s.id_sms AS VARCHAR(36)) AS id_sms,
		       s.nm_lemb AS nm_prodi,
		       jp.nm_jenj_didik,
		       s.kode_prodi,
		       ISNULL(uo.nm_lemb, '') AS nm_fakultas,
		       a.id_lemb_akred, la.nm_lemb AS nm_lemb_akred,
		       a.id_akred, na.nm_akred,
		       a.sk_akreditasi_prodi, a.tanggal_sk_akreditasi_prodi, a.tst_sk_akreditasi_prodi,
		       a.asal_data, a.last_update
		%s
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, offset, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []AkreditasiRow
	for rows.Next() {
		var rec AkreditasiRow
		if err := rows.StructScan(&rec); err != nil {
			return nil, 0, err
		}
		out = append(out, rec)
	}
	return out, total, rows.Err()
}

// ============================================================================
// Sync log
// ============================================================================

func (r *repo) InsertSyncLog(ctx context.Context, l SyncLogRow) (string, error) {
	// Generate UUID di Go side supaya tidak tergantung mssql OUTPUT INSERTED
	// (yang return-nya kadang [16]byte vs string format inconsistent).
	id := strings.ToUpper(uuid.NewString())
	q := `
		INSERT INTO myunila.akreditasi_sync_log
			(id_log, sumber, mode, triggered_by, triggered_username, status, started_at)
		VALUES (CAST(@p1 AS uniqueidentifier), @p2, @p3, @p4, @p5, @p6, @p7)
	`
	if _, err := r.db.ExecContext(ctx, q, id, l.Sumber, l.Mode, l.TriggeredBy, l.TriggeredUser, l.Status, l.StartedAt); err != nil {
		return "", err
	}
	return id, nil
}

func (r *repo) UpdateSyncLogFinish(ctx context.Context, idLog string, res SyncResult) error {
	q := `
		UPDATE myunila.akreditasi_sync_log
		SET finished_at = @p1,
		    duration_ms = @p2,
		    status = @p3,
		    total_fetched = @p4,
		    total_matched = @p5,
		    total_unmatched = @p6,
		    total_inserted = @p7,
		    total_updated = @p8,
		    total_unchanged = @p9,
		    error_message = @p10
		WHERE id_log = CAST(@p11 AS uniqueidentifier)
	`
	var errMsg any
	if res.Error != "" {
		errMsg = res.Error
	} else {
		errMsg = nil
	}
	_, err := r.db.ExecContext(ctx, q,
		res.FinishedAt, res.DurationMs, res.Status,
		res.TotalFetched, res.TotalMatched, res.TotalUnmatched,
		res.TotalInserted, res.TotalUpdated, res.TotalUnchanged,
		errMsg, idLog,
	)
	return err
}

func (r *repo) InsertSyncLogDetails(ctx context.Context, idLog string, details []SyncLogDetail) error {
	if len(details) == 0 {
		return nil
	}
	// Batch insert per 200 row supaya tidak kena 2100 parameter limit MSSQL.
	const batchSize = 100
	for start := 0; start < len(details); start += batchSize {
		end := start + batchSize
		if end > len(details) {
			end = len(details)
		}
		batch := details[start:end]

		// Per-row insert dgn prepared stmt — lebih mudah debug error per-record.
		// Performance trade-off OK karena 100 row per sync masih dalam orde detik.
		stmt, err := r.db.PreparexContext(ctx, `INSERT INTO myunila.akreditasi_sync_log_detail
			(id_log, id_sms, nm_prodi_external, jenjang_external, nm_prodi_pdrd, jenjang_pdrd,
			 action, old_id_akred, new_id_akred, old_nm_akred, new_nm_akred,
			 old_sk, new_sk, old_tgl_sk, new_tgl_sk, old_tst_sk, new_tst_sk,
			 id_lemb_akred, notes)
			VALUES (CAST(@p1 AS uniqueidentifier), CAST(@p2 AS uniqueidentifier), @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17, @p18, @p19)`)
		if err != nil {
			return fmt.Errorf("prepare detail stmt: %w", err)
		}
		for _, d := range batch {
			var idSmsArg any = nil
			if d.IDSms != nil && *d.IDSms != "" {
				idSmsArg = strings.ToUpper(strings.TrimSpace(*d.IDSms))
			}
			// Convert *time.Time → date string supaya tidak ke-convert ke datetime2
			// dengan jam/timezone (MSSQL DATE column tolak time bagian).
			oldTglSk := dateOnlyArg(d.OldTglSk)
			newTglSk := dateOnlyArg(d.NewTglSk)
			oldTstSk := dateOnlyArg(d.OldTstSk)
			newTstSk := dateOnlyArg(d.NewTstSk)

			if _, err := stmt.ExecContext(ctx,
				idLog, idSmsArg, d.NmProdiExternal, d.JenjangExternal, d.NmProdiPdrd, d.JenjangPdrd,
				d.Action, d.OldIDAkred, d.NewIDAkred, d.OldNmAkred, d.NewNmAkred,
				d.OldSk, d.NewSk, oldTglSk, newTglSk, oldTstSk, newTstSk,
				d.IDLembAkred, d.Notes,
			); err != nil {
				stmt.Close()
				prodi := ""
				if d.NmProdiExternal != nil {
					prodi = *d.NmProdiExternal
				}
				return fmt.Errorf("insert detail row '%s' (action=%s): %w", prodi, d.Action, err)
			}
		}
		_ = stmt.Close()
	}
	return nil
}

// dateOnlyArg — convert *time.Time to YYYY-MM-DD string supaya MSSQL DATE column
// tidak salah parse datetime2 dengan timezone.
func dateOnlyArg(t *time.Time) any {
	if t == nil {
		return nil
	}
	return t.Format("2006-01-02")
}

func (r *repo) ListSyncLogs(ctx context.Context, limit, offset int) ([]SyncLogRow, int64, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	var total int64
	if err := r.db.QueryRowxContext(ctx, "SELECT COUNT(*) FROM myunila.akreditasi_sync_log").Scan(&total); err != nil {
		return nil, 0, err
	}
	q := `
		SELECT CAST(id_log AS VARCHAR(36)) AS id_log,
		       sumber, mode,
		       CAST(triggered_by AS VARCHAR(36)) AS triggered_by,
		       triggered_username, status,
		       started_at, finished_at, duration_ms,
		       total_fetched, total_matched, total_unmatched,
		       total_inserted, total_updated, total_unchanged, error_message
		FROM myunila.akreditasi_sync_log
		ORDER BY started_at DESC
		OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
	`
	var out []SyncLogRow
	if err := r.db.SelectContext(ctx, &out, q, offset, limit); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}

func (r *repo) GetSyncLog(ctx context.Context, idLog string) (*SyncLogRow, error) {
	q := `
		SELECT CAST(id_log AS VARCHAR(36)) AS id_log,
		       sumber, mode,
		       CAST(triggered_by AS VARCHAR(36)) AS triggered_by,
		       triggered_username, status,
		       started_at, finished_at, duration_ms,
		       total_fetched, total_matched, total_unmatched,
		       total_inserted, total_updated, total_unchanged, error_message
		FROM myunila.akreditasi_sync_log
		WHERE id_log = CAST(@p1 AS uniqueidentifier)
	`
	var l SyncLogRow
	if err := r.db.GetContext(ctx, &l, q, idLog); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &l, nil
}

func (r *repo) GetSyncLogDetails(ctx context.Context, idLog string, action string) ([]SyncLogDetail, error) {
	q := `
		SELECT CAST(id_detail AS VARCHAR(36)) AS id_detail,
		       CAST(id_log AS VARCHAR(36)) AS id_log,
		       CAST(id_sms AS VARCHAR(36)) AS id_sms,
		       nm_prodi_external, jenjang_external,
		       nm_prodi_pdrd, jenjang_pdrd, action,
		       old_id_akred, new_id_akred, old_nm_akred, new_nm_akred,
		       old_sk, new_sk, old_tgl_sk, new_tgl_sk, old_tst_sk, new_tst_sk,
		       id_lemb_akred, notes
		FROM myunila.akreditasi_sync_log_detail
		WHERE id_log = CAST(@p1 AS uniqueidentifier)
	`
	args := []any{idLog}
	if strings.TrimSpace(action) != "" {
		q += " AND action = @p2"
		args = append(args, action)
	}
	q += " ORDER BY action, nm_prodi_external"
	var out []SyncLogDetail
	if err := r.db.SelectContext(ctx, &out, q, args...); err != nil {
		return nil, err
	}
	return out, nil
}

// ============================================================================
// Apply ke pdrd.akreditasi_prodi
// ============================================================================

// UpsertAkreditasi — bandingkan dengan baris a_aktif=1 saat ini. Kalau sama,
// return action="unchanged". Kalau beda atau belum ada, deactivate baris lama
// (a_aktif=0) lalu insert baru. Returns action used dan old row jika ada.
func (r *repo) UpsertAkreditasi(ctx context.Context, idSms string, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time, asalData string) (string, *AkreditasiCurrent, error) {
	// Cari row aktif
	var current AkreditasiCurrent
	q := `
		SELECT TOP 1 CAST(a.id_akreditasi_prodi AS VARCHAR(36)) AS id_akreditasi_prodi,
		       CAST(a.id_sms AS VARCHAR(36)) AS id_sms,
		       a.id_lemb_akred, a.id_akred,
		       na.nm_akred, a.sk_akreditasi_prodi, a.tanggal_sk_akreditasi_prodi,
		       a.tst_sk_akreditasi_prodi, a.asal_data
		FROM pdrd.akreditasi_prodi a
		LEFT JOIN ref.nilai_akred na ON na.id_akred = a.id_akred
		WHERE a.id_sms = CAST(@p1 AS uniqueidentifier) AND a.a_aktif = 1 AND a.soft_delete = 0
	`
	hasCurrent := true
	if err := r.db.GetContext(ctx, &current, q, idSms); err != nil {
		if err == sql.ErrNoRows {
			hasCurrent = false
		} else {
			return "", nil, err
		}
	}

	// Compare — sama dengan service.Sync: skip tgl_sk (BAN-PT cuma year).
	if hasCurrent {
		sameAkred := current.IDAkred != nil && *current.IDAkred == idAkred
		sameLemb := current.IDLembAkred != nil && strings.EqualFold(strings.TrimSpace(*current.IDLembAkred), idLembAkred)
		sameSk := stringPtrEq(current.SkAkreditasiProdi, sk)
		sameTst := datePtrEq(current.TstSkAkred, tstSk)
		if sameAkred && sameLemb && sameSk && sameTst {
			return "unchanged", &current, nil
		}
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return "", nil, err
	}
	defer tx.Rollback()

	// Soft-deactivate semua row aktif untuk prodi ini
	if _, err := tx.ExecContext(ctx,
		`UPDATE pdrd.akreditasi_prodi SET a_aktif = 0, last_update = SYSDATETIME() WHERE id_sms = CAST(@p1 AS uniqueidentifier) AND a_aktif = 1`,
		idSms); err != nil {
		return "", nil, fmt.Errorf("deactivate old: %w", err)
	}

	// Insert row baru
	// id_creator wajib (NOT NULL) — pakai konstanta system user yang
	// existing di pdrd.akreditasi_prodi (admin scheduler).
	const systemCreator = "FBEC0EDD-B796-4CFF-AB0B-ACD80AE5077D"

	insQ := `
		INSERT INTO pdrd.akreditasi_prodi
			(id_akreditasi_prodi, id_sms, id_lemb_akred, id_akred, sk_akreditasi_prodi,
			 tanggal_sk_akreditasi_prodi, tst_sk_akreditasi_prodi, asal_data,
			 a_aktif, create_date, id_creator, last_update, id_updater, last_sync, soft_delete)
		VALUES (NEWID(), CAST(@p1 AS uniqueidentifier), @p2, @p3, @p4, @p5, @p6, @p7, 1,
		        SYSDATETIME(), CAST(@p8 AS uniqueidentifier),
		        SYSDATETIME(), CAST(@p8 AS uniqueidentifier),
		        SYSDATETIME(), 0)
	`
	tglSkArg := dateOnlyArg(tglSk)
	if tglSkArg == nil {
		// Kolom tanggal_sk_akreditasi_prodi NOT NULL — default = today kalau BAN-PT
		// tidak punya tahun_sk valid.
		tglSkArg = time.Now().Format("2006-01-02")
	}
	tstSkArg := dateOnlyArg(tstSk)
	// Truncate sk to fit varchar(80); asal_data already 1 char by convention.
	if len(sk) > 80 {
		sk = sk[:80]
	}
	if sk == "" {
		// sk_akreditasi_prodi NOT NULL juga — default placeholder.
		sk = "-"
	}
	if _, err := tx.ExecContext(ctx, insQ, idSms, idLembAkred, idAkred, sk, tglSkArg, tstSkArg, asalData, systemCreator); err != nil {
		return "", nil, fmt.Errorf("insert new: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return "", nil, err
	}

	if hasCurrent {
		return "update", &current, nil
	}
	return "insert", nil, nil
}

func stringPtrEq(a *string, b string) bool {
	if a == nil {
		return b == ""
	}
	return strings.TrimSpace(*a) == strings.TrimSpace(b)
}

func datePtrEq(a *time.Time, b *time.Time) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	return a.Format("2006-01-02") == b.Format("2006-01-02")
}

// ============================================================================
// Mapping Unit CRUD
// ============================================================================

const mappingUnitJoin = `
	FROM siakadu.mapping_unit mu
	LEFT JOIN siakadu.ref_unit ru ON ru.id_unit = mu.kode_siakad
	LEFT JOIN pdrd.sms s ON s.id_sms = mu.id_sms AND s.soft_delete = 0
	LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
`

const mappingUnitCols = `
	mu.kode_siakad,
	CAST(mu.id_sms AS VARCHAR(36)) AS id_sms,
	mu.nm_unit, mu.jenjang, mu.create_date, mu.last_update,
	ru.nm_unit AS ref_unit_name,
	ru.jns_unit AS ref_unit_jns,
	ru.id_jenjang AS ref_unit_jenjang,
	s.nm_lemb AS pdrd_nm_lemb,
	jp.nm_jenj_didik AS pdrd_jenjang,
	s.kode_prodi AS pdrd_kode_prodi,
	s.stat_prodi AS pdrd_stat_prodi
`

func (r *repo) ListMappingUnit(ctx context.Context, p MappingUnitListParams) ([]MappingUnitRow, int64, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}
	if p.Page <= 0 {
		p.Page = 1
	}
	offset := (p.Page - 1) * p.Limit

	args := []any{}
	conds := []string{"1=1"}
	if s := strings.TrimSpace(p.Search); s != "" {
		conds = append(conds, fmt.Sprintf("(mu.kode_siakad LIKE @p%d OR mu.nm_unit LIKE @p%d OR ru.nm_unit LIKE @p%d OR s.nm_lemb LIKE @p%d)", len(args)+1, len(args)+2, len(args)+3, len(args)+4))
		like := "%" + s + "%"
		args = append(args, like, like, like, like)
	}
	switch strings.ToLower(strings.TrimSpace(p.Status)) {
	case "mapped":
		conds = append(conds, "mu.id_sms IS NOT NULL AND s.id_sms IS NOT NULL")
	case "unmapped":
		conds = append(conds, "mu.id_sms IS NULL")
	case "broken":
		conds = append(conds, "mu.id_sms IS NOT NULL AND s.id_sms IS NULL")
	}
	where := strings.Join(conds, " AND ")

	sortBy := "mu.kode_siakad"
	if p.SortBy != "" {
		// safelist sort columns
		switch p.SortBy {
		case "kode_siakad", "nm_unit", "jenjang", "last_update":
			sortBy = "mu." + p.SortBy
		case "pdrd_nm_lemb":
			sortBy = "s.nm_lemb"
		case "ref_unit_name":
			sortBy = "ru.nm_unit"
		}
	}
	order := "ASC"
	if strings.EqualFold(p.Order, "DESC") {
		order = "DESC"
	}

	var total int64
	if err := r.db.QueryRowxContext(ctx, "SELECT COUNT(*) "+mappingUnitJoin+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`SELECT %s %s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		mappingUnitCols, mappingUnitJoin, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, offset, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []MappingUnitRow
	for rows.Next() {
		var rec MappingUnitRow
		if err := rows.StructScan(&rec); err != nil {
			return nil, 0, err
		}
		out = append(out, rec)
	}
	return out, total, rows.Err()
}

func (r *repo) GetMappingUnit(ctx context.Context, kodeSiakad string) (*MappingUnitRow, error) {
	q := fmt.Sprintf(`SELECT %s %s WHERE mu.kode_siakad = @p1`, mappingUnitCols, mappingUnitJoin)
	var rec MappingUnitRow
	err := r.db.GetContext(ctx, &rec, q, kodeSiakad)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &rec, nil
}

func (r *repo) UpsertMappingUnit(ctx context.Context, req MappingUnitUpsertReq) error {
	// MERGE pattern via existence check (mssql T-SQL MERGE bisa, tapi lebih
	// jelas pakai IF EXISTS UPDATE ELSE INSERT).
	var idSmsArg any
	if req.IDSms != nil && strings.TrimSpace(*req.IDSms) != "" {
		idSmsArg = strings.ToUpper(strings.TrimSpace(*req.IDSms))
	}
	q := `
		IF EXISTS (SELECT 1 FROM siakadu.mapping_unit WHERE kode_siakad = @p1)
		BEGIN
			UPDATE siakadu.mapping_unit
			SET id_sms = CAST(@p2 AS uniqueidentifier),
			    nm_unit = @p3,
			    jenjang = @p4,
			    last_update = SYSDATETIME()
			WHERE kode_siakad = @p1
		END
		ELSE
		BEGIN
			INSERT INTO siakadu.mapping_unit (kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update)
			VALUES (@p1, CAST(@p2 AS uniqueidentifier), @p3, @p4, SYSDATETIME(), SYSDATETIME())
		END
	`
	_, err := r.db.ExecContext(ctx, q, req.KodeSiakad, idSmsArg, req.NmUnit, req.Jenjang)
	return err
}

func (r *repo) DeleteMappingUnit(ctx context.Context, kodeSiakad string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM siakadu.mapping_unit WHERE kode_siakad = @p1", kodeSiakad)
	return err
}

// DeactivateAkreditasi — set a_aktif=0 utk semua row akreditasi prodi tsb.
// Tidak HARD DELETE — mempertahankan history.
func (r *repo) DeactivateAkreditasi(ctx context.Context, idSms string) error {
	idSms = strings.ToUpper(strings.TrimSpace(idSms))
	_, err := r.db.ExecContext(ctx,
		`UPDATE pdrd.akreditasi_prodi SET a_aktif = 0, last_update = SYSDATETIME() WHERE id_sms = CAST(@p1 AS uniqueidentifier) AND a_aktif = 1`,
		idSms)
	return err
}

// UpsertProdiAlias — simpan alias BAN-PT name → id_sms ke myunila.akreditasi_prodi_alias.
// Idempotent: kalau sudah ada (nm_prodi_banpt+jenjang_banpt), update id_sms-nya.
func (r *repo) UpsertProdiAlias(ctx context.Context, nmProdiBanpt, jenjangBanpt, idSms string) error {
	idSms = strings.ToUpper(strings.TrimSpace(idSms))
	q := `
		IF EXISTS (SELECT 1 FROM myunila.akreditasi_prodi_alias WHERE nm_prodi_banpt = @p1 AND jenjang_banpt = @p2)
		BEGIN
			UPDATE myunila.akreditasi_prodi_alias
			SET id_sms = CAST(@p3 AS uniqueidentifier), updated_at = SYSDATETIME()
			WHERE nm_prodi_banpt = @p1 AND jenjang_banpt = @p2
		END
		ELSE
		BEGIN
			INSERT INTO myunila.akreditasi_prodi_alias (nm_prodi_banpt, jenjang_banpt, id_sms)
			VALUES (@p1, @p2, CAST(@p3 AS uniqueidentifier))
		END
	`
	_, err := r.db.ExecContext(ctx, q, nmProdiBanpt, jenjangBanpt, idSms)
	return err
}

// ListProdiAlias — load alias map untuk service.Sync. Key = "nm_normalized|jenjang_kode".
func (r *repo) ListProdiAlias(ctx context.Context) (map[string]string, error) {
	q := `SELECT nm_prodi_banpt, jenjang_banpt, CAST(id_sms AS VARCHAR(36)) AS id_sms FROM myunila.akreditasi_prodi_alias`
	rows, err := r.db.QueryxContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]string{}
	for rows.Next() {
		var nm, jenjang, idSms string
		if err := rows.Scan(&nm, &jenjang, &idSms); err != nil {
			return nil, err
		}
		// Build key dgn fungsi yg sama (di service): makeKey(nm, jenjang)
		// Tapi di sini kita cuma simpan raw, biarkan caller (service) yang normalize.
		out[strings.ToLower(strings.TrimSpace(nm))+"|"+strings.ToUpper(strings.TrimSpace(jenjang))] = strings.ToUpper(idSms)
	}
	return out, rows.Err()
}

// GetLatestUnmatched — ambil daftar BAN-PT prodi yg unmatched dari sync log
// terakhir (preview atau apply, asalkan status=success). Dipakai Mapping Unit
// page agar admin bisa lihat & manual-map ke pdrd.sms.id_sms.
func (r *repo) GetLatestUnmatched(ctx context.Context) ([]UnmatchedRow, error) {
	q := `
		WITH LatestLog AS (
			SELECT TOP 1 id_log, started_at
			FROM myunila.akreditasi_sync_log
			WHERE status = 'success'
			ORDER BY started_at DESC
		)
		SELECT d.nm_prodi_external,
		       d.jenjang_external,
		       d.new_id_akred,
		       d.new_nm_akred,
		       d.new_sk,
		       CONVERT(VARCHAR(10), d.new_tst_sk, 23) AS new_tst_sk,
		       CAST(d.id_log AS VARCHAR(36)) AS id_log,
		       CONVERT(VARCHAR(19), l.started_at, 120) AS started_at
		FROM myunila.akreditasi_sync_log_detail d
		JOIN LatestLog l ON l.id_log = d.id_log
		WHERE d.action = 'unmatched'
		ORDER BY d.nm_prodi_external
	`
	var out []UnmatchedRow
	if err := r.db.SelectContext(ctx, &out, q); err != nil {
		return nil, err
	}
	return out, nil
}

// RefAkreditasi — referensi nilai_akred + lembaga_akred (untuk dropdown form).
func (r *repo) RefAkreditasi(ctx context.Context) ([]RefRow, []RefRow, error) {
	var nilai []RefRow
	rows, err := r.db.QueryxContext(ctx, `SELECT CAST(id_akred AS VARCHAR(10)) AS id, nm_akred AS nama FROM ref.nilai_akred ORDER BY id_akred`)
	if err != nil {
		return nil, nil, err
	}
	for rows.Next() {
		var rec RefRow
		_ = rows.Scan(&rec.ID, &rec.Nama)
		nilai = append(nilai, rec)
	}
	rows.Close()

	var lembaga []RefRow
	rows2, err := r.db.QueryxContext(ctx, `SELECT id_lemb_akred AS id, nm_lemb AS nama FROM ref.lembaga_akred ORDER BY id_lemb_akred`)
	if err != nil {
		return nil, nil, err
	}
	for rows2.Next() {
		var rec RefRow
		_ = rows2.Scan(&rec.ID, &rec.Nama)
		lembaga = append(lembaga, rec)
	}
	rows2.Close()

	return nilai, lembaga, nil
}

func (r *repo) MappingUnitStats(ctx context.Context) (mapped, unmapped, broken int, err error) {
	q := `
		SELECT
			SUM(CASE WHEN mu.id_sms IS NOT NULL AND s.id_sms IS NOT NULL THEN 1 ELSE 0 END) AS mapped,
			SUM(CASE WHEN mu.id_sms IS NULL THEN 1 ELSE 0 END) AS unmapped,
			SUM(CASE WHEN mu.id_sms IS NOT NULL AND s.id_sms IS NULL THEN 1 ELSE 0 END) AS broken
		FROM siakadu.mapping_unit mu
		LEFT JOIN pdrd.sms s ON s.id_sms = mu.id_sms AND s.soft_delete = 0
	`
	row := r.db.QueryRowxContext(ctx, q)
	err = row.Scan(&mapped, &unmapped, &broken)
	return
}
