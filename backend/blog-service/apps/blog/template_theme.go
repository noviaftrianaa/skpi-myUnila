package blog

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// TEMPLATE THEME — ref.template_theme.
// Admin-curated preset themes. Authors pick one via Settings → Theme → Templates.
// 1 default theme (a_default=TRUE) di-pakai blog tanpa pilihan eksplisit.
// =============================================================================

type TemplateTheme struct {
	IDTemplateTheme uuid.UUID       `db:"id_template_theme" json:"id_template_theme"`
	Kode            string          `db:"kode"              json:"kode"`
	NmTemplate      string          `db:"nm_template"       json:"nm_template"`
	Deskripsi       *string         `db:"deskripsi"         json:"deskripsi,omitempty"`
	PreviewURL      *string         `db:"preview_url"       json:"preview_url,omitempty"`
	ManifestJSON    json.RawMessage `db:"manifest_json"     json:"manifest_json"`
	Versi           string          `db:"versi"             json:"versi"`
	ADefault        bool            `db:"a_default"         json:"a_default"`
	AAktif          bool            `db:"a_aktif"           json:"a_aktif"`
	CreatedAt       time.Time       `db:"created_at"        json:"created_at"`
	UpdatedAt       time.Time       `db:"updated_at"        json:"updated_at"`
}

type TemplateThemeRepository struct{ db *sqlx.DB }

func NewTemplateThemeRepository(db *sqlx.DB) *TemplateThemeRepository {
	return &TemplateThemeRepository{db: db}
}

// List — public (aktif only) atau admin (semua).
func (r *TemplateThemeRepository) List(ctx context.Context, aktifOnly bool) ([]TemplateTheme, error) {
	where := "soft_delete IS NULL"
	if aktifOnly {
		where += " AND a_aktif = TRUE"
	}
	q := `SELECT id_template_theme, kode, nm_template, deskripsi, preview_url,
	             manifest_json, versi, a_default, a_aktif, created_at, updated_at
	      FROM ref.template_theme
	      WHERE ` + where + `
	      ORDER BY a_default DESC, nm_template ASC`
	rows := make([]TemplateTheme, 0)
	if err := r.db.SelectContext(ctx, &rows, q); err != nil {
		return nil, fmt.Errorf("list template_theme: %w", err)
	}
	return rows, nil
}

func (r *TemplateThemeRepository) GetByID(ctx context.Context, id uuid.UUID) (*TemplateTheme, error) {
	var t TemplateTheme
	err := r.db.GetContext(ctx, &t, `
		SELECT id_template_theme, kode, nm_template, deskripsi, preview_url,
		       manifest_json, versi, a_default, a_aktif, created_at, updated_at
		FROM ref.template_theme
		WHERE id_template_theme = $1 AND soft_delete IS NULL`, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get template_theme: %w", err)
	}
	return &t, nil
}

type UpsertTemplateInput struct {
	Kode         string           `json:"kode"`
	NmTemplate   string           `json:"nm_template"`
	Deskripsi    *string          `json:"deskripsi,omitempty"`
	PreviewURL   *string          `json:"preview_url,omitempty"`
	ManifestJSON *json.RawMessage `json:"manifest_json,omitempty"`
	Versi        string           `json:"versi,omitempty"`
	AAktif       *bool            `json:"a_aktif,omitempty"`
}

