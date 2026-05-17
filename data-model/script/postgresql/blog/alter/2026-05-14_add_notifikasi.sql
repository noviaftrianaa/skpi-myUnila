-- Migration: interaction.notifikasi (Sprint 11 Phase D)
-- Saluran balik ke user: notif untuk like, komentar, reply, follower.
-- Apply: psql -U postgres -d blog_unila -f 2026-05-14_add_notifikasi.sql

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.notifikasi (
    id_notifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerima_pdut    UUID            NOT NULL,
                                        -- User yang menerima notif
    id_aktor_pdut       UUID            NULL,
                                        -- User yang memicu aksi (NULL kalau anonymous komentator)
    aktor_nama          VARCHAR(120)    NULL,
                                        -- Denorm display name aktor (untuk anonymous komentator → nm_komentator)
    tipe                VARCHAR(30)     NOT NULL,
                                        -- 'like_post', 'komentar_post', 'reply_komentar', 'follow_blog'
    id_ref_post         UUID            NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_ref_komentar     UUID            NULL,
                                        -- FK lewat trigger kalau perlu; soft ref karena komentar bisa di-hard delete oleh moderator
    id_ref_blog         UUID            NULL REFERENCES blog.blog(id_blog) ON DELETE CASCADE,
    judul_ref           VARCHAR(200)    NULL,
                                        -- Denorm judul post / subdomain blog untuk render cepat (tanpa join)
    url_target          VARCHAR(500)    NULL,
                                        -- URL dashboard untuk click-through
    sudah_dibaca        BOOLEAN         NOT NULL DEFAULT FALSE,
    tgl_dibaca          TIMESTAMP       NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Index utama: list per user filter by unread + recent first
CREATE INDEX IF NOT EXISTS idx_notif_penerima_unread
    ON interaction.notifikasi(id_penerima_pdut, sudah_dibaca, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_penerima_recent
    ON interaction.notifikasi(id_penerima_pdut, created_at DESC);

COMMENT ON TABLE interaction.notifikasi IS 'Notif feed per user (P2 — like, komentar, reply, follower)';
COMMENT ON COLUMN interaction.notifikasi.tipe IS 'like_post | komentar_post | reply_komentar | follow_blog';
