-- ============================================================================
-- MIGRATION: Portal Aplikasi Schema
-- Description: Add kategori_aplikasi table and extend aplikasi table for portal
-- Date: 2025-12-11
-- ============================================================================

-- ============================================================================
-- STEP 1: Create kategori_aplikasi table
-- ============================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'kategori_aplikasi')
BEGIN
    CREATE TABLE man_akses.kategori_aplikasi (
        id_kategori UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        nm_kategori VARCHAR(100) NOT NULL,
        icon_kategori VARCHAR(100) NULL,        -- Icon name: 'FiBook', 'BsGlobe'
        icon_color VARCHAR(50) NULL,            -- Tailwind class: 'bg-blue-500'
        urutan INT DEFAULT 0,                   -- Sort order
        a_aktif BIT DEFAULT 1,                  -- Is active
        tgl_create DATETIME DEFAULT GETDATE(),
        last_update DATETIME DEFAULT GETDATE(),
        soft_delete BIT DEFAULT 0
    );
    PRINT 'Table kategori_aplikasi created successfully';
END
ELSE
BEGIN
    PRINT 'Table kategori_aplikasi already exists';
END
GO

-- ============================================================================
-- STEP 2: Add new columns to aplikasi table
-- ============================================================================

-- Add icon_name column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_name')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_name VARCHAR(100) NULL;
    PRINT 'Column icon_name added to aplikasi';
END
GO

-- Add icon_color column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'icon_color')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD icon_color VARCHAR(50) NULL;
    PRINT 'Column icon_color added to aplikasi';
END
GO

-- Add id_kategori column (FK to kategori_aplikasi)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'id_kategori')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD id_kategori UNIQUEIDENTIFIER NULL;
    PRINT 'Column id_kategori added to aplikasi';
END
GO

-- Add urutan column (sort order within category)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'urutan')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD urutan INT DEFAULT 0;
    PRINT 'Column urutan added to aplikasi';
END
GO

-- Add a_tampil_portal column (show in portal)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_tampil_portal')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_tampil_portal BIT DEFAULT 1;
    PRINT 'Column a_tampil_portal added to aplikasi';
END
GO

-- Add app_slug column (URL-friendly identifier)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'app_slug')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD app_slug VARCHAR(100) NULL;
    PRINT 'Column app_slug added to aplikasi';
END
GO

-- ============================================================================
-- STEP 3: Add Foreign Key (optional - uncomment if needed)
-- ============================================================================
-- ALTER TABLE man_akses.aplikasi
-- ADD CONSTRAINT FK_aplikasi_kategori
-- FOREIGN KEY (id_kategori) REFERENCES man_akses.kategori_aplikasi(id_kategori);

-- ============================================================================
-- STEP 4: Create Index for better performance
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_aplikasi_kategori' AND object_id = OBJECT_ID('man_akses.aplikasi'))
BEGIN
    CREATE INDEX IX_aplikasi_kategori ON man_akses.aplikasi(id_kategori);
    PRINT 'Index IX_aplikasi_kategori created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_aplikasi_tampil_portal' AND object_id = OBJECT_ID('man_akses.aplikasi'))
BEGIN
    CREATE INDEX IX_aplikasi_tampil_portal ON man_akses.aplikasi(a_tampil_portal);
    PRINT 'Index IX_aplikasi_tampil_portal created';
END
GO

-- ============================================================================
-- STEP 5: Add a_aktif column to aplikasi table
-- ============================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_aktif')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_aktif BIT DEFAULT 1;
    PRINT 'Column a_aktif added to aplikasi';
END
GO

-- Update existing records to be active (1)
UPDATE man_akses.aplikasi SET a_aktif = 1 WHERE a_aktif IS NULL;
PRINT 'Existing records updated with a_aktif = 1';
GO

PRINT '=== Migration completed successfully ===';
