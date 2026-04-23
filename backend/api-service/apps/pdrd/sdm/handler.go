package sdm

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(svc Service) *Handler { return &Handler{svc: svc} }

// GetSDMList — /pdrd/list_sdm
// Source: pdrd.sdm (sync dari SISTER)
func (h *Handler) GetSDMList(c *fiber.Ctx) error {
	var p types.SDMParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetSDMList(c.Context(), p)
	if err != nil {
		log.Printf("SDM list error: %v", err)
		return response.InternalError(c, "Gagal mengambil data SDM")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data SDM", data, p.Page, p.Limit, total)
}

// GetSDMDetail — /pdrd/detail_sdm
func (h *Handler) GetSDMDetail(c *fiber.Ctx) error {
	var p types.SDMDetailParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	if p.IDSDM == nil && p.Nidn == nil && p.Nuptk == nil && p.Search == "" {
		return response.BadRequest(c, "Parameter id_sdm/nidn/nuptk/search wajib diisi salah satu", nil)
	}
	data, total, err := h.svc.GetSDMDetail(c.Context(), p)
	if err != nil {
		log.Printf("SDM detail error: %v", err)
		return response.InternalError(c, "Gagal mengambil detail SDM")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil detail SDM", data, p.Page, p.Limit, total)
}

// GetPenugasan — /pdrd/penugasan_sdm (reg_ptk)
func (h *Handler) GetPenugasan(c *fiber.Ctx) error {
	var p types.RegPtkParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPenugasan(c.Context(), p)
	if err != nil {
		log.Printf("Penugasan error: %v", err)
		return response.InternalError(c, "Gagal mengambil data penugasan")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data penugasan (reg_ptk)", data, p.Page, p.Limit, total)
}

// GetRiwayat — /pdrd/riwayat_sdm?type=X&id_sdm=...
// type: pend_formal | fungsional | kepangkatan | tugas_tambahan | sertifikasi
func (h *Handler) GetRiwayat(c *fiber.Ctx) error {
	var p types.RiwayatSDMParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	if p.IDSDM == "" {
		return response.BadRequest(c, "Parameter id_sdm wajib diisi", nil)
	}
	typeName := strings.ToLower(strings.TrimSpace(p.Type))
	if typeName == "" {
		return response.BadRequest(c, "Parameter type wajib diisi (pend_formal|fungsional|kepangkatan|tugas_tambahan|sertifikasi)", nil)
	}

	switch typeName {
	case "pend_formal", "pendidikan", "pend":
		data, total, err := h.svc.GetRiwayatPendFormal(c.Context(), p)
		if err != nil {
			log.Printf("Rwy pend error: %v", err)
			return response.InternalError(c, "Gagal mengambil riwayat pendidikan")
		}
		p.NormalizePagination()
		return response.SuccessWithMeta(c, "Berhasil mengambil riwayat pendidikan formal", data, p.Page, p.Limit, total)

	case "fungsional", "jabfung":
		data, total, err := h.svc.GetRiwayatFungsional(c.Context(), p)
		if err != nil {
			log.Printf("Rwy fung error: %v", err)
			return response.InternalError(c, "Gagal mengambil riwayat fungsional")
		}
		p.NormalizePagination()
		return response.SuccessWithMeta(c, "Berhasil mengambil riwayat fungsional", data, p.Page, p.Limit, total)

	case "kepangkatan", "pangkat":
		data, total, err := h.svc.GetRiwayatKepangkatan(c.Context(), p)
		if err != nil {
			log.Printf("Rwy pangkat error: %v", err)
			return response.InternalError(c, "Gagal mengambil riwayat kepangkatan")
		}
		p.NormalizePagination()
		return response.SuccessWithMeta(c, "Berhasil mengambil riwayat kepangkatan", data, p.Page, p.Limit, total)

	case "tugas_tambahan", "tgs":
		data, total, err := h.svc.GetRiwayatTugasTambahan(c.Context(), p)
		if err != nil {
			log.Printf("Rwy tgs error: %v", err)
			return response.InternalError(c, "Gagal mengambil riwayat tugas tambahan")
		}
		p.NormalizePagination()
		return response.SuccessWithMeta(c, "Berhasil mengambil riwayat tugas tambahan", data, p.Page, p.Limit, total)

	case "sertifikasi", "sertif":
		data, total, err := h.svc.GetRiwayatSertifikasi(c.Context(), p)
		if err != nil {
			log.Printf("Rwy sertif error: %v", err)
			return response.InternalError(c, "Gagal mengambil riwayat sertifikasi")
		}
		p.NormalizePagination()
		return response.SuccessWithMeta(c, "Berhasil mengambil riwayat sertifikasi", data, p.Page, p.Limit, total)

	default:
		return response.BadRequest(c, "Parameter type tidak valid", map[string]string{
			"type":    typeName,
			"allowed": "pend_formal|fungsional|kepangkatan|tugas_tambahan|sertifikasi",
		})
	}
}
