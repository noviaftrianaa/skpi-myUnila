package tingkat

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/tingkat_kerjasama", handler.GetTingkatKerjasama)
	router.Get("/tingkat_penghargaan", handler.GetTingkatPenghargaan)
	router.Get("/tingkat_prestasi", handler.GetTingkatPrestasi)
}
