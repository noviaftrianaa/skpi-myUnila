-- =============================================
-- API Configuration Management Schema
-- All-in-One Migration Script
-- =============================================

USE [pdut_dev];

-- Step 1: Create Schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'setting')
BEGIN
    EXEC('CREATE SCHEMA setting');
    PRINT 'Schema setting created';
END;

-- Step 2: Create api_configs Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'api_configs' AND schema_id = SCHEMA_ID('setting'))
BEGIN
    CREATE TABLE setting.api_configs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        api_code NVARCHAR(50) NOT NULL UNIQUE,
        api_name NVARCHAR(200) NOT NULL,
        api_description NVARCHAR(MAX),
        base_url NVARCHAR(500) NOT NULL,
        auth_type NVARCHAR(50) NOT NULL,
        encrypted_credentials NVARCHAR(MAX),
        additional_headers NVARCHAR(MAX),
        timeout_seconds INT DEFAULT 30,
        max_retries INT DEFAULT 3,
        retry_delay_ms INT DEFAULT 1000,
        is_active BIT NOT NULL DEFAULT 1,
        is_encrypted BIT NOT NULL DEFAULT 1,
        use_env_fallback BIT NOT NULL DEFAULT 1,
        last_tested_at DATETIME,
        last_test_status NVARCHAR(50),
        last_test_message NVARCHAR(MAX),
        created_by NVARCHAR(100),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_by NVARCHAR(100),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        deleted_at DATETIME NULL,
        deleted_by NVARCHAR(100) NULL,
        tags NVARCHAR(500),
        notes NVARCHAR(MAX)
    );
    PRINT 'Table setting.api_configs created';
END;

-- Step 3: Create audit_logs Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'api_config_audit_logs' AND schema_id = SCHEMA_ID('setting'))
BEGIN
    CREATE TABLE setting.api_config_audit_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        config_id INT NOT NULL,
        api_code NVARCHAR(50) NOT NULL,
        action_type NVARCHAR(50) NOT NULL,
        old_values NVARCHAR(MAX),
        new_values NVARCHAR(MAX),
        performed_by NVARCHAR(100) NOT NULL,
        ip_address NVARCHAR(50),
        user_agent NVARCHAR(500),
        performed_at DATETIME NOT NULL DEFAULT GETDATE(),
        notes NVARCHAR(MAX)
    );
    PRINT 'Table setting.api_config_audit_logs created';
END;

-- Step 4: Add Foreign Key (if not exists)
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys
    WHERE name = 'FK_api_config_audit_logs_config'
    AND parent_object_id = OBJECT_ID('setting.api_config_audit_logs')
)
BEGIN
    ALTER TABLE setting.api_config_audit_logs
    ADD CONSTRAINT FK_api_config_audit_logs_config
        FOREIGN KEY (config_id)
        REFERENCES setting.api_configs(id);
    PRINT 'Foreign key added';
END;

-- Step 5: Create Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_api_configs_api_code_active')
BEGIN
    CREATE NONCLUSTERED INDEX IX_api_configs_api_code_active
        ON setting.api_configs(api_code, is_active)
        WHERE deleted_at IS NULL;
    PRINT 'Index IX_api_configs_api_code_active created';
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_api_config_audit_logs_config_id_date')
BEGIN
    CREATE NONCLUSTERED INDEX IX_api_config_audit_logs_config_id_date
        ON setting.api_config_audit_logs(config_id, performed_at DESC);
    PRINT 'Index IX_api_config_audit_logs_config_id_date created';
END;

-- Step 6: Insert Seed Data
IF NOT EXISTS (SELECT * FROM setting.api_configs WHERE api_code = 'SISTER')
BEGIN
    INSERT INTO setting.api_configs (
        api_code, api_name, api_description, base_url, auth_type,
        encrypted_credentials, additional_headers, timeout_seconds,
        max_retries, is_active, is_encrypted, use_env_fallback,
        created_by, tags, notes
    )
    VALUES (
        'SISTER',
        'SISTER API Kemdikbud',
        'API untuk sinkronisasi data dosen dan tendik dengan SISTER Kemdikbud',
        'https://sister-api.kemdikbud.go.id/ws.php',
        'custom',
        NULL,
        '{"Content-Type": "application/x-www-form-urlencoded"}',
        60, 3, 1, 0, 1,
        'SYSTEM',
        'production,kemdikbud',
        'Credentials default diambil dari environment variables'
    );
    PRINT 'SISTER API config inserted';
END;

IF NOT EXISTS (SELECT * FROM setting.api_configs WHERE api_code = 'FEEDER')
BEGIN
    INSERT INTO setting.api_configs (
        api_code, api_name, api_description, base_url, auth_type,
        encrypted_credentials, additional_headers, timeout_seconds,
        max_retries, is_active, is_encrypted, use_env_fallback,
        created_by, tags, notes
    )
    VALUES (
        'FEEDER',
        'Feeder PDDIKTI Unila',
        'API untuk sinkronisasi data dengan Feeder PDDIKTI',
        'https://dapelmikpdpt.unila.ac.id/New/ws/Api.php',
        'token',
        NULL,
        '{"Content-Type": "application/json"}',
        30, 3, 1, 0, 1,
        'SYSTEM',
        'production,pddikti',
        'Credentials default diambil dari environment variables'
    );
    PRINT 'FEEDER API config inserted';
END;

-- Verification
PRINT '';
PRINT '========================================';
PRINT 'Migration completed successfully!';
PRINT '========================================';
PRINT '';

SELECT 'API Configs' AS [Table], COUNT(*) AS [Count]
FROM setting.api_configs;

SELECT api_code, api_name, is_active, use_env_fallback
FROM setting.api_configs
ORDER BY api_code;