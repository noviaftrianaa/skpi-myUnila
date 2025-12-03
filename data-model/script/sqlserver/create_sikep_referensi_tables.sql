-- =====================================================
-- SIKEP Referensi Tables Creation Script
-- Date: 2024-12-03
-- Description:
--   Create tables for SIKEP referensi data if not exist:
--   1. sikep.organisasi
--   2. sikep.fungsional
--   3. sikep.struktural
--   4. sikep.pendidikan (if not exists)
-- =====================================================

-- =====================================================
-- Step 1: Create sikep.organisasi table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables t
               JOIN sys.schemas s ON t.schema_id = s.schema_id
               WHERE s.name = 'sikep' AND t.name = 'organisasi')
BEGIN
    CREATE TABLE sikep.organisasi (
        id_unit_orga        NVARCHAR(50)    NOT NULL,
        id_unit_orga_induk  NVARCHAR(50)    NULL,
        kd_unit_orga        NVARCHAR(50)    NULL,
        nm_unit_orga        NVARCHAR(255)   NOT NULL,
        alamat              NVARCHAR(500)   NULL,
        no_tlp              NVARCHAR(50)    NULL,
        no_fax              NVARCHAR(50)    NULL,
        kd_pos              NVARCHAR(10)    NULL,
        nm_singkat          NVARCHAR(50)    NULL,
        nm_inisial          NVARCHAR(20)    NULL,
        create_date         DATETIME        NULL DEFAULT GETDATE(),
        last_sync           DATETIME        NULL,
        CONSTRAINT PK_sikep_organisasi PRIMARY KEY CLUSTERED (id_unit_orga)
    );

    PRINT 'Table sikep.organisasi created successfully';
END
ELSE
BEGIN
    PRINT 'Table sikep.organisasi already exists, skipping creation';
END
GO

-- Add index for parent-child relationship
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_organisasi_induk'
               AND object_id = OBJECT_ID('sikep.organisasi'))
BEGIN
    CREATE INDEX IX_sikep_organisasi_induk ON sikep.organisasi(id_unit_orga_induk);
    PRINT 'Index IX_sikep_organisasi_induk created';
END
GO

-- =====================================================
-- Step 2: Create sikep.fungsional table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables t
               JOIN sys.schemas s ON t.schema_id = s.schema_id
               WHERE s.name = 'sikep' AND t.name = 'fungsional')
BEGIN
    CREATE TABLE sikep.fungsional (
        id_jabfung      NVARCHAR(50)    NOT NULL,
        nm_jabfung      NVARCHAR(255)   NOT NULL,
        kum             NVARCHAR(50)    NULL,
        ispak           NVARCHAR(10)    NULL,
        id_gol          NVARCHAR(50)    NULL,
        tipe            NVARCHAR(50)    NULL,
        grade           NVARCHAR(50)    NULL,
        create_date     DATETIME        NULL DEFAULT GETDATE(),
        last_sync       DATETIME        NULL,
        CONSTRAINT PK_sikep_fungsional PRIMARY KEY CLUSTERED (id_jabfung)
    );

    PRINT 'Table sikep.fungsional created successfully';
END
ELSE
BEGIN
    PRINT 'Table sikep.fungsional already exists, skipping creation';
END
GO

-- Add index for fungsional name
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_fungsional_nama'
               AND object_id = OBJECT_ID('sikep.fungsional'))
BEGIN
    CREATE INDEX IX_sikep_fungsional_nama ON sikep.fungsional(nm_jabfung);
    PRINT 'Index IX_sikep_fungsional_nama created';
END
GO

-- =====================================================
-- Step 3: Create sikep.struktural table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables t
               JOIN sys.schemas s ON t.schema_id = s.schema_id
               WHERE s.name = 'sikep' AND t.name = 'struktural')
BEGIN
    CREATE TABLE sikep.struktural (
        id_jabstruk     NVARCHAR(50)    NOT NULL,
        kd_jabstruk     NVARCHAR(50)    NULL,
        nm_jabstruk     NVARCHAR(255)   NOT NULL,
        create_date     DATETIME        NULL DEFAULT GETDATE(),
        last_sync       DATETIME        NULL,
        CONSTRAINT PK_sikep_struktural PRIMARY KEY CLUSTERED (id_jabstruk)
    );

    PRINT 'Table sikep.struktural created successfully';
END
ELSE
BEGIN
    PRINT 'Table sikep.struktural already exists, skipping creation';
END
GO

-- Add index for struktural name
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_struktural_nama'
               AND object_id = OBJECT_ID('sikep.struktural'))
BEGIN
    CREATE INDEX IX_sikep_struktural_nama ON sikep.struktural(nm_jabstruk);
    PRINT 'Index IX_sikep_struktural_nama created';
END
GO

-- =====================================================
-- Step 4: Create sikep.pendidikan table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables t
               JOIN sys.schemas s ON t.schema_id = s.schema_id
               WHERE s.name = 'sikep' AND t.name = 'pendidikan')
BEGIN
    CREATE TABLE sikep.pendidikan (
        id_pend         NVARCHAR(50)    NOT NULL,
        nm_pend         NVARCHAR(255)   NOT NULL,
        create_date     DATETIME        NULL DEFAULT GETDATE(),
        last_sync       DATETIME        NULL,
        CONSTRAINT PK_sikep_pendidikan PRIMARY KEY CLUSTERED (id_pend)
    );

    PRINT 'Table sikep.pendidikan created successfully';
END
ELSE
BEGIN
    PRINT 'Table sikep.pendidikan already exists, skipping creation';
END
GO

-- Add index for pendidikan name
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_pendidikan_nama'
               AND object_id = OBJECT_ID('sikep.pendidikan'))
BEGIN
    CREATE INDEX IX_sikep_pendidikan_nama ON sikep.pendidikan(nm_pend);
    PRINT 'Index IX_sikep_pendidikan_nama created';
END
GO

PRINT 'SIKEP Referensi tables creation completed successfully';
GO
