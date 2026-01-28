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

// JenisMk returns list of jenis mata kuliah with pagination
func (h *Handler) JenisMk(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisMk(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis mata kuliah: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis mata kuliah")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis mata kuliah", data, params.Page, params.Limit, total)
}

// JenisPendaftaran returns list of jenis pendaftaran with pagination
func (h *Handler) JenisPendaftaran(c *fiber.Ctx) error {
	var params types.JenisPendaftaranParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPendaftaran(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis pendaftaran: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis pendaftaran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis pendaftaran", data, params.Page, params.Limit, total)
}

// JenisPenelitian returns list of jenis penelitian with pagination
func (h *Handler) JenisPenelitian(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPenelitian(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis penelitian: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis penelitian")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis penelitian", data, params.Page, params.Limit, total)
}

// JenisPenghargaan returns list of jenis penghargaan with pagination
func (h *Handler) JenisPenghargaan(c *fiber.Ctx) error {
	var params types.JenisPenghargaanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPenghargaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis penghargaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis penghargaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis penghargaan", data, params.Page, params.Limit, total)
}

// JenisPrasarana returns list of jenis prasarana with pagination
func (h *Handler) JenisPrasarana(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPrasarana(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis prasarana: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis prasarana")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis prasarana", data, params.Page, params.Limit, total)
}

// JenisPrestasi returns list of jenis prestasi with pagination
func (h *Handler) JenisPrestasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPrestasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis prestasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis prestasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis prestasi", data, params.Page, params.Limit, total)
}

// JenisPublikasi returns list of jenis publikasi with pagination
func (h *Handler) JenisPublikasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisPublikasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis publikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis publikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis publikasi", data, params.Page, params.Limit, total)
}

// JenisSarana returns list of jenis sarana with pagination
func (h *Handler) JenisSarana(c *fiber.Ctx) error {
	var params types.JenisSaranaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisSarana(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis sarana: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis sarana")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis sarana", data, params.Page, params.Limit, total)
}

// JenisSdm returns list of jenis SDM with pagination
func (h *Handler) JenisSdm(c *fiber.Ctx) error {
	var params types.JenisSdmParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisSdm(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis SDM: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis SDM")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis SDM", data, params.Page, params.Limit, total)
}

// JenisSert returns list of jenis sertifikasi with pagination
func (h *Handler) JenisSert(c *fiber.Ctx) error {
	var params types.JenisSertParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisSert(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis sertifikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis sertifikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis sertifikasi", data, params.Page, params.Limit, total)
}

// JenisSms returns list of jenis SMS with pagination
func (h *Handler) JenisSms(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisSms(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis SMS: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis SMS")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis SMS", data, params.Page, params.Limit, total)
}

// JenisSubst returns list of jenis substansi with pagination
func (h *Handler) JenisSubst(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisSubst(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis substansi: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis substansi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis substansi", data, params.Page, params.Limit, total)
}

// JenisTes returns list of jenis tes with pagination
func (h *Handler) JenisTes(c *fiber.Ctx) error {
	var params types.JenisTesParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisTes(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis tes: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis tes")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis tes", data, params.Page, params.Limit, total)
}

// JenisTinggal returns list of jenis tinggal with pagination
func (h *Handler) JenisTinggal(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisTinggal(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis tinggal: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis tinggal")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis tinggal", data, params.Page, params.Limit, total)
}

// JenisTunjangan returns list of jenis tunjangan with pagination
func (h *Handler) JenisTunjangan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisTunjangan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis tunjangan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis tunjangan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis tunjangan", data, params.Page, params.Limit, total)
}

// JenisUnit returns list of jenis unit with pagination
func (h *Handler) JenisUnit(c *fiber.Ctx) error {
	var params types.JenisUnitParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenisUnit(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenis unit: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenis unit")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenis unit", data, params.Page, params.Limit, total)
}
