package pendidikan

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the pendidikan service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService, db, loggerService)
	controller := NewController(service)

	// API routes
	api := app.Group("/api/v1")

	// Sync routes (authenticated)
	api.Post("/pendidikan-formal/sync", controller.SyncPendidikanFormalByIDSDM)
	api.Post("/pendidikan-formal/sync-all", controller.BatchSyncAllPendidikanFormal)

	// Public GET routes under /api/v1 (for Kong Gateway routing consistency)
	apiPendidikanGroup := api.Group("/pendidikan-formal")
	apiPendidikanGroup.Get("/stats", controller.GetPendidikanFormalStats)
	apiPendidikanGroup.Get("/list", controller.GetPendidikanFormalList)
	apiPendidikanGroup.Get("", controller.GetPendidikanFormalByIDSDM)
	apiPendidikanGroup.Get("/:id", controller.GetPendidikanFormalDetail)

	return service
}
