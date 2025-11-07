package jabatan_struktural

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Controller handles HTTP requests for jabatan struktural using Fiber
type Controller struct {
	service *Service
}

// NewController creates a new Controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetJabatanStrukturalList handles GET /public/jabatan-struktural/list
func (c *Controller) GetJabatanStrukturalList(ctx *fiber.Ctx) error {
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

	log.Printf("📋 GET /jabatan-struktural/list - page: %d, limit: %d, search: %s, sort_by: %s, sort_order: %s",
		page, limit, search, sortBy, sortOrder)

	result, err := c.service.GetRwyStrukturalList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Error getting jabatan struktural list: %v", err)
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

// GetJabatanStrukturalDetail handles GET /public/jabatan-struktural/:id
func (c *Controller) GetJabatanStrukturalDetail(ctx *fiber.Ctx) error {
	idRwyJabStruk := ctx.Params("id")

	log.Printf("🔍 GET /jabatan-struktural/%s", idRwyJabStruk)

	result, err := c.service.GetRwyStrukturalByID(idRwyJabStruk)
	if err != nil {
		log.Printf("❌ Error getting jabatan struktural: %v", err)
		status := fiber.StatusInternalServerError
		if err.Error() == "rwy_struktural not found" {
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

// GetJabatanStrukturalStats handles GET /public/jabatan-struktural/stats
func (c *Controller) GetJabatanStrukturalStats(ctx *fiber.Ctx) error {
	log.Printf("📊 GET /jabatan-struktural/stats")

	stats, err := c.service.GetRwyStrukturalStats()
	if err != nil {
		log.Printf("❌ Error getting jabatan struktural stats: %v", err)
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

// SyncJabatanStrukturalByIDSDM handles POST /api/v1/jabatan-struktural/sync
func (c *Controller) SyncJabatanStrukturalByIDSDM(ctx *fiber.Ctx) error {
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

	log.Printf("🔄 POST /jabatan-struktural/sync - id_sdm: %s", request.IDSDM)

	result, err := c.service.SyncJabatanStrukturalByIDSDM(request.IDSDM, "manual")
	if err != nil {
		log.Printf("❌ Error syncing jabatan struktural: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
			"data":    result,
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Jabatan struktural sync completed",
		"data":    result,
	})
}

// BatchSyncAllJabatanStruktural handles POST /api/v1/jabatan-struktural/sync-all
func (c *Controller) BatchSyncAllJabatanStruktural(ctx *fiber.Ctx) error {
	log.Printf("🚀 POST /jabatan-struktural/sync-all")

	result, err := c.service.BatchSyncAllJabatanStruktural("manual")
	if err != nil {
		log.Printf("❌ Error batch syncing jabatan struktural: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Batch jabatan struktural sync completed",
		"data":    result,
	})
}
