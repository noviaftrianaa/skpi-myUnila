package blog

import (
	"context"
	"encoding/xml"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// SITEMAP — XML sitemap untuk SEO. Search engines crawl ini untuk discover posts.
// Spec: https://www.sitemaps.org/protocol.html
// Mirror Phase N (RSS) pattern: apex aggregated + per-blog.
// =============================================================================

type sitemapURLSet struct {
	XMLName xml.Name      `xml:"urlset"`
	XMLNS   string        `xml:"xmlns,attr"`
	URLs    []sitemapURL  `xml:"url"`
}

type sitemapURL struct {
	Loc        string  `xml:"loc"`
	LastMod    string  `xml:"lastmod,omitempty"`
	ChangeFreq string  `xml:"changefreq,omitempty"`
	Priority   float64 `xml:"priority,omitempty"`
}

type sitemapRow struct {
	Slug      string    `db:"slug"`
	Subdomain string    `db:"subdomain"`
	UpdatedAt time.Time `db:"updated_at"`
}

func sitemapItems(ctx context.Context, db *sqlx.DB, subdomain string) ([]sitemapRow, error) {
	where := `p.status = 'published' AND p.soft_delete IS NULL
	          AND b.soft_delete IS NULL AND b.a_aktif = TRUE AND b.a_publik = TRUE
	          AND p.visibilitas = 'public'
	          AND p.tgl_terbit IS NOT NULL`
	args := []any{}
	if subdomain != "" {
		where += " AND b.subdomain = $1"
		args = append(args, subdomain)
	}
	q := `SELECT p.slug, b.subdomain, p.updated_at
	      FROM blog.post p
	      JOIN blog.blog b ON p.id_blog = b.id_blog
	      WHERE ` + where + `
	      ORDER BY p.updated_at DESC
	      LIMIT 50000` // sitemap protocol max
	rows := make([]sitemapRow, 0)
	if err := db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, fmt.Errorf("sitemap query: %w", err)
	}
	return rows, nil
}

func (h *FeedHandler) Sitemap(c *fiber.Ctx) error {
	rows, err := sitemapItems(c.Context(), h.db, "")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	urls := buildURLSet(rows, h.apexHost)
	// Inject apex homepage + browse pages as entry points (priority lebih tinggi)
	homepage := []sitemapURL{
		{Loc: "https://" + h.apexHost + "/", ChangeFreq: "daily", Priority: 1.0},
		{Loc: "https://" + h.apexHost + "/trending", ChangeFreq: "hourly", Priority: 0.8},
	}
	return writeSitemap(c, append(homepage, urls...))
}

func (h *FeedHandler) SitemapPerBlog(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	b, err := h.blogRepo.GetBySubdomain(c.Context(), subdomain)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	_ = b
	rows, err := sitemapItems(c.Context(), h.db, subdomain)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	urls := buildURLSet(rows, h.apexHost)
	// Inject per-blog homepage
	tenantHome := []sitemapURL{
		{Loc: fmt.Sprintf("https://%s.%s/", subdomain, h.apexHost), ChangeFreq: "daily", Priority: 1.0},
	}
	return writeSitemap(c, append(tenantHome, urls...))
}

func buildURLSet(rows []sitemapRow, apexHost string) []sitemapURL {
	out := make([]sitemapURL, 0, len(rows))
	for _, r := range rows {
		out = append(out, sitemapURL{
			Loc:        fmt.Sprintf("https://%s.%s/posts/%s", r.Subdomain, apexHost, r.Slug),
			LastMod:    r.UpdatedAt.UTC().Format("2006-01-02"),
			ChangeFreq: "weekly",
			Priority:   0.7,
		})
	}
	return out
}

func writeSitemap(c *fiber.Ctx, urls []sitemapURL) error {
	doc := sitemapURLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  urls,
	}
	body, err := xml.MarshalIndent(doc, "", "  ")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "marshal sitemap: "+err.Error())
	}
	c.Set(fiber.HeaderContentType, "application/xml; charset=utf-8")
	c.Set("Cache-Control", "public, max-age=3600") // 1h cache (sitemap berubah lambat)
	return c.Send(append([]byte(xml.Header), body...))
}

// RegisterSitemapRoutes — public sitemap endpoints.
func RegisterSitemapRoutes(api fiber.Router, h *FeedHandler) {
	api.Get("/sitemap.xml", h.Sitemap)
	api.Get("/blogs/by-subdomain/:subdomain/sitemap.xml", h.SitemapPerBlog)
}
