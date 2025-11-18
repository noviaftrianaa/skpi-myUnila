package logger

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetSyncLogs godoc
// @Summary Get sync logs with filtering and pagination
// @Description Retrieve sync logs with optional filters (endpoint, status, date range) and pagination
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param endpoint_name query string false "Filter by endpoint name"
// @Param endpoint_key query string false "Filter by endpoint key"
// @Param status query string false "Filter by status (success, failed, partial)"
// @Param sync_type query string false "Filter by sync type (manual, batch, scheduled)"
// @Param date_from query string false "Filter from date (RFC3339 format)"
// @Param date_to query string false "Filter to date (RFC3339 format)"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20)"
// @Success 200 {object} SyncLogResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sync-logs [get]
func (h *Handler) GetSyncLogs(c *fiber.Ctx) error {
	filter := &SyncLogFilter{}

	// Parse query parameters
	if endpointName := c.Query("endpoint_name"); endpointName != "" {
		filter.EndpointName = &endpointName
	}

	if endpointKey := c.Query("endpoint_key"); endpointKey != "" {
		filter.EndpointKey = &endpointKey
	}

	if status := c.Query("status"); status != "" {
		filter.Status = &status
	}

	if syncType := c.Query("sync_type"); syncType != "" {
		filter.SyncType = &syncType
	}

	if dateFromStr := c.Query("date_from"); dateFromStr != "" {
		dateFrom, err := time.Parse(time.RFC3339, dateFromStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Invalid date_from format",
				"message": "date_from must be in RFC3339 format (e.g., 2025-01-01T00:00:00Z)",
			})
		}
		filter.DateFrom = &dateFrom
	}

	if dateToStr := c.Query("date_to"); dateToStr != "" {
		dateTo, err := time.Parse(time.RFC3339, dateToStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Invalid date_to format",
				"message": "date_to must be in RFC3339 format (e.g., 2025-12-31T23:59:59Z)",
			})
		}
		filter.DateTo = &dateTo
	}

	// Parse pagination
	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}

	limit := c.QueryInt("limit", 20)
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	filter.Limit = limit
	filter.Offset = (page - 1) * limit

	// Get sync logs
	response, err := h.service.GetSyncLogs(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve sync logs",
			"message": err.Error(),
		})
	}

	return c.JSON(response)
}

// GetSyncLogByID godoc
// @Summary Get a single sync log by ID
// @Description Retrieve detailed information about a specific sync log
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param id path int true "Sync Log ID"
// @Success 200 {object} SyncLog
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sync-logs/{id} [get]
func (h *Handler) GetSyncLogByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid ID",
			"message": "ID must be a valid integer",
		})
	}

	log, err := h.service.GetSyncLogByID(c.Context(), id)
	if err != nil {
		if err.Error() == "sync log not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "Not found",
				"message": "Sync log not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve sync log",
			"message": err.Error(),
		})
	}

	return c.JSON(log)
}

// GetRecentSyncLogs godoc
// @Summary Get recent sync logs
// @Description Retrieve the most recent sync logs (default: 10, max: 100)
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param limit query int false "Number of logs to retrieve (default: 10, max: 100)"
// @Success 200 {array} SyncLog
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sync-logs/recent [get]
func (h *Handler) GetRecentSyncLogs(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	logs, err := h.service.GetRecentSyncLogs(c.Context(), limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve recent sync logs",
			"message": err.Error(),
		})
	}

	return c.JSON(logs)
}

// RegisterRoutes registers all sync log routes
func (h *Handler) RegisterRoutes(router fiber.Router) {
	router.Get("/sync-logs", h.GetSyncLogs)
	router.Get("/sync-logs/recent", h.GetRecentSyncLogs)
	router.Get("/sync-logs/:id", h.GetSyncLogByID)
}
