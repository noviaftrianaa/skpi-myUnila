-- =============================================
-- API Configuration Management - Example Queries
-- =============================================

USE [pddikti];
GO

-- =============================================
-- 1. GET Active API Configs (Safe View - No Credentials)
-- =============================================
-- Untuk menampilkan di UI
SELECT * FROM setting.vw_active_api_configs
ORDER BY api_code;
GO

-- =============================================
-- 2. GET Specific API Config (dengan credentials)
-- =============================================
-- Hanya untuk backend internal use
EXEC setting.sp_get_api_config @api_code = 'SISTER';
GO

-- =============================================
-- 3. INSERT New API Config (Example: Custom API)
-- =============================================
-- Example: Menambahkan API Siakadu
INSERT INTO setting.api_configs (
    api_code,
    api_name,
    api_description,
    base_url,
    auth_type,
    encrypted_credentials,
    additional_headers,
    timeout_seconds,
    max_retries,
    is_active,
    is_encrypted,
    use_env_fallback,
    created_by,
    tags,
    notes
)
VALUES (
    'SIAKADU',
    'Siakadu Internal API',
    'API internal untuk integrasi dengan Siakadu',
    'https://siakadu.unila.ac.id/api/v1',
    'bearer',
    NULL, -- Will be encrypted by application
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    30,
    3,
    1,
    0,
    0, -- No env fallback
    'admin@unila.ac.id',
    'internal,siakadu',
    'Bearer token authentication'
);
GO

-- =============================================
-- 4. UPDATE API Config (Example: Update Base URL)
-- =============================================
-- Update base URL untuk staging
UPDATE setting.api_configs
SET
    base_url = 'https://sister-api-staging.kemdikbud.go.id/ws.php',
    updated_by = 'admin@unila.ac.id'
WHERE api_code = 'SISTER_STAGING';
GO

-- =============================================
-- 5. ACTIVATE / DEACTIVATE API Config
-- =============================================
-- Activate config
UPDATE setting.api_configs
SET
    is_active = 1,
    updated_by = 'admin@unila.ac.id'
WHERE api_code = 'SISTER_STAGING';

-- Deactivate config
UPDATE setting.api_configs
SET
    is_active = 0,
    updated_by = 'admin@unila.ac.id'
WHERE api_code = 'SISTER_STAGING';
GO

-- =============================================
-- 6. SOFT DELETE API Config
-- =============================================
UPDATE setting.api_configs
SET
    deleted_at = GETDATE(),
    deleted_by = 'admin@unila.ac.id',
    is_active = 0
WHERE api_code = 'SISTER_STAGING';
GO

-- =============================================
-- 7. RESTORE Deleted Config
-- =============================================
UPDATE setting.api_configs
SET
    deleted_at = NULL,
    deleted_by = NULL
WHERE api_code = 'SISTER_STAGING';
GO

-- =============================================
-- 8. UPDATE Test Results (after connection test)
-- =============================================
UPDATE setting.api_configs
SET
    last_tested_at = GETDATE(),
    last_test_status = 'success',
    last_test_message = 'Connection successful. Response time: 250ms',
    updated_by = 'system'
WHERE api_code = 'SISTER';
GO

-- Failed test example
UPDATE setting.api_configs
SET
    last_tested_at = GETDATE(),
    last_test_status = 'failed',
    last_test_message = 'Connection timeout after 30 seconds',
    updated_by = 'system'
WHERE api_code = 'FEEDER';
GO

-- =============================================
-- 9. LOG API Config Changes (Audit Trail)
-- =============================================
-- Example: Log config update
EXEC setting.sp_log_api_config_change
    @config_id = 1,
    @api_code = 'SISTER',
    @action_type = 'UPDATE',
    @old_values = '{"base_url": "https://old-url.com"}',
    @new_values = '{"base_url": "https://new-url.com"}',
    @performed_by = 'admin@unila.ac.id',
    @ip_address = '192.168.1.100',
    @user_agent = 'Mozilla/5.0',
    @notes = 'Updated base URL to new endpoint';
GO

-- Example: Log test action
EXEC setting.sp_log_api_config_change
    @config_id = 1,
    @api_code = 'SISTER',
    @action_type = 'TEST',
    @old_values = NULL,
    @new_values = '{"status": "success", "response_time_ms": 250}',
    @performed_by = 'admin@unila.ac.id',
    @ip_address = '192.168.1.100',
    @notes = 'Connection test successful';
GO

-- =============================================
-- 10. Query Audit Logs
-- =============================================
-- Get all changes for specific API
SELECT
    al.id,
    al.action_type,
    al.old_values,
    al.new_values,
    al.performed_by,
    al.ip_address,
    al.performed_at,
    al.notes
FROM setting.api_config_audit_logs al
WHERE al.api_code = 'SISTER'
ORDER BY al.performed_at DESC;
GO

