package akademik

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for akademik
type Handler struct {
	service Service
}

// NewHandler creates a new akademik handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// ========================================
// Kelas Handlers
// ========================================

func (h *Handler) GetKelasList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	idSemester := c.Query("id_semester", "")

	result, err := h.service.GetKelasList(c.Context(), page, limit, search, idSemester)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncKelas(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKelas(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas sync completed",
		"data":    result,
	})
}

// ========================================
// Kurikulum Handlers
// ========================================

func (h *Handler) GetKurikulumList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	result, err := h.service.GetKurikulumList(c.Context(), page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kurikulum list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncKurikulum(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncKurikulum(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kurikulum sync completed",
		"data":    result,
	})
}

// ========================================
// MataKuliah Handlers
// ========================================

func (h *Handler) GetMatakuliahList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	result, err := h.service.GetMatakuliahList(c.Context(), page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Matakuliah list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncMatakuliah(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncMatakuliah(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Matakuliah sync completed",
		"data":    result,
	})
}

// ========================================
// Jadwal Handlers
// ========================================

func (h *Handler) GetJadwalList(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	idSemester := c.Query("id_semester", "")

	result, err := h.service.GetJadwalList(c.Context(), page, limit, search, idSemester)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Jadwal list retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

func (h *Handler) SyncJadwal(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		filter = SyncFilter{PageSize: 500}
	}

	syncedBy := c.Query("synced_by", c.Get("X-User-ID", "system"))

	result, err := h.service.SyncJadwal(c.Context(), &filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Jadwal sync completed",
		"data":    result,
	})
}

func (h *Handler) SyncAll(c *fiber.Ctx) error {
	idSemester := c.Query("id_semester", "20241")
	syncedBy := c.Get("X-User-ID", "system")

	results, err := h.service.SyncAllAkademik(c.Context(), idSemester, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	totalMK, totalKur, totalKls := 0, 0, 0
	for _, r := range results {
		if r.Matakuliah != nil {
			totalMK += r.Matakuliah.TotalInserted + r.Matakuliah.TotalUpdated
		}
		if r.Kurikulum != nil {
			totalKur += r.Kurikulum.TotalInserted + r.Kurikulum.TotalUpdated
		}
		if r.Kelas != nil {
			totalKls += r.Kelas.TotalInserted + r.Kelas.TotalUpdated
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "SyncAll akademik completed",
		"summary": fiber.Map{
			"total_prodi":     len(results),
			"total_matakuliah": totalMK,
			"total_kurikulum":  totalKur,
			"total_kelas":      totalKls,
		},
		"data": results,
	})
}
