package keywords

import (
	"strconv"

	"monitoring-service/internal/middleware"
	"monitoring-service/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

type Controller struct {
	svc Service
	db  *sqlx.DB
}

func NewController(svc Service, db *sqlx.DB) *Controller {
	return &Controller{svc: svc, db: db}
}

// GET /api/v1/keywords
func (c *Controller) List(ctx *fiber.Ctx) error {
	var f KeywordFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	list, total, err := c.svc.List(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil keywords", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 50
	}
	return response.Paginated(ctx, "Keywords berhasil diambil", list, total, page, limit)
}

// POST /api/v1/keywords
func (c *Controller) Create(ctx *fiber.Ctx) error {
	var req CreateKeywordRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	if req.Keyword == "" || req.Category == "" {
		return response.BadRequest(ctx, "keyword dan category wajib diisi", nil)
	}
	creatorID := middleware.GetUserID(ctx)
	kw, err := c.svc.Create(req, creatorID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal menambah keyword", err.Error())
	}
	return response.Created(ctx, "Keyword berhasil ditambahkan", kw)
}

// PUT /api/v1/keywords/:id
func (c *Controller) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	var req UpdateKeywordRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	updaterID := middleware.GetUserID(ctx)
	kw, err := c.svc.Update(id, req, updaterID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal update keyword", err.Error())
	}
	return response.Success(ctx, "Keyword berhasil diupdate", kw)
}

// DELETE /api/v1/keywords/:id
func (c *Controller) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	updaterID := middleware.GetUserID(ctx)
	if err := c.svc.Delete(id, updaterID); err != nil {
		return response.InternalServerError(ctx, "Gagal menghapus keyword", err.Error())
	}
	return response.Success(ctx, "Keyword berhasil dihapus", nil)
}

// POST /api/v1/keywords/seed
func (c *Controller) Seed(ctx *fiber.Ctx) error {
	creatorID := middleware.GetUserID(ctx)
	if err := c.svc.Seed(creatorID, c.db); err != nil {
		return response.InternalServerError(ctx, "Gagal seed keywords", err.Error())
	}
	return response.Success(ctx, "Keywords berhasil di-reset ke default", nil)
}
