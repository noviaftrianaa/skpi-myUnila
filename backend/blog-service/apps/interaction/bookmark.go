package interaction

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
// BOOKMARK — Reading list user. Bukan reaksi publik, jadi tidak ada counter di blog.post.
// Pattern: Toggle (POST), Status (GET), ListMine (GET) untuk dashboard.
// =============================================================================

type BookmarkRepository struct{ db *sqlx.DB }

func NewBookmarkRepository(db *sqlx.DB) *BookmarkRepository { return &BookmarkRepository{db: db} }

// Toggle — bookmark/unbookmark post. Return (bookmarked: bool).
// label optional — kalau provided dan bookmark baru, simpan label.
func (r *BookmarkRepository) Toggle(ctx context.Context, idPost, idPengguna uuid.UUID, catatan, label *string) (bool, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Cek post exists + published (tidak boleh bookmark draft / trash)
	var exists bool
	err = tx.GetContext(ctx, &exists,
		`SELECT EXISTS(SELECT 1 FROM blog.post WHERE id_post=$1 AND status='published' AND soft_delete IS NULL)`,
		idPost)
	if err != nil {
		return false, fmt.Errorf("post check: %w", err)
	}
	if !exists {
		return false, errors.New("post not found or not published")
	}

	var already bool
	err = tx.GetContext(ctx, &already,
		`SELECT EXISTS(SELECT 1 FROM interaction.bookmark_post WHERE id_post=$1 AND id_pengguna_pdut=$2)`,
		idPost, idPengguna)
	if err != nil {
		return false, fmt.Errorf("bookmark check: %w", err)
	}

	var bookmarked bool
	if already {
		_, err = tx.ExecContext(ctx,
			`DELETE FROM interaction.bookmark_post WHERE id_post=$1 AND id_pengguna_pdut=$2`,
			idPost, idPengguna)
		bookmarked = false
	} else {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO interaction.bookmark_post (id_post, id_pengguna_pdut, catatan, label) VALUES ($1, $2, $3, $4)`,
			idPost, idPengguna, catatan, label)
		bookmarked = true
	}
	if err != nil {
		return false, fmt.Errorf("toggle bookmark: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("commit: %w", err)
	}
	return bookmarked, nil
}

// IsBookmarkedBy — cek apakah user current sudah bookmark.
func (r *BookmarkRepository) IsBookmarkedBy(ctx context.Context, idPost, idPengguna uuid.UUID) (bool, error) {
	var b bool
	err := r.db.GetContext(ctx, &b,
		`SELECT EXISTS(SELECT 1 FROM interaction.bookmark_post WHERE id_post=$1 AND id_pengguna_pdut=$2)`,
		idPost, idPengguna)
	return b, err
}

// BookmarkEntry — display untuk dashboard "My Bookmarks".
// Join ke post + blog + kategori untuk render card.
type BookmarkEntry struct {
	IDBookmarkPost uuid.UUID  `db:"id_bookmark_post" json:"id_bookmark_post"`
	IDPost         uuid.UUID  `db:"id_post"          json:"id_post"`
	Catatan        *string    `db:"catatan"          json:"catatan,omitempty"`
	Label          *string    `db:"label"            json:"label,omitempty"`
	BookmarkedAt   time.Time  `db:"bookmarked_at"    json:"bookmarked_at"`
	Subdomain      string     `db:"subdomain"        json:"subdomain"`
	NmBlog         string     `db:"nm_blog"          json:"nm_blog"`
	BlogAvatarURL  *string    `db:"avatar_url"       json:"blog_avatar_url,omitempty"`
	Judul          string     `db:"judul"            json:"judul"`
	Slug           string     `db:"slug"             json:"slug"`
	Ringkasan      *string    `db:"ringkasan"        json:"ringkasan,omitempty"`
	CoverURL       *string    `db:"cover_url"        json:"cover_url,omitempty"`
	KategoriSlug   *string    `db:"kategori_slug"    json:"kategori_slug,omitempty"`
	KategoriNama   *string    `db:"kategori_nama"    json:"kategori_nama,omitempty"`
	KategoriWarna  *string    `db:"kategori_warna"   json:"kategori_warna,omitempty"`
	TglTerbit      *time.Time `db:"tgl_terbit"       json:"tgl_terbit,omitempty"`
	JumlahView     int        `db:"jumlah_view"      json:"jumlah_view"`
	JumlahLike     int        `db:"jumlah_like"      json:"jumlah_like"`
	WaktuBacaMenit int        `db:"waktu_baca_menit" json:"waktu_baca_menit"`
	PostStatus     string     `db:"status"           json:"status"`
}

// ListMine — list bookmark milik user, filter status='published' supaya draft/trash blog owner tidak muncul.
// label optional filter: "" = semua, nilai != "" = filter exact match.
func (r *BookmarkRepository) ListMine(ctx context.Context, idPengguna uuid.UUID, label string, limit, offset int) ([]BookmarkEntry, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	labelClause := ""
	args := []any{idPengguna}
	if label != "" {
		labelClause = " AND bm.label = $2"
		args = append(args, label)
	}

	var total int
	if err := r.db.GetContext(ctx, &total, `
		SELECT COUNT(*)
		FROM interaction.bookmark_post bm
		JOIN blog.post p ON bm.id_post = p.id_post
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE bm.id_pengguna_pdut = $1
		  AND p.soft_delete IS NULL
		  AND b.soft_delete IS NULL
		  AND p.status = 'published'`+labelClause, args...); err != nil {
		return nil, 0, fmt.Errorf("count bookmarks: %w", err)
	}

	// Position $LIMIT $OFFSET after label arg
	limitIdx := len(args) + 1
	offsetIdx := len(args) + 2
	args = append(args, limit, offset)

	rows := make([]BookmarkEntry, 0)
	query := fmt.Sprintf(`
		SELECT
			bm.id_bookmark_post, bm.id_post, bm.catatan, bm.label, bm.created_at AS bookmarked_at,
			b.subdomain, b.nm_blog, b.avatar_url,
			p.judul, p.slug, p.ringkasan, p.cover_url,
			k.slug AS kategori_slug, k.nm_kategori AS kategori_nama, k.warna AS kategori_warna,
			p.tgl_terbit, p.jumlah_view, p.jumlah_like, p.waktu_baca_menit, p.status
		FROM interaction.bookmark_post bm
		JOIN blog.post p ON bm.id_post = p.id_post
		JOIN blog.blog b ON p.id_blog = b.id_blog
		LEFT JOIN ref.kategori_post k ON p.id_kategori_post = k.id_kategori_post
		WHERE bm.id_pengguna_pdut = $1
		  AND p.soft_delete IS NULL
		  AND b.soft_delete IS NULL
		  AND p.status = 'published'%s
		ORDER BY bm.created_at DESC
		LIMIT $%d OFFSET $%d`, labelClause, limitIdx, offsetIdx)
	if err := r.db.SelectContext(ctx, &rows, query, args...); err != nil {
		return nil, 0, fmt.Errorf("list bookmarks: %w", err)
	}
	return rows, total, nil
}

// ListLabels — distinct labels milik user dengan count.
type LabelStat struct {
	Label string `db:"label" json:"label"`
	Count int    `db:"count" json:"count"`
}

func (r *BookmarkRepository) ListLabels(ctx context.Context, idPengguna uuid.UUID) ([]LabelStat, error) {
	rows := make([]LabelStat, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT label, COUNT(*)::INT AS count
		FROM interaction.bookmark_post
		WHERE id_pengguna_pdut = $1 AND label IS NOT NULL
		GROUP BY label
		ORDER BY count DESC, label ASC`, idPengguna)
	if err != nil {
		return nil, fmt.Errorf("list labels: %w", err)
	}
	return rows, nil
}

