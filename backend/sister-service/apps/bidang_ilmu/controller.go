package bidang_ilmu

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

// Controller handles HTTP requests for bidang ilmu
type Controller struct {
	service Service
}

// NewController creates a new bidang ilmu controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetStats handles GET /bidang-ilmu/stats
func (ctrl *Controller) GetStats(c *fiber.Ctx) error {
	stats, err := ctrl.service.GetStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve bidang ilmu statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bidang ilmu statistics retrieved successfully",
		"data":    stats,
	})
}

// GetList handles GET /bidang-ilmu/list
func (ctrl *Controller) GetList(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	sortBy := c.Query("sort_by", "last_sync")
	sortOrder := c.Query("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	log.Printf("📋 GET /bidang-ilmu/list - page: %d, limit: %d, search: '%s', sort_by: %s, sort_order: %s",
		page, limit, search, sortBy, sortOrder)

	result, err := ctrl.service.GetList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve bidang ilmu list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bidang ilmu list retrieved successfully",
		"data":    result,
	})
}

// GetByIDSDM handles GET /bidang-ilmu/dosen/:id_sdm
func (ctrl *Controller) GetByIDSDM(c *fiber.Ctx) error {
	idSDM := c.Params("id_sdm")

	if idSDM == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	items, err := ctrl.service.GetByIDSDM(idSDM)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve bidang ilmu for dosen",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bidang ilmu retrieved successfully",
		"data":    items,
	})
}

// SyncSingle handles POST /bidang-ilmu/sync/:id_sdm
func (ctrl *Controller) SyncSingle(c *fiber.Ctx) error {
	idSDM := c.Params("id_sdm")
	syncedBy := c.Query("synced_by", "system")

	if idSDM == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	result, err := ctrl.service.SyncBidangIlmuByIDSDM(idSDM, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync bidang ilmu",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bidang ilmu synced successfully",
		"data":    result,
	})
}

// SyncAll handles POST /bidang-ilmu/sync-all
func (ctrl *Controller) SyncAll(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", "system")

	if syncedBy == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "synced_by parameter is required",
		})
	}

	result, err := ctrl.service.SyncAllDosen(syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync all bidang ilmu",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Batch sync completed",
		"data":    result,
	})
}
