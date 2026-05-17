-- Migration: interaction.bookmark_post.label (Sprint 11 Phase AA)
-- User-driven label untuk organize reading list (mis: "Tutorial", "Riset", "Skripsi").
-- Apply: psql -U postgres -d blog_unila -f 2026-05-15_add_bookmark_label.sql

SET search_path TO ref, blog, media, interaction, moderation, audit;

ALTER TABLE interaction.bookmark_post
    ADD COLUMN IF NOT EXISTS label VARCHAR(40) NULL;

CREATE INDEX IF NOT EXISTS idx_bookmark_post_label
    ON interaction.bookmark_post(id_pengguna_pdut, label)
    WHERE label IS NOT NULL;

COMMENT ON COLUMN interaction.bookmark_post.label IS 'Optional user-defined label untuk organize reading list';
