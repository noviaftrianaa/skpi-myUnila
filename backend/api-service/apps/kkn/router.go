package kkn

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/internal/middleware"
)

func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/kkn", middlewares...)
	} else {
		g = router.Group("/kkn", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	g.Get("/list_peserta", h.ListPeserta)
	g.Get("/detail_peserta", h.DetailPeserta)
	g.Get("/list_kelompok", h.ListKelompok)
	g.Get("/list_dpl", h.ListDPL)
	g.Get("/list_nilai", h.ListNilai)
	g.Get("/list_periode", h.ListPeriode)
	g.Get("/list_lokasi", h.ListLokasi)
}
