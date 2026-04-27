package kerjasama

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler — HTTP layer.
type Handler struct {
	svc Service
}

// NewHandler — constructor
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GET /api/v1/kerjasama/mou
func (h *Handler) ListMou(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	search := c.Query("search", "")

	items, total, err := h.svc.GetMouList(c.Context(), page, limit, search)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GET /api/v1/kerjasama/mou/stats
func (h *Handler) MouStats(c *fiber.Ctx) error {
	stats, err := h.svc.GetMouStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}

// GET /api/v1/kerjasama/mou/:id
func (h *Handler) MouDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	mou, err := h.svc.GetMouByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "MoU tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": mou})
}

// POST /api/v1/kerjasama/sync
// Body: {"unit_ids":[]}  (kosong = sync semua)
func (h *Handler) Sync(c *fiber.Ctx) error {
	var filter SyncFilter
	if err := c.BodyParser(&filter); err != nil {
		// Empty body is OK — sync all
		filter = SyncFilter{}
	}

	res, err := h.svc.SyncFromSikerma(c.Context(), &filter, "manual")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
			"data":    res,
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync selesai",
		"data":    res,
	})
}

// =============================================================================
// UNIT MAPPING — admin CRUD
// =============================================================================

// GET /api/v1/kerjasama/unit-mapping
// Query: page, limit, search, strategy
func (h *Handler) ListUnitMapping(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	search := c.Query("search", "")
	strategy := c.Query("strategy", "")

	items, total, err := h.svc.GetUnitMappingList(c.Context(), page, limit, search, strategy)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GET /api/v1/kerjasama/unit-mapping/stats
func (h *Handler) UnitMappingStats(c *fiber.Ctx) error {
	stats, err := h.svc.GetUnitMappingStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}

// PATCH /api/v1/kerjasama/unit-mapping/:sikerma_unit_id
// Body: {"id_sms": "uuid|null", "notes": "..."}
func (h *Handler) UpdateUnitMapping(c *fiber.Ctx) error {
	sikermaUnitID, err := strconv.Atoi(c.Params("sikerma_unit_id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "sikerma_unit_id invalid"})
	}

	var body UnitMappingUpdate
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "body invalid: " + err.Error()})
	}

	if err := h.svc.UpdateUnitMappingManual(c.Context(), sikermaUnitID, body.IDSms, body.Notes); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Unit mapping updated"})
}
