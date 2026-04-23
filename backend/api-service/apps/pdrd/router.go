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

// RegisterRoutes mendaftarkan routes dgn backward compat (tanpa middleware chain).
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redisCli *redis.Client) {
	RegisterRoutesWithMiddleware(router, db, redisCli, nil)
}

// RegisterRoutesWithMiddleware mendaftarkan routes dgn domain grouping.
//
// Mulai 2026-04-23: grouping pindah ke domain-based (/mahasiswa, /sdm, /pegawai,
// /publikasi, /litabmas). `/pdrd/*` dipertahankan sebagai alias deprecated
// untuk backward compat existing client.
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	// Helper: bikin group dengan middleware chain standar
	group := func(prefix string) fiber.Router {
		var g fiber.Router
		if len(middlewares) > 0 {
			g = router.Group(prefix, middlewares...)
		} else {
			g = router.Group(prefix, middleware.KongAuth())
		}
		g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))
		return g
	}

	// =========================================================
	// DEPRECATED: /v1/pdrd/* — kept for backward compatibility
	// Existing clients tetap jalan. Ke depan migrate ke domain groups.
	// =========================================================
	legacy := group("/pdrd")
	pesertadidik.RegisterRoutes(legacy, db, redisCli)
	penelitian.RegisterRoutes(legacy, db, redisCli)
	sdm.RegisterRoutes(legacy, db, redisCli)
	pegawai.RegisterRoutes(legacy, db, redisCli)

	// =========================================================
	// NEW: domain-based groups (recommended URL)
	// =========================================================

	// /v1/mahasiswa/* — peserta didik (pdrd.peserta_didik, reg_pd, kuliah_mhs)
	mhs := group("/mahasiswa")
	pesertadidik.RegisterRoutes(mhs, db, redisCli)

	// /v1/sdm/* — SDM dosen + tendik (source: SISTER)
	sdmGroup := group("/sdm")
	sdm.RegisterRoutes(sdmGroup, db, redisCli)

	// /v1/pegawai/* — pegawai (source: SIKEP)
	pegawaiGroup := group("/pegawai")
	pegawai.RegisterRoutes(pegawaiGroup, db, redisCli)

	// /v1/penelitian/* — publikasi + litabmas dalam satu domain "penelitian"
	// (handler module penelitian sudah expose /publikasi & /litabmas path).
	penelitiGroup := group("/penelitian")
	penelitian.RegisterRoutes(penelitiGroup, db, redisCli)
}
