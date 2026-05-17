package blog

import (
	"context"
	"encoding/xml"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// RSS 2.0 Feed — per-blog + apex aggregated.
// Reader-friendly, gak butuh login. Indexable by search engines.
// Standard format: https://cyber.harvard.edu/rss/rss.html
// =============================================================================

// RSS — root element. Atribut version="2.0" + dc namespace for dc:creator.
type rssDoc struct {
	XMLName xml.Name   `xml:"rss"`
	Version string     `xml:"version,attr"`
	NSDC    string     `xml:"xmlns:dc,attr"`
	NSAtom  string     `xml:"xmlns:atom,attr"`
	Channel rssChannel `xml:"channel"`
}

type rssChannel struct {
	Title         string    `xml:"title"`
	Link          string    `xml:"link"`
	AtomLink      atomLink  `xml:"atom:link"`
	Description   string    `xml:"description"`
	Language      string    `xml:"language"`
	LastBuildDate string    `xml:"lastBuildDate"`
	Generator     string    `xml:"generator"`
	Items         []rssItem `xml:"item"`
}

type atomLink struct {
	Href string `xml:"href,attr"`
	Rel  string `xml:"rel,attr"`
	Type string `xml:"type,attr"`
}

type rssItem struct {
	Title       string  `xml:"title"`
	Link        string  `xml:"link"`
	GUID        rssGUID `xml:"guid"`
	PubDate     string  `xml:"pubDate"`
	Description string  `xml:"description"`
	Creator     string  `xml:"dc:creator,omitempty"`
	Categories  []string `xml:"category,omitempty"`
}

type rssGUID struct {
	IsPermaLink bool   `xml:"isPermaLink,attr"`
	Value       string `xml:",chardata"`
}

// =============================================================================
// REPO
// =============================================================================

type FeedRow struct {
	Judul        string    `db:"judul"`
	Slug         string    `db:"slug"`
	Ringkasan    *string   `db:"ringkasan"`
	TglTerbit    time.Time `db:"tgl_terbit"`
	Subdomain    string    `db:"subdomain"`
	NmBlog       string    `db:"nm_blog"`
	NmTampilan   *string   `db:"nm_tampilan"`
	KategoriNama *string   `db:"kategori_nama"`
}

func feedItems(ctx context.Context, db *sqlx.DB, subdomain string, limit int) ([]FeedRow, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}
	where := []string{
		"p.status = 'published'",
		"p.soft_delete IS NULL",
		"b.soft_delete IS NULL",
		"b.a_aktif = TRUE",
		"b.a_publik = TRUE",
		"p.visibilitas IN ('public', 'unlisted')",
		"p.tgl_terbit IS NOT NULL",
	}
	args := []any{}
	if subdomain != "" {
		where = append(where, "b.subdomain = $1")
		args = append(args, subdomain)
	}
	q := fmt.Sprintf(`
		SELECT p.judul, p.slug, p.ringkasan, p.tgl_terbit,
		       b.subdomain, b.nm_blog, b.nm_tampilan,
		       k.nm_kategori AS kategori_nama
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		LEFT JOIN ref.kategori_post k ON p.id_kategori_post = k.id_kategori_post
		WHERE %s
		ORDER BY p.tgl_terbit DESC
		LIMIT %d`, strings.Join(where, " AND "), limit)
	rows := make([]FeedRow, 0)
	if err := db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, fmt.Errorf("rss query: %w", err)
	}
	return rows, nil
}

// =============================================================================
// HANDLER
// =============================================================================

type FeedHandler struct {
	db       *sqlx.DB
	blogRepo *Repository
	apexHost string // mis. "blog.unila.ac.id"
}

func NewFeedHandler(db *sqlx.DB, blogRepo *Repository, apexHost string) *FeedHandler {
	if apexHost == "" {
		apexHost = "blog.unila.ac.id"
	}
	return &FeedHandler{db: db, blogRepo: blogRepo, apexHost: apexHost}
}

