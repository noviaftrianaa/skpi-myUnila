package settings

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

	api.Get("/settings", ctrl.List)
	api.Get("/settings/:id", ctrl.GetByID)
	api.Put("/settings/bulk", ctrl.BulkUpdate)
	api.Put("/settings/:id", ctrl.Update)

	return svc
}
