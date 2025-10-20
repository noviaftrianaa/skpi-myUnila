-- Migration: Add sync tracking columns to ref.lv_agama table
-- Date: 2025-01-20
-- Description: Add last_sync and synced_by columns for Sister API synchronization tracking

-- Check if columns already exist before adding
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('ref.lv_agama')
    AND name = 'last_sync'
)
BEGIN
    ALTER TABLE ref.lv_agama
    ADD last_sync DATETIME NULL;

    PRINT 'Column last_sync added to ref.lv_agama';
END
ELSE
BEGIN
    PRINT 'Column last_sync already exists in ref.lv_agama';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('ref.lv_agama')
    AND name = 'synced_by'
)
BEGIN
    ALTER TABLE ref.lv_agama
    ADD synced_by NVARCHAR(50) NULL;

    PRINT 'Column synced_by added to ref.lv_agama';
END
ELSE
BEGIN
    PRINT 'Column synced_by already exists in ref.lv_agama';
END
GO

-- Create index on last_sync for better query performance
IF NOT EXISTS (
    SELECT * FROM sys.indexes
    WHERE object_id = OBJECT_ID('ref.lv_agama')
    AND name = 'IX_lv_agama_last_sync'
)
BEGIN
    CREATE INDEX IX_lv_agama_last_sync
    ON ref.lv_agama(last_sync);

    PRINT 'Index IX_lv_agama_last_sync created';
END
ELSE
BEGIN
    PRINT 'Index IX_lv_agama_last_sync already exists';
END
GO

PRINT 'Migration completed successfully!';
GO
