-- =============================================
-- SISTER Service Database Migration
-- Version: 001
-- Description: Create ref schema and lv_agama table
-- Date: 2025-01-23
-- =============================================

USE pddikti;
GO

-- Create ref schema if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ref')
BEGIN
    EXEC('CREATE SCHEMA ref');
    PRINT 'Schema [ref] created successfully.';
END
ELSE
BEGIN
    PRINT 'Schema [ref] already exists.';
END
GO

-- Create lv_agama table if not exists
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[ref].[lv_agama]') AND type in (N'U'))
BEGIN
    CREATE TABLE [ref].[lv_agama] (
        [id_agama] INT PRIMARY KEY NOT NULL,
        [nama_agama] NVARCHAR(50) NOT NULL,
        [expired_date] DATETIME NULL,
        [last_sync] DATETIME NULL,
        [synced_by] NVARCHAR(50) NULL,
        CONSTRAINT UQ_agama_nama UNIQUE ([nama_agama])
    );

    PRINT 'Table [ref].[lv_agama] created successfully.';

    -- Create indexes for better query performance
    CREATE INDEX IX_agama_last_sync ON [ref].[lv_agama] ([last_sync] DESC);
    CREATE INDEX IX_agama_synced_by ON [ref].[lv_agama] ([synced_by]);

    PRINT 'Indexes created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [ref].[lv_agama] already exists.';
END
GO

-- Create audit table for tracking sync history (optional but recommended)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[ref].[sync_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE [ref].[sync_history] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [entity_name] NVARCHAR(100) NOT NULL,
        [sync_date] DATETIME NOT NULL DEFAULT GETDATE(),
        [synced_by] NVARCHAR(50) NOT NULL,
        [total_records] INT NOT NULL,
        [status] NVARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
        [error_message] NVARCHAR(MAX) NULL,
        [duration_ms] INT NULL
    );

    PRINT 'Table [ref].[sync_history] created successfully.';

    -- Create indexes
    CREATE INDEX IX_sync_history_date ON [ref].[sync_history] ([sync_date] DESC);
    CREATE INDEX IX_sync_history_entity ON [ref].[sync_history] ([entity_name]);

    PRINT 'Sync history indexes created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [ref].[sync_history] already exists.';
END
GO

-- Verify tables
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName,
    create_date AS CreatedDate,
    modify_date AS ModifiedDate
FROM sys.tables
WHERE schema_id = SCHEMA_ID('ref')
ORDER BY name;
GO

PRINT '============================================='
PRINT 'Migration 001 completed successfully!'
PRINT 'Schema: ref'
PRINT 'Tables: lv_agama, sync_history'
PRINT '============================================='
GO
