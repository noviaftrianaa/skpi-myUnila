package pegawai

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan route modul Pegawai (source: SIKEP).
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	h := NewHandler(svc)

	router.Get("/list_pegawai", h.GetList)
	router.Get("/detail_pegawai", h.GetDetail)
}
