package scheduler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes registers scheduler routes
func RegisterRoutes(router fiber.Router, handler *Handler) {
	schedules := router.Group("/schedules")

	schedules.Get("/", handler.GetAll)
	schedules.Get("/:id", handler.GetByID)
	schedules.Post("/", handler.Create)
	schedules.Put("/:id", handler.Update)
	schedules.Delete("/:id", handler.Delete)
	schedules.Patch("/:id/toggle", handler.Toggle)
}

// GetAll retrieves all schedules
// @Summary Get all scheduled syncs
// @Tags Scheduler
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param sync_type query string false "Filter by sync type (mahasiswa, aktivitas_mahasiswa, kurikulum)" default(mahasiswa)
// @Param is_active query bool false "Filter by active status"
// @Success 200 {object} ScheduledSyncListResponse
// @Router /schedules [get]
func (h *Handler) GetAll(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	syncType := c.Query("sync_type", "mahasiswa")

	var isActive *bool
	if c.Query("is_active") != "" {
		val, _ := strconv.ParseBool(c.Query("is_active"))
		isActive = &val
	}

	response, err := h.service.GetAll(page, limit, syncType, isActive)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// GetByID retrieves a schedule by ID
// @Summary Get schedule by ID
// @Tags Scheduler
// @Param id path int true "Schedule ID"
// @Success 200 {object} ScheduledSync
// @Router /schedules/{id} [get]
func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid schedule ID",
		})
	}

	schedule, err := h.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    schedule,
	})
}

// Create creates a new schedule
// @Summary Create a new scheduled sync
// @Tags Scheduler
// @Param request body CreateScheduledSyncRequest true "Schedule details"
// @Success 201 {object} ScheduledSync
// @Router /schedules [post]
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateScheduledSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	schedule, err := h.service.CreateSchedule(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Schedule created successfully",
		"data":    schedule,
	})
}

// Update updates an existing schedule
// @Summary Update a scheduled sync
// @Tags Scheduler
// @Param id path int true "Schedule ID"
// @Param request body UpdateScheduledSyncRequest true "Schedule details"
// @Success 200 {object} ScheduledSync
// @Router /schedules/{id} [put]
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid schedule ID",
		})
	}

	var req UpdateScheduledSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	schedule, err := h.service.UpdateSchedule(id, req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Schedule updated successfully",
		"data":    schedule,
	})
}

// Delete deletes a schedule
// @Summary Delete a scheduled sync
// @Tags Scheduler
// @Param id path int true "Schedule ID"
// @Success 200
// @Router /schedules/{id} [delete]
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid schedule ID",
		})
	}

	if err := h.service.DeleteSchedule(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Schedule deleted successfully",
	})
}

// Toggle toggles schedule active status
// @Summary Toggle schedule active status
// @Tags Scheduler
// @Param id path int true "Schedule ID"
// @Param is_active query bool true "Active status"
// @Success 200
// @Router /schedules/{id}/toggle [patch]
func (h *Handler) Toggle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid schedule ID",
		})
	}

	isActive, err := strconv.ParseBool(c.Query("is_active"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid is_active parameter",
		})
	}

	if err := h.service.ToggleSchedule(id, isActive); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Schedule toggled successfully",
	})
}
