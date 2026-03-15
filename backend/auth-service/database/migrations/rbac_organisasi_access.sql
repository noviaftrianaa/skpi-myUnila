-- ============================================================================
-- MIGRATION: RBAC Organisasi-based Access Control
-- Description: Add organisasi-based app access filtering
--              - Flag a_filter_organisasi di aplikasi
--              - Flag a_universal di peran
--              - Tabel aplikasi_organisasi (whitelist org per app)
-- Date: 2026-03-15
-- ============================================================================

-- ============================================================================
-- STEP 1: Add a_filter_organisasi to aplikasi table
-- Flag untuk menentukan apakah app butuh filter organisasi
-- 0 = semua organisasi bisa akses (behavior lama, default)
-- 1 = hanya organisasi yang di-whitelist di aplikasi_organisasi
-- ============================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi' AND COLUMN_NAME = 'a_filter_organisasi')
BEGIN
    ALTER TABLE man_akses.aplikasi ADD a_filter_organisasi BIT DEFAULT 0;
    PRINT 'Column a_filter_organisasi added to aplikasi';
END
GO

-- Set default value for existing records
UPDATE man_akses.aplikasi SET a_filter_organisasi = 0 WHERE a_filter_organisasi IS NULL;
PRINT 'Existing aplikasi records set to a_filter_organisasi = 0 (no filter)';
GO

-- ============================================================================
-- STEP 2: Add a_universal to peran table
-- Flag untuk role yang bypass organisasi filter
-- 1 = role bypass org filter (Mahasiswa, Dosen, Tendik, Rektor, dll)
-- 0 = role harus match organisasi whitelist
-- ============================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'peran' AND COLUMN_NAME = 'a_universal')
BEGIN
    ALTER TABLE man_akses.peran ADD a_universal BIT DEFAULT 0;
    PRINT 'Column a_universal added to peran';
END
GO

-- Set default: semua role non-universal dulu
UPDATE man_akses.peran SET a_universal = 0 WHERE a_universal IS NULL;
GO

-- Set universal roles (bypass org filter)
UPDATE man_akses.peran SET a_universal = 1 WHERE id_peran IN (
    1,      -- Administrator
    33,     -- LP3M UNILA
    34,     -- Wakil Rektor 4
    35,     -- Wakil Rektor 3
    36,     -- Wakil Rektor 2
    37,     -- Wakil Rektor 1
    38,     -- Rektor
    39,     -- Mahasiswa
    40,     -- Guest
    45,     -- LP2M UNILA
    46,     -- Dosen
    111,    -- Tenaga Kependidikan
    2009,   -- Super Admin
    2018    -- Pimpinan PT
);
PRINT 'Universal roles set (Administrator, Rektor, WR1-4, LP3M, LP2M, Mahasiswa, Dosen, Tendik, dll)';
GO

-- ============================================================================
-- STEP 3: Create aplikasi_organisasi table (whitelist)
-- Menentukan organisasi mana yang bisa akses aplikasi tertentu
-- Hanya berlaku jika aplikasi.a_filter_organisasi = 1
-- ============================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi_organisasi')
BEGIN
    CREATE TABLE man_akses.aplikasi_organisasi (
        id_app_org          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        id_aplikasi         UNIQUEIDENTIFIER NOT NULL,
        id_organisasi       UNIQUEIDENTIFIER NOT NULL,
        a_include_children  BIT DEFAULT 1,              -- Include sub-organisasi
        ket                 VARCHAR(255) NULL,           -- Keterangan
        tgl_create          DATETIME DEFAULT GETDATE(),
        last_update         DATETIME DEFAULT GETDATE(),
        soft_delete         NUMERIC DEFAULT 0,
        last_sync           DATETIME DEFAULT GETDATE(),
        id_updater          UNIQUEIDENTIFIER DEFAULT '00000000-0000-0000-0000-000000000000',
        CONSTRAINT FK_app_org_aplikasi FOREIGN KEY (id_aplikasi) 
            REFERENCES man_akses.aplikasi(id_aplikasi),
        CONSTRAINT FK_app_org_organisasi FOREIGN KEY (id_organisasi) 
            REFERENCES man_akses.unit_organisasi(id_organisasi),
        CONSTRAINT UQ_app_org UNIQUE (id_aplikasi, id_organisasi)
    );
    PRINT 'Table aplikasi_organisasi created successfully';
