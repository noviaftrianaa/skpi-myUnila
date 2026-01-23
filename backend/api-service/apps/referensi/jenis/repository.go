package jenis

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

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
	GetJenisMk(ctx context.Context, params types.PaginationParams) ([]JenisMk, int64, error)
	GetJenisPendaftaran(ctx context.Context, params types.JenisPendaftaranParams) ([]JenisPendaftaran, int64, error)
	GetJenisPenelitian(ctx context.Context, params types.PaginationParams) ([]JenisPenelitian, int64, error)
	GetJenisPenghargaan(ctx context.Context, params types.JenisPenghargaanParams) ([]JenisPenghargaan, int64, error)
	GetJenisPrasarana(ctx context.Context, params types.PaginationParams) ([]JenisPrasarana, int64, error)
	GetJenisPrestasi(ctx context.Context, params types.PaginationParams) ([]JenisPrestasi, int64, error)
	GetJenisPublikasi(ctx context.Context, params types.PaginationParams) ([]JenisPublikasi, int64, error)
	GetJenisSarana(ctx context.Context, params types.JenisSaranaParams) ([]JenisSarana, int64, error)
	GetJenisSdm(ctx context.Context, params types.JenisSdmParams) ([]JenisSdm, int64, error)
	GetJenisSert(ctx context.Context, params types.JenisSertParams) ([]JenisSert, int64, error)
	GetJenisSms(ctx context.Context, params types.PaginationParams) ([]JenisSms, int64, error)
	GetJenisSubst(ctx context.Context, params types.PaginationParams) ([]JenisSubst, int64, error)
	GetJenisTes(ctx context.Context, params types.JenisTesParams) ([]JenisTes, int64, error)
	GetJenisTinggal(ctx context.Context, params types.PaginationParams) ([]JenisTinggal, int64, error)
	GetJenisTunjangan(ctx context.Context, params types.PaginationParams) ([]JenisTunjangan, int64, error)
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

// ============================================================================
// Jenis Mk
// ============================================================================

