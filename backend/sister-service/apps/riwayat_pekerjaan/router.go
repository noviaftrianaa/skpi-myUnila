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

	// API routes
	api := app.Group("/api/v1")

	// Sync routes (authenticated)
	api.Post("/riwayat-pekerjaan/sync", controller.SyncRwyPekerjaanByIDSDM)
	api.Post("/riwayat-pekerjaan/sync-all", controller.BatchSyncAllRwyPekerjaan)

	// Public GET routes under /api/v1 (for Kong Gateway routing consistency)
	rwyPekerjaanGroup := api.Group("/riwayat-pekerjaan")
	rwyPekerjaanGroup.Get("/stats", controller.GetRwyPekerjaanStats)
	rwyPekerjaanGroup.Get("/list", controller.GetRwyPekerjaanList)
	rwyPekerjaanGroup.Get("/:id", controller.GetRwyPekerjaanDetail)

	return service
}
