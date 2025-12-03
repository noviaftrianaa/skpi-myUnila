package monitoring

import (
	"github.com/gofiber/fiber/v2"
)

// Init initializes the monitoring module and registers routes
func Init(router fiber.Router) Service {
	svc := NewService()
	handler := NewHandler(svc)

	// Register routes under /monitoring
	monitoringGroup := router.Group("/monitoring")
	monitoringGroup.Get("/", handler.GetActiveSyncs)
	monitoringGroup.Get("/stats", handler.GetStats)
	monitoringGroup.Get("/:id", handler.GetSyncProgress)

	return svc
}
