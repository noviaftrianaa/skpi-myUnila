package synclog

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// RegisterRoutes registers all sync-logs routes
// Note: This is called from main.go with app (root router), so we need to create /api/v1 group here
func RegisterRoutes(router fiber.Router, db *sqlx.DB) {
	// Initialize layers
	repo := NewRepository(db)
	service := NewService(repo)
	controller := NewController(service)

	// Create API v1 group and sync-logs group under it
	// Router is the app root, so we create /api/v1/sync-logs path
	api := router.Group("/api/v1")
	syncLogs := api.Group("/sync-logs")

	// Routes
	syncLogs.Get("/stats", controller.GetStats)                         // Get overall stats
	syncLogs.Get("/stats/:endpoint_key", controller.GetStatsByEndpoint) // Get stats by endpoint
	syncLogs.Get("/", controller.GetList)                               // Get list with pagination
	syncLogs.Get("/:id", controller.GetByID)                            // Get by ID
}
