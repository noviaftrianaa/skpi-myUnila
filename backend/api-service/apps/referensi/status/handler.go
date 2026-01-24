package status

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

func (h *Handler) GetStatusKepegawaian(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusKepegawaian(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status kepegawaian: %v", err)
		return response.InternalError(c, "Gagal mengambil data status kepegawaian")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status kepegawaian", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusKepemilikan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusKepemilikan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status kepemilikan: %v", err)
		return response.InternalError(c, "Gagal mengambil data status kepemilikan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status kepemilikan", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusKerjasama(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusKerjasama(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data status kerjasama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status kerjasama", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusMahasiswa(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusMahasiswa(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status mahasiswa: %v", err)
		return response.InternalError(c, "Gagal mengambil data status mahasiswa")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status mahasiswa", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusMilikSarpras(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusMilikSarpras(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status milik sarpras: %v", err)
		return response.InternalError(c, "Gagal mengambil data status milik sarpras")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status milik sarpras", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusAnak(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusAnak(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status anak: %v", err)
		return response.InternalError(c, "Gagal mengambil data status anak")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status anak", data, params.Page, params.Limit, total)
}

func (h *Handler) GetStatusKeaktifanPegawai(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetStatusKeaktifanPegawai(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status keaktifan pegawai: %v", err)
		return response.InternalError(c, "Gagal mengambil data status keaktifan pegawai")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status keaktifan pegawai", data, params.Page, params.Limit, total)
}
