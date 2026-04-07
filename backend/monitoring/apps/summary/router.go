package summary

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

func Init(app *fiber.App, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo, db)
	ctrl := NewController(svc)

	// All public — no auth
	pub := app.Group("/v1/public")
	pub.Get("/status", ctrl.GetStatus)
	pub.Get("/stats", ctrl.GetStats)
	pub.Get("/daily-summary", ctrl.DailySummary)

	return svc
}