END
ELSE
BEGIN
    PRINT 'Table aplikasi_organisasi already exists';
END
GO

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_aplikasi_filter_org' AND object_id = OBJECT_ID('man_akses.aplikasi'))
BEGIN
    CREATE INDEX IX_aplikasi_filter_org ON man_akses.aplikasi(a_filter_organisasi);
    PRINT 'Index IX_aplikasi_filter_org created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_peran_universal' AND object_id = OBJECT_ID('man_akses.peran'))
BEGIN
    CREATE INDEX IX_peran_universal ON man_akses.peran(a_universal);
    PRINT 'Index IX_peran_universal created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_app_org_aplikasi' AND object_id = OBJECT_ID('man_akses.aplikasi_organisasi'))
BEGIN
    CREATE INDEX IX_app_org_aplikasi ON man_akses.aplikasi_organisasi(id_aplikasi) WHERE soft_delete = 0;
    PRINT 'Index IX_app_org_aplikasi created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_app_org_organisasi' AND object_id = OBJECT_ID('man_akses.aplikasi_organisasi'))
BEGIN
    CREATE INDEX IX_app_org_organisasi ON man_akses.aplikasi_organisasi(id_organisasi) WHERE soft_delete = 0;
    PRINT 'Index IX_app_org_organisasi created';
END
GO

-- ============================================================================
-- STEP 5: Seed initial data — contoh apps yang perlu filter organisasi
-- Uncomment dan sesuaikan saat implementasi
-- ============================================================================

-- Contoh: Monitoring hanya untuk UPT TIK
-- UPDATE man_akses.aplikasi SET a_filter_organisasi = 1 WHERE app_slug = 'monitoring';
-- INSERT INTO man_akses.aplikasi_organisasi (id_aplikasi, id_organisasi, ket)
-- SELECT id_aplikasi, 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC', 'UPT TIK — Owner'
-- FROM man_akses.aplikasi WHERE app_slug = 'monitoring';

-- Contoh: MyUnila Integrator hanya untuk UPT TIK
-- UPDATE man_akses.aplikasi SET a_filter_organisasi = 1 WHERE app_slug = 'myunila-integrator';
-- INSERT INTO man_akses.aplikasi_organisasi (id_aplikasi, id_organisasi, ket)
-- SELECT id_aplikasi, 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC', 'UPT TIK — Owner'
-- FROM man_akses.aplikasi WHERE app_slug = 'myunila-integrator';

-- ============================================================================
-- STEP 6: Verification queries
-- ============================================================================
PRINT '';
PRINT '=== Verification ===';

-- Check new columns
SELECT 'aplikasi.a_filter_organisasi' AS [check], 
       COUNT(*) AS total,
       SUM(CASE WHEN a_filter_organisasi = 0 THEN 1 ELSE 0 END) AS no_filter,
       SUM(CASE WHEN a_filter_organisasi = 1 THEN 1 ELSE 0 END) AS with_filter
FROM man_akses.aplikasi;

SELECT 'peran.a_universal' AS [check],
       COUNT(*) AS total,
       SUM(CASE WHEN a_universal = 1 THEN 1 ELSE 0 END) AS universal,
       SUM(CASE WHEN a_universal = 0 THEN 1 ELSE 0 END) AS restricted
FROM man_akses.peran WHERE expired_date IS NULL;

SELECT 'aplikasi_organisasi' AS [check], COUNT(*) AS total 
FROM man_akses.aplikasi_organisasi WHERE soft_delete = 0;

PRINT '';
PRINT '=== Universal Roles ===';
SELECT id_peran, nm_peran FROM man_akses.peran WHERE a_universal = 1 AND expired_date IS NULL ORDER BY id_peran;

PRINT '';
PRINT '=== Migration completed successfully ===';
GO
