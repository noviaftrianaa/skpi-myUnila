<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\UserContext\UserContextService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Cache Controller - Monitoring & Management
 * For monitoring Redis cache performance
 */
class CacheController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CacheService $cache,
        private UserContextService $userContextService
    ) {}

    /**
     * Get cache statistics
     */
    public function stats(): JsonResponse
    {
        try {
            if (!$this->cache->isRedisAvailable()) {
                return $this->errorResponse('Redis is not available', 503);
            }

            $stats = $this->cache->getCacheStats();

            return $this->successResponse([
                'cache_keys' => $stats,
                'total_keys' => array_sum(array_filter($stats, 'is_numeric')),
                'redis_status' => 'connected',
            ], 'Cache statistics retrieved');
        } catch (\Exception $e) {
            Log::error('Get cache stats error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to get cache statistics');
        }
    }

    /**
     * Health check for Redis connection
     */
    public function health(): JsonResponse
    {
        try {
            $isAvailable = $this->cache->isRedisAvailable();

            return response()->json([
                'success' => $isAvailable,
                'status' => $isAvailable ? 'healthy' : 'unavailable',
                'message' => $isAvailable ? 'Redis is connected' : 'Redis is not available',
            ], $isAvailable ? 200 : 503);
        } catch (\Exception $e) {
            return $this->serverErrorResponse($e->getMessage());
        }
    }

    /**
     * Clear all auth-related caches
     * DANGER: Use with caution in production!
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            // Require confirmation
            $confirm = $request->input('confirm');
            if ($confirm !== 'yes') {
                return $this->errorResponse(
                    'Confirmation required. Add {"confirm": "yes"} to request body',
                    400
                );
            }

            $this->cache->clearAllAuthCache();

            return $this->successResponse(
                null,
                'All auth caches cleared successfully'
            );
        } catch (\Exception $e) {
            Log::error('Clear cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to clear cache');
        }
    }

    /**
     * Invalidate cache for specific user
     */
    public function invalidateUser(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                return $this->errorResponse('user_id is required', 400);
            }

            $this->cache->invalidateUserCache($userId);

            return $this->successResponse(
                null,
                "Cache invalidated for user {$userId}"
            );
        } catch (\Exception $e) {
            Log::error('Invalidate user cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to invalidate user cache');
        }
    }

    /**
     * Invalidate menu_role permission cache
     * Call this when menu_role is updated in admin panel
     */
    public function invalidateMenuRole(Request $request): JsonResponse
    {
        try {
            $idPeran = $request->input('id_peran');
            $idAplikasi = $request->input('id_aplikasi');

            if (!$idPeran) {
                return $this->errorResponse('id_peran is required', 400);
            }

            $this->userContextService->invalidateMenuRoleCache((int) $idPeran, $idAplikasi);

            return $this->successResponse(
                null,
                $idAplikasi
                    ? "Menu role cache invalidated for role {$idPeran} and app {$idAplikasi}"
                    : "All menu role cache invalidated for role {$idPeran}"
            );
        } catch (\Exception $e) {
            Log::error('Invalidate menu role cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to invalidate menu role cache');
        }
    }

    /**
     * Invalidate app info cache
     * Call this when app is updated in admin panel
     */
    public function invalidateAppInfo(Request $request): JsonResponse
    {
        try {
            $appId = $request->input('app_id');
            $appKey = $request->input('app_key');

            if (!$appId && !$appKey) {
                return $this->errorResponse('app_id or app_key is required', 400);
            }

            $this->userContextService->invalidateAppInfoCache($appId, $appKey);

            return $this->successResponse(
                null,
                "App info cache invalidated"
            );
        } catch (\Exception $e) {
            Log::error('Invalidate app info cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to invalidate app info cache');
        }
    }

    /**
     * Invalidate portal apps cache
     * Call this when apps list is updated
     */
    public function invalidatePortalApps(Request $request): JsonResponse
    {
        try {
            $orgId = $request->input('org_id'); // Optional - if null, clears all

            $this->userContextService->invalidatePortalAppsCache($orgId);

            return $this->successResponse(
                null,
                $orgId
                    ? "Portal apps cache invalidated for org {$orgId}"
                    : "All portal apps cache invalidated"
            );
        } catch (\Exception $e) {
            Log::error('Invalidate portal apps cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to invalidate portal apps cache');
        }
    }

    /**
     * Invalidate all permission-related caches
     * Use with caution - clears all permission caches
     */
    public function invalidateAllPermissions(Request $request): JsonResponse
    {
        try {
            // Require confirmation
            $confirm = $request->input('confirm');
            if ($confirm !== 'yes') {
                return $this->errorResponse(
                    'Confirmation required. Add {"confirm": "yes"} to request body',
                    400
                );
            }

            $this->userContextService->invalidateAllPermissionCache();

            return $this->successResponse(
                null,
                'All permission caches invalidated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Invalidate all permissions cache error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to invalidate permission caches');
        }
    }
}
