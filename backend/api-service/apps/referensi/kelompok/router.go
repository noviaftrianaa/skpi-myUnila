package kelompok

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/kelompok_bidang", handler.GetKelompokBidang)
	router.Get("/kelompok_mk", handler.GetKelompokMk)
	router.Get("/kelompok_profesi", handler.GetKelompokProfesi)
	router.Get("/kelompok_usaha", handler.GetKelompokUsaha)
}
