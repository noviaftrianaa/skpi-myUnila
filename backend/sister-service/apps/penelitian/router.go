package penelitian

import (
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// SetupRoutes registers penelitian and pengabdian routes and returns the service
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	// Initialize service and controller
	service := NewService(db, sisterAPI, loggerSvc)
	controller := NewController(service)

	// API routes (authenticated with JWT at Kong level)
	api := app.Group("/api/v1")

	// Penelitian routes
	penelitianAPI := api.Group("/penelitian")
	{
		// POST sync routes
		penelitianAPI.Post("/sync", controller.SyncPenelitianByIDSDM)
		penelitianAPI.Post("/sync-all", controller.BatchSyncAllPenelitian)

		// GET routes (also protected with JWT)
		penelitianAPI.Get("", controller.GetPenelitianByIDSDM)
		penelitianAPI.Get("/stats", controller.GetPenelitianStats)
		penelitianAPI.Get("/list", controller.GetPenelitianList)
	}

	// Pengabdian routes
	pengabdianAPI := api.Group("/pengabdian")
	{
		// POST sync routes
		pengabdianAPI.Post("/sync", controller.SyncPengabdianByIDSDM)
		pengabdianAPI.Post("/sync-all", controller.BatchSyncAllPengabdian)

		// GET routes (also protected with JWT)
		pengabdianAPI.Get("", controller.GetPengabdianByIDSDM)
		pengabdianAPI.Get("/stats", controller.GetPengabdianStats)
		pengabdianAPI.Get("/list", controller.GetPengabdianList)
	}

	// General litabmas endpoint (works for both penelitian and pengabdian)
	litabmasAPI := api.Group("/litabmas")
	{
		litabmasAPI.Get("/:id", controller.GetLitabmasDetail)
		litabmasAPI.Get("/:id/dokumen", controller.GetDokumenByLitabmas)
	}

	return service
}
