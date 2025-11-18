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

	// API routes (authenticated with JWT at Kong level)
	api := app.Group("/api/v1")
	bidangIlmuAPI := api.Group("/bidang-ilmu")
	{
		// POST sync routes
		bidangIlmuAPI.Post("/sync/:id_sdm", controller.SyncSingle)
		bidangIlmuAPI.Post("/sync-all", controller.SyncAll)

		// GET routes (also protected with JWT)
		// Stats and list routes must be before /dosen/:id_sdm to avoid conflict
		bidangIlmuAPI.Get("/stats", controller.GetStats)
		bidangIlmuAPI.Get("/list", controller.GetList)
		bidangIlmuAPI.Get("/dosen/:id_sdm", controller.GetByIDSDM)
	}

	return service
}
