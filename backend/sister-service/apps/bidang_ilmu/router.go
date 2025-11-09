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

	// Public routes (no auth required)
	bidangIlmuGroup := app.Group("/bidang-ilmu")

	// Stats route (must be before /:id_sdm to avoid conflict)
	bidangIlmuGroup.Get("/stats", controller.GetStats)

	// List route (must be before /dosen/:id_sdm to avoid conflict)
	bidangIlmuGroup.Get("/list", controller.GetList)

	// Get by dosen
	bidangIlmuGroup.Get("/dosen/:id_sdm", controller.GetByIDSDM)

	return service
}
