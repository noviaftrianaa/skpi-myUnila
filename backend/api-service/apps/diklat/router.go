package diklat

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redisConn *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redisConn)
	handler := NewHandler(svc)

	// Group referensi dengan JWT auth middleware
	ref := router.Group("/diklat", middleware.JWTAuth())

	// Endpoints
	ref.Get("/list", handler.GetDiklat)
	ref.Get("/ambil/:id", handler.GetDiklatByID)
	ref.Post("/tambah", handler.CreateDiklat)
	ref.Put("/ubah/:id", handler.UpdateDiklat)
	ref.Delete("/hapus/:id", handler.DeleteDiklat)
}
