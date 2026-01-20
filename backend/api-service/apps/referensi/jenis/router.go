package jenis

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk jenis referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	router.Get("/jenis-akt-mhs", handler.JenisAktMhs)
	router.Get("/jenis-bahan-ajar", handler.JenisBahanAjar)
	router.Get("/jenis-beasiswa", handler.JenisBeasiswa)
	router.Get("/jenis-diklat", handler.JenisDiklat)
	router.Get("/jenis-dokumen", handler.JenisDokumen)
	router.Get("/jenis-evaluasi", handler.JenisEvaluasi)
	router.Get("/jenis-hapus-buku", handler.JenisHapusBuku)
	router.Get("/jenis-jalur-pekerjaan", handler.JenisJalurPekerjaan)
	router.Get("/jenis-keluar", handler.JenisKeluar)
	router.Get("/jenis-kepanitiaan", handler.JenisKepanitiaan)
	router.Get("/jenis-kesejahteraan", handler.JenisKesejahteraan)
	router.Get("/jenis-keuangan", handler.JenisKeuangan)
	router.Get("/jenis-lembaga", handler.JenisLembaga)
	router.Get("/jenis-media-pub", handler.JenisMediaPub)
}
