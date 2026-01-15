package diklat

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
)

// Handler menangani HTTP request untuk diklat
type Handler struct {
	svc Service
}

// NewHandler membuat instance handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetDiklat(c *fiber.Ctx) error {
	var params DiklatParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	diklats, total, err := h.svc.GetDiklat(c.Context(), params)
	if err != nil {
		return response.InternalError(c, "Gagal mengambil data diklat")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data diklat", diklats, params.Page, params.Limit, total)
}

func (h *Handler) GetDiklatByID(c *fiber.Ctx) error {
	ID := c.Params("id")

	diklat, err := h.svc.GetDiklatByID(c.Context(), ID)
	if err != nil {
		if err.Error() == "data diklat tidak ditemukan" {
			return response.NotFound(c, "Data diklat tidak ditemukan")
		}
		return response.InternalError(c, "Gagal mengambil data diklat")
	}

	return response.Success(c, "Berhasil mengambil data diklat", diklat)
}

func (h *Handler) CreateDiklat(c *fiber.Ctx) error {
	var req DiklatCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Request tidak valid", map[string]string{"error": err.Error()})
	}

	ID, err := h.svc.CreateDiklat(c.Context(), req)
	if err != nil {
		log.Printf("Error service creating diklat: %v", err)
		return response.InternalError(c, "Gagal membuat data diklat")
	}

	return response.Success(c, "Berhasil membuat data diklat", map[string]string{"id_diklat": ID})
}

func (h *Handler) UpdateDiklat(c *fiber.Ctx) error {
	var req DiklatUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Request tidak valid", map[string]string{"error": err.Error()})
	}

	ID, err := h.svc.UpdateDiklat(c.Context(), req)
	if err != nil {
		if err.Error() == "data diklat tidak ditemukan" {
			return response.NotFound(c, "Data diklat tidak ditemukan")
		}
		return response.InternalError(c, "Gagal memperbarui data diklat")
	}

	return response.Success(c, "Berhasil memperbarui data diklat", map[string]string{"id_diklat": ID})
}

func (h *Handler) DeleteDiklat(c *fiber.Ctx) error {
	ID := c.Params("id")

	err := h.svc.DeleteDiklat(c.Context(), ID)
	if err != nil {
		if err.Error() == "data diklat tidak ditemukan" {
			return response.NotFound(c, "Data diklat tidak ditemukan")
		}
		return response.InternalError(c, "Gagal menghapus data diklat")
	}

	return response.Success(c, "Berhasil menghapus data diklat", nil)
}
