package pdrd

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/apps/pdrd/penelitian"
	pesertadidik "github.com/myunila/api-service/apps/pdrd/peserta_didik"
	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutes mendaftarkan semua routes untuk modul PDRD
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Group route untuk mahasiswa

	pdrd := router.Group("/pdrd", middleware.JWTAuth())
	pdrd.Use(middleware.RateLimiterMiddleware(redis, middleware.DefaultRateLimiterConfig()))

	pesertadidik.RegisterRoutes(pdrd, db, redis)
	penelitian.RegisterRoutes(pdrd, db, redis)
}
