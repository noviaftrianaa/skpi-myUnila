<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
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
        private CacheService $cache
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
}
