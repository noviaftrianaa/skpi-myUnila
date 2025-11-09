package riwayat_pekerjaan

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the riwayat_pekerjaan service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) *Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService)
	controller := NewController(service)

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/riwayat-pekerjaan/sync", controller.SyncRwyPekerjaanByIDSDM)
	api.Post("/riwayat-pekerjaan/sync-all", controller.BatchSyncAllRwyPekerjaan)

	// Public routes (no auth required)
	rwyPekerjaanGroup := app.Group("/riwayat-pekerjaan")

	// Stats route (must be before /:id to avoid conflict)
	rwyPekerjaanGroup.Get("/stats", controller.GetRwyPekerjaanStats)

	// List route (must be before /:id to avoid conflict)
	rwyPekerjaanGroup.Get("/list", controller.GetRwyPekerjaanList)

	// Detail route
	rwyPekerjaanGroup.Get("/:id", controller.GetRwyPekerjaanDetail)

	return service
}
