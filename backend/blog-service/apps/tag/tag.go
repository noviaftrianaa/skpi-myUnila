package tag

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var ErrNotFound = errors.New("tag not found")

type Tag struct {
	IDTag     uuid.UUID `db:"id_tag"      json:"id_tag"`
	Slug      string    `db:"slug"        json:"slug"`
	NmTag     string    `db:"nm_tag"      json:"nm_tag"`
	Deskripsi *string   `db:"deskripsi"   json:"deskripsi,omitempty"`
	Frekuensi int       `db:"frekuensi"   json:"frekuensi"`
	AAktif    bool      `db:"a_aktif"     json:"a_aktif"`
	CreatedAt time.Time `db:"created_at"  json:"created_at"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// List — semua tag (kalau aktifOnly=true, hanya yang dipublish).
// Default sort: by frekuensi DESC (untuk autocomplete & tag cloud).
func (r *Repository) List(ctx context.Context, aktifOnly bool, limit int) ([]Tag, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	q := `SELECT id_tag, slug, nm_tag, deskripsi, frekuensi, a_aktif, created_at
	      FROM ref.tag
	      WHERE soft_delete IS NULL`
	if aktifOnly {
		q += ` AND a_aktif = TRUE`
	}
	q += ` ORDER BY frekuensi DESC, nm_tag ASC LIMIT $1`
	var items []Tag
	if err := r.db.SelectContext(ctx, &items, q, limit); err != nil {
		return nil, fmt.Errorf("list tag: %w", err)
	}
	return items, nil
}

// GetBySlug — single tag detail (untuk tag landing page).
func (r *Repository) GetBySlug(ctx context.Context, slug string) (*Tag, error) {
	var t Tag
	err := r.db.GetContext(ctx, &t, `
		SELECT id_tag, slug, nm_tag, deskripsi, frekuensi, a_aktif, created_at
		FROM ref.tag
		WHERE slug = $1 AND soft_delete IS NULL AND a_aktif = TRUE`, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get tag by slug: %w", err)
	}
	return &t, nil
}

// Search — autocomplete by prefix (case-insensitive).
func (r *Repository) Search(ctx context.Context, prefix string, limit int) ([]Tag, error) {
	if limit <= 0 || limit > 20 {
		limit = 10
	}
	q := `SELECT id_tag, slug, nm_tag, deskripsi, frekuensi, a_aktif, created_at
	      FROM ref.tag
	      WHERE soft_delete IS NULL AND a_aktif = TRUE
	        AND (nm_tag ILIKE $1 OR slug ILIKE $1)
	      ORDER BY frekuensi DESC, nm_tag ASC
	      LIMIT $2`
	var items []Tag
	if err := r.db.SelectContext(ctx, &items, q, prefix+"%", limit); err != nil {
		return nil, fmt.Errorf("search tag: %w", err)
	}
	return items, nil
}

type UpsertInput struct {
	Slug      string  `json:"slug"`
	NmTag     string  `json:"nm_tag"`
	Deskripsi *string `json:"deskripsi,omitempty"`
	AAktif    bool    `json:"a_aktif"`
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	out := make([]byte, 0, len(s))
	prevDash := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			out = append(out, byte(r))
			prevDash = false
		} else if !prevDash && len(out) > 0 {
			out = append(out, '-')
			prevDash = true
		}
	}
	return strings.Trim(string(out), "-")
}

func (r *Repository) Create(ctx context.Context, in UpsertInput) (*Tag, error) {
	if strings.TrimSpace(in.NmTag) == "" {
		return nil, errors.New("nm_tag required")
	}
	if in.Slug == "" {
		in.Slug = slugify(in.NmTag)
	}
	q := `INSERT INTO ref.tag (slug, nm_tag, deskripsi, a_aktif)
	      VALUES ($1, $2, $3, $4)
	      RETURNING id_tag, slug, nm_tag, deskripsi, frekuensi, a_aktif, created_at`
	var t Tag
	if err := r.db.GetContext(ctx, &t, q, in.Slug, in.NmTag, in.Deskripsi, in.AAktif); err != nil {
		return nil, fmt.Errorf("insert tag: %w", err)
	}
	return &t, nil
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, in UpsertInput) (*Tag, error) {
	if strings.TrimSpace(in.NmTag) == "" {
		return nil, errors.New("nm_tag required")
	}
	if in.Slug == "" {
		in.Slug = slugify(in.NmTag)
	}
	q := `UPDATE ref.tag SET slug=$1, nm_tag=$2, deskripsi=$3, a_aktif=$4
	      WHERE id_tag=$5 AND soft_delete IS NULL
	      RETURNING id_tag, slug, nm_tag, deskripsi, frekuensi, a_aktif, created_at`
	var t Tag
	if err := r.db.GetContext(ctx, &t, q, in.Slug, in.NmTag, in.Deskripsi, in.AAktif, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update tag: %w", err)
	}
	return &t, nil
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `UPDATE ref.tag SET soft_delete = $1 WHERE id_tag = $2 AND soft_delete IS NULL`, time.Now(), id)
	if err != nil {
		return fmt.Errorf("soft delete tag: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ============ Handler ============

type Handler struct{ repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

// GET /api/v1/tag?aktif=1&limit=100
func (h *Handler) List(c *fiber.Ctx) error {
	aktifOnly := c.Query("aktif", "1") != "0"
	limit := c.QueryInt("limit", 100)
	items, err := h.repo.List(c.Context(), aktifOnly, limit)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

// GET /api/v1/tag/by-slug/:slug — single tag info untuk landing page.
func (h *Handler) GetBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return fiber.NewError(fiber.StatusBadRequest, "slug required")
	}
	t, err := h.repo.GetBySlug(c.Context(), slug)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "tag not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": t})
}

// GET /api/v1/tag/search?q=react&limit=10
func (h *Handler) Search(c *fiber.Ctx) error {
	q := c.Query("q", "")
	if len(q) < 1 {
		return c.JSON(fiber.Map{"success": true, "data": []Tag{}})
	}
	limit := c.QueryInt("limit", 10)
	items, err := h.repo.Search(c.Context(), q, limit)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

// POST /api/v1/admin/tag
func (h *Handler) Create(c *fiber.Ctx) error {
	var in UpsertInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	t, err := h.repo.Create(c.Context(), in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": t})
}

// PUT /api/v1/admin/tag/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id UUID")
	}
	var in UpsertInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	t, err := h.repo.Update(c.Context(), id, in)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "tag not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": t})
}

// DELETE /api/v1/admin/tag/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id UUID")
	}
	if err := h.repo.Delete(c.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "tag not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "message": "deleted"})
}

// ============ Router ============

// RegisterRoutes — public read endpoints.
func RegisterRoutes(api fiber.Router, h *Handler) {
	g := api.Group("/tag")
	g.Get("/", h.List)
	g.Get("/search", h.Search)
	g.Get("/by-slug/:slug", h.GetBySlug)
}

// RegisterAdminRoutes — admin write endpoints.
func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/tag")
	g.Post("/", h.Create)
	g.Put("/:id", h.Update)
	g.Delete("/:id", h.Delete)
}
