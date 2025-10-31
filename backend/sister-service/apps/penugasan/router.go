package penugasan

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App, controller *Controller) {
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
