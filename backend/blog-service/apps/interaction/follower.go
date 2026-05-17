package interaction

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// FOLLOWER — User follow/unfollow blog tertentu.
// Trigger DB increment blog.blog.jumlah_follower.
// =============================================================================

type FollowerRepository struct{ db *sqlx.DB }

func NewFollowerRepository(db *sqlx.DB) *FollowerRepository { return &FollowerRepository{db: db} }

// Toggle — follow/unfollow blog (by subdomain). Return (following, totalFollower).
func (r *FollowerRepository) Toggle(ctx context.Context, subdomain string, idPengguna uuid.UUID) (bool, int, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Resolve blog by subdomain
	var idBlog uuid.UUID
	err = tx.GetContext(ctx, &idBlog,
		`SELECT id_blog FROM blog.blog WHERE subdomain = $1 AND soft_delete IS NULL AND a_aktif = TRUE`,
		subdomain)
	if err != nil {
		return false, 0, errors.New("blog not found")
	}

	// Cek sudah follow?
	var alreadyFollowing bool
	err = tx.GetContext(ctx, &alreadyFollowing,
		`SELECT EXISTS(SELECT 1 FROM interaction.follower WHERE id_blog=$1 AND id_pengguna_pdut=$2)`,
		idBlog, idPengguna)
	if err != nil {
		return false, 0, fmt.Errorf("follow check: %w", err)
	}

	var following bool
	if alreadyFollowing {
		_, err = tx.ExecContext(ctx,
			`DELETE FROM interaction.follower WHERE id_blog=$1 AND id_pengguna_pdut=$2`,
			idBlog, idPengguna)
		following = false
	} else {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO interaction.follower (id_blog, id_pengguna_pdut) VALUES ($1, $2)`,
			idBlog, idPengguna)
		following = true
	}
	if err != nil {
		return false, 0, fmt.Errorf("toggle follow: %w", err)
	}

	// Counter via trigger fn_update_blog_jumlah_follower
	var total int
	if err := tx.GetContext(ctx, &total,
		`SELECT jumlah_follower FROM blog.blog WHERE id_blog=$1`, idBlog); err != nil {
		return false, 0, fmt.Errorf("get count: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return false, 0, fmt.Errorf("commit: %w", err)
	}
	return following, total, nil
}

// IsFollowing — cek apakah user current sudah follow blog (untuk button state).
func (r *FollowerRepository) IsFollowing(ctx context.Context, subdomain string, idPengguna uuid.UUID) (bool, error) {
	var following bool
	err := r.db.GetContext(ctx, &following, `
		SELECT EXISTS(
			SELECT 1 FROM interaction.follower f
			JOIN blog.blog b ON f.id_blog = b.id_blog
			WHERE b.subdomain = $1 AND f.id_pengguna_pdut = $2 AND b.soft_delete IS NULL
		)`, subdomain, idPengguna)
	return following, err
}

// FollowerEntry — minimal info untuk display di "My Followers" list.
// id_pengguna_pdut hanya UUID — frontend resolve nama via separate query atau cross-DB.
type FollowerEntry struct {
	IDFollower     uuid.UUID `db:"id_follower"      json:"id_follower"`
	IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut" json:"id_pengguna_pdut"`
	TglFollow      time.Time `db:"tgl_follow"       json:"tgl_follow"`
}

// ListFollowers — list followers untuk blog tertentu (by id_blog, untuk dashboard owner).
func (r *FollowerRepository) ListFollowers(ctx context.Context, idBlog uuid.UUID, limit, offset int) ([]FollowerEntry, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM interaction.follower WHERE id_blog = $1`, idBlog); err != nil {
		return nil, 0, fmt.Errorf("count followers: %w", err)
	}

	rows := make([]FollowerEntry, 0)
	if err := r.db.SelectContext(ctx, &rows, `
		SELECT id_follower, id_pengguna_pdut, tgl_follow
		FROM interaction.follower
		WHERE id_blog = $1
		ORDER BY tgl_follow DESC
		LIMIT $2 OFFSET $3`, idBlog, limit, offset); err != nil {
		return nil, 0, fmt.Errorf("list followers: %w", err)
	}
	return rows, total, nil
}

// =============================================================================
// Handler
// =============================================================================

type FollowerHandler struct {
	repo  *FollowerRepository
	notif *NotifService
}

func NewFollowerHandler(repo *FollowerRepository) *FollowerHandler { return &FollowerHandler{repo: repo} }

func (h *FollowerHandler) SetNotif(n *NotifService) { h.notif = n }

// POST /api/v1/blogs/by-subdomain/:subdomain/follow — toggle follow (auth required)
func (h *FollowerHandler) Toggle(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required to follow")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}

	following, total, err := h.repo.Toggle(c.Context(), subdomain, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Emit notif hanya saat following=true (skip unfollow)
	if following && h.notif != nil {
		// Resolve id_blog from subdomain (separate roundtrip — kalau jadi bottleneck,
		// bisa di-return dari Toggle untuk single roundtrip).
		var idBlog uuid.UUID
		_ = h.repo.db.GetContext(c.Context(), &idBlog,
			`SELECT id_blog FROM blog.blog WHERE subdomain = $1`, subdomain)
		if idBlog != uuid.Nil {
			name, _ := c.Locals("name").(string)
			h.notif.EmitFollowBlog(c.Context(), idBlog, idUser, name)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"following":        following,
			"total_followers":  total,
		},
	})
}

// GET /api/v1/blogs/by-subdomain/:subdomain/follow-status — cek user current sudah follow
func (h *FollowerHandler) Status(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"following": false}})
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	following, err := h.repo.IsFollowing(c.Context(), subdomain, idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"following": following}})
}

// GET /api/v1/me/blog/followers?limit=50&offset=0 — list followers untuk blog owner
func (h *FollowerHandler) ListMine(c *fiber.Ctx) error {
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.ListFollowers(c.Context(), idBlog, limit, offset)
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
