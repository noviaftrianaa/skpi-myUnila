package common

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data common referensi
type Repository interface {
	GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error)
	GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error)
	GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error)
	GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error)
	GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error)
	GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error)
	GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error)
	GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error)
	GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error)
	GetJalurDaftar(ctx context.Context, params types.PaginationParams) ([]JalurDaftar, int64, error)
	GetJenjangPendidikan(ctx context.Context, params types.JenjangPendidikanParams) ([]JenjangPendidikan, int64, error)
	GetJurusan(ctx context.Context, params types.JurusanParams) ([]Jurusan, int64, error)
	// New entities
	GetKbli(ctx context.Context, params types.KbliParams) ([]Kbli, int64, error)
	GetKeahlianLab(ctx context.Context, params types.PaginationParams) ([]KeahlianLab, int64, error)
	GetKebutuhanKhusus(ctx context.Context, params types.PaginationParams) ([]KebutuhanKhusus, int64, error)
	GetKriteriaMitra(ctx context.Context, params types.PaginationParams) ([]KriteriaMitra, int64, error)
	GetLevelWilayah(ctx context.Context, params types.PaginationParams) ([]LevelWilayah, int64, error)
	GetMediaPublikasi(ctx context.Context, params types.MediaPublikasiParams) ([]MediaPublikasi, int64, error)
	GetNegara(ctx context.Context, params types.NegaraParams) ([]Negara, int64, error)
	GetNilaiAkred(ctx context.Context, params types.PaginationParams) ([]NilaiAkred, int64, error)
	GetPangkatGolongan(ctx context.Context, params types.PangkatGolonganParams) ([]PangkatGolongan, int64, error)
	GetPekerjaan(ctx context.Context, params types.PaginationParams) ([]Pekerjaan, int64, error)
	GetPembiayaan(ctx context.Context, params types.PaginationParams) ([]Pembiayaan, int64, error)
	GetPenghasilan(ctx context.Context, params types.PaginationParams) ([]Penghasilan, int64, error)
	GetSatuan(ctx context.Context, params types.PaginationParams) ([]Satuan, int64, error)
	GetTahunAnggaran(ctx context.Context, params types.TahunAnggaranParams) ([]TahunAnggaran, int64, error)
	GetTse(ctx context.Context, params types.TseParams) ([]Tse, int64, error)
	GetSkimKegiatan(ctx context.Context, params types.SkimKegiatanParams) ([]SkimKegiatan, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(DB *sqlx.DB) Repository {
	return &repository{
		db: DB,
	}
}

// ============================================================================
// Semester
// ============================================================================
func (r *repository) GetSemesters(
	ctx context.Context,
	params types.SemesterParams,
) ([]Semester, int64, error) {

	params.NormalizePagination()

	// ===== Build conditions =====
	cb := helper.NewCondBuilder()
	cb.AppendInt("s.id_thn_ajaran", params.TahunAjaran)
	cb.AppendInt("s.a_periode_aktif", params.PeriodeAktif)
	cb.Like("s.nm_smt", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "s.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.semester s
		LEFT JOIN ref.tahun_ajaran t ON t.id_thn_ajaran = s.id_thn_ajaran
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "s.id_smt"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			s.id_smt, s.id_thn_ajaran, s.nm_smt, s.smt, s.a_periode_aktif, s.tgl_mulai, s.tgl_selesai, s.create_date, s.last_update, s.expired_date,
			t.nm_thn_ajaran
		FROM ref.semester s
		LEFT JOIN ref.tahun_ajaran t ON t.id_thn_ajaran = s.id_thn_ajaran
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Semester
	for rows.Next() {
		var s Semester
		if err := rows.StructScan(&s); err != nil {
			return nil, 0, err
		}
		result = append(result, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// Tahun Ajaran
// ============================================================================

func (r *repository) GetTahunAjarans(ctx context.Context, params types.TahunAjaranParams) ([]TahunAjaran, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_periode_aktif", params.PeriodeAktif)
	cb.Like("nm_thn_ajaran", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.tahun_ajaran",
			Select: `id_thn_ajaran, nm_thn_ajaran, a_periode_aktif, tgl_mulai, 
				tgl_selesai, create_date, last_update, expired_date`,
			DefaultSort: "id_thn_ajaran",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (TahunAjaran, error) {
			var t TahunAjaran
			err := rows.Scan(
				&t.IDThnAjaran,
				&t.NmThnAjaran,
				&t.APeriodeAktif,
				&t.TglMulai,
				&t.TglSelesai,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// Agama
// ============================================================================

func (r *repository) GetAgamas(ctx context.Context, params types.PaginationParams) ([]Agama, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_agama", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.agama",
			Select:      "id_agama, nm_agama, create_date, last_update, expired_date",
			DefaultSort: "id_agama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Agama, error) {
			var a Agama
			err := rows.Scan(
				&a.IDAgama,
				&a.NmAgama,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Wilayah
// ============================================================================

func (r *repository) GetWilayahs(ctx context.Context, params types.WilayahParams) ([]Wilayah, int64, error) {

	params.NormalizePagination()

	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendString("w.id_negara", params.IDNegara)
	cb.AppendInt("w.id_level_wil", params.Level)
	cb.AppendString("w.id_induk_wilayah", params.IDIndukWilayah)
	cb.Like("w.nm_wil", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "w.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	countQuery := fmt.Sprintf(
		`SELECT COUNT(*) FROM ref.wilayah w LEFT JOIN ref.negara n ON n.id_negara = w.id_negara WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "w.id_wil"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			w.id_wil, n.id_negara, w.nm_wil, w.asal_wil, w.kode_bps, w.kode_dagri,
			w.kode_keu, w.id_induk_wilayah, w.id_level_wil, w.create_date, w.last_update, w.expired_date, n.nm_negara
		FROM ref.wilayah w
		LEFT JOIN ref.negara n ON n.id_negara = w.id_negara
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Wilayah
	for rows.Next() {
		var w Wilayah
		if err := rows.StructScan(&w); err != nil {
			return nil, 0, err
		}
		result = append(result, w)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// Aktifitas Kerjasama
// ============================================================================

func (r *repository) GetAktifitasKerjasama(ctx context.Context, params types.PaginationParams) ([]AktifitasKerjasama, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_akt_kerjasama", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.aktifitas_kerjasama",
			Select:      "id_akt_kerjasama, nm_akt_kerjasama, ket, create_date, last_update, expired_date",
			DefaultSort: "id_akt_kerjasama",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (AktifitasKerjasama, error) {
			var a AktifitasKerjasama
			err := rows.Scan(
				&a.IDAktKerjasama,
				&a.NmAktKerjasama,
				&a.Ket,
				&a.CreateDate,
				&a.LastUpdate,
				&a.ExpiredDate,
			)
			return a, err
		},
	)
}

// ============================================================================
// Basis Evaluasi
// ============================================================================

func (r *repository) GetBasisEvaluasi(ctx context.Context, params types.PaginationParams) ([]BasisEvaluasi, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_basis_evaluasi", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.basis_evaluasi",
			Select:      "id_basis_evaluasi, nm_basis_evaluasi, create_date, last_update, expired_date",
			DefaultSort: "id_basis_evaluasi",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (BasisEvaluasi, error) {
			var b BasisEvaluasi
			err := rows.Scan(
				&b.IDBasisEvaluasi,
				&b.NmBasisEvaluasi,
				&b.CreateDate,
				&b.LastUpdate,
				&b.ExpiredDate,
			)
			return b, err
		},
	)
}

// ============================================================================
// Fungsi Lab
// ============================================================================

func (r *repository) GetFungsiLab(ctx context.Context, params types.PaginationParams) ([]FungsiLab, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_fungsi_lab", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.fungsi_lab",
			Select:      "id_fungsi_lab, nm_fungsi_lab, create_date, last_update, expired_date",
			DefaultSort: "id_fungsi_lab",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (FungsiLab, error) {
			var f FungsiLab
			err := rows.Scan(
				&f.IDFungsiLab,
				&f.NmFungsiLab,
				&f.CreateDate,
				&f.LastUpdate,
				&f.ExpiredDate,
			)
			return f, err
		},
	)
}

// ============================================================================
// Gelar Akademik
// ============================================================================

func (r *repository) GetGelarAkademik(ctx context.Context, params types.GelarAkademikParams) ([]GelarAkademik, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendInt("posisi_gelar", params.PosisiGelar)
	cb.Like("nm_gelar_akad", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.gelar_akademik",
			Select: `id_gelar_akad, singkat_gelar, nm_gelar_akad, posisi_gelar, 
				create_date, last_update, expired_date`,
			DefaultSort: "id_gelar_akad",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (GelarAkademik, error) {
			var g GelarAkademik
			err := rows.Scan(
				&g.IDGelarAkad,
				&g.SingkatGelar,
				&g.NmGelarAkad,
				&g.PosisiGelar,
				&g.CreateDate,
				&g.LastUpdate,
				&g.ExpiredDate,
			)
			return g, err
		},
	)
}

// ============================================================================
// Ikatan Kerja SDM
// ============================================================================

func (r *repository) GetIkatanKerjaSdm(ctx context.Context, params types.PaginationParams) ([]IkatanKerjaSdm, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_ikatan_kerja", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.ikatan_kerja_sdm",
			Select: `id_ikatan_kerja, nm_ikatan_kerja, ket_ikatan_kerja, 
				create_date, last_update, expired_date`,
			DefaultSort: "id_ikatan_kerja",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (IkatanKerjaSdm, error) {
			var i IkatanKerjaSdm
			err := rows.Scan(
				&i.IDIkatanKerja,
				&i.NmIkatanKerja,
				&i.KetIkatanKerja,
				&i.CreateDate,
				&i.LastUpdate,
				&i.ExpiredDate,
			)
			return i, err
		},
	)
}
func (r *repository) GetJalurDaftar(ctx context.Context, params types.PaginationParams) ([]JalurDaftar, int64, error) {
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.Like("nm_jalur_daftar", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jalur_daftar",
			Select:      `id_jalur_daftar, nm_jalur_daftar, create_date, last_update, expired_date`,
			DefaultSort: "id_jalur_daftar",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JalurDaftar, error) {
			var i JalurDaftar
			err := rows.Scan(
				&i.IDJalurDaftar,
				&i.NmJalurDaftar,
				&i.CreateDate,
				&i.LastUpdate,
				&i.ExpiredDate,
			)
			return i, err
		},
	)
}

// ============================================================================
// Jenjang Pendidikan
// ============================================================================

func (r *repository) GetJenjangPendidikan(ctx context.Context, params types.JenjangPendidikanParams) ([]JenjangPendidikan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("u_jenj_lemb", params.UJenjLemb)
	cb.AppendInt("u_jenj_org", params.UJenjOrg)
	cb.Like("nm_jenj_didik", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenjang_pendidikan",
			Select:      `id_jenj_didik, nm_jenj_didik, u_jenj_lemb, u_jenj_org, create_date, last_update, expired_date`,
			DefaultSort: "id_jenj_didik",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenjangPendidikan, error) {
			var j JenjangPendidikan
			err := rows.Scan(
				&j.IDJenjDidik,
				&j.NmJenjDidik,
				&j.UJenjLemb,
				&j.UJenjOrg,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jurusan
// ============================================================================

func (r *repository) GetJurusan(ctx context.Context, params types.JurusanParams) ([]Jurusan, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("j.id_jenj_didik", params.IDJenjDidik)
	cb.AppendUUID("j.id_kel_bidang", params.IDKelBidang)
	cb.AppendString("j.kode_nomenklatur", params.KodeNomenklatur)
	cb.AppendInt("j.u_sma", params.USma)
	cb.AppendInt("j.u_smk", params.USmk)
	cb.AppendInt("j.u_pt", params.UPt)
	cb.AppendInt("j.u_slb", params.USlb)
	cb.Like("j.nm_jur", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "j.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")

	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.jurusan j
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = j.id_jenj_didik LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = j.id_kel_bidang
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "j.id_jur"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			j.id_jur, j.nm_jur, j.nm_intl_jur, j.kode_nomenklatur, j.u_sma, j.u_smk, j.u_pt, j.u_slb, j.id_induk_jurusan, j.id_jenj_didik, j.id_kel_bidang, j.create_date, j.last_update, j.expired_date, jp.nm_jenj_didik, kb.nm_kel_bidang
		FROM ref.jurusan j
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = j.id_jenj_didik
		LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = j.id_kel_bidang
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Jurusan
	for rows.Next() {
		var s Jurusan
		if err := rows.StructScan(&s); err != nil {
			return nil, 0, err
		}
		result = append(result, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// Kbli
// ============================================================================

func (r *repository) GetKbli(ctx context.Context, params types.KbliParams) ([]Kbli, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_induk_kbli", params.IDIndukKbli)
	cb.AppendString("kategori", params.Kategori)
	cb.AppendString("kode", params.Kode)
	cb.AppendInt("lv_kbli", params.LvKbli)
	cb.Like("judul", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kbli",
			Select:      `id_kbli, id_induk_kbli, kategori, kode, judul, lv_kbli, create_date, last_update, expired_date`,
			DefaultSort: "id_kbli",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Kbli, error) {
			var k Kbli
			err := rows.Scan(
				&k.IDKbli,
				&k.IDIndukKbli,
				&k.Kategori,
				&k.Kode,
				&k.Judul,
				&k.LvKbli,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KeahlianLab
// ============================================================================

func (r *repository) GetKeahlianLab(ctx context.Context, params types.PaginationParams) ([]KeahlianLab, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_keahlian_lab", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.keahlian_lab",
			Select:      `id_keahlian_lab, nm_keahlian_lab, create_date, last_update, expired_date`,
			DefaultSort: "id_keahlian_lab",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KeahlianLab, error) {
			var k KeahlianLab
			err := rows.Scan(
				&k.IDKeahlianLab,
				&k.NmKeahlianLab,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KebutuhanKhusus
// ============================================================================

func (r *repository) GetKebutuhanKhusus(ctx context.Context, params types.PaginationParams) ([]KebutuhanKhusus, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kk", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kebutuhan_khusus",
			Select:      `id_kk, nm_kk, create_date, last_update, expired_date`,
			DefaultSort: "id_kk",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KebutuhanKhusus, error) {
			var k KebutuhanKhusus
			err := rows.Scan(
				&k.IDKk,
				&k.NmKk,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// KriteriaMitra
// ============================================================================

func (r *repository) GetKriteriaMitra(ctx context.Context, params types.PaginationParams) ([]KriteriaMitra, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kriteria_mitra", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kriteria_mitra",
			Select:      `id_kriteria_mitra, nm_kriteria_mitra, ket, create_date, last_update, expired_date`,
			DefaultSort: "id_kriteria_mitra",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KriteriaMitra, error) {
			var k KriteriaMitra
			err := rows.Scan(
				&k.IDKriteriaMitra,
				&k.NmKriteriaMitra,
				&k.Ket,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// LevelWilayah
// ============================================================================

func (r *repository) GetLevelWilayah(ctx context.Context, params types.PaginationParams) ([]LevelWilayah, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_level_wilayah", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.level_wilayah",
			Select:      `id_level_wil, nm_level_wilayah, create_date, last_update, expired_date`,
			DefaultSort: "id_level_wil",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (LevelWilayah, error) {
			var l LevelWilayah
			err := rows.Scan(
				&l.IDLevelWil,
				&l.NmLevelWilayah,
				&l.CreateDate,
				&l.LastUpdate,
				&l.ExpiredDate,
			)
			return l, err
		},
	)
}

// ============================================================================
// MediaPublikasi
// ============================================================================

func (r *repository) GetMediaPublikasi(ctx context.Context, params types.MediaPublikasiParams) ([]MediaPublikasi, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("mp.id_jns_media", params.IDJnsMedia)
	cb.AppendUUID("mp.id_kel_bidang", params.IDKelBidang)
	cb.AppendUUID("mp.id_sp", params.IDSp)
	cb.AppendString("mp.id_negara", params.IDNegara)
	cb.AppendString("mp.bentuk_media_pub", params.BentukMediaPub)
	cb.AppendString("mp.grade_sinta", params.GradeSinta)
	cb.AppendString("mp.jns_penerbit", params.JnsPenerbit)
	cb.Like("mp.nm_media_pub", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "mp.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.media_publikasi mp
		LEFT JOIN ref.jenis_media_pub jm ON mp.id_jns_media = jm.id_jns_media LEFT JOIN ref.kelompok_bidang kb ON mp.id_kel_bidang = kb.id_kel_bidang LEFT JOIN pdrd.satuan_pendidikan sp ON mp.id_sp = sp.id_sp LEFT JOIN ref.negara n ON mp.id_negara = n.id_negara
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "mp.id_media_pub"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			mp.id_media_pub, mp.id_jns_media, mp.id_kel_bidang, mp.id_sp, mp.id_negara, mp.nm_media_pub, mp.bentuk_media_pub, mp.grade_sinta, mp.jns_penerbit, mp.create_date, mp.last_update, mp.expired_date, jm.nm_jns_media, kb.nm_kel_bidang, sp.nm_lemb, n.nm_negara
		FROM ref.media_publikasi mp
		LEFT JOIN ref.jenis_media_pub jm ON mp.id_jns_media = jm.id_jns_media LEFT JOIN ref.kelompok_bidang kb ON mp.id_kel_bidang = kb.id_kel_bidang LEFT JOIN pdrd.satuan_pendidikan sp ON mp.id_sp = sp.id_sp LEFT JOIN ref.negara n ON mp.id_negara = n.id_negara
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []MediaPublikasi
	for rows.Next() {
		var m MediaPublikasi
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// Negara
// ============================================================================

func (r *repository) GetNegara(ctx context.Context, params types.NegaraParams) ([]Negara, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_ln", params.ALn)
	cb.AppendInt("benua", params.Benua)
	cb.Like("nm_negara", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.negara",
			Select:      `id_negara, nm_negara, a_ln, benua, create_date, last_update, expired_date`,
			DefaultSort: "id_negara",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Negara, error) {
			var n Negara
			err := rows.Scan(
				&n.IDNegara,
				&n.NmNegara,
				&n.ALn,
				&n.Benua,
				&n.CreateDate,
				&n.LastUpdate,
				&n.ExpiredDate,
			)
			return n, err
		},
	)
}

// ============================================================================
// NilaiAkred
// ============================================================================

func (r *repository) GetNilaiAkred(ctx context.Context, params types.PaginationParams) ([]NilaiAkred, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_akred", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.nilai_akred",
			Select:      `id_akred, nm_akred, create_date, last_update, expired_date`,
			DefaultSort: "id_akred",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (NilaiAkred, error) {
			var n NilaiAkred
			err := rows.Scan(
				&n.IDAkred,
				&n.NmAkred,
				&n.CreateDate,
				&n.LastUpdate,
				&n.ExpiredDate,
			)
			return n, err
		},
	)
}

// ============================================================================
// PangkatGolongan
// ============================================================================

func (r *repository) GetPangkatGolongan(ctx context.Context, params types.PangkatGolonganParams) ([]PangkatGolongan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendString("kode_gol", params.KodeGol)
	cb.Like("nm_pangkat", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.pangkat_golongan",
			Select:      `id_pangkat_gol, kode_gol, nm_pangkat, create_date, last_update, expired_date`,
			DefaultSort: "id_pangkat_gol",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (PangkatGolongan, error) {
			var p PangkatGolongan
			err := rows.Scan(
				&p.IDPangkatGol,
				&p.KodeGol,
				&p.NmPangkat,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// Pembiayaan
// ============================================================================

func (r *repository) GetPembiayaan(ctx context.Context, params types.PaginationParams) ([]Pembiayaan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_pembiayaan", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.pembiayaan",
			Select:      `id_pembiayaan, nm_pembiayaan, create_date, last_update, expired_date`,
			DefaultSort: "id_pembiayaan",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Pembiayaan, error) {
			var p Pembiayaan
			err := rows.Scan(
				&p.IDPembiayaan,
				&p.NmPembiayaan,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// Pekerjaan
// ============================================================================

func (r *repository) GetPekerjaan(ctx context.Context, params types.PaginationParams) ([]Pekerjaan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_pekerjaan", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.pekerjaan",
			Select:      `id_pekerjaan, nm_pekerjaan, create_date, last_update, expired_date`,
			DefaultSort: "id_pekerjaan",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Pekerjaan, error) {
			var p Pekerjaan
			err := rows.Scan(
				&p.IDPekerjaan,
				&p.NmPekerjaan,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// Penghasilan
// ============================================================================

func (r *repository) GetPenghasilan(ctx context.Context, params types.PaginationParams) ([]Penghasilan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_penghasilan", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.penghasilan",
			Select:      `id_penghasilan, nm_penghasilan, create_date, last_update, expired_date`,
			DefaultSort: "id_penghasilan",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Penghasilan, error) {
			var p Penghasilan
			err := rows.Scan(
				&p.IDPenghasilan,
				&p.NmPenghasilan,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// Satuan
// ============================================================================

func (r *repository) GetSatuan(ctx context.Context, params types.PaginationParams) ([]Satuan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_satuan", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.satuan",
			Select:      `kd_satuan, nm_satuan, create_date, last_update, expired_date`,
			DefaultSort: "kd_satuan",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (Satuan, error) {
			var s Satuan
			err := rows.Scan(
				&s.KdSatuan,
				&s.NmSatuan,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}

// ============================================================================
// TahunAnggaran
// ============================================================================

func (r *repository) GetTahunAnggaran(ctx context.Context, params types.TahunAnggaranParams) ([]TahunAnggaran, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_periode_aktif", params.APeriodeAktif)
	cb.Like("nm_tahun_anggaran", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.tahun_anggaran",
			Select:      `id_tahun_anggaran, nm_tahun_anggaran, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date`,
			DefaultSort: "id_tahun_anggaran",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (TahunAnggaran, error) {
			var t TahunAnggaran
			err := rows.Scan(
				&t.IDTahunAnggaran,
				&t.NmTahunAnggaran,
				&t.APeriodeAktif,
				&t.TglMulai,
				&t.TglSelesai,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// Tse
// ============================================================================

func (r *repository) GetTse(ctx context.Context, params types.TseParams) ([]Tse, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendString("kode_tse", params.KodeTse)
	cb.Like("nm_tse", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.tse",
			Select:      `id_tse, kode_tse, nm_tse, create_date, last_update, expired_date`,
			DefaultSort: "id_tse",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Tse, error) {
			var t Tse
			err := rows.Scan(
				&t.IDTse,
				&t.KodeTse,
				&t.NmTse,
				&t.CreateDate,
				&t.LastUpdate,
				&t.ExpiredDate,
			)
			return t, err
		},
	)
}

// ============================================================================
// SkimKegiatan
// ============================================================================

func (r *repository) GetSkimKegiatan(ctx context.Context, params types.SkimKegiatanParams) ([]SkimKegiatan, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("sk.id_jenj_didik", params.IDJenjDidik)
	cb.AppendString("sk.kd_skim", params.KdSkim)
	cb.AppendInt("sk.jml_min_personil", params.JmlMinPersonil)
	cb.AppendInt("sk.jml_maks_personil", params.JmlMaksPersonil)
	cb.AppendInt("sk.jml_maks_keikutsertaan", params.JmlMaksKeikutsertaan)
	cb.AppendInt("sk.jml_maks_sbg_ketua", params.JmlMaksSbgKetua)
	cb.AppendFloat("sk.dana_min_thn_berjalan", params.DanaMinThnBerjalan)
	cb.AppendFloat("sk.dana_maks_thn_berjalan", params.DanaMaksThnBerjalan)
	cb.AppendFloat("sk.deviasi_nilai", params.DeviasiNilai)
	cb.AppendFloat("sk.passing_grade", params.PassingGrade)
	cb.Like("sk.nm_skim", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "sk.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.skim_kegiatan sk
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sk.id_jenj_didik
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "sk.id_skim"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			sk.id_skim, sk.id_jenj_didik, sk.nm_skim, sk.nm_singkat_skim, sk.kd_skim, sk.tst_skim, sk.jml_min_personil, sk.jml_maks_personil, sk.jml_maks_keikutsertaan, sk.jml_maks_sbg_ketua, sk.dana_min_thn_berjalan, sk.dana_maks_thn_berjalan, sk.ket_skim, sk.deviasi_nilai, sk.passing_grade, sk.create_date, sk.last_update, sk.expired_date, jp.nm_jenj_didik
		FROM ref.skim_kegiatan sk
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sk.id_jenj_didik
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause,
		sortBy,
		params.Order,
		len(args)+1,
		len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SkimKegiatan
	for rows.Next() {
		var s SkimKegiatan
		if err := rows.StructScan(&s); err != nil {
			return nil, 0, err
		}
		result = append(result, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil

	// return helper.QueryPaged(
	// 	ctx,
	// 	r.db,
	// 	helper.BaseQueryConfig{
	// 		Table:       "ref.skim_kegiatan",
	// 		Select:      `id_skim, id_jenj_didik, nm_skim, nm_singkat_skim, kd_skim, tst_skim, jml_min_personil, jml_maks_personil, jml_maks_keikutsertaan, jml_maks_sbg_ketua, dana_min_thn_berjalan, dana_maks_thn_berjalan, ket_skim, deviasi_nilai, passing_grade, create_date, last_update, expired_date`,
	// 		DefaultSort: "id_skim",
	// 	},
	// 	params.PaginationParams,
	// 	conds,
	// 	args,
	// 	func(rows *sql.Rows) (SkimKegiatan, error) {
	// 		var s SkimKegiatan
	// 		err := rows.Scan(
	// 			&s.IDSkim,
	// 			&s.IDJenjDidik,
	// 			&s.NmSkim,
	// 			&s.NmSingkatSkim,
	// 			&s.KdSkim,
	// 			&s.TstSkim,
	// 			&s.JmlMinPersonil,
	// 			&s.JmlMaksPersonil,
	// 			&s.JmlMaksKeikutsertaan,
	// 			&s.JmlMaksSbgKetua,
	// 			&s.DanaMinThnBerjalan,
	// 			&s.DanaMaksThnBerjalan,
	// 			&s.KetSkim,
	// 			&s.DeviasiNilai,
	// 			&s.PassingGrade,
	// 			&s.CreateDate,
	// 			&s.LastUpdate,
	// 			&s.ExpiredDate,
	// 		)
	// 		return s, err
	// 	},
	// )
}
