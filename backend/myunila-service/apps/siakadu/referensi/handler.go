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
