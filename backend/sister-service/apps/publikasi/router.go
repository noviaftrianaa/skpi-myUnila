package publikasi

import (
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// SetupRoutes initializes publikasi routes
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	// Initialize service and controller
	service := NewService(db, sisterAPI, loggerSvc)
	controller := NewController(service)

	// API routes (authenticated)
	apiV1 := app.Group("/api/v1")

	// Publikasi sync endpoints
	apiV1.Post("/publikasi/sync", controller.SyncPublikasiByIDSDM)
	apiV1.Post("/publikasi/sync-all", controller.BatchSyncAllPublikasi)

	// Public routes (no auth required)
	publikasiGroup := app.Group("/publikasi")

	// Publikasi endpoints (specific routes MUST come before :id route)
	publikasiGroup.Get("/list", controller.GetPublikasiList)
	publikasiGroup.Get("/stats", controller.GetPublikasiStats)
	publikasiGroup.Get("/:id", controller.GetPublikasiByID)
	publikasiGroup.Get("/:id/penulis", controller.GetTulisPubByPublikasi)

	return service
}
