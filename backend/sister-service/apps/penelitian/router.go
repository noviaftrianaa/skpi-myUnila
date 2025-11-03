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

	// Penelitian sync endpoint
	apiV1.Post("/penelitian/sync", controller.SyncPenelitianByIDSDM)

	// Pengabdian sync endpoint
	apiV1.Post("/pengabdian/sync", controller.SyncPengabdianByIDSDM)

	// Public routes
	public := app.Group("/public")

	// Penelitian endpoints
	public.Get("/penelitian", controller.GetPenelitianByIDSDM)
	public.Get("/penelitian/stats", controller.GetPenelitianStats)
	public.Get("/penelitian/list", controller.GetPenelitianList)

	// Pengabdian endpoints
	public.Get("/pengabdian", controller.GetPengabdianByIDSDM)
	public.Get("/pengabdian/stats", controller.GetPengabdianStats)
	public.Get("/pengabdian/list", controller.GetPengabdianList)

	// General litabmas endpoint (works for both penelitian and pengabdian)
	public.Get("/litabmas/:id", controller.GetLitabmasDetail)
	public.Get("/litabmas/:id/dokumen", controller.GetDokumenByLitabmas)

	return service
}
