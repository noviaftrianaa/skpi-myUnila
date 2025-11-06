package riwayat_pekerjaan

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Controller handles HTTP requests for riwayat pekerjaan using Fiber
type Controller struct {
	service *Service
}

// NewController creates a new Controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetRwyPekerjaanList handles GET /public/riwayat-pekerjaan/list
func (c *Controller) GetRwyPekerjaanList(ctx *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	sortBy := ctx.Query("sort_by", "last_sync")
	sortOrder := ctx.Query("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	log.Printf("📋 GET /riwayat-pekerjaan/list - page: %d, limit: %d, search: %s, sort_by: %s, sort_order: %s",
		page, limit, search, sortBy, sortOrder)

	result, err := c.service.GetRwyPekerjaanList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Error getting riwayat pekerjaan list: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// GetRwyPekerjaanDetail handles GET /public/riwayat-pekerjaan/:id
func (c *Controller) GetRwyPekerjaanDetail(ctx *fiber.Ctx) error {
	idRwyKerja := ctx.Params("id")

	log.Printf("🔍 GET /riwayat-pekerjaan/%s", idRwyKerja)

	result, err := c.service.GetRwyPekerjaanByID(idRwyKerja)
	if err != nil {
		log.Printf("❌ Error getting riwayat pekerjaan: %v", err)
		status := fiber.StatusInternalServerError
		if err.Error() == "rwy_pekerjaan not found" {
			status = fiber.StatusNotFound
		}
		return ctx.Status(status).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// GetRwyPekerjaanStats handles GET /public/riwayat-pekerjaan/stats
func (c *Controller) GetRwyPekerjaanStats(ctx *fiber.Ctx) error {
	log.Printf("📊 GET /riwayat-pekerjaan/stats")

	stats, err := c.service.GetRwyPekerjaanStats()
	if err != nil {
		log.Printf("❌ Error getting riwayat pekerjaan stats: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// SyncRwyPekerjaanByIDSDM handles POST /api/v1/riwayat-pekerjaan/sync
func (c *Controller) SyncRwyPekerjaanByIDSDM(ctx *fiber.Ctx) error {
	var request struct {
		IDSDM string `json:"id_sdm"`
	}

	if err := ctx.BodyParser(&request); err != nil {
		log.Printf("❌ Invalid request body: %v", err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if request.IDSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm is required",
		})
	}

	log.Printf("🔄 POST /riwayat-pekerjaan/sync - id_sdm: %s", request.IDSDM)

	result, err := c.service.SyncRwyPekerjaanByIDSDM(request.IDSDM, "manual")
	if err != nil {
		log.Printf("❌ Error syncing riwayat pekerjaan: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
			"data":    result,
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Riwayat pekerjaan sync completed",
		"data":    result,
	})
}

// BatchSyncAllRwyPekerjaan handles POST /api/v1/riwayat-pekerjaan/sync-all
func (c *Controller) BatchSyncAllRwyPekerjaan(ctx *fiber.Ctx) error {
	log.Printf("🚀 POST /riwayat-pekerjaan/sync-all")

	result, err := c.service.BatchSyncAllRwyPekerjaan("manual")
	if err != nil {
		log.Printf("❌ Error batch syncing riwayat pekerjaan: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Batch riwayat pekerjaan sync completed",
		"data":    result,
	})
}
