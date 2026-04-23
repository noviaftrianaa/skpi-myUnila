package pdrd

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/apps/pdrd/pegawai"
	"github.com/myunila/api-service/apps/pdrd/penelitian"
	pesertadidik "github.com/myunila/api-service/apps/pdrd/peserta_didik"
	"github.com/myunila/api-service/apps/pdrd/sdm"
	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutes mendaftarkan semua routes untuk modul PDRD (backward compat)
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	RegisterRoutesWithMiddleware(router, db, redis, nil)
}

// RegisterRoutesWithMiddleware mendaftarkan routes dengan custom middleware chain
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redis *redis.Client, middlewares []fiber.Handler) {
	var pdrd fiber.Router
	if len(middlewares) > 0 {
		pdrd = router.Group("/pdrd", middlewares...)
	} else {
		pdrd = router.Group("/pdrd", middleware.KongAuth())
	}
	pdrd.Use(middleware.RateLimiterMiddleware(redis, middleware.DefaultRateLimiterConfig()))

	pesertadidik.RegisterRoutes(pdrd, db, redis)
	penelitian.RegisterRoutes(pdrd, db, redis)
	sdm.RegisterRoutes(pdrd, db, redis)     // SDM (dosen + tendik) — source: SISTER
	pegawai.RegisterRoutes(pdrd, db, redis) // Pegawai — source: SIKEP
}
