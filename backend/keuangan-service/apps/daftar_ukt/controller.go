package daftar_ukt

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetDaftarUKTList returns paginated DaftarUKT list
func (ctrl *Controller) GetDaftarUKTList(c *fiber.Ctx) error {
	ctx := c.Context()

	tahun := c.QueryInt("tahun", 0)
	idProdiSimpedam := c.Query("id_prodi_simpedam", "")
	kodeStrata := c.QueryInt("kode_strata", 0)
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	result, err := ctrl.service.GetDaftarUKTList(ctx, tahun, idProdiSimpedam, kodeStrata, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success":     true,
		"data":        result.Data,
		"total":       result.Total,
		"page":        result.Page,
		"limit":       result.Limit,
		"total_pages": result.TotalPages,
	})
}

// GetDaftarUKTByID returns a single DaftarUKT by ID
func (ctrl *Controller) GetDaftarUKTByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	result, err := ctrl.service.GetDaftarUKTByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// SyncDaftarUKT triggers sync from SIMPEDAM (async - returns immediately)
func (ctrl *Controller) SyncDaftarUKT(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if filter.Tahun == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "tahun is required",
		})
	}

	// Get synced_by from body, header, or default
	syncedBy := filter.SyncedBy
	if syncedBy == "" {
		syncedBy = c.Get("X-User-ID", "system")
	}

	// Start async sync and get sync_id immediately
	syncID, err := ctrl.service.StartAsyncSync(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync started in background",
		"data": fiber.Map{
			"sync_id": syncID,
			"status":  "processing",
		},
	})
}

// GetProdiMappings returns all prodi mappings
func (ctrl *Controller) GetProdiMappings(c *fiber.Ctx) error {
	ctx := c.Context()

	mappings, err := ctrl.service.GetProdiMappings(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    mappings,
		"total":   len(mappings),
	})
}

// GetStats returns statistics for DaftarUKT
func (ctrl *Controller) GetStats(c *fiber.Ctx) error {
	ctx := c.Context()

	stats, err := ctrl.service.GetStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// GetFakultasList returns list of fakultas for dropdown
func (ctrl *Controller) GetFakultasList(c *fiber.Ctx) error {
	ctx := c.Context()

	fakultas, err := ctrl.service.GetFakultasList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    fakultas,
	})
}

// GetProdiList returns list of prodi for dropdown
func (ctrl *Controller) GetProdiList(c *fiber.Ctx) error {
	ctx := c.Context()

	prodi, err := ctrl.service.GetProdiList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    prodi,
	})
}
