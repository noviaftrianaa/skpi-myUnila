package penugasan

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App, controller *Controller) {
	// API routes (authenticated with JWT at Kong level)
	api := app.Group("/api/v1")
	penugasanAPI := api.Group("/penugasan")
	{
		// POST sync routes
		// POST /api/v1/penugasan/sync - Sync penugasan from Sister API
		// Query params: id_sdm (required), synced_by (optional)
		penugasanAPI.Post("/sync", controller.SyncPenugasanByIDSDM)

		// POST /api/v1/penugasan/sync-all - Batch sync all penugasan
		// Query params: synced_by (optional)
		penugasanAPI.Post("/sync-all", controller.BatchSyncPenugasan)

		// GET routes (also protected with JWT)
		// GET /api/v1/penugasan/stats - Get statistics (MUST be before "/" route)
		penugasanAPI.Get("/stats", controller.GetPenugasanStats)

		// GET /api/v1/penugasan - Get paginated list with search
		// Query params: page (default 1), limit (default 10), search (optional)
		penugasanAPI.Get("/", controller.GetPenugasanList)

		// GET /api/v1/penugasan/detail - Get all penugasan for a dosen
		// Query param: id_sdm (required)
		penugasanAPI.Get("/detail", controller.GetAllPenugasanByIDSDM)

		// GET /api/v1/penugasan/:id - Get detail of a single penugasan
		penugasanAPI.Get("/:id", controller.GetPenugasanByIDRegPTK)
	}
}
