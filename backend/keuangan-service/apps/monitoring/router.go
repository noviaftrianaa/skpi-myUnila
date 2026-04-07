package monitoring

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers monitoring routes
func RegisterRoutes(app *fiber.App) {
	service := GetInstance()
	controller := NewController(service)

	// Monitoring routes
	monitoring := app.Group("/api/v1/monitoring")
	monitoring.Get("/active", controller.GetActiveSyncs)
	monitoring.Get("/sync/:id", controller.GetSyncProgress)
}
