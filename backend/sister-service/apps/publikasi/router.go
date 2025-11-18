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

	// API routes (authenticated with JWT at Kong level)
	api := app.Group("/api/v1")
	publikasiAPI := api.Group("/publikasi")
	{
		// POST sync routes
		publikasiAPI.Post("/sync", controller.SyncPublikasiByIDSDM)
		publikasiAPI.Post("/sync-all", controller.BatchSyncAllPublikasi)

		// GET routes (also protected with JWT)
		// Specific routes MUST come before :id route
		publikasiAPI.Get("/list", controller.GetPublikasiList)
		publikasiAPI.Get("/stats", controller.GetPublikasiStats)
		publikasiAPI.Get("/:id", controller.GetPublikasiByID)
		publikasiAPI.Get("/:id/penulis", controller.GetTulisPubByPublikasi)
	}

	return service
}
