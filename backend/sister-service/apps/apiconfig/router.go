package apiconfig

import (
	"database/sql"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// RegisterRoutes registers API config routes
func RegisterRoutes(router fiber.Router, handler *Handler) {
	configs := router.Group("/api-configs")

	configs.Get("/", handler.GetAll)
	configs.Get("/:code", handler.GetByAPICode)
	configs.Post("/", handler.Create)
	configs.Put("/:id", handler.Update)
	configs.Delete("/:id", handler.Delete)
	configs.Post("/test-connection", handler.TestConnection)
	configs.Get("/:id/audit-logs", handler.GetAuditLogs)
}

// GetAll godoc
// @Summary Get all API configurations
// @Description Retrieve all active API configurations (without credentials)
// @Tags API Config
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api-configs [get]
func (h *Handler) GetAll(c *fiber.Ctx) error {
	configs, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve API configurations",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    configs,
	})
}

// GetByAPICode godoc
// @Summary Get API configuration by code
// @Description Retrieve specific API configuration by API code
// @Tags API Config
// @Produce json
// @Param code path string true "API Code"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api-configs/{code} [get]
func (h *Handler) GetByAPICode(c *fiber.Ctx) error {
	apiCode := c.Params("code")

	config, err := h.service.GetByAPICode(apiCode)
	if err != nil {
		status := fiber.StatusInternalServerError
		if err == sql.ErrNoRows {
			status = fiber.StatusNotFound
		}

		return c.Status(status).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve API configuration",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    config,
	})
}

// Create godoc
// @Summary Create new API configuration
// @Description Create a new API configuration with encrypted credentials
// @Tags API Config
// @Accept json
// @Produce json
// @Param request body CreateAPIConfigRequest true "API Config Request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api-configs [post]
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateAPIConfigRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	// Get user from context (JWT middleware should set this)
	userEmail := c.Locals("user_email")
	if userEmail == nil {
		userEmail = "system"
	}

	config, err := h.service.Create(req, userEmail.(string))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create API configuration",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "API configuration created successfully",
		"data":    config,
	})
}

// Update godoc
// @Summary Update API configuration
// @Description Update existing API configuration
// @Tags API Config
// @Accept json
// @Produce json
// @Param id path int true "Config ID"
// @Param request body UpdateAPIConfigRequest true "Update Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api-configs/{id} [put]
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid config ID",
			"error":   err.Error(),
		})
	}

	var req UpdateAPIConfigRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	// Get user from context
	userEmail := c.Locals("user_email")
	if userEmail == nil {
		userEmail = "system"
	}

	config, err := h.service.Update(id, req, userEmail.(string))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update API configuration",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "API configuration updated successfully",
		"data":    config,
	})
}

// Delete godoc
// @Summary Delete API configuration
// @Description Soft delete an API configuration
// @Tags API Config
// @Produce json
// @Param id path int true "Config ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api-configs/{id} [delete]
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid config ID",
			"error":   err.Error(),
		})
	}

	// Get user from context
	userEmail := c.Locals("user_email")
	if userEmail == nil {
		userEmail = "system"
	}

	if err := h.service.Delete(id, userEmail.(string)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete API configuration",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "API configuration deleted successfully",
	})
}

// TestConnection godoc
// @Summary Test API connection
// @Description Test connection to an API endpoint
// @Tags API Config
// @Accept json
// @Produce json
// @Param request body TestConnectionRequest true "Test Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api-configs/test-connection [post]
func (h *Handler) TestConnection(c *fiber.Ctx) error {
	var req TestConnectionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	result, err := h.service.TestConnection(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Test failed",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": result.Success,
		"data":    result,
	})
}

// GetAuditLogs godoc
// @Summary Get audit logs for config
// @Description Retrieve audit logs for a specific API configuration
// @Tags API Config
// @Produce json
// @Param id path int true "Config ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api-configs/{id}/audit-logs [get]
func (h *Handler) GetAuditLogs(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid config ID",
			"error":   err.Error(),
		})
	}

	logs, err := h.service.GetAuditLogs(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve audit logs",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
	})
}