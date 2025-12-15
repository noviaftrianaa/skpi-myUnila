<?php

namespace App\Repositories\UserContext;

use Illuminate\Support\Facades\DB;

/**
 * User Context Repository
 * Handle all user context related database operations
 */
class UserContextRepository
{
    /**
     * Get user basic info by ID
     *
     * @param string $userId
     * @return object|null
     */
    public function getUserInfo(string $userId): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_pengguna) as id_pengguna,
                username,
                nm_pengguna,
                email
            FROM man_akses.pengguna
            WHERE id_pengguna = ?
              AND soft_delete = 0
              AND a_aktif = 1
              AND disable = 0
        ";

        return DB::selectOne($sql, [$userId]);
    }

    /**
     * Get all roles for a user
     *
     * @param string $userId
     * @return array
     */
    public function getUserRoles(string $userId): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                rp.id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                uo.level_organisasi,
                CONVERT(VARCHAR(36), uo.id_induk_organisasi) as id_induk_organisasi,
                rp.approval_peran,
                rp.sk_penugasan,
                rp.tgl_sk_penugasan,
                rp.tgl_kadarluasa,
                rp.last_active
            FROM man_akses.role_pengguna rp
            INNER JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.id_pengguna = ?
              AND rp.soft_delete = 0
              AND (rp.tgl_kadarluasa IS NULL OR rp.tgl_kadarluasa >= GETDATE())
            ORDER BY rp.last_active DESC, pr.nm_peran ASC
        ";

        return DB::select($sql, [$userId]);
    }

    /**
     * Verify that a role belongs to a user
     *
     * @param string $userId
     * @param string $idRolePengguna
     * @return object|null
     */
    public function verifyUserRole(string $userId, string $idRolePengguna): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                rp.id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                uo.level_organisasi,
                rp.approval_peran
            FROM man_akses.role_pengguna rp
            INNER JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.id_role_pengguna = ?
              AND rp.id_pengguna = ?
              AND rp.soft_delete = 0
              AND (rp.tgl_kadarluasa IS NULL OR rp.tgl_kadarluasa >= GETDATE())
        ";

        return DB::selectOne($sql, [$idRolePengguna, $userId]);
    }

    /**
     * Update last_active timestamp for role
     *
     * @param string $idRolePengguna
     * @return bool
     */
    public function updateLastActive(string $idRolePengguna): bool
    {
        $sql = "
            UPDATE man_akses.role_pengguna
            SET last_active = GETDATE(), last_update = GETDATE(), last_sync = GETDATE()
            WHERE id_role_pengguna = ?
        ";

        $affected = DB::update($sql, [$idRolePengguna]);

        return $affected > 0;
    }

    /**
     * Get app info by ID or slug
     *
     * @param string|null $appId Application UUID
     * @param string|null $appKey Application slug (app_slug column)
     * @return object|null
     */
    public function getAppInfo(?string $appId, ?string $appKey): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), a.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                a.app_slug,
                a.url,
                a.port,
                CONVERT(VARCHAR(36), a.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi
            FROM man_akses.aplikasi a
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = a.id_organisasi
            WHERE (a.expired_date IS NULL OR a.expired_date > GETDATE())
        ";

        if ($appId) {
            $sql .= " AND a.id_aplikasi = ?";
            return DB::selectOne($sql, [$appId]);
        }

        if ($appKey) {
            // Use app_slug column for app_key parameter
            $sql .= " AND a.app_slug = ?";
            return DB::selectOne($sql, [$appKey]);
        }

        return null;
    }

    /**
     * Check if role has menu access to app
     *
     * @param int $idPeran
     * @param string $idAplikasi
     * @return int Count of menu access
     */
    public function countMenuRoleAccess(int $idPeran, string $idAplikasi): int
    {
        $sql = "
            SELECT COUNT(*) as count
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE mr.id_peran = ?
              AND m.id_aplikasi = ?
        ";

        $result = DB::selectOne($sql, [$idPeran, $idAplikasi]);

        return $result->count ?? 0;
    }

    /**
     * Get all portal apps with categories (HYBRID approach)
     * Returns ALL apps with has_access flag to indicate accessibility
     *
     * Access is granted if:
     * - User's role org matches app's org, OR
     * - App's org is "Semua Unit", OR
     * - User's role org is "Semua Unit", OR
     * - App has no org restriction (id_organisasi IS NULL)
     *
     * @param string|null $userOrgId User's active role organization ID
     * @return array
     */
    public function getPortalApps(?string $userOrgId = null): array
    {
        // Semua Unit org ID - apps with this org are accessible by everyone
        $semuaUnitOrgId = '86942cdf-44f1-446e-8e9e-cb37bbbb16e6';

        // Build has_access CASE expression
        $hasAccessCase = "
            CASE
                WHEN a.id_organisasi IS NULL THEN 1
                WHEN LOWER(CONVERT(VARCHAR(36), a.id_organisasi)) = LOWER(?) THEN 1
        ";

        $params = [$semuaUnitOrgId];

        if ($userOrgId) {
            $hasAccessCase .= "
                WHEN LOWER(CONVERT(VARCHAR(36), a.id_organisasi)) = LOWER(?) THEN 1
                WHEN LOWER(?) = LOWER(?) THEN 1
            ";
            $params[] = $userOrgId;
            $params[] = $userOrgId;
            $params[] = $semuaUnitOrgId;
        }

        $hasAccessCase .= "
                ELSE 0
            END as has_access
        ";

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), a.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                a.ket_aplikasi,
                a.url,
                a.icon_name,
                a.icon_color,
                a.app_slug,
                a.urutan as app_urutan,
                CONVERT(VARCHAR(36), a.id_kategori) as id_kategori,
                CONVERT(VARCHAR(36), a.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                k.nm_kategori,
                k.icon_kategori,
                k.icon_color as kategori_icon_color,
                k.urutan as kategori_urutan,
                ISNULL(a.a_maintenance, 0) as a_maintenance,
                ISNULL(a.a_coming_soon, 0) as a_coming_soon,
                ISNULL(a.a_terintegrasi, 0) as a_terintegrasi,
                ISNULL(a.a_live, 0) as a_live,
                {$hasAccessCase}
            FROM man_akses.aplikasi a
            INNER JOIN man_akses.kategori_aplikasi k ON k.id_kategori = a.id_kategori
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = a.id_organisasi
            WHERE a.a_tampil_portal = 1
              AND a.expired_date IS NULL
              AND ISNULL(a.a_aktif, 1) = 1
              AND k.soft_delete = 0
            ORDER BY k.urutan, a.urutan, a.nm_aplikasi
        ";

        return DB::select($sql, $params);
    }

    /**
     * Get all categories for portal
     *
     * @return array
     */
    public function getPortalCategories(): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_kategori) as id_kategori,
                nm_kategori,
                icon_kategori,
                icon_color,
                urutan
            FROM man_akses.kategori_aplikasi
            WHERE soft_delete = 0
            ORDER BY urutan
        ";

        return DB::select($sql);
    }
}
