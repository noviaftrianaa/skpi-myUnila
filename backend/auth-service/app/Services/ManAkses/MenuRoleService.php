<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\MenuRoleRepository;
use App\Repositories\ManAkses\MenuRepository;
use Illuminate\Support\Facades\Log;

/**
 * Menu Role Service
 * Business logic for menu_role (RBAC) operations
 */
class MenuRoleService
{
    protected MenuRoleRepository $menuRoleRepository;
    protected MenuRepository $menuRepository;

    public function __construct(
        MenuRoleRepository $menuRoleRepository,
        MenuRepository $menuRepository
    ) {
        $this->menuRoleRepository = $menuRoleRepository;
        $this->menuRepository = $menuRepository;
    }

    /**
     * Get list of menu_role assignments with pagination
     *
     * @param array $params
     * @return array
     */
    public function getList(array $params = []): array
    {
        return $this->menuRoleRepository->getList($params);
    }

    /**
     * Get roles assigned to a specific menu
     *
     * @param string $idMenu
     * @return array
     */
    public function getByMenu(string $idMenu): array
    {
        // Verify menu exists
        $menu = $this->menuRepository->getDetail($idMenu);
        if (!$menu) {
            throw new \Exception('Menu not found', 404);
        }

        $roles = $this->menuRoleRepository->getByMenu($idMenu);

        return [
            'menu' => [
                'id_menu' => $menu->id_menu,
                'nm_menu' => $menu->nm_menu,
                'id_aplikasi' => $menu->id_aplikasi,
                'nm_aplikasi' => $menu->nm_aplikasi,
            ],
            'roles' => $roles,
            'total' => count($roles),
        ];
    }

    /**
     * Get menus assigned to a specific role
     *
     * @param int $idPeran
     * @param string|null $idAplikasi
     * @return array
     */
    public function getByRole(int $idPeran, ?string $idAplikasi = null): array
    {
        $menus = $this->menuRoleRepository->getByRole($idPeran, $idAplikasi);

        return [
            'id_peran' => $idPeran,
            'id_aplikasi' => $idAplikasi,
            'menus' => $menus,
            'total' => count($menus),
        ];
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
        $assignment = $this->menuRoleRepository->getOne($idMenu, $idPeran);

        if (!$assignment) {
            throw new \Exception('Menu role assignment not found', 404);
        }

        if ($assignment->soft_delete) {
            throw new \Exception('Menu role assignment has been deleted', 404);
        }

        return $assignment;
    }

    /**
     * Create or restore menu_role assignment
     *
     * @param array $data
     * @param string $idUpdater
     * @return array
     */
    public function create(array $data, string $idUpdater): array
    {
        // Validate menu exists
        $menu = $this->menuRepository->getDetail($data['id_menu']);
        if (!$menu) {
            throw new \Exception('Menu not found', 404);
        }

        $success = $this->menuRoleRepository->create($data, $idUpdater);

        if (!$success) {
            throw new \Exception('Failed to create menu role assignment', 500);
        }

        Log::info('Menu role created', [
            'id_menu' => $data['id_menu'],
            'id_peran' => $data['id_peran'],
            'id_updater' => $idUpdater,
        ]);

        return [
            'id_menu' => $data['id_menu'],
            'id_peran' => $data['id_peran'],
            'message' => 'Menu role assignment created successfully',
        ];
    }

    /**
     * Update menu_role assignment
     *
     * @param string $idMenu
     * @param int $idPeran
     * @param array $data
     * @param string $idUpdater
     * @return array
     */
    public function update(string $idMenu, int $idPeran, array $data, string $idUpdater): array
    {
        // Verify assignment exists
        $existing = $this->menuRoleRepository->getOne($idMenu, $idPeran);
        if (!$existing || $existing->soft_delete) {
            throw new \Exception('Menu role assignment not found', 404);
        }

        $success = $this->menuRoleRepository->update($idMenu, $idPeran, $data, $idUpdater);

        if (!$success) {
            throw new \Exception('Failed to update menu role assignment', 500);
        }

        Log::info('Menu role updated', [
            'id_menu' => $idMenu,
            'id_peran' => $idPeran,
            'id_updater' => $idUpdater,
        ]);

        return [
            'id_menu' => $idMenu,
            'id_peran' => $idPeran,
            'message' => 'Menu role assignment updated successfully',
        ];
    }

    /**
     * Delete (soft) menu_role assignment
     *
     * @param string $idMenu
     * @param int $idPeran
     * @param string $idUpdater
     * @return array
     */
    public function delete(string $idMenu, int $idPeran, string $idUpdater): array
    {
        // Verify assignment exists
        $existing = $this->menuRoleRepository->getOne($idMenu, $idPeran);
        if (!$existing) {
            throw new \Exception('Menu role assignment not found', 404);
        }

        if ($existing->soft_delete) {
            throw new \Exception('Menu role assignment already deleted', 400);
        }

        $success = $this->menuRoleRepository->delete($idMenu, $idPeran, $idUpdater);

        if (!$success) {
            throw new \Exception('Failed to delete menu role assignment', 500);
        }

        Log::info('Menu role deleted', [
            'id_menu' => $idMenu,
            'id_peran' => $idPeran,
            'id_updater' => $idUpdater,
        ]);

        return [
            'id_menu' => $idMenu,
            'id_peran' => $idPeran,
            'message' => 'Menu role assignment deleted successfully',
        ];
    }

    /**
     * Bulk assign roles to a menu
     *
     * @param string $idMenu
     * @param array $roleIds
     * @param array $permissions
     * @param string $idUpdater
     * @return array
     */
    public function bulkAssignRolesToMenu(string $idMenu, array $roleIds, array $permissions, string $idUpdater): array
    {
        // Validate menu exists
        $menu = $this->menuRepository->getDetail($idMenu);
        if (!$menu) {
            throw new \Exception('Menu not found', 404);
        }

        $count = $this->menuRoleRepository->bulkAssignRolesToMenu($idMenu, $roleIds, $permissions, $idUpdater);

        Log::info('Bulk roles assigned to menu', [
            'id_menu' => $idMenu,
            'role_count' => $count,
            'id_updater' => $idUpdater,
        ]);

        return [
            'id_menu' => $idMenu,
            'assigned_count' => $count,
            'message' => "Successfully assigned {$count} roles to menu",
        ];
    }

    /**
     * Bulk assign menus to a role
     *
     * @param int $idPeran
     * @param array $menuIds
     * @param array $permissions
     * @param string $idUpdater
     * @return array
     */
    public function bulkAssignMenusToRole(int $idPeran, array $menuIds, array $permissions, string $idUpdater): array
    {
        $count = $this->menuRoleRepository->bulkAssignMenusToRole($idPeran, $menuIds, $permissions, $idUpdater);

        Log::info('Bulk menus assigned to role', [
            'id_peran' => $idPeran,
            'menu_count' => $count,
            'id_updater' => $idUpdater,
        ]);

        return [
            'id_peran' => $idPeran,
            'assigned_count' => $count,
            'message' => "Successfully assigned {$count} menus to role",
        ];
    }

    /**
     * Get RBAC statistics
     *
     * @return object
     */
    public function getStats(): object
    {
        return $this->menuRoleRepository->getStats();
    }
}
