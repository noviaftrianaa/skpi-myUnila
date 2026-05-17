-- Migration: blog.post_co_author.status (Sprint 12 Phase AU)
-- Adds an explicit accept/decline workflow to co-authorship. Phase AN
-- inserted co-authors directly into the byline; this fixes the consent gap.
--
-- Workflow:
--   1. Primary author POSTs an invite → row created with status='pending'
--   2. NotifService emits a `coauthor_invite` notif to the invitee
--   3. Invitee PATCHes /me/co-author-invites/:idPost with accept|decline
--   4. status flips to 'accepted' or 'declined' + responded_at set
--   5. Public byline filters to status='accepted'

SET search_path TO ref, blog, media, interaction, moderation, audit;

ALTER TABLE blog.post_co_author
    ADD COLUMN IF NOT EXISTS status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS responded_at  TIMESTAMP   NULL,
    ADD COLUMN IF NOT EXISTS alasan_response TEXT NULL;

-- Pre-existing rows (Phase AN inserts) are grandfathered as already-accepted
-- so the public byline doesn't suddenly hide them.
UPDATE blog.post_co_author
    SET status = 'accepted', responded_at = created_at
    WHERE status = 'pending' AND responded_at IS NULL
      AND created_at < NOW() - INTERVAL '1 minute'; -- safety margin

ALTER TABLE blog.post_co_author
    DROP CONSTRAINT IF EXISTS chk_pca_status;
ALTER TABLE blog.post_co_author
    ADD CONSTRAINT chk_pca_status
    CHECK (status IN ('pending', 'accepted', 'declined'));

COMMENT ON COLUMN blog.post_co_author.status IS 'Workflow: pending (sent), accepted (visible in byline), declined (hidden but kept for audit)';
COMMENT ON COLUMN blog.post_co_author.responded_at IS 'When the invitee responded; NULL while still pending';
COMMENT ON COLUMN blog.post_co_author.alasan_response IS 'Optional decline reason / acceptance note from the invitee';

-- Hot path: public byline filter. Same shape as existing idx_pca_blog_co but
-- partial on accepted status so byline reads stay cheap.
CREATE INDEX IF NOT EXISTS idx_pca_status_pending
    ON blog.post_co_author(id_blog_co)
    WHERE status = 'pending';
