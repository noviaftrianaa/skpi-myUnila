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
	router.Get("/tahun_ajaran", handler.GetTahunAjarans)
	router.Get("/agama", handler.GetAgamas)
	router.Get("/wilayah", handler.GetWilayahs)
	router.Get("/aktifitas_kerjasama", handler.GetAktifitasKerjasama)
	router.Get("/basis_evaluasi", handler.GetBasisEvaluasi)
	router.Get("/fungsi_lab", handler.GetFungsiLab)
	router.Get("/gelar_akademik", handler.GetGelarAkademik)
	router.Get("/ikatan_kerja_sdm", handler.GetIkatanKerjaSdm)
	router.Get("/jalur_daftar", handler.GetJalurDaftar)
	router.Get("/jenjang_pendidikan", handler.GetJenjangPendidikan)
	router.Get("/jurusan", handler.GetJurusan)
}
