package riwayat_fungsional

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Controller handles HTTP requests for riwayat fungsional using Fiber
type Controller struct {
	service *Service
}

// NewController creates a new Controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetRwyFungsionalList handles GET /jabatan-fungsional/list
func (c *Controller) GetRwyFungsionalList(ctx *fiber.Ctx) error {
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

	log.Printf("📋 GET /jabatan-fungsional/list - page: %d, limit: %d, search: %s, sort_by: %s, sort_order: %s",
		page, limit, search, sortBy, sortOrder)

	result, err := c.service.GetRwyFungsionalList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Error getting riwayat fungsional list: %v", err)
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

// GetRwyFungsionalDetail handles GET /jabatan-fungsional/:id
func (c *Controller) GetRwyFungsionalDetail(ctx *fiber.Ctx) error {
	idRwyJabfung := ctx.Params("id")

	log.Printf("🔍 GET /jabatan-fungsional/%s", idRwyJabfung)

	result, err := c.service.GetRwyFungsionalByID(idRwyJabfung)
	if err != nil {
		log.Printf("❌ Error getting riwayat fungsional: %v", err)
		status := fiber.StatusInternalServerError
		if err.Error() == "rwy_fungsional not found" {
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

// GetRwyFungsionalStats handles GET /jabatan-fungsional/stats
func (c *Controller) GetRwyFungsionalStats(ctx *fiber.Ctx) error {
	log.Printf("📊 GET /jabatan-fungsional/stats")

	stats, err := c.service.GetRwyFungsionalStats()
	if err != nil {
		log.Printf("❌ Error getting riwayat fungsional stats: %v", err)
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

// SyncRwyFungsionalByIDSDM handles POST /api/v1/jabatan-fungsional/sync
func (c *Controller) SyncRwyFungsionalByIDSDM(ctx *fiber.Ctx) error {
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

	log.Printf("🔄 POST /jabatan-fungsional/sync - id_sdm: %s", request.IDSDM)

	result, err := c.service.SyncRwyFungsionalByIDSDM(request.IDSDM, "manual")
	if err != nil {
		log.Printf("❌ Error syncing riwayat fungsional: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
			"data":    result,
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Riwayat fungsional sync completed",
		"data":    result,
	})
}

// BatchSyncAllRwyFungsional handles POST /api/v1/jabatan-fungsional/sync-all
func (c *Controller) BatchSyncAllRwyFungsional(ctx *fiber.Ctx) error {
	log.Printf("🚀 POST /jabatan-fungsional/sync-all")

	result, err := c.service.BatchSyncAllRwyFungsional("manual")
	if err != nil {
		log.Printf("❌ Error batch syncing riwayat fungsional: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Batch riwayat fungsional sync completed",
		"data":    result,
	})
}
