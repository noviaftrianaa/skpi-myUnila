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

	router.Get("/bentuk_kegiatan_kerjasama", handler.GetBentukKegiatanKerjasama)
	router.Get("/bentuk_pendidikan", handler.GetBentukPendidikan)
}
