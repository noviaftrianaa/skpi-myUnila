package settings

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

// GET /api/v1/settings
func (c *Controller) List(ctx *fiber.Ctx) error {
	group := ctx.Query("group")
	var list []*Setting
	var err error
	if group != "" {
		list, err = c.svc.ListByGroup(group)
	} else {
		list, err = c.svc.ListAll()
	}
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil settings", err.Error())
	}
	return response.Success(ctx, "Settings berhasil diambil", list)
}

// GET /api/v1/settings/:id
func (c *Controller) GetByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	s, err := c.svc.GetByID(id)
	if err != nil {
		return response.NotFound(ctx, "Setting tidak ditemukan")
	}
	return response.Success(ctx, "Setting berhasil diambil", s)
}

// PUT /api/v1/settings/:id
func (c *Controller) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	var req UpdateSettingRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	updaterID := middleware.GetUserID(ctx)
	if err := c.svc.Update(id, req.SettingValue, updaterID); err != nil {
		return response.InternalServerError(ctx, "Gagal mengupdate setting", err.Error())
	}
	return response.Success(ctx, "Setting berhasil diupdate", nil)
}

// PUT /api/v1/settings/bulk
func (c *Controller) BulkUpdate(ctx *fiber.Ctx) error {
	var req BulkUpdateRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	if len(req.Settings) == 0 {
		return response.BadRequest(ctx, "Tidak ada settings untuk diupdate", nil)
	}
	updaterID := middleware.GetUserID(ctx)
	if err := c.svc.BulkUpdate(req.Settings, updaterID); err != nil {
		return response.InternalServerError(ctx, "Gagal mengupdate settings", err.Error())
	}
	return response.Success(ctx, "Settings berhasil diupdate", nil)
}
