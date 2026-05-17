package blog

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(api fiber.Router, h *Handler) {
	g := api.Group("/blogs")
	g.Get("/", h.List)
	g.Get("/by-subdomain/:subdomain", h.GetBySubdomain)
	g.Get("/:id", h.GetByID)
}

// RegisterAdminRoutes — admin-only blog management (verify/suspend).
func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/blogs")
	g.Patch("/:id/flags", h.SetFlagsAdmin)
}
