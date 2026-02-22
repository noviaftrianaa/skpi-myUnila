package kategori

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

// Repository adalah interface untuk akses data kategori
type Repository interface {
	GetKategoriCapaianLuaran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianLuaran, int64, error)
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

func (r *repository) GetKategoriCapaianLuaran(ctx context.Context, params types.PaginationParams) ([]KategoriCapaianLuaran, int64, error) {
	cb := helper.NewCondBuilder()
	cb.Like("nm_kat_capaian", params.Search)

	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.kategori_capaian_luaran",
			Select:      "id_kat_capaian, nm_kat_capaian, create_date, last_update, expired_date",
			DefaultSort: "id_kat_capaian",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (KategoriCapaianLuaran, error) {
			var k KategoriCapaianLuaran
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

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("kk.id_induk_katgiat", params.IDIndukKatGiat)
	cb.AppendInt("kk.id_jns_sdm", params.IDJenisSdm)
	cb.AppendString("kk.kode_kat_pak", params.KodeKatPak)
	cb.AppendString("kk.kode_kat_bkd", params.KodeKatBkd)
	cb.AppendString("kk.teks_judul", params.TeksJudul)
	cb.AppendString("kk.teks_sk", params.TeksSk)
	cb.AppendString("kk.teks_tgl_sk", params.TeksTanggalSk)
	cb.AppendString("kk.teks_lokasi", params.TeksLokasi)
	cb.AppendInt("kk.level_kat", params.LevelKat)
	cb.AppendInt("kk.a_judul", params.Judul)
	cb.AppendInt("kk.u_bkd", params.Bkd)
	cb.AppendInt("kk.u_pak", params.Pak)
	cb.Like("kk.nm_kat", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "kk.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.kategori_kegiatan kk
		LEFT JOIN ref.jenis_sdm js ON js.id_jns_sdm = kk.id_jns_sdm
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "kk.id_katgiat"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			kk.id_katgiat, kk.id_induk_katgiat, kk.id_jns_sdm, kk.kode_kat_pak, kk.kode_kat_bkd, kk.nm_kat, kk.kat_unsur, kk.teks_judul, kk.teks_sk, kk.teks_tgl_sk, kk.teks_lokasi, kk.level_kat, kk.sks_bkd, kk.ak, kk.ak_maks, kk.satuan_nilai, kk.ket, kk.a_aktif, kk.a_anak_bimb, kk.a_judul, kk.a_sk, kk.a_peer_review, kk.acuan_waktu, kk.u_bkd, kk.u_pak, kk.create_date, kk.last_update, kk.expired_date, js.nm_jns_sdm
		FROM ref.kategori_kegiatan kk
		LEFT JOIN ref.jenis_sdm js ON js.id_jns_sdm = kk.id_jns_sdm
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

	var result []KategoriKegiatan
	for rows.Next() {
		var s KategoriKegiatan
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
// Kategori Tabel
// ============================================================================

func (r *repository) GetKategoriTabel(ctx context.Context, params types.KategoriTabelParams) ([]KategoriTabel, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("kt.id_katgiat", params.IDKatGiat)
	cb.AppendString("kt.nm_schema", params.NmSchema)
	cb.AppendString("kt.konfig_kolom", params.KonfigKolom)
	cb.Like("kt.nm_tbl", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "kt.expired_date IS NULL")

	whereClause := "1=1"
	if len(conds) > 0 {
		whereClause = strings.Join(conds, " AND ")
	}

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM ref.kategori_tabel kt
		LEFT JOIN ref.kategori_kegiatan kk ON kt.id_katgiat = kk.id_katgiat
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== Sorting =====
	sortBy := "kt.id_kat_tabel"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			kt.id_kat_tabel, kt.id_katgiat, kt.nm_schema, kt.nm_tbl, kt.konfig_kolom, kt.ket, kt.create_date, kt.last_update, kt.expired_date, kk.nm_kat
		FROM ref.kategori_tabel kt
		LEFT JOIN ref.kategori_kegiatan kk ON kt.id_katgiat = kk.id_katgiat
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

	var result []KategoriTabel
	for rows.Next() {
		var s KategoriTabel
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
