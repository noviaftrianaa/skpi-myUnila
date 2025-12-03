package monitoring

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetActiveSyncs handles GET /monitoring
func (h *Handler) GetActiveSyncs(c *fiber.Ctx) error {
	activeSyncs := h.service.GetActiveSyncs()
	stats := h.service.GetStats()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Monitoring data retrieved successfully",
		"data": MonitoringListResponse{
			ActiveSyncs: activeSyncs,
			Stats:       stats,
			UpdatedAt:   time.Now(),
		},
	})
}

// GetSyncProgress handles GET /monitoring/:id
func (h *Handler) GetSyncProgress(c *fiber.Ctx) error {
	syncID := c.Params("id")
	if syncID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Sync ID is required",
		})
	}

	progress := h.service.GetSyncProgress(syncID)
	if progress == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Sync not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync progress retrieved successfully",
		"data":    progress,
	})
}

// GetStats handles GET /monitoring/stats
func (h *Handler) GetStats(c *fiber.Ctx) error {
	stats := h.service.GetStats()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Monitoring stats retrieved successfully",
		"data":    stats,
	})
}
