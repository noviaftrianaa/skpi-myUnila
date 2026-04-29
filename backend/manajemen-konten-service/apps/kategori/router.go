package kategori

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/manajemen-konten-service/internal/middleware"
)

// Init — register routes:
//   - Public read: GET /kategori (untuk dropdown frontend)
//   - Admin write: POST/PUT/DELETE (developer only)
func Init(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	g := router.Group("/kategori")
	g.Get("/", handler.List)
	g.Get("/:id", handler.GetByID)

	admin := g.Group("/", middleware.RequireAuth(), middleware.RequireRole("developer"))
	admin.Post("/", handler.Create)
	admin.Put("/:id", handler.Update)
	admin.Delete("/:id", handler.Delete)
}
