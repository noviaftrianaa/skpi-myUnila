package sdm

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 6 — SDM specialized: detasering, visiting_scientist, anggota_orgprof,
// penghargaan. Semua filter wajib id_sdm untuk isolation.
// ============================================================================

type Detasering struct {
	IDDetasering utils.UUID           `db:"id_detasering" json:"id_detasering"`
	IDSDM        utils.UUID           `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string              `db:"nm_sdm" json:"nm_sdm"`
	IDSpSumber   utils.NullUUID       `db:"id_sp_sumber" json:"id_sp_sumber"`
	NmSpSumber   *string              `db:"nm_sp_sumber" json:"nm_sp_sumber"`
	IDSpSasaran  utils.NullUUID       `db:"id_sp_sasaran" json:"id_sp_sasaran"`
	NmSpSasaran  *string              `db:"nm_sp_sasaran" json:"nm_sp_sasaran"`
	TglMulai     *pk.SQLServerTime    `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai   *pk.SQLServerTime    `db:"tgl_selesai" json:"tgl_selesai"`
	BidTgs       *string              `db:"bid_tgs" json:"bid_tgs"`
	DeskKeg      *string              `db:"desk_keg" json:"desk_keg"`
	MetodeLaks   *string              `db:"metode_laks" json:"metode_laks"`
	SkTugas      *string              `db:"sk_tugas" json:"sk_tugas"`
	TglSkTugas   *pk.SQLServerTime    `db:"tgl_sk_tugas" json:"tgl_sk_tugas"`
	LastSync     pk.SQLServerTime     `db:"last_sync" json:"last_sync"`
}

