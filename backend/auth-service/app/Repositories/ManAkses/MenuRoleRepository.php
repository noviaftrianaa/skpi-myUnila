<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Menu Role Repository
 * Handle menu_role (RBAC) database operations for Manajemen Akses
 *
 * Tables:
 * - man_akses.menu_role: Menu-Role assignments (RBAC)
 */
class MenuRoleRepository
{
    /**
     * Get all menu_role with pagination and filters
     *
     * @param array $params
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $offset = ($page - 1) * $limit;
        $search = $params['search'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $idPeran = $params['id_peran'] ?? null;
        $idMenu = $params['id_menu'] ?? null;
        $sortBy = $params['sort_by'] ?? 'nm_aplikasi'; // column to sort by
        $sortOrder = $params['sort_order'] ?? 'asc'; // 'asc' or 'desc'

        // Validate sort column to prevent SQL injection
        $allowedSortColumns = [
            'nm_menu' => 'm.nm_menu',
            'nm_peran' => 'p.nm_peran',
            'nm_aplikasi' => 'a.nm_aplikasi',
            'akses_menu' => 'mr.akses_menu',
            'tgl_create' => 'mr.tgl_create',
            'last_update' => 'mr.last_update',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'a.nm_aplikasi';
        $sortDirection = strtolower($sortOrder) === 'desc' ? 'DESC' : 'ASC';

        // Filter: only show active menu_role records
        // Note: expired_date filter for aplikasi is handled in INNER JOIN clause
        $baseWhere = " WHERE mr.soft_delete = 0";
        $bindings = [];

        if ($idAplikasi) {
            $baseWhere .= " AND m.id_aplikasi = ?";
            $bindings[] = $idAplikasi;
        }

        if ($idPeran) {
            $baseWhere .= " AND mr.id_peran = ?";
            $bindings[] = $idPeran;
        }

        if ($idMenu) {
            $baseWhere .= " AND mr.id_menu = ?";
            $bindings[] = $idMenu;
        }

        if ($search) {
            $baseWhere .= " AND (m.nm_menu LIKE ? OR p.nm_peran LIKE ?)";
            $bindings[] = "%{$search}%";
            $bindings[] = "%{$search}%";
        }

        // Get total count
        // Use INNER JOIN for aplikasi to ensure only valid (non-deleted) aplikasi are included
        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
            INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi AND a.expired_date IS NULL
            {$baseWhere}
        ";

        $countResult = DB::selectOne($countSql, $bindings);
        $total = $countResult->total ?? 0;

        // Get paginated data
        // Use INNER JOIN for aplikasi to ensure only valid (non-deleted) aplikasi are included
        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), mr.id_menu) as id_menu,
                mr.id_peran,
                m.nm_menu,
                p.nm_peran,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                mr.akses_menu,
                mr.a_boleh_show,
                mr.a_boleh_insert,
                mr.a_boleh_update,
                mr.a_boleh_delete,
                mr.a_boleh_sanggah,
                mr.approval_menu,
                mr.tgl_create,
                mr.last_update
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
            INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi AND a.expired_date IS NULL
            {$baseWhere}
            ORDER BY {$sortColumn} {$sortDirection}, m.nm_menu ASC, p.nm_peran ASC
            OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
        ";

        $data = DB::select($dataSql, $bindings);

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ];
    }

    /**
     * Get roles assigned to a menu
     *
     * @param string $idMenu
     * @return array
     */
    public function getByMenu(string $idMenu): array
    {
        $sql = "
            SELECT
                mr.id_peran,
                p.nm_peran,
                p.ket_peran,
                mr.akses_menu,
                mr.a_boleh_show,
                mr.a_boleh_insert,
                mr.a_boleh_update,
                mr.a_boleh_delete,
                mr.a_boleh_sanggah,
                mr.approval_menu,
                mr.tgl_create,
                mr.last_update
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
            WHERE mr.id_menu = ?
              AND mr.soft_delete = 0
            ORDER BY p.nm_peran ASC
        ";

        return DB::select($sql, [$idMenu]);
    }

