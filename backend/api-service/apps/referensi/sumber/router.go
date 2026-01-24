package sumber

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/sumber_air", handler.GetSumberAir)
	router.Get("/sumber_dana", handler.GetSumberDana)
	router.Get("/sumber_gaji", handler.GetSumberGaji)
	router.Get("/sumber_listrik", handler.GetSumberListrik)
}
