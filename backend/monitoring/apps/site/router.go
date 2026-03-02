package site

import (
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init registers site routes and returns the service (for use by scheduler)
func Init(app *fiber.App, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	ctrl := NewController(svc)

	// Protected routes (KongAuth middleware)
	api := app.Group("/api/v1", middleware.KongAuth())

	// Stats first (must be before /:id to avoid route conflict)
	api.Get("/sites/stats/overview", ctrl.Stats)

	// CRUD
	api.Get("/sites", ctrl.List)
	api.Post("/sites", ctrl.Create)
	api.Get("/sites/:id", ctrl.GetByID)
	api.Put("/sites/:id", ctrl.Update)
	api.Delete("/sites/:id", ctrl.Delete)

	// Actions
	api.Post("/sites/:id/check-now", ctrl.CheckNow)
	api.Get("/sites/:id/health-history", ctrl.HealthHistory)

	// Public route (no auth)
	app.Get("/v1/public/sites", ctrl.PublicList)

	return svc
}
