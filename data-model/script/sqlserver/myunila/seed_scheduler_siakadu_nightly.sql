-- ============================================================================
-- Seed Scheduler — SIAKADU Sync Nightly
-- ============================================================================
-- Tujuan: Insert 10 jadwal harian otomatis untuk semua sync_type siakadu_*
--         di myunila-service scheduler. Semua run setiap malam, di-stagger
--         per 10 menit dari 22:00 sampai 23:30 supaya tidak bersamaan
--         hit endpoint SIAKADU.
--
-- Tabel target: dbo.scheduled_syncs (DB pdut/pdut_staging — SQL Server)
-- Skema:
--   id (IDENTITY), name (UNIQUE), description, sync_type, endpoint_key,
--   cron_expression (6-field: detik menit jam hari bulan dow),
--   schedule_time (DATETIME2 display saja), is_active (BIT),
--   last_run_at, next_run_at, created_by, created_at, updated_at
--
-- Cron format: "0 mm hh * * *" → tiap hari pada jam:menit (UTC server,
--              bukan WIB!). Sesuaikan di bawah jika scheduler dijalankan
--              di TZ Asia/Jakarta atau UTC.
-- Asumsi di sini: server scheduler pakai TZ Asia/Jakarta (WIB).
--
-- Aman re-run: pakai IF NOT EXISTS by name (UNIQUE) — tidak duplicate.
-- Penggunaan: paste di SSMS yang sudah connect ke pdut/pdut_staging.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

DECLARE @creator NVARCHAR(255) = N'admin.scheduler';  -- Sesuaikan username admin yang membuat

-- Helper inline: insert 1 row kalau belum ada dengan nama itu
DECLARE @sql NVARCHAR(MAX);

-- 1. SIAKADU Referensi Unit + Pimpinan — paling foundational, jalan paling awal
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Referensi Unit Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Referensi Unit Sync Harian',
         N'Sync referensi unit + pimpinan dari SIAKADU setiap malam pukul 22:00 WIB',
         N'siakadu_referensi', NULL, N'0 0 22 * * *',
         CAST('2026-01-01T22:00:00' AS DATETIME2), 1, @creator);
END

-- 2. SIAKADU Mahasiswa — population data mahasiswa, tergantung referensi unit
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Mahasiswa Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Mahasiswa Sync Harian',
         N'Sync data mahasiswa dari SIAKADU setiap malam pukul 22:10 WIB',
         N'siakadu_mahasiswa', NULL, N'0 10 22 * * *',
         CAST('2026-01-01T22:10:00' AS DATETIME2), 1, @creator);
END

-- 3. SIAKADU Kurikulum
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Kurikulum Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Kurikulum Sync Harian',
         N'Sync kurikulum dari SIAKADU setiap malam pukul 22:20 WIB',
         N'siakadu_kurikulum', NULL, N'0 20 22 * * *',
         CAST('2026-01-01T22:20:00' AS DATETIME2), 1, @creator);
END

-- 4. SIAKADU Mata Kuliah
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Mata Kuliah Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Mata Kuliah Sync Harian',
         N'Sync mata kuliah dari SIAKADU setiap malam pukul 22:30 WIB',
         N'siakadu_matakuliah', NULL, N'0 30 22 * * *',
         CAST('2026-01-01T22:30:00' AS DATETIME2), 1, @creator);
END

-- 5. SIAKADU Kelas
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Kelas Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Kelas Sync Harian',
         N'Sync kelas dari SIAKADU setiap malam pukul 22:40 WIB',
         N'siakadu_kelas', NULL, N'0 40 22 * * *',
         CAST('2026-01-01T22:40:00' AS DATETIME2), 1, @creator);
END

-- 6. SIAKADU Akademik (consolidator matakuliah+kurikulum+kelas semua prodi)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Akademik All Prodi Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Akademik All Prodi Sync Harian',
         N'Sync akademik (matakuliah + kurikulum + kelas) semua prodi setiap malam pukul 22:50 WIB',
         N'siakadu_akademik', NULL, N'0 50 22 * * *',
         CAST('2026-01-01T22:50:00' AS DATETIME2), 1, @creator);
END

-- 7. SIAKADU KHS (nilai)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU KHS Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU KHS Sync Harian',
         N'Sync nilai KHS dari SIAKADU setiap malam pukul 23:00 WIB',
         N'siakadu_khs', NULL, N'0 0 23 * * *',
         CAST('2026-01-01T23:00:00' AS DATETIME2), 1, @creator);
END

-- 8. SIAKADU Kuliah (status kuliah aktif/cuti/dst)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Status Kuliah Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Status Kuliah Sync Harian',
         N'Sync status kuliah dari SIAKADU setiap malam pukul 23:10 WIB',
         N'siakadu_kuliah', NULL, N'0 10 23 * * *',
         CAST('2026-01-01T23:10:00' AS DATETIME2), 1, @creator);
END

-- 9. SIAKADU Transkrip (per-NPM batch — paling berat)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Transkrip Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Transkrip Sync Harian',
         N'Sync transkrip per-NPM batch dari SIAKADU setiap malam pukul 23:20 WIB',
         N'siakadu_transkrip', NULL, N'0 20 23 * * *',
         CAST('2026-01-01T23:20:00' AS DATETIME2), 1, @creator);
END

-- 10. SIAKADU Wisuda (registered di scheduler entity 2026-04-26)
IF NOT EXISTS (SELECT 1 FROM dbo.scheduled_syncs WHERE name = 'SIAKADU Wisuda Sync Harian')
BEGIN
    INSERT INTO dbo.scheduled_syncs
        (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
    VALUES
        (N'SIAKADU Wisuda Sync Harian',
         N'Sync data wisuda dari SIAKADU setiap malam pukul 23:30 WIB',
         N'siakadu_wisuda', NULL, N'0 30 23 * * *',
         CAST('2026-01-01T23:30:00' AS DATETIME2), 1, @creator);
END

-- ============================================================================
-- Verifikasi: lihat hasil insert
-- ============================================================================
SELECT id, name, sync_type, cron_expression, schedule_time, is_active, created_by, created_at
FROM dbo.scheduled_syncs
WHERE sync_type LIKE 'siakadu_%'
ORDER BY cron_expression;

PRINT N'Selesai — 10 jadwal SIAKADU sync harian berhasil di-seed (atau sudah ada).';
