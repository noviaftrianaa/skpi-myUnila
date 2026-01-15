<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use stdClass;

/**
 * KongAuth Middleware
 *
 * Trusts Kong Gateway's JWT validation.
 * Kong already validates the JWT signature and expiration,
 * we just decode the payload to extract user info.
 */
class KongAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Missing authorization header or cookie',
            ], 401);
        }

        // Parse JWT payload without verification (Kong already verified it)
        $claims = $this->decodeJwtPayload($token);

        if (!$claims) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid JWT format',
            ], 401);
        }

        // Verify token type (should be "access" token)
        if (isset($claims->type) && $claims->type !== 'access') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token type',
            ], 401);
        }

        // Create user object from JWT claims
        $user = new stdClass();
        if (isset($claims->user)) {
            $user->id_pengguna = $claims->user->id ?? $claims->sub;
            $user->username = $claims->user->username ?? null;
            $user->email = $claims->user->email ?? null;
            $user->nama = $claims->user->name ?? null;
            $user->role = $claims->user->role ?? null;
        } else {
            // Fallback to sub claim as user ID
            $user->id_pengguna = $claims->sub ?? null;
        }

        // Attach user to request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Also attach to request attributes for easier access
        $request->attributes->set('auth_user', $user);
        $request->attributes->set('jwt_claims', $claims);

        return $next($request);
    }

    /**
     * Extract token from request.
     * Supports both Authorization header and cookie.
     */
    private function extractToken(Request $request): ?string
    {
        // Try Authorization header first
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        // Fallback to cookie for browser-based docs access
        $cookieToken = $request->cookie('access_token');
        if ($cookieToken) {
            return $cookieToken;
        }

        return null;
    }

    /**
     * Decode JWT payload without verification.
     * Kong has already validated the signature.
     */
    private function decodeJwtPayload(string $token): ?object
    {
        // JWT format: header.payload.signature
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        $payload = $parts[1];

        // Add padding for base64 decoding if needed
        $remainder = strlen($payload) % 4;
        if ($remainder > 0) {
            $payload .= str_repeat('=', 4 - $remainder);
        }

        // Decode base64url (replace - with +, _ with /)
        $payload = strtr($payload, '-_', '+/');
        $decoded = base64_decode($payload, true);

        if ($decoded === false) {
            return null;
        }

        $claims = json_decode($decoded);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $claims;
    }
}
