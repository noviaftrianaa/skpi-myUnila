<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireDeveloper Middleware
 *
 * Checks if the user's ACTIVE (currently selected) role is Developer.
 * This checks the user's active context from Redis cache, not from JWT claims.
 * Must be used after KongAuth middleware.
 */
class RequireDeveloper
{
    private const CACHE_PREFIX = 'user_context:';

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
     *
     * @param string $userId
     * @return array|null
     */
    private function getActiveContext(string $userId): ?array
    {
        try {
            $cacheKey = self::CACHE_PREFIX . $userId;
            return Cache::get($cacheKey);
        } catch (\Exception $e) {
            \Log::warning('Failed to get active context from cache: ' . $e->getMessage());
            return null;
        }
    }
}
