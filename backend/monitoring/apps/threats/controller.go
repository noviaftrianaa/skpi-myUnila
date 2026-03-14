package threats

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

// GET /api/v1/threats
func (c *Controller) List(ctx *fiber.Ctx) error {
	var f ThreatFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	list, total, err := c.svc.List(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil data threats", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	return response.Paginated(ctx, "Threats berhasil diambil", list, total, page, limit)
}

// GET /api/v1/threats/:id
func (c *Controller) GetByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	t, err := c.svc.GetByID(id)
	if err != nil {
		return response.NotFound(ctx, "Threat tidak ditemukan")
	}
	return response.Success(ctx, "Threat berhasil diambil", t)
}

// PUT /api/v1/threats/:id/status
func (c *Controller) UpdateStatus(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	var req UpdateStatusRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	validStatuses := map[string]bool{
		"confirmed": true, "false_positive": true, "resolved": true, "pending": true,
	}
	if !validStatuses[req.Status] {
		return response.BadRequest(ctx, "Status tidak valid (confirmed/false_positive/resolved/pending)", nil)
	}

	updaterID := middleware.GetUserID(ctx)
	t, err := c.svc.UpdateStatus(id, req, updaterID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal update status", err.Error())
	}
	return response.Success(ctx, "Status threat berhasil diupdate", t)
}

// DELETE /api/v1/threats/:id
func (c *Controller) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	updaterID := middleware.GetUserID(ctx)
	if err := c.svc.Delete(id, updaterID); err != nil {
		return response.InternalServerError(ctx, "Gagal menghapus threat", err.Error())
	}
	return response.Success(ctx, "Threat berhasil dihapus", nil)
}

// GET /api/v1/threats/stats
func (c *Controller) Stats(ctx *fiber.Ctx) error {
	stats, err := c.svc.Stats()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil statistik threats", err.Error())
	}
	return response.Success(ctx, "Statistik threats", stats)
}

// GET /api/v1/threats/stats/fakultas/:id
func (c *Controller) StatsByFakultas(ctx *fiber.Ctx) error {
	fakID := ctx.Params("id")
	if fakID == "" {
		return response.BadRequest(ctx, "Fakultas ID diperlukan", nil)
	}
	items, err := c.svc.StatsByFakultas(fakID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil detail fakultas", err.Error())
	}
	return response.Success(ctx, "Detail fakultas", items)
}
