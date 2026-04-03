-- ============================================================
-- monitoring_00_schema.sql
-- Buat schema monitoring untuk Web Monitoring Service
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'monitoring')
BEGIN
    EXEC('CREATE SCHEMA monitoring')
    PRINT 'Schema monitoring created.'
END
ELSE
BEGIN
    PRINT 'Schema monitoring already exists, skipping.'
END
go
