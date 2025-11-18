package monitoring

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service *Service
}

func NewController() *Controller {
	return &Controller{
		service: GetInstance(),
	}
}

// GetActiveSyncs handles GET /monitoring/active
// @Summary Get active sync operations
// @Description Get all currently active sync operations and monitoring stats
// @Tags Monitoring
// @Accept json
// @Produce json
// @Success 200 {object} MonitoringListResponse
// @Router /monitoring/active [get]
func (c *Controller) GetActiveSyncs(ctx *fiber.Ctx) error {
	response := c.service.GetActiveSyncs(ctx.Context())
	return ctx.JSON(response)
}

// GetSyncByID handles GET /monitoring/:id
// @Summary Get sync progress by ID
// @Description Get detailed progress information for a specific sync operation
// @Tags Monitoring
// @Accept json
// @Produce json
// @Param id path string true "Sync ID"
// @Success 200 {object} SyncProgress
// @Router /monitoring/{id} [get]
func (c *Controller) GetSyncByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "sync ID is required",
		})
	}

	progress := c.service.GetSyncByID(id)
	if progress == nil {
		return ctx.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "sync operation not found",
		})
	}

	return ctx.JSON(progress)
}
