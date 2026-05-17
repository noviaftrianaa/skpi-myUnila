-- Migration: moderation.banned_user (Sprint 12 Phase AO)
-- Admin tool untuk block user bad actor dari aksi engagement (post, komentar,
-- like, follow, bookmark). Soft-enforcement at handler-level via middleware.
--
-- Ban duration:
--   - banned_until = NULL → permanent
--   - banned_until > NOW() → active
--   - banned_until <= NOW() → expired (auto-treated as unbanned by middleware)
--
-- Admin can also explicitly unban via soft_delete (preserves history).

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS moderation.banned_user (
    id_ban              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut    UUID            NOT NULL,
                                        -- The user being banned. Cross-DB UUID
                                        -- (matches blog.blog.id_pengguna_pdut)
    alasan              TEXT            NOT NULL,
                                        -- Required: every ban must have a reason
                                        -- (visible in audit log + appeals)
    banned_at           TIMESTAMP       NOT NULL DEFAULT NOW(),
    banned_until        TIMESTAMP       NULL,
                                        -- NULL = permanent
    id_banned_by        UUID            NOT NULL,
                                        -- Admin who issued the ban
    catatan_internal    TEXT            NULL,
                                        -- Admin-only notes (evidence link, etc)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
                                        -- Set on explicit unban; keeps audit trail
);

COMMENT ON TABLE moderation.banned_user IS 'Users blocked from engagement actions (Phase AO)';
COMMENT ON COLUMN moderation.banned_user.banned_until IS 'NULL = permanent; expired bans treated as inactive by middleware';

-- Hot path: middleware checks IsBanned(id_pengguna_pdut) on every engagement
-- request. Partial index keeps the lookup tight to only active bans.
CREATE INDEX IF NOT EXISTS idx_banned_user_active
    ON moderation.banned_user(id_pengguna_pdut)
    WHERE soft_delete IS NULL;

-- For admin list paging by created_at.
CREATE INDEX IF NOT EXISTS idx_banned_user_created
    ON moderation.banned_user(created_at DESC)
    WHERE soft_delete IS NULL;

CREATE TRIGGER trg_banned_user_updated_at
    BEFORE UPDATE ON moderation.banned_user
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Multiple active bans for same user are allowed in case of repeated offenses
-- with overlapping windows; the middleware OR's them (any active ban → blocked).
-- No unique constraint on id_pengguna_pdut.
