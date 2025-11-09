package tugas_tambahan

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the tugas_tambahan service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) *Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService)
	controller := NewController(service)

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/tugas-tambahan/sync", controller.SyncTugasTambahanByIDSDM)
	api.Post("/tugas-tambahan/sync-all", controller.BatchSyncAllTugasTambahan)

	// Public routes (no auth required)
	tugasTambahanGroup := app.Group("/tugas-tambahan")

	// Stats route (must be before /:id to avoid conflict)
	tugasTambahanGroup.Get("/stats", controller.GetTugasTambahanStats)

	// List route (must be before /:id to avoid conflict)
	tugasTambahanGroup.Get("/list", controller.GetTugasTambahanList)

	// Detail route
	tugasTambahanGroup.Get("/:id", controller.GetTugasTambahanDetail)

	return service
}