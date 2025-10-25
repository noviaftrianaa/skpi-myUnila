-- Step 3: Create cleanup stored procedure
-- Run after creating table

CREATE OR ALTER PROCEDURE logger.sp_cleanup_old_sync_logs
    @retention_days INT = 90
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cutoff_date DATETIME = DATEADD(DAY, -@retention_days, GETDATE());
    DECLARE @deleted_count INT;

    DELETE FROM logger.sync_logs
    WHERE synced_at < @cutoff_date;

    SET @deleted_count = @@ROWCOUNT;

    PRINT 'Deleted ' + CAST(@deleted_count AS VARCHAR(10)) + ' old sync logs (older than ' + CAST(@retention_days AS VARCHAR(10)) + ' days)';
END;

-- Example: Run cleanup manually
-- EXEC logger.sp_cleanup_old_sync_logs @retention_days = 90;
