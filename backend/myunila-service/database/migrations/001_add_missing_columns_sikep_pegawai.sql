-- Migration: Add missing columns to sikep.pegawai table
-- Date: 2025-12-02
-- Description: Add id_org3 and other potentially missing columns for SIKEP API sync

-- Ensure sikep schema exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sikep')
BEGIN
    EXEC('CREATE SCHEMA sikep');
END
GO

-- Check if table exists, if not create it with all required columns
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai')
BEGIN
    CREATE TABLE sikep.pegawai (
        id_pegawai NVARCHAR(100) NOT NULL PRIMARY KEY,
        nm_pegawai NVARCHAR(255) NOT NULL,
        jk NVARCHAR(20) NULL,
        nip NVARCHAR(50) NULL,
        nidn NVARCHAR(50) NULL,
        tmp_lahir NVARCHAR(100) NULL,
        tgl_lahir NVARCHAR(20) NULL,
        alamat NVARCHAR(500) NULL,
        jns_pegawai NVARCHAR(50) NULL,
        tmt_cpns NVARCHAR(20) NULL,
        tmt_pns NVARCHAR(20) NULL,
        jns_tenaga NVARCHAR(50) NULL,
        id_golongan NVARCHAR(100) NULL,
        tmt_gol NVARCHAR(20) NULL,
        id_fungsional NVARCHAR(100) NULL,
        tmt_fung NVARCHAR(20) NULL,
        id_struktural NVARCHAR(100) NULL,
        id_pendidikan NVARCHAR(100) NULL,
        id_org1 NVARCHAR(100) NULL,
        id_org2 NVARCHAR(100) NULL,
        id_org3 NVARCHAR(100) NULL,
        status NVARCHAR(50) NULL,
        tmt_pensiun NVARCHAR(20) NULL,
        id_creator NVARCHAR(100) NULL,
        create_date DATETIME2 NULL DEFAULT GETDATE(),
        last_sync DATETIME2 NULL
    );
    PRINT 'Created table sikep.pegawai with all columns';
END
ELSE
BEGIN
    -- Add missing columns if table exists

    -- Add id_org3 column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_org3')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_org3 NVARCHAR(100) NULL;
        PRINT 'Added column id_org3 to sikep.pegawai';
    END

    -- Add tmp_lahir column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmp_lahir')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmp_lahir NVARCHAR(100) NULL;
        PRINT 'Added column tmp_lahir to sikep.pegawai';
    END

    -- Add tgl_lahir column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tgl_lahir')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tgl_lahir NVARCHAR(20) NULL;
        PRINT 'Added column tgl_lahir to sikep.pegawai';
    END

    -- Add alamat column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'alamat')
    BEGIN
        ALTER TABLE sikep.pegawai ADD alamat NVARCHAR(500) NULL;
        PRINT 'Added column alamat to sikep.pegawai';
    END

    -- Add tmt_cpns column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmt_cpns')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmt_cpns NVARCHAR(20) NULL;
        PRINT 'Added column tmt_cpns to sikep.pegawai';
    END

    -- Add tmt_pns column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmt_pns')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmt_pns NVARCHAR(20) NULL;
        PRINT 'Added column tmt_pns to sikep.pegawai';
    END

    -- Add id_golongan column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_golongan')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_golongan NVARCHAR(100) NULL;
        PRINT 'Added column id_golongan to sikep.pegawai';
    END

    -- Add tmt_gol column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmt_gol')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmt_gol NVARCHAR(20) NULL;
        PRINT 'Added column tmt_gol to sikep.pegawai';
    END

    -- Add id_fungsional column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_fungsional')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_fungsional NVARCHAR(100) NULL;
        PRINT 'Added column id_fungsional to sikep.pegawai';
    END

    -- Add tmt_fung column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmt_fung')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmt_fung NVARCHAR(20) NULL;
        PRINT 'Added column tmt_fung to sikep.pegawai';
    END

    -- Add id_struktural column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_struktural')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_struktural NVARCHAR(100) NULL;
        PRINT 'Added column id_struktural to sikep.pegawai';
    END

    -- Add id_pendidikan column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_pendidikan')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_pendidikan NVARCHAR(100) NULL;
        PRINT 'Added column id_pendidikan to sikep.pegawai';
    END

    -- Add id_org1 column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_org1')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_org1 NVARCHAR(100) NULL;
        PRINT 'Added column id_org1 to sikep.pegawai';
    END

    -- Add id_org2 column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_org2')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_org2 NVARCHAR(100) NULL;
        PRINT 'Added column id_org2 to sikep.pegawai';
    END

    -- Add tmt_pensiun column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'tmt_pensiun')
    BEGIN
        ALTER TABLE sikep.pegawai ADD tmt_pensiun NVARCHAR(20) NULL;
        PRINT 'Added column tmt_pensiun to sikep.pegawai';
    END

    -- Add id_creator column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'id_creator')
    BEGIN
        ALTER TABLE sikep.pegawai ADD id_creator NVARCHAR(100) NULL;
        PRINT 'Added column id_creator to sikep.pegawai';
    END

    -- Add create_date column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'create_date')
    BEGIN
        ALTER TABLE sikep.pegawai ADD create_date DATETIME2 NULL DEFAULT GETDATE();
        PRINT 'Added column create_date to sikep.pegawai';
    END

    -- Add last_sync column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = 'pegawai' AND COLUMN_NAME = 'last_sync')
    BEGIN
        ALTER TABLE sikep.pegawai ADD last_sync DATETIME2 NULL;
        PRINT 'Added column last_sync to sikep.pegawai';
    END

    PRINT 'Migration completed - checked and added missing columns to sikep.pegawai';
END
GO
