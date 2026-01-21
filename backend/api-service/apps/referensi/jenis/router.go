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
	router.Get("/jenis_akt_mhs", handler.JenisAktMhs)
	router.Get("/jenis_bahan_ajar", handler.JenisBahanAjar)
	router.Get("/jenis_beasiswa", handler.JenisBeasiswa)
	router.Get("/jenis_diklat", handler.JenisDiklat)
	router.Get("/jenis_dokumen", handler.JenisDokumen)
	router.Get("/jenis_evaluasi", handler.JenisEvaluasi)
	router.Get("/jenis_hapus_buku", handler.JenisHapusBuku)
	router.Get("/jenis_jalur_pekerjaan", handler.JenisJalurPekerjaan)
	router.Get("/jenis_keluar", handler.JenisKeluar)
	router.Get("/jenis_kepanitiaan", handler.JenisKepanitiaan)
	router.Get("/jenis_kesejahteraan", handler.JenisKesejahteraan)
	router.Get("/jenis_keuangan", handler.JenisKeuangan)
	router.Get("/jenis_lembaga", handler.JenisLembaga)
	router.Get("/jenis_media_pub", handler.JenisMediaPub)
}
