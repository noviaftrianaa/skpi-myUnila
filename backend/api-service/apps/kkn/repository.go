package kkn

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
)

type Repository interface {
	ListPeserta(ctx context.Context, p PesertaParams) ([]PesertaKKN, int64, error)
	DetailPeserta(ctx context.Context, npm string) (*DetailPesertaKKN, error)
	ListKelompok(ctx context.Context, p KelompokParams) ([]KelompokKKN, int64, error)
	ListDPL(ctx context.Context, p DPLParams) ([]DPLKKN, int64, error)
	ListNilai(ctx context.Context, p NilaiParams) ([]NilaiKKN, int64, error)
	ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKKN, int64, error)
	ListLokasi(ctx context.Context, p LokasiParams) ([]LokasiKKN, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// ListPeserta — peserta KKN enriched with pdrd UUIDs + prodi/fakultas names
// ============================================================================

func (r *repository) ListPeserta(ctx context.Context, p PesertaParams) ([]PesertaKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("r.npm", p.NPM)
	cb.AppendString("r.status", p.Status)
	cb.AppendString("CAST(r.id_registrasi AS VARCHAR(36))", p.IDRegPd)
	cb.AppendInt("dp.angkatan", p.Angkatan)
	if p.IDPeriode != nil {
		cb.AppendString("CAST(r.id_periode_kkn AS VARCHAR(36))", p.IDPeriode)
	}
	if p.IDSms != nil {
		cb.AppendString("CAST(dp.id_prodi AS VARCHAR(36))", p.IDSms)
	}
	if p.Search != "" {
		cb.Like("dp.nm_mahasiswa", p.Search)
	}

	conds, args := cb.Build()
	where := "r.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.registrasi_kkn r
		LEFT JOIN kkn.data_pemohon dp ON dp.id_registrasi = r.id_registrasi AND dp.soft_delete = 0
		WHERE %s`, where)
	err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	cols := `CAST(r.id_registrasi AS VARCHAR(36)) AS id_registrasi,
		ISNULL(r.nomor_registrasi,'') AS nomor_registrasi,
		ISNULL(r.npm,'') AS npm,
		ISNULL(dp.nm_mahasiswa,'') AS nm_mahasiswa,
		ISNULL(dp.jenis_kelamin,'') AS jenis_kelamin,
		ISNULL(dp.tempat_lahir,'') AS tempat_lahir,
		FORMAT(dp.tgl_lahir,'yyyy-MM-dd') AS tgl_lahir,
		dp.angkatan,
		ISNULL(dp.ipk,0) AS ipk,
		ISNULL(dp.sks_lulus,0) AS sks_lulus,
		ISNULL(dp.email,'') AS email,
		ISNULL(dp.no_hp,'') AS no_hp,
		ISNULL(r.status,'') AS status,
		FORMAT(r.tgl_diajukan,'yyyy-MM-dd') AS tgl_diajukan,
		ISNULL(pk.nm_periode,'') AS nm_periode,
		CAST(rp.id_reg_pd AS VARCHAR(36)) AS id_reg_pd,
		CAST(rp.id_sms AS VARCHAR(36)) AS id_sms,
		CAST(pd.id_pd AS VARCHAR(36)) AS id_pd,
		COALESCE(NULLIF(dp.nm_prodi,''), sms.nm_lemb, '') AS nm_prodi,
		COALESCE(NULLIF(dp.nm_fakultas,''), fak.nm_lemb, '') AS nm_fakultas,
		COALESCE(dp.nm_jenjang, sms.nm_jenjang, '') AS nm_jenjang,
		ak.nm_kelompok,
		lok.nm_desa`

	sortCol := "r.create_date"
	sortDir := "DESC"
	if p.SortBy != "" {
		sortCol = p.SortBy
	}
	if p.Order != "" && (strings.ToUpper(p.Order) == "ASC" || strings.ToUpper(p.Order) == "DESC") {
		sortDir = strings.ToUpper(p.Order)
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT %s
		FROM kkn.registrasi_kkn r
		LEFT JOIN kkn.data_pemohon dp ON dp.id_registrasi = r.id_registrasi AND dp.soft_delete = 0
		LEFT JOIN kkn.periode_kkn pk ON pk.id_periode_kkn = r.id_periode_kkn
		OUTER APPLY (SELECT TOP 1 r2.id_reg_pd, r2.id_sms, r2.id_pd
			FROM pdrd.reg_pd r2 WHERE r2.nipd = r.npm ORDER BY r2.tgl_masuk_sp DESC) rp
		OUTER APPLY (SELECT s2.nm_lemb, s2.id_fak_unila,
			CASE WHEN s2.id_jns_sms = 3 THEN 'S1' WHEN s2.id_jns_sms = 4 THEN 'S2'
				 WHEN s2.id_jns_sms = 5 THEN 'S3' WHEN s2.id_jns_sms = 8 THEN 'D3'
				 WHEN s2.id_jns_sms = 22 THEN 'Profesi' WHEN s2.id_jns_sms = 23 THEN 'Sp-1'
				 ELSE '' END AS nm_jenjang
			FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		OUTER APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
		OUTER APPLY (SELECT TOP 1 pd2.id_pd FROM pdrd.peserta_didik pd2 WHERE pd2.id_pd = rp.id_pd) pd
		OUTER APPLY (SELECT TOP 1 ak2.id_kelompok FROM kkn.anggota_kelompok ak2 WHERE ak2.npm = r.npm AND ak2.soft_delete = 0) ag
		OUTER APPLY (SELECT k2.nm_kelompok FROM kkn.kelompok_kkn k2 WHERE k2.id_kelompok = ag.id_kelompok) ak
		OUTER APPLY (SELECT l2.nm_desa FROM kkn.lokasi_kkn l2
			INNER JOIN kkn.kelompok_kkn k3 ON k3.id_lokasi = l2.id_lokasi WHERE k3.id_kelompok = ag.id_kelompok) lok
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		cols, where, sortCol, sortDir, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PesertaKKN
	for rows.Next() {
		var m PesertaKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}

// ============================================================================
// DetailPeserta — full enrichment for a single peserta by NPM
// ============================================================================

func (r *repository) DetailPeserta(ctx context.Context, npm string) (*DetailPesertaKKN, error) {
	q := `SELECT CAST(r.id_registrasi AS VARCHAR(36)) AS id_registrasi,
		ISNULL(r.nomor_registrasi,'') AS nomor_registrasi,
		ISNULL(r.npm,'') AS npm,
		ISNULL(dp.nm_mahasiswa,'') AS nm_mahasiswa,
		ISNULL(dp.jenis_kelamin,'') AS jenis_kelamin,
		ISNULL(dp.tempat_lahir,'') AS tempat_lahir,
		FORMAT(dp.tgl_lahir,'yyyy-MM-dd') AS tgl_lahir,
		dp.angkatan,
		ISNULL(dp.ipk,0) AS ipk,
		ISNULL(dp.sks_lulus,0) AS sks_lulus,
		ISNULL(dp.email,'') AS email,
		ISNULL(dp.no_hp,'') AS no_hp,
		ISNULL(r.status,'') AS status,
		FORMAT(r.tgl_diajukan,'yyyy-MM-dd') AS tgl_diajukan,
		ISNULL(pk.nm_periode,'') AS nm_periode,
		CAST(rp.id_reg_pd AS VARCHAR(36)) AS id_reg_pd,
		CAST(rp.id_sms AS VARCHAR(36)) AS id_sms,
		CAST(pd.id_pd AS VARCHAR(36)) AS id_pd,
		COALESCE(NULLIF(dp.nm_prodi,''), sms.nm_lemb, '') AS nm_prodi,
		COALESCE(NULLIF(dp.nm_fakultas,''), fak.nm_lemb, '') AS nm_fakultas,
		COALESCE(dp.nm_jenjang, sms.nm_jenjang, '') AS nm_jenjang,
		ak.nm_kelompok,
		lok.nm_desa,
		ak.kode_kelompok,
		lok.nm_kecamatan,
		lok.nm_kabupaten,
		ndpl.nilai AS nilai_dpl,
		nkdpl.nilai AS nilai_kdpl
		FROM kkn.registrasi_kkn r
		LEFT JOIN kkn.data_pemohon dp ON dp.id_registrasi = r.id_registrasi AND dp.soft_delete = 0
		LEFT JOIN kkn.periode_kkn pk ON pk.id_periode_kkn = r.id_periode_kkn
		OUTER APPLY (SELECT TOP 1 r2.id_reg_pd, r2.id_sms, r2.id_pd
			FROM pdrd.reg_pd r2 WHERE r2.nipd = r.npm ORDER BY r2.tgl_masuk_sp DESC) rp
		OUTER APPLY (SELECT s2.nm_lemb, s2.id_fak_unila,
			CASE WHEN s2.id_jns_sms = 3 THEN 'S1' WHEN s2.id_jns_sms = 4 THEN 'S2'
				 WHEN s2.id_jns_sms = 5 THEN 'S3' WHEN s2.id_jns_sms = 8 THEN 'D3'
				 WHEN s2.id_jns_sms = 22 THEN 'Profesi' WHEN s2.id_jns_sms = 23 THEN 'Sp-1'
				 ELSE '' END AS nm_jenjang
			FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		OUTER APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
		OUTER APPLY (SELECT TOP 1 pd2.id_pd FROM pdrd.peserta_didik pd2 WHERE pd2.id_pd = rp.id_pd) pd
		OUTER APPLY (SELECT TOP 1 ak2.id_kelompok FROM kkn.anggota_kelompok ak2 WHERE ak2.npm = r.npm AND ak2.soft_delete = 0) ag
		OUTER APPLY (SELECT k2.nm_kelompok, k2.kode_kelompok, k2.id_lokasi FROM kkn.kelompok_kkn k2 WHERE k2.id_kelompok = ag.id_kelompok) ak
		OUTER APPLY (SELECT l2.nm_desa, l2.nm_kecamatan, l2.nm_kabupaten FROM kkn.lokasi_kkn l2 WHERE l2.id_lokasi = ak.id_lokasi) lok
		OUTER APPLY (SELECT TOP 1 n1.nilai FROM kkn.nilai_mahasiswa n1
			INNER JOIN kkn.anggota_kelompok a1 ON a1.id_anggota = n1.id_anggota
			WHERE a1.npm = r.npm AND n1.legacy_source = 'dpl' AND n1.soft_delete = 0) ndpl
		OUTER APPLY (SELECT TOP 1 n2.nilai FROM kkn.nilai_mahasiswa n2
			INNER JOIN kkn.anggota_kelompok a2 ON a2.id_anggota = n2.id_anggota
			WHERE a2.npm = r.npm AND n2.legacy_source = 'kdpl' AND n2.soft_delete = 0) nkdpl
		WHERE r.npm = @p1 AND r.soft_delete = 0
		ORDER BY r.create_date DESC`

	row := r.db.QueryRowxContext(ctx, q, npm)
	var m DetailPesertaKKN
	if err := row.StructScan(&m); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

// ============================================================================
// ListKelompok
// ============================================================================

func (r *repository) ListKelompok(ctx context.Context, p KelompokParams) ([]KelompokKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("CAST(k.id_kelompok AS VARCHAR(36))", p.IDKelompok)
	cb.AppendString("CAST(k.id_periode_kkn AS VARCHAR(36))", p.IDPeriode)
	cb.AppendString("CAST(k.id_lokasi AS VARCHAR(36))", p.IDLokasi)
	cb.AppendString("k.status", p.Status)
	if p.Search != "" {
		cb.Like("k.nm_kelompok", p.Search)
	}

	conds, args := cb.Build()
	where := "k.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.kelompok_kkn k WHERE %s`, where)
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT CAST(k.id_kelompok AS VARCHAR(36)) AS id_kelompok,
		ISNULL(k.kode_kelompok,'') AS kode_kelompok,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(p.nm_periode,'') AS nm_periode,
		ISNULL(p.tahun_akademik,'') AS tahun_akademik,
		ISNULL(l.nm_desa,'') AS nm_desa,
		ISNULL(l.nm_kecamatan,'') AS nm_kecamatan,
		ISNULL(l.nm_kabupaten,'') AS nm_kabupaten,
		ISNULL(k.kuota,0) AS kuota,
		(SELECT COUNT(*) FROM kkn.anggota_kelompok a WHERE a.id_kelompok = k.id_kelompok AND a.soft_delete = 0) AS jumlah_anggota,
		ISNULL(k.status,'') AS status
		FROM kkn.kelompok_kkn k
		LEFT JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		LEFT JOIN kkn.lokasi_kkn l ON l.id_lokasi = k.id_lokasi
		WHERE %s
		ORDER BY p.tahun_akademik DESC, k.kode_kelompok ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KelompokKKN
	for rows.Next() {
		var m KelompokKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}

// ============================================================================
// ListDPL — enriched with pdrd.sdm
// ============================================================================

func (r *repository) ListDPL(ctx context.Context, p DPLParams) ([]DPLKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("d.nip", p.NIP)
	cb.AppendString("d.nidn", p.NIDN)
	cb.AppendString("CAST(d.id_dosen AS VARCHAR(36))", p.IDDosen)
	cb.AppendString("d.peran", p.Peran)
	if p.IDPeriode != nil {
		cb.AppendString("CAST(k.id_periode_kkn AS VARCHAR(36))", p.IDPeriode)
	}
	if p.Search != "" {
		cb.Like("d.nm_dosen", p.Search)
	}

	conds, args := cb.Build()
	where := "d.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.dpl_kelompok d
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = d.id_kelompok
		WHERE %s`, where)
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT CAST(d.id_dpl AS VARCHAR(36)) AS id_dpl,
		COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm, '') AS nm_dosen,
		ISNULL(d.nip,'') AS nip,
		COALESCE(NULLIF(d.nidn,''), s.nidn, '') AS nidn,
		ISNULL(d.peran,'') AS peran,
		ISNULL(d.no_hp,'') AS no_hp,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(p.nm_periode,'') AS nm_periode,
		ISNULL(l.nm_desa,'') AS nm_desa,
		CAST(COALESCE(d.id_dosen, s.id_sdm) AS VARCHAR(36)) AS id_dosen
		FROM kkn.dpl_kelompok d
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = d.id_kelompok
		LEFT JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		LEFT JOIN kkn.lokasi_kkn l ON l.id_lokasi = k.id_lokasi
		LEFT JOIN pdrd.sdm s ON d.nip = s.nip
		WHERE %s
		ORDER BY COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm, '') ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []DPLKKN
	for rows.Next() {
		var m DPLKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}

// ============================================================================
// ListNilai — enriched with prodi from pdrd
// ============================================================================

func (r *repository) ListNilai(ctx context.Context, p NilaiParams) ([]NilaiKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("a.npm", p.NPM)
	cb.AppendString("n.legacy_source", p.Source)
	if p.IDPeriode != nil {
		cb.AppendString("CAST(k.id_periode_kkn AS VARCHAR(36))", p.IDPeriode)
	}
	if p.Search != "" {
		cb.Like("a.npm", p.Search)
	}

	conds, args := cb.Build()
	where := "n.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.nilai_mahasiswa n
		JOIN kkn.anggota_kelompok a ON a.id_anggota = n.id_anggota
		LEFT JOIN kkn.kelompok_kkn k ON k.id_kelompok = a.id_kelompok
		WHERE %s`, where)
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT CAST(n.id_nilai AS VARCHAR(36)) AS id_nilai,
		ISNULL(a.npm,'') AS npm,
		ISNULL(dp.nm_mahasiswa,'') AS nm_mahasiswa,
		COALESCE(NULLIF(dp.nm_prodi,''), sms.nm_lemb, '') AS nm_prodi,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(p.nm_periode,'') AS nm_periode,
		ISNULL(n.nilai,0) AS nilai,
		ISNULL(n.legacy_source,'') AS legacy_source,
		FORMAT(n.tgl_penilaian,'yyyy-MM-dd') AS tgl_penilaian,
		CAST(rp.id_reg_pd AS VARCHAR(36)) AS id_reg_pd,
		CAST(rp.id_sms AS VARCHAR(36)) AS id_sms
		FROM kkn.nilai_mahasiswa n
		JOIN kkn.anggota_kelompok a ON a.id_anggota = n.id_anggota
		LEFT JOIN kkn.kelompok_kkn k ON k.id_kelompok = a.id_kelompok
		LEFT JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		LEFT JOIN kkn.data_pemohon dp ON dp.nim = a.npm AND dp.soft_delete = 0
		OUTER APPLY (SELECT TOP 1 r2.id_reg_pd, r2.id_sms FROM pdrd.reg_pd r2 WHERE r2.nipd = a.npm ORDER BY r2.tgl_masuk_sp DESC) rp
		OUTER APPLY (SELECT s2.nm_lemb FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		WHERE %s
		ORDER BY n.create_date DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []NilaiKKN
	for rows.Next() {
		var m NilaiKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}

// ============================================================================
// ListPeriode — with peserta + kelompok counts
// ============================================================================

func (r *repository) ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("pk.tahun_akademik", p.Tahun)
	if p.Search != "" {
		cb.Like("pk.nm_periode", p.Search)
	}

	conds, args := cb.Build()
	where := "pk.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.periode_kkn pk WHERE %s`, where)
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT CAST(pk.id_periode_kkn AS VARCHAR(36)) AS id_periode_kkn,
		ISNULL(pk.kode_periode,'') AS kode_periode,
		ISNULL(pk.nm_periode,'') AS nm_periode,
		ISNULL(pk.tahun_akademik,'') AS tahun_akademik,
		ISNULL(pk.gelombang,0) AS gelombang,
		ISNULL(pk.durasi_hari,0) AS durasi_hari,
		(SELECT COUNT(*) FROM kkn.registrasi_kkn r WHERE r.id_periode_kkn = pk.id_periode_kkn AND r.soft_delete = 0) AS jumlah_peserta,
		(SELECT COUNT(*) FROM kkn.kelompok_kkn k WHERE k.id_periode_kkn = pk.id_periode_kkn AND k.soft_delete = 0) AS jumlah_kelompok
		FROM kkn.periode_kkn pk
		WHERE %s
		ORDER BY pk.tahun_akademik DESC, pk.gelombang DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PeriodeKKN
	for rows.Next() {
		var m PeriodeKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}

// ============================================================================
// ListLokasi
// ============================================================================

func (r *repository) ListLokasi(ctx context.Context, p LokasiParams) ([]LokasiKKN, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("l.nm_kabupaten", p.Kabupaten)
	cb.AppendString("l.nm_kecamatan", p.Kecamatan)
	if p.Search != "" {
		cb.Like("l.nm_desa", p.Search)
	}

	conds, args := cb.Build()
	where := "l.soft_delete = 0"
	if len(conds) > 0 {
		where += " AND " + strings.Join(conds, " AND ")
	}

	var total int64
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM kkn.lokasi_kkn l WHERE %s`, where)
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (p.Page - 1) * p.Limit
	args = append(args, offset, p.Limit)
	pOff := len(args) - 1
	pLim := len(args)

	q := fmt.Sprintf(`SELECT CAST(l.id_lokasi AS VARCHAR(36)) AS id_lokasi,
		ISNULL(l.kode_lokasi,'') AS kode_lokasi,
		ISNULL(l.nm_desa,'') AS nm_desa,
		ISNULL(l.nm_kecamatan,'') AS nm_kecamatan,
		ISNULL(l.nm_kabupaten,'') AS nm_kabupaten,
		ISNULL(l.nm_provinsi,'') AS nm_provinsi
		FROM kkn.lokasi_kkn l
		WHERE %s
		ORDER BY l.nm_kabupaten ASC, l.nm_kecamatan ASC, l.nm_desa ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, where, pOff, pLim)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []LokasiKKN
	for rows.Next() {
		var m LokasiKKN
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, nil
}
