package sertifikasi_dosen

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the sertifikasi_dosen service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) *Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService)
	controller := NewController(service)

	// API routes
	api := app.Group("/api/v1")

	// Sync routes (authenticated)
	api.Post("/sertifikasi-dosen/sync", controller.SyncSertifikasiByIDSDM)
	api.Post("/sertifikasi-dosen/sync-all", controller.BatchSyncAllSertifikasi)

	// Public GET routes under /api/v1 (for Kong Gateway routing consistency)
	sertifikasiGroup := api.Group("/sertifikasi-dosen")
	sertifikasiGroup.Get("/stats", controller.GetSertifikasiStats)
	sertifikasiGroup.Get("/list", controller.GetSertifikasiList)
	sertifikasiGroup.Get("/:id", controller.GetSertifikasiDetail)

	return service
}
