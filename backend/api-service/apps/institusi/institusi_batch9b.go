package institusi

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
// Batch 9b — pdrd.lembaga_iptek (lembaga riset / pusat studi).
// Data profil lembaga iptek yang jadi parent litabmas/publikasi.
// ============================================================================

type LembagaIptek struct {
	IDLembIptek  utils.UUID       `db:"id_lemb_iptek" json:"id_lemb_iptek"`
	NmLemb       string           `db:"nm_lemb" json:"nm_lemb"`
	NmSingkat    *string          `db:"nm_singkat" json:"nm_singkat"`
	Nrli         *string          `db:"nrli" json:"nrli"` // Nomor Registrasi Lembaga Iptek
	HubLembIptek string           `db:"hub_lemb_iptek" json:"hub_lemb_iptek"`
	NoTel        *string          `db:"no_tel" json:"no_tel"`
	NoFax        *string          `db:"no_fax" json:"no_fax"`
	Email        *string          `db:"email" json:"email"`
	Website      *string          `db:"website" json:"website"`
	Jln          *string          `db:"jln" json:"jln"`
	DsKel        *string          `db:"ds_kel" json:"ds_kel"`
	KodePos      *string          `db:"kode_pos" json:"kode_pos"`
	LastSync     pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type LembagaIptekParams struct {
	IDLembIptek  *string `query:"id_lemb_iptek"`
	HubLembIptek *string `query:"hub_lemb_iptek"` // 1=dalam PT, 2=luar PT, 3=kemitraan, 9=lain
	Page         int     `query:"page"`
	Limit        int     `query:"limit"`
	Search       string  `query:"search"` // cari nm_lemb
	SortBy       string  `query:"sort_by"`
	Order        string  `query:"order"`
}

func (p *LembagaIptekParams) Normalize() {
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
func (p *LembagaIptekParams) Offset() int { return (p.Page - 1) * p.Limit }

func (r *repository) GetLembagaIptek(ctx context.Context, p LembagaIptekParams) ([]LembagaIptek, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("l.id_lemb_iptek", p.IDLembIptek)
	cb.AppendString("l.hub_lemb_iptek", p.HubLembIptek)
	cb.Like("l.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "l.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.lembaga_iptek l WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "l.nm_lemb", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT l.id_lemb_iptek, l.nm_lemb, l.nm_singkat, l.nrli, l.hub_lemb_iptek,
			l.no_tel, l.no_fax, l.email, l.website,
			l.jln, l.ds_kel, l.kode_pos, l.last_sync
		FROM pdrd.lembaga_iptek l
		WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []LembagaIptek
	for rows.Next() {
		var m LembagaIptek
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (s *service) GetLembagaIptek(ctx context.Context, p LembagaIptekParams) ([]LembagaIptek, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("lemb_iptek:%s", utils.HashParams(p)),
		func() ([]LembagaIptek, int64, error) { return s.repo.GetLembagaIptek(ctx, p) })
}

func (h *Handler) GetLembagaIptek(c *fiber.Ctx) error {
	var p LembagaIptekParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetLembagaIptek(c.Context(), p)
	if err != nil {
		log.Printf("lembaga_iptek: %v", err)
		return response.InternalError(c, "Gagal mengambil data lembaga iptek")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data lembaga iptek", data, p.Page, p.Limit, total)
}
