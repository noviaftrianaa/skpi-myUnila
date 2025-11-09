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

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/sertifikasi-dosen/sync", controller.SyncSertifikasiByIDSDM)
	api.Post("/sertifikasi-dosen/sync-all", controller.BatchSyncAllSertifikasi)

	// Public routes (no auth required)
	sertifikasiGroup := app.Group("/sertifikasi-dosen")

	// Stats route (must be before /:id to avoid conflict)
	sertifikasiGroup.Get("/stats", controller.GetSertifikasiStats)

	// List route (must be before /:id to avoid conflict)
	sertifikasiGroup.Get("/list", controller.GetSertifikasiList)

	// Detail route
	sertifikasiGroup.Get("/:id", controller.GetSertifikasiDetail)

	return service
}
