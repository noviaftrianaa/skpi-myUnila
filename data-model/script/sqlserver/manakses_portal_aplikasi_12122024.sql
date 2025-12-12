-- =============================================
-- Script: Portal Aplikasi - CREATE & ALTER Tables
-- Schema: man_akses
-- Date: 12 December 2024
-- Description:
--   1. Create kategori_aplikasi table
--   2. Add portal columns to aplikasi table
--   3. Add status columns to aplikasi table
-- =============================================

USE [my_unila]; -- Adjust database name as needed
GO

-- =============================================
-- PART 1: CREATE kategori_aplikasi TABLE
-- =============================================

-- Check if table exists, if not create it
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'kategori_aplikasi'
)
BEGIN
    CREATE TABLE man_akses.kategori_aplikasi (
        id_kategori UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        nm_kategori VARCHAR(100) NOT NULL,
        icon_kategori VARCHAR(100) NULL,
        icon_color VARCHAR(50) NULL,
        urutan INT DEFAULT 0,
        a_aktif BIT DEFAULT 1,
        tgl_create DATETIME DEFAULT GETDATE(),
        last_update DATETIME DEFAULT GETDATE(),
        soft_delete BIT DEFAULT 0
    );

    PRINT 'Table man_akses.kategori_aplikasi created successfully';
END
ELSE
BEGIN
    PRINT 'Table man_akses.kategori_aplikasi already exists';
END
GO

-- =============================================
-- PART 2: ADD PORTAL COLUMNS TO aplikasi TABLE
-- =============================================

-- Add icon_name column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_name'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_name VARCHAR(100) NULL;
    PRINT 'Column icon_name added to man_akses.aplikasi';
END
GO

-- Add icon_color column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_color'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_color VARCHAR(50) NULL;
    PRINT 'Column icon_color added to man_akses.aplikasi';
END
GO

-- Add id_kategori column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'id_kategori'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD id_kategori UNIQUEIDENTIFIER NULL;
    PRINT 'Column id_kategori added to man_akses.aplikasi';
END
GO

-- Add app_slug column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'app_slug'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD app_slug VARCHAR(100) NULL;
    PRINT 'Column app_slug added to man_akses.aplikasi';
END
GO

-- Add urutan column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'urutan'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD urutan INT DEFAULT 0;
    PRINT 'Column urutan added to man_akses.aplikasi';
END
GO

-- Add a_tampil_portal column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_tampil_portal'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_tampil_portal BIT DEFAULT 1;
    PRINT 'Column a_tampil_portal added to man_akses.aplikasi';
END
GO

-- =============================================
-- PART 3: ADD STATUS COLUMNS TO aplikasi TABLE
-- =============================================

-- Add a_maintenance column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_maintenance'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_maintenance BIT DEFAULT 0;
    PRINT 'Column a_maintenance added to man_akses.aplikasi';
END
GO

-- Add a_coming_soon column
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_coming_soon'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_coming_soon BIT DEFAULT 0;
    PRINT 'Column a_coming_soon added to man_akses.aplikasi';
END
GO

-- Add a_terintegrasi column (integrated with portal SSO)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_terintegrasi'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_terintegrasi BIT DEFAULT 0;
    PRINT 'Column a_terintegrasi added to man_akses.aplikasi';
END
GO

-- =============================================
-- PART 4: CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================

-- Index for id_kategori
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_kategori' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_kategori ON man_akses.aplikasi(id_kategori);
    PRINT 'Index IX_aplikasi_kategori created';
END
GO

-- Index for a_tampil_portal
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_tampil_portal' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_tampil_portal ON man_akses.aplikasi(a_tampil_portal);
    PRINT 'Index IX_aplikasi_tampil_portal created';
END
GO

-- Index for app_slug
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_app_slug' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_app_slug ON man_akses.aplikasi(app_slug);
    PRINT 'Index IX_aplikasi_app_slug created';
END
GO

-- Index for a_maintenance
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_maintenance' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_maintenance ON man_akses.aplikasi(a_maintenance);
    PRINT 'Index IX_aplikasi_maintenance created';
END
GO

-- Index for a_coming_soon
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_coming_soon' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_coming_soon ON man_akses.aplikasi(a_coming_soon);
    PRINT 'Index IX_aplikasi_coming_soon created';
END
GO

-- Index for a_terintegrasi
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_aplikasi_terintegrasi' AND object_id = OBJECT_ID('man_akses.aplikasi')
)
BEGIN
    CREATE INDEX IX_aplikasi_terintegrasi ON man_akses.aplikasi(a_terintegrasi);
    PRINT 'Index IX_aplikasi_terintegrasi created';
END
GO

-- =============================================
-- VERIFICATION: Check new columns
-- =============================================

PRINT '';
PRINT '=== VERIFICATION ===';
PRINT '';

-- Check kategori_aplikasi table
SELECT 'kategori_aplikasi columns:' AS info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'kategori_aplikasi'
ORDER BY ORDINAL_POSITION;

-- Check new columns in aplikasi table
SELECT 'New aplikasi columns:' AS info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'man_akses'
  AND TABLE_NAME = 'aplikasi'
  AND COLUMN_NAME IN ('icon_name', 'icon_color', 'id_kategori', 'app_slug', 'urutan',
                       'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi')
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '=== SCRIPT COMPLETED ===';
PRINT 'Next step: Run PortalAplikasiSeeder in Laravel';
PRINT 'Command: php artisan db:seed --class=PortalAplikasiSeeder';
GO
