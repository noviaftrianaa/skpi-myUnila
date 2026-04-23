package pesertadidik

import (
	"context"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
	"github.com/myunila/api-service/pkg/utils"
)

func (s *service) GetBimbingMhs(ctx context.Context, p types.BimbingMhsParams) ([]BimbingMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("bimbing:%s", utils.HashParams(p)),
		func() ([]BimbingMhs, int64, error) { return s.repo.GetBimbingMhs(ctx, p) })
}
func (s *service) GetUjiMhs(ctx context.Context, p types.UjiMhsParams) ([]UjiMhs, int64, error) {
	return nilaiCached(ctx, fmt.Sprintf("uji:%s", utils.HashParams(p)),
		func() ([]UjiMhs, int64, error) { return s.repo.GetUjiMhs(ctx, p) })
}

func (h *Handler) GetBimbingMhs(c *fiber.Ctx) error {
	var p types.BimbingMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetBimbingMhs(c.Context(), p)
	if err != nil {
		log.Printf("bimbing: %v", err)
		return response.InternalError(c, "Gagal mengambil data bimbingan")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data bimbingan mahasiswa", data, p.Page, p.Limit, total)
}

func (h *Handler) GetUjiMhs(c *fiber.Ctx) error {
	var p types.UjiMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetUjiMhs(c.Context(), p)
	if err != nil {
		log.Printf("uji: %v", err)
		return response.InternalError(c, "Gagal mengambil data pengujian")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pengujian mahasiswa", data, p.Page, p.Limit, total)
}
