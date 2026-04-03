-- =====================================================
-- ALTER Script: Production Deploy 26 Maret 2026
-- Kolom-kolom baru di man_akses.aplikasi yang belum ada di production
-- Jalankan di SQL Server 119 database pdut
-- =====================================================

-- 1. a_filter_organisasi
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_filter_organisasi'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_filter_organisasi BIT DEFAULT 0;
    PRINT 'Added: a_filter_organisasi';
END
GO

-- 2. icon_name
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_name'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_name VARCHAR(100) NULL;
    PRINT 'Added: icon_name';
END
GO

-- 3. icon_color
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_color'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_color VARCHAR(50) NULL;
    PRINT 'Added: icon_color';
END
GO

-- 4. id_kategori
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'id_kategori'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD id_kategori UNIQUEIDENTIFIER NULL;
    PRINT 'Added: id_kategori';
END
GO

-- 5. app_slug
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'app_slug'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD app_slug VARCHAR(100) NULL;
    PRINT 'Added: app_slug';
END
GO

-- 6. urutan
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'urutan'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD urutan INT NULL;
    PRINT 'Added: urutan';
END
GO

-- 7. a_tampil_portal
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_tampil_portal'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_tampil_portal BIT DEFAULT 1;
    PRINT 'Added: a_tampil_portal';
END
GO

-- 8. a_maintenance
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_maintenance'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_maintenance BIT DEFAULT 0;
    PRINT 'Added: a_maintenance';
END
GO

-- 9. a_coming_soon
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_coming_soon'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_coming_soon BIT DEFAULT 0;
    PRINT 'Added: a_coming_soon';
END
GO

-- 10. a_terintegrasi
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_terintegrasi'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_terintegrasi BIT DEFAULT 0;
    PRINT 'Added: a_terintegrasi';
END
GO

-- 11. a_aktif (mungkin sudah ada, tapi pastikan)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_aktif'
)
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_aktif BIT DEFAULT 1;
    PRINT 'Added: a_aktif';
END
GO

-- Verify
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi'
ORDER BY ORDINAL_POSITION;
GO

PRINT '=== ALTER COMPLETE ==='
GO
