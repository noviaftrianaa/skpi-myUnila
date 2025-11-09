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

	// API routes (authenticated)
	apiV1 := app.Group("/api/v1")

	// Penelitian sync endpoints
	apiV1.Post("/penelitian/sync", controller.SyncPenelitianByIDSDM)
	apiV1.Post("/penelitian/sync-all", controller.BatchSyncAllPenelitian)

	// Pengabdian sync endpoints
	apiV1.Post("/pengabdian/sync", controller.SyncPengabdianByIDSDM)
	apiV1.Post("/pengabdian/sync-all", controller.BatchSyncAllPengabdian)

	// Public routes (no auth required)
	penelitianGroup := app.Group("/penelitian")
	penelitianGroup.Get("", controller.GetPenelitianByIDSDM)
	penelitianGroup.Get("/stats", controller.GetPenelitianStats)
	penelitianGroup.Get("/list", controller.GetPenelitianList)

	pengabdianGroup := app.Group("/pengabdian")
	pengabdianGroup.Get("", controller.GetPengabdianByIDSDM)
	pengabdianGroup.Get("/stats", controller.GetPengabdianStats)
	pengabdianGroup.Get("/list", controller.GetPengabdianList)

	// General litabmas endpoint (works for both penelitian and pengabdian)
	litabmasGroup := app.Group("/litabmas")
	litabmasGroup.Get("/:id", controller.GetLitabmasDetail)
	litabmasGroup.Get("/:id/dokumen", controller.GetDokumenByLitabmas)

	return service
}
