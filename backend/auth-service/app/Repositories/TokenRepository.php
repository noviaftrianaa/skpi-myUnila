<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Token Repository - Menggunakan Native SQL Query (No Eloquent)
 * Based on Go implementation: auth_repository.go
 */
class TokenRepository
{
    /**
     * Log JWT Token ke logger.log_jwt
     *
     * @param array $data [id_pengguna, id_aplikasi, token_value, url, ip_address, waktu_expired]
     * @return bool
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
            \Log::error('Failed to log JWT', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get Active Access Token untuk user & aplikasi tertentu
     * Prioritas: Token dengan expired terpendek (Access Token)
     *
     * @param string $userId UUID
     * @param string $appId UUID
     * @return object|null
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

        $result = DB::selectOne($sql, [$userId, $appId]);
        return $result;
    }

    /**
     * Expire Access Token (set waktu_expired = now)
     *
     * @param string $tokenValue
     * @return bool
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
            \Log::error('Failed to expire access token', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Create Refresh Token di man_akses.refresh_token
     *
     * @param array $data [id_refresh_token (JTI), token_value, waktu_expired]
     * @return bool
     */
    public function createRefreshToken(array $data): bool
    {
        $sql = "
            INSERT INTO man_akses.refresh_token (
                id_refresh_token, waktu_create, waktu_expired,
                token_value, is_revoked
            ) VALUES (
                ?, GETDATE(), ?, ?, 0
            )
        ";

        try {
            DB::insert($sql, [
                $data['id_refresh_token'], // JTI dari JWT
                $data['waktu_expired'],
                $data['token_value'],
            ]);
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to create refresh token', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get Refresh Token by JTI
     *
     * @param string $jti UUID
     * @return object|null
     */
    public function getRefreshToken(string $jti): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_refresh_token) as id_refresh_token,
                waktu_create, waktu_expired,
                token_value, is_revoked, revoked_at, revoked_reason
            FROM man_akses.refresh_token
            WHERE id_refresh_token = ?
        ";

        $result = DB::selectOne($sql, [$jti]);
        return $result;
    }

    /**
     * Check if Refresh Token is Active (not revoked & not expired)
     *
     * @param string $jti UUID
     * @return bool
     */
    public function isRefreshTokenActive(string $jti): bool
    {
        $sql = "
            SELECT CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM man_akses.refresh_token
                    WHERE id_refresh_token = ?
                      AND is_revoked = 0
                      AND waktu_expired > GETDATE()
                ) THEN 1 ELSE 0 END as is_active
        ";

