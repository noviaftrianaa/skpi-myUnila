-- ============================================================================
-- FIX: siakadu.ref_unit — tambah kolom yang missing (patch untuk DB yang
--      sudah terlanjur deploy dari siakadu_schema_v2.0_fresh.sql versi lama)
--
-- Masalah: sync /siakadu/referensi/unit/sync gagal karena kolom
--          id_parent_unit, nm_singkat, id_jenjang, akreditasi, pimpinan_json
--          tidak ada di definisi script fresh sebelumnya.
--
-- Script ini idempotent — aman dijalankan sekali.
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '=== FIX siakadu.ref_unit — add missing columns ==='
GO

-- Rename kolom lama id_induk → id_parent_unit (jika ada)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'id_induk')
    AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'id_parent_unit')
BEGIN
    EXEC sp_rename 'siakadu.ref_unit.id_induk', 'id_parent_unit', 'COLUMN';
    PRINT '  Renamed: id_induk → id_parent_unit';
END
GO

-- Tambah kolom yang missing
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'id_parent_unit')
BEGIN
    ALTER TABLE siakadu.ref_unit ADD id_parent_unit varchar(20) NULL;
    PRINT '  Added: id_parent_unit';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'nm_singkat')
BEGIN
    ALTER TABLE siakadu.ref_unit ADD nm_singkat nvarchar(50) NULL;
    PRINT '  Added: nm_singkat';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'id_jenjang')
BEGIN
    ALTER TABLE siakadu.ref_unit ADD id_jenjang varchar(10) NULL;
    PRINT '  Added: id_jenjang';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'akreditasi')
BEGIN
    ALTER TABLE siakadu.ref_unit ADD akreditasi varchar(5) NULL;
    PRINT '  Added: akreditasi';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND name = 'pimpinan_json')
BEGIN
    ALTER TABLE siakadu.ref_unit ADD pimpinan_json nvarchar(max) NULL;
    PRINT '  Added: pimpinan_json';
END
GO

-- Fix type jns_unit kalau terlanjur dibikin varchar(20) — harusnya varchar(5)
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE object_id = OBJECT_ID('siakadu.ref_unit') AND c.name = 'jns_unit' AND c.max_length > 5)
BEGIN
    ALTER TABLE siakadu.ref_unit ALTER COLUMN jns_unit varchar(5) NULL;
    PRINT '  Fixed: jns_unit varchar(5)';
END
GO

-- Verify
PRINT ''
PRINT '=== siakadu.ref_unit columns ==='
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'siakadu' AND TABLE_NAME = 'ref_unit'
ORDER BY ORDINAL_POSITION;
GO

PRINT ''
PRINT '=== FIX siakadu.mapping_unit — add jenjang + last_update columns ==='
GO

-- mapping_unit: tambah kolom jenjang (akreditasi) + last_update
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_unit') AND name = 'jenjang')
BEGIN
    ALTER TABLE siakadu.mapping_unit ADD jenjang varchar(10) NULL;
    PRINT '  Added: mapping_unit.jenjang';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_unit') AND name = 'last_update')
BEGIN
    ALTER TABLE siakadu.mapping_unit ADD last_update datetime NULL;
    PRINT '  Added: mapping_unit.last_update';
END
GO

-- Verify
PRINT ''
PRINT '=== siakadu.mapping_unit columns ==='
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'siakadu' AND TABLE_NAME = 'mapping_unit'
ORDER BY ORDINAL_POSITION;
GO

PRINT ''
PRINT 'DONE. Sekarang bisa export mapping_unit dari staging → pdut pakai script di bawah.'
PRINT ''
PRINT 'Export manual dari staging (jalankan di SQL Server):'
PRINT '  1. Di pdut_staging: bcp siakadu.mapping_unit out C:\temp\mapping_unit.dat -c -T -S 192.168.123.119'
PRINT '  2. Di pdut (production): bcp siakadu.mapping_unit in C:\temp\mapping_unit.dat -c -T -S 192.168.123.119'
PRINT ''
PRINT 'Atau INSERT SELECT antar-database:'
PRINT '  INSERT INTO pdut.siakadu.mapping_unit (kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update)'
PRINT '  SELECT kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update'
PRINT '  FROM pdut_staging.siakadu.mapping_unit;'
GO
