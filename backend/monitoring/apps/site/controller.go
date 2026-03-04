package site

import (
	"monitoring-service/internal/middleware"
	"monitoring-service/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// List godoc
// GET /api/v1/sites
func (c *Controller) List(ctx *fiber.Ctx) error {
	var f SiteListFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	sites, total, err := c.svc.List(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil data sites", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	return response.Paginated(ctx, "Sites berhasil diambil", sites, total, page, limit)
}

// Create godoc
// POST /api/v1/sites
func (c *Controller) Create(ctx *fiber.Ctx) error {
	var req CreateSiteRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}
	if req.URL == "" || req.Name == "" {
		return response.BadRequest(ctx, "url dan name wajib diisi", nil)
	}

	creatorID := middleware.GetUserID(ctx)
	site, err := c.svc.Create(req, creatorID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal menambah site", err.Error())
	}
	return response.Created(ctx, "Site berhasil ditambahkan", site)
}

// GetByID godoc
// GET /api/v1/sites/:id
func (c *Controller) GetByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	site, err := c.svc.GetByID(id)
	if err != nil {
		return response.NotFound(ctx, "Site tidak ditemukan")
	}
	return response.Success(ctx, "Site berhasil diambil", site)
}

// Update godoc
// PUT /api/v1/sites/:id
func (c *Controller) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var req UpdateSiteRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}

	updaterID := middleware.GetUserID(ctx)
	site, err := c.svc.Update(id, req, updaterID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal update site", err.Error())
	}
	return response.Success(ctx, "Site berhasil diupdate", site)
}

// Delete godoc
// DELETE /api/v1/sites/:id
func (c *Controller) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	updaterID := middleware.GetUserID(ctx)
	if err := c.svc.Delete(id, updaterID); err != nil {
		return response.InternalServerError(ctx, "Gagal menghapus site", err.Error())
	}
	return response.Success(ctx, "Site berhasil dihapus", nil)
}

// CheckNow godoc
// POST /api/v1/sites/:id/check-now
func (c *Controller) CheckNow(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	checkerID := middleware.GetUserID(ctx)
	check, err := c.svc.CheckNow(id, checkerID)
	if err != nil {
		return response.NotFound(ctx, err.Error())
	}
	return response.Success(ctx, "Health check selesai", check)
}

// HealthHistory godoc
// GET /api/v1/sites/:id/health-history
func (c *Controller) HealthHistory(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	days := ctx.QueryInt("days", 30)
	checks, err := c.svc.HealthHistory(id, days)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil health history", err.Error())
	}
	return response.Success(ctx, "Health history berhasil diambil", checks)
}

// Stats godoc
// GET /api/v1/sites/stats/overview
func (c *Controller) Stats(ctx *fiber.Ctx) error {
	stats, err := c.svc.Stats()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil statistik", err.Error())
	}
	return response.Success(ctx, "Statistik sites", stats)
}

// CheckAll godoc
// POST /api/v1/sites/check-all
func (c *Controller) CheckAll(ctx *fiber.Ctx) error {
	if c.svc.IsCheckAllRunning() {
		return response.Success(ctx, "Check all sedang berjalan, tunggu hingga selesai", map[string]interface{}{
			"status": "running",
		})
	}

	checkerID := middleware.GetUserID(ctx)

	// Run in background goroutine
	go func() {
		total, ok, fail := c.svc.CheckAll(checkerID)
		_ = total
		_ = ok
		_ = fail
	}()

	return response.Success(ctx, "Check all dimulai di background. Proses akan memakan beberapa menit.", map[string]interface{}{
		"status": "started",
	})
}

// CheckProgress godoc
// GET /api/v1/sites/check-progress
func (c *Controller) CheckProgress(ctx *fiber.Ctx) error {
	p := GetCheckProgress()
	return response.Success(ctx, "Check progress", p.Snapshot())
}

// ListSMSUnits godoc
// GET /api/v1/sites/sms-units
func (c *Controller) ListSMSUnits(ctx *fiber.Ctx) error {
	units, err := c.svc.ListSMSUnits()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil data unit SMS", err.Error())
	}
	return response.Success(ctx, "Daftar unit SMS", units)
}

// PublicList godoc
// GET /v1/public/sites
func (c *Controller) PublicList(ctx *fiber.Ctx) error {
	sites, err := c.svc.ListPublic()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil data sites", err.Error())
	}
	return response.Success(ctx, "Sites publik", sites)
}
