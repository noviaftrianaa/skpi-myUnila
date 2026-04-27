-- ============================================================================
-- Seed Scheduler — MyUnila Service (consolidated)
-- ============================================================================
-- Service: myunila-service (sync_type: pegawai, radius, unit_organisasi,
--          siakadu_*, dst).
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut (SQL Server).
-- Cron timezone: container scheduler running di Asia/Jakarta (WIB).
--   Verified docker-compose env: TZ=Asia/Jakarta untuk myunila/sister/feeder.
--   `date` di container: WIB. → cron expression interpreted di WIB.
-- Format cron: "detik menit jam tanggal bulan dow" (robfig/cron 6-field).
--   dow: 0=Minggu, 1=Senin, ..., 6=Sabtu.
--
-- IDEMPOTENT: Top section DELETE semua schedule existing untuk service
-- myunila ini berdasarkan list nama. Lalu INSERT batch bersih. Aman re-run,
-- tidak akan double — duplicate karena UNIQUE constraint pada `name`.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

-- ============================================================================
-- 1. CLEANUP — hapus schedule existing yang akan di-replace
-- ============================================================================
DELETE FROM dbo.scheduled_syncs
WHERE name IN (
    N'MyUnila Pegawai SIKEP Sync Mingguan',
    N'Radius Pengguna Sync Harian',
    N'Unit Organisasi SMS Sync Harian',
    N'SIAKADU Referensi Unit Sync Harian',  -- legacy: dulu di-jadwal, sekarang manual admin
    N'SIAKADU Mahasiswa Sync Harian',
    N'SIAKADU Kurikulum Sync Harian',
    N'SIAKADU Mata Kuliah Sync Harian',
    N'SIAKADU Kelas Sync Harian',
    N'SIAKADU Akademik All Prodi Sync Harian',
    N'SIAKADU KHS Sync Harian',
    N'SIAKADU Status Kuliah Sync Harian',
    N'SIAKADU Transkrip Sync Harian',
    N'SIAKADU Wisuda Sync Harian'
);
GO

-- ============================================================================
-- 2. INSERT batch — myunila scheduler (13 jadwal)
-- ============================================================================
DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
VALUES
    -- Pegawai SIKEP — mingguan Senin pukul 02:00 WIB (data tendik jarang berubah)
    (N'MyUnila Pegawai SIKEP Sync Mingguan',
     N'Sync data pegawai dari SIKEP setiap Senin malam pukul 02:00 WIB',
     N'pegawai', NULL, N'0 0 2 * * 1',
     CAST('2026-01-01T02:00:00' AS DATETIME2), 1, @creator),

    -- Manakses SSO — radius pengguna harian
    (N'Radius Pengguna Sync Harian',
     N'Sync data pengguna ke SSO Radius setiap malam pukul 21:00 WIB',
     N'radius', NULL, N'0 0 21 * * *',
     CAST('2026-01-01T21:00:00' AS DATETIME2), 1, @creator),

    -- Manakses unit_organisasi harian
    (N'Unit Organisasi SMS Sync Harian',
     N'Sync data unit organisasi dari SMS ke Manakses setiap malam pukul 21:30 WIB',
     N'unit_organisasi', NULL, N'0 30 21 * * *',
     CAST('2026-01-01T21:30:00' AS DATETIME2), 1, @creator),

    -- SIAKADU — 9 jadwal stagger 22:10-23:30 (NO siakadu_referensi: by manual admin)
    (N'SIAKADU Mahasiswa Sync Harian',
     N'Sync data mahasiswa dari SIAKADU setiap malam pukul 22:10 WIB',
     N'siakadu_mahasiswa', NULL, N'0 10 22 * * *',
     CAST('2026-01-01T22:10:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Kurikulum Sync Harian',
     N'Sync kurikulum dari SIAKADU setiap malam pukul 22:20 WIB',
     N'siakadu_kurikulum', NULL, N'0 20 22 * * *',
     CAST('2026-01-01T22:20:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Mata Kuliah Sync Harian',
     N'Sync mata kuliah dari SIAKADU setiap malam pukul 22:30 WIB',
     N'siakadu_matakuliah', NULL, N'0 30 22 * * *',
     CAST('2026-01-01T22:30:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Kelas Sync Harian',
     N'Sync kelas dari SIAKADU setiap malam pukul 22:40 WIB',
     N'siakadu_kelas', NULL, N'0 40 22 * * *',
     CAST('2026-01-01T22:40:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Akademik All Prodi Sync Harian',
     N'Sync akademik (matakuliah + kurikulum + kelas) semua prodi setiap malam pukul 22:50 WIB',
     N'siakadu_akademik', NULL, N'0 50 22 * * *',
     CAST('2026-01-01T22:50:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU KHS Sync Harian',
     N'Sync nilai KHS dari SIAKADU setiap malam pukul 23:00 WIB',
     N'siakadu_khs', NULL, N'0 0 23 * * *',
     CAST('2026-01-01T23:00:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Status Kuliah Sync Harian',
     N'Sync status kuliah dari SIAKADU setiap malam pukul 23:10 WIB',
     N'siakadu_kuliah', NULL, N'0 10 23 * * *',
     CAST('2026-01-01T23:10:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Transkrip Sync Harian',
     N'Sync transkrip per-NPM batch dari SIAKADU setiap malam pukul 23:20 WIB',
     N'siakadu_transkrip', NULL, N'0 20 23 * * *',
     CAST('2026-01-01T23:20:00' AS DATETIME2), 1, @creator),

    (N'SIAKADU Wisuda Sync Harian',
     N'Sync data wisuda dari SIAKADU setiap malam pukul 23:30 WIB',
     N'siakadu_wisuda', NULL, N'0 30 23 * * *',
     CAST('2026-01-01T23:30:00' AS DATETIME2), 1, @creator);

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT id, name, sync_type, cron_expression, is_active, created_by
FROM dbo.scheduled_syncs
WHERE sync_type IN ('pegawai', 'radius', 'unit_organisasi')
   OR sync_type LIKE 'siakadu_%'
ORDER BY cron_expression;

PRINT N'Selesai — 12 jadwal myunila-service di-seed (siakadu_referensi by manual admin, tidak di-jadwal). Service akan auto-pickup setelah restart container.';
