package pengumuman

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/manajemen-konten-service/internal/middleware"
)

func Init(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	g := router.Group("/pengumuman")
	// Public read endpoints
	g.Get("/", handler.List)
	g.Get("/dashboard", handler.Dashboard)
	g.Get("/slug/:slug", handler.GetBySlug)
	g.Get("/:id", handler.GetByID)

	// Admin endpoints — JWT + role developer
	admin := g.Group("/", middleware.RequireAuth(), middleware.RequireRole("developer"))
	admin.Post("/", handler.Create)
	admin.Put("/:id", handler.Update)
	admin.Patch("/:id/status", handler.UpdateStatus)
	admin.Delete("/:id", handler.Delete)
}
