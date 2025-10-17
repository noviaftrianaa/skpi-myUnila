-- ================================================================
-- SQL Script: Reset MFA (Multi-Factor Authentication)
-- Database: SQL Server
-- Purpose: Disable dan reset MFA settings untuk user tertentu
-- ================================================================

-- ================================================================
-- 1. RESET MFA BY USERNAME (Recommended)
-- ================================================================
-- Ganti 'username_disini' dengan username user yang ingin di-reset
-- Contoh: UPDATE man_akses.pengguna SET ... WHERE username = 'mizar.zulmi1073'

UPDATE man_akses.pengguna
SET
    google2fa_enabled = 0,
    google2fa_secret = NULL,
    google2fa_enabled_at = NULL
WHERE username = 'username_disini';

-- Cek hasil
SELECT
    id_pengguna,
    username,
    nm_pengguna,
    google2fa_enabled,
    google2fa_enabled_at
FROM man_akses.pengguna
WHERE username = 'username_disini';


-- ================================================================
-- 2. RESET MFA BY USER ID
-- ================================================================
-- Jika ingin reset by ID, uncomment query di bawah:

/*
UPDATE man_akses.pengguna
SET
    google2fa_enabled = 0,
    google2fa_secret = NULL,
    google2fa_enabled_at = NULL
WHERE id_pengguna = 'F8C8DC15-D3FF-4A79-A255-EF095D4224A9';
*/


-- ================================================================
-- 3. RESET MFA UNTUK SEMUA USER (DANGER!)
-- ================================================================
-- HATI-HATI! Ini akan disable MFA untuk SEMUA user
-- Hanya jalankan jika benar-benar diperlukan

/*
UPDATE man_akses.pengguna
SET
    google2fa_enabled = 0,
    google2fa_secret = NULL,
    google2fa_enabled_at = NULL
WHERE google2fa_enabled = 1;

-- Cek berapa user yang ter-reset
SELECT COUNT(*) as total_users_reset
FROM man_akses.pengguna
WHERE google2fa_enabled = 0
  AND google2fa_secret IS NULL;
*/


-- ================================================================
-- 4. CEK STATUS MFA SEMUA USER
-- ================================================================
-- Untuk melihat user mana saja yang sudah aktifkan MFA

SELECT
    id_pengguna,
    username,
    nm_pengguna,
    email,
    google2fa_enabled,
    google2fa_enabled_at,
    CASE
        WHEN google2fa_enabled = 1 THEN 'MFA Aktif'
        WHEN google2fa_enabled = 0 THEN 'MFA Nonaktif'
        ELSE 'Status Unknown'
    END as mfa_status
FROM man_akses.pengguna
WHERE soft_delete = 0
ORDER BY google2fa_enabled DESC, nm_pengguna;


-- ================================================================
-- 5. CEK USER DENGAN MFA AKTIF SAJA
-- ================================================================
SELECT
    id_pengguna,
    username,
    nm_pengguna,
    email,
    google2fa_enabled_at as aktif_sejak
FROM man_akses.pengguna
WHERE google2fa_enabled = 1
  AND soft_delete = 0
ORDER BY google2fa_enabled_at DESC;


-- ================================================================
-- NOTES:
-- ================================================================
-- - Backup codes tidak disimpan di database saat ini (hanya ditampilkan sekali)
-- - Jika ingin implementasi backup codes, buat table terpisah:
--   CREATE TABLE man_akses.mfa_backup_codes (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     id_pengguna UNIQUEIDENTIFIER NOT NULL,
--     code_hash VARCHAR(255) NOT NULL,
--     is_used BIT DEFAULT 0,
--     used_at DATETIME NULL,
--     created_at DATETIME DEFAULT GETDATE(),
--     FOREIGN KEY (id_pengguna) REFERENCES man_akses.pengguna(id_pengguna)
--   );
-- ================================================================
