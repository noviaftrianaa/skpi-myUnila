package bidang

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk bidang
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	bidang := router.Group("/bidang")
	bidang.Get("/kerjasama", handler.GetBidangKerjasama)
	bidang.Get("/pekerjaan", handler.GetBidangPekerjaan)
	bidang.Get("/studi", handler.GetBidangStudi)
	bidang.Get("/usaha", handler.GetBidangUsaha)
}
