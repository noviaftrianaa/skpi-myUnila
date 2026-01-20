package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/bentuk"
	"github.com/myunila/api-service/apps/referensi/bidang"
	"github.com/myunila/api-service/apps/referensi/common"
	"github.com/myunila/api-service/apps/referensi/jab"
	"github.com/myunila/api-service/apps/referensi/jenis"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, rConn *redis.Client) {
	// Group referensi dengan JWT auth middleware
	ref := router.Group("/referensi", middleware.JWTAuth())
	ref.Use(middleware.RateLimiterMiddleware(rConn, middleware.DefaultRateLimiterConfig()))

	// Register subpackages
	bentuk.RegisterRoutes(ref, db, rConn)
	bidang.RegisterRoutes(ref, db, rConn)
	common.RegisterRoutes(ref, db, rConn)
	jab.RegisterRoutes(ref, db, rConn)
	jenis.RegisterRoutes(ref, db, rConn)

	// Endpoints (old - will be removed after full migration)
	// ref.Get("/semester", handler.GetSemesters)
	// ref.Get("/tahun-ajaran", handler.GetTahunAjarans)
	// ref.Get("/agama", handler.GetAgamas)
	// ref.Get("/wilayah", handler.GetWilayahs)
	// ref.Get("/aktifitas-kerjasama", handler.GetAktifitasKerjasama)
	// ref.Get("/basis-evaluasi", handler.GetBasisEvaluasi)
	// ref.Get("/bentuk-kegiatan-kerjasama", handler.GetBentukKegiatanKerjasama)
	// ref.Get("/bentuk-pendidikan", handler.GetBentukPendidikan)
	// ref.Get("/bidang-kerjasama", handler.GetBidangKerjasama)
	// ref.Get("/bidang-pekerjaan", handler.GetBidangPekerjaan)
	// ref.Get("/bidang-studi", handler.GetBidangStudi)
	// ref.Get("/bidang-usaha", handler.GetBidangUsaha)
	// ref.Get("/fungsi-lab", handler.GetFungsiLab)
	// ref.Get("/gelar-akademik", handler.GetGelarAkademik)
	// ref.Get("/ikatan-kerja-sdm", handler.GetIkatanKerjaSdm)
}
