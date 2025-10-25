-- Step 1: Create logger schema
-- Run this first

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'logger')
BEGIN
    EXEC('CREATE SCHEMA logger')
END
