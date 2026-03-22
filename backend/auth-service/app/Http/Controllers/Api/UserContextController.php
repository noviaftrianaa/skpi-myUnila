<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserContext\UserContextService;
use App\Repositories\UserContext\UserContextRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * User Context Controller
 * API endpoints for user role/unit context management
 *
 * Handles:
 * - Get user's available roles and units
 * - Select/switch active context (role + unit)
 * - Check app access based on active context
 */
class UserContextController extends Controller
{
    protected UserContextService $service;

    public function __construct()
    {
        $repository = new UserContextRepository();
        $this->service = new UserContextService($repository);
    }

    /**
     * Get user context - all available roles and units
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserContext(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $result = $this->service->getUserContext($userId);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'] ?? 'User context berhasil diambil',
                'data' => $result['success'] ? [
                    'user' => $result['user'] ?? null,
                    'roles' => $result['roles'] ?? [],
                    'active_context' => $result['active_context'] ?? null,
                ] : null
            ], $result['success'] ? 200 : 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil user context: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Select/switch user context (role + unit)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function selectContext(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'id_role_pengguna' => 'required|string|max:36',
            ]);

            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $idRolePengguna = $request->input('id_role_pengguna');
            $result = $this->service->selectContext($userId, $idRolePengguna);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['success'] ? [
                    'active_context' => $result['active_context'] ?? null,
                ] : null
            ], $result['success'] ? 200 : 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memilih context: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Check if user has access to specific app based on active context
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkAppAccess(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $appId = $request->query('app_id');
            $appKey = $request->query('app_key');

            if (!$appId && !$appKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter app_id atau app_key diperlukan',
                    'data' => null
                ], 400);
            }

            $result = $this->service->checkAppAccess($userId, $appId, $appKey);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['reason'] ?? 'Check access berhasil',
                'data' => [
                    'has_access' => $result['has_access'] ?? false,
                    'requires_context_selection' => $result['requires_context_selection'] ?? false,
                    'context' => $result['context'] ?? null,
                    'app' => $result['app'] ?? null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memeriksa akses aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get active context from cache
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getActiveContext(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $context = $this->service->getActiveContext($userId);

            return response()->json([
                'success' => true,
                'message' => $context ? 'Active context ditemukan' : 'Belum ada active context',
                'data' => [
                    'active_context' => $context,
                    'has_context' => $context !== null,
                    'permissions' => Cache::get("user_permissions:{$userId}"),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil active context: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Clear user context (logout scenario)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearContext(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $result = $this->service->clearContext($userId);

            return response()->json([
                'success' => true,
                'message' => 'Context berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus context: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get portal apps filtered by user's active context organization
     *
     * Apps are returned if:
     * - User's role org matches app's org, OR
     * - App's org is "Semua Unit" (global access), OR
     * - User's role org is "Semua Unit" (has global access)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPortalApps(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $result = $this->service->getPortalApps($userId);

            return response()->json([
                'success' => $result['success'],
                'message' => 'Portal apps berhasil diambil',
                'data' => [
                    'context' => $result['context'] ?? null,
                    'categories' => $result['categories'] ?? [],
                    'total_apps' => $result['total_apps'] ?? 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil portal apps: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all portal categories
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPortalCategories(Request $request): JsonResponse
    {
        try {
            $result = $this->service->getPortalCategories();

            return response()->json([
                'success' => $result['success'],
                'message' => 'Portal categories berhasil diambil',
                'data' => [
                    'categories' => $result['categories'] ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil portal categories: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get user's accessible menus for an application
     * Returns hierarchical menu structure based on RBAC (menu_role.a_boleh_show)
     *
     * Query params:
     * - app_id: Application UUID
     * - app_key: Application slug (alternative to app_id)
     *
     * Response:
     * - menus: Hierarchical menu array with permissions
     * - is_super_role: Whether user has super role (full access)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAppMenus(Request $request): JsonResponse
    {
        try {
            $authUser = $request->attributes->get('auth_user');
            $userId = $authUser->id_pengguna ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID tidak ditemukan dari token',
                    'data' => null
                ], 401);
            }

            $appId = $request->query('app_id');
            $appKey = $request->query('app_key');

            if (!$appId && !$appKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter app_id atau app_key diperlukan',
                    'data' => null
                ], 400);
            }

            $result = $this->service->getUserMenus($userId, $appId, $appKey);

            if (!$result['success']) {
                $statusCode = isset($result['requires_context_selection']) && $result['requires_context_selection'] ? 403 : 400;
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Gagal mengambil menu',
                    'data' => [
                        'requires_context_selection' => $result['requires_context_selection'] ?? false,
                        'menus' => [],
                    ]
                ], $statusCode);
            }

            return response()->json([
                'success' => true,
                'message' => 'App menus berhasil diambil',
                'data' => [
                    'context' => $result['context'] ?? null,
                    'app' => $result['app'] ?? null,
                    'menus' => $result['menus'] ?? [],
                    'is_super_role' => $result['is_super_role'] ?? false,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil app menus: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
