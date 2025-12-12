package unit_organisasi

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler for unit organisasi endpoints
type Handler struct {
	svc Service
}

// NewHandler creates a new unit organisasi handler
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetStats returns statistics for dashboard
func (h *Handler) GetStats(c *fiber.Ctx) error {
	ctx := c.Context()

	stats, err := h.svc.GetStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Statistics retrieved successfully",
		"data":    stats,
	})
}

// GetSMSList returns paginated list of SMS (source data)
func (h *Handler) GetSMSList(c *fiber.Ctx) error {
	ctx := c.Context()

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.svc.GetSMSList(ctx, page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get SMS list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "SMS list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetUnitOrganisasiList returns paginated list of unit organisasi
func (h *Handler) GetUnitOrganisasiList(c *fiber.Ctx) error {
	ctx := c.Context()

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.svc.GetUnitOrganisasiList(ctx, page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get unit organisasi list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Unit organisasi list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// SyncFromSMS syncs data from pdrd.sms to man_akses.unit_organisasi
func (h *Handler) SyncFromSMS(c *fiber.Ctx) error {
	ctx := c.Context()
	syncedBy := c.Query("synced_by", "system")

	result, err := h.svc.SyncFromSMS(ctx, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Sync failed",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync completed successfully",
		"data":    result,
	})
}

// GetComparisonList returns comparison between SMS and unit_organisasi
func (h *Handler) GetComparisonList(c *fiber.Ctx) error {
	ctx := c.Context()

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	filter := c.Query("filter", "") // "", "synced", "not_synced"

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.svc.GetComparisonList(ctx, page, limit, search, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get comparison list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Comparison list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}
