package nilai

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for nilai
type Handler struct {
	service Service
}

// NewHandler creates a new nilai handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// ========================================
// KHS Handlers
// ========================================

func (h *Handler) GetKHSList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	idSemester := c.Query("id_semester", "")
	nim := c.Query("nim", "")

	result, err := h.service.GetKHSList(c.Context(), page, limit, search, idSemester, nim)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KHS list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncKHS(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKHS(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KHS sync completed",
		"data":    result,
	})
}

// ========================================
// Transkrip Handlers
// ========================================

func (h *Handler) GetTranskripList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	nim := c.Query("nim", "")

	result, err := h.service.GetTranskripList(c.Context(), page, limit, search, nim)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transkrip list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncTranskrip(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncTranskrip(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transkrip sync completed",
		"data":    result,
	})
}

// ========================================
// Kuliah Handlers
// ========================================

func (h *Handler) GetKuliahList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	idSemester := c.Query("id_semester", "")
	nim := c.Query("nim", "")

	result, err := h.service.GetKuliahList(c.Context(), page, limit, search, idSemester, nim)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kuliah list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncKuliah(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKuliah(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kuliah sync completed",
		"data":    result,
	})
}
