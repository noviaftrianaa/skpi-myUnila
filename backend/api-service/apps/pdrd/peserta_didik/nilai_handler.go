package pesertadidik

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
)

// NilaiSmtMhs — GET /list_nilai_smt
func (h *Handler) GetNilaiSmtMhs(c *fiber.Ctx) error {
	var p types.NilaiSmtParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetNilaiSmtMhs(c.Context(), p)
	if err != nil {
		log.Printf("nilai_smt: %v", err)
		return response.InternalError(c, "Gagal mengambil nilai per semester")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil nilai per semester", data, p.Page, p.Limit, total)
}

// NilaiTranskrip — GET /list_nilai_transkrip
func (h *Handler) GetNilaiTranskrip(c *fiber.Ctx) error {
	var p types.NilaiTranskripParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	if p.IDRegPd == nil && p.Nipd == nil {
		return response.BadRequest(c, "Parameter id_reg_pd atau nipd wajib diisi", nil)
	}
	data, total, err := h.svc.GetNilaiTranskrip(c.Context(), p)
	if err != nil {
		log.Printf("transkrip: %v", err)
		return response.InternalError(c, "Gagal mengambil transkrip")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil transkrip nilai", data, p.Page, p.Limit, total)
}

// KehadiranMhs — GET /list_kehadiran_mhs
func (h *Handler) GetKehadiranMhs(c *fiber.Ctx) error {
	var p types.KehadiranMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKehadiranMhs(c.Context(), p)
	if err != nil {
		log.Printf("kehadiran: %v", err)
		return response.InternalError(c, "Gagal mengambil data kehadiran")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil kehadiran mahasiswa", data, p.Page, p.Limit, total)
}

// AktMhs — GET /list_aktivitas_mhs
func (h *Handler) GetAktMhs(c *fiber.Ctx) error {
	var p types.AktMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetAktMhs(c.Context(), p)
	if err != nil {
		log.Printf("akt_mhs: %v", err)
		return response.InternalError(c, "Gagal mengambil aktivitas mahasiswa")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data aktivitas mahasiswa", data, p.Page, p.Limit, total)
}
