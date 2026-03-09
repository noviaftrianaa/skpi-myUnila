package penelitian

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

// Repository adalah interface untuk akses data penelitian/publikasi
type Repository interface {
	GetPublikasi(ctx context.Context, params types.PublikasiParams) ([]Publikasi, int64, error)
	GetLitabmas(ctx context.Context, params types.LitabmasParams) ([]Litabmas, int64, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository membuat instance repository baru
func NewRepository(DB *sqlx.DB) Repository {
	return &repository{db: DB}
}

// ============================================================================
// GetPublikasi - Dapatkan daftar publikasi dengan JOIN ke ref tables
// JOIN:
//   - ref.jenis_publikasi       → NmJnsPub
//   - pdrd.litabmas             → JudulLitabmas
//   - ref.media_publikasi       → NmJnsMedia
//   - ref.kategori_capaian_luaran → NmKatCapaian
//
// ============================================================================
func (r *repository) GetPublikasi(
	ctx context.Context,
	params types.PublikasiParams,
) ([]Publikasi, int64, error) {

	params.NormalizePagination()

	// ===== BUILD CONDITIONS =====
	cb := helper.NewCondBuilder()
	cb.AppendInt("p.id_jns_pub", params.IDJnsPub)
	cb.Like("p.nama_jurnal", ptrStr(params.NamaJurnal))
	cb.Like("p.edisi", ptrStr(params.Edisi))
	cb.Like("p.penerbit", ptrStr(params.Penerbit))
	cb.AppendInt("p.id_kat_capaian", params.IDKatCapaian)
	cb.AppendUUID("p.id_media_pub", params.IDMediaPub)
	cb.AppendUUID("p.id_litabmas", params.IDLitabmas)
	cb.Like("p.judul", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "p.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// ===== COUNT QUERY =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.publikasi p
		LEFT JOIN ref.jenis_publikasi jp ON jp.id_jns_pub = p.id_jns_pub
		LEFT JOIN pdrd.litabmas lt ON lt.id_litabmas = p.id_litabmas
		LEFT JOIN ref.media_publikasi mp ON mp.id_media_pub = p.id_media_pub
		LEFT JOIN ref.kategori_capaian_luaran kcl ON kcl.id_kat_capaian = p.id_kat_capaian
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== SORTING =====
	sortBy := "p.judul"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			p.id_publikasi,
			p.id_jns_pub,
			ISNULL(jp.nm_jns_pub, '') AS nm_jns_pub,
			p.judul,
			p.judul_chapter,
			p.judul_asli,
			p.abstrak,
			p.nama_jurnal,
			p.laman_jurnal,
			p.tgl_terbit,
			p.edisi,
			p.impact_jurnal,
			p.vol,
			p.no,
			p.hal,
			p.jml_hal,
			p.penerbit,
			p.kota,
			p.a_seminar,
			p.a_prosiding,
			p.dimensi,
			p.bahasa,
			p.no_paten,
			p.pemberi_paten,
			p.doi,
			p.isbn,
			p.issn,
			p.e_issn,
			p.url,
			p.ket,
			p.pengguna_produk_jasa AS pengguna_produk_ja,
			p.a_komersialisasi,
			p.stat_impor_sinta,
			p.quartile,
			p.id_kat_capaian,
			kcl.nm_kat_capaian,
			p.id_media_pub,
			mp.nm_media_pub,
			p.id_litabmas,
			lt.judul_litabmas,
			p.create_date,
			p.id_creator,
			p.last_update,
			p.id_updater,
			p.soft_delete,
			p.last_sync
		FROM pdrd.publikasi p
		LEFT JOIN ref.jenis_publikasi jp ON jp.id_jns_pub = p.id_jns_pub
		LEFT JOIN pdrd.litabmas lt ON lt.id_litabmas = p.id_litabmas
		LEFT JOIN ref.media_publikasi mp ON mp.id_media_pub = p.id_media_pub
		LEFT JOIN ref.kategori_capaian_luaran kcl ON kcl.id_kat_capaian = p.id_kat_capaian
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Publikasi
	for rows.Next() {
		var m Publikasi
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
// GetLitabmas - Dapatkan daftar litabmas (penelitian/pengabdian) dengan JOIN
// JOIN:
//   - pdrd.lembaga_iptek            → NmLemb
//   - ref.skim_kegiatan             → NmSkim
//   - ref.kelompok_bidang           → NmKelBidang
//   - ref.tse                       → NmTse
//   - pdrd.smi                      → KodeSmi
//   - ref.jenis_penelitian          → NmJnsLit
//   - pdrd.sdm_anggota_litabmas     → IDSdm (filter/join)
//   - pdrd.pd_anggota_litabmas      → PdAnggotaLitabmas fields
//
// ============================================================================
func (r *repository) GetLitabmas(
	ctx context.Context,
	params types.LitabmasParams,
) ([]Litabmas, int64, error) {

	params.NormalizePagination()

	// ===== BUILD CONDITIONS =====
	cb := helper.NewCondBuilder()
	cb.AppendUUID("l.id_litabmas", strPtr(params.IDLitabmas))
	cb.AppendUUID("sal.id_sdm", params.IDSdm)
	cb.AppendString("l.jns_litabmas", params.JnsLitabmas)
	cb.AppendUUID("l.id_lemb_iptek", params.IDLembIptek)
	cb.AppendUUID("l.id_skim", params.IDSkim)
	cb.AppendInt("l.id_thn_kegiatan", params.IDThnKegiatan)
	cb.AppendUUID("l.id_kel_bidang", params.IDKelBidang)
	cb.AppendInt("l.id_tse", params.IDTse)
	cb.AppendUUID("l.id_smi", params.IDSmi)
	cb.AppendInt("l.id_jns_lit", params.IDJnsLit)
	cb.Like("l.judul_litabmas", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "l.soft_delete = 0", "sal.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// ===== COUNT QUERY =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.litabmas l
		INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas
		LEFT JOIN pdrd.lembaga_iptek li ON li.id_lemb_iptek = l.id_lemb_iptek
		LEFT JOIN ref.skim_kegiatan sk ON sk.id_skim = l.id_skim
		LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = l.id_kel_bidang
		LEFT JOIN ref.tse tse ON tse.id_tse = l.id_tse
		LEFT JOIN pdrd.smi smi ON smi.id_smi = l.id_smi
		LEFT JOIN ref.jenis_penelitian jl ON jl.id_jns_lit = l.id_jns_lit
		LEFT JOIN pdrd.pd_anggota_litabmas pal ON pal.id_litabmas = l.id_litabmas AND pal.soft_delete = 0
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== SORTING =====
	sortBy := "l.judul_litabmas"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			l.id_litabmas,
			sal.id_sdm,
			l.id_lemb_iptek,
			ISNULL(li.nm_lemb, '') AS nm_lemb,
			l.judul_litabmas,
			l.lama_kegiatan,
			l.thn_laks_ke,
			l.dana_dikti,
			l.dana_pt,
			l.dana_institusi_lain,
			l.in_kind,
			l.stat_aktif,
			l.jns_litabmas,
			l.sk_tugas,
			l.tgl_sk_tugas,
			l.lokasi_kegiatan,
			l.id_skim,
			sk.nm_skim,
			l.id_thn_usulan,
			l.id_thn_kegiatan,
			l.id_thn_laks,
			l.id_lanjutan_litabmas,
			l.id_kel_bidang,
			kb.nm_kel_bidang,
			l.id_tse,
			tse.nm_tse,
			l.id_smi,
			smi.kode_smi,
			l.id_jns_lit,
			jl.nm_jns_lit,
			pal.id_pd_ang_litabmas,
			pal.id_pd,
			pal.peran_litabmas,
			pal.stat_aktif AS stat_aktif_pd,
			pal.nm_pd,
			pal.nipd,
			l.create_date,
			l.id_creator,
			l.last_update,
			l.id_updater,
			l.soft_delete,
			l.last_sync
		FROM pdrd.litabmas l
		INNER JOIN pdrd.sdm_anggota_litabmas sal ON sal.id_litabmas = l.id_litabmas
		LEFT JOIN pdrd.lembaga_iptek li ON li.id_lemb_iptek = l.id_lemb_iptek
		LEFT JOIN ref.skim_kegiatan sk ON sk.id_skim = l.id_skim
		LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = l.id_kel_bidang
		LEFT JOIN ref.tse tse ON tse.id_tse = l.id_tse
		LEFT JOIN pdrd.smi smi ON smi.id_smi = l.id_smi
		LEFT JOIN ref.jenis_penelitian jl ON jl.id_jns_lit = l.id_jns_lit
		LEFT JOIN pdrd.pd_anggota_litabmas pal ON pal.id_litabmas = l.id_litabmas AND pal.soft_delete = 0
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Litabmas
	for rows.Next() {
		var m Litabmas
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

// strPtr mengkonversi string kosong menjadi nil untuk filter UUID
func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// ptrStr mengambil value dari *string, return "" jika nil
func ptrStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
