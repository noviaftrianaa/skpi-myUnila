package siakadu

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutesWithMiddleware mount /v1/siakadu/* — 18 endpoint GET-only
// membaca data dari schema siakadu di pdut. Write tetap di myunila-service.
func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/siakadu", middlewares...)
	} else {
		g = router.Group("/siakadu", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	// 11a
	g.Get("/list_mahasiswa", h.ListMahasiswa)
	g.Get("/detail_mahasiswa", h.DetailMahasiswa)
	g.Get("/list_keluarga_mhs", h.ListKeluargaMhs)
	g.Get("/list_sdm", h.ListSdm)
	g.Get("/detail_sdm", h.DetailSdm)
	g.Get("/list_reg_ptk", h.ListRegPtk)
	g.Get("/list_wisuda", h.ListWisuda)
	g.Get("/list_periode_wisuda", h.ListPeriodeWisuda)

	// 11b
	g.Get("/list_nilai_smt", h.ListNilaiSmt)
	g.Get("/list_nilai_transkrip", h.ListNilaiTranskrip)
	g.Get("/list_kehadiran_mhs", h.ListKehadiranMhs)
	g.Get("/list_kehadiran_sdm", h.ListKehadiranSdm)
	g.Get("/list_kinerja_dosen", h.ListKinerjaDosen)

	// 11c
	g.Get("/list_spp_mhs", h.ListSppMhs)
	g.Get("/list_daftar_ukt", h.ListDaftarUkt)
	g.Get("/list_kelas_ukt", h.ListKelasUkt)
	g.Get("/list_kuliah_mhs", h.ListKuliahMhs)
	g.Get("/list_pimpinan_unit", h.ListPimpinanUnit)
}
