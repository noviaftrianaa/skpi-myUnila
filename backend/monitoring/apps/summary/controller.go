package summary

import (
	"strconv"

	"monitoring-service/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// GET /v1/public/status
func (c *Controller) GetStatus(ctx *fiber.Ctx) error {
	st, err := c.svc.GetStatus()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil status", err.Error())
	}
	return response.Success(ctx, "Status monitoring", st)
}

// GET /v1/public/stats
func (c *Controller) GetStats(ctx *fiber.Ctx) error {
	st, err := c.svc.GetStats()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil statistik", err.Error())
	}
	return response.Success(ctx, "Statistik monitoring", st)
}

// GET /v1/public/daily-summary
func (c *Controller) DailySummary(ctx *fiber.Ctx) error {
	nStr := ctx.Query("days", "30")
	n, _ := strconv.Atoi(nStr)
	if n <= 0 || n > 90 {
		n = 30
	}
	list, err := c.svc.ListLast30Days()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil ringkasan harian", err.Error())
	}
	return response.Success(ctx, "Ringkasan harian", list)
}
