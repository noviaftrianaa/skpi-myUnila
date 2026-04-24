package akademik

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutesWithMiddleware mount semua endpoint akademik di /v1/akademik.
// Sumber: pdrd (matkul, kelas_kuliah, jadwal_kelas, kurikulum_sp).
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/akademik", middlewares...)
	} else {
		g = router.Group("/akademik", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	g.Get("/list_matkul", h.ListMatkul)
	g.Get("/detail_matkul", h.DetailMatkul)
	g.Get("/list_kelas_kuliah", h.ListKelasKuliah)
	g.Get("/list_jadwal_kelas", h.ListJadwalKelas)
	g.Get("/list_kurikulum", h.ListKurikulum)

	// Batch 8 — akademik advanced
	g.Get("/list_akt_ajar_dosen", h.ListAktAjarDosen)
	g.Get("/list_rencana_ajar", h.ListRencanaAjar)
	g.Get("/list_matkul_kurikulum", h.ListMatkulKurikulum)
	g.Get("/list_substansi_kuliah", h.ListSubstansiKuliah)
	g.Get("/list_re_mk", h.ListReMk)
}
