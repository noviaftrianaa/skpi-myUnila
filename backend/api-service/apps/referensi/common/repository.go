package common

import (
	"context"
	"database/sql"

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

func (r *repository) GetSemesters(ctx context.Context, params types.SemesterParams) ([]Semester, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_thn_ajaran", params.TahunAjaran)
	cb.AppendInt("a_periode_aktif", params.PeriodeAktif)
	cb.Like("nm_smt", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.semester",
			Select: `id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif,
				tgl_mulai, tgl_selesai, create_date, last_update, expired_date`,
			DefaultSort: "id_smt",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Semester, error) {
			var s Semester
			err := rows.Scan(
				&s.IDSmt,
				&s.IDThnAjaran,
				&s.NmSmt,
				&s.Smt,
				&s.APeriodeAktif,
				&s.TglMulai,
				&s.TglSelesai,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
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
	// Build conditions using CondBuilder
	cb := helper.NewCondBuilder()
	cb.AppendString("id_negara", params.IDNegara)
	cb.AppendInt("id_level_wil", params.Level)
	cb.AppendString("id_induk_wilayah", params.IDIndukWilayah)
	cb.Like("nm_wil", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table: "ref.wilayah",
			Select: `id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri, 
				kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date`,
			DefaultSort: "id_wil",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Wilayah, error) {
			var w Wilayah
			err := rows.Scan(
				&w.IDWil,
				&w.IDNegara,
				&w.NmWil,
				&w.AsalWil,
				&w.KodeBps,
				&w.KodeDagri,
				&w.KodeKeu,
				&w.IDIndukWilayah,
				&w.IDLevelWil,
				&w.CreateDate,
				&w.LastUpdate,
				&w.ExpiredDate,
			)
			return w, err
		},
	)
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
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_jenj_didik", params.IDJenjDidik)
	cb.AppendUUID("id_kel_bidang", params.IDKelBidang)
	cb.AppendString("kode_nomenklatur", params.KodeNomenklatur)
	cb.AppendInt("u_sma", params.USma)
	cb.AppendInt("u_smk", params.USmk)
	cb.AppendInt("u_pt", params.UPt)
	cb.AppendInt("u_slb", params.USlb)
	cb.Like("nm_jur", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jurusan",
			Select:      `id_jur, nm_jur, nm_intl_jur, kode_nomenklatur, u_sma, u_smk, u_pt, u_slb, id_induk_jurusan, id_jenj_didik, id_kel_bidang, create_date, last_update, expired_date`,
			DefaultSort: "id_jur",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (Jurusan, error) {
			var j Jurusan
			err := rows.Scan(
				&j.IDJur,
				&j.NmJur,
				&j.NmIntlJur,
				&j.KodeNomenklatur,
				&j.USma,
				&j.USmk,
				&j.UPt,
				&j.USlb,
				&j.IdIndukJurusan,
				&j.IDJenjDidik,
				&j.IDKelBidang,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
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
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_jns_media", params.IDJnsMedia)
	cb.AppendUUID("id_kel_bidang", params.IDKelBidang)
	cb.AppendUUID("id_sp", params.IDSp)
	cb.AppendString("id_negara", params.IDNegara)
	cb.AppendString("bentuk_media_pub", params.BentukMediaPub)
	cb.AppendString("grade_sinta", params.GradeSinta)
	cb.AppendString("jns_penerbit", params.JnsPenerbit)
	cb.Like("nm_media_pub", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.media_publikasi",
			Select:      `id_media_pub, id_jns_media, id_kel_bidang, id_sp, id_negara, nm_media_pub, bentuk_media_pub, grade_sinta, jns_penerbit, create_date, last_update, expired_date`,
			DefaultSort: "id_media_pub",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (MediaPublikasi, error) {
			var m MediaPublikasi
			err := rows.Scan(
				&m.IDMediaPub,
				&m.IDJnsMedia,
				&m.IDKelBidang,
				&m.IDSp,
				&m.IDNegara,
				&m.NmMediaPub,
				&m.BentukMediaPub,
				&m.GradeSinta,
				&m.JnsPenerbit,
				&m.CreateDate,
				&m.LastUpdate,
				&m.ExpiredDate,
			)
			return m, err
		},
	)
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
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_jenj_didik", params.IDJenjDidik)
	cb.AppendString("kd_skim", params.KdSkim)
	cb.AppendInt("jml_min_personil", params.JmlMinPersonil)
	cb.AppendInt("jml_maks_personil", params.JmlMaksPersonil)
	cb.AppendInt("jml_maks_keikutsertaan", params.JmlMaksKeikutsertaan)
	cb.AppendInt("jml_maks_sbg_ketua", params.JmlMaksSbgKetua)
	cb.AppendFloat("dana_min_thn_berjalan", params.DanaMinThnBerjalan)
	cb.AppendFloat("dana_maks_thn_berjalan", params.DanaMaksThnBerjalan)
	cb.AppendFloat("deviasi_nilai", params.DeviasiNilai)
	cb.AppendFloat("passing_grade", params.PassingGrade)
	cb.Like("nm_skim", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.skim_kegiatan",
			Select:      `id_skim, id_jenj_didik, nm_skim, nm_singkat_skim, kd_skim, tst_skim, jml_min_personil, jml_maks_personil, jml_maks_keikutsertaan, jml_maks_sbg_ketua, dana_min_thn_berjalan, dana_maks_thn_berjalan, ket_skim, deviasi_nilai, passing_grade, create_date, last_update, expired_date`,
			DefaultSort: "id_skim",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (SkimKegiatan, error) {
			var s SkimKegiatan
			err := rows.Scan(
				&s.IDSkim,
				&s.IDJenjDidik,
				&s.NmSkim,
				&s.NmSingkatSkim,
				&s.KdSkim,
				&s.TstSkim,
				&s.JmlMinPersonil,
				&s.JmlMaksPersonil,
				&s.JmlMaksKeikutsertaan,
				&s.JmlMaksSbgKetua,
				&s.DanaMinThnBerjalan,
				&s.DanaMaksThnBerjalan,
				&s.KetSkim,
				&s.DeviasiNilai,
				&s.PassingGrade,
				&s.CreateDate,
				&s.LastUpdate,
				&s.ExpiredDate,
			)
			return s, err
		},
	)
}
