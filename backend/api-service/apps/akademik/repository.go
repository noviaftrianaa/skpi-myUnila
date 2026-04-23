package akademik

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
)

type Repository interface {
	GetMatkulList(ctx context.Context, p MatkulParams) ([]Matkul, int64, error)
	GetMatkulDetail(ctx context.Context, p MatkulParams) ([]MatkulDetail, int64, error)
	GetKelasKuliah(ctx context.Context, p KelasKuliahParams) ([]KelasKuliah, int64, error)
	GetJadwalKelas(ctx context.Context, p JadwalKelasParams) ([]JadwalKelas, int64, error)
	GetKurikulum(ctx context.Context, p KurikulumParams) ([]Kurikulum, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

// ---------------- Matkul ----------------
func (r *repository) GetMatkulList(ctx context.Context, p MatkulParams) ([]Matkul, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("m.id_mk", p.IDMk)
	cb.AppendUUID("m.id_sms", p.IDSms)
	cb.AppendInt("m.id_jenj_didik", p.IDJenjDidik)
	cb.AppendInt("m.id_jns_mk", p.IDJnsMk)
	cb.AppendInt("m.id_kel_mk", p.IDKelMk)
	cb.AppendString("m.kode_mk", p.KodeMk)
	cb.Like("m.nm_mk", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "m.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.matkul m WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "m.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT m.id_mk, m.id_sms, m.kode_mk, m.nm_mk,
			m.sks_mk, m.sks_tm, m.sks_prak, m.sks_prak_lap, m.sks_sim,
			m.jns_mk, m.kel_mk,
			m.id_jns_mk, m.id_kel_mk, m.id_jenj_didik,
			m.tgl_mulai_efektif, m.tgl_akhir_efektif, m.last_sync
		FROM pdrd.matkul m
		WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Matkul
	for rows.Next() {
		var m Matkul
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetMatkulDetail(ctx context.Context, p MatkulParams) ([]MatkulDetail, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("m.id_mk", p.IDMk)
	cb.AppendUUID("m.id_sms", p.IDSms)
	cb.AppendInt("m.id_jenj_didik", p.IDJenjDidik)
	cb.AppendInt("m.id_jns_mk", p.IDJnsMk)
	cb.AppendString("m.kode_mk", p.KodeMk)
	cb.Like("m.nm_mk", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "m.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.matkul m
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms
		LEFT JOIN ref.jenis_mk jm ON jm.id_jns_mk = m.id_jns_mk
		LEFT JOIN ref.kelompok_mk km ON km.id_kel_mk = m.id_kel_mk
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = m.id_jenj_didik`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "m.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT m.id_mk, m.id_sms, s.nm_lemb AS nm_sms,
			m.kode_mk, m.nm_mk,
			m.sks_mk, m.sks_tm, m.sks_prak, m.sks_prak_lap, m.sks_sim,
			m.jns_mk, m.kel_mk,
			m.id_jns_mk, jm.nm_jns_mk,
			m.id_kel_mk, km.nm_kel_mk,
			m.id_jenj_didik, jp.nm_jenj_didik,
			m.metode_pelaksanaan_kuliah, m.a_sap, m.a_silabus, m.a_bahan_ajar,
			m.tgl_mulai_efektif, m.tgl_akhir_efektif, m.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []MatkulDetail
	for rows.Next() {
		var m MatkulDetail
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Kelas Kuliah ----------------
func (r *repository) GetKelasKuliah(ctx context.Context, p KelasKuliahParams) ([]KelasKuliah, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_kls", p.IDKls)
	cb.AppendInt("k.id_smt", p.IDSmt)
	cb.AppendUUID("k.id_sms", p.IDSms)
	cb.AppendUUID("k.id_mk", p.IDMk)
	cb.Like("k.nm_kls", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.kelas_kuliah k
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN pdrd.sms s ON s.id_sms = k.id_sms
		LEFT JOIN ref.semester smt ON smt.id_smt = k.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_smt DESC, mk.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT k.id_kls, k.nm_kls,
			k.id_smt, smt.nm_smt,
			k.id_sms, s.nm_lemb AS nm_sms,
			k.id_mk, mk.kode_mk, mk.nm_mk,
			k.sks_mk, k.sks_tm, k.sks_prak,
			k.bahasan_case, k.lingkup_kelas, k.mode_kuliah,
			k.kuota_pditt, k.kode_vclass, k.url_vclass, k.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KelasKuliah
	for rows.Next() {
		var m KelasKuliah
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Jadwal Kelas ----------------
func (r *repository) GetJadwalKelas(ctx context.Context, p JadwalKelasParams) ([]JadwalKelas, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("j.id_jdwl_kls", p.IDJdwlKls)
	cb.AppendUUID("j.id_kls", p.IDKls)
	cb.AppendInt("j.id_smt", p.IDSmt)
	cb.AppendString("j.status", p.Status)

	conds, args := cb.Build()
	conds = append(conds, "j.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.jadwal_kelas j
		LEFT JOIN pdrd.kelas_kuliah k ON k.id_kls = j.id_kls
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN ref.semester smt ON smt.id_smt = j.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "j.tgl_jadwal, j.waktu_mulai", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT j.id_jdwl_kls,
			j.id_kls, k.nm_kls,
			mk.kode_mk, mk.nm_mk,
			j.id_smt, smt.nm_smt,
			j.pertemuan, j.tgl_jadwal,
			CONVERT(VARCHAR(8), j.waktu_mulai, 108) AS waktu_mulai,
			CONVERT(VARCHAR(8), j.waktu_selesai, 108) AS waktu_selesai,
			j.lokasi, j.status, j.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []JadwalKelas
	for rows.Next() {
		var m JadwalKelas
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------- Kurikulum ----------------
func (r *repository) GetKurikulum(ctx context.Context, p KurikulumParams) ([]Kurikulum, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("ks.id_kurikulum_sp", p.IDKurikulumSp)
	cb.AppendUUID("ks.id_sms", p.IDSms)
	cb.AppendInt("ks.id_smt", p.IDSmt)
	cb.AppendInt("ks.id_jenj_didik", p.IDJenjDidik)
	cb.AppendInt("ks.a_digunakan", p.ADigunakan)
	cb.Like("ks.nm_kurikulum_sp", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "ks.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.kurikulum_sp ks
		LEFT JOIN pdrd.sms s ON s.id_sms = ks.id_sms
		LEFT JOIN ref.semester smt ON smt.id_smt = ks.id_smt
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = ks.id_jenj_didik`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "ks.nm_kurikulum_sp", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT ks.id_kurikulum_sp, ks.nm_kurikulum_sp,
			ks.id_jenj_didik, jp.nm_jenj_didik,
			ks.id_smt, smt.nm_smt,
			ks.id_sms, s.nm_lemb AS nm_sms,
			ks.jmlh_smt_normal, ks.a_digunakan,
			ks.jmlh_sks_lulus, ks.jmlh_sks_wajib, ks.jmlh_sks_pilihan,
			ks.jmlh_sks_mk_wajib, ks.jmlh_sks_mk_pilih, ks.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Kurikulum
	for rows.Next() {
		var m Kurikulum
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}
