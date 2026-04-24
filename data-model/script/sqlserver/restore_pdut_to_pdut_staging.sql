-- ============================================================================
-- Restore: pdut (production) → pdut_staging
-- ----------------------------------------------------------------------------
-- Tujuan: sync schema + data production ke staging supaya pengembangan WS API,
-- SIMBAK, SI-Prestasi, dll test dengan data realistis.
--
-- LINGKUNGAN: SQL Server 192.168.123.119, jalankan di SSMS sebagai admin (sa).
--
-- ⚠️  PENTING
--   - Script ini pakai WITH REPLACE → OVERWRITE isi pdut_staging sekarang.
--   - Ada step SET SINGLE_USER WITH ROLLBACK IMMEDIATE → TENDANG semua koneksi
--     yang sedang konek ke pdut_staging. Pastikan service staging sudah di-stop
--     sebelum jalanin (lihat `RUN ORDER` di bawah).
--   - Ganti placeholder path <...> sesuai lokasi file di server SQL sebelum exec.
--
-- RUN ORDER (urut dari host yang akses VM5 staging):
--
--   1. STOP containers staging yang konek ke pdut_staging:
--      ssh user@192.168.120.45
--      cd /var/www/my-unila/deployment/production/vm5-staging
--      docker stop \
--        myunila-ws-staging \
--        myunila-auth-staging \
--        myunila-simbak-staging \
--        myunila-public-staging \
--        myunila-myunila-staging \
--        myunila-keuangan-staging \
--        myunila-dashboard-staging \
--        myunila-feeder-staging \
--        myunila-sister-staging \
--        myunila-monitoring-staging \
--        myunila-si-prestasi-staging \
--        myunila-project-staging \
--        myunila-public-scheduler-staging
--      # biarin postgres + redis + kong + nginx jalan (tidak konek pdut_staging)
--
--   2. Jalanin SCRIPT INI dari SSMS (ganti placeholder dulu).
--
--   3. START containers lagi:
--      bash scripts/rebuild-service.sh all
--      # atau manual: docker start <list-yang-tadi>
-- ============================================================================

USE master;
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

-- ----------------------------------------------------------------------------
-- STEP 1 — Safety check: pastikan file backup exist + path sudah di-isi
-- ----------------------------------------------------------------------------
-- GANTI path berikut:
--   @BackupFile  = full path ke file .bak yang sudah kamu simpan di server
--   @DataFileDir = folder tempat .mdf/.ldf pdut_staging akan di-tulis
-- ----------------------------------------------------------------------------
DECLARE @BackupFile  NVARCHAR(500) = N'<GANTI: D:\Backup\pdut_YYYYMMDD.bak>';
DECLARE @DataFileDir NVARCHAR(500) = N'<GANTI: D:\SQLData>';
DECLARE @DbName      NVARCHAR(128) = N'pdut_staging';

-- Derive logical file destinations.
DECLARE @MdfPath NVARCHAR(500) = @DataFileDir + N'\pdut_staging.mdf';
DECLARE @LdfPath NVARCHAR(500) = @DataFileDir + N'\pdut_staging_log.ldf';

PRINT 'Restore setup:';
PRINT '  Backup file : ' + @BackupFile;
PRINT '  Target MDF  : ' + @MdfPath;
PRINT '  Target LDF  : ' + @LdfPath;
PRINT '';

-- ----------------------------------------------------------------------------
-- STEP 2 — Tendang semua koneksi ke pdut_staging (SINGLE_USER mode)
-- ----------------------------------------------------------------------------
IF DB_ID(@DbName) IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX) =
        N'ALTER DATABASE [' + @DbName + N'] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';
    EXEC sp_executesql @sql;
    PRINT 'STEP 2 OK — pdut_staging di-isolate (SINGLE_USER)';
END
ELSE
BEGIN
    PRINT 'STEP 2 SKIP — pdut_staging belum ada (akan di-create oleh RESTORE)';
END
GO

-- ----------------------------------------------------------------------------
-- STEP 3 — Introspeksi logical file names dari backup (biar MOVE benar)
-- ----------------------------------------------------------------------------
-- Hasil RESTORE FILELISTONLY harus punya 2 baris:
--   Type=D (data file)  → logical name biasanya "pdut" atau "pdut_Data"
--   Type=L (log file)   → logical name biasanya "pdut_Log" atau "pdut_log"
-- Kalau logical name-nya beda, sesuaikan @LogicalDataName / @LogicalLogName.
-- ----------------------------------------------------------------------------
DECLARE @BackupFile NVARCHAR(500) = N'<GANTI: D:\Backup\pdut_YYYYMMDD.bak>';

