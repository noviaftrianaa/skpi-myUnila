package synclog

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetList handles GET /sync-logs
// @Summary Get sync logs list
// @Description Get paginated sync logs with filtering
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param status query string false "Filter by status (success, failed, partial)"
// @Param endpoint_key query string false "Filter by endpoint key"
// @Param sync_type query string false "Filter by sync type (manual, batch, scheduled)"
// @Param search query string false "Search in endpoint_name or synced_by"
// @Success 200 {object} SyncLogListResponse
// @Router /sync-logs [get]
func (c *Controller) GetList(ctx *fiber.Ctx) error {
	var req SyncLogListRequest

	// Parse query params
	if err := ctx.QueryParser(&req); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid query parameters",
		})
	}

	// Get data from service
	response, err := c.service.GetList(ctx.Context(), req)
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(response)
}

// GetByID handles GET /sync-logs/:id
// @Summary Get sync log by ID
// @Description Get detailed information of a sync log entry
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param id path int true "Sync Log ID"
// @Success 200 {object} SyncLog
// @Router /sync-logs/{id} [get]
func (c *Controller) GetByID(ctx *fiber.Ctx) error {
	idParam := ctx.Params("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID parameter",
		})
	}

	log, err := c.service.GetByID(ctx.Context(), id)
	if err != nil {
		if err.Error() == "sync log not found" {
			return ctx.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Sync log not found",
			})
		}
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(log)
}

// GetStats handles GET /sync-logs/stats
// @Summary Get sync logs statistics
// @Description Get overall statistics of sync operations
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Success 200 {object} SyncLogStats
// @Router /sync-logs/stats [get]
func (c *Controller) GetStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetStats(ctx.Context())
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}

// GetStatsByEndpoint handles GET /sync-logs/stats/:endpoint_key
// @Summary Get sync logs statistics by endpoint
// @Description Get statistics for a specific endpoint
// @Tags Sync Logs
// @Accept json
// @Produce json
// @Param endpoint_key path string true "Endpoint Key"
// @Success 200 {object} SyncLogStats
// @Router /sync-logs/stats/{endpoint_key} [get]
func (c *Controller) GetStatsByEndpoint(ctx *fiber.Ctx) error {
	endpointKey := ctx.Params("endpoint_key")
	if endpointKey == "" {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "endpoint_key is required",
		})
	}

	stats, err := c.service.GetStatsByEndpoint(ctx.Context(), endpointKey)
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}
