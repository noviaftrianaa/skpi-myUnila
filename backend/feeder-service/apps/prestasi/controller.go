package prestasi

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetList returns paginated list of prestasi
// @Summary Get prestasi list
// @Tags Prestasi
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search by NIM, nama mahasiswa, or nama prestasi"
// @Param tahun_prestasi query int false "Filter by tahun prestasi"
// @Param id_prodi query string false "Filter by prodi"
// @Param order_by query string false "Order by field"
// @Param order_dir query string false "Order direction (ASC/DESC)"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/prestasi [get]
func (c *Controller) GetList(ctx *fiber.Ctx) error {
	filter := &ListFilter{}
	if err := ctx.QueryParser(filter); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid filter parameters",
			"error":   err.Error(),
		})
	}

	result, err := c.service.GetList(ctx.Context(), filter)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get prestasi list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Prestasi list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetStats returns prestasi statistics
// @Summary Get prestasi statistics
// @Tags Prestasi
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/prestasi/stats [get]
func (c *Controller) GetStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetStats(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get prestasi stats",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Prestasi stats retrieved successfully",
		"data":    stats,
	})
}

// GetTahunList returns list of available years
// @Summary Get tahun prestasi list for dropdown
// @Tags Prestasi
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/prestasi/tahun [get]
func (c *Controller) GetTahunList(ctx *fiber.Ctx) error {
	items, err := c.service.GetTahunList(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get tahun list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Tahun list retrieved successfully",
		"data":    items,
	})
}

// Sync triggers prestasi sync from Feeder API
// @Summary Sync prestasi from Feeder API
// @Tags Prestasi
// @Accept json
// @Produce json
// @Param body body SyncFilter false "Sync filter"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/prestasi/sync [post]
func (c *Controller) Sync(ctx *fiber.Ctx) error {
	filter := &SyncFilter{}
	if err := ctx.BodyParser(filter); err != nil {
		// Allow empty body for sync all
		filter = nil
	}

	// Get user info from query param (if available)
	triggeredBy := "system"
	if syncedBy := ctx.Query("synced_by"); syncedBy != "" {
		triggeredBy = syncedBy
	}

	result, err := c.service.SyncPrestasi(ctx.Context(), filter, triggeredBy)
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
