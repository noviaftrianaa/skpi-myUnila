-- ============================================================================
-- Seed Scheduler — MANAKSES Sync Nightly (Radius + Unit Organisasi)
-- ============================================================================
-- Tujuan: Insert jadwal harian otomatis untuk sync manakses (data pengguna ke
--         SSO Radius + sinkronisasi unit organisasi). Run sebelum siakadu
--         (jam 21:xx) supaya tidak overlap dengan window siakadu (22:00-23:30).
--
-- Tabel target: dbo.scheduled_syncs (DB pdut/pdut_staging — SQL Server)
-- Frontend trigger manual: /dashboard/integrator/manakses/sso-radius
--                          /dashboard/integrator/manakses/unit-organisasi
-- Backend endpoint:        POST /radius/sync
--                          POST /unit-organisasi/sync (via SMS)
-- Scheduler sync_type:     'radius', 'unit_organisasi'
--
-- Aman re-run: pakai IF NOT EXISTS by name (UNIQUE) — tidak duplicate.
-- Penggunaan: paste di SSMS yang sudah connect ke pdut/pdut_staging.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

DECLARE @creator NVARCHAR(255) = N'admin.scheduler';  -- Sesuaikan username admin yang membuat

-- 1. RADIUS — sync data pengguna ke SSO Radius (foundation manakses, paling awal)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'Radius Pengguna Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'Radius Pengguna Sync Harian',
         N'Sync data pengguna ke SSO Radius (manakses) setiap malam pukul 21:00 WIB',
         N'radius', NULL, N'0 0 21 * * *',
         CAST('2026-01-01T21:00:00' AS DATETIME2), 1, @creator);
END

-- 2. UNIT ORGANISASI — sync unit organisasi dari SMS ke Manakses
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'Unit Organisasi SMS Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'Unit Organisasi SMS Sync Harian',
         N'Sync data unit organisasi dari SMS ke Manakses setiap malam pukul 21:30 WIB',
         N'unit_organisasi', NULL, N'0 30 21 * * *',
         CAST('2026-01-01T21:30:00' AS DATETIME2), 1, @creator);
END

-- ============================================================================
-- Verifikasi: lihat hasil insert
-- ============================================================================
SELECT id, name, sync_type, cron_expression, schedule_time, is_active, created_by, created_at
FROM dbo.scheduled_syncs
WHERE sync_type IN ('radius', 'unit_organisasi')
ORDER BY cron_expression;

PRINT N'Selesai — jadwal MANAKSES (radius + unit_organisasi) sync harian berhasil di-seed.';
