package pesertadidik

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
)

// Handler adalah HTTP handler untuk mahasiswa/peserta didik
type Handler struct {
	svc Service
}

// NewHandler membuat instance handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetPesertaDidik returns list of mahasiswa with pagination
func (h *Handler) GetPesertaDidik(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPesertaDidik(c.Context(), params)
	if err != nil {
		log.Printf("Error getting peserta didik: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa", data, params.Page, params.Limit, total)
}

// GetListMahasiswaByRegis returns list of mahasiswa filtered by jenis pendaftaran
func (h *Handler) GetListMahasiswaByRegis(c *fiber.Ctx) error {
	var params types.ListRegisMahasiswaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetListMahasiswaByRegis(c.Context(), params)
	if err != nil {
		log.Printf("Error getting list mahasiswa by regis: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa berdasarkan jenis pendaftaran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa berdasarkan jenis pendaftaran", data, params.Page, params.Limit, total)
}

// GetListMahasiswaByStatus returns list of mahasiswa filtered by status
func (h *Handler) GetListMahasiswaByStatus(c *fiber.Ctx) error {
	var params types.ListStatusMahasiswaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetListMahasiswaByStatus(c.Context(), params)
	if err != nil {
		log.Printf("Error getting list mahasiswa by status: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa berdasarkan status")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa berdasarkan status", data, params.Page, params.Limit, total)
}

// GetSemesterKeaktifan returns semester keaktifan for a specific mahasiswa
func (h *Handler) GetSemesterKeaktifan(c *fiber.Ctx) error {
	var params types.SemesterKeaktifanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	if params.IDRegPd == "" {
		return response.BadRequest(c, "Parameter id_reg_pd wajib diisi", nil)
	}

	data, err := h.svc.GetSemesterKeaktifan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting semester keaktifan: %v", err)
		return response.InternalError(c, "Gagal mengambil data semester keaktifan")
	}

	return response.Success(c, "Berhasil mengambil data semester keaktifan", data)
}

// GetDetailMahasiswa returns detailed profile of a mahasiswa
func (h *Handler) GetDetailMahasiswa(c *fiber.Ctx) error {
	var params types.DetailMahasiswaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	if params.IDPd == nil && params.IDRegPd == nil && params.NIPD == nil {
		return response.BadRequest(c, "Minimal salah satu parameter (id_pd, id_reg_pd, atau nipd) harus diisi", nil)
	}

	data, err := h.svc.GetDetailMahasiswa(c.Context(), params)
	if err != nil {
		log.Printf("Error getting detail mahasiswa: %v", err)
		return response.InternalError(c, "Gagal mengambil detail mahasiswa")
	}

	return response.Success(c, "Berhasil mengambil detail mahasiswa", data)
}

// GetListAlumni returns list of alumni filtered by graduation year and prodi
func (h *Handler) GetListAlumni(c *fiber.Ctx) error {
	var params types.ListAlumniParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetListAlumni(c.Context(), params)
	if err != nil {
		log.Printf("Error getting list alumni: %v", err)
		return response.InternalError(c, "Gagal mengambil data alumni")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data alumni", data, params.Page, params.Limit, total)
}

// GetMahasiswaLuarPT returns list of mahasiswa luar PT (MBKM)
func (h *Handler) GetMahasiswaLuarPT(c *fiber.Ctx) error {
	var params types.LuarPTParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetMahasiswaLuarPT(c.Context(), params)
	if err != nil {
		log.Printf("Error getting mahasiswa luar PT: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa luar PT")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa luar PT", data, params.Page, params.Limit, total)
}
