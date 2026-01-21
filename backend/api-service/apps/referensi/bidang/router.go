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
	bidang := router.Group("")
	bidang.Get("/bidang_kerjasama", handler.GetBidangKerjasama)
	bidang.Get("/bidang_pekerjaan", handler.GetBidangPekerjaan)
	bidang.Get("/bidang_studi", handler.GetBidangStudi)
	bidang.Get("/bidang_usaha", handler.GetBidangUsaha)
}
