package wisuda

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for wisuda
type Handler struct {
	service Service
}

// NewHandler creates a new wisuda handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetWisudaList handles GET /api/v1/siakadu/wisuda
func (h *Handler) GetWisudaList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	filter := &WisudaListFilter{
		Page:      page,
		Limit:     limit,
		Search:    c.Query("search", ""),
		IdPeriode: c.Query("id_periode", ""),
		IdUnit:    c.Query("id_unit", ""),
		Angkatan:  c.Query("angkatan", ""),
		SortBy:    c.Query("sort_by", "nama"),
		SortOrder: c.Query("sort_order", "asc"),
	}

	result, err := h.service.GetWisudaList(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Wisuda list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetWisudaStats handles GET /api/v1/siakadu/wisuda/stats
func (h *Handler) GetWisudaStats(c *fiber.Ctx) error {
	stats, err := h.service.GetWisudaStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Wisuda stats retrieved successfully",
		"data":    stats,
	})
}

// GetWisudaFilters handles GET /api/v1/siakadu/wisuda/filters
func (h *Handler) GetWisudaFilters(c *fiber.Ctx) error {
	options, err := h.service.GetWisudaFilterOptions(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Wisuda filter options retrieved successfully",
		"data":    options,
	})
}

// SyncWisuda handles POST /api/v1/siakadu/wisuda/sync
func (h *Handler) SyncWisuda(c *fiber.Ctx) error {
	syncedBy := c.Get("X-User-ID", "system")

	result, err := h.service.SyncWisuda(c.Context(), syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Wisuda sync completed",
		"data":    result,
	})
}
