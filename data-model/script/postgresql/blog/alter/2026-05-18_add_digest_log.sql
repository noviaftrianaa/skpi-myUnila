-- Migration: interaction.digest_log (Sprint 13 Phase BE — weekly email digest)
--
-- Worker mail.DigestWorker (6h tick) query users dengan following + email
-- ter-capture, lalu cek per-user apakah sudah 7 hari sejak last_sent_at.
-- Kalau iya + ada post baru dari followed blogs, render digest + enqueue
-- via outbox.
--
-- Opt-out: pakai existing interaction.notif_preference tipe 'weekly_digest'
-- (jangan duplicate sistem opt-out). Worker skip user yang ada row preference
-- dengan tipe=weekly_digest AND muted=TRUE.

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.digest_log (
    id_pengguna_pdut UUID         PRIMARY KEY,
    last_sent_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_post_count  INT          NOT NULL DEFAULT 0,
    last_period_from TIMESTAMP    NOT NULL DEFAULT NOW() - INTERVAL '7 days',
    last_period_to   TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interaction.digest_log IS 'Track last weekly digest email sent per user (Phase BE)';
COMMENT ON COLUMN interaction.digest_log.last_period_from IS 'Lower bound of post window in last digest — supaya worker tahu next cutoff';
COMMENT ON COLUMN interaction.digest_log.last_post_count IS 'Berapa post di-digest terakhir kali (telemetry + debug)';

-- Hot path: worker query users due (last_sent_at < NOW() - 7 days OR row not exists).
-- Index by last_sent_at supaya scan cepat.
CREATE INDEX IF NOT EXISTS idx_digest_log_last_sent
    ON interaction.digest_log(last_sent_at);
