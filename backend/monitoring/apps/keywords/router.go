package keywords

import (
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	ctrl := NewController(svc, db)

	api := app.Group("/api/v1", middleware.KongAuth())
	kw := api.Group("/keywords")

	kw.Get("/", ctrl.List)
	kw.Post("/", ctrl.Create)
	kw.Put("/:id", ctrl.Update)
	kw.Delete("/:id", ctrl.Delete)
	kw.Post("/seed", ctrl.Seed)

	return svc
}
