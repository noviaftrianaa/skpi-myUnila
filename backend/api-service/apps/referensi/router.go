package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/bentuk"
	"github.com/myunila/api-service/apps/referensi/bidang"
	"github.com/myunila/api-service/apps/referensi/common"
	"github.com/myunila/api-service/apps/referensi/jab"
	"github.com/myunila/api-service/apps/referensi/jenis"
	"github.com/myunila/api-service/apps/referensi/kategori"
	"github.com/myunila/api-service/apps/referensi/kelompok"
	"github.com/myunila/api-service/apps/referensi/lembaga"
	"github.com/myunila/api-service/apps/referensi/peta"
	"github.com/myunila/api-service/apps/referensi/status"
	"github.com/myunila/api-service/apps/referensi/sumber"
	"github.com/myunila/api-service/apps/referensi/tingkat"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk referensi (backward compat)
func RegisterRoutes(router fiber.Router, db *sqlx.DB, rConn *redis.Client) {
	RegisterRoutesWithMiddleware(router, db, rConn, nil)
}

// RegisterRoutesWithMiddleware mendaftarkan routes dengan custom middleware chain
// If middlewares is nil, uses default KongAuth
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, rConn *redis.Client, middlewares []fiber.Handler) {
	var ref fiber.Router
	if len(middlewares) > 0 {
		ref = router.Group("/referensi", middlewares...)
	} else {
		ref = router.Group("/referensi", middleware.KongAuth())
	}
	ref.Use(middleware.RateLimiterMiddleware(rConn, middleware.DefaultRateLimiterConfig()))

	// Register subpackages
	bentuk.RegisterRoutes(ref, db, rConn)
	bidang.RegisterRoutes(ref, db, rConn)
	common.RegisterRoutes(ref, db, rConn)
	jab.RegisterRoutes(ref, db, rConn)
	jenis.RegisterRoutes(ref, db, rConn)
	kategori.RegisterRoutes(ref, db, rConn)
	kelompok.RegisterRoutes(ref, db, rConn)
	lembaga.RegisterRoutes(ref, db, rConn)
	peta.RegisterRoutes(ref, db, rConn)
	status.RegisterRoutes(ref, db, rConn)
	sumber.RegisterRoutes(ref, db, rConn)
	tingkat.RegisterRoutes(ref, db, rConn)
}
