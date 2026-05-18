package interaction

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/myunila/blog-service/apps/blog"
)

// RateLimits — bundle middleware untuk public write endpoints. nil-safe:
// kalau field nil, middleware skipped (dev convenience).
type RateLimits struct {
	Comment    fiber.Handler // POST komentar create
	Engagement fiber.Handler // POST like / bookmark / follow toggle
}

// RegisterPublicRoutes — public read + auth-optional write endpoints.
//
//   GET    /posts/:id/komentar          (public list)
//   GET    /posts/:id/like-status       (cek user current sudah like, auth optional)
//
// Plus authed-required endpoints (apply JWT middleware di main.go saat call):
//   POST   /posts/:id/like              (toggle, auth required)
//   POST   /posts/:id/komentar          (create, anonymous OK kalau provide nm+email)
//
// Untuk komentar create: optional auth — kalau ada Bearer, tag by id_pengguna_pdut;
// kalau tidak ada, treat as anonymous (butuh nm + email di body).
//
// Rate limit per-route (security tuneup): pass RateLimits struct dari main.go.
func RegisterPublicRoutes(api fiber.Router, like *LikeHandler, komentar *KomentarHandler, follower *FollowerHandler, bookmark *BookmarkHandler, likeKomentar *LikeKomentarHandler, rl RateLimits) {
	g := api.Group("/posts/:id")
	g.Get("/komentar", komentar.ListPublic)
	// Comment create: rate limited karena anonymous abuse vector.
	if rl.Comment != nil {
		g.Post("/komentar", rl.Comment, komentar.Create)
	} else {
		g.Post("/komentar", komentar.Create)
	}
	g.Get("/like-status", like.Status)
	// Engagement actions: rate limited bahkan untuk auth user (script abuse).
	if rl.Engagement != nil {
		g.Post("/like", rl.Engagement, like.Toggle)
		g.Post("/bookmark", rl.Engagement, bookmark.Toggle)
	} else {
		g.Post("/like", like.Toggle)
		g.Post("/bookmark", bookmark.Toggle)
	}
	g.Get("/bookmark-status", bookmark.Status)
	g.Get("/komentar-likes", likeKomentar.LikedMapForPost) // bulk hydrate per-post

	// Komentar like (auth required)
	if rl.Engagement != nil {
		api.Post("/komentar/:id/like", rl.Engagement, likeKomentar.Toggle)
	} else {
		api.Post("/komentar/:id/like", likeKomentar.Toggle)
	}

	// Follower per blog (subdomain-based identifier)
	bg := api.Group("/blogs/by-subdomain/:subdomain")
	bg.Get("/follow-status", follower.Status)
	if rl.Engagement != nil {
		bg.Post("/follow", rl.Engagement, follower.Toggle)
	} else {
		bg.Post("/follow", follower.Toggle)
	}
}

// RegisterMineRoutes — moderation + follower list endpoints untuk blog owner.
// Apply JWTAuth + middleware resolveBlogID di main.go.
func RegisterMineRoutes(me fiber.Router, komentar *KomentarHandler, follower *FollowerHandler, bannedCommenter *BannedCommenterHandler) {
	g := me.Group("/blog/komentar")
	g.Get("/trash", komentar.ListTrash) // sebelum :id supaya literal match
	g.Get("/", komentar.ListMine)
	g.Post("/bulk", komentar.ModerateBulk)
	g.Patch("/:id/pin", komentar.TogglePin)
	g.Post("/:id/restore", komentar.Restore)
	g.Delete("/:id/permanent", komentar.PermanentDelete)
	g.Delete("/:id", komentar.SoftDelete)
	g.Patch("/:id", komentar.Moderate)

	me.Get("/blog/followers", follower.ListMine)

	// Phase BF — per-blog commenter ban
	bc := me.Group("/blog/banned-commenter")
	bc.Get("/", bannedCommenter.List)
	bc.Post("/", bannedCommenter.Create)
	bc.Delete("/:id", bannedCommenter.Delete)
}

// RegisterBookmarkMineRoutes — bookmark list/remove untuk user current (tanpa resolveBlog).
// Bookmark milik user, bukan blog → tidak butuh middleware resolveBlogID.
func RegisterBookmarkMineRoutes(me fiber.Router, bookmark *BookmarkHandler) {
	g := me.Group("/bookmarks")
	g.Get("/labels", bookmark.ListLabels) // sebelum :id supaya literal match dulu
	g.Get("/", bookmark.ListMine)
	g.Patch("/:id/label", bookmark.UpdateLabel)
	g.Delete("/:id", bookmark.Remove)
}

// ResolveBlogMiddleware — set c.Locals("id_blog") dari user_id JWT.
// Dipakai untuk endpoint /me/blog/komentar/* yang butuh ownership check.
func ResolveBlogMiddleware(blogRepo *blog.Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		uid, _ := c.Locals("user_id").(string)
		if uid == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "missing user_id")
		}
		idUser, err := uuid.Parse(uid)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid user_id UUID")
		}
		b, err := blogRepo.GetByUserPdut(c.Context(), idUser)
		if errors.Is(err, blog.ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "user belum punya blog")
		}
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		c.Locals("id_blog", b.IDBlog.String())
		return c.Next()
	}
}
