package transkrip_nilai

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// GetTranskripNilaiList handles GET /transkrip-nilai
func (c *Controller) GetTranskripNilaiList(ctx *fiber.Ctx) error {
	filter := &ListFilter{}
	if err := ctx.QueryParser(filter); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid query parameters",
			"error":   err.Error(),
		})
	}

	result, err := c.svc.GetList(ctx.Context(), filter)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get transkrip nilai list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetStats handles GET /transkrip-nilai/stats
func (c *Controller) GetStats(ctx *fiber.Ctx) error {
	stats, err := c.svc.GetStats(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get stats",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// GetProdiList handles GET /transkrip-nilai/helper/prodi
func (c *Controller) GetProdiList(ctx *fiber.Ctx) error {
	items, err := c.svc.GetProdiList(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get prodi list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    items,
	})
}

// GetSemesterList handles GET /transkrip-nilai/helper/semester
func (c *Controller) GetSemesterList(ctx *fiber.Ctx) error {
	items, err := c.svc.GetSemesterList(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get semester list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    items,
	})
}

// SyncTranskripNilai handles POST /transkrip-nilai/sync
func (c *Controller) SyncTranskripNilai(ctx *fiber.Ctx) error {
	filter := &SyncFilter{}
	if err := ctx.BodyParser(filter); err != nil {
		// If no body, use empty filter (sync all)
		filter = &SyncFilter{}
	}

	result, err := c.svc.SyncTranskripNilai(ctx.Context(), filter, "manual")
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Sync failed",
			"error":   err.Error(),
			"data":    result,
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": result.Message,
		"data":    result,
	})
}
