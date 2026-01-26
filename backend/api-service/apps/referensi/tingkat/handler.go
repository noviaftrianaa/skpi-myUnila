package tingkat

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetTingkatKerjasama(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTingkatKerjasama(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tingkat kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data tingkat kerjasama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tingkat kerjasama", data, params.Page, params.Limit, total)
}

func (h *Handler) GetTingkatPenghargaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTingkatPenghargaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tingkat penghargaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data tingkat penghargaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tingkat penghargaan", data, params.Page, params.Limit, total)
}

func (h *Handler) GetTingkatPrestasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTingkatPrestasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tingkat prestasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data tingkat prestasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tingkat prestasi", data, params.Page, params.Limit, total)
}
