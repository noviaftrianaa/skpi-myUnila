package lembaga

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/lembaga_akred", handler.GetLembagaAkred)
	router.Get("/lembaga_pengangkat", handler.GetLembagaPengangkat)
	router.Get("/lembaga_sertifikasi", handler.GetLembagaSertifikasi)
}
