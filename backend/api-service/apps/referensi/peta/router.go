package peta

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/peta_katgiat_jabfung", handler.GetPetaKatgiatJabfung)
	router.Get("/peta_katgiat_jnsdok", handler.GetPetaKatgiatJnsdok)
	router.Get("/peta_katgiat_jnspub", handler.GetPetaKatgiatJnspub)
}
