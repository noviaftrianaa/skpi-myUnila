package mahasiswa

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for mahasiswa
type Handler struct {
	service Service
}

// NewHandler creates a new mahasiswa handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetList handles GET /api/v1/siakadu/mahasiswa
func (h *Handler) GetList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	filter := &MahasiswaListFilter{
		Page:      page,
		Limit:     limit,
		Search:    c.Query("search", ""),
		IdUnit:    c.Query("id_unit", ""),
		Angkatan:  c.Query("angkatan", ""),
		Status:    c.Query("status", ""),
		SortBy:    c.Query("sort_by", "nama"),
		SortOrder: c.Query("sort_order", "asc"),
	}

	result, err := h.service.GetMahasiswaList(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetFilters handles GET /api/v1/siakadu/mahasiswa/filters
func (h *Handler) GetFilters(c *fiber.Ctx) error {
	options, err := h.service.GetFilterOptions(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Filter options retrieved successfully",
		"data":    options,
	})
}

// GetByNIM handles GET /api/v1/siakadu/mahasiswa/:nim
func (h *Handler) GetByNIM(c *fiber.Ctx) error {
	nim := c.Params("nim")

	mahasiswa, err := h.service.GetMahasiswaByNIM(c.Context(), nim)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa retrieved successfully",
		"data":    mahasiswa,
	})
}

// GetStats handles GET /api/v1/siakadu/mahasiswa/stats
func (h *Handler) GetStats(c *fiber.Ctx) error {
	stats, err := h.service.GetStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa stats retrieved successfully",
		"data":    stats,
	})
}

// SyncAll handles POST /api/v1/siakadu/mahasiswa/sync-all
func (h *Handler) SyncAll(c *fiber.Ctx) error {
	syncedBy := c.Get("X-User-ID", "system")

	results, err := h.service.SyncAllProdi(c.Context(), syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	// Aggregate totals
	totalInserted, totalUpdated, totalErrors := 0, 0, 0
	for _, r := range results {
		if r.SyncResult != nil {
			totalInserted += r.TotalInserted
			totalUpdated += r.TotalUpdated
			totalErrors += r.TotalErrors
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "SyncAll completed",
		"summary": fiber.Map{
			"total_prodi":    len(results),
			"total_inserted": totalInserted,
			"total_updated":  totalUpdated,
			"total_errors":   totalErrors,
		},
		"data": results,
	})
}

// SyncDetailEnrichment handles POST /api/v1/siakadu/mahasiswa/sync-detail
func (h *Handler) SyncDetailEnrichment(c *fiber.Ctx) error {
	syncedBy := c.Get("X-User-ID", "system")
	limit, _ := strconv.Atoi(c.Query("limit", "100"))

	result, err := h.service.SyncDetailEnrichment(c.Context(), limit, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Detail enrichment completed",
		"data":    result,
	})
}

// SyncFull handles POST /api/v1/siakadu/mahasiswa/sync-full
func (h *Handler) SyncFull(c *fiber.Ctx) error {
	syncedBy := c.Get("X-User-ID", "system")
	detailLimit, _ := strconv.Atoi(c.Query("detail_limit", "500"))

	result, err := h.service.SyncFull(c.Context(), detailLimit, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Full sync completed",
		"data":    result,
	})
}

// Sync handles POST /api/v1/siakadu/mahasiswa/sync
func (h *Handler) Sync(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{
			Page:     1,
			PageSize: 500,
		}
	}

	syncedBy := c.Query("synced_by", "")
	if syncedBy == "" {
		syncedBy = c.Get("X-User-ID", "system")
	}

	result, err := h.service.SyncMahasiswa(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa sync completed",
		"data":    result,
	})
}
