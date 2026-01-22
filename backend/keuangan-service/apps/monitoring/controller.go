package monitoring

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// GetActiveSyncs returns all active sync operations
func (ctrl *Controller) GetActiveSyncs(c *fiber.Ctx) error {
	ctx := c.Context()
	result := ctrl.service.GetActiveSyncs(ctx)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// GetSyncProgress returns specific sync progress by ID
func (ctrl *Controller) GetSyncProgress(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "sync id is required",
		})
	}

	progress := ctrl.service.GetSyncByID(id)
	if progress == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "sync not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    progress,
	})
}
