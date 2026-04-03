-- ============================================================================
-- SCRIPT: Create pdut_staging Database
-- Description: Backup pdut → Restore sebagai pdut_staging
-- Jalankan di SSMS connect ke 192.168.123.119 (database: master)
-- Date: 2026-03-15
--
-- URUTAN EKSEKUSI:
-- 1. Jalankan script ini PERTAMA → buat pdut_staging
-- 2. Jalankan rbac_organisasi_access.sql di pdut_staging → test migration
-- 3. Kalau sukses, jalankan rbac_organisasi_access.sql di pdut (production)
-- ============================================================================

USE master;
GO

-- ============================================================================
-- STEP 1: Cek apakah pdut_staging sudah ada
-- ============================================================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'pdut_staging')
BEGIN
    PRINT 'WARNING: Database pdut_staging sudah ada!';
    PRINT 'Jika ingin recreate, uncomment DROP di bawah, lalu jalankan ulang.';
    -- ALTER DATABASE pdut_staging SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    -- DROP DATABASE pdut_staging;
    -- PRINT 'Database pdut_staging di-drop untuk recreate.';
END
GO

-- ============================================================================
-- STEP 2: Backup pdut ke file
-- Estimasi waktu: 3-5 menit (15.7 GB data, compressed)
-- ============================================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pdut_staging')
BEGIN
    PRINT 'Memulai backup pdut...';
    PRINT 'Estimasi: 3-5 menit untuk 15.7 GB data';
    
    BACKUP DATABASE pdut 
    TO DISK = 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\pdut_for_staging.bak'
    WITH FORMAT, INIT,
         NAME = 'pdut - Backup for Staging',
         COMPRESSION,
         STATS = 10;
    
    PRINT 'Backup selesai!';
END
GO

-- ============================================================================
-- STEP 3: Restore sebagai pdut_staging
-- Estimasi waktu: 5-10 menit
-- ============================================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pdut_staging')
BEGIN
    PRINT 'Memulai restore ke pdut_staging...';
    PRINT 'Estimasi: 5-10 menit';
    
    RESTORE DATABASE pdut_staging
    FROM DISK = 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\pdut_for_staging.bak'
    WITH RECOVERY,
         MOVE 'pdut' TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut_staging.mdf',
         MOVE 'pdut_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut_staging_log.ldf',
         STATS = 10;
    
    PRINT 'Restore selesai!';
END
GO

-- ============================================================================
-- STEP 4: Set recovery model SIMPLE (staging tidak butuh full log)
-- ============================================================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'pdut_staging')
BEGIN
    ALTER DATABASE pdut_staging SET RECOVERY SIMPLE;
    PRINT 'Recovery model set to SIMPLE';
    
    -- Shrink log file (hemat disk)
    USE pdut_staging;
    DBCC SHRINKFILE (pdut_log, 256);  -- Shrink log ke 256 MB
    PRINT 'Log file shrunk';
    USE master;
END
GO

-- ============================================================================
-- STEP 5: Buat user staging (opsional)
-- ============================================================================
-- Uncomment jika ingin user terpisah untuk staging
-- IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'staging_user')
-- BEGIN
--     CREATE LOGIN staging_user WITH PASSWORD = 'StagingPassword@2026!';
--     PRINT 'Login staging_user created';
-- END
-- GO
-- 
-- USE pdut_staging;
-- IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'staging_user')
-- BEGIN
--     CREATE USER staging_user FOR LOGIN staging_user;
--     ALTER ROLE db_datareader ADD MEMBER staging_user;
--     ALTER ROLE db_datawriter ADD MEMBER staging_user;
--     PRINT 'User staging_user created with read/write access';
-- END
-- GO
-- USE master;
-- GO

-- ============================================================================
-- STEP 6: Verifikasi
-- ============================================================================
PRINT '';
PRINT '=== Verifikasi ===';

SELECT name, state_desc, recovery_model_desc, 
       CAST(SUM(size) * 8.0 / 1024 AS DECIMAL(10,1)) as size_mb
FROM sys.databases d
JOIN sys.master_files f ON d.database_id = f.database_id
WHERE name IN ('pdut', 'pdut_staging', 'pdut_dev')
GROUP BY name, state_desc, recovery_model_desc
ORDER BY name;

PRINT '';
PRINT '=== Selesai! ===';
PRINT 'Database pdut_staging siap digunakan.';
PRINT '';
PRINT 'Langkah selanjutnya:';
PRINT '1. Jalankan rbac_organisasi_access.sql di pdut_staging (test)';
PRINT '2. Kalau OK, jalankan rbac_organisasi_access.sql di pdut (production)';
PRINT '3. Update VM5 .env: DB_DATABASE=pdut_staging';
GO
