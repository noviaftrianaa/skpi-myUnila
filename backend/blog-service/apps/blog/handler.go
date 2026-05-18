package blog

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

// GET /api/v1/blogs
// Public listing untuk apex aggregator + admin panel.
// Query: ?limit=20&offset=0&search=&role=MHS&order=popular&aktif=1
func (h *Handler) List(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	aktifOnly := c.Query("aktif", "1") != "0"

	params := ListParams{
		Limit:        limit,
		Offset:       offset,
		Search:       c.Query("search", ""),
		TipeRoleKode: c.Query("role", ""),
		AktifOnly:    aktifOnly,
		VerifiedOnly: c.Query("verified", "0") == "1", // Featured Authors carousel
		OrderBy:      c.Query("order", "popular"),
	}
	items, total, err := h.repo.List(c.Context(), params)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  items,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GET /api/v1/blogs/by-subdomain/:subdomain
// Public — untuk render frontend-blog per-tenant.
func (h *Handler) GetBySubdomain(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	b, err := h.repo.GetBySubdomain(c.Context(), subdomain)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": b})
}

// PATCH /api/v1/admin/blogs/:id/flags — toggle a_terverifikasi / a_aktif.
// Body: { a_terverifikasi?: bool, a_aktif?: bool }.
func (h *Handler) SetFlagsAdmin(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	var in AdminFlagsInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	b, err := h.repo.SetFlagsAdmin(c.Context(), id, in)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": b})
}

// GET /api/v1/blogs/:id
// Public — untuk dashboard/external linking by id.
func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	b, err := h.repo.GetByID(c.Context(), id)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": b})
}
