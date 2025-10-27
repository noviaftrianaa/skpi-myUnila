-- =============================================
-- Alter Bidang Studi Column Size
-- Purpose: Fix VARCHAR truncation errors for bidang_studi
-- Change: nm_bid_studi VARCHAR(50) -> VARCHAR(250)
-- =============================================

USE pdut_dev;
GO

-- Check if column exists before altering
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'ref'
    AND TABLE_NAME = 'bidang_studi'
    AND COLUMN_NAME = 'nm_bid_studi'
)
BEGIN
    PRINT 'Altering ref.bidang_studi.nm_bid_studi to VARCHAR(250)...'

    ALTER TABLE ref.bidang_studi
    ALTER COLUMN nm_bid_studi VARCHAR(250);

    PRINT '✓ Successfully altered ref.bidang_studi.nm_bid_studi to VARCHAR(250)'
END
ELSE
BEGIN
    PRINT '⚠ Column ref.bidang_studi.nm_bid_studi not found - skipping'
END
GO

-- Verify the change
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ref'
    AND TABLE_NAME = 'bidang_studi'
    AND COLUMN_NAME = 'nm_bid_studi';
GO

PRINT ''
PRINT 'Script completed successfully!'
PRINT 'You can now sync bidang_studi data without truncation errors.'
GO
