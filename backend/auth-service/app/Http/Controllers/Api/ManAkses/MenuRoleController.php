<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\MenuRoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