func slugifyKode(s string) string {
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

func (in *UpsertTemplateInput) normalize() error {
	in.NmTemplate = strings.TrimSpace(in.NmTemplate)
	if in.NmTemplate == "" || len(in.NmTemplate) > 120 {
		return errors.New("nm_template harus 1-120 karakter")
	}
	in.Kode = strings.ToLower(strings.TrimSpace(in.Kode))
	if in.Kode == "" {
		in.Kode = slugifyKode(in.NmTemplate)
	}
	if len(in.Kode) > 40 {
		return errors.New("kode max 40 karakter")
	}
	if in.Versi == "" {
		in.Versi = "1.0.0"
	}
	return nil
}

func (r *TemplateThemeRepository) Create(ctx context.Context, idCreator uuid.UUID, in UpsertTemplateInput) (*TemplateTheme, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	manifest := json.RawMessage(`{}`)
	if in.ManifestJSON != nil {
		manifest = *in.ManifestJSON
	}
	aktif := true
	if in.AAktif != nil {
		aktif = *in.AAktif
	}

	var t TemplateTheme
	err := r.db.GetContext(ctx, &t, `
		INSERT INTO ref.template_theme (kode, nm_template, deskripsi, preview_url, manifest_json, versi, a_aktif, id_creator)
		VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), $5::jsonb, $6, $7, $8)
		RETURNING id_template_theme, kode, nm_template, deskripsi, preview_url, manifest_json, versi, a_default, a_aktif, created_at, updated_at`,
		in.Kode, in.NmTemplate, derefStr(in.Deskripsi), derefStr(in.PreviewURL),
		string(manifest), in.Versi, aktif, idCreator)
	if err != nil {
		if strings.Contains(err.Error(), "template_theme_kode_key") {
			return nil, fmt.Errorf("kode %q sudah ada", in.Kode)
		}
		return nil, fmt.Errorf("insert template_theme: %w", err)
	}
	return &t, nil
}

func (r *TemplateThemeRepository) Update(ctx context.Context, id, idUpdater uuid.UUID, in UpsertTemplateInput) (*TemplateTheme, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	sets := []string{
		"kode = $1", "nm_template = $2",
		"deskripsi = NULLIF($3, '')", "preview_url = NULLIF($4, '')",
		"versi = $5", "id_updater = $6", "updated_at = NOW()",
	}
	args := []any{in.Kode, in.NmTemplate, derefStr(in.Deskripsi), derefStr(in.PreviewURL), in.Versi, idUpdater}
	idx := 7
	if in.ManifestJSON != nil {
		sets = append(sets, fmt.Sprintf("manifest_json = $%d::jsonb", idx))
		args = append(args, string(*in.ManifestJSON))
		idx++
	}
	if in.AAktif != nil {
		sets = append(sets, fmt.Sprintf("a_aktif = $%d", idx))
		args = append(args, *in.AAktif)
		idx++
	}
	args = append(args, id)
	q := fmt.Sprintf(`UPDATE ref.template_theme SET %s
	                  WHERE id_template_theme = $%d AND soft_delete IS NULL
	                  RETURNING id_template_theme, kode, nm_template, deskripsi, preview_url,
	                            manifest_json, versi, a_default, a_aktif, created_at, updated_at`,
		strings.Join(sets, ", "), idx)
	var t TemplateTheme
	err := r.db.GetContext(ctx, &t, q, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		if strings.Contains(err.Error(), "template_theme_kode_key") {
			return nil, fmt.Errorf("kode %q sudah ada", in.Kode)
		}
		return nil, fmt.Errorf("update template_theme: %w", err)
	}
	return &t, nil
}

// SetDefault — atomic toggle: unset semua a_default, set target ke TRUE.
// Pakai transaksi karena partial unique index akan reject 2 default sekaligus.
func (r *TemplateThemeRepository) SetDefault(ctx context.Context, id uuid.UUID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.ExecContext(ctx,
		`UPDATE ref.template_theme SET a_default = FALSE WHERE a_default = TRUE AND soft_delete IS NULL`); err != nil {
		return fmt.Errorf("clear default: %w", err)
	}
	res, err := tx.ExecContext(ctx,
		`UPDATE ref.template_theme SET a_default = TRUE WHERE id_template_theme = $1 AND soft_delete IS NULL`, id)
	if err != nil {
		return fmt.Errorf("set default: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return tx.Commit()
}

func (r *TemplateThemeRepository) Delete(ctx context.Context, id, idUpdater uuid.UUID) error {
	// Can't delete default — admin harus set default lain dulu
	var isDefault bool
	if err := r.db.GetContext(ctx, &isDefault,
		`SELECT a_default FROM ref.template_theme WHERE id_template_theme = $1 AND soft_delete IS NULL`, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	if isDefault {
		return errors.New("tidak bisa hapus template default — set template lain sebagai default dulu")
	}
	res, err := r.db.ExecContext(ctx,
		`UPDATE ref.template_theme SET soft_delete = NOW(), id_updater = $1, updated_at = NOW()
		 WHERE id_template_theme = $2 AND soft_delete IS NULL`, idUpdater, id)
	if err != nil {
		return fmt.Errorf("delete template: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// =============================================================================
// HANDLER
// =============================================================================

type TemplateThemeHandler struct{ repo *TemplateThemeRepository }

func NewTemplateThemeHandler(repo *TemplateThemeRepository) *TemplateThemeHandler {
	return &TemplateThemeHandler{repo: repo}
}

// GET /api/v1/template-theme — public list (aktif only).
func (h *TemplateThemeHandler) ListPublic(c *fiber.Ctx) error {
	items, err := h.repo.List(c.Context(), true)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

// GET /api/v1/admin/template-theme — admin list (semua, termasuk inactive).
func (h *TemplateThemeHandler) ListAdmin(c *fiber.Ctx) error {
	items, err := h.repo.List(c.Context(), false)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

// POST /api/v1/admin/template-theme
func (h *TemplateThemeHandler) Create(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idCreator, _ := uuid.Parse(uid)
	var in UpsertTemplateInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	t, err := h.repo.Create(c.Context(), idCreator, in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": t})
}

// PUT /api/v1/admin/template-theme/:id
func (h *TemplateThemeHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	uid, _ := c.Locals("user_id").(string)
	idUpdater, _ := uuid.Parse(uid)
	var in UpsertTemplateInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	t, err := h.repo.Update(c.Context(), id, idUpdater, in)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "template not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": t})
}

// PATCH /api/v1/admin/template-theme/:id/set-default
func (h *TemplateThemeHandler) SetDefault(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	if err := h.repo.SetDefault(c.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "template not found")
		}
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/admin/template-theme/:id
func (h *TemplateThemeHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	uid, _ := c.Locals("user_id").(string)
	idUpdater, _ := uuid.Parse(uid)
	if err := h.repo.Delete(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "template not found")
		}
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// RegisterTemplateThemeRoutes — public list.
func RegisterTemplateThemeRoutes(api fiber.Router, h *TemplateThemeHandler) {
	api.Get("/template-theme", h.ListPublic)
}

// RegisterTemplateThemeAdminRoutes — admin-only CRUD.
func RegisterTemplateThemeAdminRoutes(admin fiber.Router, h *TemplateThemeHandler) {
	g := admin.Group("/template-theme")
	g.Get("/", h.ListAdmin)
	g.Post("/", h.Create)
	g.Put("/:id", h.Update)
	g.Patch("/:id/set-default", h.SetDefault)
	g.Delete("/:id", h.Delete)
}
