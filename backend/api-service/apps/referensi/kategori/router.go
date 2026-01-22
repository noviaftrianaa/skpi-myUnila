package kategori

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(router fiber.Router, h *Handler) {
	router.Get("/kategori_capaian_iuran", h.KategoriCapaianIuran)
	router.Get("/kategori_kegiatan", h.KategoriKegiatan)
	router.Get("/kategori_tabel", h.KategoriTabel)
}
