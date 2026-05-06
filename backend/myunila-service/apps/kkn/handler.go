package kkn

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

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
		"message": "KKN stats retrieved successfully",
		"data":    stats,
	})
}

func (h *Handler) SyncGroup(c *fiber.Ctx) error {
	group := c.Params("group")
	if _, ok := SyncTableGroups[group]; !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Unknown sync group: " + group + ". Available: referensi, lokasi, pendaftaran, penempatan, nilai, laporan",
		})
	}

	syncedBy := c.Get("X-User-ID", "system")

	result, err := h.service.SyncGroup(c.Context(), group, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KKN sync group '" + group + "' completed",
		"data":    result,
	})
}

func (h *Handler) SyncAll(c *fiber.Ctx) error {
	syncedBy := c.Get("X-User-ID", "system")

	result, err := h.service.SyncAll(c.Context(), syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	totalInserted, totalUpdated, totalFailed, totalSkipped := 0, 0, 0, 0
	for _, r := range result.Results {
		totalInserted += r.Inserted
		totalUpdated += r.Updated
		totalFailed += r.Failed
		totalSkipped += r.Skipped
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KKN sync all completed",
		"summary": fiber.Map{
			"total_groups":   len(result.Results),
			"total_inserted": totalInserted,
			"total_updated":  totalUpdated,
			"total_failed":   totalFailed,
			"total_skipped":  totalSkipped,
			"duration_ms":    result.Duration,
		},
		"data": result,
	})
}

func (h *Handler) GetGroups(c *fiber.Ctx) error {
	groups := make([]fiber.Map, 0, len(SyncOrder))
	for _, g := range SyncOrder {
		tables := SyncTableGroups[g]
		groups = append(groups, fiber.Map{
			"group":  g,
			"tables": tables,
			"count":  len(tables),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "KKN sync groups",
		"data":    groups,
	})
}
