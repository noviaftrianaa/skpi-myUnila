-- =============================================
-- MFA Tables for SQL Server (Ultra Simplified)
-- Schema: man_akses
-- Compatible with: pragmarx/google2fa-laravel
-- Author: Auth Service
-- Date: 2025-01-11
-- =============================================

-- CATATAN:
-- 1. Jalankan setiap blok secara terpisah jika menggunakan SQL client biasa
-- 2. Table refresh_token TIDAK dibuat karena sudah ada
-- 3. Hanya table dan index yang penting saja

-- =============================================
-- 1. ALTER Table: logger.log_login
-- Menambahkan kolom untuk MFA dan audit trail
-- Table sudah ada, hanya menambah kolom yang diperlukan
-- =============================================

-- Tambah kolom username untuk tracking
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'username')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [username] varchar(60) NULL;
    PRINT 'Column username added to logger.log_login';
END
ELSE
    PRINT 'Column username already exists in logger.log_login';

-- Tambah kolom email untuk tracking
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'email')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [email] varchar(60) NULL;
    PRINT 'Column email added to logger.log_login';
END
ELSE
    PRINT 'Column email already exists in logger.log_login';

-- Tambah kolom status (success, failed, blocked, mfa_required)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'status')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [status] varchar(20) NULL;
    PRINT 'Column status added to logger.log_login';
END
ELSE
    PRINT 'Column status already exists in logger.log_login';

-- Tambah kolom failure_reason
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'failure_reason')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [failure_reason] varchar(255) NULL;
    PRINT 'Column failure_reason added to logger.log_login';
END
ELSE
    PRINT 'Column failure_reason already exists in logger.log_login';

-- Tambah kolom user_agent (full user agent string)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'user_agent')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [user_agent] varchar(500) NULL;
    PRINT 'Column user_agent added to logger.log_login';
END
ELSE
    PRINT 'Column user_agent already exists in logger.log_login';

-- Tambah kolom device_type (web, mobile, tablet)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'device_type')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [device_type] varchar(20) NULL;
    PRINT 'Column device_type added to logger.log_login';
END
ELSE
    PRINT 'Column device_type already exists in logger.log_login';

-- Tambah kolom platform (Windows, Linux, Mac, Android, iOS)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'platform')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [platform] varchar(50) NULL;
    PRINT 'Column platform added to logger.log_login';
END
ELSE
    PRINT 'Column platform already exists in logger.log_login';

-- Tambah kolom location (Country/City)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'location')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [location] varchar(100) NULL;
    PRINT 'Column location added to logger.log_login';
END
ELSE
    PRINT 'Column location already exists in logger.log_login';

-- Tambah kolom mfa_verified (0 atau 1)
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[logger].[log_login]')
               AND name = 'mfa_verified')
BEGIN
    ALTER TABLE [logger].[log_login]
    ADD [mfa_verified] numeric(1,0) NOT NULL DEFAULT ((0));
    PRINT 'Column mfa_verified added to logger.log_login';
END
ELSE
    PRINT 'Column mfa_verified already exists in logger.log_login';

-- Index untuk performa (hanya buat jika belum ada)
IF NOT EXISTS (SELECT * FROM sys.indexes
               WHERE name = 'IX_log_login_id_pengguna_status'
               AND object_id = OBJECT_ID(N'[logger].[log_login]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_log_login_id_pengguna_status]
        ON [logger].[log_login] ([id_pengguna], [status], [waktu_login]);
    PRINT 'Index IX_log_login_id_pengguna_status created';
END
ELSE
    PRINT 'Index IX_log_login_id_pengguna_status already exists';

IF NOT EXISTS (SELECT * FROM sys.indexes
               WHERE name = 'IX_log_login_waktu'
               AND object_id = OBJECT_ID(N'[logger].[log_login]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_log_login_waktu]
        ON [logger].[log_login] ([waktu_login]);
    PRINT 'Index IX_log_login_waktu created';
END
ELSE
    PRINT 'Index IX_log_login_waktu already exists';

-- =============================================
-- 2. Add MFA Columns to Existing pengguna Table
-- ALTER TABLE untuk menambah kolom MFA
-- =============================================

-- Cek dan tambah kolom google2fa_secret
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'google2fa_secret')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [google2fa_secret] varchar(500) NULL;
    PRINT 'Column google2fa_secret added';
END
ELSE
    PRINT 'Column google2fa_secret already exists';

-- Cek dan tambah kolom google2fa_enabled
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'google2fa_enabled')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [google2fa_enabled] numeric(1,0) NOT NULL DEFAULT ((0));
    PRINT 'Column google2fa_enabled added';
END
ELSE
    PRINT 'Column google2fa_enabled already exists';

-- Cek dan tambah kolom google2fa_enabled_at
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'google2fa_enabled_at')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [google2fa_enabled_at] datetime NULL;
    PRINT 'Column google2fa_enabled_at added';
END
ELSE
    PRINT 'Column google2fa_enabled_at already exists';

-- Cek dan tambah kolom failed_login_attempts
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'failed_login_attempts')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [failed_login_attempts] int NOT NULL DEFAULT ((0));
    PRINT 'Column failed_login_attempts added';
END
ELSE
    PRINT 'Column failed_login_attempts already exists';

-- Cek dan tambah kolom locked_until
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'locked_until')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [locked_until] datetime NULL;
    PRINT 'Column locked_until added';
END
ELSE
    PRINT 'Column locked_until already exists';

-- Cek dan tambah kolom last_login_at
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'last_login_at')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [last_login_at] datetime NULL;
    PRINT 'Column last_login_at added';
END
ELSE
    PRINT 'Column last_login_at already exists';

-- Cek dan tambah kolom last_login_ip
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[man_akses].[pengguna]')
               AND name = 'last_login_ip')
BEGIN
    ALTER TABLE [man_akses].[pengguna]
    ADD [last_login_ip] varchar(45) NULL;
    PRINT 'Column last_login_ip added';
END
ELSE
    PRINT 'Column last_login_ip already exists';

-- =============================================
-- Script Completed
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'MFA Setup Completed Successfully!';
PRINT '==============================================';
PRINT '';
PRINT 'Tables modified:';
PRINT '  1. logger.log_login (altered - added MFA columns)';
PRINT '  2. man_akses.pengguna (altered - added MFA columns)';
PRINT '';
PRINT 'Columns added to logger.log_login:';
PRINT '  - username';
PRINT '  - email';
PRINT '  - status';
PRINT '  - failure_reason';
PRINT '  - user_agent';
PRINT '  - device_type';
PRINT '  - platform';
PRINT '  - location';
PRINT '  - mfa_verified';
PRINT '';
PRINT 'Columns added to man_akses.pengguna:';
PRINT '  - google2fa_secret';
PRINT '  - google2fa_enabled';
PRINT '  - google2fa_enabled_at';
PRINT '  - failed_login_attempts';
PRINT '  - locked_until';
PRINT '  - last_login_at';
PRINT '  - last_login_ip';
PRINT '';
PRINT 'Indexes created:';
PRINT '  - IX_log_login_id_pengguna_status';
PRINT '  - IX_log_login_waktu';
PRINT '';
PRINT 'NOTE: Using existing logger.log_login table';
PRINT 'NOTE: Table refresh_token not created (already exists)';
PRINT '==============================================';
