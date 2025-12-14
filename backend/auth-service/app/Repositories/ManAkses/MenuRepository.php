<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Menu Repository
 * Handle all menu related database operations for Manajemen Akses
 *
 * Tables:
 * - man_akses.menu: Menu items linked to applications
 * - man_akses.menu_role: Menu-Role assignments (RBAC)
 */
class MenuRepository
{
    /**
     * Get menus by aplikasi ID with tree structure
     *
     * @param string $idAplikasi
     * @param array $params [include_inactive, include_children]
     * @return array
     */
    public function getByAplikasi(string $idAplikasi, array $params = []): array
    {
        $includeInactive = $params['include_inactive'] ?? false;
        $includeRoles = $params['include_roles'] ?? false;

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file,
                m.urutan_menu,
                m.a_aktif,
                m.a_tampil,
                m.icon,
                m.level_menu,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                CONVERT(VARCHAR(36), m.id_group_menu) as id_group_menu,
                m.tgl_create,
                m.last_update,
                m.expired_date
            FROM man_akses.menu m
            WHERE m.id_aplikasi = ?
              AND m.expired_date IS NULL
        ";

        if (!$includeInactive) {
            $sql .= " AND m.a_aktif = 1";
        }

        $sql .= " ORDER BY m.level_menu ASC, m.urutan_menu ASC, m.nm_menu ASC";

        $menus = DB::select($sql, [$idAplikasi]);

        // Build tree structure
        $menuTree = $this->buildMenuTree($menus);

        // Include role assignments if requested
        if ($includeRoles) {
            $menuTree = $this->attachRolesToMenus($menuTree);
        }

        return $menuTree;
    }

    /**
     * Get flat list of menus by aplikasi (no tree structure)
     *
     * @param string $idAplikasi
     * @return array
     */
    public function getFlatByAplikasi(string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file,
                m.urutan_menu,
                m.a_aktif,
                m.a_tampil,
                m.icon,
                m.level_menu,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                CONVERT(VARCHAR(36), m.id_group_menu) as id_group_menu,
                pm.nm_menu as parent_menu_name,
                m.tgl_create,
                m.last_update
            FROM man_akses.menu m
            LEFT JOIN man_akses.menu pm ON pm.id_menu = m.id_group_menu
            WHERE m.id_aplikasi = ?
              AND m.expired_date IS NULL
            ORDER BY m.level_menu ASC, m.urutan_menu ASC, m.nm_menu ASC
        ";

        return DB::select($sql, [$idAplikasi]);
    }

