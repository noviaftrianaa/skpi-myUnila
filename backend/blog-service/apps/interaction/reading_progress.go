package interaction

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// READING PROGRESS — per-user scroll position + completion state per post.
//
// Endpoints:
//   POST /me/reading-progress             — upsert (called on debounced scroll)
//   GET  /me/reading-progress?status=...  — Continue Reading widget
//   GET  /posts/:id/my-progress           — restore-on-revisit
//
// Anonymous users are intentionally NOT supported here; the frontend falls
// back to localStorage when no JWT is attached. Cross-device sync requires
// auth, which is fine since reading "where you left off" matters most when
// you bounce between phone + laptop.
// =============================================================================

type ReadingProgress struct {
	IDPenggunaPdut uuid.UUID  `db:"id_pengguna_pdut" json:"id_pengguna_pdut"`
	IDPost         uuid.UUID  `db:"id_post"          json:"id_post"`
	ProgressPct    int        `db:"progress_pct"     json:"progress_pct"`
	LastPositionPx *int       `db:"last_position_px" json:"last_position_px,omitempty"`
	CompletedAt    *time.Time `db:"completed_at"     json:"completed_at,omitempty"`
	LastSeenAt     time.Time  `db:"last_seen_at"     json:"last_seen_at"`
	CreatedAt      time.Time  `db:"created_at"       json:"created_at"`
}

// ReadingProgressItem — joined view for the Continue Reading widget. Includes
// just enough denormalised post info to render a card without a second fetch.
type ReadingProgressItem struct {
	IDPost         uuid.UUID  `db:"id_post"           json:"id_post"`
	Judul          string     `db:"judul"             json:"judul"`
	Slug           string     `db:"slug"              json:"slug"`
	Subdomain      string     `db:"subdomain"         json:"subdomain"`
	NmBlog         string     `db:"nm_blog"           json:"nm_blog"`
	NmTampilan     *string    `db:"nm_tampilan"       json:"nm_tampilan,omitempty"`
	CoverURL       *string    `db:"cover_url"         json:"cover_url,omitempty"`
	WaktuBacaMenit int        `db:"waktu_baca_menit"  json:"waktu_baca_menit"`
	ProgressPct    int        `db:"progress_pct"      json:"progress_pct"`
	CompletedAt    *time.Time `db:"completed_at"      json:"completed_at,omitempty"`
	LastSeenAt     time.Time  `db:"last_seen_at"      json:"last_seen_at"`
}

type ReadingProgressRepository struct{ db *sqlx.DB }

func NewReadingProgressRepository(db *sqlx.DB) *ReadingProgressRepository {
	return &ReadingProgressRepository{db: db}
}

// Upsert merges scroll progress for the (user, post) pair.
//   - progress_pct only moves forward — a re-read at the top shouldn't blank
//     out the "I got to 70% earlier" signal.
//   - completed_at is sticky: set the FIRST time pct >= 90 and never cleared.
//   - last_seen_at always advances to NOW().
func (r *ReadingProgressRepository) Upsert(ctx context.Context, idUser, idPost uuid.UUID, pct int, posPx *int) (*ReadingProgress, error) {
	if pct < 0 {
		pct = 0
	}
	if pct > 100 {
		pct = 100
	}
	var rp ReadingProgress
	// pct is passed twice (cast as smallint) to dodge pq's "inconsistent types
	// deduced for parameter" when the same placeholder appears in both a
	// CASE comparison and a column insert.
	err := r.db.GetContext(ctx, &rp, `
		INSERT INTO interaction.reading_progress
		    (id_pengguna_pdut, id_post, progress_pct, last_position_px, last_seen_at,
		     completed_at)
		VALUES ($1, $2, $3::SMALLINT, $4, NOW(),
		        CASE WHEN $5::SMALLINT >= 90 THEN NOW() ELSE NULL END)
		ON CONFLICT (id_pengguna_pdut, id_post) DO UPDATE SET
		    progress_pct      = GREATEST(reading_progress.progress_pct, EXCLUDED.progress_pct),
		    last_position_px  = COALESCE(EXCLUDED.last_position_px, reading_progress.last_position_px),
		    last_seen_at      = NOW(),
		    completed_at      = COALESCE(
		        reading_progress.completed_at,
		        CASE WHEN EXCLUDED.progress_pct >= 90 THEN NOW() ELSE NULL END
		    )
		RETURNING id_pengguna_pdut, id_post, progress_pct, last_position_px,
		          completed_at, last_seen_at, created_at`,
		idUser, idPost, pct, posPx, pct)
	if err != nil {
		return nil, fmt.Errorf("upsert reading progress: %w", err)
	}
	return &rp, nil
}

// GetForPost returns the user's progress on one post, or nil if no row yet.
func (r *ReadingProgressRepository) GetForPost(ctx context.Context, idUser, idPost uuid.UUID) (*ReadingProgress, error) {
	var rp ReadingProgress
	err := r.db.GetContext(ctx, &rp, `
		SELECT id_pengguna_pdut, id_post, progress_pct, last_position_px,
		       completed_at, last_seen_at, created_at
		FROM interaction.reading_progress
		WHERE id_pengguna_pdut = $1 AND id_post = $2`, idUser, idPost)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // no progress yet — not an error
		}
		return nil, fmt.Errorf("get reading progress: %w", err)
	}
	return &rp, nil
}

