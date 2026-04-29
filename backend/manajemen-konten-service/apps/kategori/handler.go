package kategori

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *fiber.Ctx) error {
	jenis := c.Query("jenis", "")
	var isActive *bool
	if v := c.Query("is_active"); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			isActive = &b
		}
	}
	items, err := h.svc.List(c.Context(), jenis, isActive)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	item, err := h.svc.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "kategori tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateKategoriRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body: " + err.Error()})
	}
	if req.Kode == "" || req.Nama == "" || req.Jenis == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "kode, nama, jenis required"})
	}
	id, err := h.svc.Create(c.Context(), &req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": fiber.Map{"id_kategori": id}})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateKategoriRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body: " + err.Error()})
	}
	if err := h.svc.Update(c.Context(), id, &req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "kategori updated"})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.SoftDelete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "kategori deleted"})
}
