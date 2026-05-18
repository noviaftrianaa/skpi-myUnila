package search

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/myunila/blog-service/external/meilisearch"
)

func parsePostUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

func joinNonEmpty(parts []string, sep string) string {
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, sep)
}

func truncateRunes(s string, n int) string {
	if n <= 0 {
		return s
	}
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n])
}

type Handler struct {
	svc *Service
	ms  *meilisearch.Client
}

func NewHandler(svc *Service, ms *meilisearch.Client) *Handler {
	return &Handler{svc: svc, ms: ms}
}

// =============================================================================
// PUBLIC SEARCH
// =============================================================================

// GET /api/v1/posts/:id/related?limit=5
// Returns content-similar posts using the source post's judul + ringkasan +
// kategori_nama + tags as the search query, filtered to exclude the source.
// When Meilisearch is unavailable, returns an empty list so the post page can
// gracefully omit the section.
func (h *Handler) RelatedPosts(c *fiber.Ctx) error {
	idPost := c.Params("id")
	if idPost == "" {
		return fiber.NewError(fiber.StatusBadRequest, "missing id")
	}
	if h.ms == nil || h.svc == nil {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": []any{}, "total": 0}})
	}
	limit := c.QueryInt("limit", 5)
	if limit <= 0 || limit > 20 {
		limit = 5
	}

	// Pull the source post via search-service repo (already configured for the
	// flat document shape). If the source isn't published, fall back to
	// returning empty rather than 404 — the caller is the public post page,
	// which already 404s on missing posts elsewhere.
	id, perr := parsePostUUID(idPost)
	if perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	row, err := h.svc.repo.GetForIndex(c.Context(), id)
	if err != nil {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": []any{}, "total": 0}})
	}

	// Build a topical query: kategori + tags only. Using the source title would
	// be too specific (Meilisearch requires all query words to match, so
	// rare title words exclude every other post). Tags + category broaden us
	// to the topic area, which is the right scope for "related".
	parts := []string{}
	if row.KategoriNama != nil && *row.KategoriNama != "" {
		parts = append(parts, *row.KategoriNama)
	}
	if row.TagsCSV != nil && *row.TagsCSV != "" {
		parts = append(parts, strings.ReplaceAll(*row.TagsCSV, ",", " "))
	}
	// Fall back to ringkasan (truncated) when there are no tags/category —
	// rare but possible for older posts.
	if len(parts) == 0 && row.Ringkasan != nil {
		parts = append(parts, *row.Ringkasan)
	}
	query := truncateRunes(joinNonEmpty(parts, " "), 200)

	// Fetch a bit more than the requested limit so we have room to filter
	// out the source post itself.
	res, serr := h.ms.Search(c.Context(), meilisearch.SearchOpts{
		Query:  query,
		Limit:  limit + 5,
		Offset: 0,
	})
	if serr != nil {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": []any{}, "total": 0}})
	}

	out := make([]meilisearch.Document, 0, limit)
	for _, h := range res.Hits {
		if h.IDPost == idPost {
			continue // skip self
		}
		out = append(out, h)
		if len(out) >= limit {
			break
		}
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"hits":  out,
			"total": len(out),
			"limit": limit,
		},
	})
}

// Suggestion — minimal payload for autocomplete dropdown. We deliberately don't
// reuse the SearchPosts response shape: the dropdown only needs judul + slug +
// subdomain + cover_url to render, and the tiny payload + tight cache settings
// keep keystroke-rate calls cheap.
type Suggestion struct {
	IDPost     string `json:"id_post"`
	Judul      string `json:"judul"`
	Slug       string `json:"slug"`
	Subdomain  string `json:"subdomain"`
	NmTampilan string `json:"nm_tampilan,omitempty"`
	CoverURL   string `json:"cover_url,omitempty"`
	Kategori   string `json:"kategori_nama,omitempty"`
}

// GET /api/v1/search/suggest?q=...&limit=5
// Autocomplete-tuned: tight limit (default 5, max 10), short cache window, no
// highlights. Always sorts by relevance — typed prefixes match best that way.
func (h *Handler) Suggest(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q"))
	limit := c.QueryInt("limit", 5)
	if limit <= 0 || limit > 10 {
		limit = 5
	}
	// Very short queries are noisy and add no signal — return empty quickly so
	// the dropdown stays clean when the user just opened the bar.
	if len([]rune(q)) < 2 {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": []any{}}})
	}
	if h.ms == nil {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": []any{}}})
	}
	res, err := h.ms.Search(c.Context(), meilisearch.SearchOpts{
		Query: q,
		Limit: limit,
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	out := make([]Suggestion, 0, len(res.Hits))
	for _, h := range res.Hits {
		out = append(out, Suggestion{
			IDPost:     h.IDPost,
			Judul:      h.Judul,
			Slug:       h.Slug,
			Subdomain:  h.Subdomain,
			NmTampilan: h.NmTampilan,
			CoverURL:   h.CoverURL,
			Kategori:   h.KategoriNama,
		})
	}
	// Browsers cache GETs by URL — a small max-age means rapid keystrokes
	// hit the cache when the user backspaces a letter.
	c.Set("Cache-Control", "public, max-age=30")
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"hits": out}})
}

// GET /api/v1/search/posts?q=...&limit=20&offset=0&subdomain=...&kategori=...&sort=latest|trending
func (h *Handler) SearchPosts(c *fiber.Ctx) error {
	if h.ms == nil {
		// Meilisearch not configured — return an empty result rather than 503
		// so the frontend's search page stays usable with SQL fallback elsewhere.
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"hits":   []any{},
				"total":  0,
				"limit":  0,
				"offset": 0,
			},
		})
	}
	res, err := h.ms.Search(c.Context(), meilisearch.SearchOpts{
		Query:        c.Query("q"),
		Limit:        c.QueryInt("limit", 20),
		Offset:       c.QueryInt("offset", 0),
		Subdomain:    c.Query("subdomain"),
		KategoriSlug: c.Query("kategori"),
		Sort:         c.Query("sort"),
		HighlightFields: []string{"judul", "ringkasan", "konten_text"},
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

// =============================================================================
// ADMIN — bulk reindex
// =============================================================================

// POST /api/v1/admin/search/reindex — synchronous full resync.
// For large indexes consider moving this to a background job + status endpoint.
func (h *Handler) AdminReindex(c *fiber.Ctx) error {
	if h.svc == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "search not configured")
	}
	n, err := h.svc.FullResync(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"indexed": n}})
}

// =============================================================================
// ROUTING
// =============================================================================

// RegisterPublicRoutes — public search endpoints. searchLimit is optional
// rate limit middleware (60/menit/IP, skip-auth) — pass nil to disable.
// /related tidak di-rate-limit karena 1 request per post detail load.
func RegisterPublicRoutes(api fiber.Router, h *Handler, searchLimit fiber.Handler) {
	if searchLimit != nil {
		api.Get("/search/posts", searchLimit, h.SearchPosts)
		api.Get("/search/suggest", searchLimit, h.Suggest)
	} else {
		api.Get("/search/posts", h.SearchPosts)
		api.Get("/search/suggest", h.Suggest)
	}
	api.Get("/posts/:id/related", h.RelatedPosts)
}

func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	admin.Post("/search/reindex", h.AdminReindex)
}
