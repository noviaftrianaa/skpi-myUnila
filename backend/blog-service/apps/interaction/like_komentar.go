package interaction

import (
	"context"
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// =============================================================================
// LIKE KOMENTAR — engagement parity dengan LikePost.
// Trigger DB fn_update_komentar_jumlah_like auto-maintain counter.
// =============================================================================

type LikeKomentarRepository struct{ db *sqlx.DB }

func NewLikeKomentarRepository(db *sqlx.DB) *LikeKomentarRepository {
	return &LikeKomentarRepository{db: db}
}

// Toggle — kalau sudah like → DELETE, kalau belum → INSERT. Return (liked, totalLikes).
func (r *LikeKomentarRepository) Toggle(ctx context.Context, idKomentar, idPengguna uuid.UUID) (bool, int, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Cek komentar exists + approved (gak masuk akal like pending/spam comment)
	var exists bool
	err = tx.GetContext(ctx, &exists, `
		SELECT EXISTS(
			SELECT 1 FROM interaction.komentar
			WHERE id_komentar = $1
			  AND status_moderasi = 'approved'
			  AND soft_delete IS NULL
		)`, idKomentar)
	if err != nil {
		return false, 0, fmt.Errorf("komentar check: %w", err)
	}
	if !exists {
		return false, 0, errors.New("komentar not found or not approved")
	}

	var already bool
	err = tx.GetContext(ctx, &already,
		`SELECT EXISTS(SELECT 1 FROM interaction.like_komentar WHERE id_komentar=$1 AND id_pengguna_pdut=$2)`,
		idKomentar, idPengguna)
	if err != nil {
		return false, 0, fmt.Errorf("like check: %w", err)
	}

	var liked bool
	if already {
		_, err = tx.ExecContext(ctx,
			`DELETE FROM interaction.like_komentar WHERE id_komentar=$1 AND id_pengguna_pdut=$2`,
			idKomentar, idPengguna)
		liked = false
	} else {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO interaction.like_komentar (id_komentar, id_pengguna_pdut) VALUES ($1, $2)`,
			idKomentar, idPengguna)
		liked = true
	}
	if err != nil {
		return false, 0, fmt.Errorf("toggle: %w", err)
	}

	// Counter di-update via trigger
	var total int
	if err := tx.GetContext(ctx, &total,
		`SELECT jumlah_like FROM interaction.komentar WHERE id_komentar=$1`, idKomentar); err != nil {
		return false, 0, fmt.Errorf("get count: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return false, 0, fmt.Errorf("commit: %w", err)
	}
	return liked, total, nil
}

// LikedByMap — return map id_komentar → liked (untuk efisien render banyak komentar sekaligus).
func (r *LikeKomentarRepository) LikedByMap(ctx context.Context, idPengguna uuid.UUID, ids []uuid.UUID) (map[uuid.UUID]bool, error) {
	out := map[uuid.UUID]bool{}
	if len(ids) == 0 {
		return out, nil
	}
	// Convert []uuid.UUID → []string untuk pq.Array (lib/pq tidak support UUID slice native).
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = id.String()
	}
	rows, err := r.db.QueryxContext(ctx,
		`SELECT id_komentar FROM interaction.like_komentar
		 WHERE id_pengguna_pdut = $1 AND id_komentar = ANY($2::uuid[])`,
		idPengguna, pq.Array(strIDs))
	if err != nil {
		return nil, fmt.Errorf("liked map: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err == nil {
			out[id] = true
		}
	}
	return out, nil
}

// =============================================================================
// HANDLER
// =============================================================================

type LikeKomentarHandler struct{ repo *LikeKomentarRepository }

func NewLikeKomentarHandler(repo *LikeKomentarRepository) *LikeKomentarHandler {
	return &LikeKomentarHandler{repo: repo}
}

// POST /api/v1/komentar/:id/like — toggle (auth required).
func (h *LikeKomentarHandler) Toggle(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required to like comment")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	liked, total, err := h.repo.Toggle(c.Context(), idKomentar, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"liked":       liked,
			"total_likes": total,
		},
	})
}

// GET /api/v1/posts/:id/komentar-likes — return map { id_komentar: true } untuk user current.
// Frontend pakai 1 call ini buat hydrate semua like states sekaligus saat load post.
func (h *LikeKomentarHandler) LikedMapForPost(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{}})
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}

	// Get all komentar IDs untuk post
	ids := []uuid.UUID{}
	if err := h.repo.db.SelectContext(c.Context(), &ids, `
		SELECT id_komentar FROM interaction.komentar
		WHERE id_post = $1 AND status_moderasi = 'approved' AND soft_delete IS NULL`, idPost); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	m, err := h.repo.LikedByMap(c.Context(), idUser, ids)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	// Convert ke string keys untuk JSON-friendly
	out := make(map[string]bool, len(m))
	for k := range m {
		out[k.String()] = true
	}
	return c.JSON(fiber.Map{"success": true, "data": out})
}
