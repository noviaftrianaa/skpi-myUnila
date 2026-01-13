package referensi

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
)

// Handler menangani HTTP request untuk referensi
type Handler struct {
	svc Service
}

// NewHandler membuat instance handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetSemesters returns list of semesters with pagination
func (h *Handler) GetSemesters(c *fiber.Ctx) error {
	var params SemesterParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	semesters, total, err := h.svc.GetSemesters(c.Context(), params)
	if err != nil {
		log.Printf("Error getting semesters: %v", err)
		return response.InternalError(c, "Gagal mengambil data semester")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data semester", semesters, params.Page, params.Limit, total)
}

// GetTahunAjarans returns list of academic years with pagination
func (h *Handler) GetTahunAjarans(c *fiber.Ctx) error {
	var params TahunAjaranParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	tahunAjarans, total, err := h.svc.GetTahunAjarans(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tahun_ajaran: %v", err)
		return response.InternalError(c, "Gagal mengambil data tahun ajaran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tahun ajaran", tahunAjarans, params.Page, params.Limit, total)
}

// GetAgamas returns list of religions with pagination
func (h *Handler) GetAgamas(c *fiber.Ctx) error {
	var params PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	agamas, total, err := h.svc.GetAgamas(c.Context(), params)
	if err != nil {
		log.Printf("Error getting agama: %v", err)
		return response.InternalError(c, "Gagal mengambil data agama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data agama", agamas, params.Page, params.Limit, total)
}

// GetWilayahs returns list of regions with pagination and level filter
func (h *Handler) GetWilayahs(c *fiber.Ctx) error {
	var params WilayahParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	wilayahs, total, err := h.svc.GetWilayahs(c.Context(), params)
	if err != nil {
		log.Printf("Error getting wilayah: %v", err)
		return response.InternalError(c, "Gagal mengambil data wilayah")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data wilayah", wilayahs, params.Page, params.Limit, total)
}