PRINT 'STEP 3 — Info file di dalam backup (cek logical names):';
DECLARE @cmd NVARCHAR(MAX) = N'RESTORE FILELISTONLY FROM DISK = N''' + @BackupFile + N'''';
EXEC (@cmd);
GO

-- ----------------------------------------------------------------------------
-- STEP 4 — RESTORE
-- ----------------------------------------------------------------------------
-- Sesuaikan @LogicalDataName + @LogicalLogName dari output STEP 3 kalau berbeda.
-- ----------------------------------------------------------------------------
DECLARE @BackupFile      NVARCHAR(500) = N'<GANTI: D:\Backup\pdut_YYYYMMDD.bak>';
DECLARE @DataFileDir     NVARCHAR(500) = N'<GANTI: D:\SQLData>';
DECLARE @LogicalDataName NVARCHAR(128) = N'pdut';     -- default; sesuaikan dari STEP 3
DECLARE @LogicalLogName  NVARCHAR(128) = N'pdut_log'; -- default; sesuaikan dari STEP 3

DECLARE @MdfPath NVARCHAR(500) = @DataFileDir + N'\pdut_staging.mdf';
DECLARE @LdfPath NVARCHAR(500) = @DataFileDir + N'\pdut_staging_log.ldf';

DECLARE @restoreSQL NVARCHAR(MAX) =
N'RESTORE DATABASE [pdut_staging]
  FROM DISK = N''' + @BackupFile + N'''
  WITH REPLACE, RECOVERY, STATS = 5,
       MOVE N''' + @LogicalDataName + N''' TO N''' + @MdfPath + N''',
       MOVE N''' + @LogicalLogName  + N''' TO N''' + @LdfPath + N''';';

PRINT 'STEP 4 — Executing RESTORE (ini bisa makan waktu, tunggu sampai selesai)...';
PRINT @restoreSQL;
EXEC sp_executesql @restoreSQL;
PRINT 'STEP 4 OK — pdut_staging berhasil di-restore dari backup pdut';
GO

-- ----------------------------------------------------------------------------
-- STEP 5 — Kembali ke MULTI_USER
-- ----------------------------------------------------------------------------
ALTER DATABASE [pdut_staging] SET MULTI_USER;
PRINT 'STEP 5 OK — pdut_staging sudah MULTI_USER (ready to accept connections)';
GO

-- ----------------------------------------------------------------------------
-- STEP 6 — Quick sanity check
-- ----------------------------------------------------------------------------
USE pdut_staging;
GO

SELECT
    (SELECT COUNT(*) FROM pdrd.peserta_didik)       AS pdrd_peserta_didik,
    (SELECT COUNT(*) FROM pdrd.sdm)                 AS pdrd_sdm,
    (SELECT COUNT(*) FROM man_akses.pengguna)       AS man_akses_pengguna,
    (SELECT COUNT(*) FROM man_akses.aplikasi)       AS man_akses_aplikasi,
    (SELECT COUNT(*) FROM ref.semester)             AS ref_semester,
    (SELECT COUNT(*) FROM man_akses.ws_endpoint
        WHERE soft_delete = 0)                      AS ws_endpoint_active;

PRINT 'Restore selesai. Verifikasi count di atas — kalau ada 0 di tabel utama, cek log RESTORE.';
PRINT 'Setelah ini:';
PRINT '  1. Start containers staging di VM5.';
PRINT '  2. Test login/health service: http://192.168.120.45:9800/auth-service/api/v1/health';
PRINT '  3. Rebuild api → auto-sync endpoint akan re-populate ws_endpoint (idempotent).';
GO

-- ============================================================================
-- ROLLBACK / RECOVERY
-- ============================================================================
-- Kalau restore ternyata bermasalah dan kamu mau kembali ke state sebelum
-- restore, perlu backup pdut_staging DULU sebelum run script ini. Rekomendasi:
--
--   BACKUP DATABASE pdut_staging
--   TO DISK = N'<path>\pdut_staging_before_restore_YYYYMMDD.bak'
--   WITH COPY_ONLY, COMPRESSION;
--
-- Kalau ternyata mau rollback:
--   RESTORE DATABASE pdut_staging
--   FROM DISK = N'<path>\pdut_staging_before_restore_YYYYMMDD.bak'
--   WITH REPLACE, RECOVERY;
-- ============================================================================

-- ============================================================================
-- CATATAN KESELAMATAN (jangan di-skip)
-- ============================================================================
-- 1. app_key di man_akses.aplikasi akan ikut ter-copy dari pdut. Kalau staging
--    butuh app_key BERBEDA dari prod, catat dulu sebelum restore lalu UPDATE
--    man_akses.aplikasi SET app_key = ... WHERE id_aplikasi = '...' setelah
--    restore selesai.
--
-- 2. User password di man_akses.pengguna juga ikut ter-copy (hash). Jangan
--    pakai akun staging untuk akses akun produksi karena hash sama.
--
-- 3. JWT secret / encryption key di env container tidak berubah — pastikan
--    secret di staging env TIDAK sama dengan production env (untuk isolation).
--
-- 4. Tabel yang environment-specific (contoh: logger.log_jwt, logger.log_akses_jwt)
--    akan ikut ter-copy juga — silakan TRUNCATE manual kalau mau start fresh.
--      TRUNCATE TABLE logger.log_akses_jwt;
--      DELETE FROM logger.log_jwt;  -- ada FK dari log_akses_jwt
--    (hati-hati: FK cascade)
-- ============================================================================
