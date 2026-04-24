package akademik

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	pt "github.com/myunila/api-service/apps/pdrd/types"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/response"
	itype "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 8 — Akademik advanced
// akt_ajar_dosen (BKD mengajar), rencana_ajar (RPS), matkul_kurikulum (MK per
// kurikulum), substansi_kuliah, re_mk (komponen evaluasi MK).
// ============================================================================

// ---------- Entities ----------

type AktAjarDosen struct {
	IDAjar       utils.UUID          `db:"id_ajar" json:"id_ajar"`
	IDRegPtk     utils.UUID          `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDSDM        utils.NullUUID      `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string             `db:"nm_sdm" json:"nm_sdm"`
	Nidn         *string             `db:"nidn" json:"nidn"`
	IDKls        utils.UUID          `db:"id_kls" json:"id_kls"`
	NmKls        *string             `db:"nm_kls" json:"nm_kls"`
	IDMk         utils.NullUUID      `db:"id_mk" json:"id_mk"`
	KodeMk       *string             `db:"kode_mk" json:"kode_mk"`
	NmMk         *string             `db:"nm_mk" json:"nm_mk"`
	IDSmt        *string             `db:"id_smt" json:"id_smt"`
	NmSmt        *string             `db:"nm_smt" json:"nm_smt"`
	IDKatgiat    *int                `db:"id_katgiat" json:"id_katgiat"`
	IDJnsEval    *int                `db:"id_jns_eval" json:"id_jns_eval"`
	SksSubstTot  *float64            `db:"sks_subst_tot" json:"sks_subst_tot"`
	SksTmSubst   *float64            `db:"sks_tm_subst" json:"sks_tm_subst"`
	SksPrakSubst *float64            `db:"sks_prak_subst" json:"sks_prak_subst"`
	JmlTmRenc    *int                `db:"jml_tm_renc" json:"jml_tm_renc"`
	JmlTmReal    *int                `db:"jml_tm_real" json:"jml_tm_real"`
	JmlMhs       *int                `db:"jml_mhs" json:"jml_mhs"`
	LastSync     itype.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type RencanaAjar struct {
	IDRencAjar      utils.UUID          `db:"id_renc_ajar" json:"id_renc_ajar"`
	IDMk            utils.UUID          `db:"id_mk" json:"id_mk"`
	KodeMk          *string             `db:"kode_mk" json:"kode_mk"`
	NmMk            *string             `db:"nm_mk" json:"nm_mk"`
	NoUrut          *int                `db:"no_urut" json:"no_urut"`
	Pertemuan       int                 `db:"pertemuan" json:"pertemuan"`
	MateriIndonesia *string             `db:"materi_indonesia" json:"materi_indonesia"`
	MateriInggris   *string             `db:"materi_inggris" json:"materi_inggris"`
	LastSync        itype.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type MatkulKurikulum struct {
	IDKurikulumSp utils.UUID          `db:"id_kurikulum_sp" json:"id_kurikulum_sp"`
	NmKurikulumSp *string             `db:"nm_kurikulum_sp" json:"nm_kurikulum_sp"`
	IDMk          utils.UUID          `db:"id_mk" json:"id_mk"`
	KodeMk        *string             `db:"kode_mk" json:"kode_mk"`
	NmMk          *string             `db:"nm_mk" json:"nm_mk"`
	Smt           *int                `db:"smt" json:"smt"`
	SksMk         *float64            `db:"sks_mk" json:"sks_mk"`
	SksTm         *float64            `db:"sks_tm" json:"sks_tm"`
	SksPrak       *float64            `db:"sks_prak" json:"sks_prak"`
	SksPrakLap    *float64            `db:"sks_prak_lap" json:"sks_prak_lap"`
	SksSim        *float64            `db:"sks_sim" json:"sks_sim"`
	AWajib        *int                `db:"a_wajib" json:"a_wajib"`
	LastSync      itype.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type SubstansiKuliah struct {
	IDSubst    utils.UUID          `db:"id_subst" json:"id_subst"`
	IDSms      utils.NullUUID      `db:"id_sms" json:"id_sms"`
	NmSms      *string             `db:"nm_sms" json:"nm_sms"`
	IDJnsSubst string              `db:"id_jns_subst" json:"id_jns_subst"`
	NmSubst    string              `db:"nm_subst" json:"nm_subst"`
	SksMk      *float64            `db:"sks_mk" json:"sks_mk"`
	SksTm      *float64            `db:"sks_tm" json:"sks_tm"`
	SksPrak    *float64            `db:"sks_prak" json:"sks_prak"`
	SksPrakLap *float64            `db:"sks_prak_lap" json:"sks_prak_lap"`
	SksSim     *float64            `db:"sks_sim" json:"sks_sim"`
	LastSync   itype.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type ReMk struct {
	IDReMk           utils.UUID          `db:"id_re_mk" json:"id_re_mk"`
	IDMk             utils.UUID          `db:"id_mk" json:"id_mk"`
	KodeMk           *string             `db:"kode_mk" json:"kode_mk"`
	NmMk             *string             `db:"nm_mk" json:"nm_mk"`
	IDJnsEval        int                 `db:"id_jns_eval" json:"id_jns_eval"`
	NoUrut           *int                `db:"no_urut" json:"no_urut"`
	KomponenEvaluasi *string             `db:"komponen_evaluasi" json:"komponen_evaluasi"`
	DeskIndo         string              `db:"desk_indo" json:"desk_indo"`
	DeskIng          *string             `db:"desk_ing" json:"desk_ing"`
	BobotEvaluasi    *float64            `db:"bobot_evaluasi" json:"bobot_evaluasi"`
	LastSync         itype.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ---------- Params ----------

type AktAjarDosenParams struct {
	pt.PaginationParams
	IDAjar   *string `query:"id_ajar"`
	IDRegPtk *string `query:"id_reg_ptk"`
	IDSDM    *string `query:"id_sdm"`
	IDKls    *string `query:"id_kls"`
	IDMk     *string `query:"id_mk"`
	IDSmt    *string `query:"id_smt"`
}

type RencanaAjarParams struct {
	pt.PaginationParams
	IDRencAjar *string `query:"id_renc_ajar"`
	IDMk       *string `query:"id_mk"`
	Pertemuan  *int    `query:"pertemuan"`
}

type MatkulKurikulumParams struct {
	pt.PaginationParams
	IDKurikulumSp *string `query:"id_kurikulum_sp"`
	IDMk          *string `query:"id_mk"`
	Smt           *int    `query:"smt"`
	AWajib        *int    `query:"a_wajib"`
}

type SubstansiKuliahParams struct {
	pt.PaginationParams
	IDSubst    *string `query:"id_subst"`
	IDSms      *string `query:"id_sms"`
	IDJnsSubst *string `query:"id_jns_subst"`
}

type ReMkParams struct {
	pt.PaginationParams
	IDReMk           *string `query:"id_re_mk"`
	IDMk             *string `query:"id_mk"`
	IDJnsEval        *int    `query:"id_jns_eval"`
	KomponenEvaluasi *string `query:"komponen_evaluasi"`
}

// ---------- Repository impls ----------

func (r *repository) GetAktAjarDosen(ctx context.Context, p AktAjarDosenParams) ([]AktAjarDosen, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_ajar", p.IDAjar)
	cb.AppendUUID("a.id_reg_ptk", p.IDRegPtk)
	cb.AppendUUID("rp.id_sdm", p.IDSDM)
	cb.AppendUUID("a.id_kls", p.IDKls)
	cb.AppendUUID("k.id_mk", p.IDMk)
	cb.AppendString("k.id_smt", p.IDSmt)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.akt_ajar_dosen a
		LEFT JOIN pdrd.reg_ptk rp ON rp.id_reg_ptk = a.id_reg_ptk
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = rp.id_sdm
		LEFT JOIN pdrd.kelas_kuliah k ON k.id_kls = a.id_kls
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
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
		SELECT a.id_ajar, a.id_reg_ptk,
			rp.id_sdm, sd.nm_sdm, sd.nidn,
			a.id_kls, k.nm_kls,
			k.id_mk, mk.kode_mk, mk.nm_mk,
			k.id_smt, smt.nm_smt,
			a.id_katgiat, a.id_jns_eval,
			a.sks_subst_tot, a.sks_tm_subst, a.sks_prak_subst,
			a.jml_tm_renc, a.jml_tm_real, a.jml_mhs, a.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []AktAjarDosen
	for rows.Next() {
		var m AktAjarDosen
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetRencanaAjar(ctx context.Context, p RencanaAjarParams) ([]RencanaAjar, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("ra.id_renc_ajar", p.IDRencAjar)
	cb.AppendUUID("ra.id_mk", p.IDMk)
	cb.AppendInt("ra.pertemuan", p.Pertemuan)
	cb.Like("ra.materi_indonesia", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "ra.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.rencana_ajar ra
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = ra.id_mk`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "mk.kode_mk, ra.pertemuan", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT ra.id_renc_ajar, ra.id_mk,
			mk.kode_mk, mk.nm_mk,
			ra.no_urut, ra.pertemuan,
			ra.materi_indonesia, ra.materi_inggris, ra.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RencanaAjar
	for rows.Next() {
		var m RencanaAjar
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetMatkulKurikulum(ctx context.Context, p MatkulKurikulumParams) ([]MatkulKurikulum, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("mkk.id_kurikulum_sp", p.IDKurikulumSp)
	cb.AppendUUID("mkk.id_mk", p.IDMk)
	cb.AppendInt("mkk.smt", p.Smt)
	cb.AppendInt("mkk.a_wajib", p.AWajib)
	cb.Like("mk.nm_mk", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "mkk.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.matkul_kurikulum mkk
		LEFT JOIN pdrd.kurikulum_sp ks ON ks.id_kurikulum_sp = mkk.id_kurikulum_sp
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = mkk.id_mk`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "mkk.smt, mk.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT mkk.id_kurikulum_sp, ks.nm_kurikulum_sp,
			mkk.id_mk, mk.kode_mk, mk.nm_mk,
			mkk.smt, mkk.sks_mk, mkk.sks_tm, mkk.sks_prak,
			mkk.sks_prak_lap, mkk.sks_sim, mkk.a_wajib, mkk.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []MatkulKurikulum
	for rows.Next() {
		var m MatkulKurikulum
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetSubstansiKuliah(ctx context.Context, p SubstansiKuliahParams) ([]SubstansiKuliah, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("sk.id_subst", p.IDSubst)
	cb.AppendUUID("sk.id_sms", p.IDSms)
	cb.AppendString("sk.id_jns_subst", p.IDJnsSubst)
	cb.Like("sk.nm_subst", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "sk.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.substansi_kuliah sk
		LEFT JOIN pdrd.sms s ON s.id_sms = sk.id_sms`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sk.nm_subst", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT sk.id_subst,
			sk.id_sms, s.nm_lemb AS nm_sms,
			sk.id_jns_subst, sk.nm_subst,
			sk.sks_mk, sk.sks_tm, sk.sks_prak, sk.sks_prak_lap, sk.sks_sim, sk.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SubstansiKuliah
	for rows.Next() {
		var m SubstansiKuliah
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetReMk(ctx context.Context, p ReMkParams) ([]ReMk, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("re.id_re_mk", p.IDReMk)
	cb.AppendUUID("re.id_mk", p.IDMk)
	cb.AppendInt("re.id_jns_eval", p.IDJnsEval)
	cb.AppendString("re.komponen_evaluasi", p.KomponenEvaluasi)
	cb.Like("re.desk_indo", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "re.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.re_mk re
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = re.id_mk`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "mk.kode_mk, re.no_urut", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT re.id_re_mk,
			re.id_mk, mk.kode_mk, mk.nm_mk,
			re.id_jns_eval, re.no_urut, re.komponen_evaluasi,
			re.desk_indo, re.desk_ing, re.bobot_evaluasi, re.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []ReMk
	for rows.Next() {
		var m ReMk
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------- Service impls ----------

func cachedB8[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "akademik:"+key+":data", "akademik:"+key+":total"
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
	if err != nil {
		return nil, 0, err
	}
	dj, _ := json.Marshal(data)
	tj, _ := json.Marshal(total)
	cache.Set(ctx, d, string(dj), cacheTTL)
	cache.Set(ctx, tk, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) GetAktAjarDosen(ctx context.Context, p AktAjarDosenParams) ([]AktAjarDosen, int64, error) {
	return cachedB8(ctx, fmt.Sprintf("akt_ajar:%s", utils.HashParams(p)),
		func() ([]AktAjarDosen, int64, error) { return s.repo.GetAktAjarDosen(ctx, p) })
}
func (s *service) GetRencanaAjar(ctx context.Context, p RencanaAjarParams) ([]RencanaAjar, int64, error) {
	return cachedB8(ctx, fmt.Sprintf("rencana_ajar:%s", utils.HashParams(p)),
		func() ([]RencanaAjar, int64, error) { return s.repo.GetRencanaAjar(ctx, p) })
}
func (s *service) GetMatkulKurikulum(ctx context.Context, p MatkulKurikulumParams) ([]MatkulKurikulum, int64, error) {
	return cachedB8(ctx, fmt.Sprintf("matkul_kur:%s", utils.HashParams(p)),
		func() ([]MatkulKurikulum, int64, error) { return s.repo.GetMatkulKurikulum(ctx, p) })
}
func (s *service) GetSubstansiKuliah(ctx context.Context, p SubstansiKuliahParams) ([]SubstansiKuliah, int64, error) {
	return cachedB8(ctx, fmt.Sprintf("substansi:%s", utils.HashParams(p)),
		func() ([]SubstansiKuliah, int64, error) { return s.repo.GetSubstansiKuliah(ctx, p) })
}
func (s *service) GetReMk(ctx context.Context, p ReMkParams) ([]ReMk, int64, error) {
	return cachedB8(ctx, fmt.Sprintf("re_mk:%s", utils.HashParams(p)),
		func() ([]ReMk, int64, error) { return s.repo.GetReMk(ctx, p) })
}

// ---------- Handlers ----------

func (h *Handler) ListAktAjarDosen(c *fiber.Ctx) error {
	var p AktAjarDosenParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAktAjarDosen(c.Context(), p)
	if err != nil {
		log.Printf("akt_ajar_dosen: %v", err)
		return response.InternalError(c, "Gagal mengambil data aktivitas mengajar dosen")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data aktivitas mengajar dosen", data, p.Page, p.Limit, total)
}

func (h *Handler) ListRencanaAjar(c *fiber.Ctx) error {
	var p RencanaAjarParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetRencanaAjar(c.Context(), p)
	if err != nil {
		log.Printf("rencana_ajar: %v", err)
		return response.InternalError(c, "Gagal mengambil data RPS")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data RPS", data, p.Page, p.Limit, total)
}

func (h *Handler) ListMatkulKurikulum(c *fiber.Ctx) error {
	var p MatkulKurikulumParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetMatkulKurikulum(c.Context(), p)
	if err != nil {
		log.Printf("matkul_kurikulum: %v", err)
		return response.InternalError(c, "Gagal mengambil data matkul kurikulum")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data matkul kurikulum", data, p.Page, p.Limit, total)
}

func (h *Handler) ListSubstansiKuliah(c *fiber.Ctx) error {
	var p SubstansiKuliahParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetSubstansiKuliah(c.Context(), p)
	if err != nil {
		log.Printf("substansi_kuliah: %v", err)
		return response.InternalError(c, "Gagal mengambil data substansi kuliah")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data substansi kuliah", data, p.Page, p.Limit, total)
}

func (h *Handler) ListReMk(c *fiber.Ctx) error {
	var p ReMkParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetReMk(c.Context(), p)
	if err != nil {
		log.Printf("re_mk: %v", err)
		return response.InternalError(c, "Gagal mengambil data evaluasi MK")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data evaluasi MK", data, p.Page, p.Limit, total)
}