    /**
     * Get menus assigned to a role
     *
     * @param int $idPeran
     * @param string|null $idAplikasi Filter by aplikasi
     * @return array
     */
    public function getByRole(int $idPeran, ?string $idAplikasi = null): array
    {
        $bindings = [$idPeran];
        $whereAplikasi = "";

        if ($idAplikasi) {
            $whereAplikasi = " AND m.id_aplikasi = ?";
            $bindings[] = $idAplikasi;
        }

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), mr.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file,
                m.icon,
                m.level_menu,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                mr.akses_menu,
                mr.a_boleh_show,
                mr.a_boleh_insert,
                mr.a_boleh_update,
                mr.a_boleh_delete,
                mr.a_boleh_sanggah,
                mr.approval_menu,
                mr.tgl_create,
                mr.last_update
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi AND a.expired_date IS NULL
            WHERE mr.id_peran = ?
              AND mr.soft_delete = 0
              AND m.expired_date IS NULL
              {$whereAplikasi}
            ORDER BY a.nm_aplikasi ASC, m.level_menu ASC, m.urutan_menu ASC
        ";

        return DB::select($sql, $bindings);
    }

    /**
     * Get single menu_role assignment
     *
     * @param string $idMenu
     * @param int $idPeran
     * @return object|null
     */
    public function getOne(string $idMenu, int $idPeran): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), mr.id_menu) as id_menu,
                mr.id_peran,
                m.nm_menu,
                p.nm_peran,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                mr.akses_menu,
                mr.a_boleh_show,
                mr.a_boleh_insert,
                mr.a_boleh_update,
                mr.a_boleh_delete,
                mr.a_boleh_sanggah,
                mr.approval_menu,
                mr.soft_delete,
                mr.tgl_create,
                mr.last_update,
                CONVERT(VARCHAR(36), mr.id_updater) as id_updater
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
            LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
            WHERE mr.id_menu = ? AND mr.id_peran = ?
        ";

        return DB::selectOne($sql, [$idMenu, $idPeran]);
    }

    /**
     * Check if menu_role exists
     *
     * @param string $idMenu
     * @param int $idPeran
     * @return bool
     */
    public function exists(string $idMenu, int $idPeran): bool
    {
        $sql = "
            SELECT 1 FROM man_akses.menu_role
            WHERE id_menu = ? AND id_peran = ?
        ";

        return DB::selectOne($sql, [$idMenu, $idPeran]) !== null;
    }

    /**
     * Create menu_role assignment
     *
     * @param array $data
     * @param string $idUpdater
     * @return bool
     */
    public function create(array $data, string $idUpdater): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        // Check if exists (might be soft deleted)
        if ($this->exists($data['id_menu'], $data['id_peran'])) {
            // Restore if soft deleted
            $sql = "
                UPDATE man_akses.menu_role SET
                    akses_menu = ?,
                    a_boleh_show = ?,
                    a_boleh_insert = ?,
                    a_boleh_update = ?,
                    a_boleh_delete = ?,
                    a_boleh_sanggah = ?,
                    approval_menu = ?,
                    soft_delete = 0,
                    last_update = ?,
                    last_sync = ?,
                    id_updater = ?
                WHERE id_menu = ? AND id_peran = ?
            ";

            DB::update($sql, [
                $data['akses_menu'] ?? 'full',
                $data['a_boleh_show'] ?? 1,
                $data['a_boleh_insert'] ?? 0,
                $data['a_boleh_update'] ?? 0,
                $data['a_boleh_delete'] ?? 0,
                $data['a_boleh_sanggah'] ?? 0,
                $data['approval_menu'] ?? 0,
                $now,
                $now,
                $idUpdater,
                $data['id_menu'],
                $data['id_peran'],
            ]);

            return true;
        }

        $sql = "
            INSERT INTO man_akses.menu_role (
                id_peran, id_menu, akses_menu,
                a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
                a_boleh_sanggah, approval_menu,
                tgl_create, last_update, soft_delete, last_sync, id_updater
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        ";

        DB::insert($sql, [
            $data['id_peran'],
            $data['id_menu'],
            $data['akses_menu'] ?? 'full',
            $data['a_boleh_show'] ?? 1,
            $data['a_boleh_insert'] ?? 0,
            $data['a_boleh_update'] ?? 0,
            $data['a_boleh_delete'] ?? 0,
            $data['a_boleh_sanggah'] ?? 0,
            $data['approval_menu'] ?? 0,
            $now,
            $now,
            $now,
            $idUpdater,
        ]);

        return true;
    }

    /**
     * Update menu_role assignment
     *
     * @param string $idMenu
     * @param int $idPeran
     * @param array $data
     * @param string $idUpdater
     * @return bool
     */
    public function update(string $idMenu, int $idPeran, array $data, string $idUpdater): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.menu_role SET
                akses_menu = ?,
                a_boleh_show = ?,
                a_boleh_insert = ?,
                a_boleh_update = ?,
                a_boleh_delete = ?,
                a_boleh_sanggah = ?,
                approval_menu = ?,
                last_update = ?,
                last_sync = ?,
                id_updater = ?
            WHERE id_menu = ? AND id_peran = ? AND soft_delete = 0
        ";

        $affected = DB::update($sql, [
            $data['akses_menu'] ?? 'full',
            $data['a_boleh_show'] ?? 1,
            $data['a_boleh_insert'] ?? 0,
            $data['a_boleh_update'] ?? 0,
            $data['a_boleh_delete'] ?? 0,
            $data['a_boleh_sanggah'] ?? 0,
            $data['approval_menu'] ?? 0,
            $now,
            $now,
            $idUpdater,
            $idMenu,
            $idPeran,
        ]);

        return $affected > 0;
    }

    /**
     * Soft delete menu_role assignment
     *
     * @param string $idMenu
     * @param int $idPeran
     * @param string $idUpdater
     * @return bool
     */
    public function delete(string $idMenu, int $idPeran, string $idUpdater): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.menu_role SET
                soft_delete = 1,
                last_update = ?,
                id_updater = ?
            WHERE id_menu = ? AND id_peran = ?
        ";

        $affected = DB::update($sql, [$now, $idUpdater, $idMenu, $idPeran]);

        return $affected > 0;
    }

    /**
     * Bulk assign roles to a menu
     *
     * @param string $idMenu
     * @param array $roleIds
     * @param array $permissions Default permissions
     * @param string $idUpdater
     * @return int Number of assignments created
     */
    public function bulkAssignRolesToMenu(string $idMenu, array $roleIds, array $permissions, string $idUpdater): int
    {
        $count = 0;

        foreach ($roleIds as $idPeran) {
            $data = array_merge($permissions, [
                'id_menu' => $idMenu,
                'id_peran' => $idPeran,
            ]);

            if ($this->create($data, $idUpdater)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Bulk assign menus to a role
     *
     * @param int $idPeran
     * @param array $menuIds
     * @param array $permissions Default permissions
     * @param string $idUpdater
     * @return int Number of assignments created
     */
    public function bulkAssignMenusToRole(int $idPeran, array $menuIds, array $permissions, string $idUpdater): int
    {
        $count = 0;

        foreach ($menuIds as $idMenu) {
            $data = array_merge($permissions, [
                'id_menu' => $idMenu,
                'id_peran' => $idPeran,
            ]);

            if ($this->create($data, $idUpdater)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Get statistics
     *
     * @return object
     */
    public function getStats(): object
    {
        // Use INNER JOIN to only count menu_role for non-deleted aplikasi
        $sql = "
            SELECT
                COUNT(*) as total_assignments,
                COUNT(DISTINCT mr.id_menu) as total_menus_with_roles,
                COUNT(DISTINCT mr.id_peran) as total_roles_with_menus,
                COUNT(DISTINCT m.id_aplikasi) as total_aplikasi_with_rbac
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi AND a.expired_date IS NULL
            WHERE mr.soft_delete = 0
        ";

        return DB::selectOne($sql);
    }
}
