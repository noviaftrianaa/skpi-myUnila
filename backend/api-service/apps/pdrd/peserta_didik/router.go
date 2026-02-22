package pesertadidik

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk modul mahasiswa/peserta didik
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers (Repository -> Service -> Handler)
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	router.Get("/peserta_didik", handler.GetPesertaDidik)
	router.Get("/peserta_didik_detail", handler.GetPesertaDidikDetail)
	router.Get("/reg_pd", handler.GetRegPd)
}
