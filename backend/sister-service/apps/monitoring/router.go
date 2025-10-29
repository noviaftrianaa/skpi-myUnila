package monitoring

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers all monitoring routes
func RegisterRoutes(router fiber.Router) {
	controller := NewController()

	// Create monitoring group
	monitoring := router.Group("/monitoring")

	// Routes
	monitoring.Get("/active", controller.GetActiveSyncs) // Get all active syncs
	monitoring.Get("/:id", controller.GetSyncByID)       // Get specific sync by ID
}
