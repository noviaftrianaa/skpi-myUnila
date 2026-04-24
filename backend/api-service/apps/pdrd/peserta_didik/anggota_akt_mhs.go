package pesertadidik

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
// Batch 9b — pdrd.anggota_akt_mhs: siapa saja mahasiswa yang ikut akt_mhs.
// Pivot antara pdrd.akt_mhs ↔ pdrd.reg_pd (+ biodata denormalized nm_pd, nipd).
// Filter umum: id_akt_mhs (list anggota per kegiatan) atau id_reg_pd (riwayat
// kegiatan per mahasiswa).
// ============================================================================

type AnggotaAktMhs struct {
	IDAngAktMhs utils.UUID       `db:"id_ang_akt_mhs" json:"id_ang_akt_mhs"`
	IDAktMhs    utils.UUID       `db:"id_akt_mhs" json:"id_akt_mhs"`
	JudulAktMhs *string          `db:"judul_akt_mhs" json:"judul_akt_mhs"`
	IDRegPd     utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	IDPd        utils.NullUUID   `db:"id_pd" json:"id_pd"`
	NmPd        string           `db:"nm_pd" json:"nm_pd"`
	Nipd        string           `db:"nipd" json:"nipd"`
	JnsPeranMhs string           `db:"jns_peran_mhs" json:"jns_peran_mhs"` // 1=Ketua, 2=Anggota, 3=Individu
	LastSync    pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type AnggotaAktMhsParams struct {
	IDAngAktMhs *string `query:"id_ang_akt_mhs"`
	IDAktMhs    *string `query:"id_akt_mhs"`
	IDRegPd     *string `query:"id_reg_pd"`
	JnsPeranMhs *string `query:"jns_peran_mhs"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	Search      string  `query:"search"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

func (p *AnggotaAktMhsParams) Normalize() {
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
func (p *AnggotaAktMhsParams) Offset() int { return (p.Page - 1) * p.Limit }

func (r *repository) GetAnggotaAktMhs(ctx context.Context, p AnggotaAktMhsParams) ([]AnggotaAktMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_ang_akt_mhs", p.IDAngAktMhs)
	cb.AppendUUID("a.id_akt_mhs", p.IDAktMhs)
	cb.AppendUUID("a.id_reg_pd", p.IDRegPd)
	cb.AppendString("a.jns_peran_mhs", p.JnsPeranMhs)
	cb.Like("a.nm_pd", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.anggota_akt_mhs a
		LEFT JOIN pdrd.akt_mhs am ON am.id_akt_mhs = a.id_akt_mhs
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = a.id_reg_pd`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "a.nipd", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT a.id_ang_akt_mhs,
			a.id_akt_mhs, am.judul_akt_mhs,
			a.id_reg_pd, rp.id_pd,
			a.nm_pd, a.nipd, a.jns_peran_mhs, a.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []AnggotaAktMhs
	for rows.Next() {
		var m AnggotaAktMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (s *service) GetAnggotaAktMhs(ctx context.Context, p AnggotaAktMhsParams) ([]AnggotaAktMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("anggota_akt_mhs:%s", utils.HashParams(p)),
		func() ([]AnggotaAktMhs, int64, error) { return s.repo.GetAnggotaAktMhs(ctx, p) })
}

func (h *Handler) GetAnggotaAktMhs(c *fiber.Ctx) error {
	var p AnggotaAktMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAnggotaAktMhs(c.Context(), p)
	if err != nil {
		log.Printf("anggota_akt_mhs: %v", err)
		return response.InternalError(c, "Gagal mengambil data anggota aktivitas mahasiswa")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data anggota aktivitas mahasiswa", data, p.Page, p.Limit, total)
}
