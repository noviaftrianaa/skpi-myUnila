package common

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk common referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	router.Get("/semester", handler.GetSemesters)
	router.Get("/tahun-ajaran", handler.GetTahunAjarans)
	router.Get("/agama", handler.GetAgamas)
	router.Get("/wilayah", handler.GetWilayahs)
	router.Get("/aktifitas-kerjasama", handler.GetAktifitasKerjasama)
	router.Get("/basis-evaluasi", handler.GetBasisEvaluasi)
	router.Get("/fungsi-lab", handler.GetFungsiLab)
	router.Get("/gelar-akademik", handler.GetGelarAkademik)
	router.Get("/ikatan-kerja-sdm", handler.GetIkatanKerjaSdm)
}
