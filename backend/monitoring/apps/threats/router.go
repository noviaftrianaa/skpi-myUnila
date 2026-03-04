package threats

import (
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	ctrl := NewController(svc)

	api := app.Group("/api/v1", middleware.KongAuth())

	// Stats first (before /:id to avoid route conflict)
	api.Get("/threats/stats", ctrl.Stats)
	api.Get("/threats/stats/fakultas/:id", ctrl.StatsByFakultas)

	api.Get("/threats", ctrl.List)
	api.Get("/threats/:id", ctrl.GetByID)
	api.Put("/threats/:id/status", ctrl.UpdateStatus)

	return svc
}
