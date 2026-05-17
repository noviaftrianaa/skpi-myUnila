-- Migration: email notifications stack (Sprint 12 Phase AY)
--
-- Three new tables + 1 column:
--   1. blog.mail_config    — admin-managed SMTP profile (dynamic; no env hardcode)
--   2. blog.blog.email_pengguna — denorm email from JWT, captured opportunistically
--   3. interaction.email_outbox — queue with retry/error tracking
--
-- Mail config is a singleton (only one active row drives delivery). We
-- enforce this via a partial unique index, not a CHECK, so admins can keep
-- history (a_aktif=FALSE) for audit/rollback.
--
-- Security caveat: smtp_password stored as plain text in this v1 — matches
-- simbak/si-prestasi pattern. Production hardening = AES-GCM with
-- MAIL_ENCRYPTION_KEY from env. Track as tech debt.

SET search_path TO ref, blog, media, interaction, moderation, audit;

-- =============================================================================
-- 1. mail_config
-- =============================================================================

CREATE TABLE IF NOT EXISTS blog.mail_config (
    id_mail_config   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    label            VARCHAR(100)    NOT NULL,
                                      -- Human-readable name ("Unila Relay", "Dev Mailpit")
    smtp_host        VARCHAR(200)    NOT NULL,
    smtp_port        INT             NOT NULL DEFAULT 587,
    smtp_username    VARCHAR(200)    NULL,
                                      -- NULL = anonymous SMTP (e.g. local Mailpit)
    smtp_password    TEXT            NULL,
                                      -- Plain text v1; harden later via env-keyed AES-GCM
    use_tls          BOOLEAN         NOT NULL DEFAULT TRUE,
    use_starttls     BOOLEAN         NOT NULL DEFAULT TRUE,
    from_address     VARCHAR(200)    NOT NULL,
    from_name        VARCHAR(120)    NOT NULL DEFAULT 'Blog Unila',
    public_url       VARCHAR(200)    NOT NULL DEFAULT 'https://blog.unila.ac.id',
                                      -- Base URL for unsubscribe + post links in email body
    a_aktif          BOOLEAN         NOT NULL DEFAULT TRUE,
    catatan          TEXT            NULL,
    id_creator       UUID            NULL,
    id_updater       UUID            NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE blog.mail_config IS 'Dynamic SMTP profiles managed via admin UI (Phase AY)';
COMMENT ON COLUMN blog.mail_config.smtp_password IS 'Plain text v1 — harden with AES-GCM + MAIL_ENCRYPTION_KEY env';

-- Partial unique index: at most one active row at a time. Inactive rows kept
-- for audit/rollback (admin can flip active flag).
CREATE UNIQUE INDEX IF NOT EXISTS uq_mail_config_active
    ON blog.mail_config((1)) WHERE a_aktif = TRUE;

CREATE TRIGGER trg_mail_config_updated_at
    BEFORE UPDATE ON blog.mail_config
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =============================================================================
-- 2. blog.blog.email_pengguna (denorm)
-- =============================================================================

ALTER TABLE blog.blog
    ADD COLUMN IF NOT EXISTS email_pengguna VARCHAR(200) NULL;

COMMENT ON COLUMN blog.blog.email_pengguna IS 'Captured from JWT on /me requests (Phase AY) — required for email notif delivery';

-- =============================================================================
-- 3. interaction.email_outbox
-- =============================================================================

CREATE TABLE IF NOT EXISTS interaction.email_outbox (
    id_email          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerima_pdut  UUID         NOT NULL,
                                    -- Recipient user (matches notifikasi.id_penerima_pdut)
    id_notifikasi     UUID         NULL REFERENCES interaction.notifikasi(id_notifikasi) ON DELETE SET NULL,
                                    -- Source notif (1:1 link for retry/debug)
    recipient_email   VARCHAR(200) NOT NULL,
    subject           VARCHAR(255) NOT NULL,
    body_html         TEXT         NOT NULL,
    body_text         TEXT         NULL,
                                    -- Plain-text fallback (rendered alongside HTML)
    tipe              VARCHAR(40)  NOT NULL,
                                    -- Mirrors notifikasi.tipe (like_post / komentar_post / ...)
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
                                    -- pending / sending / sent / failed
    attempts          INT          NOT NULL DEFAULT 0,
    next_attempt_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
                                    -- Worker picks rows where next_attempt_at <= NOW()
    sent_at           TIMESTAMP    NULL,
    last_error        TEXT         NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_email_status CHECK (status IN ('pending','sending','sent','failed'))
);

COMMENT ON TABLE interaction.email_outbox IS 'Outbound email queue with retry tracking (Phase AY)';

-- Worker hot path: pending rows due for sending.
CREATE INDEX IF NOT EXISTS idx_email_outbox_due
    ON interaction.email_outbox(next_attempt_at)
    WHERE status = 'pending';

-- Admin "sent" / "failed" history view.
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_created
    ON interaction.email_outbox(status, created_at DESC);