// ListIncomplete returns posts the user started but didn't finish, most
// recently touched first. Used by the Continue Reading dashboard widget.
// Hidden posts (soft_delete, status != published) are filtered out so the
// widget doesn't link to dead content.
func (r *ReadingProgressRepository) ListIncomplete(ctx context.Context, idUser uuid.UUID, limit int) ([]ReadingProgressItem, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	rows := make([]ReadingProgressItem, 0, limit)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT p.id_post, p.judul, p.slug, b.subdomain, b.nm_blog, b.nm_tampilan,
		       p.cover_url, p.waktu_baca_menit,
		       rp.progress_pct, rp.completed_at, rp.last_seen_at
		FROM interaction.reading_progress rp
		JOIN blog.post p ON p.id_post = rp.id_post
		JOIN blog.blog b ON b.id_blog = p.id_blog
		WHERE rp.id_pengguna_pdut = $1
		  AND rp.completed_at IS NULL
		  AND p.soft_delete IS NULL AND p.status = 'published'
		  AND b.soft_delete IS NULL AND b.a_aktif = TRUE
		ORDER BY rp.last_seen_at DESC
		LIMIT $2`, idUser, limit)
	if err != nil {
		return nil, fmt.Errorf("list incomplete: %w", err)
	}
	return rows, nil
}

// ListCompleted — "Recently finished" history view (optional dashboard tab).
func (r *ReadingProgressRepository) ListCompleted(ctx context.Context, idUser uuid.UUID, limit int) ([]ReadingProgressItem, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	rows := make([]ReadingProgressItem, 0, limit)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT p.id_post, p.judul, p.slug, b.subdomain, b.nm_blog, b.nm_tampilan,
		       p.cover_url, p.waktu_baca_menit,
		       rp.progress_pct, rp.completed_at, rp.last_seen_at
		FROM interaction.reading_progress rp
		JOIN blog.post p ON p.id_post = rp.id_post
		JOIN blog.blog b ON b.id_blog = p.id_blog
		WHERE rp.id_pengguna_pdut = $1
		  AND rp.completed_at IS NOT NULL
		  AND p.soft_delete IS NULL AND p.status = 'published'
		ORDER BY rp.completed_at DESC
		LIMIT $2`, idUser, limit)
	if err != nil {
		return nil, fmt.Errorf("list completed: %w", err)
	}
	return rows, nil
}

// =============================================================================
// HANDLER
// =============================================================================

type ReadingProgressHandler struct{ repo *ReadingProgressRepository }

func NewReadingProgressHandler(repo *ReadingProgressRepository) *ReadingProgressHandler {
	return &ReadingProgressHandler{repo: repo}
}

// POST /api/v1/me/reading-progress
// Body: { id_post, progress_pct, last_position_px? }
func (h *ReadingProgressHandler) Upsert(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	var body struct {
		IDPost         string `json:"id_post"`
		ProgressPct    int    `json:"progress_pct"`
		LastPositionPx *int   `json:"last_position_px"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	idPost, perr := uuid.Parse(body.IDPost)
	if perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	rp, uerr := h.repo.Upsert(c.Context(), idUser, idPost, body.ProgressPct, body.LastPositionPx)
	if uerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rp})
}

// GET /api/v1/me/reading-progress?status=incomplete|completed&limit=10
func (h *ReadingProgressHandler) ListMine(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	limit := c.QueryInt("limit", 10)
	status := c.Query("status", "incomplete")
	var rows []ReadingProgressItem
	var lerr error
	if status == "completed" {
		rows, lerr = h.repo.ListCompleted(c.Context(), idUser, limit)
	} else {
		rows, lerr = h.repo.ListIncomplete(c.Context(), idUser, limit)
	}
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /api/v1/posts/:id/my-progress
// Auth-optional: anonymous gets 204 (no body), authenticated gets the row.
func (h *ReadingProgressHandler) GetForPost(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return c.SendStatus(fiber.StatusNoContent)
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return c.SendStatus(fiber.StatusNoContent)
	}
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	rp, gerr := h.repo.GetForPost(c.Context(), idUser, idPost)
	if gerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, gerr.Error())
	}
	if rp == nil {
		return c.SendStatus(fiber.StatusNoContent)
	}
	return c.JSON(fiber.Map{"success": true, "data": rp})
}

// RegisterReadingProgressMineRoutes mounts under /me. JWTAuth required.
func RegisterReadingProgressMineRoutes(me fiber.Router, h *ReadingProgressHandler) {
	me.Post("/reading-progress", h.Upsert)
	me.Get("/reading-progress", h.ListMine)
}

// RegisterReadingProgressPublicRoutes mounts under /api/v1 (auth-optional).
func RegisterReadingProgressPublicRoutes(api fiber.Router, h *ReadingProgressHandler) {
	api.Get("/posts/:id/my-progress", h.GetForPost)
}
