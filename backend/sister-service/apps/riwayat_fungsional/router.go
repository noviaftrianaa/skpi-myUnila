package riwayat_fungsional

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the riwayat_fungsional service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) *Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService)
	controller := NewController(service)

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/jabatan-fungsional/sync", controller.SyncRwyFungsionalByIDSDM)
	api.Post("/jabatan-fungsional/sync-all", controller.BatchSyncAllRwyFungsional)

	// Public routes (no auth required)
	rwyFungsionalGroup := app.Group("/jabatan-fungsional")

	// Stats route (must be before /:id to avoid conflict)
	rwyFungsionalGroup.Get("/stats", controller.GetRwyFungsionalStats)

	// List route (must be before /:id to avoid conflict)
	rwyFungsionalGroup.Get("/list", controller.GetRwyFungsionalList)

	// Detail route
	rwyFungsionalGroup.Get("/:id", controller.GetRwyFungsionalDetail)

	return service
}