// GET /api/v1/blogs/by-subdomain/:subdomain/rss
func (h *FeedHandler) PerBlog(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	b, err := h.blogRepo.GetBySubdomain(c.Context(), subdomain)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	rows, err := feedItems(c.Context(), h.db, subdomain, 30)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	siteURL := fmt.Sprintf("https://%s.%s", subdomain, h.apexHost)
	feedURL := siteURL + "/rss"

	title := b.NmBlog
	desc := ""
	if b.Tagline != nil {
		desc = *b.Tagline
	} else if b.Bio != nil {
		desc = *b.Bio
	}
	authorName := b.NmBlog
	if b.NmTampilan != nil && *b.NmTampilan != "" {
		authorName = *b.NmTampilan
	}

	channel := buildChannel(title, siteURL, feedURL, desc, b.Bahasa, rows, h.apexHost, authorName)
	return writeRSS(c, channel)
}

// GET /api/v1/rss — apex aggregated (latest from all public blogs).
func (h *FeedHandler) Apex(c *fiber.Ctx) error {
	rows, err := feedItems(c.Context(), h.db, "", 50)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	siteURL := "https://" + h.apexHost
	feedURL := siteURL + "/rss"
	channel := buildChannel(
		"Blog Unila — Semua Post Terbaru",
		siteURL,
		feedURL,
		"Artikel terbaru dari mahasiswa, dosen, dan staf Universitas Lampung.",
		"id", rows, h.apexHost, "",
	)
	return writeRSS(c, channel)
}

func buildChannel(title, siteURL, feedURL, desc, lang string, rows []FeedRow, apexHost, defaultCreator string) rssChannel {
	if lang == "" {
		lang = "id"
	}
	items := make([]rssItem, 0, len(rows))
	for _, r := range rows {
		postURL := fmt.Sprintf("https://%s.%s/posts/%s", r.Subdomain, apexHost, r.Slug)
		ringkasan := ""
		if r.Ringkasan != nil {
			ringkasan = *r.Ringkasan
		}
		creator := defaultCreator
		if creator == "" {
			creator = r.NmBlog
			if r.NmTampilan != nil && *r.NmTampilan != "" {
				creator = *r.NmTampilan
			}
		}
		cats := []string{}
		if r.KategoriNama != nil && *r.KategoriNama != "" {
			cats = append(cats, *r.KategoriNama)
		}
		items = append(items, rssItem{
			Title:       r.Judul,
			Link:        postURL,
			GUID:        rssGUID{IsPermaLink: true, Value: postURL},
			PubDate:     r.TglTerbit.UTC().Format(time.RFC1123Z),
			Description: ringkasan,
			Creator:     creator,
			Categories:  cats,
		})
	}
	lastBuild := time.Now().UTC().Format(time.RFC1123Z)
	if len(rows) > 0 {
		lastBuild = rows[0].TglTerbit.UTC().Format(time.RFC1123Z)
	}
	return rssChannel{
		Title:         title,
		Link:          siteURL,
		AtomLink:      atomLink{Href: feedURL, Rel: "self", Type: "application/rss+xml"},
		Description:   desc,
		Language:      lang,
		LastBuildDate: lastBuild,
		Generator:     "blog-service (Unila)",
		Items:         items,
	}
}

func writeRSS(c *fiber.Ctx, channel rssChannel) error {
	doc := rssDoc{
		Version: "2.0",
		NSDC:    "http://purl.org/dc/elements/1.1/",
		NSAtom:  "http://www.w3.org/2005/Atom",
		Channel: channel,
	}
	body, err := xml.MarshalIndent(doc, "", "  ")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "marshal rss: "+err.Error())
	}
	c.Set(fiber.HeaderContentType, "application/rss+xml; charset=utf-8")
	c.Set("Cache-Control", "public, max-age=600") // 10 min cache di CDN/browser
	return c.Send(append([]byte(xml.Header), body...))
}

// RegisterFeedRoutes — public RSS endpoints.
func RegisterFeedRoutes(api fiber.Router, h *FeedHandler) {
	api.Get("/rss", h.Apex)
	api.Get("/blogs/by-subdomain/:subdomain/rss", h.PerBlog)
}
