package ktwraw

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository: data access untuk KTW raw query.
// Semua SQL identik dengan public-service KtwRepository.php — formula KTW
// strict PDDIKTI. Lihat docstring entity.go untuk detail.
type Repository interface {
	GetPerFakultas(ctx context.Context, p PerFakultasParams) ([]PerFakultasRow, error)
	GetPerProdi(ctx context.Context, p PerProdiParams) ([]PerProdiRow, error)
	GetPerJenjang(ctx context.Context, p PerJenjangParams) ([]PerJenjangRow, error)
	ListMahasiswa(ctx context.Context, p MahasiswaListParams) ([]MahasiswaRow, int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// normalizeCutoff: kalau cutoff kosong → hari ini. Validate format YYYY-MM-DD.
func normalizeCutoff(c string) string {
	if c == "" {
		return time.Now().Format("2006-01-02")
	}
	// validate format
	if _, err := time.Parse("2006-01-02", c); err != nil {
		return time.Now().Format("2006-01-02")
	}
	return c
}

// =============================================================================
// Per Fakultas
// =============================================================================

func (r *repository) GetPerFakultas(ctx context.Context, p PerFakultasParams) ([]PerFakultasRow, error) {
	idJenj, ok := JenjangValid(p.Jenjang)
	if !ok {
		return nil, fmt.Errorf("invalid jenjang: %s", p.Jenjang)
	}
	if p.Cohort < 2000 || p.Cohort > 2100 {
		return nil, fmt.Errorf("invalid cohort: %d", p.Cohort)
	}
	normatif := MasaNormatif[p.Jenjang]
	cutoff := normalizeCutoff(p.Cutoff)

	q := `
		SELECT
			CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
			COALESCE(fak.nm_lemb, 'Tidak diketahui') AS nm_fakultas,
			COUNT(*) AS maba,
			SUM(CASE WHEN reg.id_jns_keluar = '1'
				AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
			THEN 1 ELSE 0 END) AS sudah_lulus,
			SUM(CASE WHEN reg.id_jns_keluar = '1'
				AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
				AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= @p2
			THEN 1 ELSE 0 END) AS ktw_strict,
			SUM(CASE WHEN reg.id_jns_keluar IS NULL THEN 1 ELSE 0 END) AS masih_aktif,
			SUM(CASE WHEN reg.id_jns_keluar IN ('2','3','4','5','6','7') THEN 1 ELSE 0 END) AS keluar_non_lulus
		FROM pdrd.reg_pd reg
		INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		LEFT JOIN pdrd.sms fak ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0
		WHERE reg.soft_delete = 0
			AND CAST(reg.id_sp AS VARCHAR(50)) = @p3
			AND reg.id_jns_daftar = @p4
			AND YEAR(reg.tgl_masuk_sp) = @p5 AND MONTH(reg.tgl_masuk_sp) >= 7
			AND sms.id_jenj_didik = @p6
		GROUP BY CAST(sms.id_fak_unila AS VARCHAR(50)), fak.nm_lemb
		ORDER BY fak.nm_lemb
	`
	rows := []PerFakultasRow{}
	if err := r.db.SelectContext(ctx, &rows, q,
		cutoff, normatif, UnilaIDSP, JnsDaftarMaba, p.Cohort, idJenj,
	); err != nil {
		return nil, fmt.Errorf("query GetPerFakultas: %w", err)
	}
	// compute percentages
	for i := range rows {
		rows[i].PctKtwStrict = PercentRound(rows[i].KtwStrict, rows[i].Maba)
		rows[i].PctSudahLulus = PercentRound(rows[i].SudahLulus, rows[i].Maba)
	}
	return rows, nil
}

// =============================================================================
// Per Prodi
// =============================================================================

func (r *repository) GetPerProdi(ctx context.Context, p PerProdiParams) ([]PerProdiRow, error) {
	idJenj, ok := JenjangValid(p.Jenjang)
	if !ok {
		return nil, fmt.Errorf("invalid jenjang: %s", p.Jenjang)
	}
	normatif := MasaNormatif[p.Jenjang]
	cutoff := normalizeCutoff(p.Cutoff)

	args := []interface{}{cutoff, normatif, UnilaIDSP, JnsDaftarMaba, p.Cohort, idJenj}
	fakFilter := ""
	if p.IDFakultas != "" {
		fakFilter = " AND CAST(sms.id_fak_unila AS VARCHAR(50)) = @p7"
		args = append(args, p.IDFakultas)
	}

	q := `
		SELECT
			CAST(sms.id_sms AS VARCHAR(50)) AS id_prodi,
			ISNULL(sms.kode_prodi, '') AS kode_dikti,
			sms.nm_lemb AS nm_prodi,
			CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
			COUNT(*) AS maba,
			SUM(CASE WHEN reg.id_jns_keluar = '1'
				AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
			THEN 1 ELSE 0 END) AS sudah_lulus,
			SUM(CASE WHEN reg.id_jns_keluar = '1'
				AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
				AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= @p2
			THEN 1 ELSE 0 END) AS ktw_strict,
			SUM(CASE WHEN reg.id_jns_keluar IS NULL THEN 1 ELSE 0 END) AS masih_aktif,
			SUM(CASE WHEN reg.id_jns_keluar IN ('2','3','4','5','6','7') THEN 1 ELSE 0 END) AS keluar_non_lulus
		FROM pdrd.reg_pd reg
		INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		WHERE reg.soft_delete = 0
			AND CAST(reg.id_sp AS VARCHAR(50)) = @p3
			AND reg.id_jns_daftar = @p4
			AND YEAR(reg.tgl_masuk_sp) = @p5 AND MONTH(reg.tgl_masuk_sp) >= 7
			AND sms.id_jenj_didik = @p6` + fakFilter + `
		GROUP BY sms.id_sms, sms.kode_prodi, sms.nm_lemb, sms.id_fak_unila
		ORDER BY sms.nm_lemb
	`
	rows := []PerProdiRow{}
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, fmt.Errorf("query GetPerProdi: %w", err)
	}
	for i := range rows {
		rows[i].PctKtwStrict = PercentRound(rows[i].KtwStrict, rows[i].Maba)
		rows[i].PctSudahLulus = PercentRound(rows[i].SudahLulus, rows[i].Maba)
	}
	return rows, nil
}

// =============================================================================
// Per Jenjang
// =============================================================================

func (r *repository) GetPerJenjang(ctx context.Context, p PerJenjangParams) ([]PerJenjangRow, error) {
	cutoff := normalizeCutoff(p.Cutoff)

	// Loop manual per jenjang karena masa_normatif beda per jenjang.
	results := []PerJenjangRow{}
	for kode, normatif := range MasaNormatif {
		idJenj := JenjangReverseMap[kode]

		args := []interface{}{cutoff, normatif, UnilaIDSP, JnsDaftarMaba, p.Cohort, idJenj}
		fakFilter := ""
		if p.IDFakultas != "" {
			fakFilter = " AND CAST(sms.id_fak_unila AS VARCHAR(50)) = @p7"
			args = append(args, p.IDFakultas)
		}

		q := `
			SELECT
				ISNULL(COUNT(*), 0) AS maba,
				ISNULL(SUM(CASE WHEN reg.id_jns_keluar = '1'
					AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
				THEN 1 ELSE 0 END), 0) AS sudah_lulus,
				ISNULL(SUM(CASE WHEN reg.id_jns_keluar = '1'
					AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1
					AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= @p2
				THEN 1 ELSE 0 END), 0) AS ktw_strict,
				ISNULL(SUM(CASE WHEN reg.id_jns_keluar IS NULL THEN 1 ELSE 0 END), 0) AS masih_aktif,
				ISNULL(SUM(CASE WHEN reg.id_jns_keluar IN ('2','3','4','5','6','7') THEN 1 ELSE 0 END), 0) AS keluar_non_lulus
			FROM pdrd.reg_pd reg
			INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
			WHERE reg.soft_delete = 0
				AND CAST(reg.id_sp AS VARCHAR(50)) = @p3
				AND reg.id_jns_daftar = @p4
				AND YEAR(reg.tgl_masuk_sp) = @p5 AND MONTH(reg.tgl_masuk_sp) >= 7
				AND sms.id_jenj_didik = @p6` + fakFilter

		var row PerJenjangRow
		if err := r.db.GetContext(ctx, &row, q, args...); err != nil {
			return nil, fmt.Errorf("query GetPerJenjang(%s): %w", kode, err)
		}
		row.Jenjang = kode
		row.MasaNormatif = normatif
		row.PctKtwStrict = PercentRound(row.KtwStrict, row.Maba)
		row.PctSudahLulus = PercentRound(row.SudahLulus, row.Maba)
		// skip jenjang yang tidak punya data
		if row.Maba == 0 {
			continue
		}
		results = append(results, row)
	}
	// sort by jenjang label (S1, S2, S3, D3, D4) — pakai urutan map insertion biasa
	// Go map iteration random, jadi urutkan manual:
	desiredOrder := []string{"D3", "D4", "S1", "S2", "S3"}
	sorted := []PerJenjangRow{}
	for _, kode := range desiredOrder {
		for _, row := range results {
			if row.Jenjang == kode {
				sorted = append(sorted, row)
				break
			}
		}
	}
	return sorted, nil
}

// =============================================================================
// List Mahasiswa (raw row)
// =============================================================================

func (r *repository) ListMahasiswa(ctx context.Context, p MahasiswaListParams) ([]MahasiswaRow, int, error) {
	idJenj, ok := JenjangValid(p.Jenjang)
	if !ok {
		return nil, 0, fmt.Errorf("invalid jenjang: %s", p.Jenjang)
	}
	if p.Cohort < 2000 || p.Cohort > 2100 {
		return nil, 0, fmt.Errorf("invalid cohort: %d", p.Cohort)
	}
	normatif := MasaNormatif[p.Jenjang]
	cutoff := normalizeCutoff(p.Cutoff)

	if p.Limit <= 0 {
		p.Limit = 20
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	if p.Page <= 0 {
		p.Page = 1
	}
	offset := (p.Page - 1) * p.Limit

	// Build WHERE clause + positional args (@p1, @p2, ...).
	// Format: reg + sms + pd standard cohort filter, plus optional id_fakultas,
	// id_prodi, search, status_ktw.
	args := []interface{}{
		cutoff,         // @p1 — dipakai untuk status_ktw filter & masa_studi cutoff
		normatif,       // @p2 — dipakai untuk masa_studi compare
		UnilaIDSP,      // @p3
		JnsDaftarMaba,  // @p4
		p.Cohort,       // @p5
		idJenj,         // @p6
	}
	whereParts := []string{
		"reg.soft_delete = 0",
		"pd.soft_delete = 0",
		"CAST(reg.id_sp AS VARCHAR(50)) = @p3",
		"reg.id_jns_daftar = @p4",
		"YEAR(reg.tgl_masuk_sp) = @p5",
		"MONTH(reg.tgl_masuk_sp) >= 7",
		"sms.id_jenj_didik = @p6",
	}

	nextIdx := 7
	if p.IDFakultas != "" {
		whereParts = append(whereParts, fmt.Sprintf("CAST(sms.id_fak_unila AS VARCHAR(50)) = @p%d", nextIdx))
		args = append(args, p.IDFakultas)
		nextIdx++
	}
	if p.IDProdi != "" {
		whereParts = append(whereParts, fmt.Sprintf("CAST(sms.id_sms AS VARCHAR(50)) = @p%d", nextIdx))
		args = append(args, p.IDProdi)
		nextIdx++
	}
	if p.Search != "" {
		searchTerm := "%" + strings.ToLower(p.Search) + "%"
		whereParts = append(whereParts,
			fmt.Sprintf("(LOWER(pd.nm_pd) LIKE @p%d OR LOWER(ISNULL(reg.nipd,'')) LIKE @p%d)", nextIdx, nextIdx))
		args = append(args, searchTerm)
		nextIdx++
	}
	// status_ktw filter (computed via predicate)
	if p.StatusKtw != "" {
		switch p.StatusKtw {
		case "lulus_tepat":
			whereParts = append(whereParts,
				"reg.id_jns_keluar = '1' AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1 "+
					"AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) <= @p2")
		case "lulus_terlambat":
			whereParts = append(whereParts,
				"reg.id_jns_keluar = '1' AND reg.tgl_keluar IS NOT NULL AND reg.tgl_keluar <= @p1 "+
					"AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2) > @p2")
		case "masih_aktif":
			whereParts = append(whereParts, "reg.id_jns_keluar IS NULL")
		case "keluar_non_lulus":
			whereParts = append(whereParts, "reg.id_jns_keluar IN ('2','3','4','5','6','7')")
		default:
			return nil, 0, fmt.Errorf("invalid status_ktw: %s", p.StatusKtw)
		}
	}
	whereClause := strings.Join(whereParts, " AND ")

	// COUNT query
	countQ := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_pd reg
		INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = reg.id_pd
		INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		WHERE %s
	`, whereClause)
	var total int
	if err := r.db.GetContext(ctx, &total, countQ, args...); err != nil {
		return nil, 0, fmt.Errorf("count query: %w", err)
	}

	// DATA query — pakai OFFSET-FETCH SQL Server (offset & limit di akhir args)
	jenjangIdx := nextIdx
	offsetIdx := nextIdx + 1
	limitIdx := nextIdx + 2

	dataQ := fmt.Sprintf(`
		SELECT
			CAST(reg.id_pd AS VARCHAR(50)) AS id_pd,
			CAST(reg.id_reg_pd AS VARCHAR(50)) AS id_reg_pd,
			reg.nipd,
			pd.nm_pd,
			pd.jk,
			YEAR(reg.tgl_masuk_sp) AS angkatan,
			@p%d AS jenjang,
			CAST(sms.id_sms AS VARCHAR(50)) AS id_prodi,
			sms.nm_lemb AS nm_prodi,
			CAST(sms.id_fak_unila AS VARCHAR(50)) AS id_fakultas,
			fak.nm_lemb AS nm_fakultas,
			CONVERT(VARCHAR(10), reg.tgl_masuk_sp, 23) AS tgl_masuk_sp,
			reg.id_jns_keluar,
			CONVERT(VARCHAR(10), reg.tgl_keluar, 23) AS tgl_keluar,
			CASE WHEN reg.tgl_keluar IS NOT NULL
				THEN ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2)
				ELSE NULL
			END AS masa_studi_tahun
		FROM pdrd.reg_pd reg
		INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = reg.id_pd
		INNER JOIN pdrd.sms sms ON sms.id_sms = reg.id_sms AND sms.soft_delete = 0
		LEFT JOIN pdrd.sms fak ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0
		WHERE %s
		ORDER BY pd.nm_pd ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, jenjangIdx, whereClause, offsetIdx, limitIdx)

	dataArgs := append(args, p.Jenjang, offset, p.Limit)

	out := []MahasiswaRow{}
	if err := r.db.SelectContext(ctx, &out, dataQ, dataArgs...); err != nil {
		return nil, 0, fmt.Errorf("data query: %w", err)
	}
	for i := range out {
		out[i].StatusKtw = ComputeStatusKtw(out[i].IDJnsKeluar, out[i].MasaStudiTahun, normatif)
	}
	return out, total, nil
}
