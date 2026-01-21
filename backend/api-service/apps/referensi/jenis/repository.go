package jenis

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data jenis referensi
type Repository interface {
	GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error)
	GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error)
	GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error)
	GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error)
	GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error)
	GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error)
	GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error)
	GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error)
	GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error)
	GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error)
	GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error)
	GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error)
	GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error)
	GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error)
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
// Jenis Aktivitas Mahasiswa
// ============================================================================

func (r *repository) GetJenisAktMhs(ctx context.Context, params types.JenisAktMhsParams) ([]JenisAktMhs, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_kegiatan_kampus_merdeka", params.KegiatanKampusMerdeka)
	cb.Like("nm_jns_akt_mhs", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_akt_mhs",
			Select:      "id_jns_akt_mhs, nm_jns_akt_mhs, ket_jns_akt_mhs, a_kegiatan_kampus_merdeka, create_date, last_update, expired_date",
			DefaultSort: "id_jns_akt_mhs",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisAktMhs, error) {
			var j JenisAktMhs
			err := rows.Scan(
				&j.IDJnsAktMhs,
				&j.NmJnsAktMhs,
				&j.KetJnsAktMhs,
				&j.AKegiatanKampusMerdeka,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Bahan Ajar
// ============================================================================

func (r *repository) GetJenisBahanAjar(ctx context.Context, params types.PaginationParams) ([]JenisBahanAjar, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_bhn_ajar", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_bahan_ajar",
			Select:      "id_jns_bhn_ajar, nm_jns_bhn_ajar, create_date, last_update, expired_date",
			DefaultSort: "id_jns_bhn_ajar",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisBahanAjar, error) {
			var j JenisBahanAjar
			err := rows.Scan(
				&j.IDJnsBhnAjar,
				&j.NmJnsBhnAjar,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Beasiswa
// ============================================================================

func (r *repository) GetJenisBeasiswa(ctx context.Context, params types.JenisBeasiswaParams) ([]JenisBeasiswa, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_sumber_dana", params.IDSumberDana)
	cb.AppendInt("u_pd", params.UPd)
	cb.AppendInt("u_ptk", params.UPtk)
	cb.AppendInt("u_non_ca", params.UNonCa)
	cb.AppendInt("kat_beasiswa", params.KatBeasiswa)
	cb.Like("nm_jns_beasiswa", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_beasiswa",
			Select:      "id_jns_beasiswa, id_sumber_dana, nm_jns_beasiswa, u_pd, u_ptk, u_non_ca, kat_beasiswa, create_date, last_update, expired_date",
			DefaultSort: "id_jns_beasiswa",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisBeasiswa, error) {
			var j JenisBeasiswa
			err := rows.Scan(
				&j.IDJnsBeasiswa,
				&j.IDSumberDana,
				&j.NmJnsBeasiswa,
				&j.UPd,
				&j.UPtk,
				&j.UNonCa,
				&j.KatBeasiswa,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Diklat
// ============================================================================

func (r *repository) GetJenisDiklat(ctx context.Context, params types.JenisDiklatParams) ([]JenisDiklat, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("u_guru", params.UGuru)
	cb.AppendInt("u_dosen", params.UDosen)
	cb.AppendInt("u_tendik", params.UTendik)
	cb.AppendInt("a_validasi", params.AValidasi)
	cb.Like("nm_jns_diklat", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_diklat",
			Select:      "id_jns_diklat, nm_jns_diklat, u_guru, u_dosen, u_tendik, a_validasi, create_date, last_update, expired_date",
			DefaultSort: "id_jns_diklat",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisDiklat, error) {
			var j JenisDiklat
			err := rows.Scan(
				&j.IDJnsDiklat,
				&j.NmJnsDiklat,
				&j.UGuru,
				&j.UDosen,
				&j.UTendik,
				&j.AValidasi,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Dokumen
// ============================================================================

func (r *repository) GetJenisDokumen(ctx context.Context, params types.PaginationParams) ([]JenisDokumen, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_dok", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_dokumen",
			Select:      "id_jns_dok, nm_jns_dok, create_date, last_update, expired_date",
			DefaultSort: "id_jns_dok",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisDokumen, error) {
			var j JenisDokumen
			err := rows.Scan(
				&j.IDJnsDok,
				&j.NmJnsDok,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Evaluasi
// ============================================================================

func (r *repository) GetJenisEvaluasi(ctx context.Context, params types.PaginationParams) ([]JenisEvaluasi, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_eval", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_evaluasi",
			Select:      "id_jns_eval, nm_jns_eval, ket_jns_eval, create_date, last_update, expired_date",
			DefaultSort: "id_jns_eval",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisEvaluasi, error) {
			var j JenisEvaluasi
			err := rows.Scan(
				&j.IDJnsEval,
				&j.NmJnsEval,
				&j.KetJnsEval,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Hapus Buku
// ============================================================================

func (r *repository) GetJenisHapusBuku(ctx context.Context, params types.PaginationParams) ([]JenisHapusBuku, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("ket_hapus_buku", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_hapus_buku",
			Select:      "id_hapus_buku, ket_hapus_buku, create_date, last_update, expired_date",
			DefaultSort: "id_hapus_buku",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisHapusBuku, error) {
			var j JenisHapusBuku
			err := rows.Scan(
				&j.IDHapusBuku,
				&j.KetHapusBuku,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Jalur Pekerjaan
// ============================================================================

func (r *repository) GetJenisJalurPekerjaan(ctx context.Context, params types.PaginationParams) ([]JenisJalurPekerjaan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_jalur_kerja", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_jalur_pekerjaan",
			Select:      "id_jns_jalur_kerja, nm_jns_jalur_kerja, create_date, last_update, expired_date",
			DefaultSort: "id_jns_jalur_kerja",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisJalurPekerjaan, error) {
			var j JenisJalurPekerjaan
			err := rows.Scan(
				&j.IDJnsJalurKerja,
				&j.NmJnsJalurKerja,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Keluar
// ============================================================================

func (r *repository) GetJenisKeluar(ctx context.Context, params types.JenisKeluarParams) ([]JenisKeluar, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_pd", params.APd)
	cb.AppendInt("a_ptk", params.APtk)
	cb.AppendInt("a_sdm_iptek", params.ASdmIptek)
	cb.Like("ket_keluar", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_keluar",
			Select:      "id_jns_keluar, ket_keluar, a_pd, a_ptk, a_sdm_iptek, create_date, last_update, expired_date",
			DefaultSort: "id_jns_keluar",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisKeluar, error) {
			var j JenisKeluar
			err := rows.Scan(
				&j.IDJnsKeluar,
				&j.KetKeluar,
				&j.APd,
				&j.APtk,
				&j.ASdmIptek,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Kepanitiaan
// ============================================================================

func (r *repository) GetJenisKepanitiaan(ctx context.Context, params types.PaginationParams) ([]JenisKepanitiaan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_panitia", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_kepanitiaan",
			Select:      "id_jns_panitia, nm_jns_panitia, create_date, last_update, expired_date",
			DefaultSort: "id_jns_panitia",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisKepanitiaan, error) {
			var j JenisKepanitiaan
			err := rows.Scan(
				&j.IDJnsPanitia,
				&j.NmJnsPanitia,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Kesejahteraan
// ============================================================================

func (r *repository) GetJenisKesejahteraan(ctx context.Context, params types.PaginationParams) ([]JenisKesejahteraan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_sejahtera", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_kesejahteraan",
			Select:      "id_jns_sejahtera, nm_jns_sejahtera, create_date, last_update, expired_date",
			DefaultSort: "id_jns_sejahtera",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisKesejahteraan, error) {
			var j JenisKesejahteraan
			err := rows.Scan(
				&j.IDJnsSejahtera,
				&j.NmJnsSejahtera,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Keuangan
// ============================================================================

func (r *repository) GetJenisKeuangan(ctx context.Context, params types.JenisKeuanganParams) ([]JenisKeuangan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_pengeluaran", params.Pengeluaran)
	cb.AppendInt("a_pemasukan", params.Pemasukan)
	cb.Like("nm_jns_keuangan", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_keuangan",
			Select:      "id_jns_keuangan, nm_jns_keuangan, a_pengeluaran, a_pemasukan, create_date, last_update, expired_date",
			DefaultSort: "id_jns_keuangan",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisKeuangan, error) {
			var j JenisKeuangan
			err := rows.Scan(
				&j.IDJnsKeuangan,
				&j.NmJnsKeuangan,
				&j.APengeluaraan,
				&j.APemasukan,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Lembaga
// ============================================================================

func (r *repository) GetJenisLembaga(ctx context.Context, params types.JenisLembagaParams) ([]JenisLembaga, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("a_sp", params.Sp)
	cb.AppendInt("a_lemb_akred", params.LembAkred)
	cb.AppendInt("a_pengelola_pendidikan", params.PengelolaPendidikan)
	cb.AppendInt("a_sms", params.Sms)
	cb.AppendInt("a_tmpt_pengawas", params.TmptPengawas)
	cb.AppendInt("a_lemb_iptek", params.LembIptek)
	cb.AppendInt("a_smi", params.Smi)
	cb.Like("nm_jns_lemb", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_lembaga",
			Select:      "id_jns_lemb, nm_jns_lemb, a_sp, a_lemb_akred, a_pengelola_pendidikan, a_sms, a_tmpt_pengawas, a_lemb_iptek, a_smi, sort, create_date, last_update, expired_date",
			DefaultSort: "sort",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisLembaga, error) {
			var j JenisLembaga
			err := rows.Scan(
				&j.IDJnsLemb,
				&j.NmJnsLemb,
				&j.ASp,
				&j.ALembAkred,
				&j.APengelolaPendidikan,
				&j.ASms,
				&j.ATmptPengawas,
				&j.ALembIptek,
				&j.ASmi,
				&j.Sort,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Media Publikasi
// ============================================================================

func (r *repository) GetJenisMediaPub(ctx context.Context, params types.PaginationParams) ([]JenisMediaPub, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_media", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_media_pub",
			Select:      "id_jns_media, nm_jns_media, create_date, last_update, expired_date",
			DefaultSort: "id_jns_media",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisMediaPub, error) {
			var j JenisMediaPub
			err := rows.Scan(
				&j.IDJnsMedia,
				&j.NmJnsMedia,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}
