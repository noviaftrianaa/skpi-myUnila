package kontribusi

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
// Batch 9b — pivot kontribusi:
//   - pdrd.tulis_buku_ajar   (penulis buku ajar: dosen/mhs/non-civitas)
//   - pdrd.anggota_panitia   (dosen anggota kepanitiaan)
// Parent table-nya (buku_ajar, kepanitiaan) sudah ada di modul ini (Batch 7),
// jadi pivotnya natural masuk ke sini.
// ============================================================================

type TulisBukuAjar struct {
	IDTulisBukuAjar utils.UUID       `db:"id_tulis_buku_ajar" json:"id_tulis_buku_ajar"`
	IDBukuAjar      utils.UUID       `db:"id_buku_ajar" json:"id_buku_ajar"`
	JudulBuku       *string          `db:"judul_buku" json:"judul_buku"`
	IDKatgiat       int              `db:"id_katgiat" json:"id_katgiat"`
	IDSDM           utils.NullUUID   `db:"id_sdm" json:"id_sdm"`
	NmSDM           *string          `db:"nm_sdm" json:"nm_sdm"`
	IDPd            utils.NullUUID   `db:"id_pd" json:"id_pd"`
	NmPd            *string          `db:"nm_pd" json:"nm_pd"`
	Nipd            *string          `db:"nipd" json:"nipd"`
	IDOrang         utils.NullUUID   `db:"id_orang" json:"id_orang"`
	NmOrang         *string          `db:"nm_orang" json:"nm_orang"`
	Urutan          *int             `db:"urutan" json:"urutan"`
	Afiliasi        *string          `db:"afiliasi" json:"afiliasi"`
	PeranTulis      string           `db:"peran_tulis" json:"peran_tulis"`   // A/B/C/D
	JnsPenulis      string           `db:"jns_penulis" json:"jns_penulis"`   // 1=Dosen, 2=Mahasiswa, 3=Non-civitas
	LastSync        pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type AnggotaPanitia struct {
	IDAngPanitia utils.UUID       `db:"id_ang_panitia" json:"id_ang_panitia"`
	IDPanitia    utils.UUID       `db:"id_panitia" json:"id_panitia"`
	NmKegiatan   *string          `db:"nm_kegiatan" json:"nm_kegiatan"`
	IDSDM        utils.UUID       `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string          `db:"nm_sdm" json:"nm_sdm"`
	Nidn         *string          `db:"nidn" json:"nidn"`
	IDKatgiat    int              `db:"id_katgiat" json:"id_katgiat"`
	Peran        string           `db:"peran" json:"peran"`
	LastSync     pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type TulisBukuAjarParams struct {
	IDTulisBukuAjar *string `query:"id_tulis_buku_ajar"`
	IDBukuAjar      *string `query:"id_buku_ajar"`
	IDSDM           *string `query:"id_sdm"`
	IDPd            *string `query:"id_pd"`
	PeranTulis      *string `query:"peran_tulis"`
	JnsPenulis      *string `query:"jns_penulis"`
	Page            int     `query:"page"`
	Limit           int     `query:"limit"`
	Search          string  `query:"search"`
	SortBy          string  `query:"sort_by"`
	Order           string  `query:"order"`
}

type AnggotaPanitiaParams struct {
	IDAngPanitia *string `query:"id_ang_panitia"`
	IDPanitia    *string `query:"id_panitia"`
	IDSDM        *string `query:"id_sdm"`
	IDKatgiat    *int    `query:"id_katgiat"`
	Peran        *string `query:"peran"`
	Page         int     `query:"page"`
	Limit        int     `query:"limit"`
	Search       string  `query:"search"`
	SortBy       string  `query:"sort_by"`
	Order        string  `query:"order"`
}

func (p *TulisBukuAjarParams) Normalize() { normalize9b(&p.Page, &p.Limit, &p.Order) }
func (p *TulisBukuAjarParams) Offset() int { return (p.Page - 1) * p.Limit }

func (p *AnggotaPanitiaParams) Normalize() { normalize9b(&p.Page, &p.Limit, &p.Order) }
func (p *AnggotaPanitiaParams) Offset() int { return (p.Page - 1) * p.Limit }

func normalize9b(page, limit *int, order *string) {
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

func (r *repository) GetTulisBukuAjar(ctx context.Context, p TulisBukuAjarParams) ([]TulisBukuAjar, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("t.id_tulis_buku_ajar", p.IDTulisBukuAjar)
	cb.AppendUUID("t.id_buku_ajar", p.IDBukuAjar)
	cb.AppendUUID("t.id_sdm", p.IDSDM)
	cb.AppendUUID("t.id_pd", p.IDPd)
	cb.AppendString("t.peran_tulis", p.PeranTulis)
	cb.AppendString("t.jns_penulis", p.JnsPenulis)
	cb.Like("b.nm_buku", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "t.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.tulis_buku_ajar t
		LEFT JOIN pdrd.buku_ajar b ON b.id_buku_ajar = t.id_buku_ajar
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = t.id_sdm
		LEFT JOIN pdrd.non_ca nc ON nc.id_orang = t.id_orang`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "b.nm_buku, t.urutan", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT t.id_tulis_buku_ajar,
			t.id_buku_ajar, b.nm_buku AS judul_buku,
			t.id_katgiat,
			t.id_sdm, sd.nm_sdm,
			t.id_pd, t.nm_pd, t.nipd,
			t.id_orang, nc.nm_orang,
			t.urutan, t.afiliasi, t.peran_tulis, t.jns_penulis, t.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []TulisBukuAjar
	for rows.Next() {
		var m TulisBukuAjar
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetAnggotaPanitia(ctx context.Context, p AnggotaPanitiaParams) ([]AnggotaPanitia, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_ang_panitia", p.IDAngPanitia)
	cb.AppendUUID("a.id_panitia", p.IDPanitia)
	cb.AppendUUID("a.id_sdm", p.IDSDM)
	cb.AppendInt("a.id_katgiat", p.IDKatgiat)
	cb.AppendString("a.peran", p.Peran)
	cb.Like("kep.nm_kegiatan", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.anggota_panitia a
		LEFT JOIN pdrd.kepanitiaan kep ON kep.id_panitia = a.id_panitia
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = a.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "kep.nm_kegiatan, sd.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT a.id_ang_panitia,
			a.id_panitia, kep.nm_kegiatan,
			a.id_sdm, sd.nm_sdm, sd.nidn,
			a.id_katgiat, a.peran, a.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []AnggotaPanitia
	for rows.Next() {
		var m AnggotaPanitia
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------- Service methods ----------

func (s *service) GetTulisBukuAjar(ctx context.Context, p TulisBukuAjarParams) ([]TulisBukuAjar, int64, error) {
	return cached(ctx, fmt.Sprintf("tulis_buku:%s", utils.HashParams(p)),
		func() ([]TulisBukuAjar, int64, error) { return s.repo.GetTulisBukuAjar(ctx, p) })
}
func (s *service) GetAnggotaPanitia(ctx context.Context, p AnggotaPanitiaParams) ([]AnggotaPanitia, int64, error) {
	return cached(ctx, fmt.Sprintf("ang_panitia:%s", utils.HashParams(p)),
		func() ([]AnggotaPanitia, int64, error) { return s.repo.GetAnggotaPanitia(ctx, p) })
}

// ---------- Handlers ----------

func (h *Handler) GetTulisBukuAjar(c *fiber.Ctx) error {
	var p TulisBukuAjarParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetTulisBukuAjar(c.Context(), p)
	if err != nil {
		log.Printf("tulis_buku_ajar: %v", err)
		return response.InternalError(c, "Gagal mengambil data penulis buku ajar")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data penulis buku ajar", data, p.Page, p.Limit, total)
}

func (h *Handler) GetAnggotaPanitia(c *fiber.Ctx) error {
	var p AnggotaPanitiaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAnggotaPanitia(c.Context(), p)
	if err != nil {
		log.Printf("anggota_panitia: %v", err)
		return response.InternalError(c, "Gagal mengambil data anggota panitia")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data anggota panitia", data, p.Page, p.Limit, total)
}
