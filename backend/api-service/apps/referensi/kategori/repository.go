package kategori

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data kategori
type Repository interface {
	GetKategoriCapaianIuran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianIuran, int64, error)
	GetKategoriKegiatan(ctx context.Context, params types.KategoriKegiatanParams) ([]KategoriKegiatan, int64, error)
	GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error)
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
// Kategori Capaian Iuran
// ============================================================================

func (r *repository) GetKategoriCapaianIuran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianIuran, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kat_capaian", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kat_capaian_iuran",
			Select:      "id_kat_capaian, nm_kat_capaian, create_date, last_update, expired_date",
			DefaultSort: "id_kat_capaian",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KategoriCapaianIuran, error) {
			var k KategoriCapaianIuran
			err := rows.Scan(
				&k.IDKatCapaian,
				&k.NmKatCapaian,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// Kategori Kegiatan
// ============================================================================

func (r *repository) GetKategoriKegiatan(ctx context.Context, params types.KategoriKegiatanParams) ([]KategoriKegiatan, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_induk_kat_giat", params.IDIndukKatGiat)
	cb.AppendInt("id_jns_sdm", params.IDJenisSdm)
	cb.AppendString("kode_kat_pak", params.KodeKatPak)
	cb.AppendString("kode_kat_bkd", params.KodeKatBkd)
	cb.AppendString("teks_judul", params.TeksJudul)
	cb.AppendString("teks_sk", params.TeksSk)
	cb.AppendString("teks_tgl_sk", params.TeksTanggalSk)
	cb.AppendString("teks_lokasi", params.TeksLokasi)
	cb.AppendInt("level_kat", params.LevelKat)
	cb.AppendInt("a_judul", params.Judul)
	cb.AppendInt("u_bkd", params.Bkd)
	cb.AppendInt("u_pak", params.Pak)
	cb.Like("nm_kat", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kat_kegiatan",
			Select:      "id_kat_giat, id_induk_kat_giat, id_jns_sdm, kode_kat_pak, kode_kat_bkd, nm_kat, kat_unsur, teks_judul, teks_sk, teks_tgl_sk, teks_lokasi, level_kat, sks_bkd, ak, ak_maks, satuan_nilai, ket, a_aktif, a_anak_bimb, a_judul, a_sk, a_peer_review, acuan_waktu, u_bkd, u_pak, create_date, last_update, expired_date",
			DefaultSort: "id_kat_giat",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (KategoriKegiatan, error) {
			var k KategoriKegiatan
			err := rows.Scan(
				&k.IDKatGiat,
				&k.IDIndukKatGiat,
				&k.IDJnsSdm,
				&k.KodeKatPak,
				&k.KodeKatBkd,
				&k.NmKat,
				&k.KatUnsur,
				&k.TeksJudul,
				&k.TeksSk,
				&k.TeksTglSk,
				&k.TeksLokasi,
				&k.LevelKat,
				&k.SksBkd,
				&k.Ak,
				&k.AkMaks,
				&k.SatuanNilai,
				&k.Ket,
				&k.AAktif,
				&k.AAnakBimb,
				&k.AJudul,
				&k.ASk,
				&k.APeerReview,
				&k.AcuanWaktu,
				&k.UBkd,
				&k.UPak,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}

// ============================================================================
// Kategori Tabel
// ============================================================================

func (r *repository) GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error) {
	cb := helper.NewCondBuilder()
	cb.AppendInt("id_kat_giat", params.IDKatGiat)
	cb.AppendString("nm_schema", params.NmSchema)
	cb.AppendString("konfig_kolom", params.KonfigKolom)
	cb.Like("nm_tbl", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kat_tabel",
			Select:      "id_kat_tabel, id_kat_giat, nm_schema, nm_tbl, konfig_kolom, ket, create_date, last_update, expired_date",
			DefaultSort: "id_kat_tabel",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (KategoriTabel, error) {
			var k KategoriTabel
			err := rows.Scan(
				&k.IDKatTabel,
				&k.IDKatGiat,
				&k.NmSchema,
				&k.NmTbl,
				&k.KonfigKolom,
				&k.Ket,
				&k.CreateDate,
				&k.LastUpdate,
				&k.ExpiredDate,
			)
			return k, err
		},
	)
}
