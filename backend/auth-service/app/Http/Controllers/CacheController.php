<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Cache Controller - Monitoring & Management
 * For monitoring Redis cache performance
 */
class CacheController extends Controller
{
    public function __construct(
        private CacheService $cache
    ) {}

    /**
     * Get cache statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            if (!$this->cache->isRedisAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Redis is not available',
                ], 503);
            }

            $stats = $this->cache->getCacheStats();

            return response()->json([
                'success' => true,
                'data' => [
                    'cache_keys' => $stats,
                    'total_keys' => array_sum(array_filter($stats, 'is_numeric')),
                    'memory' => $stats['memory_used'] ?? 'unknown',
                    'redis_status' => 'connected',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Get cache stats error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get cache statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear all auth-related caches
     * DANGER: Use with caution in production!
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            // Require confirmation
            $confirm = $request->input('confirm');
            if ($confirm !== 'yes') {
                return response()->json([
                    'success' => false,
                    'message' => 'Confirmation required',
                    'hint' => 'Add {"confirm": "yes"} to request body',
                ], 400);
            }

            $result = $this->cache->clearAllAuthCache();

            return response()->json([
                'success' => true,
                'message' => 'All auth caches cleared successfully',
                'note' => 'Next requests will rebuild cache from database',
            ]);
        } catch (\Exception $e) {
            Log::error('Clear cache error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Invalidate cache for specific user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function invalidateUser(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'user_id is required',
                ], 400);
            }

            $result = $this->cache->invalidateUserCache($userId);

            return response()->json([
                'success' => true,
                'message' => "Cache invalidated for user {$userId}",
            ]);
        } catch (\Exception $e) {
            Log::error('Invalidate user cache error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to invalidate user cache',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Health check for Redis connection
     *
     * @return JsonResponse
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
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
