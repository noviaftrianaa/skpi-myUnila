package referensi

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) SyncUnits(c *fiber.Ctx) error {
	result, err := h.service.SyncUnits(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Unit sync completed (with pimpinan)",
		"data":    result,
	})
}

func (h *Handler) GetProdiList(c *fiber.Ctx) error {
	list, err := h.service.GetProdiList(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prodi list retrieved",
		"data":    list,
		"total":   len(list),
	})
}

// ListUnits — paginated + filter (jns_unit, search, is_aktif)
func (h *Handler) ListUnits(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	f := &UnitListFilter{
		Page:    page,
		Limit:   limit,
		Search:  c.Query("search", ""),
		JnsUnit: c.Query("jns_unit", ""),
		IsAktif: c.Query("is_aktif", ""),
	}
	res, err := h.service.ListUnits(c.Context(), f)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    res.Items,
		"meta":    fiber.Map{"page": res.Page, "limit": res.Limit, "total": res.Total},
	})
}

func (h *Handler) GetUnitStats(c *fiber.Ctx) error {
	stats, err := h.service.GetUnitStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}

func (h *Handler) GetPimpinan(c *fiber.Ctx) error {
	idUnit := c.Params("id_unit")
	if idUnit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_unit is required",
		})
	}

	list, err := h.service.GetPimpinanByUnit(c.Context(), idUnit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pimpinan retrieved",
		"data":    list,
		"total":   len(list),
	})
}
