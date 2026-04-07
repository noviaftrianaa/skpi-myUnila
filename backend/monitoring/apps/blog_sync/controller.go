package blog_sync

import (
	"strconv"

	"monitoring-service/internal/middleware"
	"monitoring-service/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// POST /api/v1/sites/:id/sync-now
func (c *Controller) SyncNow(ctx *fiber.Ctx) error {
	siteID := ctx.Params("id")
	triggeredBy := middleware.GetUserID(ctx)

	result, err := c.svc.SyncSite(siteID, triggeredBy)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal sync Blogger", err.Error())
	}
	return response.Success(ctx, "Sync berhasil", result)
}

// GET /api/v1/sites/:id/sync-logs
func (c *Controller) SyncLogs(ctx *fiber.Ctx) error {
	siteID := ctx.Params("id")
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))

	logs, err := c.svc.ListSyncLogs(siteID, limit)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil sync logs", err.Error())
	}
	return response.Success(ctx, "Sync logs berhasil diambil", logs)
}

// GET /v1/public/posts
func (c *Controller) ListPublicPosts(ctx *fiber.Ctx) error {
	var f PostFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	list, total, err := c.svc.ListPosts(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil posts", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	return response.Paginated(ctx, "Posts berhasil diambil", list, total, page, limit)
}

// GET /v1/public/posts/:slug
func (c *Controller) GetPublicPost(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	post, err := c.svc.GetPostBySlug(slug)
	if err != nil {
		return response.NotFound(ctx, "Post tidak ditemukan")
	}
	return response.Success(ctx, "Post berhasil diambil", post)
}
