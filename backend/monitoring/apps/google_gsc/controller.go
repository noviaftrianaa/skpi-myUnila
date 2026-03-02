package google_gsc

import (
	"monitoring-service/internal/middleware"
	"monitoring-service/pkg/response"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// POST /api/v1/gsc/remove
func (c *Controller) SubmitRemoval(ctx *fiber.Ctx) error {
	var req RemoveURLRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	if req.URL == "" || req.ThreatID == 0 {
		return response.BadRequest(ctx, "url dan threat_id wajib diisi", "")
	}

	submittedBy := middleware.GetUserID(ctx)
	result, err := c.svc.SubmitRemoval(req, submittedBy)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal submit URL removal", err.Error())
	}
	return response.Success(ctx, "URL removal submitted", result)
}

// POST /api/v1/gsc/recrawl
func (c *Controller) SubmitRecrawl(ctx *fiber.Ctx) error {
	var req RemoveURLRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	if req.URL == "" || req.ThreatID == 0 {
		return response.BadRequest(ctx, "url dan threat_id wajib diisi", "")
	}

	submittedBy := middleware.GetUserID(ctx)
	result, err := c.svc.SubmitRecrawl(req, submittedBy)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal submit recrawl", err.Error())
	}
	return response.Success(ctx, "Recrawl request submitted", result)
}

// GET /api/v1/gsc/logs
func (c *Controller) ListLogs(ctx *fiber.Ctx) error {
	var f LogFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	list, total, err := c.svc.ListLogs(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil GSC logs", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	return response.Paginated(ctx, "GSC logs", list, total, page, limit)
}

// GET /api/v1/gsc/quota
func (c *Controller) GetQuota(ctx *fiber.Ctx) error {
	quota, err := c.svc.GetQuota()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil quota", err.Error())
	}
	return response.Success(ctx, "GSC quota status", quota)
}

// POST /api/v1/gsc/remove-threat/:id  (shortcut: remove by threat ID)
func (c *Controller) RemoveByThreatID(ctx *fiber.Ctx) error {
	idStr := ctx.Params("id")
	threatID, err := strconv.Atoi(idStr)
	if err != nil {
		return response.BadRequest(ctx, "Invalid threat ID", "")
	}

	var body struct {
		URL string `json:"url"`
	}
	if err := ctx.BodyParser(&body); err != nil || body.URL == "" {
		return response.BadRequest(ctx, "url wajib diisi", "")
	}

	req := RemoveURLRequest{ThreatID: threatID, URL: body.URL, Action: "URL_DELETED"}
	submittedBy := middleware.GetUserID(ctx)
	result, err := c.svc.SubmitRemoval(req, submittedBy)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal submit removal", err.Error())
	}
	return response.Success(ctx, "URL removal submitted", result)
}
