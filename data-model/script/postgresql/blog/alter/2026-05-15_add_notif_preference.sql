-- Migration: interaction.notif_preference (Sprint 11 Phase AG)
-- Per-user opt-out untuk tipe notifikasi tertentu.
-- TEXT[] muted_tipes — native Postgres array, allow ANY-check di NotifService.

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.notif_preference (
    id_pengguna_pdut    UUID            PRIMARY KEY,
    muted_tipes         TEXT[]          NOT NULL DEFAULT '{}',
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interaction.notif_preference IS 'Per-user notif mute prefs (P2)';
COMMENT ON COLUMN interaction.notif_preference.muted_tipes IS 'Array tipe yang di-mute, mis: {like_post,mention_komentar}';
