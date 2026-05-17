package kategori

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

var ErrNotFound = errors.New("kategori not found")

type Kategori struct {
	IDKategoriPost uuid.UUID `db:"id_kategori_post" json:"id_kategori_post"`
	Slug           string    `db:"slug"             json:"slug"`
	NmKategori     string    `db:"nm_kategori"      json:"nm_kategori"`
	Deskripsi      *string   `db:"deskripsi"        json:"deskripsi,omitempty"`
	IconName       *string   `db:"icon_name"        json:"icon_name,omitempty"`
	Warna          *string   `db:"warna"            json:"warna,omitempty"`
	Urutan         int       `db:"urutan"           json:"urutan"`
	JumlahPost     int       `db:"jumlah_post"      json:"jumlah_post"`
	AAktif         bool      `db:"a_aktif"          json:"a_aktif"`
	CreatedAt      time.Time `db:"created_at"       json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"       json:"updated_at"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

func (r *Repository) List(ctx context.Context, aktifOnly bool) ([]Kategori, error) {
	q := `SELECT id_kategori_post, slug, nm_kategori, deskripsi, icon_name, warna,
	             urutan, jumlah_post, a_aktif, created_at, updated_at
	      FROM ref.kategori_post
	      WHERE soft_delete IS NULL`
	if aktifOnly {
		q += ` AND a_aktif = TRUE`
	}
	q += ` ORDER BY urutan, nm_kategori`
	var items []Kategori
	if err := r.db.SelectContext(ctx, &items, q); err != nil {
		return nil, fmt.Errorf("list kategori: %w", err)
	}
	return items, nil
}

// UpsertInput — payload create/update.
type UpsertInput struct {
	Slug       string  `json:"slug"`
	NmKategori string  `json:"nm_kategori"`
	Deskripsi  *string `json:"deskripsi,omitempty"`
	IconName   *string `json:"icon_name,omitempty"`
	Warna      *string `json:"warna,omitempty"`
	Urutan     int     `json:"urutan"`
	AAktif     bool    `json:"a_aktif"`
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

func (r *Repository) Create(ctx context.Context, in UpsertInput) (*Kategori, error) {
	if strings.TrimSpace(in.NmKategori) == "" {
		return nil, errors.New("nm_kategori required")
	}
	if in.Slug == "" {
		in.Slug = slugify(in.NmKategori)
	}
	q := `INSERT INTO ref.kategori_post
	        (slug, nm_kategori, deskripsi, icon_name, warna, urutan, a_aktif)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)
	      RETURNING id_kategori_post, slug, nm_kategori, deskripsi, icon_name, warna,
	                urutan, jumlah_post, a_aktif, created_at, updated_at`
	var k Kategori
	if err := r.db.GetContext(ctx, &k, q, in.Slug, in.NmKategori, in.Deskripsi, in.IconName, in.Warna, in.Urutan, in.AAktif); err != nil {
		return nil, fmt.Errorf("insert kategori: %w", err)
	}
	return &k, nil
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, in UpsertInput) (*Kategori, error) {
	if strings.TrimSpace(in.NmKategori) == "" {
		return nil, errors.New("nm_kategori required")
	}
	if in.Slug == "" {
		in.Slug = slugify(in.NmKategori)
	}
	q := `UPDATE ref.kategori_post
	      SET slug=$1, nm_kategori=$2, deskripsi=$3, icon_name=$4, warna=$5, urutan=$6, a_aktif=$7
	      WHERE id_kategori_post=$8 AND soft_delete IS NULL
	      RETURNING id_kategori_post, slug, nm_kategori, deskripsi, icon_name, warna,
	                urutan, jumlah_post, a_aktif, created_at, updated_at`
	var k Kategori
	if err := r.db.GetContext(ctx, &k, q, in.Slug, in.NmKategori, in.Deskripsi, in.IconName, in.Warna, in.Urutan, in.AAktif, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update kategori: %w", err)
	}
	return &k, nil
}

// Delete — soft delete (set soft_delete = NOW). Tidak benar-benar hapus row.
func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `UPDATE ref.kategori_post SET soft_delete = $1 WHERE id_kategori_post = $2 AND soft_delete IS NULL`, time.Now(), id)
	if err != nil {
		return fmt.Errorf("soft delete kategori: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ToggleAktif — flip a_aktif.
func (r *Repository) ToggleAktif(ctx context.Context, id uuid.UUID) (*Kategori, error) {
	q := `UPDATE ref.kategori_post SET a_aktif = NOT a_aktif
	      WHERE id_kategori_post = $1 AND soft_delete IS NULL
	      RETURNING id_kategori_post, slug, nm_kategori, deskripsi, icon_name, warna,
	                urutan, jumlah_post, a_aktif, created_at, updated_at`
	var k Kategori
	if err := r.db.GetContext(ctx, &k, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("toggle kategori: %w", err)
	}
	return &k, nil
}

// ============ Handler ============

type Handler struct{ repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

// GET /api/v1/kategori?aktif=1
func (h *Handler) List(c *fiber.Ctx) error {
	aktifOnly := c.Query("aktif", "1") != "0"
	items, err := h.repo.List(c.Context(), aktifOnly)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

// POST /api/v1/admin/kategori
func (h *Handler) Create(c *fiber.Ctx) error {
	var in UpsertInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	k, err := h.repo.Create(c.Context(), in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": k})
}

// PUT /api/v1/admin/kategori/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id UUID")
	}
	var in UpsertInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	k, err := h.repo.Update(c.Context(), id, in)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "kategori not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": k})
}

// PATCH /api/v1/admin/kategori/:id/toggle-aktif
func (h *Handler) Toggle(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id UUID")
	}
	k, err := h.repo.ToggleAktif(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "kategori not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": k})
}

// DELETE /api/v1/admin/kategori/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id UUID")
	}
	if err := h.repo.Delete(c.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "kategori not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "message": "deleted"})
}

// ============ Router ============

// RegisterRoutes — public read endpoint.
func RegisterRoutes(api fiber.Router, h *Handler) {
	api.Get("/kategori", h.List)
}

// RegisterAdminRoutes — admin write endpoints (apply JWT + RequireRole middleware
// di main.go untuk admin group).
func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/kategori")
	g.Post("/", h.Create)
	g.Put("/:id", h.Update)
	g.Patch("/:id/toggle-aktif", h.Toggle)
	g.Delete("/:id", h.Delete)
}
