package sdm

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 9b — pdrd.bimbing_dosen
// Kegiatan bimbingan yang dilakukan dosen (pelatihan/mentoring/konsultasi).
// Field SK tugas + bidang ahli pembimbing/bimbingan. jns_bimbing: R=Reguler, C=Cross.
// Note: tabel ini tidak punya FK ke id_sdm — filter lewat id_katgiat, jns, tanggal.
// ============================================================================

type BimbingDosen struct {
	IDBimbDosen       utils.UUID        `db:"id_bimb_dosen" json:"id_bimb_dosen"`
	IDKatgiat         int               `db:"id_katgiat" json:"id_katgiat"`
	TglMulai          *pk.SQLServerTime `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai        *pk.SQLServerTime `db:"tgl_selesai" json:"tgl_selesai"`
	BidAhliPembimbing *string           `db:"bid_ahli_pembimbing" json:"bid_ahli_pembimbing"`
	BidAhliBimbingan  *string           `db:"bid_ahli_bimbingan" json:"bid_ahli_bimbingan"`
	DeskKegiatan      *string           `db:"desk_kegiatan" json:"desk_kegiatan"`
	JnsBimbing        string            `db:"jns_bimbing" json:"jns_bimbing"` // R=Reguler, C=Cross
	SkTugas           *string           `db:"sk_tugas" json:"sk_tugas"`
	TglSkTugas        *pk.SQLServerTime `db:"tgl_sk_tugas" json:"tgl_sk_tugas"`
	LastSync          pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type BimbingDosenParams struct {
	IDBimbDosen *string `query:"id_bimb_dosen"`
	IDKatgiat   *int    `query:"id_katgiat"`
	JnsBimbing  *string `query:"jns_bimbing"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	Search      string  `query:"search"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

func (p *BimbingDosenParams) Normalize() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	if p.Order == "" {
		p.Order = "ASC"
	}
}
func (p *BimbingDosenParams) Offset() int { return (p.Page - 1) * p.Limit }

func (r *repository) GetBimbingDosen(ctx context.Context, p BimbingDosenParams) ([]BimbingDosen, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("b.id_bimb_dosen", p.IDBimbDosen)
	cb.AppendInt("b.id_katgiat", p.IDKatgiat)
	cb.AppendString("b.jns_bimbing", p.JnsBimbing)
	cb.Like("b.desk_kegiatan", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "b.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.bimbing_dosen b WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "b.tgl_mulai DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT b.id_bimb_dosen, b.id_katgiat,
			b.tgl_mulai, b.tgl_selesai,
			b.bid_ahli_pembimbing, b.bid_ahli_bimbingan, b.desk_kegiatan,
			b.jns_bimbing, b.sk_tugas, b.tgl_sk_tugas, b.last_sync
		FROM pdrd.bimbing_dosen b
		WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []BimbingDosen
	for rows.Next() {
		var m BimbingDosen
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (s *service) GetBimbingDosen(ctx context.Context, p BimbingDosenParams) ([]BimbingDosen, int64, error) {
	return cached(ctx, fmt.Sprintf("bimbing_dosen:%s", utils.HashParams(p)), cacheTTL,
		func() ([]BimbingDosen, int64, error) { return s.repo.GetBimbingDosen(ctx, p) })
}

func (h *Handler) GetBimbingDosen(c *fiber.Ctx) error {
	var p BimbingDosenParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetBimbingDosen(c.Context(), p)
	if err != nil {
		log.Printf("bimbing_dosen: %v", err)
		return response.InternalError(c, "Gagal mengambil data bimbing dosen")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bimbing dosen", data, p.Page, p.Limit, total)
}
