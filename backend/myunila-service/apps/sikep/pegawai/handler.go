package pegawai

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for pegawai
type Handler struct {
	service Service
}

// NewHandler creates a new pegawai handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetPegawaiList handles GET /api/v1/sikep/pegawai
// @Summary Get paginated list of pegawai
// @Description Get paginated list of pegawai with optional filters
// @Tags SIKEP - Pegawai
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name, NIP, or NIDN"
// @Param jns_tenaga query string false "Filter by jenis tenaga"
// @Param status query string false "Filter by status"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/sikep/pegawai [get]
func (h *Handler) GetPegawaiList(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "asc")

	var jnsTenaga, status *string
	if jt := c.Query("jns_tenaga"); jt != "" {
		jnsTenaga = &jt
	}
	if st := c.Query("status"); st != "" {
		status = &st
	}

	// Get data
	result, err := h.service.GetPegawaiList(c.Context(), page, limit, search, jnsTenaga, status, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pegawai list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetPegawaiByID handles GET /api/v1/sikep/pegawai/:id
// @Summary Get pegawai by ID
// @Description Get pegawai details by ID
// @Tags SIKEP - Pegawai
// @Accept json
// @Produce json
// @Param id path string true "Pegawai ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/sikep/pegawai/{id} [get]
func (h *Handler) GetPegawaiByID(c *fiber.Ctx) error {
	idPegawai := c.Params("id")

	pegawai, err := h.service.GetPegawaiByID(c.Context(), idPegawai)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pegawai retrieved successfully",
		"data":    pegawai,
	})
}

// GetPegawaiStats handles GET /api/v1/sikep/pegawai/stats
// @Summary Get pegawai statistics
// @Description Get pegawai statistics for dashboard
// @Tags SIKEP - Pegawai
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/sikep/pegawai/stats [get]
func (h *Handler) GetPegawaiStats(c *fiber.Ctx) error {
	stats, err := h.service.GetPegawaiStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pegawai stats retrieved successfully",
		"data":    stats,
	})
}

// SyncPegawai handles POST /api/v1/sikep/pegawai/sync
// @Summary Sync pegawai from SIKEP API
// @Description Sync pegawai data from SIKEP API
// @Tags SIKEP - Pegawai
// @Accept json
// @Produce json
// @Param body body SyncFilter false "Sync filter"
// @Param synced_by query string false "User who initiated the sync"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/sikep/pegawai/sync [post]
func (h *Handler) SyncPegawai(c *fiber.Ctx) error {
	// Parse request body
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		// Use default values if no body
		filter = SyncFilter{
			Start: 1,
			Limit: 100,
		}
	}

	// Get user ID from query param, header, or default
	syncedBy := c.Query("synced_by", "")
	if syncedBy == "" {
		syncedBy = c.Get("X-User-ID", "system")
	}

	// Perform sync
	result, err := h.service.SyncPegawai(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pegawai sync completed",
		"data":    result,
	})
}
