package radius

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for radius/pengguna
type Handler struct {
	service Service
}

// NewHandler creates a new radius handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetPenggunaList handles GET /api/v1/radius/pengguna
// @Summary Get paginated list of pengguna
// @Description Get paginated list of pengguna with optional filters
// @Tags Radius - Pengguna
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by username, name, or email"
// @Param status query string false "Filter by status (aktif/nonaktif)"
// @Param has_sso query string false "Filter by SSO status (yes/no)"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/pengguna [get]
func (h *Handler) GetPenggunaList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	var status, hasSso *string
	if s := c.Query("status"); s != "" {
		status = &s
	}
	if sso := c.Query("has_sso"); sso != "" {
		hasSso = &sso
	}

	result, err := h.service.GetPenggunaList(c.Context(), page, limit, search, status, hasSso)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pengguna list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetPenggunaByID handles GET /api/v1/radius/pengguna/:id
// @Summary Get pengguna by ID
// @Description Get pengguna details by ID
// @Tags Radius - Pengguna
// @Accept json
// @Produce json
// @Param id path string true "Pengguna ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/pengguna/{id} [get]
func (h *Handler) GetPenggunaByID(c *fiber.Ctx) error {
	idPengguna := c.Params("id")

	pengguna, err := h.service.GetPenggunaByID(c.Context(), idPengguna)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pengguna retrieved successfully",
		"data":    pengguna,
	})
}

// GetPenggunaStats handles GET /api/v1/radius/pengguna/stats
// @Summary Get pengguna statistics
// @Description Get pengguna statistics for dashboard
// @Tags Radius - Pengguna
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/pengguna/stats [get]
func (h *Handler) GetPenggunaStats(c *fiber.Ctx) error {
	stats, err := h.service.GetPenggunaStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pengguna stats retrieved successfully",
		"data":    stats,
	})
}

// GetRadiusStats handles GET /api/v1/radius/stats
// @Summary Get Radius SSO statistics
// @Description Get statistics from Radius SSO API
// @Tags Radius - Stats
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/stats [get]
func (h *Handler) GetRadiusStats(c *fiber.Ctx) error {
	stats, err := h.service.GetRadiusStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Radius stats retrieved successfully",
		"data":    stats,
	})
}

// SyncFromRadius handles POST /api/v1/radius/sync
// @Summary Sync pengguna from Radius SSO API
// @Description Sync pengguna data from Radius SSO API
// @Tags Radius - Sync
// @Accept json
// @Produce json
// @Param body body SyncFilter false "Sync filter"
// @Param synced_by query string false "User who initiated the sync"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/sync [post]
func (h *Handler) SyncFromRadius(c *fiber.Ctx) error {
	// Parse request body
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		// Use default values if no body
		filter = SyncFilter{
			SyncType: "manual",
		}
	}

	// Get user ID from query param, header, or default
	syncedBy := c.Query("synced_by", "")
	if syncedBy == "" {
		syncedBy = c.Get("X-User-ID", "system")
	}

	// Perform sync
	result, err := h.service.SyncFromRadius(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Radius sync completed",
		"data":    result,
	})
}
