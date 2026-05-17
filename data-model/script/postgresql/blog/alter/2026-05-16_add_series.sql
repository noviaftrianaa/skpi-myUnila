-- Migration: blog.series + post.id_series (Sprint 12 Phase AM)
-- Group posts into ordered sequences (lecture series, tutorial, research papers).
-- One post belongs to at most one series — simpler than a join table and
-- matches the common "series of posts in order" pattern.

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS blog.series (
    id_series       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog         UUID            NOT NULL REFERENCES blog.blog(id_blog),
    judul           VARCHAR(255)    NOT NULL,
    slug            VARCHAR(120)    NOT NULL,
                                    -- URL-safe; unique within id_blog
    deskripsi       TEXT            NULL,
    cover_url       VARCHAR(500)    NULL,
    a_aktif         BOOLEAN         NOT NULL DEFAULT TRUE,
                                    -- false = hidden from public, owner can still edit
    jumlah_post     INT             NOT NULL DEFAULT 0,
                                    -- denormalised count of active posts
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     TIMESTAMP       NULL,
    CONSTRAINT uq_series_blog_slug UNIQUE (id_blog, slug)
);

CREATE INDEX IF NOT EXISTS idx_series_blog
    ON blog.series(id_blog)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE blog.series IS 'Grouping posts ke sequence (lecture/tutorial/paper series). Phase AM.';

CREATE TRIGGER trg_series_updated_at
    BEFORE UPDATE ON blog.series
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Add FK + order columns to blog.post. id_series is nullable so existing posts
-- stay valid; urutan_series only matters when id_series IS NOT NULL.
ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS id_series      UUID NULL REFERENCES blog.series(id_series) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS urutan_series  SMALLINT NULL;

CREATE INDEX IF NOT EXISTS idx_post_series
    ON blog.post(id_series, urutan_series)
    WHERE id_series IS NOT NULL AND soft_delete IS NULL;

COMMENT ON COLUMN blog.post.id_series IS 'Series this post belongs to (Phase AM)';
COMMENT ON COLUMN blog.post.urutan_series IS 'Order within the series (1-based); NULL = unordered tail';

-- Trigger to keep blog.series.jumlah_post in sync.
CREATE OR REPLACE FUNCTION blog.fn_series_recount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.id_series IS NOT NULL THEN
            UPDATE blog.series
               SET jumlah_post = jumlah_post + 1
             WHERE id_series = NEW.id_series;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.id_series IS NOT NULL THEN
            UPDATE blog.series
               SET jumlah_post = GREATEST(0, jumlah_post - 1)
             WHERE id_series = OLD.id_series;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Series change: decrement old, increment new
        IF OLD.id_series IS DISTINCT FROM NEW.id_series THEN
            IF OLD.id_series IS NOT NULL THEN
                UPDATE blog.series
                   SET jumlah_post = GREATEST(0, jumlah_post - 1)
                 WHERE id_series = OLD.id_series;
            END IF;
            IF NEW.id_series IS NOT NULL THEN
                UPDATE blog.series
                   SET jumlah_post = jumlah_post + 1
                 WHERE id_series = NEW.id_series;
            END IF;
        END IF;
        -- Soft-delete toggle: decrement if going from active → trash
        IF OLD.soft_delete IS NULL AND NEW.soft_delete IS NOT NULL AND NEW.id_series IS NOT NULL THEN
            UPDATE blog.series
               SET jumlah_post = GREATEST(0, jumlah_post - 1)
             WHERE id_series = NEW.id_series;
        END IF;
        -- Restore from trash: increment back
        IF OLD.soft_delete IS NOT NULL AND NEW.soft_delete IS NULL AND NEW.id_series IS NOT NULL THEN
            UPDATE blog.series
               SET jumlah_post = jumlah_post + 1
             WHERE id_series = NEW.id_series;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_series_recount ON blog.post;
CREATE TRIGGER trg_post_series_recount
    AFTER INSERT OR UPDATE OR DELETE ON blog.post
    FOR EACH ROW EXECUTE FUNCTION blog.fn_series_recount();
