package scheduler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init initializes the scheduler module and registers routes
func Init(router fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	// Set global service
	SetService(svc)

	// Register routes under /schedules
	schedulerGroup := router.Group("/schedules")
	schedulerGroup.Get("/", handler.GetAll)
	schedulerGroup.Get("/types", handler.GetSyncTypes)
	schedulerGroup.Get("/:id", handler.GetByID)
	schedulerGroup.Post("/", handler.Create)
	schedulerGroup.Put("/:id", handler.Update)
	schedulerGroup.Delete("/:id", handler.Delete)
	schedulerGroup.Patch("/:id/toggle", handler.Toggle)

	return svc
}
