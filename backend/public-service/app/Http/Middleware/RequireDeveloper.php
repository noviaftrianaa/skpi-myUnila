<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireDeveloper Middleware
 *
 * Checks if the authenticated user has Developer role.
 * Must be used after KongAuth middleware.
 */
class RequireDeveloper
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('auth_user');

        if (!$user || !isset($user->role)) {
            return response()->json([
                'success' => false,
                'message' => 'Role information not found',
            ], 403);
        }

        if ($user->role !== 'Developer') {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions. Developer role required.',
            ], 403);
        }

        return $next($request);
    }
}
