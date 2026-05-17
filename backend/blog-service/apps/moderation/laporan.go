// Package moderation — laporan_post (report inappropriate content).
// Reader flag post → admin review (Administrator/Developer role).
package moderation

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// LAPORAN POST — Reader flag konten tidak pantas.
// Status: pending → reviewed → actioned / dismissed (CHECK constraint di DB).
// =============================================================================

// AlasanWhitelist — kategori alasan yang valid. UI dropdown.
var AlasanWhitelist = []string{
	"spam",
	"pornografi",
	"kekerasan",
	"ujaran_kebencian",
	"hoax",
	"plagiat",
	"hak_cipta",
	"lainnya",
}

func isValidAlasan(a string) bool {
	for _, v := range AlasanWhitelist {
		if v == a {
			return true
		}
	}
	return false
}

// Laporan — single row dari moderation.laporan_post.
type Laporan struct {
	IDLaporanPost   uuid.UUID  `db:"id_laporan_post"   json:"id_laporan_post"`
	IDPost          uuid.UUID  `db:"id_post"           json:"id_post"`
	IDPelaporPdut   *uuid.UUID `db:"id_pelapor_pdut"   json:"id_pelapor_pdut,omitempty"`
	Alasan          string     `db:"alasan"            json:"alasan"`
	Detail          *string    `db:"detail"            json:"detail,omitempty"`
	Status          string     `db:"status"            json:"status"`
	Tindakan        *string    `db:"tindakan"          json:"tindakan,omitempty"`
	IDModeratorPdut *uuid.UUID `db:"id_moderator_pdut" json:"id_moderator_pdut,omitempty"`
	TglDiputuskan   *time.Time `db:"tgl_diputuskan"    json:"tgl_diputuskan,omitempty"`
	CreatedAt       time.Time  `db:"created_at"        json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"        json:"updated_at"`
}

