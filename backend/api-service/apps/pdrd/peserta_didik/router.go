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
	router.Get("/list_mahasiswa", handler.GetPesertaDidik)
	router.Get("/detail_biodata_mahasiswa", handler.GetPesertaDidikDetail)
	router.Get("/riwayat_pendidikan_mahasiswa", handler.GetRegPd)
	router.Get("/status_kuliah_mahasiswa", handler.GetStatusKuliahMahasiswa)
}
