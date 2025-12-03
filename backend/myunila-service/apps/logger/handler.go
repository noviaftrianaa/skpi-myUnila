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

// GetSyncLogs handles GET /logger
func (h *Handler) GetSyncLogs(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	filter := &SyncLogFilter{
		Limit:  limit,
		Offset: (page - 1) * limit,
	}

	// Optional filters
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
			endOfDay := t.Add(24*time.Hour - time.Second)
			filter.DateTo = &endOfDay
		}
	}

	result, err := h.service.GetSyncLogs(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync logs retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetSyncLogByID handles GET /logger/:id
func (h *Handler) GetSyncLogByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid ID",
		})
	}

	log, err := h.service.GetSyncLogByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync log retrieved successfully",
		"data":    log,
	})
}

// GetRecentSyncLogs handles GET /logger/recent
func (h *Handler) GetRecentSyncLogs(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	logs, err := h.service.GetRecentSyncLogs(c.Context(), limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Recent sync logs retrieved successfully",
		"data":    logs,
	})
}
