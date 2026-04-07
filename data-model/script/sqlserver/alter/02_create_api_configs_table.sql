-- =============================================
-- Step 2: Create api_configs Table
-- =============================================
USE [pdut_dev];

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

    PRINT 'Table setting.api_configs created successfully';
END
ELSE
BEGIN
    PRINT 'Table setting.api_configs already exists';
END