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

// RegisterRoutes registers sync log routes
func (h *Handler) RegisterRoutes(app *fiber.App) {
	syncLogs := app.Group("/api/v1/sync-logs")
	syncLogs.Get("/", h.GetSyncLogs)
	syncLogs.Get("/recent", h.GetRecentSyncLogs)
	syncLogs.Get("/:id", h.GetSyncLogByID)
}

// GetSyncLogs returns paginated sync logs
func (h *Handler) GetSyncLogs(c *fiber.Ctx) error {
	ctx := c.Context()

	// Parse query parameters
	filter := &SyncLogFilter{
		Limit:  20,
		Offset: 0,
	}

	// Parse pagination
	if page := c.QueryInt("page", 1); page > 0 {
		limit := c.QueryInt("limit", 20)
		filter.Limit = limit
		filter.Offset = (page - 1) * limit
	}

	// Parse filters
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
	if apiCode := c.Query("api_code"); apiCode != "" {
		filter.APICode = &apiCode
	}
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		if t, err := time.Parse("2006-01-02", dateFrom); err == nil {
			filter.DateFrom = &t
		}
	}
	if dateTo := c.Query("date_to"); dateTo != "" {
		if t, err := time.Parse("2006-01-02", dateTo); err == nil {
			// Add 1 day to include the end date
			t = t.Add(24 * time.Hour)
			filter.DateTo = &t
		}
	}

	result, err := h.service.GetSyncLogs(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success":     true,
		"data":        result.Data,
		"total":       result.Total,
		"page":        result.Page,
		"limit":       result.Limit,
		"total_pages": result.TotalPages,
	})
}

// GetSyncLogByID returns a single sync log by ID
func (h *Handler) GetSyncLogByID(c *fiber.Ctx) error {
	ctx := c.Context()

	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "invalid id",
		})
	}

	log, err := h.service.GetSyncLogByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    log,
	})
}

// GetRecentSyncLogs returns the most recent sync logs
func (h *Handler) GetRecentSyncLogs(c *fiber.Ctx) error {
	ctx := c.Context()

	limit := c.QueryInt("limit", 10)

	logs, err := h.service.GetRecentSyncLogs(ctx, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
	})
}
