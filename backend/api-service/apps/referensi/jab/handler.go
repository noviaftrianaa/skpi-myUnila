package jab

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

// GetJabTgs returns list of jabTgs with pagination
func (h *Handler) GetJabTgs(c *fiber.Ctx) error {
	var params types.JabTgsParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJabTgss(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jabTgs: %v", err)
		return response.InternalError(c, "Gagal mengambil data jabTgs")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jabTgs", data, params.Page, params.Limit, total)
}

// GetJabFung returns list of jabFung with pagination
func (h *Handler) GetJabFung(c *fiber.Ctx) error {
	var params types.JabFungParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJabFungs(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jabFungs: %v", err)
		return response.InternalError(c, "Gagal mengambil data jabFungs")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jabFungs", data, params.Page, params.Limit, total)
}
