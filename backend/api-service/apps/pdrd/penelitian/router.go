package penelitian

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk modul penelitian/publikasi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers (Repository -> Service -> Handler)
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	router.Get("/publikasi", handler.GetPublikasi)
	router.Get("/litabmas", handler.GetLitabmas)

	// Batch 9b — pivot tables
	router.Get("/list_tulis_pub", handler.GetTulisPub)
	router.Get("/list_mitra_litabmas", handler.GetMitraLitabmas)
	router.Get("/list_pd_anggota_litabmas", handler.GetPdAngLitabmas)
	router.Get("/list_sdm_anggota_litabmas", handler.GetSdmAnggotaLitabmas)
	router.Get("/list_non_ca_anggota_litabmas", handler.GetNonCaAnggotaLitabmas)
	router.Get("/list_non_ca", handler.GetNonCa)
}
