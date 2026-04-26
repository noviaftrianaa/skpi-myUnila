package ktwraw

import (
	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GET /v1/dashboard/ktw/raw/per-fakultas
func (h *Handler) PerFakultas(c *fiber.Ctx) error {
	var p PerFakultasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "invalid query params: "+err.Error(), nil)
	}
	if p.Cohort == 0 {
		return response.BadRequest(c, "param 'cohort' wajib diisi (tahun angkatan, mis. 2020)", nil)
	}
	rows, err := h.svc.GetPerFakultas(c.Context(), p)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Success(c, "Berhasil mengambil KTW per fakultas", fiber.Map{
		"data": rows,
		"meta": fiber.Map{
			"cohort":             p.Cohort,
			"jenjang":            ifEmpty(p.Jenjang, "S1"),
			"masa_normatif_thn":  MasaNormatif[ifEmpty(p.Jenjang, "S1")],
			"cutoff":             ifEmpty(p.Cutoff, "today"),
			"definisi":           "strict",
			"total_fakultas":     len(rows),
		},
	})
}

// GET /v1/dashboard/ktw/raw/per-prodi
func (h *Handler) PerProdi(c *fiber.Ctx) error {
	var p PerProdiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "invalid query params: "+err.Error(), nil)
	}
	if p.Cohort == 0 {
		return response.BadRequest(c, "param 'cohort' wajib diisi", nil)
	}
	rows, err := h.svc.GetPerProdi(c.Context(), p)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Success(c, "Berhasil mengambil KTW per prodi", fiber.Map{
		"data": rows,
		"meta": fiber.Map{
			"cohort":            p.Cohort,
			"jenjang":           ifEmpty(p.Jenjang, "S1"),
			"masa_normatif_thn": MasaNormatif[ifEmpty(p.Jenjang, "S1")],
			"id_fakultas":       p.IDFakultas,
			"cutoff":            ifEmpty(p.Cutoff, "today"),
			"definisi":          "strict",
			"total_prodi":       len(rows),
		},
	})
}

// GET /v1/dashboard/ktw/raw/per-jenjang
func (h *Handler) PerJenjang(c *fiber.Ctx) error {
	var p PerJenjangParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "invalid query params: "+err.Error(), nil)
	}
	if p.Cohort == 0 {
		return response.BadRequest(c, "param 'cohort' wajib diisi", nil)
	}
	rows, err := h.svc.GetPerJenjang(c.Context(), p)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Success(c, "Berhasil mengambil KTW per jenjang", fiber.Map{
		"data": rows,
		"meta": fiber.Map{
			"cohort":      p.Cohort,
			"id_fakultas": p.IDFakultas,
			"cutoff":      ifEmpty(p.Cutoff, "today"),
			"definisi":    "strict",
		},
	})
}

// GET /v1/dashboard/ktw/raw/mahasiswa
func (h *Handler) ListMahasiswa(c *fiber.Ctx) error {
	var p MahasiswaListParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "invalid query params: "+err.Error(), nil)
	}
	if p.Cohort == 0 {
		return response.BadRequest(c, "param 'cohort' wajib diisi (tahun angkatan)", nil)
	}
	if p.Jenjang == "" {
		return response.BadRequest(c, "param 'jenjang' wajib diisi (D3|D4|S1|S2|S3)", nil)
	}
	rows, total, err := h.svc.ListMahasiswa(c.Context(), p)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	if p.Limit <= 0 {
		p.Limit = 20
	}
	if p.Page <= 0 {
		p.Page = 1
	}
	totalPages := (total + p.Limit - 1) / p.Limit
	return response.Success(c, "Berhasil mengambil daftar mahasiswa KTW", fiber.Map{
		"data": rows,
		"meta": fiber.Map{
			"cohort":            p.Cohort,
			"jenjang":           p.Jenjang,
			"masa_normatif_thn": MasaNormatif[p.Jenjang],
			"id_fakultas":       p.IDFakultas,
			"id_sms":            p.IDProdi,
			"status_ktw":        p.StatusKtw,
			"search":            p.Search,
			"cutoff":            ifEmpty(p.Cutoff, "today"),
			"page":              p.Page,
			"limit":             p.Limit,
			"total":             total,
			"total_pages":       totalPages,
		},
	})
}

func ifEmpty(s, def string) string {
	if s == "" {
		return def
	}
	return s
}
