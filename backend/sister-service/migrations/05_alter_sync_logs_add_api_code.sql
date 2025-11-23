-- Step 5: Add api_code column to sync_logs table
-- This column will store the API source identifier (SISTER, FEEDER)
-- to differentiate logs from different services

-- Add the column
ALTER TABLE logger.sync_logs
ADD api_code VARCHAR(50) NULL;

-- Add index for filtering by api_code
CREATE INDEX idx_api_code ON logger.sync_logs(api_code);

-- Update existing records to set default value (SISTER for sister-service logs)
UPDATE logger.sync_logs
SET api_code = 'SISTER'
WHERE api_code IS NULL;

-- Make it NOT NULL after setting default values
ALTER TABLE logger.sync_logs
ALTER COLUMN api_code VARCHAR(50) NOT NULL;

-- Add default constraint for future inserts
ALTER TABLE logger.sync_logs
ADD CONSTRAINT df_sync_logs_api_code DEFAULT 'SISTER' FOR api_code;
