-- Migration: interaction.subscriber (Sprint 13 Phase BB — per-blog newsletter)
--
-- Public opt-in subscriber list per blog. Beda dengan interaction.follower
-- (yang butuh auth + identity dari myUnila SSO): subscriber pakai email-only,
-- public form, double opt-in via token.
--
-- Status enum:
--   pending      — email submitted, belum click confirm link (token_verify aktif)
--   confirmed    — sudah klik confirm; akan terima broadcast saat blog publish
--   unsubscribed — klik link unsubscribe; tetap di table untuk audit, gak kirim
--
-- Token:
--   token_verify       — sekali pakai, kirim di confirmation email
--   token_unsubscribe  — selamanya valid, kirim di footer setiap broadcast
--
-- Unique key (id_blog, email) supaya re-submit email yang sudah confirmed
-- gak duplicate; cuma update token_verify + reset status ke pending kalau
-- sebelumnya unsubscribed.

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.subscriber (
    id_subscriber       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog             UUID         NOT NULL REFERENCES blog.blog(id_blog) ON DELETE CASCADE,
    email               VARCHAR(200) NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'pending',
    token_verify        VARCHAR(64)  NOT NULL,
                                     -- Random urlsafe base64, sekali pakai
    token_unsubscribe   VARCHAR(64)  NOT NULL,
                                     -- Random urlsafe base64, permanent
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMP    NULL,
    unsubscribed_at     TIMESTAMP    NULL,
    last_sent_at        TIMESTAMP    NULL,
                                     -- Track terakhir terima broadcast; debug + cleanup idle
    CONSTRAINT chk_subscriber_status CHECK (status IN ('pending','confirmed','unsubscribed')),
    CONSTRAINT uq_subscriber_blog_email UNIQUE (id_blog, email)
);

COMMENT ON TABLE interaction.subscriber IS 'Public newsletter subscribers per blog (Phase BB)';
COMMENT ON COLUMN interaction.subscriber.email IS 'Subscriber email (no auth required)';
COMMENT ON COLUMN interaction.subscriber.token_unsubscribe IS 'Permanent token untuk one-click unsubscribe dari email footer';

-- Hot path 1: token lookup saat confirm/unsubscribe click.
CREATE INDEX IF NOT EXISTS idx_subscriber_token_verify
    ON interaction.subscriber(token_verify)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_subscriber_token_unsubscribe
    ON interaction.subscriber(token_unsubscribe);

-- Hot path 2: fanout query saat publish post. SELECT email FROM subscriber
-- WHERE id_blog = $1 AND status = 'confirmed'.
CREATE INDEX IF NOT EXISTS idx_subscriber_blog_confirmed
    ON interaction.subscriber(id_blog)
    WHERE status = 'confirmed';
