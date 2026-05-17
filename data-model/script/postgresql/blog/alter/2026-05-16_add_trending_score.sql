-- Migration: blog.post.skor_trending (Sprint 12 Phase AR)
-- Recency-weighted engagement score so "trending" doesn't just mean "lifetime
-- views" (which never decays — viral 2020 posts would outrank everything new).
--
-- Score formula (computed in Go worker every 15 min):
--   score = views_24h × 1
--         + likes_24h × 3
--         + komentar_24h × 5
--   With a freshness multiplier:
--     m = 1 / (hours_since_publish + 2)^0.5      (Reddit-hot style — softer decay)
--   Final: skor_trending = score × m
--
-- Index sorted DESC for the trending feed query.

SET search_path TO ref, blog, media, interaction, moderation, audit;

ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS skor_trending     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS skor_trending_at  TIMESTAMP      NULL;

COMMENT ON COLUMN blog.post.skor_trending IS 'Engagement score (24h window × freshness decay), refreshed every 15 min';
COMMENT ON COLUMN blog.post.skor_trending_at IS 'When the score was last recomputed';

-- Partial index — trending queries only ever scan published+active posts, so
-- a partial index keeps the index small + write-fast.
CREATE INDEX IF NOT EXISTS idx_post_trending
    ON blog.post(skor_trending DESC, jumlah_view DESC)
    WHERE soft_delete IS NULL AND status = 'published';
