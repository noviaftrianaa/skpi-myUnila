<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Token Repository
 * Handle all token and logging-related database operations
 */
class TokenRepository
{
    /**
     * Log JWT Token to logger.log_jwt
     */
    public function logJWT(array $data): bool
    {
        $sql = "
            INSERT INTO logger.log_jwt (
                id_log_jwt, id_pengguna, id_aplikasi, token_value,
                url, ip_address, waktu_create, waktu_expired
            ) VALUES (
                ?, ?, ?, ?, ?, ?, GETDATE(), ?
            )
        ";

        try {
            DB::insert($sql, [
                Str::uuid()->toString(),
                $data['id_pengguna'],
                $data['id_aplikasi'],
                $data['token_value'],
                $data['url'] ?? '/api/v1/auth/login',
                $data['ip_address'],
                $data['waktu_expired'],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to log JWT', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Expire access token
     */
    public function expireAccessToken(string $tokenValue): bool
    {
        $sql = "
            UPDATE logger.log_jwt
            SET waktu_expired = GETDATE()
            WHERE token_value = ?
        ";

        try {
            DB::update($sql, [$tokenValue]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to expire access token', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get active access token for user & aplikasi
     */
    public function getActiveToken(string $userId, string $appId): ?object
    {
        $sql = "
            SELECT TOP 1
                id_log_jwt, id_pengguna, id_aplikasi, token_value,
                url, ip_address, waktu_create, waktu_expired
            FROM logger.log_jwt
            WHERE
                id_pengguna = ? AND
                id_aplikasi = ? AND
                waktu_expired > GETDATE() AND
                url = '/api/v1/auth/login'
            ORDER BY
                waktu_expired ASC,
                waktu_create DESC
        ";

        return DB::selectOne($sql, [$userId, $appId]);
    }

    /**
     * Revoke all user tokens
     */
    public function revokeAllUserTokens(string $userId): bool
    {
        $sql = "
            UPDATE logger.log_jwt
            SET waktu_expired = GETDATE()
            WHERE id_pengguna = ?
              AND waktu_expired > GETDATE()
        ";

        try {
            DB::update($sql, [$userId]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to revoke all user tokens', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Log successful login to logger.log_login
     */
    public function logLogin(array $data): bool
    {
        $sql = "
            INSERT INTO logger.log_login (
                id_log_login, id_aplikasi, id_pengguna, username, email,
                status, ip_address, user_agent,
                browser, os, device_type, platform, location,
                mfa_verified, a_sesi_aktif, waktu_login
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, GETDATE()
            )
        ";

        try {
            DB::insert($sql, [
                $data['id_log_login'],
                $data['id_aplikasi'],
                $data['id_pengguna'],
                $data['username'],
                $data['email'],
                $data['status'],
                $data['ip_address'],
                $data['user_agent'],
                $data['browser'],
                $data['os'],
                $data['device_type'],
                $data['platform'],
                $data['location'],
                $data['mfa_verified'],
                $data['a_sesi_aktif'],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::warning('Failed to log login: ' . $e->getMessage(), [
                'user_id' => $data['id_pengguna'] ?? null,
                'username' => $data['username'] ?? null,
            ]);
            return false;
        }
    }

    /**
     * Update login logout time
     */
    public function updateLoginLogoutTime(string $userId, string $appId): bool
    {
        $sql = "
            UPDATE logger.log_login
            SET waktu_logout = GETDATE(), a_sesi_aktif = 0
            WHERE id_pengguna = ?
              AND id_aplikasi = ?
              AND a_sesi_aktif = 1
        ";

        try {
            DB::update($sql, [$userId, $appId]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to update login logout time', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get active login log
     */
    public function getActiveLoginLog(string $userId, string $appId): ?object
    {
        $sql = "
            SELECT TOP 1
                CONVERT(VARCHAR(36), id_log_login) as id_log_login,
                id_aplikasi, id_pengguna,
                waktu_login, waktu_logout, ip_address,
                browser, os, a_sesi_aktif
            FROM logger.log_login
            WHERE
                id_pengguna = ? AND
                id_aplikasi = ? AND
                a_sesi_aktif = 1
            ORDER BY waktu_login DESC
        ";

        return DB::selectOne($sql, [$userId, $appId]);
    }

    /**
     * Create refresh token
     */
    public function createRefreshToken(array $data): bool
    {
        $sql = "
            INSERT INTO man_akses.refresh_token (
                id_refresh_token, token_value, waktu_expired, is_revoked
            ) VALUES (
                ?, ?, ?, 0
            )
        ";

        try {
            DB::insert($sql, [
                $data['id_refresh_token'],
                $data['token_value'],
                $data['waktu_expired'],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to create refresh token', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get refresh token by ID
     */
    public function getRefreshTokenById(string $tokenId): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_refresh_token) as id_refresh_token,
                token_value,
                waktu_expired,
                is_revoked
            FROM man_akses.refresh_token
            WHERE id_refresh_token = ?
        ";

        return DB::selectOne($sql, [$tokenId]);
    }

    /**
     * Revoke refresh token
     */
    public function revokeRefreshToken(string $tokenId, string $reason = 'manual'): bool
    {
        $sql = "
            UPDATE man_akses.refresh_token
            SET is_revoked = 1
            WHERE id_refresh_token = ?
        ";

        try {
            DB::update($sql, [$tokenId]);

            Log::info('Refresh token revoked', [
                'token_id' => $tokenId,
                'reason' => $reason,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to revoke refresh token', [
                'error' => $e->getMessage(),
                'token_id' => $tokenId,
            ]);
            return false;
        }
    }

    /**
     * Delete expired refresh tokens (cleanup)
     */
    public function deleteExpiredRefreshTokens(): int
    {
        $sql = "
            DELETE FROM man_akses.refresh_token
            WHERE waktu_expired < GETDATE()
               OR is_revoked = 1
        ";

        try {
            return DB::delete($sql);
        } catch (\Exception $e) {
            Log::error('Failed to delete expired refresh tokens', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}
