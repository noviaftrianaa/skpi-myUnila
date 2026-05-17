// Package interaction — Like, Komentar, Follower untuk engagement features.
package interaction

import (
	"context"
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// LIKE — Toggle like per (user, post). Trigger DB increment jumlah_like.
// =============================================================================

type LikeRepository struct{ db *sqlx.DB }

func NewLikeRepository(db *sqlx.DB) *LikeRepository { return &LikeRepository{db: db} }

// Toggle — kalau sudah like → DELETE (unlike), kalau belum → INSERT.
// Return (liked: bool, totalLikes: int).
func (r *LikeRepository) Toggle(ctx context.Context, idPost, idPengguna uuid.UUID) (bool, int, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Cek post exists + published
	var exists bool
	err = tx.GetContext(ctx, &exists,
		`SELECT EXISTS(SELECT 1 FROM blog.post WHERE id_post=$1 AND status='published' AND soft_delete IS NULL)`,
		idPost)
	if err != nil {
		return false, 0, fmt.Errorf("post check: %w", err)
	}
	if !exists {
		return false, 0, errors.New("post not found or not published")
	}

	// Cek apakah user sudah like
	var alreadyLiked bool
	err = tx.GetContext(ctx, &alreadyLiked,
		`SELECT EXISTS(SELECT 1 FROM interaction.like_post WHERE id_post=$1 AND id_pengguna_pdut=$2)`,
		idPost, idPengguna)
	if err != nil {
		return false, 0, fmt.Errorf("like check: %w", err)
	}

	var liked bool
	if alreadyLiked {
		_, err = tx.ExecContext(ctx,
			`DELETE FROM interaction.like_post WHERE id_post=$1 AND id_pengguna_pdut=$2`,
			idPost, idPengguna)
		liked = false
	} else {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO interaction.like_post (id_post, id_pengguna_pdut) VALUES ($1, $2)`,
			idPost, idPengguna)
		liked = true
	}
	if err != nil {
		return false, 0, fmt.Errorf("toggle like: %w", err)
	}

	// Counter di-update via trigger DB (fn_update_post_jumlah_like)
	// Get fresh count
	var total int
	if err := tx.GetContext(ctx, &total,
		`SELECT jumlah_like FROM blog.post WHERE id_post=$1`, idPost); err != nil {
		return false, 0, fmt.Errorf("get count: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return false, 0, fmt.Errorf("commit: %w", err)
	}
	return liked, total, nil
}

// IsLikedBy — cek apakah user sudah like post (untuk frontend init state).
func (r *LikeRepository) IsLikedBy(ctx context.Context, idPost, idPengguna uuid.UUID) (bool, error) {
	var liked bool
	err := r.db.GetContext(ctx, &liked,
		`SELECT EXISTS(SELECT 1 FROM interaction.like_post WHERE id_post=$1 AND id_pengguna_pdut=$2)`,
		idPost, idPengguna)
	return liked, err
}

// =============================================================================
// LIKE Handler
// =============================================================================

type LikeHandler struct {
	repo  *LikeRepository
	notif *NotifService // optional — fire-and-forget emit setelah toggle ON
}

func NewLikeHandler(repo *LikeRepository) *LikeHandler { return &LikeHandler{repo: repo} }

// SetNotif — inject NotifService dari main.go.
func (h *LikeHandler) SetNotif(n *NotifService) { h.notif = n }

// POST /api/v1/posts/:id/like — toggle like (requires auth).
func (h *LikeHandler) Toggle(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required to like")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}

	liked, total, err := h.repo.Toggle(c.Context(), idPost, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Emit notif hanya saat ON (skip unlike). Fire-and-forget, jangan block response.
	if liked && h.notif != nil {
		name, _ := c.Locals("name").(string)
		h.notif.EmitLikePost(c.Context(), idPost, idUser, name)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"liked":       liked,
			"total_likes": total,
		},
	})
}

// GET /api/v1/posts/:id/like-status — cek apakah user current sudah like (auth optional).
func (h *LikeHandler) Status(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		// Tidak login → tidak liked
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"liked": false}})
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	liked, err := h.repo.IsLikedBy(c.Context(), idPost, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"liked": liked}})
}
