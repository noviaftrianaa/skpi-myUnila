// Package kontribusi — endpoint kontribusi akademik dosen dan prestasi mahasiswa.
// Cakupan: pembicara, pengelola_jurnal, buku_ajar, kepanitiaan, prestasi.
package kontribusi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

const cacheTTL = 15 * time.Minute

// ============================================================================
// Entities
// ============================================================================

type Pembicara struct {
	IDPembicara    utils.UUID        `db:"id_pembicara" json:"id_pembicara"`
	IDSDM          utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM          *string           `db:"nm_sdm" json:"nm_sdm"`
	IDKatCapaian   *int              `db:"id_kat_capaian" json:"id_kat_capaian"`
	NmKatCapaian   *string           `db:"nm_kat_capaian" json:"nm_kat_capaian"`
	JudulMakalah   *string           `db:"judul_makalah" json:"judul_makalah"`
	NmTemuIlmiah   *string           `db:"nm_temu_ilmiah" json:"nm_temu_ilmiah"`
	KatBicara      *string           `db:"kat_bicara" json:"kat_bicara"`
	Penyelenggara  *string           `db:"penyelenggara" json:"penyelenggara"`
	TglLaks        *pk.SQLServerTime `db:"tgl_laks" json:"tgl_laks"`
	Bahasa         *string           `db:"bahasa" json:"bahasa"`
	TktTemu        *string           `db:"tkt_temu" json:"tkt_temu"`
	SkTugas        *string           `db:"sk_tugas" json:"sk_tugas"`
	LastSync       pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type PengelolaJurnal struct {
	IDKelolaJurnal utils.UUID        `db:"id_kelola_jurnal" json:"id_kelola_jurnal"`
	IDSDM          utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM          *string           `db:"nm_sdm" json:"nm_sdm"`
	IDMediaPub     utils.NullUUID    `db:"id_media_pub" json:"id_media_pub"`
	NmMediaPub     *string           `db:"nm_media_pub" json:"nm_media_pub"`
	Peran          *string           `db:"peran" json:"peran"`
	SkTugas        *string           `db:"sk_tugas" json:"sk_tugas"`
	TmtSkTugas     *pk.SQLServerTime `db:"tmt_sk_tugas" json:"tmt_sk_tugas"`
	TstSkTugas     *pk.SQLServerTime `db:"tst_sk_tugas" json:"tst_sk_tugas"`
	AAktif         *int              `db:"a_aktif" json:"a_aktif"`
	LastSync       pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type BukuAjar struct {
	IDBukuAjar    utils.UUID        `db:"id_buku_ajar" json:"id_buku_ajar"`
	IDKatCapaian  *int              `db:"id_kat_capaian" json:"id_kat_capaian"`
	NmKatCapaian  *string           `db:"nm_kat_capaian" json:"nm_kat_capaian"`
	IDJnsBhnAjar  *int              `db:"id_jns_bhn_ajar" json:"id_jns_bhn_ajar"`
	NmJnsBhnAjar  *string           `db:"nm_jns_bhn_ajar" json:"nm_jns_bhn_ajar"`
	JudulBuku     string            `db:"judul_buku" json:"judul_buku"`
	Penulis       *string           `db:"penulis" json:"penulis"`
	Penerbit      *string           `db:"penerbit" json:"penerbit"`
	Isbn          *string           `db:"isbn" json:"isbn"`
	TglTerbit     *pk.SQLServerTime `db:"tgl_terbit" json:"tgl_terbit"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type Kepanitiaan struct {
	IDPanitia     utils.UUID        `db:"id_panitia" json:"id_panitia"`
	IDJnsPanitia  *int              `db:"id_jns_panitia" json:"id_jns_panitia"`
	NmJnsPanitia  *string           `db:"nm_jns_panitia" json:"nm_jns_panitia"`
	NmPanitia     string            `db:"nm_panitia" json:"nm_panitia"`
	Instansi      *string           `db:"instansi" json:"instansi"`
	TktPanitia    *string           `db:"tkt_panitia" json:"tkt_panitia"`
	SkTugas       *string           `db:"sk_tugas" json:"sk_tugas"`
	TmtSkTugas    *pk.SQLServerTime `db:"tmt_sk_tugas" json:"tmt_sk_tugas"`
	TstSkTugas    *pk.SQLServerTime `db:"tst_sk_tugas" json:"tst_sk_tugas"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type PrestasiMhs struct {
	IDPrestasi      utils.UUID        `db:"id_prestasi" json:"id_prestasi"`
	IDJenisPrestasi *int              `db:"id_jenis_prestasi" json:"id_jenis_prestasi"`
	NmJenisPrestasi *string           `db:"nm_jenis_prestasi" json:"nm_jenis_prestasi"`
	IDTktPrestasi   *int              `db:"id_tkt_prestasi" json:"id_tkt_prestasi"`
	NmTktPrestasi   *string           `db:"nm_tkt_prestasi" json:"nm_tkt_prestasi"`
	IDPd            utils.NullUUID    `db:"id_pd" json:"id_pd"`
	NmPd            *string           `db:"nm_pd" json:"nm_pd"`
	IDAktMhs        utils.NullUUID    `db:"id_akt_mhs" json:"id_akt_mhs"`
	NmPrestasi      string            `db:"nm_prestasi" json:"nm_prestasi"`
	ThnPrestasi     *int              `db:"thn_prestasi" json:"thn_prestasi"`
	Penyelenggara   *string           `db:"penyelenggara" json:"penyelenggara"`
	Peringkat       *int              `db:"peringkat" json:"peringkat"`
	LastSync        pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Params
// ============================================================================

type PembicaraParams struct {
	types.PaginationParams
	IDSDM         *string `query:"id_sdm"`
	IDKatCapaian  *int    `query:"id_kat_capaian"`
	KatBicara     *string `query:"kat_bicara"`
	TktTemu       *string `query:"tkt_temu"`
}
type PengelolaJurnalParams struct {
	types.PaginationParams
	IDSDM      *string `query:"id_sdm"`
	IDMediaPub *string `query:"id_media_pub"`
	AAktif     *int    `query:"a_aktif"`
}
type BukuAjarParams struct {
	types.PaginationParams
	IDBukuAjar   *string `query:"id_buku_ajar"`
	IDKatCapaian *int    `query:"id_kat_capaian"`
	IDJnsBhnAjar *int    `query:"id_jns_bhn_ajar"`
	Isbn         *string `query:"isbn"`
}
type KepanitiaanParams struct {
	types.PaginationParams
	IDPanitia    *string `query:"id_panitia"`
	IDJnsPanitia *int    `query:"id_jns_panitia"`
	TktPanitia   *string `query:"tkt_panitia"`
}
type PrestasiParams struct {
	types.PaginationParams
	IDPrestasi      *string `query:"id_prestasi"`
	IDPd            *string `query:"id_pd"`
	IDAktMhs        *string `query:"id_akt_mhs"`
	IDJenisPrestasi *int    `query:"id_jenis_prestasi"`
	IDTktPrestasi   *int    `query:"id_tkt_prestasi"`
	ThnPrestasi     *int    `query:"thn_prestasi"`
}

// ============================================================================
// Repository
// ============================================================================

type Repository interface {
	GetPembicara(ctx context.Context, p PembicaraParams) ([]Pembicara, int64, error)
	GetPengelolaJurnal(ctx context.Context, p PengelolaJurnalParams) ([]PengelolaJurnal, int64, error)
	GetBukuAjar(ctx context.Context, p BukuAjarParams) ([]BukuAjar, int64, error)
	GetKepanitiaan(ctx context.Context, p KepanitiaanParams) ([]Kepanitiaan, int64, error)
	GetPrestasi(ctx context.Context, p PrestasiParams) ([]PrestasiMhs, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

func (r *repository) GetPembicara(ctx context.Context, p PembicaraParams) ([]Pembicara, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pb.id_sdm", p.IDSDM)
	cb.AppendInt("pb.id_kat_capaian", p.IDKatCapaian)
	cb.AppendString("pb.kat_bicara", p.KatBicara)
	cb.AppendString("pb.tkt_temu", p.TktTemu)
	cb.Like("pb.judul_makalah", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pb.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.pembicara pb LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = pb.id_sdm
		LEFT JOIN ref.kategori_capaian_luaran kcl ON kcl.id_kat_capaian = pb.id_kat_capaian`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	q := fmt.Sprintf(`
		SELECT pb.id_pembicara, pb.id_sdm, sdm.nm_sdm,
			pb.id_kat_capaian, kcl.nm_kat_capaian,
			pb.judul_makalah, pb.nm_temu_ilmiah, pb.kat_bicara,
			pb.penyelenggara, pb.tgl_laks, pb.bahasa, pb.tkt_temu,
			pb.sk_tugas, pb.last_sync
		%s WHERE %s ORDER BY pb.tgl_laks DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Pembicara
	for rows.Next() {
		var m Pembicara
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetPengelolaJurnal(ctx context.Context, p PengelolaJurnalParams) ([]PengelolaJurnal, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pj.id_sdm", p.IDSDM)
	cb.AppendUUID("pj.id_media_pub", p.IDMediaPub)
	cb.AppendInt("pj.a_aktif", p.AAktif)
	cb.Like("mp.nm_media_pub", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pj.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.pengelola_jurnal pj
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = pj.id_sdm
		LEFT JOIN ref.media_publikasi mp ON mp.id_media_pub = pj.id_media_pub`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	q := fmt.Sprintf(`
		SELECT pj.id_kelola_jurnal, pj.id_sdm, sdm.nm_sdm,
			pj.id_media_pub, mp.nm_media_pub,
			pj.peran, pj.sk_tugas, pj.tmt_sk_tugas, pj.tst_sk_tugas,
			pj.a_aktif, pj.last_sync
		%s WHERE %s ORDER BY pj.tmt_sk_tugas DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []PengelolaJurnal
	for rows.Next() {
		var m PengelolaJurnal
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetBukuAjar(ctx context.Context, p BukuAjarParams) ([]BukuAjar, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("b.id_buku_ajar", p.IDBukuAjar)
	cb.AppendInt("b.id_kat_capaian", p.IDKatCapaian)
	cb.AppendInt("b.id_jns_bhn_ajar", p.IDJnsBhnAjar)
	cb.AppendString("b.isbn", p.Isbn)
	cb.Like("b.judul_buku", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "b.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.buku_ajar b
		LEFT JOIN ref.kategori_capaian_luaran kcl ON kcl.id_kat_capaian = b.id_kat_capaian
		LEFT JOIN ref.jenis_bahan_ajar jba ON jba.id_jns_bhn_ajar = b.id_jns_bhn_ajar`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	q := fmt.Sprintf(`
		SELECT b.id_buku_ajar,
			b.id_kat_capaian, kcl.nm_kat_capaian,
			b.id_jns_bhn_ajar, jba.nm_jns_bhn_ajar,
			b.judul_buku, b.penulis, b.penerbit, b.isbn, b.tgl_terbit, b.last_sync
		%s WHERE %s ORDER BY b.tgl_terbit DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []BukuAjar
	for rows.Next() {
		var m BukuAjar
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetKepanitiaan(ctx context.Context, p KepanitiaanParams) ([]Kepanitiaan, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_panitia", p.IDPanitia)
	cb.AppendInt("k.id_jns_panitia", p.IDJnsPanitia)
	cb.AppendString("k.tkt_panitia", p.TktPanitia)
	cb.Like("k.nm_panitia", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.kepanitiaan k LEFT JOIN ref.jenis_kepanitiaan jk ON jk.id_jns_kepanitiaan = k.id_jns_panitia`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	q := fmt.Sprintf(`
		SELECT k.id_panitia, k.id_jns_panitia, jk.nm_jns_kepanitiaan AS nm_jns_panitia,
			k.nm_panitia, k.instansi, k.tkt_panitia,
			k.sk_tugas, k.tmt_sk_tugas, k.tst_sk_tugas, k.last_sync
		%s WHERE %s ORDER BY k.tmt_sk_tugas DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Kepanitiaan
	for rows.Next() {
		var m Kepanitiaan
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetPrestasi(ctx context.Context, p PrestasiParams) ([]PrestasiMhs, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pr.id_prestasi", p.IDPrestasi)
	cb.AppendUUID("pr.id_pd", p.IDPd)
	cb.AppendUUID("pr.id_akt_mhs", p.IDAktMhs)
	cb.AppendInt("pr.id_jenis_prestasi", p.IDJenisPrestasi)
	cb.AppendInt("pr.id_tkt_prestasi", p.IDTktPrestasi)
	cb.AppendInt("pr.thn_prestasi", p.ThnPrestasi)
	cb.Like("pr.nm_prestasi", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pr.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.prestasi pr
		LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = pr.id_pd
		LEFT JOIN ref.jenis_prestasi jp ON jp.id_jenis_prestasi = pr.id_jenis_prestasi
		LEFT JOIN ref.tingkat_prestasi tp ON tp.id_tkt_prestasi = pr.id_tkt_prestasi`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	q := fmt.Sprintf(`
		SELECT pr.id_prestasi,
			pr.id_jenis_prestasi, jp.nm_jenis_prestasi,
			pr.id_tkt_prestasi, tp.nm_tkt_prestasi,
			pr.id_pd, pd.nm_pd,
			pr.id_akt_mhs, pr.nm_prestasi,
			pr.thn_prestasi, pr.penyelenggara, pr.peringkat, pr.last_sync
		%s WHERE %s ORDER BY pr.thn_prestasi DESC, pr.peringkat ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []PrestasiMhs
	for rows.Next() {
		var m PrestasiMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// Service + cache
// ============================================================================

type Service interface {
	GetPembicara(ctx context.Context, p PembicaraParams) ([]Pembicara, int64, error)
	GetPengelolaJurnal(ctx context.Context, p PengelolaJurnalParams) ([]PengelolaJurnal, int64, error)
	GetBukuAjar(ctx context.Context, p BukuAjarParams) ([]BukuAjar, int64, error)
	GetKepanitiaan(ctx context.Context, p KepanitiaanParams) ([]Kepanitiaan, int64, error)
	GetPrestasi(ctx context.Context, p PrestasiParams) ([]PrestasiMhs, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "kontribusi:"+key+":data", "kontribusi:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tk); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
				log.Printf("Cache hit %s", key)
				return data, total, nil
			}
		}
	}
	data, total, err := fetch()
	if err != nil { return nil, 0, err }
	dj, _ := json.Marshal(data)
	tj, _ := json.Marshal(total)
	cache.Set(ctx, d, string(dj), cacheTTL)
	cache.Set(ctx, tk, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) GetPembicara(ctx context.Context, p PembicaraParams) ([]Pembicara, int64, error) {
	return cached(ctx, fmt.Sprintf("pembicara:%s", utils.HashParams(p)),
		func() ([]Pembicara, int64, error) { return s.repo.GetPembicara(ctx, p) })
}
func (s *service) GetPengelolaJurnal(ctx context.Context, p PengelolaJurnalParams) ([]PengelolaJurnal, int64, error) {
	return cached(ctx, fmt.Sprintf("jurnal:%s", utils.HashParams(p)),
		func() ([]PengelolaJurnal, int64, error) { return s.repo.GetPengelolaJurnal(ctx, p) })
}
func (s *service) GetBukuAjar(ctx context.Context, p BukuAjarParams) ([]BukuAjar, int64, error) {
	return cached(ctx, fmt.Sprintf("buku:%s", utils.HashParams(p)),
		func() ([]BukuAjar, int64, error) { return s.repo.GetBukuAjar(ctx, p) })
}
func (s *service) GetKepanitiaan(ctx context.Context, p KepanitiaanParams) ([]Kepanitiaan, int64, error) {
	return cached(ctx, fmt.Sprintf("kepanitiaan:%s", utils.HashParams(p)),
		func() ([]Kepanitiaan, int64, error) { return s.repo.GetKepanitiaan(ctx, p) })
}
func (s *service) GetPrestasi(ctx context.Context, p PrestasiParams) ([]PrestasiMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("prestasi:%s", utils.HashParams(p)),
		func() ([]PrestasiMhs, int64, error) { return s.repo.GetPrestasi(ctx, p) })
}

// ============================================================================
// Handlers + Router
// ============================================================================

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

func (h *Handler) GetPembicara(c *fiber.Ctx) error {
	var p PembicaraParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPembicara(c.Context(), p)
	if err != nil { log.Printf("pembicara: %v", err); return response.InternalError(c, "Gagal mengambil data pembicara") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pembicara/narasumber", data, p.Page, p.Limit, total)
}
func (h *Handler) GetPengelolaJurnal(c *fiber.Ctx) error {
	var p PengelolaJurnalParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPengelolaJurnal(c.Context(), p)
	if err != nil { log.Printf("jurnal: %v", err); return response.InternalError(c, "Gagal mengambil data pengelola jurnal") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pengelola jurnal", data, p.Page, p.Limit, total)
}
func (h *Handler) GetBukuAjar(c *fiber.Ctx) error {
	var p BukuAjarParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetBukuAjar(c.Context(), p)
	if err != nil { log.Printf("buku: %v", err); return response.InternalError(c, "Gagal mengambil buku ajar") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data buku ajar", data, p.Page, p.Limit, total)
}
func (h *Handler) GetKepanitiaan(c *fiber.Ctx) error {
	var p KepanitiaanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKepanitiaan(c.Context(), p)
	if err != nil { log.Printf("kepanitiaan: %v", err); return response.InternalError(c, "Gagal mengambil data kepanitiaan") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kepanitiaan", data, p.Page, p.Limit, total)
}
func (h *Handler) GetPrestasi(c *fiber.Ctx) error {
	var p PrestasiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPrestasi(c.Context(), p)
	if err != nil { log.Printf("prestasi: %v", err); return response.InternalError(c, "Gagal mengambil data prestasi") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data prestasi mahasiswa", data, p.Page, p.Limit, total)
}

// RegisterRoutesWithMiddleware — mount /v1/kontribusi/*
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/kontribusi", middlewares...)
	} else {
		g = router.Group("/kontribusi", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	g.Get("/list_pembicara", h.GetPembicara)
	g.Get("/list_pengelola_jurnal", h.GetPengelolaJurnal)
	g.Get("/list_buku_ajar", h.GetBukuAjar)
	g.Get("/list_kepanitiaan", h.GetKepanitiaan)
	g.Get("/list_prestasi", h.GetPrestasi)
}
