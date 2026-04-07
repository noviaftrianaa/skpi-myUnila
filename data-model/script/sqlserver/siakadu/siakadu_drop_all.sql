-- ============================================================
-- DROP ALL SIAKADU Schema Objects
-- Database: SQL Server 2019
-- WARNING: Menghapus SEMUA tabel, index, FK di schema siakadu!
-- Jalankan di pdut_dev untuk testing, JANGAN di production!
-- ============================================================

-- Drop FK constraints dulu (harus sebelum drop table)
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) 
    + ' DROP CONSTRAINT ' + QUOTENAME(f.name) + ';' + CHAR(13)
FROM sys.foreign_keys f
INNER JOIN sys.tables t ON f.parent_object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu';

IF @sql <> ''
BEGIN
    PRINT '-- Dropping FK constraints...'
    EXEC sp_executesql @sql;
    PRINT '-- FK constraints dropped'
END
GO

-- Drop semua tabel di schema siakadu
DECLARE @sql2 NVARCHAR(MAX) = N'';

SELECT @sql2 += 'DROP TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ';' + CHAR(13)
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'siakadu';

IF @sql2 <> ''
BEGIN
    PRINT '-- Dropping tables...'
    EXEC sp_executesql @sql2;
    PRINT '-- Tables dropped'
END
GO

-- Drop schema
IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'siakadu')
BEGIN
    DROP SCHEMA siakadu;
    PRINT '-- Schema siakadu dropped'
END
GO

PRINT '-- ============================================================'
PRINT '-- SIAKADU schema completely removed'
PRINT '-- ============================================================'
GO
