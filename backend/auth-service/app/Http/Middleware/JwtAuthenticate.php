<?php

namespace App\Http\Middleware;

use App\Services\TokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use stdClass;

class JwtAuthenticate
{
    public function __construct(
        private TokenService $tokenService
    ) {}

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
                'message' => 'Authentication token not provided',
            ], 401);
        }

        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
            ], 401);
        }

        // Check if token type is access token
        if (isset($decoded->type) && $decoded->type !== 'access') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token type',
            ], 401);
        }

        // Get user from database using native SQL
        $sql = "
            SELECT *
            FROM man_akses.pengguna
            WHERE id_pengguna = ?
              AND a_aktif = 1
              AND (soft_delete IS NULL OR soft_delete = 0)
        ";

        $userData = DB::selectOne($sql, [$decoded->sub]);

        if (!$userData) {
            return response()->json([
                'success' => false,
                'message' => 'User not found or inactive',
            ], 401);
        }

        // Check if account is disabled
        if (isset($userData->disable) && $userData->disable == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Account is disabled',
            ], 403);
        }

        // Convert stdClass to array for easier access
        $userArray = (array) $userData;

        // Create a simple user object
        $user = new stdClass();
        foreach ($userArray as $key => $value) {
            $user->$key = $value;
        }

        // Attach user to request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Also attach to request attributes for easier access
        $request->attributes->set('auth_user', $user);

        return $next($request);
    }

    /**
     * Extract token from request.
     */
    private function extractToken(Request $request): ?string
    {
        // Try to get from Authorization header
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        // Try to get from query string (optional, less secure)
        return $request->query('token');
    }
}
