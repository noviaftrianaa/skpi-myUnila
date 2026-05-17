-- Migration: Add interaction.bookmark_post (Sprint 11 Phase C)
-- Apply: psql -U postgres -d blog_unila -f 2026-05-14_add_bookmark_post.sql

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.bookmark_post (
    id_bookmark_post    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
    catatan             VARCHAR(280)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmark_post UNIQUE (id_post, id_pengguna_pdut)
);

CREATE INDEX IF NOT EXISTS idx_bookmark_post_pengguna
    ON interaction.bookmark_post(id_pengguna_pdut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmark_post_post
    ON interaction.bookmark_post(id_post);

COMMENT ON TABLE interaction.bookmark_post IS 'Reading list — bookmark post per user (P2)';
