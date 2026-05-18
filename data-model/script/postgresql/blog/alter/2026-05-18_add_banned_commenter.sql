-- Migration: blog.banned_commenter (Sprint 13 Phase BF)
-- Per-blog commenter ban — finer-grained than Phase AO global ban.
--
-- Phase AO (moderation.banned_user): global ban dari semua aksi engagement,
-- dipakai admin platform untuk bad actor lintas blog.
--
-- Phase BF (blog.banned_commenter): blog owner bisa block specific user dari
-- komentar di blog mereka aja. User lain blog masih bisa di-komentar oleh
-- user tsb. Enforcement di KomentarRepository.Create (cek id_blog → user).
--
-- Tidak ada banned_until: ban per-blog selalu permanent sampai owner unban.
-- (Mau timed ban? Owner cukup ban ulang setelah expire.)

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS blog.banned_commenter (
    id_banned_commenter UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog             UUID            NOT NULL REFERENCES blog.blog(id_blog) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
                                        -- The user blocked from commenting on this blog
    alasan              TEXT            NOT NULL,
                                        -- Required: every ban must have a reason
    dibanned_oleh       UUID            NOT NULL,
                                        -- Blog owner who issued the ban (id_pengguna_pdut)
    dibanned_pada       TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
                                        -- Set on explicit unban; keeps audit trail
);

COMMENT ON TABLE blog.banned_commenter IS 'Per-blog commenter ban (Phase BF) — blog-owner moderation';
COMMENT ON COLUMN blog.banned_commenter.id_pengguna_pdut IS 'User blocked from commenting on this specific blog only';
COMMENT ON COLUMN blog.banned_commenter.dibanned_oleh IS 'Blog owner (id_pengguna_pdut) who issued the ban';

-- Hot path: KomentarRepository.Create checks ban every comment submission.
-- Partial unique index = at most 1 active ban per (blog, user) pair.
CREATE UNIQUE INDEX IF NOT EXISTS uq_banned_commenter_blog_user
    ON blog.banned_commenter(id_blog, id_pengguna_pdut)
    WHERE soft_delete IS NULL;

-- For owner list paging.
CREATE INDEX IF NOT EXISTS idx_banned_commenter_blog
    ON blog.banned_commenter(id_blog, dibanned_pada DESC)
    WHERE soft_delete IS NULL;
