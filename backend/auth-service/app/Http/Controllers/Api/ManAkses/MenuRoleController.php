<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\MenuRoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Menu Role Controller
 * API endpoints for RBAC (menu_role) management
 */
class MenuRoleController extends Controller
{
    protected MenuRoleService $menuRoleService;

    public function __construct(MenuRoleService $menuRoleService)
    {
        $this->menuRoleService = $menuRoleService;
    }

    /**
     * Get list of menu_role assignments
     * GET /manakses/menu-role
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => $request->input('page', 1),
                'limit' => $request->input('limit', 10),
                'search' => $request->input('search'),
                'id_aplikasi' => $request->input('id_aplikasi'),
                'id_peran' => $request->input('id_peran'),
                'id_menu' => $request->input('id_menu'),
                'sort_by' => $request->input('sort_by'), // column name
                'sort_order' => $request->input('sort_order'), // 'asc', 'desc'
            ];

            $result = $this->menuRoleService->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Menu role assignments retrieved successfully',
                'data' => $result['data'],
                'pagination' => [
                    'total' => $result['total'],
                    'page' => $result['page'],
                    'limit' => $result['limit'],
                    'total_pages' => $result['total_pages'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu role assignments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get roles assigned to a menu
     * GET /manakses/menu-role/by-menu/{idMenu}
     */
    public function byMenu(string $idMenu): JsonResponse
    {
        try {
            $result = $this->menuRoleService->getByMenu($idMenu);

            return response()->json([
                'success' => true,
                'message' => 'Menu roles retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Get menus assigned to a role
     * GET /manakses/menu-role/by-role/{idPeran}
     */
    public function byRole(Request $request, int $idPeran): JsonResponse
    {
        try {
            $idAplikasi = $request->input('id_aplikasi');
            $result = $this->menuRoleService->getByRole($idPeran, $idAplikasi);

            return response()->json([
                'success' => true,
                'message' => 'Role menus retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Get single menu_role assignment
     * GET /manakses/menu-role/{idMenu}/{idPeran}
     */
    public function show(string $idMenu, int $idPeran): JsonResponse
    {
        try {
            $result = $this->menuRoleService->getOne($idMenu, $idPeran);

            return response()->json([
                'success' => true,
                'message' => 'Menu role assignment retrieved successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Create menu_role assignment
     * POST /manakses/menu-role
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_menu' => 'required|string|max:36',
                'id_peran' => 'required|integer',
                'akses_menu' => 'nullable|string|max:50',
                'a_boleh_show' => 'nullable|boolean',
                'a_boleh_insert' => 'nullable|boolean',
                'a_boleh_update' => 'nullable|boolean',
                'a_boleh_delete' => 'nullable|boolean',
                'a_boleh_sanggah' => 'nullable|boolean',
                'approval_menu' => 'nullable|boolean',
            ]);

            // Convert booleans to integers
            foreach (['a_boleh_show', 'a_boleh_insert', 'a_boleh_update', 'a_boleh_delete', 'a_boleh_sanggah', 'approval_menu'] as $field) {
                if (isset($validated[$field])) {
                    $validated[$field] = $validated[$field] ? 1 : 0;
                }
            }

            $idUpdater = $request->attributes->get('user_id', '00000000-0000-0000-0000-000000000000');
            $result = $this->menuRoleService->create($validated, $idUpdater);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Update menu_role assignment
     * PUT /manakses/menu-role/{idMenu}/{idPeran}
     */
    public function update(Request $request, string $idMenu, int $idPeran): JsonResponse
    {
        try {
            $validated = $request->validate([
                'akses_menu' => 'nullable|string|max:50',
                'a_boleh_show' => 'nullable|boolean',
                'a_boleh_insert' => 'nullable|boolean',
                'a_boleh_update' => 'nullable|boolean',
                'a_boleh_delete' => 'nullable|boolean',
                'a_boleh_sanggah' => 'nullable|boolean',
                'approval_menu' => 'nullable|boolean',
            ]);

            // Convert booleans to integers
            foreach (['a_boleh_show', 'a_boleh_insert', 'a_boleh_update', 'a_boleh_delete', 'a_boleh_sanggah', 'approval_menu'] as $field) {
                if (isset($validated[$field])) {
                    $validated[$field] = $validated[$field] ? 1 : 0;
                }
            }

            $idUpdater = $request->attributes->get('user_id', '00000000-0000-0000-0000-000000000000');
            $result = $this->menuRoleService->update($idMenu, $idPeran, $validated, $idUpdater);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Delete menu_role assignment
     * DELETE /manakses/menu-role/{idMenu}/{idPeran}
     */
    public function destroy(string $idMenu, int $idPeran, Request $request): JsonResponse
    {
        try {
            $idUpdater = $request->attributes->get('user_id', '00000000-0000-0000-0000-000000000000');
            $result = $this->menuRoleService->delete($idMenu, $idPeran, $idUpdater);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Bulk assign roles to a menu
     * POST /manakses/menu-role/bulk-assign-roles
     */
    public function bulkAssignRoles(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_menu' => 'required|string|max:36',
                'role_ids' => 'required|array|min:1',
                'role_ids.*' => 'integer',
                'permissions' => 'nullable|array',
                'permissions.akses_menu' => 'nullable|string|max:50',
                'permissions.a_boleh_show' => 'nullable|boolean',
                'permissions.a_boleh_insert' => 'nullable|boolean',
                'permissions.a_boleh_update' => 'nullable|boolean',
                'permissions.a_boleh_delete' => 'nullable|boolean',
                'permissions.a_boleh_sanggah' => 'nullable|boolean',
                'permissions.approval_menu' => 'nullable|boolean',
            ]);

            $permissions = $validated['permissions'] ?? [];

            // Convert booleans to integers
            foreach (['a_boleh_show', 'a_boleh_insert', 'a_boleh_update', 'a_boleh_delete', 'a_boleh_sanggah', 'approval_menu'] as $field) {
                if (isset($permissions[$field])) {
                    $permissions[$field] = $permissions[$field] ? 1 : 0;
                }
            }

            $idUpdater = $request->attributes->get('user_id', '00000000-0000-0000-0000-000000000000');
            $result = $this->menuRoleService->bulkAssignRolesToMenu(
                $validated['id_menu'],
                $validated['role_ids'],
                $permissions,
                $idUpdater
            );

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Bulk assign menus to a role
     * POST /manakses/menu-role/bulk-assign-menus
     */
    public function bulkAssignMenus(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_peran' => 'required|integer',
                'menu_ids' => 'required|array|min:1',
                'menu_ids.*' => 'string|max:36',
                'permissions' => 'nullable|array',
                'permissions.akses_menu' => 'nullable|string|max:50',
                'permissions.a_boleh_show' => 'nullable|boolean',
                'permissions.a_boleh_insert' => 'nullable|boolean',
                'permissions.a_boleh_update' => 'nullable|boolean',
                'permissions.a_boleh_delete' => 'nullable|boolean',
                'permissions.a_boleh_sanggah' => 'nullable|boolean',
                'permissions.approval_menu' => 'nullable|boolean',
            ]);

            $permissions = $validated['permissions'] ?? [];

            // Convert booleans to integers
            foreach (['a_boleh_show', 'a_boleh_insert', 'a_boleh_update', 'a_boleh_delete', 'a_boleh_sanggah', 'approval_menu'] as $field) {
                if (isset($permissions[$field])) {
                    $permissions[$field] = $permissions[$field] ? 1 : 0;
                }
            }

            $idUpdater = $request->attributes->get('user_id', '00000000-0000-0000-0000-000000000000');
            $result = $this->menuRoleService->bulkAssignMenusToRole(
                $validated['id_peran'],
                $validated['menu_ids'],
                $permissions,
                $idUpdater
            );

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Get RBAC statistics
     * GET /manakses/menu-role/stats
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = $this->menuRoleService->getStats();

            return response()->json([
                'success' => true,
                'message' => 'RBAC statistics retrieved successfully',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RBAC statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get RBAC permission matrix for an application
     * GET /manakses/menu-role/matrix?app_id={appId}
     */
    public function matrix(Request $request): JsonResponse
    {
        $appId = $request->query('app_id');
        if (!$appId) return response()->json(['success' => false, 'message' => 'app_id required'], 400);

        // Get all menus for this app
        $menus = DB::select("
            SELECT CONVERT(VARCHAR(36), id_menu) as id_menu, nm_menu, nm_file, urutan_menu, level_menu,
                   CONVERT(VARCHAR(36), id_group_menu) as id_group_menu
            FROM man_akses.menu
            WHERE id_aplikasi = ? AND a_aktif = 1
            ORDER BY level_menu, urutan_menu
        ", [$appId]);

        // Get all roles that have any assignment in this app
        $roles = DB::select("
            SELECT DISTINCT p.id_peran, p.nm_peran
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE m.id_aplikasi = ? AND ISNULL(mr.soft_delete, 0) = 0
            ORDER BY p.nm_peran
        ", [$appId]);

        // Get all assignments
        $assignments = DB::select("
            SELECT mr.id_peran, CONVERT(VARCHAR(36), mr.id_menu) as id_menu,
                   ISNULL(mr.a_boleh_show, 0) as show_perm,
                   ISNULL(mr.a_boleh_insert, 0) as insert_perm,
                   ISNULL(mr.a_boleh_update, 0) as update_perm,
                   ISNULL(mr.a_boleh_delete, 0) as delete_perm
            FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE m.id_aplikasi = ? AND ISNULL(mr.soft_delete, 0) = 0
        ", [$appId]);

        // Build map: { role_id: { menu_id: { show, insert, update, delete } } }
        $assignmentMap = [];
        foreach ($assignments as $a) {
            $assignmentMap[$a->id_peran][$a->id_menu] = [
                'show'   => (int)$a->show_perm,
                'insert' => (int)$a->insert_perm,
                'update' => (int)$a->update_perm,
                'delete' => (int)$a->delete_perm,
            ];
        }

        // Get ALL roles (for adding new roles)
        $allRoles = DB::select("SELECT id_peran, nm_peran FROM man_akses.peran ORDER BY nm_peran");

        return response()->json([
            'success' => true,
            'data' => [
                'menus'       => $menus,
                'roles'       => $roles,
                'all_roles'   => $allRoles,
                'assignments' => $assignmentMap,
            ]
        ]);
    }

    /**
     * Bulk update RBAC permission matrix for an application
     * POST /manakses/menu-role/matrix/bulk
     */
    public function bulkUpdateMatrix(Request $request): JsonResponse
    {
        $appId   = $request->input('app_id');
        $changes = $request->input('changes', []);

        if (!$appId || empty($changes)) {
            return response()->json(['success' => false, 'message' => 'app_id and changes required'], 400);
        }

        $userId   = $request->user()?->id ?? '00000000-0000-0000-0000-000000000001';
        $now      = now();
        $updated  = 0;
        $inserted = 0;
        $deleted  = 0;

        DB::beginTransaction();
        try {
            foreach ($changes as $change) {
                $idPeran = $change['id_peran'];
                $idMenu  = $change['id_menu'];
                $show    = $change['show']   ?? 0;
                $insert  = $change['insert'] ?? 0;
                $update  = $change['update'] ?? 0;
                $delete  = $change['delete'] ?? 0;

                // All permissions 0 → remove assignment
                if (!$show && !$insert && !$update && !$delete) {
                    $affected = DB::delete("
                        DELETE FROM man_akses.menu_role WHERE id_peran = ? AND id_menu = ?
                    ", [$idPeran, $idMenu]);
                    if ($affected) $deleted++;
                    continue;
                }

                // Try update first
                $affected = DB::update("
                    UPDATE man_akses.menu_role
                    SET a_boleh_show = ?, a_boleh_insert = ?, a_boleh_update = ?, a_boleh_delete = ?,
                        last_update = ?, last_sync = ?, id_updater = ?, soft_delete = 0
                    WHERE id_peran = ? AND id_menu = ?
                ", [$show, $insert, $update, $delete, $now, $now, $userId, $idPeran, $idMenu]);

                if ($affected) {
                    $updated++;
                } else {
                    // Insert new
                    DB::insert("
                        INSERT INTO man_akses.menu_role
                        (id_peran, id_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
                         a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                        VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?, 0, ?, ?)
                    ", [$idPeran, $idMenu, $show, $insert, $update, $delete, $now, $now, $now, $userId]);
                    $inserted++;
                }
            }

            DB::commit();

            // Invalidate permissions cache for affected roles
            $affectedRoles = array_unique(array_column($changes, 'id_peran'));
            foreach ($affectedRoles as $roleId) {
                Cache::forget("permissions:{$roleId}:" . strtolower($appId));
            }

            // Invalidate portal apps cache
            $this->invalidatePortalAppsCache();

            return response()->json([
                'success' => true,
                'message' => "Berhasil: {$updated} diupdate, {$inserted} ditambah, {$deleted} dihapus",
                'data'    => ['updated' => $updated, 'inserted' => $inserted, 'deleted' => $deleted],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Invalidate all portal-related cache
     */
    private function invalidatePortalAppsCache(): void
    {
        try {
            $redis  = Cache::getStore()->getRedis();
            $prefix = config('cache.prefix', '');
            $keys   = $redis->keys("{$prefix}*portal_apps*");
            foreach ($keys as $key) {
                Cache::forget(str_replace($prefix . ':', '', $key));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to invalidate portal apps cache', ['error' => $e->getMessage()]);
        }
    }
}
