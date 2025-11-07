package jabatan_struktural

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the jabatan_struktural service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) *Service {
	// Initialize layers
	repo := NewRepository(db)
	syncService := NewSyncService(repo, sisterAPI)
	service := NewService(repo, syncService)
	controller := NewController(service)

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/jabatan-struktural/sync", controller.SyncJabatanStrukturalByIDSDM)
	api.Post("/jabatan-struktural/sync-all", controller.BatchSyncAllJabatanStruktural)

	// Public routes
	public := app.Group("/public")

	// Stats route (must be before /:id to avoid conflict)
	public.Get("/jabatan-struktural/stats", controller.GetJabatanStrukturalStats)

	// List route (must be before /:id to avoid conflict)
	public.Get("/jabatan-struktural/list", controller.GetJabatanStrukturalList)

	// Detail route
	public.Get("/jabatan-struktural/:id", controller.GetJabatanStrukturalDetail)

	return service
}
