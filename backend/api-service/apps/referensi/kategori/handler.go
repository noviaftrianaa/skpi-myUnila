package kategori

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/response"
)

// Handler adalah interface untuk handler kategori
type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// KategoriCapaianIuran returns list of kategori capaian iuran with pagination
func (h *Handler) KategoriCapaianIuran(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKategoriCapaianIuran(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kategori capaian iuran: %v", err)
		return response.InternalError(c, "Gagal mengambil data kategori capaian iuran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kategori capaian iuran", data, params.Page, params.Limit, total)
}

// KategoriKegiatan returns list of kategori kegiatan with pagination
func (h *Handler) KategoriKegiatan(c *fiber.Ctx) error {
	var params types.KategoriKegiatanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKategoriKegiatan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kategori kegiatan: %v", err)
		return response.InternalError(c, "Gagal mengambil data kategori kegiatan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kategori kegiatan", data, params.Page, params.Limit, total)
}

// KategoriTabel returns list of kategori tabel with pagination
func (h *Handler) KategoriTabel(c *fiber.Ctx) error {
	var params types.KategoriTabelParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKategoriTabel(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kategori tabel: %v", err)
		return response.InternalError(c, "Gagal mengambil data kategori tabel")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kategori tabel", data, params.Page, params.Limit, total)
}
