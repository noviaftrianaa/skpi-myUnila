-- =====================================================
-- SIKEP Golongan Tables Migration Script
-- Date: 2024-12-03
-- Description:
--   1. Rename sikep.golongan to sikep.golongan_pns
--   2. Create new sikep.golongan_pppk table
-- =====================================================

-- =====================================================
-- Step 1: Rename sikep.golongan to sikep.golongan_pns
-- =====================================================
IF EXISTS (SELECT * FROM sys.tables t
           JOIN sys.schemas s ON t.schema_id = s.schema_id
           WHERE s.name = 'sikep' AND t.name = 'golongan')
BEGIN
    EXEC sp_rename 'sikep.golongan', 'golongan_pns';
    PRINT 'Table sikep.golongan renamed to sikep.golongan_pns';
END
ELSE
BEGIN
    PRINT 'Table sikep.golongan does not exist, skipping rename';
END
GO

-- =====================================================
-- Step 2: Create sikep.golongan_pppk table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables t
               JOIN sys.schemas s ON t.schema_id = s.schema_id
               WHERE s.name = 'sikep' AND t.name = 'golongan_pppk')
BEGIN
    CREATE TABLE sikep.golongan_pppk (
        id              NVARCHAR(50)    NOT NULL,
        golongan        NVARCHAR(100)   NOT NULL,
        pangkat         NVARCHAR(200)   NOT NULL,
        id_creator      NVARCHAR(50)    NULL,
        create_date     DATETIME        NULL DEFAULT GETDATE(),
        last_sync       DATETIME        NULL,
        soft_delete     DATETIME        NULL,
        CONSTRAINT PK_sikep_golongan_pppk PRIMARY KEY CLUSTERED (id)
    );

    PRINT 'Table sikep.golongan_pppk created successfully';
END
ELSE
BEGIN
    PRINT 'Table sikep.golongan_pppk already exists, skipping creation';
END
GO

-- =====================================================
-- Step 3: Add indexes for better query performance
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_golongan_pppk_golongan'
               AND object_id = OBJECT_ID('sikep.golongan_pppk'))
BEGIN
    CREATE INDEX IX_sikep_golongan_pppk_golongan ON sikep.golongan_pppk(golongan);
    PRINT 'Index IX_sikep_golongan_pppk_golongan created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sikep_golongan_pppk_soft_delete'
               AND object_id = OBJECT_ID('sikep.golongan_pppk'))
BEGIN
    CREATE INDEX IX_sikep_golongan_pppk_soft_delete ON sikep.golongan_pppk(soft_delete)
    WHERE soft_delete IS NULL;
    PRINT 'Index IX_sikep_golongan_pppk_soft_delete created';
END
GO

PRINT 'Migration completed successfully';
GO
