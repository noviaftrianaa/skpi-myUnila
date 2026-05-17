-- Migration: blog.post.a_unggulan_blog (Sprint 12 Phase AW)
-- Author-controlled pin on their own tenant home. Distinct from:
--   - a_unggulan  = admin curation, surfaces on apex home
--   - a_pinned    = admin curation, surfaces in admin Featured page
-- This new flag is owner-only and surfaces ONLY on the blog's tenant home.
--
-- Cap: 3 pinned posts per blog. Enforced via trigger; UI also pre-checks
-- to fail fast with a clearer error than the constraint exception.

SET search_path TO ref, blog, media, interaction, moderation, audit;

ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS a_unggulan_blog BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN blog.post.a_unggulan_blog IS 'Author pinned this post on their tenant home (max 3 per blog, Phase AW)';

-- Partial index — tenant-home query reads this often, all other paths ignore.
CREATE INDEX IF NOT EXISTS idx_post_unggulan_blog
    ON blog.post(id_blog, tgl_terbit DESC)
    WHERE a_unggulan_blog = TRUE AND soft_delete IS NULL AND status = 'published';

-- Trigger: enforce max-3-pinned per blog at the DB level.
CREATE OR REPLACE FUNCTION blog.fn_pin_cap_3()
RETURNS TRIGGER AS $$
DECLARE
    pinned_count INT;
BEGIN
    IF NEW.a_unggulan_blog = TRUE AND
       (TG_OP = 'INSERT' OR OLD.a_unggulan_blog = FALSE)
    THEN
        SELECT COUNT(*) INTO pinned_count
        FROM blog.post
        WHERE id_blog = NEW.id_blog
          AND a_unggulan_blog = TRUE
          AND soft_delete IS NULL
          AND id_post <> NEW.id_post;
        IF pinned_count >= 3 THEN
            RAISE EXCEPTION 'Max 3 posts dapat di-pin per blog. Unpin salah satu dulu.'
                USING ERRCODE = '23514'; -- check_violation
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_pin_cap ON blog.post;
CREATE TRIGGER trg_post_pin_cap
    BEFORE INSERT OR UPDATE OF a_unggulan_blog ON blog.post
    FOR EACH ROW EXECUTE FUNCTION blog.fn_pin_cap_3();
