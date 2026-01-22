package spp_mhs

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetSppMhsList returns paginated SPP Mahasiswa list
func (ctrl *Controller) GetSppMhsList(c *fiber.Ctx) error {
	ctx := c.Context()

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	var npm *string
	if n := c.Query("npm"); n != "" {
		npm = &n
	}

	var idSmt *string
	if s := c.Query("id_smt"); s != "" {
		idSmt = &s
	}

	result, err := ctrl.service.GetSppMhsList(ctx, page, limit, npm, idSmt)
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

// GetSppMhsByID returns a single SPP Mhs by ID
func (ctrl *Controller) GetSppMhsByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	result, err := ctrl.service.GetSppMhsByID(ctx, id)
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

// GetSppMhsByNPM returns all SPP records for a student
func (ctrl *Controller) GetSppMhsByNPM(c *fiber.Ctx) error {
	ctx := c.Context()
	npm := c.Params("npm")

	if npm == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "npm is required",
		})
	}

	result, err := ctrl.service.GetSppMhsByNPM(ctx, npm)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"total":   len(result),
	})
}

// GetMahasiswaPaymentSummary returns payment summary for a student
func (ctrl *Controller) GetMahasiswaPaymentSummary(c *fiber.Ctx) error {
	ctx := c.Context()
	npm := c.Params("npm")

	if npm == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "npm is required",
		})
	}

	result, err := ctrl.service.GetMahasiswaPaymentSummary(ctx, npm)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	if result == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "No payment data found for this student",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// GetStats returns statistics for SPP Mahasiswa
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

// SyncSppMhs triggers sync from SIMPEDAM
func (ctrl *Controller) SyncSppMhs(c *fiber.Ctx) error {
	ctx := c.Context()

	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		// Allow empty body for sync all
		filter = SyncFilter{}
	}

	// Get synced_by from header or default
	syncedBy := c.Get("X-User-ID", "system")

	result, err := ctrl.service.SyncSppMhs(ctx, &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync completed",
		"data":    result,
	})
}
