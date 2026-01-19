package bentuk

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk bentuk
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	bentuk := router.Group("/bentuk")
	bentuk.Get("/kegiatan-kerjasama", handler.GetBentukKegiatanKerjasama)
	bentuk.Get("/pendidikan", handler.GetBentukPendidikan)
}
