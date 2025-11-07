package bidang_ilmu

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// SetupRoutes initializes and returns the bidang_ilmu service with routes configured
func SetupRoutes(app *fiber.App, db *sqlx.DB, sisterAPI *sister_api.Client, loggerService appLogger.Service) Service {
	// Initialize layers
	repo := NewRepository(db)
	service := NewService(repo, sisterAPI)
	controller := NewController(service)

	// API routes (protected/authenticated)
	api := app.Group("/api/v1")

	// Sync routes
	api.Post("/bidang-ilmu/sync/:id_sdm", controller.SyncSingle)
	api.Post("/bidang-ilmu/sync-all", controller.SyncAll)

	// Public routes
	public := app.Group("/public")

	// Stats route (must be before /:id_sdm to avoid conflict)
	public.Get("/bidang-ilmu/stats", controller.GetStats)

	// List route (must be before /dosen/:id_sdm to avoid conflict)
	public.Get("/bidang-ilmu/list", controller.GetList)

	// Get by dosen
	public.Get("/bidang-ilmu/dosen/:id_sdm", controller.GetByIDSDM)

	return service
}
