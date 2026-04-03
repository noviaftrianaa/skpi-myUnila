-- =============================================
-- Step 1: Create Schema
-- =============================================
USE [pdut_dev];

-- Create schema if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'setting')
BEGIN
    EXEC('CREATE SCHEMA setting');
    PRINT 'Schema setting created';
END
ELSE
BEGIN
    PRINT 'Schema setting already exists';
END