    /**
     * Get menu detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), m.id_menu) as id_menu,
                m.nm_menu,
                m.nm_file,
                m.urutan_menu,
                m.a_aktif,
                m.a_tampil,
                m.icon,
                m.level_menu,
                CONVERT(VARCHAR(36), m.id_aplikasi) as id_aplikasi,
                CONVERT(VARCHAR(36), m.id_group_menu) as id_group_menu,
                m.tgl_create,
                m.last_update,
                m.expired_date,
                m.last_sync,
                a.nm_aplikasi,
                pm.nm_menu as parent_menu_name
            FROM man_akses.menu m
            LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
            LEFT JOIN man_akses.menu pm ON pm.id_menu = m.id_group_menu
            WHERE m.id_menu = ?
        ";

        $menu = DB::selectOne($sql, [$id]);

        if ($menu) {
            // Get role assignments for this menu
            $menu->roles = $this->getMenuRoles($id);
        }

        return $menu;
    }

    /**
     * Get role assignments for a menu
     *
     * @param string $idMenu
     * @return array
     */
    public function getMenuRoles(string $idMenu): array
    {
        $sql = "
            SELECT
                mr.id_peran,
                p.nm_peran,
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
     * Create new menu
     *
     * @param array $data
     * @return string ID of created menu
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.menu (
                id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil,
                icon, level_menu, id_aplikasi, id_group_menu,
                tgl_create, last_update, last_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        // Calculate level_menu based on parent
        $levelMenu = 0;
        if (!empty($data['id_group_menu'])) {
            $parent = $this->getDetail($data['id_group_menu']);
            if ($parent) {
                $levelMenu = ($parent->level_menu ?? 0) + 1;
            }
        }

        DB::insert($sql, [
            $id,
            $data['nm_menu'],
            $data['nm_file'] ?? null,
            $data['urutan_menu'] ?? 1,
            $data['a_aktif'] ?? 1,
            $data['a_tampil'] ?? 1,
            $data['icon'] ?? null,
            $levelMenu,
            $data['id_aplikasi'],
            $data['id_group_menu'] ?? null,
            $now,
            $now,
            $now,
        ]);

        return $id;
    }

    /**
     * Update existing menu
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        // Calculate level_menu based on parent
        $levelMenu = 0;
        if (!empty($data['id_group_menu'])) {
            $parent = $this->getDetail($data['id_group_menu']);
            if ($parent) {
                $levelMenu = ($parent->level_menu ?? 0) + 1;
            }
        }

        $sql = "
            UPDATE man_akses.menu SET
                nm_menu = ?,
                nm_file = ?,
                urutan_menu = ?,
                a_aktif = ?,
                a_tampil = ?,
                icon = ?,
                level_menu = ?,
                id_group_menu = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_menu = ?
        ";

        $affected = DB::update($sql, [
            $data['nm_menu'],
            $data['nm_file'] ?? null,
            $data['urutan_menu'] ?? 1,
            $data['a_aktif'] ?? 1,
            $data['a_tampil'] ?? 1,
            $data['icon'] ?? null,
            $levelMenu,
            $data['id_group_menu'] ?? null,
            $now,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete menu (soft delete via expired_date)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        // Also soft delete any child menus
        $sql = "
            UPDATE man_akses.menu SET
                expired_date = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_menu = ? OR id_group_menu = ?
        ";

        $affected = DB::update($sql, [$now, $now, $now, $id, $id]);

        return $affected > 0;
    }

    /**
     * Bulk sync menus for an aplikasi (from frontend menuConfig)
     * This will create/update menus based on the provided data
     *
     * @param string $idAplikasi
     * @param array $menus Array of menu items from frontend config
     * @return array Stats of sync operation
     */
    public function syncMenus(string $idAplikasi, array $menus): array
    {
        $created = 0;
        $updated = 0;
        $now = now()->format('Y-m-d H:i:s');

        foreach ($menus as $index => $menu) {
            $parentId = null;

            // Check if menu exists by nm_file (unique per app)
            $existing = $this->findByNmFile($idAplikasi, $menu['nm_file'] ?? $menu['href'] ?? null);

            if ($existing) {
                // Update existing
                $this->update($existing->id_menu, [
                    'nm_menu' => $menu['title'] ?? $menu['nm_menu'],
                    'nm_file' => $menu['nm_file'] ?? $menu['href'] ?? null,
                    'urutan_menu' => $menu['urutan_menu'] ?? ($index + 1),
                    'a_aktif' => $menu['a_aktif'] ?? 1,
                    'a_tampil' => $menu['a_tampil'] ?? 1,
                    'icon' => $menu['icon'] ?? null,
                    'id_group_menu' => $menu['id_group_menu'] ?? null,
                ]);
                $parentId = $existing->id_menu;
                $updated++;
            } else {
                // Create new
                $parentId = $this->create([
                    'nm_menu' => $menu['title'] ?? $menu['nm_menu'],
                    'nm_file' => $menu['nm_file'] ?? $menu['href'] ?? null,
                    'urutan_menu' => $menu['urutan_menu'] ?? ($index + 1),
                    'a_aktif' => $menu['a_aktif'] ?? 1,
                    'a_tampil' => $menu['a_tampil'] ?? 1,
                    'icon' => $menu['icon'] ?? null,
                    'id_aplikasi' => $idAplikasi,
                    'id_group_menu' => $menu['id_group_menu'] ?? null,
                ]);
                $created++;
            }

            // Process children if any
            if (!empty($menu['children'])) {
                foreach ($menu['children'] as $childIndex => $child) {
                    $childExisting = $this->findByNmFile($idAplikasi, $child['nm_file'] ?? $child['href'] ?? null);

                    if ($childExisting) {
                        $this->update($childExisting->id_menu, [
                            'nm_menu' => $child['title'] ?? $child['nm_menu'],
                            'nm_file' => $child['nm_file'] ?? $child['href'] ?? null,
                            'urutan_menu' => $child['urutan_menu'] ?? ($childIndex + 1),
                            'a_aktif' => $child['a_aktif'] ?? 1,
                            'a_tampil' => $child['a_tampil'] ?? 1,
                            'icon' => $child['icon'] ?? null,
                            'id_group_menu' => $parentId,
                        ]);
                        $updated++;
                    } else {
                        $this->create([
                            'nm_menu' => $child['title'] ?? $child['nm_menu'],
                            'nm_file' => $child['nm_file'] ?? $child['href'] ?? null,
                            'urutan_menu' => $child['urutan_menu'] ?? ($childIndex + 1),
                            'a_aktif' => $child['a_aktif'] ?? 1,
                            'a_tampil' => $child['a_tampil'] ?? 1,
                            'icon' => $child['icon'] ?? null,
                            'id_aplikasi' => $idAplikasi,
                            'id_group_menu' => $parentId,
                        ]);
                        $created++;
                    }
                }
            }
        }

        return [
            'created' => $created,
            'updated' => $updated,
            'total' => $created + $updated,
        ];
    }

    /**
     * Find menu by nm_file (path) within an aplikasi
     *
     * @param string $idAplikasi
     * @param string|null $nmFile
     * @return object|null
     */
    public function findByNmFile(string $idAplikasi, ?string $nmFile): ?object
    {
        if (empty($nmFile)) {
            return null;
        }

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_menu) as id_menu,
                nm_menu,
                nm_file,
                level_menu
            FROM man_akses.menu
            WHERE id_aplikasi = ?
              AND nm_file = ?
              AND expired_date IS NULL
        ";

        return DB::selectOne($sql, [$idAplikasi, $nmFile]);
    }

