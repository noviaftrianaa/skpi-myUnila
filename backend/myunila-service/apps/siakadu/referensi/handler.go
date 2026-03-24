package referensi

import "github.com/gofiber/fiber/v2"

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
		"message": "Unit sync completed",
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
