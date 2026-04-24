package siakadu

import (
	"errors"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

// ============================================================================
// 11a — Mahasiswa + SDM + Wisuda
// ============================================================================

func (h *Handler) ListMahasiswa(c *fiber.Ctx) error {
	var p MahasiswaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListMahasiswa(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.mhs: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa", data, p.Page, p.Limit, total)
}

func (h *Handler) DetailMahasiswa(c *fiber.Ctx) error {
	nim := strings.TrimSpace(c.Query("nim"))
	if nim == "" {
		return response.BadRequest(c, "Parameter nim wajib diisi", nil)
	}
	m, err := h.svc.DetailMahasiswa(c.Context(), nim)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Mahasiswa tidak ditemukan")
	}
	if err != nil {
		log.Printf("siakadu.mhs detail: %v", err)
		return response.InternalError(c, "Gagal mengambil detail mahasiswa")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) ListKeluargaMhs(c *fiber.Ctx) error {
	var p KeluargaMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKeluargaMhs(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.keluarga: %v", err)
		return response.InternalError(c, "Gagal mengambil data keluarga mahasiswa")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data keluarga mahasiswa", data, p.Page, p.Limit, total)
}

func (h *Handler) ListSdm(c *fiber.Ctx) error {
	var p SdmParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListSdm(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.sdm: %v", err)
		return response.InternalError(c, "Gagal mengambil data SDM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data SDM", data, p.Page, p.Limit, total)
}

func (h *Handler) DetailSdm(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Query("id_sdm"))
	if id == "" {
		return response.BadRequest(c, "Parameter id_sdm wajib diisi", nil)
	}
	m, err := h.svc.DetailSdm(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "SDM tidak ditemukan")
	}
	if err != nil {
		log.Printf("siakadu.sdm detail: %v", err)
		return response.InternalError(c, "Gagal mengambil detail SDM")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) ListRegPtk(c *fiber.Ctx) error {
	var p RegPtkParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListRegPtk(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.reg_ptk: %v", err)
		return response.InternalError(c, "Gagal mengambil data penugasan PTK")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data penugasan PTK", data, p.Page, p.Limit, total)
}

func (h *Handler) ListWisuda(c *fiber.Ctx) error {
	var p WisudaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListWisuda(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.wisuda: %v", err)
		return response.InternalError(c, "Gagal mengambil data wisuda")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data wisuda", data, p.Page, p.Limit, total)
}

func (h *Handler) ListPeriodeWisuda(c *fiber.Ctx) error {
	var p PeriodeWisudaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListPeriodeWisuda(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.periode_wisuda: %v", err)
		return response.InternalError(c, "Gagal mengambil data periode wisuda")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data periode wisuda", data, p.Page, p.Limit, total)
}

// ============================================================================
// 11b — Nilai + Kehadiran + Kinerja
// ============================================================================

func (h *Handler) ListNilaiSmt(c *fiber.Ctx) error {
	var p NilaiSmtParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListNilaiSmt(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.nilai_smt: %v", err)
		return response.InternalError(c, "Gagal mengambil data nilai semester")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data nilai semester", data, p.Page, p.Limit, total)
}

func (h *Handler) ListNilaiTranskrip(c *fiber.Ctx) error {
	var p NilaiTranskripParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListNilaiTranskrip(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.transkrip: %v", err)
		return response.InternalError(c, "Gagal mengambil data transkrip")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data transkrip", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKehadiranMhs(c *fiber.Ctx) error {
	var p KehadiranMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKehadiranMhs(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.kehadiran_mhs: %v", err)
		return response.InternalError(c, "Gagal mengambil data kehadiran mahasiswa")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kehadiran mahasiswa", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKehadiranSdm(c *fiber.Ctx) error {
	var p KehadiranSdmParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKehadiranSdm(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.kehadiran_sdm: %v", err)
		return response.InternalError(c, "Gagal mengambil data kehadiran SDM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kehadiran SDM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKinerjaDosen(c *fiber.Ctx) error {
	var p KinerjaDosenParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKinerjaDosen(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.kinerja: %v", err)
		return response.InternalError(c, "Gagal mengambil data kinerja dosen")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kinerja dosen", data, p.Page, p.Limit, total)
}

// ============================================================================
// 11c — Keuangan + Status Kuliah + Unit
// ============================================================================

func (h *Handler) ListSppMhs(c *fiber.Ctx) error {
	var p SppMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListSppMhs(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.spp: %v", err)
		return response.InternalError(c, "Gagal mengambil data pembayaran SPP")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pembayaran SPP", data, p.Page, p.Limit, total)
}

func (h *Handler) ListDaftarUkt(c *fiber.Ctx) error {
	var p DaftarUktParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListDaftarUkt(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.daftar_ukt: %v", err)
		return response.InternalError(c, "Gagal mengambil data daftar UKT")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data daftar UKT", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKelasUkt(c *fiber.Ctx) error {
	var p KelasUktParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKelasUkt(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.kelas_ukt: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelas UKT")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelas UKT", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKuliahMhs(c *fiber.Ctx) error {
	var p KuliahMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKuliahMhs(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.kuliah_mhs: %v", err)
		return response.InternalError(c, "Gagal mengambil data status kuliah mahasiswa")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data status kuliah mahasiswa", data, p.Page, p.Limit, total)
}

func (h *Handler) ListPimpinanUnit(c *fiber.Ctx) error {
	var p PimpinanUnitParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListPimpinanUnit(c.Context(), p)
	if err != nil {
		log.Printf("siakadu.pimpinan_unit: %v", err)
		return response.InternalError(c, "Gagal mengambil data pimpinan unit")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pimpinan unit", data, p.Page, p.Limit, total)
}
