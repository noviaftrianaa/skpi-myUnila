package pegawai

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(svc Service) *Handler { return &Handler{svc: svc} }

// GetList — /pdrd/list_pegawai (source: SIKEP schema sikep.pegawai)
func (h *Handler) GetList(c *fiber.Ctx) error {
	var p types.PegawaiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetList(c.Context(), p)
	if err != nil {
		log.Printf("Pegawai list error: %v", err)
		return response.InternalError(c, "Gagal mengambil data pegawai")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pegawai (sumber: SIKEP)", data, p.Page, p.Limit, total)
}

// GetDetail — /pdrd/detail_pegawai
func (h *Handler) GetDetail(c *fiber.Ctx) error {
	var p types.PegawaiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	if p.IDPegawai == nil && p.Nip == nil && p.Search == "" {
		return response.BadRequest(c, "Parameter id_pegawai/nip/search wajib diisi salah satu", nil)
	}
	data, total, err := h.svc.GetDetail(c.Context(), p)
	if err != nil {
		log.Printf("Pegawai detail error: %v", err)
		return response.InternalError(c, "Gagal mengambil detail pegawai")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil detail pegawai (sumber: SIKEP)", data, p.Page, p.Limit, total)
}
