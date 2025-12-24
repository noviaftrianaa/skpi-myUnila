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

// ===========================
// SCHEDULER HANDLER METHODS
// ===========================

// GetSchedulers handles GET /api/v1/radius/schedulers
// @Summary Get paginated list of sync schedulers
// @Description Get paginated list of sync schedulers with optional filter by jenis_sync
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param jenis_sync query string false "Filter by jenis_sync (e.g., 'radius')"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers [get]
func (h *Handler) GetSchedulers(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	jenisSync := c.Query("jenis_sync", "")

	result, err := h.service.GetSchedulers(c.Context(), page, limit, jenisSync)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Schedulers retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetSchedulerByID handles GET /api/v1/radius/schedulers/:id
// @Summary Get scheduler by ID
// @Description Get scheduler details by ID
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param id path string true "Scheduler ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers/{id} [get]
func (h *Handler) GetSchedulerByID(c *fiber.Ctx) error {
	idScheduler := c.Params("id")

	scheduler, err := h.service.GetSchedulerByID(c.Context(), idScheduler)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Scheduler retrieved successfully",
		"data":    scheduler,
	})
}

// CreateScheduler handles POST /api/v1/radius/schedulers
// @Summary Create a new scheduler
// @Description Create a new sync scheduler
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param body body SyncScheduler true "Scheduler data"
// @Success 201 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers [post]
func (h *Handler) CreateScheduler(c *fiber.Ctx) error {
	var scheduler SyncScheduler
	if err := c.BodyParser(&scheduler); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	// Get user ID from header or default
	createdBy := c.Get("X-User-ID", "system")
	scheduler.CreatedBy = createdBy

	err := h.service.CreateScheduler(c.Context(), &scheduler)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Scheduler created successfully",
		"data":    scheduler,
	})
}

// UpdateScheduler handles PUT /api/v1/radius/schedulers/:id
// @Summary Update a scheduler
// @Description Update an existing scheduler
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param id path string true "Scheduler ID"
// @Param body body SyncScheduler true "Scheduler data"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers/{id} [put]
func (h *Handler) UpdateScheduler(c *fiber.Ctx) error {
	idScheduler := c.Params("id")

	var scheduler SyncScheduler
	if err := c.BodyParser(&scheduler); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	scheduler.IDScheduler = idScheduler

	err := h.service.UpdateScheduler(c.Context(), &scheduler)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Scheduler updated successfully",
		"data":    scheduler,
	})
}

// DeleteScheduler handles DELETE /api/v1/radius/schedulers/:id
// @Summary Delete a scheduler
// @Description Delete a scheduler (soft delete)
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param id path string true "Scheduler ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers/{id} [delete]
func (h *Handler) DeleteScheduler(c *fiber.Ctx) error {
	idScheduler := c.Params("id")

	err := h.service.DeleteScheduler(c.Context(), idScheduler)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Scheduler deleted successfully",
	})
}

// ToggleSchedulerActive handles PATCH /api/v1/radius/schedulers/:id/toggle
// @Summary Toggle scheduler active status
// @Description Toggle the active status of a scheduler
// @Tags Radius - Scheduler
// @Accept json
// @Produce json
// @Param id path string true "Scheduler ID"
// @Param body body map[string]int true "Active status (is_active: 0 or 1)"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/radius/schedulers/{id}/toggle [patch]
func (h *Handler) ToggleSchedulerActive(c *fiber.Ctx) error {
	idScheduler := c.Params("id")

	var body map[string]int
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	isActive, ok := body["is_active"]
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "is_active field is required",
		})
	}

	err := h.service.ToggleSchedulerActive(c.Context(), idScheduler, isActive)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Scheduler active status toggled successfully",
	})
}
