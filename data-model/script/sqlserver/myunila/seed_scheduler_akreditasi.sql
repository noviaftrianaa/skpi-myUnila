-- ============================================================================
-- Seed Scheduler — Akreditasi BAN-PT (myunila-service)
-- ============================================================================
-- Service: myunila-service (sync_type = "akreditasi")
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut (SQL Server).
-- Cron timezone: container scheduler running di Asia/Jakarta (WIB).
-- Format cron: "detik menit jam tanggal bulan dow" (robfig/cron 6-field).
--
-- Default: BULANAN tanggal 1 pukul 02:00 WIB. is_active=0 (admin enable manual
-- via UI Scheduled Syncs di /dashboard/integrator/akreditasi). Schedule tidak
-- jalan otomatis sampai admin toggle ON — sesuai kebijakan operasional.
--
-- Sync logic (saat dijalankan): trigger BAN-PT fetch → match prodi → apply
-- update ke pdrd.akreditasi_prodi (mode="apply"), tulis log ke
-- myunila.akreditasi_sync_log + akreditasi_sync_log_detail.
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
    N'Akreditasi BAN-PT Sync Bulanan'
);

-- ============================================================================
-- 2. INSERT
-- ============================================================================
INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, next_run_at, is_active, created_by)
VALUES
    -- Akreditasi BAN-PT — fetch direktori publik banpt.or.id, filter UNILA,
    -- match ke pdrd.sms (stat_prodi='A' + id_fak_unila NOT NULL + id_jns_sms=3),
    -- apply update ke pdrd.akreditasi_prodi. Default OFF — admin enable manual.
    (N'Akreditasi BAN-PT Sync Bulanan',
     N'Sync data akreditasi prodi dari BAN-PT (banpt.or.id) ke pdrd.akreditasi_prodi setiap tanggal 1 pukul 02:00 WIB. Default DISABLED — admin enable via UI integrator/akreditasi.',
     N'akreditasi', NULL, N'0 0 2 1 * *',
     CAST('2026-06-01T02:00:00' AS DATETIME2), 0, @creator);

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT id, name, sync_type, cron_expression, is_active, created_by
FROM dbo.scheduled_syncs
WHERE sync_type = 'akreditasi'
ORDER BY cron_expression;

PRINT N'Selesai — 1 jadwal akreditasi di-seed (DISABLED by default). Toggle ON di UI scheduler untuk aktifkan.';