type VisitingScientist struct {
	IDVisit         utils.UUID        `db:"id_visit" json:"id_visit"`
	IDSDM           utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM           *string           `db:"nm_sdm" json:"nm_sdm"`
	IDSp            utils.NullUUID    `db:"id_sp" json:"id_sp"`
	NmSp            *string           `db:"nm_sp" json:"nm_sp"`
	PtPengundang    *string           `db:"pt_pengundang" json:"pt_pengundang"`
	LamaKegiatan    *int              `db:"lama_kegiatan" json:"lama_kegiatan"`
	KegiatanPenting *string           `db:"kegiatan_penting" json:"kegiatan_penting"`
	TglLaks         *pk.SQLServerTime `db:"tgl_laks" json:"tgl_laks"`
	SkTugas         *string           `db:"sk_tugas" json:"sk_tugas"`
	TglSkTugas      *pk.SQLServerTime `db:"tgl_sk_tugas" json:"tgl_sk_tugas"`
	LastSync        pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type AnggotaOrgprof struct {
	IDAngOrgprof     utils.UUID        `db:"id_ang_orgprof" json:"id_ang_orgprof"`
	IDSDM            utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM            *string           `db:"nm_sdm" json:"nm_sdm"`
	NmOrg            string            `db:"nm_org" json:"nm_org"`
	Peran            *string           `db:"peran" json:"peran"`
	MulaiAnggota     *pk.SQLServerTime `db:"mulai_anggota" json:"mulai_anggota"`
	SelesaiAnggota   *pk.SQLServerTime `db:"selesai_anggota" json:"selesai_anggota"`
	InstansiProfesi  *string           `db:"instansi_profesi" json:"instansi_profesi"`
	LastSync         pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type Penghargaan struct {
	IDPenghargaan     utils.UUID        `db:"id_penghargaan" json:"id_penghargaan"`
	IDSDM             utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM             *string           `db:"nm_sdm" json:"nm_sdm"`
	IDJnsPenghargaan  *int              `db:"id_jns_penghargaan" json:"id_jns_penghargaan"`
	NmJnsPenghargaan  *string           `db:"nm_jns_penghargaan" json:"nm_jns_penghargaan"`
	IDTktPenghargaan  *int              `db:"id_tkt_penghargaan" json:"id_tkt_penghargaan"`
	NmTktPenghargaan  *string           `db:"nm_tkt_penghargaan" json:"nm_tkt_penghargaan"`
	NmPenghargaan     string            `db:"nm_penghargaan" json:"nm_penghargaan"`
	TglPenghargaan    *pk.SQLServerTime `db:"tgl_penghargaan" json:"tgl_penghargaan"`
	ThnPenghargaan    *int              `db:"thn_penghargaan" json:"thn_penghargaan"`
	Instansi          *string           `db:"instansi" json:"instansi"`
	LastSync          pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Repository
// ============================================================================

func (r *repository) GetDetasering(ctx context.Context, p types.DetaseringParams) ([]Detasering, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("d.id_sdm", p.IDSDM)
	cb.AppendUUID("d.id_sp_sumber", p.IDSpSumber)
	cb.AppendUUID("d.id_sp_sasaran", p.IDSpSasaran)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "d.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.detasering d
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = d.id_sdm
		LEFT JOIN pdrd.satuan_pendidikan sumber ON sumber.id_sp = d.id_sp_sumber
		LEFT JOIN pdrd.satuan_pendidikan sasaran ON sasaran.id_sp = d.id_sp_sasaran`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT d.id_detasering, d.id_sdm, sdm.nm_sdm,
			d.id_sp_sumber, sumber.nm_lemb AS nm_sp_sumber,
			d.id_sp_sasaran, sasaran.nm_lemb AS nm_sp_sasaran,
			d.tgl_mulai, d.tgl_selesai, d.bid_tgs, d.desk_keg, d.metode_laks,
			d.sk_tugas, d.tgl_sk_tugas, d.last_sync
		%s WHERE %s ORDER BY d.tgl_mulai DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Detasering
	for rows.Next() {
		var m Detasering
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetVisitingScientist(ctx context.Context, p types.VisitingScientistParams) ([]VisitingScientist, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("v.id_sdm", p.IDSDM)
	cb.AppendUUID("v.id_sp", p.IDSp)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "v.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.visiting_scientist v
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = v.id_sdm
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = v.id_sp`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT v.id_visit, v.id_sdm, sdm.nm_sdm,
			v.id_sp, sp.nm_lemb AS nm_sp,
			v.pt_pengundang, v.lama_kegiatan, v.kegiatan_penting,
			v.tgl_laks, v.sk_tugas, v.tgl_sk_tugas, v.last_sync
		%s WHERE %s ORDER BY v.tgl_laks DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []VisitingScientist
	for rows.Next() {
		var m VisitingScientist
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetAnggotaOrgprof(ctx context.Context, p AnggotaOrgprofParams) ([]AnggotaOrgprof, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_sdm", p.IDSDM)
	cb.Like("a.nm_org", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.anggota_orgprof a LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = a.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT a.id_ang_orgprof, a.id_sdm, sdm.nm_sdm,
			a.nm_org, a.peran, a.mulai_anggota, a.selesai_anggota,
			a.instansi_profesi, a.last_sync
		%s WHERE %s ORDER BY a.mulai_anggota DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []AnggotaOrgprof
	for rows.Next() {
		var m AnggotaOrgprof
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetPenghargaan(ctx context.Context, p PenghargaanParams) ([]Penghargaan, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pg.id_sdm", p.IDSDM)
	cb.AppendInt("pg.id_jns_penghargaan", p.IDJnsPenghargaan)
	cb.AppendInt("pg.id_tkt_penghargaan", p.IDTktPenghargaan)
	cb.AppendInt("pg.thn_penghargaan", p.Thn)
	cb.Like("pg.nm_penghargaan", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pg.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.penghargaan pg
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = pg.id_sdm
		LEFT JOIN ref.jenis_penghargaan jp ON jp.id_jns_penghargaan = pg.id_jns_penghargaan
		LEFT JOIN ref.tingkat_penghargaan tp ON tp.id_tkt_penghargaan = pg.id_tkt_penghargaan`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT pg.id_penghargaan, pg.id_sdm, sdm.nm_sdm,
			pg.id_jns_penghargaan, jp.nm_jns_penghargaan,
			pg.id_tkt_penghargaan, tp.nm_tkt_penghargaan,
			pg.nm_penghargaan, pg.tgl_penghargaan, pg.thn_penghargaan,
			pg.instansi, pg.last_sync
		%s WHERE %s ORDER BY pg.thn_penghargaan DESC, pg.tgl_penghargaan DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Penghargaan
	for rows.Next() {
		var m Penghargaan
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// Local params (supaya tidak polusi types package untuk module-spesifik)
// ============================================================================

type AnggotaOrgprofParams struct {
	types.PaginationParams
	IDSDM *string `query:"id_sdm"`
}

type PenghargaanParams struct {
	types.PaginationParams
	IDSDM            *string `query:"id_sdm"`
	IDJnsPenghargaan *int    `query:"id_jns_penghargaan"`
	IDTktPenghargaan *int    `query:"id_tkt_penghargaan"`
	Thn              *int    `query:"thn"`
}

// ============================================================================
// Service wrappers
// ============================================================================

func (s *service) GetDetasering(ctx context.Context, p types.DetaseringParams) ([]Detasering, int64, error) {
	k := fmt.Sprintf("detasering:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]Detasering, int64, error) { return s.repo.GetDetasering(ctx, p) })
}
func (s *service) GetVisitingScientist(ctx context.Context, p types.VisitingScientistParams) ([]VisitingScientist, int64, error) {
	k := fmt.Sprintf("visit:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]VisitingScientist, int64, error) { return s.repo.GetVisitingScientist(ctx, p) })
}
func (s *service) GetAnggotaOrgprof(ctx context.Context, p AnggotaOrgprofParams) ([]AnggotaOrgprof, int64, error) {
	k := fmt.Sprintf("orgprof:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]AnggotaOrgprof, int64, error) { return s.repo.GetAnggotaOrgprof(ctx, p) })
}
func (s *service) GetPenghargaan(ctx context.Context, p PenghargaanParams) ([]Penghargaan, int64, error) {
	k := fmt.Sprintf("penghargaan:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]Penghargaan, int64, error) { return s.repo.GetPenghargaan(ctx, p) })
}

// ============================================================================
// Handlers
// ============================================================================

func (h *Handler) GetDetasering(c *fiber.Ctx) error {
	var p types.DetaseringParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetDetasering(c.Context(), p)
	if err != nil { log.Printf("detasering: %v", err); return response.InternalError(c, "Gagal mengambil detasering") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data detasering", data, p.Page, p.Limit, total)
}
func (h *Handler) GetVisitingScientist(c *fiber.Ctx) error {
	var p types.VisitingScientistParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetVisitingScientist(c.Context(), p)
	if err != nil { log.Printf("visit: %v", err); return response.InternalError(c, "Gagal mengambil visiting scientist") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data visiting scientist", data, p.Page, p.Limit, total)
}
func (h *Handler) GetAnggotaOrgprof(c *fiber.Ctx) error {
	var p AnggotaOrgprofParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAnggotaOrgprof(c.Context(), p)
	if err != nil { log.Printf("orgprof: %v", err); return response.InternalError(c, "Gagal mengambil data keanggotaan orgprof") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil keanggotaan organisasi profesi", data, p.Page, p.Limit, total)
}
func (h *Handler) GetPenghargaan(c *fiber.Ctx) error {
	var p PenghargaanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPenghargaan(c.Context(), p)
	if err != nil { log.Printf("penghargaan: %v", err); return response.InternalError(c, "Gagal mengambil data penghargaan") }
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data penghargaan SDM", data, p.Page, p.Limit, total)
}
