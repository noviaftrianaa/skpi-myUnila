-- Migration: interaction.reading_progress (Sprint 12 Phase AV)
-- Per-user reading progress for "Continue Reading" widget + progress bar at
-- top of post detail. Anonymous users get localStorage-only fallback in the
-- frontend; this table only stores authenticated sessions.
--
-- Granularity:
--   - progress_pct = scroll position as fraction of article height (0..100)
--   - completed_at = NULL until user reaches >= 90% (defined client-side)
--   - last_seen_at = updated on every scroll-sync ping (used for "5 min ago")
--
-- Hot path: upsert on every sync ping (debounced to ~5s).
-- Recommendation: PK on (id_pengguna_pdut, id_post) so upsert is one round-trip.

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.reading_progress (
    id_pengguna_pdut  UUID         NOT NULL,
    id_post           UUID         NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    progress_pct      SMALLINT     NOT NULL DEFAULT 0,
                                    -- 0..100; client tracks per-event
    last_position_px  INT          NULL,
                                    -- Optional fine-grained scrollY (cross-device sync)
    completed_at      TIMESTAMP    NULL,
                                    -- Set first time progress_pct >= 90 (sticky)
    last_seen_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_pengguna_pdut, id_post),
    CONSTRAINT chk_progress_pct CHECK (progress_pct BETWEEN 0 AND 100)
);

COMMENT ON TABLE interaction.reading_progress IS 'Per-user reading position per post (Phase AV)';
COMMENT ON COLUMN interaction.reading_progress.completed_at IS 'NULL = still reading; set once on first 90%+ event (sticky, never cleared)';

-- "Continue Reading" widget: posts the user started but hasn't finished,
-- ordered by recency. Partial index keeps the widget query small.
CREATE INDEX IF NOT EXISTS idx_reading_progress_incomplete
    ON interaction.reading_progress(id_pengguna_pdut, last_seen_at DESC)
    WHERE completed_at IS NULL;

-- For per-post visit count (future analytics).
CREATE INDEX IF NOT EXISTS idx_reading_progress_post
    ON interaction.reading_progress(id_post);