        $result = DB::selectOne($sql, [$jti]);
        return (bool) ($result->is_active ?? false);
    }

    /**
     * Revoke Refresh Token
     *
     * @param string $jti UUID
     * @param string $reason
     * @return bool
     */
    public function revokeRefreshToken(string $jti, string $reason = 'User logout'): bool
    {
        $sql = "
            UPDATE man_akses.refresh_token
            SET is_revoked = 1, revoked_at = GETDATE(), revoked_reason = ?
            WHERE id_refresh_token = ?
        ";

        try {
            DB::update($sql, [$reason, $jti]);
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to revoke refresh token', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Revoke All Refresh Tokens for a User
     *
     * @param string $userId UUID
     * @param string $reason
     * @return bool
     */
    public function revokeAllUserTokens(string $userId, string $reason = 'Logout from all devices'): bool
    {
        $sql = "
            UPDATE rt
            SET rt.is_revoked = 1, rt.revoked_at = GETDATE(), rt.revoked_reason = ?
            FROM man_akses.refresh_token rt
            WHERE EXISTS (
                SELECT 1 FROM logger.log_jwt lj
                WHERE lj.token_value LIKE '%' + CONVERT(VARCHAR(36), rt.id_refresh_token) + '%'
                  AND lj.id_pengguna = ?
            )
        ";

        try {
            DB::update($sql, [$reason, $userId]);
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to revoke all user tokens', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Find User by Username
     *
     * @param string $username
     * @return object|null
     */
    public function findUserByUsername(string $username): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
                username,
                nm_pengguna,
                email,
                password,
                password_encrypt,
                id_pd_pengguna,
                id_sdm_pengguna,
                id_user_sikep
            FROM man_akses.pengguna
            WHERE username = ?
              AND soft_delete = 0
        ";

        $result = DB::selectOne($sql, [$username]);
        return $result;
    }

    /**
     * Find User by ID
     *
     * @param string $userId UUID
     * @return object|null
     */
    public function findUserById(string $userId): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
                username,
                nm_pengguna,
                email,
                password,
                password_encrypt,
                id_pd_pengguna,
                id_sdm_pengguna,
                id_user_sikep
            FROM man_akses.pengguna
            WHERE id_pengguna = ?
              AND soft_delete = 0
        ";

        $result = DB::selectOne($sql, [$userId]);
        return $result;
    }

    /**
     * Get Active Role (role dengan last_active terbaru)
     *
     * @param string $userId UUID
     * @return string|null
     */
    public function getActiveRole(string $userId): ?string
    {
        $sql = "
            SELECT TOP 1
                CASE
                    WHEN rp.id_peran = 4001 THEN 'API_AKADEMIK'
                    WHEN rp.id_peran = 4002 THEN 'API_KEPEGAWAIAN'
                    ELSE p.nm_peran
                END AS nm_peran
            FROM man_akses.role_pengguna rp
            JOIN man_akses.peran p ON p.id_peran = rp.id_peran
            WHERE rp.id_pengguna = ?
              AND rp.soft_delete = 0
              AND rp.approval_peran = 1
            ORDER BY rp.last_active DESC
        ";

        $result = DB::selectOne($sql, [$userId]);
        return $result ? $result->nm_peran : null;
    }

    /**
     * Get User Roles from man_akses.role_pengguna
     *
     * @param string $userId UUID
     * @return array
     */
    public function getUserRoles(string $userId): array
    {
        $sql = "
            SELECT
                rp.id_peran,
                CASE
                    WHEN rp.id_peran = 4001 THEN 'API_AKADEMIK'
                    WHEN rp.id_peran = 4002 THEN 'API_KEPEGAWAIAN'
                    ELSE p.nm_peran
                END AS nm_peran
            FROM man_akses.role_pengguna rp
            JOIN man_akses.peran p ON p.id_peran = rp.id_peran
            WHERE rp.id_pengguna = ?
              AND rp.soft_delete = 0
              AND rp.approval_peran = 1
        ";

        $roles = DB::select($sql, [$userId]);

        // Return array of role names
        return array_map(fn($r) => $r->nm_peran, $roles);
    }

    /**
     * Determine User Role Type (mahasiswa/dosen/tendik/alumni)
     * Based on id_pd_pengguna, id_sdm_pengguna, and email domain
     *
     * @param object $pengguna
     * @return string
     */
    public function determineUserRoleType(object $pengguna): string
    {
        // Cek apakah mahasiswa (punya id_pd_pengguna)
        if (!empty($pengguna->id_pd_pengguna)) {
            return 'mahasiswa';
        }

        // Cek apakah dosen/tendik (punya id_sdm_pengguna)
        if (!empty($pengguna->id_sdm_pengguna)) {
            // Bedakan dosen dan tendik berdasarkan:
            // Tendik: email @staff.unila.ac.id ATAU punya id_user_sikep
            // Dosen: punya id_sdm_pengguna tapi bukan tendik
            $isStaffEmail = !empty($pengguna->email) && str_ends_with(strtolower($pengguna->email), '@staff.unila.ac.id');
            $hasSikepId = !empty($pengguna->id_user_sikep);

            if ($isStaffEmail || $hasSikepId) {
                return 'tendik';
            }
            return 'dosen';
        }

        // Default - User tanpa id_pd_pengguna atau id_sdm_pengguna
        return 'guest';
    }

    /**
     * Verify Password dengan SHA1 Rehashing Strategy
     *
     * Strategy: bcrypt(SHA1(password))
     *
     * Flow:
     * 1. User input plain text password
     * 2. Hash user input dengan SHA1 (same as SSO does)
     * 3. Verify SHA1 hash dengan bcrypt
     *
     * Benefits:
     * - Auth service TIDAK perlu compare SHA1 langsung
     * - Auth service hanya verify bcrypt (secure)
     * - SSO tetap pakai SHA1 (backward compatible)
     * - Apps lain tetap bisa verify SHA1 dari password field
     *
     * @param object $pengguna User object dengan password & password_encrypt
     * @param string $password Plain text password dari user input
     * @return array [bool $valid, array $debug]
     */
    public function verifyPasswordRehashed(object $pengguna, string $password): array
    {
        $debug = [
            'username' => $pengguna->username ?? 'unknown',
            'password_input_length' => strlen($password),
            'password_field_sha1' => $pengguna->password ?? null,
            'password_encrypt_exists' => !empty($pengguna->password_encrypt),
            'password_encrypt_length' => !empty($pengguna->password_encrypt) ? strlen($pengguna->password_encrypt) : 0,
            'password_encrypt_prefix' => !empty($pengguna->password_encrypt) ? substr($pengguna->password_encrypt, 0, 7) : null,
        ];

        // Step 1: Check if password_encrypt exists
        if (empty($pengguna->password_encrypt)) {
            $debug['step'] = 'password_encrypt is null';
            $debug['result'] = false;

            \Log::warning('🔴 [DEBUG] User password_encrypt is null', $debug);
            return [false, $debug];
        }

        // Step 2: Hash user input dengan SHA1 (same as SSO does)
        $sha1Hash = sha1($password);
        $debug['sha1_from_input'] = $sha1Hash;

        // Step 2.5: Compare SHA1 dengan database
        if (!empty($pengguna->password)) {
            $debug['sha1_match_database'] = ($sha1Hash === $pengguna->password);
        }

        // Step 3: Verify SHA1 hash dengan bcrypt
        // password_encrypt berisi: bcrypt(SHA1)
        $valid = password_verify($sha1Hash, $pengguna->password_encrypt);
        $debug['bcrypt_verify_result'] = $valid;

        // Additional debug: Test jika direct password (bukan SHA1) di-verify
        if (!$valid) {
            $directVerify = password_verify($password, $pengguna->password_encrypt);
            $debug['direct_password_verify'] = $directVerify;

            // Test: Apa yang di-hash di password_encrypt?
            if (!empty($pengguna->password)) {
                $sha1FromDb = $pengguna->password;
                $verifyDbSha1 = password_verify($sha1FromDb, $pengguna->password_encrypt);
                $debug['verify_db_sha1'] = $verifyDbSha1;
            }
        }

        $debug['step'] = 'verification_complete';
        $debug['result'] = $valid;

        if ($valid) {
            \Log::info('✅ [DEBUG] Login successful with rehashed password', $debug);
        } else {
            \Log::warning('🔴 [DEBUG] Login failed - password verification failed', $debug);
        }

        return [$valid, $debug];
    }

    /**
     * Update Active Login Session Logout Time
     *
     * @param string $userId UUID
     * @param string $appId UUID
     * @return bool
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
            \Log::error('Failed to update login logout time', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get Active Login Log
     *
     * @param string $userId UUID
     * @param string $appId UUID
     * @return object|null
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

        $result = DB::selectOne($sql, [$userId, $appId]);
        return $result;
    }

    /**
     * Get User Detail with Organization Info
     *
     * @param string $userId UUID
     * @return object|null
     */
    public function getUserDetail(string $userId): ?object
    {
        $sql = "
            SELECT
                pg.id_pengguna,
                pg.username,
                pg.nm_pengguna,
                pg.email,
                prn.nm_peran,
                -- Convert to Title Case (capitalize first letter of each word)
                STUFF((
                    SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
                    FROM STRING_SPLIT(sp.nm_lemb, ' ')
                    WHERE RTRIM(value) <> ''
                    FOR XML PATH('')
                ), 1, 1, '') AS nm_satuan_pendidikan,
                STUFF((
                    SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
                    FROM STRING_SPLIT(fak.nm_lemb, ' ')
                    WHERE RTRIM(value) <> ''
                    FOR XML PATH('')
                ), 1, 1, '') AS nm_fakultas,
                STUFF((
                    SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
                    FROM STRING_SPLIT(jur.nm_lemb, ' ')
                    WHERE RTRIM(value) <> ''
                    FOR XML PATH('')
                ), 1, 1, '') AS nm_jurusan,
                CASE
                    WHEN prodi.nm_lemb IS NULL THEN NULL
                    ELSE CONCAT(
                        STUFF((
                            SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
                            FROM STRING_SPLIT(prodi.nm_lemb, ' ')
                            WHERE RTRIM(value) <> ''
                            FOR XML PATH('')
                        ), 1, 1, ''),
                        ' (', jenj.nm_jenj_didik, ')'
                    )
                END AS nm_prodi_jenjang
            FROM
                man_akses.pengguna pg
                OUTER APPLY (
                    SELECT
                        TOP 1 rol_appl.id_peran,
                        rol_appl.id_organisasi
                    FROM
                        man_akses.role_pengguna rol_appl
                    WHERE
                        rol_appl.id_pengguna = pg.id_pengguna
                        AND rol_appl.soft_delete = 0
                        AND rol_appl.approval_peran = 1
                    ORDER BY
                        rol_appl.last_active DESC
                ) AS rol
                LEFT JOIN man_akses.peran prn ON prn.id_peran = rol.id_peran
                    AND prn.expired_date IS NULL
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = rol.id_organisasi
                    AND prodi.soft_delete = 0
                LEFT JOIN pdrd.satuan_pendidikan sp WITH(NOLOCK) ON sp.id_sp = COALESCE(prodi.id_sp, rol.id_organisasi)
                    AND sp.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                    AND jur.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                    AND fak.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                    AND jenj.expired_date IS NULL
            WHERE
                pg.soft_delete = 0
                AND pg.id_pengguna = ?
        ";

        $result = DB::selectOne($sql, [$userId]);
        return $result;
    }

    /**
     * Switch User Role - Update last_active on role_pengguna
     *
     * @param string $userId UUID
     * @param string $roleId ID Peran
     * @return bool
     */
    public function switchUserRole(string $userId, string $roleId): bool
    {
        $sql = "
            UPDATE man_akses.role_pengguna
            SET last_active = GETDATE()
            WHERE id_pengguna = ?
              AND id_peran = ?
              AND soft_delete = 0
              AND approval_peran = 1
        ";

        try {
            $affected = DB::update($sql, [$userId, $roleId]);
            return $affected > 0;
        } catch (\Exception $e) {
            \Log::error('Failed to switch user role', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get Role ID by Role Name for specific User
     *
     * @param string $userId UUID
     * @param string $roleName
     * @return string|null
     */
    public function getRoleIdByName(string $userId, string $roleName): ?string
    {
        $sql = "
            SELECT TOP 1 rp.id_peran
            FROM man_akses.role_pengguna rp
            JOIN man_akses.peran p ON p.id_peran = rp.id_peran
            WHERE rp.id_pengguna = ?
              AND p.nm_peran = ?
              AND rp.soft_delete = 0
              AND rp.approval_peran = 1
        ";

        $result = DB::selectOne($sql, [$userId, $roleName]);
        return $result ? (string)$result->id_peran : null;
    }
}
