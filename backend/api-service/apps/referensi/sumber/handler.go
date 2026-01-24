package sumber

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

func (h *Handler) GetSumberAir(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSumberAir(c.Context(), params)
	if err != nil {
		log.Printf("Error getting sumber air: %v", err)
		return response.InternalError(c, "Gagal mengambil data sumber air")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data sumber air", data, params.Page, params.Limit, total)
}

func (h *Handler) GetSumberDana(c *fiber.Ctx) error {
	var params types.SumberDanaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSumberDana(c.Context(), params)
	if err != nil {
		log.Printf("Error getting sumber dana: %v", err)
		return response.InternalError(c, "Gagal mengambil data sumber dana")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data sumber dana", data, params.Page, params.Limit, total)
}

func (h *Handler) GetSumberGaji(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSumberGaji(c.Context(), params)
	if err != nil {
		log.Printf("Error getting sumber gaji: %v", err)
		return response.InternalError(c, "Gagal mengambil data sumber gaji")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data sumber gaji", data, params.Page, params.Limit, total)
}

func (h *Handler) GetSumberListrik(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSumberListrik(c.Context(), params)
	if err != nil {
		log.Printf("Error getting sumber listrik: %v", err)
		return response.InternalError(c, "Gagal mengambil data sumber listrik")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data sumber listrik", data, params.Page, params.Limit, total)
}
