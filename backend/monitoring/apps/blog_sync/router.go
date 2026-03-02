package blog_sync

import (
	"monitoring-service/apps/site"
	"monitoring-service/internal/config"
	"monitoring-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB, siteSvc site.Service, cfg config.BloggerConfig) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siteSvc, cfg)
	ctrl := NewController(svc)

	// Protected: manual sync trigger
	api := app.Group("/api/v1", middleware.KongAuth())
	api.Post("/sites/:id/sync-now", ctrl.SyncNow)
	api.Get("/sites/:id/sync-logs", ctrl.SyncLogs)

	// Public: posts (no auth)
	pub := app.Group("/v1/public")
	pub.Get("/posts", ctrl.ListPublicPosts)
	pub.Get("/posts/:slug", ctrl.GetPublicPost)

	return svc
}
