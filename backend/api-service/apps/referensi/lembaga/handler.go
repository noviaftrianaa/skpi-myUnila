package lembaga

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

func (h *Handler) GetLembagaAkred(c *fiber.Ctx) error {
	var params types.LembagaAkredParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetLembagaAkred(c.Context(), params)
	if err != nil {
		log.Printf("Error getting lembaga akred: %v", err)
		return response.InternalError(c, "Gagal mengambil data lembaga akred")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data lembaga akred", data, params.Page, params.Limit, total)
}

func (h *Handler) GetLembagaPengangkat(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetLembagaPengangkat(c.Context(), params)
	if err != nil {
		log.Printf("Error getting lembaga pengangkat: %v", err)
		return response.InternalError(c, "Gagal mengambil data lembaga pengangkat")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data lembaga pengangkat", data, params.Page, params.Limit, total)
}

func (h *Handler) GetLembagaSertifikasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetLembagaSertifikasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting lembaga sertifikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data lembaga sertifikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data lembaga sertifikasi", data, params.Page, params.Limit, total)
}
