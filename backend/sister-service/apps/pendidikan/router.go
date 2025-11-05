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

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/pendidikan-formal/sync", controller.SyncPendidikanFormalByIDSDM)
	api.Post("/pendidikan-formal/sync-all", controller.BatchSyncAllPendidikanFormal)

	// Public routes
	public := app.Group("/public")

	// Stats route (must be before /:id to avoid conflict)
	public.Get("/pendidikan-formal/stats", controller.GetPendidikanFormalStats)

	// List route (must be before /:id to avoid conflict)
	public.Get("/pendidikan-formal/list", controller.GetPendidikanFormalList)

	// Query and detail routes
	public.Get("/pendidikan-formal", controller.GetPendidikanFormalByIDSDM)
	public.Get("/pendidikan-formal/:id", controller.GetPendidikanFormalDetail)

	return service
}
