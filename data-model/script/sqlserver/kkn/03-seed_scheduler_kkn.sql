-- ============================================================================
-- Seed Scheduler — KKN Sync (myunila-service)
-- ============================================================================
-- Service: myunila-service (sync_type = "kkn")
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut (SQL Server).
-- Cron timezone: container scheduler running di Asia/Jakarta (WIB).
-- Format cron: "detik menit jam tanggal bulan dow" (robfig/cron 6-field).
--
-- Default: MINGGUAN setiap Senin pukul 03:00 WIB. is_active=0 (admin enable
-- manual via UI Scheduled Syncs di /dashboard/integrator). Schedule tidak
-- jalan otomatis sampai admin toggle ON.
--
-- Sync logic: fetch all KKN data dari KKN WS API (MySQL legacy) lalu upsert
-- ke kkn.* tables di SQL Server. Urutan: referensi → lokasi → pendaftaran →
-- penempatan → nilai → laporan.
--
-- IDEMPOTENT: DELETE dulu lalu INSERT. Aman re-run.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

-- ============================================================================
-- 1. CLEANUP
-- ============================================================================
DELETE FROM dbo.scheduled_syncs
WHERE name IN (
    N'KKN Sync Mingguan'
);

-- ============================================================================
-- 2. INSERT
-- ============================================================================
INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, next_run_at, is_active, created_by)
VALUES
    (N'KKN Sync Mingguan',
     N'Sync data KKN dari MySQL legacy (via KKN WS API) ke kkn.* SQL Server setiap Senin pukul 03:00 WIB. Mencakup: periode, lokasi, pendaftaran, penempatan, nilai, laporan. Default DISABLED — admin enable via UI integrator.',
     N'kkn', NULL, N'0 0 3 * * 1',
     CAST('2026-05-12T03:00:00' AS DATETIME2), 0, @creator);

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT id, name, sync_type, cron_expression, is_active, created_by
FROM dbo.scheduled_syncs
WHERE sync_type = 'kkn'
ORDER BY cron_expression;

PRINT N'Selesai — 1 jadwal KKN di-seed (DISABLED by default). Toggle ON di UI scheduler untuk aktifkan.';
