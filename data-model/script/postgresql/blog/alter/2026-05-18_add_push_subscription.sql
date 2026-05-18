-- Migration: interaction.push_subscription (Sprint 13 Phase BA — web push notif)
--
-- Browser PushSubscription objects per user. Setiap browser/device punya 1 row
-- (composite unique pada (user, endpoint) — endpoint URL identifies device).
--
-- Lifecycle:
--   - Frontend: navigator.serviceWorker.register + subscribe → POST endpoint+keys
--   - Backend: store row → kalau notif emit, pakai endpoint+keys untuk push
--   - Browser ke-revoke permission → push fail (410 Gone) → row di-delete
--
-- Bukan source of truth notification — itu interaction.notifikasi (in-app).
-- Push table cuma store delivery target (device endpoints).

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.push_subscription (
    id_subscription   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut  UUID         NOT NULL,
    endpoint          TEXT         NOT NULL,
                                   -- Full push service URL (FCM/Mozilla/Apple)
                                   -- e.g. https://fcm.googleapis.com/fcm/send/abc...
    p256dh            TEXT         NOT NULL,
                                   -- Public ECDH key (base64url) untuk encrypt payload
    auth              TEXT         NOT NULL,
                                   -- Auth secret (base64url, 16 bytes) untuk
                                   -- handshake encrypt
    user_agent        VARCHAR(255) NULL,
                                   -- Display di settings: "Chrome di Windows"
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_used_at      TIMESTAMP    NULL,
                                   -- Update saat push terkirim OK; idle device
                                   -- bisa di-prune nanti
    last_error        TEXT         NULL,
                                   -- Last push error (debugging); auto-clear on success
    CONSTRAINT uq_push_subscription_user_endpoint
        UNIQUE (id_pengguna_pdut, endpoint)
);

COMMENT ON TABLE interaction.push_subscription IS 'Browser PushSubscription per user/device (Phase BA)';
COMMENT ON COLUMN interaction.push_subscription.endpoint IS 'Full push service URL (FCM/Mozilla/Apple)';

-- Hot path: notif emit → fan-out push ke semua device user. Index per user.
CREATE INDEX IF NOT EXISTS idx_push_subscription_user
    ON interaction.push_subscription(id_pengguna_pdut);