func (r *repository) GetJenisMk(ctx context.Context, params types.PaginationParams) ([]JenisMk, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_mk", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_mk",
			Select:      "id_jns_mk, nm_jns_mk, create_date, last_update, expired_date",
			DefaultSort: "id_jns_mk",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisMk, error) {
			var j JenisMk
			err := rows.Scan(
				&j.IDJnsMk,
				&j.NmJnsMk,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Pendaftaran
// ============================================================================

func (r *repository) GetJenisPendaftaran(ctx context.Context, params types.JenisPendaftaranParams) ([]JenisPendaftaran, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("u_daftar_sekolah", params.DaftarSekolah)
	cb.AppendInt("u_daftar_rombel", params.DaftarRombel)
	cb.Like("nm_jns_mk", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_pendaftaran",
			Select:      "id_jns_daftar, nm_jns_daftar, u_daftar_sekolah, u_daftar_rombel, create_date, last_update, expired_date",
			DefaultSort: "id_jns_daftar",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisPendaftaran, error) {
			var j JenisPendaftaran
			err := rows.Scan(
				&j.IDJnsDaftar,
				&j.NmJnsDaftar,
				&j.UDaftarSekolah,
				&j.UDaftarRombel,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Penelitian
// ============================================================================

func (r *repository) GetJenisPenelitian(ctx context.Context, params types.PaginationParams) ([]JenisPenelitian, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_lit", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_penelitian",
			Select:      "id_jns_lit, nm_jns_lit, create_date, last_update, expired_date",
			DefaultSort: "id_jns_lit",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisPenelitian, error) {
			var j JenisPenelitian
			err := rows.Scan(
				&j.IDJnsLit,
				&j.NmJnsLit,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Penghargaan
// ============================================================================

func (r *repository) GetJenisPenghargaan(ctx context.Context, params types.JenisPenghargaanParams) ([]JenisPenghargaan, int64, error) {
	cb := helper.NewCondBuilder()

	cb.AppendInt("u_lembaga", params.Lembaga)
	cb.Like("nm_jns_lit", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_penghargaan",
			Select:      "id_jns_penghargaan, nm_jns_penghargaan, u_sdm, u_lembaga, create_date, last_update, expired_date",
			DefaultSort: "id_jns_penghargaan",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisPenghargaan, error) {
			var j JenisPenghargaan
			err := rows.Scan(
				&j.IDJnsPenghargaan,
				&j.NmJnsPenghargaan,
				&j.USdm,
				&j.ULembaga,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Prasarana
// ============================================================================

func (r *repository) GetJenisPrasarana(ctx context.Context, params types.PaginationParams) ([]JenisPrasarana, int64, error) {
	cb := helper.NewCondBuilder()

	cb.Like("nm_jns_prasarana", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_prasarana",
			Select:      "id_jns_prasarana, nm_jns_prasarana, create_date, last_update, expired_date",
			DefaultSort: "id_jns_prasarana",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisPrasarana, error) {
			var j JenisPrasarana
			err := rows.Scan(
				&j.IDJnsPrasarana,
				&j.NmJnsPrasarana,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Prestasi
// ============================================================================

func (r *repository) GetJenisPrestasi(ctx context.Context, params types.PaginationParams) ([]JenisPrestasi, int64, error) {
	cb := helper.NewCondBuilder()

	cb.Like("nm_jenis_prestasi", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_prestasi",
			Select:      "id_jenis_prestasi, nm_jenis_prestasi, create_date, last_update, expired_date",
			DefaultSort: "id_jenis_prestasi",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisPrestasi, error) {
			var j JenisPrestasi
			err := rows.Scan(
				&j.IDJenisPrestasi,
				&j.NmJenisPrestasi,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Publikasi
// ============================================================================

func (r *repository) GetJenisPublikasi(ctx context.Context, params types.PaginationParams) ([]JenisPublikasi, int64, error) {
	cb := helper.NewCondBuilder()

	cb.Like("nm_jns_pub", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_publikasi",
			Select:      "id_jns_pub, nm_jns_pub, a_pub_prestasi,create_date, last_update, expired_date",
			DefaultSort: "id_jns_pub",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisPublikasi, error) {
			var j JenisPublikasi
			err := rows.Scan(
				&j.IDJnsPub,
				&j.NmJnsPub,
				&j.APubPrestasi,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Sarana
// ============================================================================

func (r *repository) GetJenisSarana(ctx context.Context, params types.JenisSaranaParams) ([]JenisSarana, int64, error) {
	cb := helper.NewCondBuilder()

	cb.AppendInt("a_penempatan", params.Penempatan)
	cb.Like("nm_jns_sarana", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_sarana",
			Select:      "id_jns_sarana, nm_jns_sarana, kel, a_penempatan, ket, create_date, last_update, expired_date",
			DefaultSort: "id_jns_sarana",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisSarana, error) {
			var j JenisSarana
			err := rows.Scan(
				&j.IDJnsSarana,
				&j.NmJnsSarana,
				&j.Kel,
				&j.APenempatan,
				&j.Ket,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Sdm
// ============================================================================

func (r *repository) GetJenisSdm(ctx context.Context, params types.JenisSdmParams) ([]JenisSdm, int64, error) {
	cb := helper.NewCondBuilder()

	cb.AppendInt("a_guru_kelas", params.GuruKelas)
	cb.AppendInt("a_guru_mapel", params.GuruMapel)
	cb.AppendInt("a_guru_bk", params.GuruBk)
	cb.AppendInt("a_guru_inklusi", params.GuruInklusi)
	cb.AppendInt("a_pengawas_sp", params.PengawasSp)
	cb.AppendInt("a_pengawas_plb", params.PengawasPlb)
	cb.AppendInt("a_pengawas_mapel", params.PengawasMapel)
	cb.AppendInt("a_pengawas_bid", params.PengawasBid)
	cb.AppendInt("a_tas", params.Tas)
	cb.AppendInt("a_formal", params.Formal)
	cb.AppendInt("a_dosen", params.Dosen)
	cb.AppendInt("a_peneliti", params.Peneliti)
	cb.AppendInt("a_perekayasa", params.Perekayasa)

	cb.Like("nm_jns_sdm", params.Search)

	conds, args := cb.Build()

	if len(params.PranataLevel) > 0 {
		var conditions []string
		for _, lvl := range params.PranataLevel {
			if lvl < 1 || lvl > 9 {
				continue
			}
			conditions = append(conditions, fmt.Sprintf("a_pranata_%d = 1", lvl))
		}

		if len(conditions) > 0 {
			conds = append(conds, "("+strings.Join(conditions, " OR ")+")")
		}
	}

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_sdm",
			Select:      "id_jns_sdm, nm_jns_sdm, a_guru_kelas, a_guru_mapel, a_guru_bk, a_guru_inklusi, a_pengawas_sp, a_pengawas_plb, a_pengawas_mapel, a_pengawas_bid, a_tas, a_formal, a_dosen, a_peneliti, a_perekayasa, a_pranata_1, a_pranata_2, a_pranata_3, a_pranata_4, a_pranata_5, a_pranata_6, a_pranata_7, a_pranata_8, a_pranata_9, create_date, last_update, expired_date",
			DefaultSort: "id_jns_sdm",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisSdm, error) {
			var j JenisSdm
			err := rows.Scan(
				&j.IDJnsSdm,
				&j.NmJnsSdm,
				&j.AGuruKelas,
				&j.AGuruMapel,
				&j.AGuruBk,
				&j.AGuruInklusi,
				&j.APengawasSp,
				&j.APengawasPlb,
				&j.APengawasMapel,
				&j.APengawasBid,
				&j.ATas,
				&j.AFormal,
				&j.ADosen,
				&j.APeneliti,
				&j.APerekayasa,
				&j.APranata1,
				&j.APranata2,
				&j.APranata3,
				&j.APranata4,
				&j.APranata5,
				&j.APranata6,
				&j.APranata7,
				&j.APranata8,
				&j.APranata9,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Sertifikasi
// ============================================================================

func (r *repository) GetJenisSert(ctx context.Context, params types.JenisSertParams) ([]JenisSert, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("u_prof_guru", params.ProfGuru)
	cb.AppendInt("u_kepsek", params.Kepsek)
	cb.AppendInt("u_laboran", params.Laboran)
	cb.AppendInt("u_prof_dosen", params.ProfDosen)
	cb.AppendInt("u_lembaga", params.Lembaga)
	cb.Like("nm_jns_sert", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_sert",
			Select:      "id_jns_sert, nm_jns_sert, u_prof_guru, u_kepsek, u_laboran, u_prof_dosen, u_lembaga, create_date, last_update, expired_date",
			DefaultSort: "id_jns_sert",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisSert, error) {
			var j JenisSert
			err := rows.Scan(
				&j.IDJnsSert,
				&j.NmJnsSert,
				&j.UProfGuru,
				&j.UKepsek,
				&j.ULaboran,
				&j.UProfDosen,
				&j.ULembaga,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis SMS
// ============================================================================

func (r *repository) GetJenisSms(ctx context.Context, params types.PaginationParams) ([]JenisSms, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_sms", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_sms",
			Select:      "id_jns_sms, nm_jns_sms, create_date, last_update, expired_date",
			DefaultSort: "id_jns_sms",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisSms, error) {
			var j JenisSms
			err := rows.Scan(
				&j.IDJnsSms,
				&j.NmJnsSms,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Substansi
// ============================================================================

func (r *repository) GetJenisSubst(ctx context.Context, params types.PaginationParams) ([]JenisSubst, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_subst", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_subst",
			Select:      "id_jns_subst, nm_jns_subst, create_date, last_update, expired_date",
			DefaultSort: "id_jns_subst",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisSubst, error) {
			var j JenisSubst
			err := rows.Scan(
				&j.IDJnsSubst,
				&j.NmJnsSubst,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Tes
// ============================================================================

func (r *repository) GetJenisTes(ctx context.Context, params types.JenisTesParams) ([]JenisTes, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("nilai_maks", params.NilaiMaks)
	cb.Like("nm_jns_tes", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_tes",
			Select:      "id_jns_tes, nm_jns_tes, ket, nilai_maks, create_date, last_update, expired_date",
			DefaultSort: "id_jns_tes",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (JenisTes, error) {
			var j JenisTes
			err := rows.Scan(
				&j.IDJnsTes,
				&j.NmJnsTes,
				&j.Ket,
				&j.NilaiMaks,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Tinggal
// ============================================================================

func (r *repository) GetJenisTinggal(ctx context.Context, params types.PaginationParams) ([]JenisTinggal, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_tinggal", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_tinggal",
			Select:      "id_jns_tinggal, nm_jns_tinggal, create_date, last_update, expired_date",
			DefaultSort: "id_jns_tinggal",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisTinggal, error) {
			var j JenisTinggal
			err := rows.Scan(
				&j.IDJnsTinggal,
				&j.NmJnsTinggal,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}

// ============================================================================
// Jenis Tunjangan
// ============================================================================

func (r *repository) GetJenisTunjangan(ctx context.Context, params types.PaginationParams) ([]JenisTunjangan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_jns_tunj", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.jenis_tunjangan",
			Select:      "id_jns_tunj, nm_jns_tunj, create_date, last_update, expired_date",
			DefaultSort: "id_jns_tunj",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (JenisTunjangan, error) {
			var j JenisTunjangan
			err := rows.Scan(
				&j.IDJnsTunj,
				&j.NmJnsTunj,
				&j.CreateDate,
				&j.LastUpdate,
				&j.ExpiredDate,
			)
			return j, err
		},
	)
}
