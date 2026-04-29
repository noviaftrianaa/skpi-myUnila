package notif

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

// Inbox — per-user inbox (auth required).
func (h *Handler) Inbox(c *fiber.Ctx) error {
	user := getUserClaims(c)
	if user == nil || user.IDPengguna == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
	}
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	f := &InboxFilter{
		IDPengguna: user.IDPengguna,
		Page:       page,
		Limit:      limit,
		OnlyUnread: c.Query("only_unread", "false") == "true",
	}
	res, err := h.svc.GetInbox(c.Context(), f)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    res.Items,
		"meta":    fiber.Map{"page": res.Page, "limit": res.Limit, "total": res.Total},
	})
}

// UnreadCount — bell icon badge.
func (h *Handler) UnreadCount(c *fiber.Ctx) error {
	user := getUserClaims(c)
	if user == nil || user.IDPengguna == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
	}
	n, err := h.svc.UnreadCount(c.Context(), user.IDPengguna)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"unread_count": n}})
}

func (h *Handler) MarkRead(c *fiber.Ctx) error {
	user := getUserClaims(c)
	if user == nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
	}
	id := c.Params("id")
	if err := h.svc.MarkRead(c.Context(), id, user.IDPengguna); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "marked read"})
}

func (h *Handler) MarkAllRead(c *fiber.Ctx) error {
	user := getUserClaims(c)
	if user == nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
	}
	if err := h.svc.MarkAllRead(c.Context(), user.IDPengguna); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "all marked read"})
}

func (h *Handler) Dismiss(c *fiber.Ctx) error {
	user := getUserClaims(c)
	if user == nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
	}
	id := c.Params("id")
	if err := h.svc.Dismiss(c.Context(), id, user.IDPengguna); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "dismissed"})
}

// Broadcast — admin compose new notif.
func (h *Handler) Broadcast(c *fiber.Ctx) error {
	user := getUserClaims(c)
	var req BroadcastRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "invalid body"})
	}
	if req.Judul == "" || req.Pesan == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "judul + pesan required"})
	}
	creatorID := ""
	if user != nil {
		creatorID = user.IDPengguna
	}
	res, err := h.svc.Broadcast(c.Context(), &req, creatorID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": res})
}

// ListBroadcasts — admin list of sent broadcasts.
func (h *Handler) ListBroadcasts(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	items, total, err := h.svc.ListBroadcasts(c.Context(), page, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"meta":    fiber.Map{"page": page, "limit": limit, "total": total},
	})
}

func getUserClaims(c *fiber.Ctx) *middleware.UserClaims {
	if v, ok := c.Locals("user").(*middleware.UserClaims); ok {
		return v
	}
	return nil
}
