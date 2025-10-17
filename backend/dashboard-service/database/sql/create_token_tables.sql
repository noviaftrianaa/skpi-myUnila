-- ========================================
-- Token Tables for Auth Service
-- Based on Go microservice implementation
-- Run this script in SSMS (tanpa GO statements)
-- ========================================

-- 1. Create schema logger jika belum ada
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'logger')
BEGIN
    EXEC('CREATE SCHEMA logger');
    PRINT 'Schema logger created successfully';
END;

-- 2. Table: logger.log_jwt
-- Purpose: Log semua JWT token yang di-generate (access & refresh)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[logger].[log_jwt]') AND type in (N'U'))
BEGIN
    CREATE TABLE [logger].[log_jwt] (
        [id_log_jwt] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [id_pengguna] uniqueidentifier NOT NULL,
        [id_aplikasi] uniqueidentifier NOT NULL,
        [token_value] varchar(MAX) NOT NULL,
        [url] varchar(255) NULL,
        [ip_address] varchar(45) NULL,
        [waktu_create] datetime NOT NULL DEFAULT GETDATE(),
        [waktu_expired] datetime NOT NULL
    );

    CREATE INDEX IX_log_jwt_user_app ON [logger].[log_jwt](id_pengguna, id_aplikasi);
    CREATE INDEX IX_log_jwt_expired ON [logger].[log_jwt](waktu_expired);

    PRINT 'Table logger.log_jwt created successfully with indexes';
END
ELSE
BEGIN
    PRINT 'Table logger.log_jwt already exists';
END;

-- 3. Table: man_akses.refresh_token
-- Purpose: Store refresh tokens dengan support revoke
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[man_akses].[refresh_token]') AND type in (N'U'))
BEGIN
    CREATE TABLE [man_akses].[refresh_token] (
        [id_refresh_token] uniqueidentifier NOT NULL PRIMARY KEY, -- JTI dari JWT
        [token_value] varchar(MAX) NOT NULL,
        [waktu_create] datetime NOT NULL DEFAULT GETDATE(),
        [waktu_expired] datetime NOT NULL,
        [is_revoked] bit NOT NULL DEFAULT 0,
        [revoked_at] datetime NULL,
        [revoked_reason] varchar(255) NULL
    );

    CREATE INDEX IX_refresh_token_jti ON [man_akses].[refresh_token](id_refresh_token);
    CREATE INDEX IX_refresh_token_revoked ON [man_akses].[refresh_token](is_revoked, waktu_expired);

    PRINT 'Table man_akses.refresh_token created successfully with indexes';
END
ELSE
BEGIN
    PRINT 'Table man_akses.refresh_token already exists';
END;

-- 4. Table: man_akses.access_token (Optional - jika belum ada)
-- Purpose: Store access tokens (untuk backward compatibility dengan sistem lama)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[man_akses].[access_token]') AND type in (N'U'))
BEGIN
    CREATE TABLE [man_akses].[access_token] (
        [id_token] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [token_value] varchar(MAX) NOT NULL,
        [waktu_create] datetime NOT NULL DEFAULT GETDATE(),
        [waktu_expired] datetime NOT NULL,
        [keterangan] varchar(255) NULL,
        [is_seq_uri] bit NULL DEFAULT 0,
        [is_reg_user] bit NULL DEFAULT 0,
        [base_url] varchar(255) NULL
    );

    CREATE INDEX IX_access_token_expired ON [man_akses].[access_token](waktu_expired);

    PRINT 'Table man_akses.access_token created successfully with indexes';
END
ELSE
BEGIN
    PRINT 'Table man_akses.access_token already exists';
END;

-- 5. Add index untuk logger.log_login jika belum ada
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_log_login_user_app' AND object_id = OBJECT_ID('logger.log_login'))
BEGIN
    CREATE INDEX IX_log_login_user_app ON logger.log_login(id_pengguna, id_aplikasi, a_sesi_aktif);
    PRINT 'Index IX_log_login_user_app created successfully';
END
ELSE
BEGIN
    PRINT 'Index IX_log_login_user_app already exists';
END;

PRINT '==========================================';
PRINT 'Token tables setup completed successfully!';
PRINT '==========================================';
PRINT '';
PRINT 'Created tables:';
PRINT '1. logger.log_jwt - Log all JWT tokens';
PRINT '2. man_akses.refresh_token - Refresh tokens with revoke support';
PRINT '3. man_akses.access_token - Access tokens (backward compatibility)';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Test login endpoint to verify tokens are logged';
PRINT '2. Use Postman collection to test all endpoints';
PRINT '3. Check database to confirm tokens are being saved';
