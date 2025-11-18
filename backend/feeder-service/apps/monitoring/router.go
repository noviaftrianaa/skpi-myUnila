package monitoring

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers all monitoring routes
// Note: This is called from main.go with app (root router), so we need to create /api/v1 group here
func RegisterRoutes(router fiber.Router) {
	controller := NewController()

	// Create API v1 group and monitoring group under it
	// Router is the app root, so we create /api/v1/monitoring path
	api := router.Group("/api/v1")
	monitoring := api.Group("/monitoring")

	// Routes
	monitoring.Get("/active", controller.GetActiveSyncs) // Get all active syncs
	monitoring.Get("/:id", controller.GetSyncByID)       // Get specific sync by ID
}