    /**
     * Get statistics for menus
     *
     * @param string|null $idAplikasi Filter by aplikasi
     * @return object
     */
    public function getStats(?string $idAplikasi = null): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_menus,
                SUM(CASE WHEN m.a_aktif = 1 THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN m.a_aktif = 0 THEN 1 ELSE 0 END) as total_nonaktif,
                SUM(CASE WHEN m.level_menu = 0 THEN 1 ELSE 0 END) as total_parent,
                SUM(CASE WHEN m.level_menu > 0 THEN 1 ELSE 0 END) as total_child,
                COUNT(DISTINCT m.id_aplikasi) as total_aplikasi
            FROM man_akses.menu m
            WHERE m.expired_date IS NULL
        ";

        $bindings = [];

        if ($idAplikasi) {
            $sql .= " AND m.id_aplikasi = ?";
            $bindings[] = $idAplikasi;
        }

        return DB::selectOne($sql, $bindings);
    }

    /**
     * Build tree structure from flat menu list
     *
     * @param array $menus
     * @return array
     */
    private function buildMenuTree(array $menus): array
    {
        $menuMap = [];
        $tree = [];

        // First pass: create map
        foreach ($menus as $menu) {
            $menu->children = [];
            $menuMap[$menu->id_menu] = $menu;
        }

        // Second pass: build tree
        foreach ($menus as $menu) {
            if ($menu->id_group_menu && isset($menuMap[$menu->id_group_menu])) {
                $menuMap[$menu->id_group_menu]->children[] = $menu;
            } else {
                $tree[] = $menu;
            }
        }

        return $tree;
    }

    /**
     * Attach role assignments to menu tree
     *
     * @param array $menus
     * @return array
     */
    private function attachRolesToMenus(array $menus): array
    {
        foreach ($menus as $menu) {
            $menu->roles = $this->getMenuRoles($menu->id_menu);

            if (!empty($menu->children)) {
                $menu->children = $this->attachRolesToMenus($menu->children);
            }
        }

        return $menus;
    }

    /**
     * Generate UUID for new record
     */
    private function generateUuid(): string
    {
        return strtoupper(sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        ));
    }
}
