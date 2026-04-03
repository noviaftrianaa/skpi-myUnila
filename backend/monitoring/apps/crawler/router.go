package crawler

import (
	"monitoring-service/apps/detector"
	"monitoring-service/apps/site"
	"monitoring-service/internal/config"
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB, siteSvc site.Service, det *detector.Detector, cfg *config.Config) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siteSvc, det, cfg)
	ctrl := NewController(svc)

	api := app.Group("/api/v1", middleware.KongAuth())

	// Stats first (before /:id)
	api.Get("/crawl/stats", ctrl.Stats)

	api.Get("/crawl/jobs", ctrl.ListJobs)
	api.Post("/crawl/jobs", ctrl.CreateJob)
	api.Get("/crawl/jobs/:id", ctrl.GetJob)
	api.Delete("/crawl/jobs/:id", ctrl.DeleteJob)
	api.Get("/crawl/jobs/:id/sessions", ctrl.ListSessions)

	return svc
}
