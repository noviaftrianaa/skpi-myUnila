package scheduler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Router struct {
	service *Service
}

func NewRouter(service *Service) *Router {
	return &Router{service: service}
}

// RegisterRoutes registers all scheduler routes
func (r *Router) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/schedules")
	schedules := app.Group("/schedules")

	// Public routes (no auth required)
	schedules.Get("/", r.getAll)
	schedules.Get("/:id", r.getByID)
	schedules.Post("/", r.create)
	schedules.Put("/:id", r.update)
	schedules.Delete("/:id", r.delete)
	schedules.Post("/:id/toggle", r.toggle)

	// API routes (same as public for now)
	api.Get("/", r.getAll)
	api.Get("/:id", r.getByID)
	api.Post("/", r.create)
	api.Put("/:id", r.update)
	api.Delete("/:id", r.delete)
	api.Post("/:id/toggle", r.toggle)
}

// getAll retrieves all scheduled syncs
// GET /public/schedules?page=1&limit=10&sync_type=dosen&is_active=true
func (r *Router) getAll(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	syncType := c.Query("sync_type", "")

	var isActive *bool
	if c.Query("is_active") != "" {
		active := c.Query("is_active") == "true"
		isActive = &active
	}

	response, err := r.service.GetAll(page, limit, syncType, isActive)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get schedules",
			"message": err.Error(),
		})
	}

	return c.JSON(response)
}

// getByID retrieves a schedule by ID
// GET /public/schedules/:id
func (r *Router) getByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid schedule ID",
		})
	}

	schedule, err := r.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Schedule not found",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data": schedule,
	})
}

// create creates a new scheduled sync
// POST /public/schedules
func (r *Router) create(c *fiber.Ctx) error {
	var req CreateScheduledSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	schedule, err := r.service.CreateSchedule(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to create schedule",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Schedule created successfully",
		"data":    schedule,
	})
}

// update updates a scheduled sync
// PUT /public/schedules/:id
func (r *Router) update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid schedule ID",
		})
	}

	var req UpdateScheduledSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	schedule, err := r.service.UpdateSchedule(id, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to update schedule",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Schedule updated successfully",
		"data":    schedule,
	})
}

// delete deletes a scheduled sync
// DELETE /public/schedules/:id
func (r *Router) delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid schedule ID",
		})
	}

	if err := r.service.DeleteSchedule(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to delete schedule",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Schedule deleted successfully",
	})
}

// toggle toggles a schedule's active status
// POST /public/schedules/:id/toggle
func (r *Router) toggle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid schedule ID",
		})
	}

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	if err := r.service.ToggleSchedule(id, req.IsActive); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to toggle schedule",
			"message": err.Error(),
		})
	}

	status := "inactive"
	if req.IsActive {
		status = "active"
	}

	return c.JSON(fiber.Map{
		"message": "Schedule is now " + status,
	})
}
