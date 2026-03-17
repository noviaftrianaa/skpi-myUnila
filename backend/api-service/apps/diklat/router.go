package diklat

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes (backward compat)
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redisConn *redis.Client) {
	RegisterRoutesWithMiddleware(router, db, redisConn, nil)
}

// RegisterRoutesWithMiddleware mendaftarkan routes dengan custom middleware chain
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisConn *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisConn)
	handler := NewHandler(svc)

	var ref fiber.Router
	if len(middlewares) > 0 {
		ref = router.Group("/diklat", middlewares...)
	} else {
		ref = router.Group("/diklat", middleware.KongAuth())
	}

	// Endpoints
	ref.Get("/list", handler.GetDiklat)
	ref.Get("/ambil/:id", handler.GetDiklatByID)
	ref.Post("/tambah", handler.CreateDiklat)
	ref.Put("/ubah/:id", handler.UpdateDiklat)
	ref.Delete("/hapus/:id", handler.DeleteDiklat)
}
