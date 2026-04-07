<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use stdClass;

/**
 * Middleware JWT authentication untuk bak-service.
 * Validasi token yang diterbitkan oleh auth-service.
 * Tidak menerbitkan token sendiri.
 */
class JwtAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication token not provided',
            ], 401);
        }

        try {
            $secret = config('jwt.secret');
            $algo = config('jwt.algo', 'HS256');
            $decoded = JWT::decode($token, new Key($secret, $algo));
        } catch (\Exception $e) {
            Log::warning('JWT decode failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
            ], 401);
        }

        // Check token type
        if (isset($decoded->type) && $decoded->type !== 'access') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token type',
            ], 401);
        }

        // Lookup user dari pdut (SQL Server, read-only)
        try {
            $sql = "
                SELECT *
                FROM man_akses.pengguna
                WHERE id_pengguna = ?
                  AND a_aktif = 1
                  AND (soft_delete IS NULL OR soft_delete = 0)
            ";
            $userData = DB::connection('sqlsrv')->selectOne($sql, [$decoded->sub]);
        } catch (\Exception $e) {
            Log::error('Failed to lookup user from pdut: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify user',
            ], 500);
        }

        if (!$userData) {
            return response()->json([
                'success' => false,
                'message' => 'User not found or inactive',
            ], 401);
        }

        if (isset($userData->disable) && $userData->disable == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Account is disabled',
            ], 403);
        }

        // Create user object
        $user = new stdClass();
        foreach ((array) $userData as $key => $value) {
            $user->$key = $value;
        }

        // Attach JWT claims (roles, etc) jika ada
        if (isset($decoded->roles)) {
            $user->jwt_roles = $decoded->roles;
        }

        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        $request->attributes->set('auth_user', $user);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return $request->query('token');
    }
}
