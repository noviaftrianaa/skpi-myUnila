package post

import "github.com/gofiber/fiber/v2"

// RegisterRoutes — public read endpoints.
func RegisterRoutes(api fiber.Router, h *Handler) {
	g := api.Group("/posts")
	g.Get("/", h.List)
	g.Get("/status-count", h.StatusCount)
	g.Get("/by-slug/:subdomain/:slug", h.GetBySlug)
	g.Get("/:id", h.GetByID)
	// Public view tracker — no auth required (anonymous reader)
	g.Post("/:id/view", h.TrackView)
	// Pinned posts per blog (author-curated highlights on tenant home).
	api.Get("/blogs/by-subdomain/:subdomain/pinned", h.ListPinnedPublic)
}

// RegisterMineRoutes — authenticated owner-only endpoints.
// Apply JWT middleware di main.go untuk grup /me/*.
func RegisterMineRoutes(me fiber.Router, h *Handler) {
	me.Get("/blog", h.GetMine)
	me.Put("/blog", h.UpdateMyBlog) // partial update profile (nm_tampilan, bio, sosmed, dsb)
	me.Get("/blog/analytics/views", h.AnalyticsMine)
	me.Get("/blog/analytics/summary", h.AnalyticsSummaryMine)
	me.Get("/feed", h.FeedMine) // personalized timeline dari blog yang user follow
	g := me.Group("/blog/posts")
	g.Get("/trash", h.ListTrashMine) // BEFORE :id route — Fiber matches literally first
	g.Post("/", h.CreateMine)
	g.Put("/:id", h.UpdateMine)
	g.Post("/:id/publish", h.PublishMine)
	g.Post("/:id/restore", h.RestoreMine)
	g.Delete("/:id/permanent", h.PermanentDeleteMine)
	g.Delete("/:id", h.DeleteMine)
	g.Get("/:id/revisions", h.ListRevisionsMine)
	g.Get("/:id/revisions/:nomor", h.GetRevisionMine)
	g.Get("/:id/analytics", h.PostAnalyticsMine)
	g.Patch("/:id/pin", h.ToggleAuthorPin) // author pin on tenant home (Phase AW)
	// Phase BD — bilingual pair-link (kedua post harus milik blog yang sama)
	g.Put("/:id/pair", h.LinkPairMine)
	g.Delete("/:id/pair", h.UnlinkPairMine)
}

// RegisterAdminRoutes — admin-only curation endpoints.
// Apply JWTAuth + RequireRole(Administrator/Developer) di main.go.
func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/posts")
	g.Patch("/:id/curation", h.SetCurationAdmin)
}
