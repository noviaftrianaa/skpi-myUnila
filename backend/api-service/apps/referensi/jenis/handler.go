package jenis

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/response"
)

// Handler adalah interface untuk handler jenis referensi
type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// JenisAktMhs returns list of jenis aktivitas mahasiswa with pagination
func (h *Handler) JenisAktMhs(c *fiber.Ctx) error {
	var params types.JenisAktMhsParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisAktMhs(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis aktivitas mahasiswa: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis aktivitas mahasiswa")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis aktivitas mahasiswa", data, params.Page, params.Limit, total)
}

// JenisBahanAjar returns list of jenis bahan ajar with pagination
func (h *Handler) JenisBahanAjar(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisBahanAjar(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis bahan ajar: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis bahan ajar")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis bahan ajar", data, params.Page, params.Limit, total)
}

// JenisBeasiswa returns list of jenis beasiswa with pagination
func (h *Handler) JenisBeasiswa(c *fiber.Ctx) error {
	var params types.JenisBeasiswaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisBeasiswa(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis beasiswa: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis beasiswa")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis beasiswa", data, params.Page, params.Limit, total)
}

// JenisDiklat returns list of jenis diklat with pagination
func (h *Handler) JenisDiklat(c *fiber.Ctx) error {
	var params types.JenisDiklatParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisDiklat(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis diklat: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis diklat")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis diklat", data, params.Page, params.Limit, total)
}

// JenisDokumen returns list of jenis dokumen with pagination
func (h *Handler) JenisDokumen(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisDokumen(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis dokumen: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis dokumen")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis dokumen", data, params.Page, params.Limit, total)
}

// JenisEvaluasi returns list of jenis evaluasi with pagination
func (h *Handler) JenisEvaluasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisEvaluasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis evaluasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis evaluasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis evaluasi", data, params.Page, params.Limit, total)
}

// JenisHapusBuku returns list of jenis hapus buku with pagination
func (h *Handler) JenisHapusBuku(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisHapusBuku(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis hapus buku: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis hapus buku")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis hapus buku", data, params.Page, params.Limit, total)
}

// JenisJalurPekerjaan returns list of jenis jalur pekerjaan with pagination
func (h *Handler) JenisJalurPekerjaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisJalurPekerjaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis jalur pekerjaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis jalur pekerjaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis jalur pekerjaan", data, params.Page, params.Limit, total)
}

// JenisKeluar returns list of jenis keluar with pagination
func (h *Handler) JenisKeluar(c *fiber.Ctx) error {
	var params types.JenisKeluarParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisKeluar(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis keluar: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis keluar")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis keluar", data, params.Page, params.Limit, total)
}

// JenisKepanitiaan returns list of jenis kepanitiaan with pagination
func (h *Handler) JenisKepanitiaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisKepanitiaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis kepanitiaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis kepanitiaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis kepanitiaan", data, params.Page, params.Limit, total)
}

// JenisKesejahteraan returns list of jenis kesejahteraan with pagination
func (h *Handler) JenisKesejahteraan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisKesejahteraan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis kesejahteraan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis kesejahteraan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis kesejahteraan", data, params.Page, params.Limit, total)
}

// JenisKeuangan returns list of jenis keuangan with pagination
func (h *Handler) JenisKeuangan(c *fiber.Ctx) error {
	var params types.JenisKeuanganParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisKeuangan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis keuangan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis keuangan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis keuangan", data, params.Page, params.Limit, total)
}

// JenisLembaga returns list of jenis lembaga with pagination
func (h *Handler) JenisLembaga(c *fiber.Ctx) error {
	var params types.JenisLembagaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisLembaga(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis lembaga: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis lembaga")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis lembaga", data, params.Page, params.Limit, total)
}

// JenisMediaPub returns list of jenis media publikasi with pagination
func (h *Handler) JenisMediaPub(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisMediaPub(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis media publikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis media publikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis media publikasi", data, params.Page, params.Limit, total)
}
