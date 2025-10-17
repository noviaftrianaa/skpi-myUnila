<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trust Kong Middleware
 *
 * This middleware trusts that Kong API Gateway has already validated
 * the JWT token. We just extract user information from headers that
 * Kong injected via Request Transformer plugin.
 *
 * Flow:
 * 1. User sends request with JWT token to Kong
 * 2. Kong validates JWT with JWT Plugin
 * 3. Kong extracts user info from JWT claims
 * 4. Kong injects user info into request headers (via Request Transformer)
 * 5. This middleware reads those headers and makes user available
 *
 * Headers injected by Kong:
 * - X-User-Id: User ID from JWT 'sub' claim
 * - X-User-Name: User name from JWT 'user.name' claim
 * - X-User-Email: User email from JWT 'user.email' claim
 * - X-User-Role: User role from JWT 'user.role' claim
 * - X-User-Username: Username from JWT 'user.username' claim
 */
class TrustKong
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extract user info from Kong-injected headers
        $userId = $request->header('X-User-Id');
        $userName = $request->header('X-User-Name');
        $userEmail = $request->header('X-User-Email');
        $userRole = $request->header('X-User-Role');
        $userUsername = $request->header('X-User-Username');

        // If no user ID, Kong didn't validate token (or token is missing)
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required',
                'error' => 'No valid JWT token provided'
            ], 401);
        }

        // Create user object from headers
        $user = new \stdClass();
        $user->id = $userId;
        $user->name = $userName;
        $user->email = $userEmail;
        $user->role = $userRole;
        $user->username = $userUsername;

        // Make user available to controllers via request attributes
        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}
