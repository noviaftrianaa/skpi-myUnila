package kerjasama

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutesWithMiddleware mount /v1/kerjasama/* — 15 endpoint CRUD.
// Mendukung aplikasi LP2M / Bagian Kerjasama untuk manage MOU, kerjasama prodi,
// dan mitra DUDI.
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/kerjasama", middlewares...)
	} else {
		g = router.Group("/kerjasama", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	// mou (CRUD)
	g.Get("/mou", h.ListMou)
	g.Get("/mou/:id", h.GetMou)
	g.Post("/mou", h.CreateMou)
	g.Put("/mou/:id", h.UpdateMou)
	g.Delete("/mou/:id", h.DeleteMou)

	// sms_kerjasama (CRUD)
	g.Get("/sms_kerjasama", h.ListSmsKerjasama)
	g.Get("/sms_kerjasama/:id", h.GetSmsKerjasama)
	g.Post("/sms_kerjasama", h.CreateSmsKerjasama)
	g.Put("/sms_kerjasama/:id", h.UpdateSmsKerjasama)
	g.Delete("/sms_kerjasama/:id", h.DeleteSmsKerjasama)

	// dudi / mitra (CRUD) — source pdrd.dudi
	g.Get("/dudi", h.ListDudi)
	g.Get("/dudi/:id", h.GetDudi)
	g.Post("/dudi", h.CreateDudi)
	g.Put("/dudi/:id", h.UpdateDudi)
	g.Delete("/dudi/:id", h.DeleteDudi)
}
