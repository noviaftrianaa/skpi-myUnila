package google_gsc

import (
	"monitoring-service/internal/config"
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB, cfg config.GSCConfig) Service {
	repo := NewRepository(db)
	svc := NewService(repo, cfg)
	ctrl := NewController(svc)

	api := app.Group("/api/v1/gsc", middleware.KongAuth())
	api.Post("/remove", ctrl.SubmitRemoval)
	api.Post("/recrawl", ctrl.SubmitRecrawl)
	api.Post("/remove-threat/:id", ctrl.RemoveByThreatID)
	api.Get("/logs", ctrl.ListLogs)
	api.Get("/quota", ctrl.GetQuota)

	return svc
}
