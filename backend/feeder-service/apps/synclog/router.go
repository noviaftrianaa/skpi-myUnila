package synclog

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// RegisterRoutes registers all sync-logs routes
func RegisterRoutes(router fiber.Router, db *sqlx.DB) {
	// Initialize layers
	repo := NewRepository(db)
	service := NewService(repo)
	controller := NewController(service)

	// Create sync-logs group
	syncLogs := router.Group("/sync-logs")

	// Routes
	syncLogs.Get("/stats", controller.GetStats)                         // Get overall stats
	syncLogs.Get("/stats/:endpoint_key", controller.GetStatsByEndpoint) // Get stats by endpoint
	syncLogs.Get("/", controller.GetList)                               // Get list with pagination
	syncLogs.Get("/:id", controller.GetByID)                            // Get by ID
}
