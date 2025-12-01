package dashboard

import (
	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetDashboardStats returns dashboard statistics
// @Summary Get dashboard statistics
// @Description Returns comprehensive dashboard statistics including module stats, recent syncs, and quick stats
// @Tags Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/dashboard/stats [get]
func (c *Controller) GetDashboardStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetDashboardStats(ctx.Context())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get dashboard statistics",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Dashboard statistics retrieved successfully",
		"data":    stats,
	})
}