// LaporanWithPost — extended entry untuk admin list (join post + blog info).
type LaporanWithPost struct {
	Laporan
	PostJudul     string  `db:"post_judul"     json:"post_judul"`
	PostSlug      string  `db:"post_slug"      json:"post_slug"`
	BlogSubdomain string  `db:"blog_subdomain" json:"blog_subdomain"`
	BlogNama      string  `db:"blog_nama"      json:"blog_nama"`
	PostStatus    string  `db:"post_status"    json:"post_status"`
	PostRingkasan *string `db:"post_ringkasan" json:"post_ringkasan,omitempty"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// CreateInput — payload dari endpoint POST /posts/:id/report.
type CreateInput struct {
	IDPost  uuid.UUID
	IDPelapor uuid.UUID
	Alasan  string
	Detail  *string
}

// Create — INSERT laporan. Dedup: kalau user sudah laporkan post yg sama dalam 24h, return existing.
// Mencegah spam laporan dari user yg sama.
func (r *Repository) Create(ctx context.Context, in CreateInput) (*Laporan, bool, error) {
	if !isValidAlasan(in.Alasan) {
		return nil, false, fmt.Errorf("alasan tidak valid (allowed: %s)", strings.Join(AlasanWhitelist, ", "))
	}
	if in.Detail != nil && len(*in.Detail) > 1000 {
		return nil, false, errors.New("detail max 1000 char")
	}

	// Cek post exists + published (gak masuk akal report draft / trash)
	var postExists bool
	err := r.db.GetContext(ctx, &postExists,
		`SELECT EXISTS(SELECT 1 FROM blog.post WHERE id_post=$1 AND soft_delete IS NULL)`,
		in.IDPost)
	if err != nil {
		return nil, false, fmt.Errorf("post check: %w", err)
	}
	if !postExists {
		return nil, false, errors.New("post not found")
	}

	// Dedup window 24h: kalau ada laporan dari user yg sama untuk post yg sama dalam 24h, return existing.
	var existing Laporan
	err = r.db.GetContext(ctx, &existing, `
		SELECT id_laporan_post, id_post, id_pelapor_pdut, alasan, detail,
		       status, tindakan, id_moderator_pdut, tgl_diputuskan,
		       created_at, updated_at
		FROM moderation.laporan_post
		WHERE id_post = $1 AND id_pelapor_pdut = $2
		  AND soft_delete IS NULL
		  AND created_at > NOW() - INTERVAL '24 hours'
		ORDER BY created_at DESC
		LIMIT 1`, in.IDPost, in.IDPelapor)
	if err == nil {
		return &existing, true, nil // already reported in last 24h
	}

	// INSERT baru
	q := `INSERT INTO moderation.laporan_post
	        (id_post, id_pelapor_pdut, alasan, detail, status, id_creator)
	      VALUES ($1, $2, $3, NULLIF($4, ''), 'pending', $2)
	      RETURNING id_laporan_post, id_post, id_pelapor_pdut, alasan, detail,
	                status, tindakan, id_moderator_pdut, tgl_diputuskan,
	                created_at, updated_at`
	detail := ""
	if in.Detail != nil {
		detail = *in.Detail
	}
	var l Laporan
	if err := r.db.GetContext(ctx, &l, q, in.IDPost, in.IDPelapor, in.Alasan, detail); err != nil {
		return nil, false, fmt.Errorf("insert laporan: %w", err)
	}
	return &l, false, nil
}

// ListForAdmin — pending/reviewed laporan untuk moderasi.
// Filter status optional (default semua). Sort by created_at DESC.
func (r *Repository) ListForAdmin(ctx context.Context, status string, limit, offset int) ([]LaporanWithPost, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	where := "l.soft_delete IS NULL"
	args := []any{}
	idx := 1
	if status != "" {
		where += fmt.Sprintf(" AND l.status = $%d", idx)
		args = append(args, status)
		idx++
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM moderation.laporan_post l WHERE "+where, args...); err != nil {
		return nil, 0, fmt.Errorf("count laporan: %w", err)
	}

	q := fmt.Sprintf(`
		SELECT
		    l.id_laporan_post, l.id_post, l.id_pelapor_pdut, l.alasan, l.detail,
		    l.status, l.tindakan, l.id_moderator_pdut, l.tgl_diputuskan,
		    l.created_at, l.updated_at,
		    p.judul AS post_judul, p.slug AS post_slug, p.status AS post_status,
		    p.ringkasan AS post_ringkasan,
		    b.subdomain AS blog_subdomain, b.nm_blog AS blog_nama
		FROM moderation.laporan_post l
		JOIN blog.post p ON l.id_post = p.id_post
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE %s
		ORDER BY l.created_at DESC
		LIMIT $%d OFFSET $%d`, where, idx, idx+1)
	args = append(args, limit, offset)

	rows := make([]LaporanWithPost, 0)
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, 0, fmt.Errorf("list laporan: %w", err)
	}
	return rows, total, nil
}

// CountByStatus — counts grouped by status (untuk admin dashboard badges).
func (r *Repository) CountByStatus(ctx context.Context) (map[string]int, error) {
	rows, err := r.db.QueryxContext(ctx, `
		SELECT status, COUNT(*) AS jumlah
		FROM moderation.laporan_post
		WHERE soft_delete IS NULL
		GROUP BY status`)
	if err != nil {
		return nil, fmt.Errorf("count by status: %w", err)
	}
	defer rows.Close()
	out := map[string]int{
		"pending": 0, "reviewed": 0, "actioned": 0, "dismissed": 0,
	}
	for rows.Next() {
		var s string
		var n int
		if err := rows.Scan(&s, &n); err == nil {
			out[s] = n
		}
	}
	return out, nil
}

// Moderate — set status (reviewed/actioned/dismissed) + tindakan (optional).
// Set id_moderator_pdut + tgl_diputuskan untuk audit.
func (r *Repository) Moderate(ctx context.Context, idLaporan, idModerator uuid.UUID, newStatus string, tindakan *string) error {
	valid := map[string]bool{"reviewed": true, "actioned": true, "dismissed": true}
	if !valid[newStatus] {
		return errors.New("invalid status (reviewed/actioned/dismissed)")
	}
	if tindakan != nil && len(*tindakan) > 60 {
		s := (*tindakan)[:60]
		tindakan = &s
	}
	q := `UPDATE moderation.laporan_post
	      SET status = $1, tindakan = NULLIF($2, ''),
	          id_moderator_pdut = $3, tgl_diputuskan = NOW(),
	          id_updater = $3, updated_at = NOW()
	      WHERE id_laporan_post = $4 AND soft_delete IS NULL`
	t := ""
	if tindakan != nil {
		t = *tindakan
	}
	res, err := r.db.ExecContext(ctx, q, newStatus, t, idModerator, idLaporan)
	if err != nil {
		return fmt.Errorf("moderate laporan: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("laporan not found")
	}
	return nil
}

// =============================================================================
// HANDLER
// =============================================================================

type Handler struct{ repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

// POST /api/v1/posts/:id/report — auth required, body { alasan, detail? }.
// Return 200 dengan `already_reported: true` kalau user sudah report dalam 24h.
func (h *Handler) Report(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required to report")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	var body struct {
		Alasan string  `json:"alasan"`
		Detail *string `json:"detail,omitempty"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	l, alreadyReported, err := h.repo.Create(c.Context(), CreateInput{
		IDPost: idPost, IDPelapor: idUser, Alasan: body.Alasan, Detail: body.Detail,
	})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{
		"success":          true,
		"data":             l,
		"already_reported": alreadyReported,
	})
}

// GET /api/v1/admin/laporan?status=pending&limit=20&offset=0
func (h *Handler) ListAdmin(c *fiber.Ctx) error {
	status := c.Query("status", "")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.ListForAdmin(c.Context(), status, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	counts, _ := h.repo.CountByStatus(c.Context())
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":         rows,
			"total":         total,
			"limit":         limit,
			"offset":        offset,
			"count_status":  counts,
		},
	})
}

// PATCH /api/v1/admin/laporan/:id — body { status, tindakan? }.
func (h *Handler) ModerateAdmin(c *fiber.Ctx) error {
	idLaporan, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_laporan")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user context")
	}
	idMod, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	var body struct {
		Status   string  `json:"status"`
		Tindakan *string `json:"tindakan,omitempty"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if err := h.repo.Moderate(c.Context(), idLaporan, idMod, body.Status, body.Tindakan); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/laporan/alasan — list allowed alasan values untuk frontend dropdown.
// Public (no auth) — supaya bisa dipanggil dari frontend-blog reader.
func (h *Handler) ListAlasan(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"success": true, "data": AlasanWhitelist})
}

// =============================================================================
// ROUTER
// =============================================================================

// RegisterPublicRoutes — public (auth-optional) endpoints.
// POST /report butuh auth (handler validates user_id).
func RegisterPublicRoutes(api fiber.Router, h *Handler) {
	api.Get("/laporan/alasan", h.ListAlasan)
	api.Post("/posts/:id/report", h.Report)
}

// RegisterAdminRoutes — admin-only.
func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/laporan")
	g.Get("/", h.ListAdmin)
	g.Patch("/:id", h.ModerateAdmin)
}
