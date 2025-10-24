-- Create schema ref if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ref')
BEGIN
    EXEC('CREATE SCHEMA ref')
END
GO

-- Create table ref.agama
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'agama' AND schema_id = SCHEMA_ID('ref'))
BEGIN
    CREATE TABLE ref.agama (
        id_agama INT PRIMARY KEY,
        nm_agama NVARCHAR(100) NOT NULL,
        a_ref_pddikti BIT DEFAULT 0,
        a_ref_unila BIT DEFAULT 0,
        create_date DATETIME DEFAULT GETDATE(),
        last_update DATETIME DEFAULT GETDATE(),
        expired_date DATETIME NULL,
        last_sync DATETIME NULL
    )

    PRINT 'Table ref.agama created successfully'
END
ELSE
BEGIN
    PRINT 'Table ref.agama already exists'
END
GO

-- Check if table was created
SELECT
    SCHEMA_NAME(schema_id) AS schema_name,
    name AS table_name,
    create_date
FROM sys.tables
WHERE name = 'agama' AND schema_id = SCHEMA_ID('ref')
GO
