-- Migration: Add angkatan column to log_sync_pd_sms table
-- Date: 2025-11-19
-- Description: Adds angkatan column to allow multiple angkatan syncs per month for same prodi

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'logger'
    AND TABLE_NAME = 'log_sync_pd_sms'
    AND COLUMN_NAME = 'angkatan'
)
BEGIN
    -- Add angkatan column (nullable initially to allow existing data)
    ALTER TABLE logger.log_sync_pd_sms
    ADD angkatan VARCHAR(4) NULL;

    PRINT '✅ Added angkatan column to logger.log_sync_pd_sms';

    -- Update existing records with angkatan from semester data if possible
    -- This helps maintain referential integrity for existing logs
    UPDATE logger.log_sync_pd_sms
    SET angkatan = LEFT(id_semester_masuk, 4)
    WHERE angkatan IS NULL
    AND id_semester_masuk IS NOT NULL;

    PRINT '✅ Updated existing records with angkatan from semester data';

    -- Create index for better query performance
    CREATE NONCLUSTERED INDEX IX_log_sync_pd_sms_angkatan
    ON logger.log_sync_pd_sms(angkatan);

    PRINT '✅ Created index on angkatan column';

    -- Create composite index for common query pattern (id_sms + angkatan + tgl_sync)
    CREATE NONCLUSTERED INDEX IX_log_sync_pd_sms_sync_check
    ON logger.log_sync_pd_sms(id_sms, angkatan, tgl_sync, a_selesai)
    INCLUDE (total_mahasiswa, total_berhasil, total_gagal);

    PRINT '✅ Created composite index for sync log queries';
END
ELSE
BEGIN
    PRINT '⚠️  Column angkatan already exists in logger.log_sync_pd_sms';
END
GO

-- Display column information
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'logger'
AND TABLE_NAME = 'log_sync_pd_sms'
ORDER BY ORDINAL_POSITION;
GO
