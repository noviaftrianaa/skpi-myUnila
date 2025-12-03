package logger

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init initializes the logger module and registers routes
func Init(router fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	// Set global service for other modules to use
	SetService(svc)

	// Register routes under /logger
	loggerGroup := router.Group("/logger")
	loggerGroup.Get("/", handler.GetSyncLogs)
	loggerGroup.Get("/recent", handler.GetRecentSyncLogs)
	loggerGroup.Get("/:id", handler.GetSyncLogByID)

	return svc
}
