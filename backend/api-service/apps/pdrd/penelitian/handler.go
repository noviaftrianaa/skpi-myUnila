package penelitian

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
)

// Handler adalah HTTP handler untuk penelitian/publikasi
type Handler struct {
	svc Service
}

// NewHandler membuat instance handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetPublikasi returns list of publikasi with pagination
func (h *Handler) GetPublikasi(c *fiber.Ctx) error {
	var params types.PublikasiParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPublikasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting publikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data publikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data publikasi", data, params.Page, params.Limit, total)
}

// GetLitabmas returns list of litabmas (penelitian/pengabdian) with pagination
func (h *Handler) GetLitabmas(c *fiber.Ctx) error {
	var params types.LitabmasParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	if params.IDLitabmas == "" {
		return response.BadRequest(c, "Parameter id_litabmas wajib diisi", nil)
	}

	data, total, err := h.svc.GetLitabmas(c.Context(), params)
	if err != nil {
		log.Printf("Error getting litabmas: %v", err)
		return response.InternalError(c, "Gagal mengambil data litabmas")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data litabmas", data, params.Page, params.Limit, total)
}
