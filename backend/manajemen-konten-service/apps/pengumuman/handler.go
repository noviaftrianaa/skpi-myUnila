package pengumuman

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/manajemen-konten-service/internal/middleware"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	f := &ListFilter{
		Page:       page,
		Limit:      limit,
		Search:     c.Query("search", ""),
		Tipe:       c.Query("tipe", ""),
		IDKategori: c.Query("id_kategori", ""),
		Status:     c.Query("status", ""),
		TargetRole: c.Query("target_role", ""),
	}
	res, err := h.svc.List(c.Context(), f)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    res.Items,
		"meta":    fiber.Map{"page": res.Page, "limit": res.Limit, "total": res.Total},
	})
}

// Dashboard — top-N published items, untuk widget di portal beranda.
func (h *Handler) Dashboard(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "5"))
	tipe := c.Query("tipe", "")
	f := &ListFilter{Page: 1, Limit: limit, Tipe: tipe, Status: "published"}
	res, err := h.svc.List(c.Context(), f)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res.Items})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	inc := c.Query("track_view", "false") == "true"
	item, err := h.svc.GetByID(c.Context(), id, inc)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func (h *Handler) GetBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	inc := c.Query("track_view", "false") == "true"
	item, err := h.svc.GetBySlug(c.Context(), slug, inc)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func (h *Handler) Create(c *fiber.Ctx) error {
	user := getUserClaims(c)
	var req CreatePengumumanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body: " + err.Error()})
	}
	if req.Judul == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "judul required"})
	}
	creatorID := ""
	if user != nil {
		creatorID = user.IDPengguna
	}
	id, err := h.svc.Create(c.Context(), &req, creatorID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": fiber.Map{"id_pengumuman": id}})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	user := getUserClaims(c)
	id := c.Params("id")
	var req UpdatePengumumanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body: " + err.Error()})
	}
	updaterID := ""
	if user != nil {
		updaterID = user.IDPengguna
	}
	if err := h.svc.Update(c.Context(), id, &req, updaterID); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "updated"})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.SoftDelete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "deleted"})
}

func (h *Handler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body"})
	}
	if body.Status != "draft" && body.Status != "published" && body.Status != "archived" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "status must be draft|published|archived"})
	}
	if err := h.svc.UpdateStatus(c.Context(), id, body.Status); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "status updated to " + body.Status})
}

func getUserClaims(c *fiber.Ctx) *middleware.UserClaims {
	if v, ok := c.Locals("user").(*middleware.UserClaims); ok {
		return v
	}
	return nil
}
