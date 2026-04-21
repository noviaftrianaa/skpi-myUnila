-- ============================================================================
-- DROP ALL SIAKADU Schema Objects
-- Database: SQL Server 2019
-- Generated: 2026-04-21
--
-- Menghapus SEMUA isi schema siakadu:
--   1. Views (v_peserta_didik, v_reg_pd, dll)
--   2. Foreign Key constraints
--   3. Tables (semua)
--   4. Schema siakadu (opsional — diaktifkan dengan DROP_SCHEMA flag)
--
-- Output: Schema siakadu kosong, siap untuk re-deploy pakai
--         siakadu_schema_v2.0_fresh.sql
--
-- ⚠️ PERINGATAN KERAS:
--    - Data akan HILANG permanen. BACKUP DULU kalau ragu.
--    - JANGAN jalankan di PRODUCTION tanpa persetujuan tertulis.
--    - Aman untuk dev/staging.
--
-- Cara pakai:
--    sqlcmd -S 192.168.123.119 -d pdut_dev -i siakadu_drop_all.sql
-- atau via SSMS — Execute.
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '=== DROP ALL SIAKADU — START ==='
GO

-- ============================================================================
-- STEP 1: Drop views
-- ============================================================================
DECLARE @dropViews NVARCHAR(MAX) = N'';
SELECT @dropViews += 'DROP VIEW ' + QUOTENAME(s.name) + '.' + QUOTENAME(v.name) + ';' + CHAR(13)
FROM sys.views v
INNER JOIN sys.schemas s ON v.schema_id = s.schema_id
WHERE s.name = 'siakadu';

IF @dropViews <> ''
BEGIN
    PRINT 'STEP 1: Dropping views...';
    EXEC sp_executesql @dropViews;
END
ELSE
    PRINT 'STEP 1: No views to drop';
GO

-- ============================================================================
-- STEP 2: Drop Foreign Key constraints (harus dulu sebelum tabel)
-- ============================================================================
DECLARE @dropFKs NVARCHAR(MAX) = N'';
SELECT @dropFKs += 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name)
    + ' DROP CONSTRAINT ' + QUOTENAME(f.name) + ';' + CHAR(13)
FROM sys.foreign_keys f
INNER JOIN sys.tables t  ON f.parent_object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu';

IF @dropFKs <> ''
BEGIN
    PRINT 'STEP 2: Dropping FK constraints...';
    EXEC sp_executesql @dropFKs;
END
ELSE
    PRINT 'STEP 2: No FK to drop';
GO

-- ============================================================================
-- STEP 3: Drop semua tabel di schema siakadu
-- ============================================================================
DECLARE @dropTables NVARCHAR(MAX) = N'';
SELECT @dropTables += 'DROP TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ';' + CHAR(13)
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu';

IF @dropTables <> ''
BEGIN
    PRINT 'STEP 3: Dropping tables...';
    EXEC sp_executesql @dropTables;
END
ELSE
    PRINT 'STEP 3: No tables to drop';
GO

-- ============================================================================
-- STEP 4: Drop schema siakadu (OPSIONAL — aktifkan @DROP_SCHEMA = 1)
-- Default: schema dipertahankan agar bisa langsung re-deploy tanpa perlu
-- CREATE SCHEMA lagi. Kalau mau bersih 100% sampai schema, set ke 1.
-- ============================================================================
DECLARE @DROP_SCHEMA BIT = 0;  -- 1 = drop schema juga

IF @DROP_SCHEMA = 1
BEGIN
    IF EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'siakadu')
    BEGIN
        EXEC('DROP SCHEMA siakadu');
        PRINT 'STEP 4: Schema siakadu dropped';
    END
END
ELSE
    PRINT 'STEP 4: Schema siakadu dipertahankan (DROP_SCHEMA = 0)'
GO

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT ''
PRINT '=== DROP ALL SIAKADU — COMPLETE ==='
PRINT ''

-- Verify: pastikan tidak ada tabel/view tersisa
SELECT
    'tables' AS object_type,
    COUNT(*) AS sisa
FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu'
UNION ALL
SELECT 'views', COUNT(*)
FROM sys.views v JOIN sys.schemas s ON v.schema_id = s.schema_id
WHERE s.name = 'siakadu'
UNION ALL
SELECT 'foreign_keys', COUNT(*)
FROM sys.foreign_keys f
JOIN sys.tables t ON f.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu';

PRINT ''
PRINT 'Next step: jalankan siakadu_schema_v2.0_fresh.sql untuk re-deploy.'
GO
