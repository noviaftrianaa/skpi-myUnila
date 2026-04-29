package notif

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/manajemen-konten-service/internal/middleware"
)

func Init(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	g := router.Group("/notif")

	// Per-user endpoints — require auth (any role).
	auth := g.Group("/", middleware.RequireAuth())
	auth.Get("/inbox", handler.Inbox)
	auth.Get("/inbox/unread-count", handler.UnreadCount)
	auth.Patch("/inbox/:id/read", handler.MarkRead)
	auth.Patch("/inbox/:id/dismiss", handler.Dismiss)
	auth.Patch("/inbox/read-all", handler.MarkAllRead)

	// Admin endpoints — developer only.
	admin := g.Group("/", middleware.RequireAuth(), middleware.RequireRole("developer"))
	admin.Post("/broadcast", handler.Broadcast)
	admin.Get("/broadcasts", handler.ListBroadcasts)
}
