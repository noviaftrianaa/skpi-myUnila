package bidang

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

// GetBidangKerjasama returns list of bidang kerjasama with pagination
func (h *Handler) GetBidangKerjasama(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBidangKerjasama(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bidang kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data bidang kerjasama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang kerjasama", data, params.Page, params.Limit, total)
}

// GetBidangPekerjaan returns list of bidang pekerjaan with pagination
func (h *Handler) GetBidangPekerjaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBidangPekerjaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bidang pekerjaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data bidang pekerjaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang pekerjaan", data, params.Page, params.Limit, total)
}

// GetBidangStudi returns list of bidang studi with pagination
func (h *Handler) GetBidangStudi(c *fiber.Ctx) error {
	var params types.BidangStudiParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBidangStudi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bidang studi: %v", err)
		return response.InternalError(c, "Gagal mengambil data bidang studi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang studi", data, params.Page, params.Limit, total)
}

// GetBidangUsaha returns list of bidang usaha with pagination
func (h *Handler) GetBidangUsaha(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	bidangUsaha, total, err := h.svc.GetBidangUsaha(c.Context(), params)
	if err != nil {
		log.Printf("Error getting bidang usaha: %v", err)
		return response.InternalError(c, "Gagal mengambil data bidang usaha")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang usaha", bidangUsaha, params.Page, params.Limit, total)
}
