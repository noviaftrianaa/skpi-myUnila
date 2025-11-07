package sertifikasi_dosen

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// SyncSertifikasiByIDSDM handles manual sync for specific dosen
func (c *Controller) SyncSertifikasiByIDSDM(ctx *fiber.Ctx) error {
	idSDM := ctx.Query("id_sdm")
	if idSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm is required",
		})
	}

	log.Printf("📥 Manual sync request for sertifikasi dosen: %s", idSDM)

	result, err := c.service.SyncSertifikasiByIDSDM(idSDM)
	if err != nil {
		log.Printf("❌ Sync failed for %s: %v", idSDM, err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Sertifikasi sync completed",
		"data":    result,
	})
}

// BatchSyncAllSertifikasi handles batch sync for all dosen
func (c *Controller) BatchSyncAllSertifikasi(ctx *fiber.Ctx) error {
	syncedBy := ctx.Query("synced_by", "system")

	log.Printf("📥 Batch sync all sertifikasi request - triggered by: %s", syncedBy)

	result, err := c.service.BatchSyncAllSertifikasi(syncedBy)
	if err != nil {
		log.Printf("❌ Batch sync failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Batch sync completed",
		"data":    result,
	})
}

// GetSertifikasiStats retrieves statistics
func (c *Controller) GetSertifikasiStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetSertifikasiStats()
	if err != nil {
		log.Printf("❌ Failed to get sertifikasi stats: %v", err)
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

// GetSertifikasiList retrieves paginated list
func (c *Controller) GetSertifikasiList(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	sortBy := ctx.Query("sort_by", "last_sync")
	sortOrder := ctx.Query("sort_order", "desc")

	// Validate page and limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	result, err := c.service.GetSertifikasiList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Failed to get sertifikasi list: %v", err)
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

// GetSertifikasiDetail retrieves detail by ID
func (c *Controller) GetSertifikasiDetail(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id is required",
		})
	}

	detail, err := c.service.GetSertifikasiDetail(id)
	if err != nil {
		log.Printf("❌ Failed to get sertifikasi detail for %s: %v", id, err)
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"data":    detail,
	})
}
