package kelompok

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

func (h *Handler) GetKelompokBidang(c *fiber.Ctx) error {
	var params types.KelompokBidangParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKelompokBidang(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kelompok bidang: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelompok bidang")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelompok bidang", data, params.Page, params.Limit, total)
}

func (h *Handler) GetKelompokMk(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKelompokMk(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kelompok mk: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelompok mk")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelompok mk", data, params.Page, params.Limit, total)
}

func (h *Handler) GetKelompokProfesi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKelompokProfesi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kelompok profesi: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelompok profesi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelompok profesi", data, params.Page, params.Limit, total)
}

func (h *Handler) GetKelompokUsaha(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKelompokUsaha(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kelompok usaha: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelompok usaha")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelompok usaha", data, params.Page, params.Limit, total)
}
