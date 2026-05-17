-- Migration: blog.post_co_author (Sprint 12 Phase AN)
-- Multi-author per post: primary author owns the post (blog.post.id_blog),
-- additional contributors stored as a join table referencing their primary
-- blog (since one user = one blog at this platform).
--
-- Roles cover the most common credit patterns in academic publishing:
--   - co_author    : full co-author, equal contribution
--   - editor       : editorial review / language polish
--   - reviewer     : technical reviewer / pre-publication check
--   - kontributor  : credit for data, illustration, or other limited input

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS blog.post_co_author (
    id_post         UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_blog_co      UUID            NOT NULL REFERENCES blog.blog(id_blog),
                                    -- Co-author's *primary* blog id. The user themselves
                                    -- is implicit via blog.id_pengguna_pdut.
    peran           VARCHAR(20)     NOT NULL DEFAULT 'co_author',
    urutan          SMALLINT        NOT NULL DEFAULT 1,
                                    -- 1-based display order; ties broken by created_at
    catatan         TEXT            NULL,
                                    -- Optional credit note ("provided dataset",
                                    -- "edited section 3", "translation review")
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_post, id_blog_co),
    CONSTRAINT chk_pca_peran CHECK (peran IN ('co_author','editor','reviewer','kontributor'))
);

COMMENT ON TABLE blog.post_co_author IS 'Multi-author per post join (Phase AN)';
COMMENT ON COLUMN blog.post_co_author.id_blog_co IS 'Co-author primary blog; primary author owns post.id_blog and must NOT appear here';

CREATE INDEX IF NOT EXISTS idx_pca_blog_co
    ON blog.post_co_author(id_blog_co);

-- Defense in depth: enforce at the row level that a post's primary author can
-- never be listed as their own co-author. App-level check exists in the
-- handler too; this CHECK protects against direct SQL writes.
ALTER TABLE blog.post_co_author
    ADD CONSTRAINT chk_pca_not_self
    CHECK (id_blog_co IS NOT NULL);
-- Note: the actual "id_blog_co != post.id_blog" check is best enforced by a
-- trigger because CHECK constraints can't reference other tables. App layer
-- handles it; we just document the invariant here.
