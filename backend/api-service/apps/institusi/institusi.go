// Package institusi — endpoint profil institusi: prodi (sms), satuan_pendidikan,
// profil_prodi, akreditasi_prodi. Source: pdrd.
package institusi

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

const cacheTTL = 30 * time.Minute // institusi stabil, cache lebih lama

// ============================================================================
// Entities
// ============================================================================

type Prodi struct {
	IDSms        utils.UUID           `db:"id_sms" json:"id_sms"`
	NmLemb       string               `db:"nm_lemb" json:"nm_lemb"`
	NmProdiEng   *string              `db:"nm_prodi_english" json:"nm_prodi_english"`
	Singkatan    *string              `db:"singkatan" json:"singkatan"`
	KodeProdi    *string              `db:"kode_prodi" json:"kode_prodi"`
	KodeSnpmb    *string              `db:"kode_snpmb" json:"kode_snpmb"`
	IDFakUnila   *string              `db:"id_fak_unila" json:"id_fak_unila"`
	NmFakultas   *string              `db:"nm_fakultas" json:"nm_fakultas"`
	IDJenjDidik  *int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik  *string              `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	IDJnsSms     *int                 `db:"id_jns_sms" json:"id_jns_sms"`
	NmJnsSms     *string              `db:"nm_jns_sms" json:"nm_jns_sms"`
	StatProdi    *string              `db:"stat_prodi" json:"stat_prodi"`
	StatProdiUnila *string            `db:"stat_prodi_unila" json:"stat_prodi_unila"`
	GelarLulusan *string              `db:"gelar_lulusan" json:"gelar_lulusan"`
	SksLulus     *int                 `db:"sks_lulus" json:"sks_lulus"`
	SmtMulai     *string              `db:"smt_mulai" json:"smt_mulai"`
	TglBerdiri   *pk.SQLServerTime    `db:"tgl_berdiri" json:"tgl_berdiri"`
	TglTutup     *pk.SQLServerTime    `db:"tgl_tutup" json:"tgl_tutup"`
	SkSelenggara *string              `db:"sk_selenggara" json:"sk_selenggara"`
	TglSkSelenggara *pk.SQLServerTime `db:"tgl_sk_selenggara" json:"tgl_sk_selenggara"`
	Email        *string              `db:"email" json:"email"`
	NoTel        *string              `db:"no_tel" json:"no_tel"`
	Website      *string              `db:"website" json:"website"`
	LastSync     pk.SQLServerTime     `db:"last_sync" json:"last_sync"`
}

type SatuanPendidikan struct {
	IDSp          utils.UUID           `db:"id_sp" json:"id_sp"`
	NmLemb        string               `db:"nm_lemb" json:"nm_lemb"`
	NmSingkat     *string              `db:"nm_singkat" json:"nm_singkat"`
	Npsn          *string              `db:"npsn" json:"npsn"`
	Nss           *string              `db:"nss" json:"nss"`
	StatSp        *string              `db:"stat_sp" json:"stat_sp"`
	SkPendirianSp *string              `db:"sk_pendirian_sp" json:"sk_pendirian_sp"`
	TglSkPendirian *pk.SQLServerTime   `db:"tgl_sk_pendirian_sp" json:"tgl_sk_pendirian_sp"`
	TglBerdiri    *pk.SQLServerTime    `db:"tgl_berdiri" json:"tgl_berdiri"`
	Jln           *string              `db:"jln" json:"jln"`
	DsKel         *string              `db:"ds_kel" json:"ds_kel"`
	KodePos       *string              `db:"kode_pos" json:"kode_pos"`
	NoTel         *string              `db:"no_tel" json:"no_tel"`
	Email         *string              `db:"email" json:"email"`
	Website       *string              `db:"website" json:"website"`
	Npwp          *string              `db:"npwp" json:"npwp"`
	IDWil         *string              `db:"id_wil" json:"id_wil"`
	NmWil         *string              `db:"nm_wil" json:"nm_wil"`
	LastSync      pk.SQLServerTime     `db:"last_sync" json:"last_sync"`
}

type ProfilProdi struct {
	IDThnAjaran    int                 `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran    *string             `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	IDSms          utils.UUID          `db:"id_sms" json:"id_sms"`
	NmLemb         *string             `db:"nm_lemb" json:"nm_lemb"`
	DeskSingkat    *string             `db:"desk_singkat" json:"desk_singkat"`
	Visi           *string             `db:"visi" json:"visi"`
	Misi           *string             `db:"misi" json:"misi"`
	Tujuan         *string             `db:"tujuan" json:"tujuan"`
	Sasaran        *string             `db:"sasaran" json:"sasaran"`
	Kompetensi     *string             `db:"kompetensi" json:"kompetensi"`
	CapaianBelajar *string             `db:"capaian_belajar" json:"capaian_belajar"`
	LastSync       pk.SQLServerTime    `db:"last_sync" json:"last_sync"`
}

type AkreditasiProdi struct {
	IDAkreditasiProdi utils.UUID           `db:"id_akreditasi_prodi" json:"id_akreditasi_prodi"`
	IDSms             utils.UUID           `db:"id_sms" json:"id_sms"`
	NmLemb            *string              `db:"nm_lemb" json:"nm_lemb"`
	IDLembAkred       *int                 `db:"id_lemb_akred" json:"id_lemb_akred"`
	NmLembAkred       *string              `db:"nm_lemb_akred" json:"nm_lemb_akred"`
	IDAkred           *int                 `db:"id_akred" json:"id_akred"`
	NmAkred           *string              `db:"nm_akred" json:"nm_akred"`
	SkAkreditasi      *string              `db:"sk_akreditasi_prodi" json:"sk_akreditasi_prodi"`
	TglSk             *pk.SQLServerTime    `db:"tanggal_sk_akreditasi_prodi" json:"tanggal_sk_akreditasi_prodi"`
	TstSk             *pk.SQLServerTime    `db:"tst_sk_akreditasi_prodi" json:"tst_sk_akreditasi_prodi"`
	AsalData          *string              `db:"asal_data" json:"asal_data"`
	AAktif            *int                 `db:"a_aktif" json:"a_aktif"`
	LastSync          pk.SQLServerTime     `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Repository
// ============================================================================

type Repository interface {
	GetProdi(ctx context.Context, p types.ProdiParams) ([]Prodi, int64, error)
	GetSatuanPendidikan(ctx context.Context, p types.SatuanPendidikanParams) ([]SatuanPendidikan, int64, error)
	GetProfilProdi(ctx context.Context, p types.ProfilProdiParams) ([]ProfilProdi, int64, error)
	GetAkreditasiProdi(ctx context.Context, p types.AkreditasiProdiParams) ([]AkreditasiProdi, int64, error)

	// Batch 9b
	GetLembagaIptek(ctx context.Context, p LembagaIptekParams) ([]LembagaIptek, int64, error)

	// Batch 10 — PT-level
	GetProfilPt(ctx context.Context, p ProfilPtParams) ([]ProfilPt, int64, error)
	GetAkredSp(ctx context.Context, p AkredSpParams) ([]AkredSp, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

func (r *repository) GetProdi(ctx context.Context, p types.ProdiParams) ([]Prodi, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("s.id_sms", p.IDSms)
	cb.AppendString("s.id_fak_unila", p.IDFakUnila)
	cb.AppendInt("s.id_jenj_didik", p.IDJenjDidik)
	cb.AppendInt("s.id_jns_sms", p.IDJnsSms)
	cb.AppendString("s.stat_prodi", p.StatProdi)
	cb.AppendString("s.kode_prodi", p.KodeProdi)
	cb.Like("s.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "s.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.sms s
		LEFT JOIN man_akses.unit_organisasi uo ON CAST(uo.id_organisasi AS VARCHAR(50)) = CAST(s.id_fak_unila AS VARCHAR(50))
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		LEFT JOIN ref.jenis_sms js ON js.id_jns_sms = s.id_jns_sms`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "s.nm_lemb", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT s.id_sms, s.nm_lemb,
			s.nm_prodi_english, s.singkatan,
			s.kode_prodi, s.kode_snpmb,
			s.id_fak_unila, ISNULL(uo.nm_lemb, '') AS nm_fakultas,
			s.id_jenj_didik, jp.nm_jenj_didik,
			s.id_jns_sms, js.nm_jns_sms,
			s.stat_prodi, s.stat_prodi_unila,
			s.gelar_lulusan, s.sks_lulus, s.smt_mulai,
			s.tgl_berdiri, s.tgl_tutup,
			s.sk_selenggara, s.tgl_sk_selenggara,
			s.email, s.no_tel, s.website, s.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Prodi
	for rows.Next() {
		var m Prodi
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetSatuanPendidikan(ctx context.Context, p types.SatuanPendidikanParams) ([]SatuanPendidikan, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("sp.id_sp", p.IDSp)
	cb.AppendString("sp.npsn", p.Npsn)
	cb.Like("sp.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "sp.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.satuan_pendidikan sp LEFT JOIN ref.wilayah w ON w.id_wil = sp.id_wil`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) "+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT sp.id_sp, sp.nm_lemb, sp.nm_singkat, sp.npsn, sp.nss,
			sp.stat_sp, sp.sk_pendirian_sp, sp.tgl_sk_pendirian_sp, sp.tgl_berdiri,
			sp.jln, sp.ds_kel, sp.kode_pos, sp.no_tel, sp.email, sp.website,
			sp.npwp, sp.id_wil, w.nm_wil, sp.last_sync
		%s WHERE %s ORDER BY sp.nm_lemb ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []SatuanPendidikan
	for rows.Next() {
		var m SatuanPendidikan
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetProfilProdi(ctx context.Context, p types.ProfilProdiParams) ([]ProfilProdi, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pp.id_sms", p.IDSms)
	cb.AppendInt("pp.id_thn_ajaran", p.IDThnAjaran)
	cb.Like("s.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pp.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.profil_prodi pp
		LEFT JOIN pdrd.sms s ON s.id_sms = pp.id_sms
		LEFT JOIN ref.tahun_ajaran ta ON ta.id_thn_ajaran = pp.id_thn_ajaran`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT pp.id_thn_ajaran, ta.nm_thn_ajaran,
			pp.id_sms, s.nm_lemb,
			pp.desk_singkat, pp.visi, pp.misi, pp.tujuan, pp.sasaran,
			pp.kompetensi, pp.capaian_belajar, pp.last_sync
		%s WHERE %s ORDER BY pp.id_thn_ajaran DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []ProfilProdi
	for rows.Next() {
		var m ProfilProdi
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetAkreditasiProdi(ctx context.Context, p types.AkreditasiProdiParams) ([]AkreditasiProdi, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("ap.id_sms", p.IDSms)
	cb.AppendInt("ap.id_lemb_akred", p.IDLembAkred)
	cb.AppendInt("ap.id_akred", p.IDAkred)
	cb.AppendInt("ap.a_aktif", p.AAktif)
	cb.Like("s.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "ap.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.akreditasi_prodi ap
		LEFT JOIN pdrd.sms s ON s.id_sms = ap.id_sms
		LEFT JOIN ref.lembaga_akred la ON la.id_lemb_akred = ap.id_lemb_akred
		LEFT JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT ap.id_akreditasi_prodi,
			ap.id_sms, s.nm_lemb,
			ap.id_lemb_akred, la.nm_lemb_akred,
			ap.id_akred, na.nm_akred,
			ap.sk_akreditasi_prodi, ap.tanggal_sk_akreditasi_prodi, ap.tst_sk_akreditasi_prodi,
			ap.asal_data, ap.a_aktif, ap.last_sync
		%s WHERE %s ORDER BY ap.tanggal_sk_akreditasi_prodi DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []AkreditasiProdi
	for rows.Next() {
		var m AkreditasiProdi
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// Service (cache)
// ============================================================================

type Service interface {
	GetProdi(ctx context.Context, p types.ProdiParams) ([]Prodi, int64, error)
	GetSatuanPendidikan(ctx context.Context, p types.SatuanPendidikanParams) ([]SatuanPendidikan, int64, error)
	GetProfilProdi(ctx context.Context, p types.ProfilProdiParams) ([]ProfilProdi, int64, error)
	GetAkreditasiProdi(ctx context.Context, p types.AkreditasiProdiParams) ([]AkreditasiProdi, int64, error)

	// Batch 9b
	GetLembagaIptek(ctx context.Context, p LembagaIptekParams) ([]LembagaIptek, int64, error)

	// Batch 10 — PT-level
	GetProfilPt(ctx context.Context, p ProfilPtParams) ([]ProfilPt, int64, error)
	GetAkredSp(ctx context.Context, p AkredSpParams) ([]AkredSp, int64, error)
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cachedFetch[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tkey := "institusi:"+key+":data", "institusi:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tkey); err2 == nil {
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
	cache.Set(ctx, tkey, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) GetProdi(ctx context.Context, p types.ProdiParams) ([]Prodi, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("prodi:%s", utils.HashParams(p)),
		func() ([]Prodi, int64, error) { return s.repo.GetProdi(ctx, p) })
}
func (s *service) GetSatuanPendidikan(ctx context.Context, p types.SatuanPendidikanParams) ([]SatuanPendidikan, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("sp:%s", utils.HashParams(p)),
		func() ([]SatuanPendidikan, int64, error) { return s.repo.GetSatuanPendidikan(ctx, p) })
}
func (s *service) GetProfilProdi(ctx context.Context, p types.ProfilProdiParams) ([]ProfilProdi, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("profil:%s", utils.HashParams(p)),
		func() ([]ProfilProdi, int64, error) { return s.repo.GetProfilProdi(ctx, p) })
}
func (s *service) GetAkreditasiProdi(ctx context.Context, p types.AkreditasiProdiParams) ([]AkreditasiProdi, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("akred:%s", utils.HashParams(p)),
		func() ([]AkreditasiProdi, int64, error) { return s.repo.GetAkreditasiProdi(ctx, p) })
}

// ============================================================================
// Handlers + Router
// ============================================================================

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

func (h *Handler) GetProdi(c *fiber.Ctx) error {
	var p types.ProdiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetProdi(c.Context(), p)
	if err != nil {
		log.Printf("prodi: %v", err); return response.InternalError(c, "Gagal mengambil data prodi")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data program studi", data, p.Page, p.Limit, total)
}
func (h *Handler) GetSatuanPendidikan(c *fiber.Ctx) error {
	var p types.SatuanPendidikanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetSatuanPendidikan(c.Context(), p)
	if err != nil {
		log.Printf("sp: %v", err); return response.InternalError(c, "Gagal mengambil data satuan pendidikan")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data satuan pendidikan (fakultas/sekolah)", data, p.Page, p.Limit, total)
}
func (h *Handler) GetProfilProdi(c *fiber.Ctx) error {
	var p types.ProfilProdiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetProfilProdi(c.Context(), p)
	if err != nil {
		log.Printf("profil: %v", err); return response.InternalError(c, "Gagal mengambil profil prodi")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil profil prodi", data, p.Page, p.Limit, total)
}
func (h *Handler) GetAkreditasiProdi(c *fiber.Ctx) error {
	var p types.AkreditasiProdiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAkreditasiProdi(c.Context(), p)
	if err != nil {
		log.Printf("akred: %v", err); return response.InternalError(c, "Gagal mengambil akreditasi prodi")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data akreditasi prodi", data, p.Page, p.Limit, total)
}

// RegisterRoutesWithMiddleware mount endpoint di /v1/institusi/*
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/institusi", middlewares...)
	} else {
		g = router.Group("/institusi", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	g.Get("/list_prodi", h.GetProdi)
	g.Get("/list_satuan_pendidikan", h.GetSatuanPendidikan)
	g.Get("/list_profil_prodi", h.GetProfilProdi)
	g.Get("/list_akreditasi_prodi", h.GetAkreditasiProdi)

	// Batch 9b
	g.Get("/list_lembaga_iptek", h.GetLembagaIptek)

	// Batch 10 — PT-level (profil_pt, akred_sp)
	g.Get("/list_profil_pt", h.GetProfilPt)
	g.Get("/list_akred_sp", h.GetAkredSp)
}
