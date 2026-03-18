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
                uo.nm_lemb as nm_organisasi,
                ISNULL(a.a_filter_organisasi, 0) as a_filter_organisasi
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
              AND ISNULL(mr.soft_delete, 0) = 0
              AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
        ";

        $result = DB::selectOne($sql, [$idPeran, $idAplikasi]);

        return $result->count ?? 0;
    }

    /**
     * Get all portal apps with categories (RBAC-based approach)
     * Returns ALL apps with has_access flag based on menu_role (RBAC)
     *
     * Access is granted if:
     * - Role has at least one menu_role entry for the application
     * - Super roles (from config) have access to all apps
     *
     * Note: Organization is NOT used for access control.
     * Organization on aplikasi is for administrative grouping only.
     *
     * @param int|null $idPeran User's active role ID
     * @return array
     */
    public function getPortalApps(?int $idPeran = null): array
    {
        // Super roles that have access to all apps (from config)
        $superRoles = config('auth.super_roles', [1, 107]);

        // Build has_access based on menu_role (RBAC)
        if ($idPeran && in_array($idPeran, $superRoles)) {
            // Super roles have access to all apps
            $hasAccessCase = "1 as has_access";
            $params = [];
        } elseif ($idPeran) {
            // Regular roles: check if they have menu_role for this app
            $hasAccessCase = "
                CASE
                    WHEN EXISTS (
                        SELECT 1 FROM man_akses.menu_role mr
                        INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
                        WHERE m.id_aplikasi = a.id_aplikasi
                          AND mr.id_peran = ?
                          AND ISNULL(mr.soft_delete, 0) = 0
                    ) THEN 1
                    ELSE 0
                END as has_access
            ";
            $params = [$idPeran];
        } else {
            // No role selected - no access to any app
            $hasAccessCase = "0 as has_access";
            $params = [];
        }

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

    /**
     * Get aggregated CRUD permissions for a role on an application
     * Aggregates permissions from all menus the role has access to in the app
     *
     * @param int $idPeran Role ID
     * @param string $idAplikasi Application UUID
     * @return object|null
     */
    public function getAppPermissions(int $idPeran, string $idAplikasi): ?object
    {
        $sql = "
            SELECT
                MAX(CAST(ISNULL(mr.a_boleh_show, 0) AS INT)) as can_show,
                MAX(CAST(ISNULL(mr.a_boleh_insert, 0) AS INT)) as can_insert,
                MAX(CAST(ISNULL(mr.a_boleh_update, 0) AS INT)) as can_update,
                MAX(CAST(ISNULL(mr.a_boleh_delete, 0) AS INT)) as can_delete,
                MAX(CAST(ISNULL(mr.a_boleh_sanggah, 0) AS INT)) as can_reject,
                MAX(CAST(ISNULL(mr.approval_menu, 0) AS INT)) as can_approve,
                COUNT(*) as menu_count
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE mr.id_peran = ?
              AND m.id_aplikasi = ?
              AND ISNULL(mr.soft_delete, 0) = 0
              AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
              AND ISNULL(m.a_aktif, 1) = 1
        ";

        return DB::selectOne($sql, [$idPeran, $idAplikasi]);
    }

    /**
     * Get detailed menu permissions for a role on an application
     * Returns individual menu permissions (useful for fine-grained control)
     *
     * @param int $idPeran Role ID
     * @param string $idAplikasi Application UUID
     * @return array
     */
    public function getMenuPermissions(int $idPeran, string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file as url_menu,
                CAST(ISNULL(mr.a_boleh_show, 0) AS INT) as can_show,
                CAST(ISNULL(mr.a_boleh_insert, 0) AS INT) as can_insert,
                CAST(ISNULL(mr.a_boleh_update, 0) AS INT) as can_update,
                CAST(ISNULL(mr.a_boleh_delete, 0) AS INT) as can_delete,
                CAST(ISNULL(mr.a_boleh_sanggah, 0) AS INT) as can_reject,
                CAST(ISNULL(mr.approval_menu, 0) AS INT) as can_approve,
                mr.akses_menu
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE mr.id_peran = ?
              AND m.id_aplikasi = ?
              AND ISNULL(mr.soft_delete, 0) = 0
              AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
              AND ISNULL(m.a_aktif, 1) = 1
            ORDER BY m.urutan_menu, m.nm_menu
        ";

        return DB::select($sql, [$idPeran, $idAplikasi]);
    }

    /**
     * Get user's accessible menus for an application based on RBAC
     * Returns flat menu list with permissions (no parent hierarchy - table has no id_parent)
     *
     * Note: Menus are hidden if:
     * - The menu itself has a_aktif = 0
     * - The menu's parent (id_group_menu) has a_aktif = 0
     *
     * @param int $idPeran Role ID
     * @param string $idAplikasi Application UUID
     * @return array
     */
    public function getUserMenus(int $idPeran, string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file as href,
                m.icon,
                m.level_menu,
                m.urutan_menu,
                CONVERT(VARCHAR(36), m.id_group_menu) as id_parent,
                CAST(ISNULL(m.a_tampil, 1) AS INT) as a_tampil,
                CAST(ISNULL(mr.a_boleh_show, 0) AS INT) as can_show,
                CAST(ISNULL(mr.a_boleh_insert, 0) AS INT) as can_insert,
                CAST(ISNULL(mr.a_boleh_update, 0) AS INT) as can_update,
                CAST(ISNULL(mr.a_boleh_delete, 0) AS INT) as can_delete,
                CAST(ISNULL(mr.a_boleh_sanggah, 0) AS INT) as can_reject,
                CAST(ISNULL(mr.approval_menu, 0) AS INT) as can_approve
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            LEFT JOIN man_akses.menu parent ON parent.id_menu = m.id_group_menu
            WHERE mr.id_peran = ?
              AND m.id_aplikasi = ?
              AND ISNULL(mr.soft_delete, 0) = 0
              AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
              AND ISNULL(m.a_aktif, 1) = 1
              AND (m.id_group_menu IS NULL OR ISNULL(parent.a_aktif, 1) = 1)
              AND ISNULL(mr.a_boleh_show, 0) = 1
            ORDER BY m.level_menu ASC, m.urutan_menu ASC, m.nm_menu ASC
        ";

        return DB::select($sql, [$idPeran, $idAplikasi]);
    }

    /**
     * Get ALL menus for an application (for super roles)
     * Super roles have access to all menus regardless of menu_role
     *
     * Note: Menus are hidden if:
     * - The menu itself has a_aktif = 0
     * - The menu's parent (id_group_menu) has a_aktif = 0
     *
     * @param string $idAplikasi Application UUID
     * @return array
     */
    public function getAllAppMenus(string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file as href,
                m.icon,
                m.level_menu,
                m.urutan_menu,
                CONVERT(VARCHAR(36), m.id_group_menu) as id_parent,
                CAST(ISNULL(m.a_tampil, 1) AS INT) as a_tampil,
                1 as can_show,
                1 as can_insert,
                1 as can_update,
                1 as can_delete,
                1 as can_reject,
                1 as can_approve
            FROM man_akses.menu m
            LEFT JOIN man_akses.menu parent ON parent.id_menu = m.id_group_menu
            WHERE m.id_aplikasi = ?
              AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
              AND ISNULL(m.a_aktif, 1) = 1
              AND (m.id_group_menu IS NULL OR ISNULL(parent.a_aktif, 1) = 1)
            ORDER BY m.level_menu ASC, m.urutan_menu ASC, m.nm_menu ASC
        ";

        return DB::select($sql, [$idAplikasi]);
    }

    /**
     * Get all menu permissions for a role across all applications
     * Used to build a full permissions map cached per user
     *
     * @param int $idPeran Role ID
     * @return array
     */
    public function getAllMenuPermissions(int $idPeran): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_aplikasi) AS app_id,
                m.nm_file AS url_menu,
                ISNULL(mr.a_boleh_show, 0) AS can_show,
                ISNULL(mr.a_boleh_insert, 0) AS can_insert,
                ISNULL(mr.a_boleh_update, 0) AS can_update,
                ISNULL(mr.a_boleh_delete, 0) AS can_delete
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE mr.id_peran = ?
              AND ISNULL(mr.soft_delete, 0) = 0
              AND m.a_aktif = 1
            ORDER BY m.id_aplikasi, m.urutan_menu
        ";
        return DB::select($sql, [$idPeran]);
    }

    /**
     * Check if a role is universal (bypass organisasi filter)
     */
    public function isUniversalRole(int $idPeran): bool
    {
        $result = DB::selectOne(
            "SELECT a_universal FROM man_akses.peran WHERE id_peran = ? AND expired_date IS NULL",
            [$idPeran]
        );

        return $result && $result->a_universal == 1;
    }

    /**
     * Check if an organisation is whitelisted for an application
     * Also checks parent organisations if a_include_children is enabled
     */
    public function isOrgWhitelisted(string $idAplikasi, ?string $idOrganisasi): bool
    {
        if (!$idOrganisasi) {
            return false;
        }

        // Direct match
        $direct = DB::selectOne(
            "SELECT COUNT(*) as cnt FROM man_akses.aplikasi_organisasi
             WHERE id_aplikasi = ? AND id_organisasi = ? AND ISNULL(soft_delete, 0) = 0",
            [$idAplikasi, $idOrganisasi]
        );

        if ($direct && $direct->cnt > 0) {
            return true;
        }

        // Check if user's org is a child of a whitelisted org (a_include_children = 1)
        $parentMatch = DB::selectOne(
            "SELECT COUNT(*) as cnt FROM man_akses.aplikasi_organisasi ao
             INNER JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ?
             WHERE ao.id_aplikasi = ?
               AND ao.a_include_children = 1
               AND ISNULL(ao.soft_delete, 0) = 0
               AND (uo.id_induk_organisasi = ao.id_organisasi)",
            [$idOrganisasi, $idAplikasi]
        );

        return $parentMatch && $parentMatch->cnt > 0;
    }

    /**
     * Get whitelisted organisations for an application
     */
    public function getAppOrganisations(string $idAplikasi): array
    {
        $sql = "
            SELECT ao.id_app_org, ao.id_organisasi, ao.a_include_children, ao.ket,
                   uo.nm_lemb as nm_organisasi
            FROM man_akses.aplikasi_organisasi ao
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ao.id_organisasi
            WHERE ao.id_aplikasi = ? AND ISNULL(ao.soft_delete, 0) = 0
            ORDER BY uo.nm_lemb
        ";

        return DB::select($sql, [$idAplikasi]);
    }
}
