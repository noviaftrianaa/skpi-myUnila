package tracer

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutesWithMiddleware mount /v1/tracer/*
//
// CRUD endpoint:
//   GET    /hasil_tracer
//   GET    /hasil_tracer/:id
//   POST   /hasil_tracer
//   PUT    /hasil_tracer/:id
//   DELETE /hasil_tracer/:id
//
//   GET    /hasil_tracer_atasan
//   GET    /hasil_tracer_atasan/:id
//   POST   /hasil_tracer_atasan
//   PUT    /hasil_tracer_atasan/:id
//   DELETE /hasil_tracer_atasan/:id
//
// Read-only:
//   GET    /umr_wilayah
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/tracer", middlewares...)
	} else {
		g = router.Group("/tracer", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	// hasil_tracer_study
	g.Get("/hasil_tracer", h.List)
	g.Get("/hasil_tracer/:id", h.Get)
	g.Post("/hasil_tracer", h.Create)
	g.Put("/hasil_tracer/:id", h.Update)
	g.Delete("/hasil_tracer/:id", h.Delete)

	// hasil_tracer_atasan
	g.Get("/hasil_tracer_atasan", h.ListAtasan)
	g.Get("/hasil_tracer_atasan/:id", h.GetAtasan)
	g.Post("/hasil_tracer_atasan", h.CreateAtasan)
	g.Put("/hasil_tracer_atasan/:id", h.UpdateAtasan)
	g.Delete("/hasil_tracer_atasan/:id", h.DeleteAtasan)

	// umr_wilayah (full CRUD)
	g.Get("/umr_wilayah", h.ListUmr)
	g.Get("/umr_wilayah/:id", h.GetUmr)
	g.Post("/umr_wilayah", h.CreateUmr)
	g.Put("/umr_wilayah/:id", h.UpdateUmr)
	g.Delete("/umr_wilayah/:id", h.DeleteUmr)
}
