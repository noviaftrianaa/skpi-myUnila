package bentuk

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/response"
)

// Handler menangani HTTP request untuk referensi
type Handler struct {
	svc Service
}

// NewHandler membuat instance handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetBentukKegiatanKerjasama returns list of bentuk kegiatan kerjasama with pagination
func (h *Handler) GetBentukKegiatanKerjasama(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBentukKegiatanKerjasama(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bentuk kegiatan kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data bentuk kegiatan kerjasama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bentuk kegiatan kerjasama", data, params.Page, params.Limit, total)
}

// GetBentukPendidikan returns list of bentuk pendidikan with pagination
func (h *Handler) GetBentukPendidikan(c *fiber.Ctx) error {
	var params types.BentukPendidikanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBentukPendidikan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bentuk pendidikan: %v", err)
		return response.InternalError(c, "Gagal mengambil data bentuk pendidikan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bentuk pendidikan", data, params.Page, params.Limit, total)
}
