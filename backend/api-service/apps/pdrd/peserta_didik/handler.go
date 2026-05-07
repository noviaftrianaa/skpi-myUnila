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

// GetPesertaDidikDetail returns list of peserta didik with join lookup tables
func (h *Handler) GetPesertaDidikDetail(c *fiber.Ctx) error {
	var params types.PesertaDidikDetailParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPesertaDidikDetail(c.Context(), params)
	if err != nil {
		log.Printf("Error getting peserta didik detail: %v", err)
		return response.InternalError(c, "Gagal mengambil data peserta didik")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data peserta didik", data, params.Page, params.Limit, total)
}

// GetRegPd returns list of reg_pd dengan data peserta didik dan lookup tables.
//
// Pakai paling tidak SATU filter (id_reg_pd / id_pd / id_sms / id_jns_keluar /
// tahun_lulus / search) untuk hindari unbounded query. Kalau semua kosong
// dataset bakal puluhan ribu rows (alumni + aktif gabung).
func (h *Handler) GetRegPd(c *fiber.Ctx) error {
	var params types.RegPdParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	// Wajib ada minimal satu filter (cegah tarik full table)
	hasFilter := params.IDRegPd != "" ||
		params.IDPd != nil ||
		params.IDSms != nil ||
		params.IDSP != nil ||
		params.IDJnsKeluar != nil ||
		params.TahunLulus != nil ||
		params.Search != ""

	if !hasFilter {
		return response.BadRequest(c, "Wajib pakai minimal satu filter: id_reg_pd, id_pd, id_sms, id_sp, id_jns_keluar, tahun_lulus, atau search", nil)
	}

	data, total, err := h.svc.GetRegPd(c.Context(), params)
	if err != nil {
		log.Printf("Error getting reg_pd: %v", err)
		return response.InternalError(c, "Gagal mengambil data registrasi peserta didik")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data registrasi peserta didik", data, params.Page, params.Limit, total)
}

// GetStatusKuliahMahasiswa returns data kuliah per semester dari tabel kuliah_mhs
func (h *Handler) GetStatusKuliahMahasiswa(c *fiber.Ctx) error {
	var params types.StatusKuliahMahasiswaParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	if params.IDRegPd == "" {
		return response.BadRequest(c, "Parameter id_reg_pd wajib diisi", nil)
	}

	data, total, err := h.svc.GetStatusKuliahMahasiswa(c.Context(), params)
	if err != nil {
		log.Printf("Error getting status kuliah mahasiswa: %v", err)
		return response.InternalError(c, "Gagal mengambil data status kuliah mahasiswa")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status kuliah mahasiswa", data, params.Page, params.Limit, total)
}
