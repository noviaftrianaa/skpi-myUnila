package coauthor

import (
	"context"
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Notifier — injected emitter so the handler can fire invite + response notifs
// without depending on apps/interaction (which would create an import cycle).
// interaction.NotifService implements this implicitly.
type Notifier interface {
	EmitCoauthorInvite(ctx context.Context, idPost uuid.UUID, idBlogCo uuid.UUID, peran, aktorNama string, idAktor uuid.UUID)
	EmitCoauthorResponded(ctx context.Context, idPost uuid.UUID, idBlogOwner uuid.UUID, accepted bool, aktorNama string, idAktor uuid.UUID)
}

type Handler struct {
	repo  *Repository
	notif Notifier
}

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

func (h *Handler) SetNotifier(n Notifier) { h.notif = n }

func resolveBlog(c *fiber.Ctx) (uuid.UUID, error) {
	s, _ := c.Locals("id_blog").(string)
	if s == "" {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	return id, nil
}

// ensurePostOwned — returns the post's primary blog after verifying the caller
// is its owner. Any add/update/remove on co-authors must come from the post
// owner, not the co-author.
func (h *Handler) ensurePostOwned(c *fiber.Ctx, idPost uuid.UUID) error {
	myBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	postBlog, perr := h.repo.PostBlog(c.Context(), idPost)
	if perr != nil {
		if errors.Is(perr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, perr.Error())
	}
	if postBlog != myBlog {
		return fiber.NewError(fiber.StatusForbidden, "only the post owner can manage co-authors")
	}
	return nil
}

// =============================================================================
// OWNER ENDPOINTS — /me/blog/posts/:idPost/co-authors
// =============================================================================

// GET /me/blog/posts/:idPost/co-authors
func (h *Handler) List(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	if err := h.ensurePostOwned(c, idPost); err != nil {
		return err
	}
	// Owner sees every status (pending/accepted/declined) so they can manage
	// pending invites + see who declined.
	rows, lerr := h.repo.ListForPost(c.Context(), idPost, false)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// POST /me/blog/posts/:idPost/co-authors
// Body: { id_blog_co, peran?, urutan?, catatan? }
func (h *Handler) Add(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	if err := h.ensurePostOwned(c, idPost); err != nil {
		return err
	}
	postBlog, _ := h.repo.PostBlog(c.Context(), idPost)

	var body struct {
		IDBlogCo string  `json:"id_blog_co"`
		Peran    string  `json:"peran"`
		Urutan   *int    `json:"urutan"`
		Catatan  *string `json:"catatan"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	idCo, perr := uuid.Parse(body.IDBlogCo)
	if perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog_co")
	}
	if body.Peran == "" {
		body.Peran = "co_author"
	}

	ca, aerr := h.repo.Add(c.Context(), AddInput{
		IDPost:   idPost,
		IDBlog:   postBlog,
		IDBlogCo: idCo,
		Peran:    body.Peran,
		Urutan:   body.Urutan,
		Catatan:  body.Catatan,
	})
	if aerr != nil {
		switch {
		case errors.Is(aerr, ErrAlreadyExists):
			return fiber.NewError(fiber.StatusConflict, aerr.Error())
		case errors.Is(aerr, ErrSelfReference), errors.Is(aerr, ErrInvalidPeran), errors.Is(aerr, ErrCoBlogNotFound):
			return fiber.NewError(fiber.StatusBadRequest, aerr.Error())
		default:
			return fiber.NewError(fiber.StatusInternalServerError, aerr.Error())
		}
	}

	// Fire invite notif to the invitee. Best-effort — failure doesn't roll
	// back the row insert, the invitee just won't get a ping.
	if h.notif != nil {
		uid, _ := c.Locals("user_id").(string)
		idAktor, _ := uuid.Parse(uid)
		aktorNama, _ := h.repo.DisplayName(c.Context(), postBlog)
		go h.notif.EmitCoauthorInvite(context.Background(), idPost, idCo, ca.Peran, aktorNama, idAktor)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": ca})
}

// PATCH /me/blog/posts/:idPost/co-authors/:idBlogCo
func (h *Handler) Update(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	idBlogCo, err := uuid.Parse(c.Params("idBlogCo"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog_co")
	}
	if err := h.ensurePostOwned(c, idPost); err != nil {
		return err
	}
	var body UpdateInput
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	ca, uerr := h.repo.Update(c.Context(), idPost, idBlogCo, body)
	if uerr != nil {
		if errors.Is(uerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "co-author not found")
		}
		if errors.Is(uerr, ErrInvalidPeran) {
			return fiber.NewError(fiber.StatusBadRequest, uerr.Error())
		}
		return fiber.NewError(fiber.StatusInternalServerError, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": ca})
}

// DELETE /me/blog/posts/:idPost/co-authors/:idBlogCo
func (h *Handler) Remove(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	idBlogCo, err := uuid.Parse(c.Params("idBlogCo"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog_co")
	}
	if err := h.ensurePostOwned(c, idPost); err != nil {
		return err
	}
	if rerr := h.repo.Remove(c.Context(), idPost, idBlogCo); rerr != nil {
		if errors.Is(rerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "co-author not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, rerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /me/blog/co-author-invites?status=pending — posts where the current blog is credited.
// status query: "pending" / "accepted" / "declined" / "" (= all)
func (h *Handler) ListInvitesMine(c *fiber.Ctx) error {
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	limit := c.QueryInt("limit", 20)
	status := c.Query("status")
	rows, lerr := h.repo.ListPostsForBlogCo(c.Context(), idBlog, status, limit)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// PATCH /me/blog/co-author-invites/:idPost
// Body: { action: "accept" | "decline", alasan?: string }
// Only the invitee (whose blog == id_blog_co) can respond.
func (h *Handler) Respond(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body struct {
		Action string  `json:"action"`
		Alasan *string `json:"alasan"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	accept := false
	switch body.Action {
	case "accept":
		accept = true
	case "decline":
		accept = false
	default:
		return fiber.NewError(fiber.StatusBadRequest, "action must be 'accept' or 'decline'")
	}

	res, rerr := h.repo.Respond(c.Context(), idPost, idBlog, accept, body.Alasan)
	if rerr != nil {
		if errors.Is(rerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "invite not found or already responded")
		}
		return fiber.NewError(fiber.StatusInternalServerError, rerr.Error())
	}

	// Resolve the responder's display name for the back-notif.
	uid, _ := c.Locals("user_id").(string)
	idAktor, _ := uuid.Parse(uid)
	aktorNama, _ := h.repo.DisplayName(c.Context(), idBlog)
	if h.notif != nil {
		go h.notif.EmitCoauthorResponded(context.Background(), res.IDPost, res.IDBlogOwner, accept, aktorNama, idAktor)
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"id_post":   res.IDPost,
		"accepted":  res.Accepted,
		"peran":     res.Peran,
	}})
}

// =============================================================================
// PUBLIC — GET /api/v1/posts/:id/co-authors
// Renders the byline on the post detail page. Returns the same shape as the
// owner endpoint, but no auth required.
// =============================================================================

func (h *Handler) PublicList(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	// Public byline only ever shows accepted co-authors.
	rows, lerr := h.repo.ListForPost(c.Context(), idPost, true)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// =============================================================================
// ROUTING
// =============================================================================

// RegisterMineRoutes — mounts under /me. Caller must have applied
// ResolveBlogMiddleware (we use Locals("id_blog") to enforce ownership).
func RegisterMineRoutes(meBlog fiber.Router, h *Handler) {
	g := meBlog.Group("/blog/posts/:idPost/co-authors")
	g.Get("/", h.List)
	g.Post("/", h.Add)
	g.Patch("/:idBlogCo", h.Update)
	g.Delete("/:idBlogCo", h.Remove)
	meBlog.Get("/blog/co-author-invites", h.ListInvitesMine)
	meBlog.Patch("/blog/co-author-invites/:idPost", h.Respond)
}

// RegisterPublicRoutes — single endpoint for the public byline.
func RegisterPublicRoutes(api fiber.Router, h *Handler) {
	api.Get("/posts/:id/co-authors", h.PublicList)
}
