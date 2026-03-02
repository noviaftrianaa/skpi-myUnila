package crawler

import (
	"strconv"

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

// POST /api/v1/crawl/jobs
func (c *Controller) CreateJob(ctx *fiber.Ctx) error {
	var req CreateJobRequest
	if err := ctx.BodyParser(&req); err != nil {
		return response.BadRequest(ctx, "Invalid request body", err.Error())
	}

	validTypes := map[string]bool{"full": true, "incremental": true, "single": true}
	if !validTypes[req.JobType] {
		return response.BadRequest(ctx, "job_type harus full/incremental/single", nil)
	}
	if req.JobType == "single" && req.SiteID == nil {
		return response.BadRequest(ctx, "site_id wajib diisi untuk job_type single", nil)
	}

	triggeredBy := middleware.GetUserID(ctx)
	job, err := c.svc.CreateJob(req, triggeredBy)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal membuat crawl job", err.Error())
	}

	// Run asynchronously
	go func() {
		_ = c.svc.RunJob(job.ID)
	}()

	return response.Success(ctx, "Crawl job dibuat dan sedang dijalankan", job)
}

// GET /api/v1/crawl/jobs
func (c *Controller) ListJobs(ctx *fiber.Ctx) error {
	var f JobFilter
	if err := ctx.QueryParser(&f); err != nil {
		return response.BadRequest(ctx, "Invalid query params", err.Error())
	}
	list, total, err := c.svc.ListJobs(f)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil crawl jobs", err.Error())
	}
	page, limit := f.Page, f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	return response.Paginated(ctx, "Crawl jobs berhasil diambil", list, total, page, limit)
}

// GET /api/v1/crawl/jobs/:id
func (c *Controller) GetJob(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	job, err := c.svc.GetJob(id)
	if err != nil {
		return response.NotFound(ctx, "Crawl job tidak ditemukan")
	}
	return response.Success(ctx, "Crawl job berhasil diambil", job)
}

// GET /api/v1/crawl/jobs/:id/sessions
func (c *Controller) ListSessions(ctx *fiber.Ctx) error {
	jobID, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return response.BadRequest(ctx, "ID tidak valid", nil)
	}
	sessions, err := c.svc.ListSessions(jobID)
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil sessions", err.Error())
	}
	return response.Success(ctx, "Sessions berhasil diambil", sessions)
}

// GET /api/v1/crawl/stats
func (c *Controller) Stats(ctx *fiber.Ctx) error {
	stats, err := c.svc.Stats()
	if err != nil {
		return response.InternalServerError(ctx, "Gagal mengambil statistik crawler", err.Error())
	}
	return response.Success(ctx, "Statistik crawler", stats)
}