-- Get recent changes across all APIs
SELECT TOP 50
    al.api_code,
    ac.api_name,
    al.action_type,
    al.performed_by,
    al.performed_at,
    al.notes
FROM setting.api_config_audit_logs al
INNER JOIN setting.api_configs ac ON al.config_id = ac.id
ORDER BY al.performed_at DESC;
GO

-- =============================================
-- 11. Query by Tags
-- =============================================
-- Get all production APIs
SELECT
    api_code,
    api_name,
    base_url,
    is_active,
    tags
FROM setting.api_configs
WHERE tags LIKE '%production%'
    AND deleted_at IS NULL;
GO

-- =============================================
-- 12. Get Config with Fallback Logic
-- =============================================
-- Query untuk check apakah harus pakai env atau database
SELECT
    api_code,
    api_name,
    base_url,
    encrypted_credentials,
    use_env_fallback,
    CASE
        WHEN encrypted_credentials IS NULL AND use_env_fallback = 1
            THEN 'USE_ENVIRONMENT'
        WHEN encrypted_credentials IS NOT NULL
            THEN 'USE_DATABASE'
        ELSE 'NOT_CONFIGURED'
    END AS credential_source
FROM setting.api_configs
WHERE is_active = 1
    AND deleted_at IS NULL;
GO

-- =============================================
-- 13. Statistics & Monitoring
-- =============================================
-- Count APIs by status
SELECT
    is_active,
    COUNT(*) AS total_configs,
    SUM(CASE WHEN last_test_status = 'success' THEN 1 ELSE 0 END) AS successful_tests,
    SUM(CASE WHEN last_test_status = 'failed' THEN 1 ELSE 0 END) AS failed_tests,
    SUM(CASE WHEN last_tested_at IS NULL THEN 1 ELSE 0 END) AS never_tested
FROM setting.api_configs
WHERE deleted_at IS NULL
GROUP BY is_active;
GO

-- Last test results
SELECT
    api_code,
    api_name,
    last_tested_at,
    last_test_status,
    last_test_message,
    DATEDIFF(MINUTE, last_tested_at, GETDATE()) AS minutes_since_last_test
FROM setting.api_configs
WHERE deleted_at IS NULL
ORDER BY last_tested_at DESC;
GO

-- =============================================
-- 14. Bulk Operations
-- =============================================
-- Deactivate all staging configs
UPDATE setting.api_configs
SET
    is_active = 0,
    updated_by = 'admin@unila.ac.id'
WHERE tags LIKE '%staging%'
    AND deleted_at IS NULL;
GO

-- Force re-test all active configs
UPDATE setting.api_configs
SET
    last_test_status = 'pending',
    updated_by = 'system'
WHERE is_active = 1
    AND deleted_at IS NULL;
GO

-- =============================================
-- 15. Complex Query: Config Health Dashboard
-- =============================================
SELECT
    ac.api_code,
    ac.api_name,
    ac.base_url,
    ac.is_active,
    ac.last_tested_at,
    ac.last_test_status,
    DATEDIFF(HOUR, ac.last_tested_at, GETDATE()) AS hours_since_test,
    -- Count audit logs in last 24 hours
    (
        SELECT COUNT(*)
        FROM setting.api_config_audit_logs al
        WHERE al.config_id = ac.id
            AND al.performed_at >= DATEADD(HOUR, -24, GETDATE())
    ) AS changes_last_24h,
    -- Last change info
    (
        SELECT TOP 1 al.action_type + ' by ' + al.performed_by
        FROM setting.api_config_audit_logs al
        WHERE al.config_id = ac.id
        ORDER BY al.performed_at DESC
    ) AS last_change,
    -- Health status
    CASE
        WHEN ac.is_active = 0 THEN 'INACTIVE'
        WHEN ac.last_test_status = 'failed' THEN 'UNHEALTHY'
        WHEN ac.last_test_status = 'success'
            AND DATEDIFF(HOUR, ac.last_tested_at, GETDATE()) <= 24 THEN 'HEALTHY'
        WHEN ac.last_tested_at IS NULL THEN 'UNTESTED'
        ELSE 'STALE'
    END AS health_status
FROM setting.api_configs ac
WHERE ac.deleted_at IS NULL
ORDER BY
    CASE
        WHEN ac.last_test_status = 'failed' THEN 1
        WHEN ac.is_active = 0 THEN 2
        ELSE 3
    END,
    ac.api_code;
GO

-- =============================================
-- 16. Cleanup Old Audit Logs (Optional)
-- =============================================
-- Delete audit logs older than 90 days
-- Uncomment to execute:
/*
DELETE FROM setting.api_config_audit_logs
WHERE performed_at < DATEADD(DAY, -90, GETDATE());
*/
GO

PRINT 'Example queries completed successfully!';
GO