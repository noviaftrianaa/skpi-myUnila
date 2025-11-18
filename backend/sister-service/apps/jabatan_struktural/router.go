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

	// API routes
	api := app.Group("/api/v1")

	// Sync routes (authenticated)
	api.Post("/jabatan-struktural/sync", controller.SyncJabatanStrukturalByIDSDM)
	api.Post("/jabatan-struktural/sync-all", controller.BatchSyncAllJabatanStruktural)

	// Public GET routes under /api/v1 (for Kong Gateway routing consistency)
	jabatanStrukturalGroup := api.Group("/jabatan-struktural")
	jabatanStrukturalGroup.Get("/stats", controller.GetJabatanStrukturalStats)
	jabatanStrukturalGroup.Get("/list", controller.GetJabatanStrukturalList)
	jabatanStrukturalGroup.Get("/:id", controller.GetJabatanStrukturalDetail)

	return service
}
