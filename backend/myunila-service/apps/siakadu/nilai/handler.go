package nilai

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for nilai
type Handler struct {
	service Service
}

// NewHandler creates a new nilai handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// ========================================
// KHS Handlers
// ========================================

func (h *Handler) GetKHSList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	filter := &KHSListFilter{
		Page:      page,
		Limit:     limit,
		Search:    c.Query("search", ""),
		IdSmt:     c.Query("id_smt", ""),
		NIM:       c.Query("nim", ""),
		IdUnit:    c.Query("id_unit", ""),
		Angkatan:  c.Query("angkatan", ""),
		SortBy:    c.Query("sort_by", "nim"),
		SortOrder: c.Query("sort_order", "asc"),
	}

	result, err := h.service.GetKHSList(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KHS list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) GetKHSStats(c *fiber.Ctx) error {
	stats, err := h.service.GetKHSStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

func (h *Handler) GetKHSFilters(c *fiber.Ctx) error {
	opts, err := h.service.GetKHSFilterOptions(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    opts,
	})
}

func (h *Handler) SyncKHS(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKHS(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KHS sync completed",
		"data":    result,
	})
}

// ========================================
// Transkrip Handlers
// ========================================

func (h *Handler) GetTranskripList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	filter := &TranskripListFilter{
		Page:      page,
		Limit:     limit,
		Search:    c.Query("search", ""),
		NIM:       c.Query("nim", ""),
		IdUnit:    c.Query("id_unit", ""),
		Angkatan:  c.Query("angkatan", ""),
		SortBy:    c.Query("sort_by", "nim"),
		SortOrder: c.Query("sort_order", "asc"),
	}

	result, err := h.service.GetTranskripList(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transkrip list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) GetTranskripStats(c *fiber.Ctx) error {
	stats, err := h.service.GetTranskripStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

func (h *Handler) GetTranskripFilters(c *fiber.Ctx) error {
	opts, err := h.service.GetTranskripFilterOptions(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    opts,
	})
}

func (h *Handler) SyncTranskrip(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncTranskrip(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transkrip sync completed",
		"data":    result,
	})
}

func (h *Handler) SyncTranskripBatch(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncTranskripBatch(c.Context(), syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Transkrip batch sync completed",
		"data":    result,
	})
}

// ========================================
// Kuliah Handlers
// ========================================

func (h *Handler) GetKuliahList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	filter := &KuliahListFilter{
		Page:      page,
		Limit:     limit,
		Search:    c.Query("search", ""),
		IdSmt:     c.Query("id_smt", ""),
		IdUnit:    c.Query("id_unit", ""),
		Angkatan:  c.Query("angkatan", ""),
		Status:    c.Query("status", ""),
		SortBy:    c.Query("sort_by", "nim"),
		SortOrder: c.Query("sort_order", "asc"),
	}

	result, err := h.service.GetKuliahList(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kuliah list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) GetKuliahStats(c *fiber.Ctx) error {
	stats, err := h.service.GetKuliahStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

func (h *Handler) GetKuliahFilters(c *fiber.Ctx) error {
	opts, err := h.service.GetKuliahFilterOptions(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    opts,
	})
}

func (h *Handler) SyncKuliah(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKuliah(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kuliah sync completed",
		"data":    result,
	})
}
