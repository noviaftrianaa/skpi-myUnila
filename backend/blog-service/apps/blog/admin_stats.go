package blog

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// ADMIN STATS — platform overview metrics dalam satu endpoint.
// Single query batch — efisien buat admin landing page.
// =============================================================================

type StatsCounts struct {
	BlogTotal      int   `db:"blog_total"      json:"blog_total"`
	BlogAktif      int   `db:"blog_aktif"      json:"blog_aktif"`
	BlogVerified   int   `db:"blog_verified"   json:"blog_verified"`
	BlogSuspended  int   `db:"blog_suspended"  json:"blog_suspended"`
	PostPublished  int   `db:"post_published"  json:"post_published"`
	PostDraft      int   `db:"post_draft"      json:"post_draft"`
	PostScheduled  int   `db:"post_scheduled"  json:"post_scheduled"`
	PostTotal      int   `db:"post_total"      json:"post_total"`
	KomentarAktif  int   `db:"komentar_aktif"  json:"komentar_aktif"`
	LaporanPending int   `db:"laporan_pending" json:"laporan_pending"`
	TotalView      int64 `db:"total_view"      json:"total_view"`
	TotalLike      int64 `db:"total_like"      json:"total_like"`
	TotalFollower  int64 `db:"total_follower"  json:"total_follower"`
	KataTerlarang  int   `db:"kata_terlarang"  json:"kata_terlarang"`
	TemplateTheme  int   `db:"template_theme"  json:"template_theme"`
}

type StatsHandler struct{ db *sqlx.DB }

func NewStatsHandler(db *sqlx.DB) *StatsHandler { return &StatsHandler{db: db} }

// GET /api/v1/admin/stats
func (h *StatsHandler) GetStats(c *fiber.Ctx) error {
	ctx := c.UserContext()
	var s StatsCounts

	// Aggregate 1: blog counts
	if err := h.db.GetContext(ctx, &s, `
		SELECT
			COUNT(*) FILTER (WHERE TRUE) AS blog_total,
			COUNT(*) FILTER (WHERE a_aktif = TRUE) AS blog_aktif,
			COUNT(*) FILTER (WHERE a_terverifikasi = TRUE) AS blog_verified,
			COUNT(*) FILTER (WHERE a_aktif = FALSE) AS blog_suspended
		FROM blog.blog WHERE soft_delete IS NULL`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("blog stats: %w", err).Error())
	}

	// Aggregate 2: post counts by status
	if err := h.db.GetContext(ctx, &s, `
		SELECT
			COUNT(*) FILTER (WHERE status = 'published') AS post_published,
			COUNT(*) FILTER (WHERE status = 'draft') AS post_draft,
			COUNT(*) FILTER (WHERE status = 'scheduled') AS post_scheduled,
			COUNT(*) FILTER (WHERE TRUE) AS post_total
		FROM blog.post WHERE soft_delete IS NULL`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("post stats: %w", err).Error())
	}

	// Aggregate 3: komentar approved count
	if err := h.db.GetContext(ctx, &s.KomentarAktif, `
		SELECT COUNT(*) FROM interaction.komentar
		WHERE status_moderasi = 'approved' AND soft_delete IS NULL`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("komentar stats: %w", err).Error())
	}

	// Aggregate 4: laporan pending count
	if err := h.db.GetContext(ctx, &s.LaporanPending, `
		SELECT COUNT(*) FROM moderation.laporan_post
		WHERE status = 'pending' AND soft_delete IS NULL`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("laporan stats: %w", err).Error())
	}

	// Aggregate 5: totals from blog.post (denorm counters)
	if err := h.db.GetContext(ctx, &s, `
		SELECT
			COALESCE(SUM(jumlah_view), 0)::BIGINT AS total_view,
			COALESCE(SUM(jumlah_like), 0)::BIGINT AS total_like
		FROM blog.post WHERE soft_delete IS NULL AND status = 'published'`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("totals stats: %w", err).Error())
	}

	// Aggregate 6: total followers (sum across all active blogs)
	if err := h.db.GetContext(ctx, &s.TotalFollower, `
		SELECT COALESCE(SUM(jumlah_follower), 0)::BIGINT
		FROM blog.blog WHERE soft_delete IS NULL AND a_aktif = TRUE`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("follower stats: %w", err).Error())
	}

	// Aggregate 7: kata_terlarang count
	if err := h.db.GetContext(ctx, &s.KataTerlarang, `
		SELECT COUNT(*) FROM ref.kata_terlarang WHERE soft_delete IS NULL`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("kata stats: %w", err).Error())
	}

	// Aggregate 8: template_theme aktif count
	if err := h.db.GetContext(ctx, &s.TemplateTheme, `
		SELECT COUNT(*) FROM ref.template_theme WHERE soft_delete IS NULL AND a_aktif = TRUE`); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Errorf("template stats: %w", err).Error())
	}

	// Top blogs (top 5 by jumlah_view, last 30d)
	type topBlog struct {
		Subdomain     string `db:"subdomain"      json:"subdomain"`
		NmBlog        string `db:"nm_blog"        json:"nm_blog"`
		JumlahView    int64  `db:"jumlah_view"    json:"jumlah_view"`
		JumlahPost    int    `db:"jumlah_post"    json:"jumlah_post"`
		JumlahFollower int   `db:"jumlah_follower" json:"jumlah_follower"`
	}
	topBlogs := make([]topBlog, 0, 5)
	_ = h.db.SelectContext(ctx, &topBlogs, `
		SELECT subdomain, nm_blog, jumlah_view, jumlah_post, jumlah_follower
		FROM blog.blog
		WHERE soft_delete IS NULL AND a_aktif = TRUE AND a_publik = TRUE
		ORDER BY jumlah_view DESC, jumlah_post DESC
		LIMIT 5`)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"counts":    s,
			"top_blogs": topBlogs,
		},
	})
}

// RegisterStatsAdminRoutes — admin-only stats endpoint.
func RegisterStatsAdminRoutes(admin fiber.Router, h *StatsHandler) {
	admin.Get("/stats", h.GetStats)
}
