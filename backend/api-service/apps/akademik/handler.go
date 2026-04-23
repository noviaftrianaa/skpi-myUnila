package akademik

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

// GET /matkul — list ringkas (tanpa join)
func (h *Handler) ListMatkul(c *fiber.Ctx) error {
	var p MatkulParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetMatkulList(c.Context(), p)
	if err != nil {
		log.Printf("matkul list: %v", err)
		return response.InternalError(c, "Gagal mengambil data matkul")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data mata kuliah", data, p.Page, p.Limit, total)
}

// GET /detail_matkul — join ref jenis_mk/kelompok_mk/jenjang
func (h *Handler) DetailMatkul(c *fiber.Ctx) error {
	var p MatkulParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetMatkulDetail(c.Context(), p)
	if err != nil {
		log.Printf("matkul detail: %v", err)
		return response.InternalError(c, "Gagal mengambil detail matkul")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil detail mata kuliah", data, p.Page, p.Limit, total)
}

// GET /kelas_kuliah
func (h *Handler) ListKelasKuliah(c *fiber.Ctx) error {
	var p KelasKuliahParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKelasKuliah(c.Context(), p)
	if err != nil {
		log.Printf("kelas: %v", err)
		return response.InternalError(c, "Gagal mengambil data kelas kuliah")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kelas kuliah", data, p.Page, p.Limit, total)
}

// GET /jadwal_kelas
func (h *Handler) ListJadwalKelas(c *fiber.Ctx) error {
	var p JadwalKelasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetJadwalKelas(c.Context(), p)
	if err != nil {
		log.Printf("jadwal: %v", err)
		return response.InternalError(c, "Gagal mengambil data jadwal kelas")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jadwal kelas", data, p.Page, p.Limit, total)
}

// GET /kurikulum
func (h *Handler) ListKurikulum(c *fiber.Ctx) error {
	var p KurikulumParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKurikulum(c.Context(), p)
	if err != nil {
		log.Printf("kurikulum: %v", err)
		return response.InternalError(c, "Gagal mengambil data kurikulum")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kurikulum", data, p.Page, p.Limit, total)
}
