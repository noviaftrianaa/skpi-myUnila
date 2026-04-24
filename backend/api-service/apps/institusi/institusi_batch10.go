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
// Batch 10 — Institusi PT-level:
//   - pdrd.profil_pt   (profil deskriptif PT per tahun: visi/misi/tujuan/sasaran)
//   - pdrd.akred_sp    (akreditasi SP / institusi — BAN-PT PT/fakultas level)
// ============================================================================

type ProfilPt struct {
	IDSp              utils.UUID       `db:"id_sp" json:"id_sp"`
	NmSp              *string          `db:"nm_sp" json:"nm_sp"`
	IDThnAjaran       int              `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran       *string          `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	DeskSingkat       *string          `db:"desk_singkat" json:"desk_singkat"`
	Visi              *string          `db:"visi" json:"visi"`
	Misi              *string          `db:"misi" json:"misi"`
	Tujuan            *string          `db:"tujuan" json:"tujuan"`
	Sasaran           *string          `db:"sasaran" json:"sasaran"`
	SeleksiTerima     *string          `db:"seleksi_terima" json:"seleksi_terima"`
	PolaPimpin        *string          `db:"pola_pimpin" json:"pola_pimpin"`
	SistemKelola      *string          `db:"sistem_kelola" json:"sistem_kelola"`
	SistemJaminMutu   *string          `db:"sistem_jamin_mutu" json:"sistem_jamin_mutu"`
	EvalLulusan       *string          `db:"eval_lulusan" json:"eval_lulusan"`
	LastSync          pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type AkredSp struct {
	IDAkredSp     utils.UUID        `db:"id_akred_sp" json:"id_akred_sp"`
	IDLembAkred   string            `db:"id_lemb_akred" json:"id_lemb_akred"`
	NmLembAkred   *string           `db:"nm_lemb_akred" json:"nm_lemb_akred"`
	IDSp          utils.UUID        `db:"id_sp" json:"id_sp"`
	NmSp          *string           `db:"nm_sp" json:"nm_sp"`
	IDAkred       int               `db:"id_akred" json:"id_akred"`
	NmAkred       *string           `db:"nm_akred" json:"nm_akred"`
	SkAkredSp     string            `db:"sk_akred_sp" json:"sk_akred_sp"`
	TglSkAkredSp  *pk.SQLServerTime `db:"tgl_sk_akred_sp" json:"tgl_sk_akred_sp"`
	TstSkAkredSp  *pk.SQLServerTime `db:"tst_sk_akred_sp" json:"tst_sk_akred_sp"`
	AsalData      string            `db:"asal_data" json:"asal_data"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type ProfilPtParams struct {
	IDSp        *string `query:"id_sp"`
	IDThnAjaran *int    `query:"id_thn_ajaran"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

type AkredSpParams struct {
	IDAkredSp   *string `query:"id_akred_sp"`
	IDSp        *string `query:"id_sp"`
	IDLembAkred *string `query:"id_lemb_akred"`
	IDAkred     *int    `query:"id_akred"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

func nB10(page, limit *int, order *string) {
	if *page < 1 {
		*page = 1
	}
	if *limit < 1 {
		*limit = 10
	}
	if *limit > 100 {
		*limit = 100
	}
	if *order == "" {
		*order = "ASC"
	}
}

func (r *repository) GetProfilPt(ctx context.Context, p ProfilPtParams) ([]ProfilPt, int64, error) {
	nB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("pp.id_sp", p.IDSp)
	cb.AppendInt("pp.id_thn_ajaran", p.IDThnAjaran)

	conds, args := cb.Build()
	conds = append(conds, "pp.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.profil_pt pp
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = pp.id_sp
		LEFT JOIN ref.tahun_ajaran ta ON ta.id_thn_ajaran = pp.id_thn_ajaran`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "pp.id_thn_ajaran DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT pp.id_sp, sp.nm_lemb AS nm_sp,
			pp.id_thn_ajaran, ta.nm_thn_ajaran,
			CAST(pp.desk_singkat AS VARCHAR(MAX)) AS desk_singkat,
			CAST(pp.visi AS VARCHAR(MAX)) AS visi,
			CAST(pp.misi AS VARCHAR(MAX)) AS misi,
			CAST(pp.tujuan AS VARCHAR(MAX)) AS tujuan,
			CAST(pp.sasaran AS VARCHAR(MAX)) AS sasaran,
			CAST(pp.seleksi_terima AS VARCHAR(MAX)) AS seleksi_terima,
			CAST(pp.pola_pimpin AS VARCHAR(MAX)) AS pola_pimpin,
			CAST(pp.sistem_kelola AS VARCHAR(MAX)) AS sistem_kelola,
			CAST(pp.sistem_jamin_mutu AS VARCHAR(MAX)) AS sistem_jamin_mutu,
			CAST(pp.eval_lulusan AS VARCHAR(MAX)) AS eval_lulusan,
			pp.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []ProfilPt
	for rows.Next() {
		var m ProfilPt
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetAkredSp(ctx context.Context, p AkredSpParams) ([]AkredSp, int64, error) {
	nB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_akred_sp", p.IDAkredSp)
	cb.AppendUUID("a.id_sp", p.IDSp)
	cb.AppendString("a.id_lemb_akred", p.IDLembAkred)
	cb.AppendInt("a.id_akred", p.IDAkred)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.akred_sp a
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = a.id_sp
		LEFT JOIN ref.lembaga_akred la ON la.id_lemb_akred = a.id_lemb_akred
		LEFT JOIN ref.nilai_akred na ON na.id_akred = a.id_akred`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "a.tgl_sk_akred_sp DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT a.id_akred_sp,
			a.id_lemb_akred, la.nm_lemb AS nm_lemb_akred,
			a.id_sp, sp.nm_lemb AS nm_sp,
			a.id_akred, na.nm_akred,
			a.sk_akred_sp, a.tgl_sk_akred_sp, a.tst_sk_akred_sp,
			a.asal_data, a.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []AkredSp
	for rows.Next() {
		var m AkredSp
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------- Service ----------

func (s *service) GetProfilPt(ctx context.Context, p ProfilPtParams) ([]ProfilPt, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("profil_pt:%s", utils.HashParams(p)),
		func() ([]ProfilPt, int64, error) { return s.repo.GetProfilPt(ctx, p) })
}
func (s *service) GetAkredSp(ctx context.Context, p AkredSpParams) ([]AkredSp, int64, error) {
	return cachedFetch(ctx, fmt.Sprintf("akred_sp:%s", utils.HashParams(p)),
		func() ([]AkredSp, int64, error) { return s.repo.GetAkredSp(ctx, p) })
}

// ---------- Handlers ----------

func (h *Handler) GetProfilPt(c *fiber.Ctx) error {
	var p ProfilPtParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetProfilPt(c.Context(), p)
	if err != nil {
		log.Printf("profil_pt: %v", err)
		return response.InternalError(c, "Gagal mengambil data profil PT")
	}
	nB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data profil PT", data, p.Page, p.Limit, total)
}

func (h *Handler) GetAkredSp(c *fiber.Ctx) error {
	var p AkredSpParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAkredSp(c.Context(), p)
	if err != nil {
		log.Printf("akred_sp: %v", err)
		return response.InternalError(c, "Gagal mengambil data akreditasi SP")
	}
	nB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data akreditasi SP", data, p.Page, p.Limit, total)
}
