package pesertadidik

import (
	"context"
	"fmt"
	"strings"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

// ---------------- Nilai Semester ----------------
func (r *repository) GetNilaiSmtMhs(ctx context.Context, p types.NilaiSmtParams) ([]NilaiSmtMhs, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("n.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("n.id_kls", p.IDKls)
	cb.AppendInt("k.id_smt", p.IDSmt)
	cb.AppendString("rp.nipd", p.Nipd)
	cb.Like("pd.nm_pd", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "n.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.nilai_smt_mhs n
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = n.id_reg_pd
		LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
		LEFT JOIN pdrd.kelas_kuliah k ON k.id_kls = n.id_kls
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN ref.semester smt ON smt.id_smt = k.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_smt DESC, mk.kode_mk", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT n.id_reg_pd, rp.nipd, pd.nm_pd,
			n.id_kls, k.nm_kls,
			k.id_mk, mk.kode_mk, mk.nm_mk,
			k.id_smt, smt.nm_smt, k.sks_mk,
			n.nilai_angka, n.nilai_huruf, n.nilai_indeks, n.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []NilaiSmtMhs
	for rows.Next() {
		var m NilaiSmtMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Nilai Transkrip ----------------
func (r *repository) GetNilaiTranskrip(ctx context.Context, p types.NilaiTranskripParams) ([]NilaiTranskrip, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("n.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("n.id_mk", p.IDMk)
	cb.AppendInt("n.smt_ke", p.SmtKe)
	cb.AppendString("rp.nipd", p.Nipd)
	cb.Like("pd.nm_pd", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "n.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.nilai_transkrip n
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = n.id_reg_pd
		LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = n.id_mk
		LEFT JOIN pdrd.kelas_kuliah k ON k.id_kls = n.id_kls`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "n.smt_ke, mk.kode_mk", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT n.id_reg_pd, rp.nipd, pd.nm_pd,
			n.id_mk, mk.kode_mk, mk.nm_mk,
			n.id_kls, k.nm_kls,
			n.smt_ke, n.sks_mk,
			n.nilai_angka, n.nilai_huruf, n.nilai_indeks, n.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []NilaiTranskrip
	for rows.Next() {
		var m NilaiTranskrip
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Kehadiran Mahasiswa (siakadu.kehadiran_mhs) ----------------
func (r *repository) GetKehadiranMhs(ctx context.Context, p types.KehadiranMhsParams) ([]KehadiranMhs, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("kh.id_hadir_mhs", p.IDHadirMhs)
	cb.AppendUUID("kh.id_kls", p.IDKls)
	cb.AppendUUID("kh.id_reg_ptk", p.IDRegPtk)
	cb.AppendString("kh.stat_hadir", p.StatHadir)

	conds, args := cb.Build()
	conds = append(conds, "kh.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.kehadiran_mhs kh
		LEFT JOIN pdrd.kelas_kuliah k ON k.id_kls = kh.id_kls
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN pdrd.reg_ptk rptk ON rptk.id_reg_ptk = kh.id_reg_ptk
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = rptk.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "kh.tgl_hadir DESC", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT kh.id_hadir_mhs,
			kh.id_reg_ptk, sdm.nm_sdm,
			kh.id_kls, k.nm_kls,
			mk.kode_mk, mk.nm_mk,
			kh.tgl_hadir,
			CONVERT(VARCHAR(8), kh.waktu_presensi, 108) AS waktu_presensi,
			kh.stat_hadir, kh.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []KehadiranMhs
	for rows.Next() {
		var m KehadiranMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Aktivitas Mahasiswa ----------------
func (r *repository) GetAktMhs(ctx context.Context, p types.AktMhsParams) ([]AktMhs, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_akt_mhs", p.IDAktMhs)
	cb.AppendInt("a.id_jns_akt_mhs", p.IDJnsAktMhs)
	cb.AppendUUID("a.id_sms", p.IDSms)
	cb.AppendInt("a.id_smt", p.IDSmt)
	cb.AppendInt("a.a_komunal", p.AKomunal)
	cb.AppendInt("a.a_flagship", p.AFlagship)
	cb.Like("a.judul_akt_mhs", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.akt_mhs a
		LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = a.id_jns_akt_mhs
		LEFT JOIN pdrd.sms s ON s.id_sms = a.id_sms
		LEFT JOIN ref.semester smt ON smt.id_smt = a.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "a.tgl_mulai DESC", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT a.id_akt_mhs,
			a.id_jns_akt_mhs, jam.nm_jns_akt_mhs,
			a.id_sms, s.nm_lemb AS nm_sms,
			a.id_smt, smt.nm_smt,
			a.judul_akt_mhs, a.lokasi_kegiatan,
			a.sk_tugas, a.tgl_sk_tugas,
			a.tgl_mulai, a.tgl_selesai,
			a.ket_akt, a.a_komunal, a.a_flagship, a.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []AktMhs
	for rows.Next() {
		var m AktMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}