// updateLabel — update label only (PATCH-style). Pakai pointer: nil = clear label.
func (r *BookmarkRepository) UpdateLabel(ctx context.Context, idBookmark, idPengguna uuid.UUID, label *string) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE interaction.bookmark_post SET label = $1
		 WHERE id_bookmark_post = $2 AND id_pengguna_pdut = $3`,
		label, idBookmark, idPengguna)
	if err != nil {
		return fmt.Errorf("update label: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("bookmark not found or not owned")
	}
	return nil
}

// Delete — explicit delete by id_bookmark_post (untuk dashboard remove tombol).
// Verifikasi ownership lewat id_pengguna_pdut.
func (r *BookmarkRepository) Delete(ctx context.Context, idBookmark, idPengguna uuid.UUID) error {
	res, err := r.db.ExecContext(ctx,
		`DELETE FROM interaction.bookmark_post WHERE id_bookmark_post=$1 AND id_pengguna_pdut=$2`,
		idBookmark, idPengguna)
	if err != nil {
		return fmt.Errorf("delete bookmark: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("bookmark not found or not owned")
	}
	return nil
}

// =============================================================================
// Handler
// =============================================================================

type BookmarkHandler struct{ repo *BookmarkRepository }

func NewBookmarkHandler(repo *BookmarkRepository) *BookmarkHandler {
	return &BookmarkHandler{repo: repo}
}

// POST /api/v1/posts/:id/bookmark — toggle bookmark (auth required).
// Body opsional: { "catatan": "..." } untuk private note.
func (h *BookmarkHandler) Toggle(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required to bookmark")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}

	var body struct {
		Catatan *string `json:"catatan"`
		Label   *string `json:"label"`
	}
	_ = c.BodyParser(&body) // body optional
	if body.Catatan != nil {
		s := *body.Catatan
		if len(s) > 280 {
			s = s[:280]
		}
		body.Catatan = &s
	}
	if body.Label != nil {
		s := strings.TrimSpace(*body.Label)
		if len(s) > 40 {
			s = s[:40]
		}
		if s == "" {
			body.Label = nil
		} else {
			body.Label = &s
		}
	}

	bookmarked, err := h.repo.Toggle(c.Context(), idPost, idUser, body.Catatan, body.Label)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    fiber.Map{"bookmarked": bookmarked},
	})
}

// GET /api/v1/posts/:id/bookmark-status — cek user current sudah bookmark (auth optional).
func (h *BookmarkHandler) Status(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"bookmarked": false}})
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	b, err := h.repo.IsBookmarkedBy(c.Context(), idPost, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"bookmarked": b}})
}

// GET /api/v1/me/bookmarks?limit=20&offset=0&label= — list bookmark milik user (auth required).
func (h *BookmarkHandler) ListMine(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	label := strings.TrimSpace(c.Query("label", ""))
	rows, total, err := h.repo.ListMine(c.Context(), idUser, label, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  rows,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GET /api/v1/me/bookmarks/labels — distinct labels milik user dengan count.
func (h *BookmarkHandler) ListLabels(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	rows, err := h.repo.ListLabels(c.Context(), idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// PATCH /api/v1/me/bookmarks/:id/label — update / clear label. Body: { "label": "..." | null }
func (h *BookmarkHandler) UpdateLabel(c *fiber.Ctx) error {
	idBookmark, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_bookmark")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	var body struct {
		Label *string `json:"label"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if body.Label != nil {
		s := strings.TrimSpace(*body.Label)
		if len(s) > 40 {
			s = s[:40]
		}
		if s == "" {
			body.Label = nil
		} else {
			body.Label = &s
		}
	}
	if err := h.repo.UpdateLabel(c.Context(), idBookmark, idUser, body.Label); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/me/bookmarks/:id — remove bookmark dari reading list.
func (h *BookmarkHandler) Remove(c *fiber.Ctx) error {
	idBookmark, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_bookmark")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	if err := h.repo.Delete(c.Context(), idBookmark, idUser); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}
