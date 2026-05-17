package post

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// TrendingReindexer — implemented by search.Service. After the SQL UPDATE
// finishes, the scheduler asks the search layer to refresh affected docs so
// Meilisearch's `sort=trending` stays in sync. Soft-fails when search is
// disabled (interface is nil-safe via the caller's check).
type TrendingReindexer interface {
	FullResync(ctx context.Context) (int, error)
}

// =============================================================================
// TRENDING SCORE WORKER
//
// Every 15 minutes recomputes `skor_trending` for posts with engagement in
// the last 48h (or published within last 7d). Score combines a 24h activity
// window with a freshness decay so new posts can climb above old hits.
//
//   score   = views_24h + likes_24h × 3 + komentar_24h × 5
//   decay   = 1 / sqrt(hours_since_publish + 2)
//   final   = score × decay
//
// Written entirely in one SQL UPDATE — no app-side loop, no row-by-row
// trips to the DB. Scales to tens of thousands of posts trivially.
// =============================================================================

const trendingInterval = 15 * time.Minute

// RunTrendingScheduler is launched as a goroutine from main. Blocks until
// ctx is cancelled. The first tick fires immediately at boot so dashboards
// have non-zero scores within seconds rather than waiting 15 min.
// reindexer is optional — when non-nil, a search re-sync runs after each
// SQL update so Meilisearch's sortable `skor_trending` stays current.
func RunTrendingScheduler(ctx context.Context, db *sqlx.DB, reindexer TrendingReindexer) {
	log.Printf("📈 Trending score scheduler started (every %s)", trendingInterval)
	recomputeTrending(ctx, db, reindexer)
	ticker := time.NewTicker(trendingInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			recomputeTrending(ctx, db, reindexer)
		}
	}
}

// recomputeTrending runs the score computation once. Single SQL UPDATE with
// scalar subqueries for views/likes/komentar; postgres planner uses the
// existing (id_post, created_at) indexes on interaction tables so it stays
// quick even with millions of view_post rows.
//
// After the UPDATE succeeds and any rows were touched, the optional reindexer
// is invoked so Meilisearch's `skor_trending` sort attribute stays in sync.
// Re-sync is best-effort — search staleness must not block the main worker.
func recomputeTrending(ctx context.Context, db *sqlx.DB, reindexer TrendingReindexer) {
	const q = `
		WITH activity AS (
			SELECT p.id_post,
			       COALESCE((
			           SELECT COUNT(*) FROM interaction.view_post vp
			           WHERE vp.id_post = p.id_post
			             AND vp.created_at > NOW() - INTERVAL '24 hours'
			       ), 0) AS views_24h,
			       COALESCE((
			           SELECT COUNT(*) FROM interaction.like_post lp
			           WHERE lp.id_post = p.id_post
			             AND lp.created_at > NOW() - INTERVAL '24 hours'
			       ), 0) AS likes_24h,
			       COALESCE((
			           SELECT COUNT(*) FROM interaction.komentar k
			           WHERE k.id_post = p.id_post
			             AND k.created_at > NOW() - INTERVAL '24 hours'
			             AND k.soft_delete IS NULL
			       ), 0) AS komentar_24h,
			       p.tgl_terbit
			FROM blog.post p
			WHERE p.status = 'published'
			  AND p.soft_delete IS NULL
			  AND (
			      p.tgl_terbit > NOW() - INTERVAL '7 days'
			      OR EXISTS (
			          SELECT 1 FROM interaction.view_post vp
			          WHERE vp.id_post = p.id_post
			            AND vp.created_at > NOW() - INTERVAL '48 hours'
			      )
			  )
		)
		UPDATE blog.post p
		SET skor_trending = ROUND(
		        (a.views_24h + a.likes_24h * 3 + a.komentar_24h * 5)::NUMERIC
		        / GREATEST(SQRT(EXTRACT(EPOCH FROM (NOW() - COALESCE(a.tgl_terbit, NOW()))) / 3600.0 + 2), 1),
		        2
		    ),
		    skor_trending_at = NOW()
		FROM activity a
		WHERE p.id_post = a.id_post
	`
	res, err := db.ExecContext(ctx, q)
	if err != nil {
		log.Printf("📈 trending recompute: %v", err)
		return
	}
	n, _ := res.RowsAffected()
	if n > 0 {
		log.Printf("📈 trending recomputed for %d posts", n)
		// Push updated scores into Meilisearch so sort=trending sees the
		// fresh ranking. Re-sync covers all eligible posts in one batch.
		if reindexer != nil {
			if _, rerr := reindexer.FullResync(ctx); rerr != nil {
				log.Printf("📈 trending → search reindex: %v", rerr)
			}
		}
	}

	// Posts that no longer qualify (no activity in 48h AND older than 7d)
	// keep their last score until the next major event. They naturally drift
	// out of the trending feed because new posts now outrank them.
}
