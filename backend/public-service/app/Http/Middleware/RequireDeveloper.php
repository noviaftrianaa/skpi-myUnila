<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireDeveloper Middleware
 *
 * Checks if the user's ACTIVE (currently selected) role is Developer.
 * This checks the user's active context from Redis cache, not from JWT claims.
 * Must be used after KongAuth middleware.
 *
 * Note: User context is stored by auth-service with prefix 'auth_user_context:{user_id}'
 */
class RequireDeveloper
{
    // Auth-service cache prefix (where user_context is stored)
    private const AUTH_CACHE_PREFIX = 'auth_';
    private const CONTEXT_KEY = 'user_context:';

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('auth_user');

        if (!$user || !isset($user->id_pengguna)) {
            return response()->json([
                'success' => false,
                'message' => 'User information not found',
            ], 403);
        }

        // Get active context from cache
        $activeContext = $this->getActiveContext($user->id_pengguna);

        if ($activeContext === null) {
            // Fallback to JWT role if cache is unavailable
            if (isset($user->role) && $user->role === 'Developer') {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'message' => 'No active context selected. Please select a role first.',
            ], 403);
        }

        // Check if active role is Developer
        if (($activeContext['nm_peran'] ?? '') !== 'Developer') {
            return response()->json([
                'success' => false,
                'message' => sprintf(
                    "Insufficient permissions. Your active role '%s' is not allowed. Required: Developer",
                    $activeContext['nm_peran'] ?? 'unknown'
                ),
            ], 403);
        }

        // Store active context in request for later use
        $request->attributes->set('active_context', $activeContext);

        return $next($request);
    }

    /**
     * Get user's active context from Redis cache.
     * Uses auth-service's cache prefix since that's where context is stored.
     *
     * @param string $userId
     * @return array|null
     */
    private function getActiveContext(string $userId): ?array
    {
        try {
            // Key format: {auth_prefix}user_context:{user_id}
            $cacheKey = self::AUTH_CACHE_PREFIX . self::CONTEXT_KEY . $userId;
            $data = Redis::get($cacheKey);

            if (!$data) {
                return null;
            }

            // Laravel Cache stores data serialized, try to unserialize
            $unserialized = @unserialize($data);
            if ($unserialized !== false) {
                return $unserialized;
            }

            // Try JSON decode as fallback
            $decoded = json_decode($data, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }

            return null;
        } catch (\Exception $e) {
            \Log::warning('Failed to get active context from cache: ' . $e->getMessage());
            return null;
        }
    }
}
