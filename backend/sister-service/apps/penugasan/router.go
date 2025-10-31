package penugasan

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App, controller *Controller) {
	// Public routes
	publicAPI := app.Group("/public/penugasan")

	// GET /public/penugasan/stats - Get statistics (MUST be before "/" route)
	publicAPI.Get("/stats", controller.GetPenugasanStats)

	// GET /public/penugasan - Get paginated list with search
	// Query params: page (default 1), limit (default 10), search (optional)
	publicAPI.Get("/", controller.GetPenugasanList)

	// Protected routes (kept for backward compatibility)
	api := app.Group("/api/v1/penugasan")

	// GET /api/v1/penugasan - Get all penugasan for a dosen
	// Query param: id_sdm (required)
	api.Get("/", controller.GetAllPenugasanByIDSDM)

	// GET /api/v1/penugasan/:id - Get detail of a single penugasan
	api.Get("/:id", controller.GetPenugasanByIDRegPTK)

	// POST /api/v1/penugasan/sync - Sync penugasan from Sister API
	// Query params: id_sdm (required), synced_by (optional)
	api.Post("/sync", controller.SyncPenugasanByIDSDM)
}
