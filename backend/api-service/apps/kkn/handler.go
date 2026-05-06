package kkn

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

// ============================================================================
// Peserta KKN
// ============================================================================

func (h *Handler) ListPeserta(c *fiber.Ctx) error {
	var p PesertaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListPeserta(c.Context(), p)
	if err != nil {
		log.Printf("kkn.peserta: %v", err)
		return response.InternalError(c, "Gagal mengambil data peserta KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data peserta KKN", data, p.Page, p.Limit, total)
}

func (h *Handler) DetailPeserta(c *fiber.Ctx) error {
	npm := strings.TrimSpace(c.Query("npm"))
	if npm == "" {
		return response.BadRequest(c, "Parameter npm wajib diisi", nil)
	}
	m, err := h.svc.DetailPeserta(c.Context(), npm)
	if err != nil {
		log.Printf("kkn.peserta detail: %v", err)
		return response.InternalError(c, "Gagal mengambil detail peserta KKN")
	}
	if m == nil {
		return response.NotFound(c, "Peserta KKN tidak ditemukan")
	}
	return response.Success(c, "OK", m)
}

// ============================================================================
// Kelompok KKN
// ============================================================================

func (h *Handler) ListKelompok(c *fiber.Ctx) error {
	var p KelompokParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKelompok(c.Context(), p)
	if err != nil {
		log.Printf("kkn.kelompok: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelompok KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelompok KKN", data, p.Page, p.Limit, total)
}

// ============================================================================
// DPL (Dosen Pembimbing Lapangan)
// ============================================================================

func (h *Handler) ListDPL(c *fiber.Ctx) error {
	var p DPLParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListDPL(c.Context(), p)
	if err != nil {
		log.Printf("kkn.dpl: %v", err)
		return response.InternalError(c, "Gagal mengambil data DPL KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data DPL KKN", data, p.Page, p.Limit, total)
}

// ============================================================================
// Nilai Mahasiswa KKN
// ============================================================================

func (h *Handler) ListNilai(c *fiber.Ctx) error {
	var p NilaiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListNilai(c.Context(), p)
	if err != nil {
		log.Printf("kkn.nilai: %v", err)
		return response.InternalError(c, "Gagal mengambil data nilai KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data nilai KKN", data, p.Page, p.Limit, total)
}

// ============================================================================
// Periode KKN
// ============================================================================

func (h *Handler) ListPeriode(c *fiber.Ctx) error {
	var p PeriodeParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListPeriode(c.Context(), p)
	if err != nil {
		log.Printf("kkn.periode: %v", err)
		return response.InternalError(c, "Gagal mengambil data periode KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data periode KKN", data, p.Page, p.Limit, total)
}

// ============================================================================
// Lokasi KKN
// ============================================================================

func (h *Handler) ListLokasi(c *fiber.Ctx) error {
	var p LokasiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListLokasi(c.Context(), p)
	if err != nil {
		log.Printf("kkn.lokasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data lokasi KKN")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data lokasi KKN", data, p.Page, p.Limit, total)
}
