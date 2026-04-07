package kategori

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {

	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/kategori_capaian_luaran", handler.KategoriCapaianLuaran)
	router.Get("/kategori_kegiatan", handler.KategoriKegiatan)
	router.Get("/kategori_tabel", handler.KategoriTabel)
}
