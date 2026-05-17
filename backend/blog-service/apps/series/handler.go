package series

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct{ repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

func resolveBlog(c *fiber.Ctx) (uuid.UUID, error) {
	s, _ := c.Locals("id_blog").(string)
	if s == "" {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved (middleware missing?)")
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	return id, nil
}

// =============================================================================
// OWNER ENDPOINTS — /me/blog/series/*
// =============================================================================

// POST /me/blog/series
// Body: { judul, slug?, deskripsi?, cover_url? }
func (h *Handler) Create(c *fiber.Ctx) error {
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body struct {
		Judul     string  `json:"judul"`
		Slug      string  `json:"slug"`
		Deskripsi *string `json:"deskripsi"`
		CoverURL  *string `json:"cover_url"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON")
	}
	if body.Judul == "" {
		return fiber.NewError(fiber.StatusBadRequest, "judul wajib diisi")
	}
	s, cerr := h.repo.Create(c.Context(), CreateInput{
		IDBlog:    idBlog,
		Judul:     body.Judul,
		Slug:      body.Slug,
		Deskripsi: body.Deskripsi,
		CoverURL:  body.CoverURL,
	})
	if cerr != nil {
		if errors.Is(cerr, ErrSlugTaken) {
			return fiber.NewError(fiber.StatusConflict, cerr.Error())
		}
		return fiber.NewError(fiber.StatusBadRequest, cerr.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": s})
}

// GET /me/blog/series?active=true
func (h *Handler) ListMine(c *fiber.Ctx) error {
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	onlyActive := c.Query("active") == "true"
	rows, lerr := h.repo.ListByBlog(c.Context(), idBlog, onlyActive)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /me/blog/series/:id — includes ordered post list (incl. unpublished).
func (h *Handler) GetMine(c *fiber.Ctx) error {
	idSeries, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_series")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	s, gerr := h.repo.GetByID(c.Context(), idSeries, idBlog)
	if gerr != nil {
		if errors.Is(gerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "series not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, gerr.Error())
	}
	posts, _ := h.repo.PostsInSeries(c.Context(), idSeries, true)
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"series": s, "posts": posts,
	}})
}

// PUT /me/blog/series/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	idSeries, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_series")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body UpdateInput
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON")
	}
	s, uerr := h.repo.Update(c.Context(), idSeries, idBlog, body)
	if uerr != nil {
		if errors.Is(uerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "series not found")
		}
		if errors.Is(uerr, ErrSlugTaken) {
			return fiber.NewError(fiber.StatusConflict, uerr.Error())
		}
		return fiber.NewError(fiber.StatusBadRequest, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": s})
}

// DELETE /me/blog/series/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	idSeries, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_series")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	if derr := h.repo.SoftDelete(c.Context(), idSeries, idBlog); derr != nil {
		if errors.Is(derr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "series not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, derr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// POST /me/blog/series/:id/posts/:idPost — body { urutan?: int }
func (h *Handler) AttachPost(c *fiber.Ctx) error {
	idSeries, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_series")
	}
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body struct {
		Urutan *int `json:"urutan"`
	}
	_ = c.BodyParser(&body) // body optional
	if aerr := h.repo.AttachPost(c.Context(), idPost, idSeries, idBlog, body.Urutan); aerr != nil {
		if errors.Is(aerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post or series not found in this blog")
		}
		return fiber.NewError(fiber.StatusInternalServerError, aerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /me/blog/series/posts/:idPost — remove the post from whatever series it's in.
// Uses /me/blog/series/posts/:idPost (no series id) since a post is in at most one.
func (h *Handler) DetachPost(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("idPost"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	if derr := h.repo.DetachPost(c.Context(), idPost, idBlog); derr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, derr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// PATCH /me/blog/series/:id/reorder — body { order: [idPost1, idPost2, ...] }
func (h *Handler) Reorder(c *fiber.Ctx) error {
	idSeries, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_series")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body struct {
		Order []string `json:"order"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON")
	}
	ids := make([]uuid.UUID, 0, len(body.Order))
	for _, s := range body.Order {
		id, perr := uuid.Parse(s)
		if perr != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid post id in order: "+s)
		}
		ids = append(ids, id)
	}
	if rerr := h.repo.Reorder(c.Context(), idSeries, idBlog, ids); rerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, rerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

// GET /api/v1/blogs/by-subdomain/:subdomain/series — list active series
// GET /api/v1/blogs/by-subdomain/:subdomain/series/:slug — series detail + posts
// Resolved via BlogResolver to avoid an import cycle.
type BlogResolver interface {
	BlogIDBySubdomain(ctx fiberContext, subdomain string) (uuid.UUID, error)
}

// fiberContext is a tiny shim type so this file doesn't pull context.Context
// from another package directly.
type fiberContext interface{}

// PublicList — GET /api/v1/blogs/by-subdomain/:subdomain/series
func (h *Handler) PublicList(c *fiber.Ctx, resolveSubdomain func(string) (uuid.UUID, error)) error {
	sub := c.Params("subdomain")
	idBlog, err := resolveSubdomain(sub)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	rows, lerr := h.repo.ListByBlog(c.Context(), idBlog, true)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// PublicShow — GET /api/v1/blogs/by-subdomain/:subdomain/series/:slug
func (h *Handler) PublicShow(c *fiber.Ctx, resolveSubdomain func(string) (uuid.UUID, error)) error {
	sub := c.Params("subdomain")
	slug := c.Params("slug")
	idBlog, err := resolveSubdomain(sub)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	s, gerr := h.repo.GetBySlug(c.Context(), idBlog, slug)
	if gerr != nil {
		if errors.Is(gerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "series not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, gerr.Error())
	}
	if !s.AAktif {
		return fiber.NewError(fiber.StatusNotFound, "series not active")
	}
	posts, _ := h.repo.PostsInSeries(c.Context(), s.IDSeries, false)
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"series": s, "posts": posts,
	}})
}

// PublicContext — GET /api/v1/posts/:id/series-context
// Returns prev/next + index/total for the post within its series. Used by the
// post detail page footer to render the navigation block.
func (h *Handler) PublicContext(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	ctxData, cerr := h.repo.SeriesContextForPost(c.Context(), idPost)
	if cerr != nil {
		if errors.Is(cerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, cerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": ctxData})
}

// RegisterMineRoutes — owner endpoints under /me. Caller must have already
// mounted ResolveBlogMiddleware on the group.
func RegisterMineRoutes(meBlog fiber.Router, h *Handler) {
	g := meBlog.Group("/blog/series")
	g.Get("/", h.ListMine)
	g.Post("/", h.Create)
	g.Get("/:id", h.GetMine)
	g.Put("/:id", h.Update)
	g.Delete("/:id", h.Delete)
	g.Post("/:id/posts/:idPost", h.AttachPost)
	g.Patch("/:id/reorder", h.Reorder)
	// Detach by post id only — series id is unambiguous since post has at most one.
	meBlog.Delete("/blog/series-membership/:idPost", h.DetachPost)
}

// RegisterPublicRoutes — public endpoints. resolveSubdomain bridges to apps/blog
// to avoid an import cycle.
func RegisterPublicRoutes(api fiber.Router, h *Handler, resolveSubdomain func(string) (uuid.UUID, error)) {
	api.Get("/blogs/by-subdomain/:subdomain/series", func(c *fiber.Ctx) error {
		return h.PublicList(c, resolveSubdomain)
	})
	api.Get("/blogs/by-subdomain/:subdomain/series/:slug", func(c *fiber.Ctx) error {
		return h.PublicShow(c, resolveSubdomain)
	})
	api.Get("/posts/:id/series-context", h.PublicContext)
}
