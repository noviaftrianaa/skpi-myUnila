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

	// API routes
	api := app.Group("/api/v1")

	// Sync routes (authenticated)
	api.Post("/jabatan-fungsional/sync", controller.SyncRwyFungsionalByIDSDM)
	api.Post("/jabatan-fungsional/sync-all", controller.BatchSyncAllRwyFungsional)

	// Public GET routes under /api/v1 (for Kong Gateway routing consistency)
	rwyFungsionalGroup := api.Group("/jabatan-fungsional")
	rwyFungsionalGroup.Get("/stats", controller.GetRwyFungsionalStats)
	rwyFungsionalGroup.Get("/list", controller.GetRwyFungsionalList)
	rwyFungsionalGroup.Get("/:id", controller.GetRwyFungsionalDetail)

	return service
}
