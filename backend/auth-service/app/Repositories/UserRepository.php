<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * User Repository
 * Handle all user-related database operations
 */
class UserRepository
{
    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?object
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
                id_user_sikep,
                google2fa_enabled,
                google2fa_secret,
                google2fa_enabled_at,
                failed_login_attempts,
                locked_until,
                last_login_at,
                last_login_ip
            FROM man_akses.pengguna
            WHERE username = ?
              AND soft_delete = 0
        ";

        return DB::selectOne($sql, [$username]);
    }

    /**
     * Find user by ID
     */
    public function findById(string $userId): ?object
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
                id_user_sikep,
                google2fa_enabled,
                google2fa_secret,
                google2fa_enabled_at,
                failed_login_attempts,
                locked_until,
                last_login_at,
                last_login_ip
            FROM man_akses.pengguna
            WHERE id_pengguna = ?
              AND soft_delete = 0
        ";

        return DB::selectOne($sql, [$userId]);
    }

    /**
     * Get user detail with organizational information
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

        return DB::selectOne($sql, [$userId]);
    }

    /**
     * Get user roles
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

        return array_map(fn($r) => $r->nm_peran, $roles);
    }

    /**
     * Get active role (role dengan last_active terbaru)
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
        return $result?->nm_peran;
    }

    /**
     * Get role ID by name for specific user
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

    /**
     * Switch user role (update last_active)
     */
    public function switchRole(string $userId, string $roleId): bool
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
            Log::error('Failed to switch user role', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Verify password with SHA1 Rehashing Strategy
     */
    public function verifyPassword(object $user, string $password): bool
    {
        if (empty($user->password_encrypt)) {
            Log::warning('User password_encrypt is null', ['username' => $user->username]);
            return false;
        }

        // Hash user input dengan SHA1 (same as SSO does)
        $sha1Hash = sha1($password);

        // Verify SHA1 hash dengan bcrypt
        return password_verify($sha1Hash, $user->password_encrypt);
    }

    /**
     * Update last login timestamp and IP address
     */
    public function updateLastLogin(string $userId, string $ipAddress): bool
    {
        $sql = "
            UPDATE man_akses.pengguna
            SET last_login_at = GETDATE(),
                last_login_ip = ?
            WHERE id_pengguna = ?
        ";

        try {
            $affected = DB::update($sql, [$ipAddress, $userId]);
            return $affected > 0;
        } catch (\Exception $e) {
            Log::error('Failed to update last login', [
                'user_id' => $userId,
                'ip_address' => $ipAddress,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
