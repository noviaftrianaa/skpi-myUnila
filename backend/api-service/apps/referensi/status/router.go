package status

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	router.Get("/status_kepegawaian", handler.GetStatusKepegawaian)
	router.Get("/status_kepemilikan", handler.GetStatusKepemilikan)
	router.Get("/status_kerjasama", handler.GetStatusKerjasama)
	router.Get("/status_mahasiswa", handler.GetStatusMahasiswa)
	router.Get("/status_milik_sarpras", handler.GetStatusMilikSarpras)
	router.Get("/status_anak", handler.GetStatusAnak)
	router.Get("/status_keaktifan_pegawai", handler.GetStatusKeaktifanPegawai)
}
