package peta

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

func (h *Handler) GetPetaKatgiatJabfung(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPetaKatgiatJabfung(c.Context(), params)
	if err != nil {
		log.Printf("Error getting peta katgiat jabfung: %v", err)
		return response.InternalError(c, "Gagal mengambil data peta katgiat jabfung")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data peta katgiat jabfung", data, params.Page, params.Limit, total)
}

func (h *Handler) GetPetaKatgiatJnsdok(c *fiber.Ctx) error {
	var params types.PetaKatgiatJnsdokParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPetaKatgiatJnsdok(c.Context(), params)
	if err != nil {
		log.Printf("Error getting peta katgiat jnsdok: %v", err)
		return response.InternalError(c, "Gagal mengambil data peta katgiat jnsdok")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data peta katgiat jnsdok", data, params.Page, params.Limit, total)
}

func (h *Handler) GetPetaKatgiatJnspub(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPetaKatgiatJnspub(c.Context(), params)
	if err != nil {
		log.Printf("Error getting peta katgiat jnspub: %v", err)
		return response.InternalError(c, "Gagal mengambil data peta katgiat jnspub")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data peta katgiat jnspub", data, params.Page, params.Limit, total)
}
