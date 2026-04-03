-- =============================================
-- Fix SISTER API Base URL
-- Remove /1.0 from base_url if present
-- =============================================

USE [pdut_dev];

-- Update SISTER API base_url to remove /1.0 suffix
UPDATE setting.api_configs
SET
    base_url = 'https://sister-api.kemdikbud.go.id/ws.php',
    updated_by = 'SYSTEM',
    updated_at = GETDATE()
WHERE
    api_code = 'SISTER'
    AND base_url LIKE '%/1.0';

PRINT '✅ SISTER API base_url updated (removed /1.0 suffix)';

-- Verification
SELECT api_code, api_name, base_url, updated_at
FROM setting.api_configs
WHERE api_code = 'SISTER';
