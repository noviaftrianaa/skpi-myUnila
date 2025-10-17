<?php

namespace App\Http\Controllers;

use App\Services\TokenService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Debug Controller - Development Only
 * For debugging token management
 */
class DebugController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TokenService $tokenService
    ) {}

    /**
     * Get recent JWT logs
     */
    public function getJwtLogs(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return $this->unauthorizedResponse('Invalid token');
            }

            $userId = $decoded->sub;
            $limit = (int) $request->query('limit', 10);

            $sql = "
                SELECT TOP (?)
                    CONVERT(VARCHAR(36), id_log_jwt) as id,
                    CONVERT(VARCHAR(36), id_pengguna) as user_id,
                    LEFT(token_value, 50) + '...' as token_preview,
                    url,
                    ip_address,
                    waktu_create as created_at,
                    waktu_expired as expires_at,
                    CASE
                        WHEN waktu_expired > GETDATE() THEN 'active'
                        ELSE 'expired'
                    END as status
                FROM logger.log_jwt
                WHERE id_pengguna = ?
                ORDER BY waktu_create DESC
            ";

            $logs = DB::select($sql, [$limit, $userId]);

            return $this->successResponse([
                'total' => count($logs),
                'logs' => $logs,
            ], 'JWT logs retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Get JWT logs error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to get JWT logs');
        }
    }

    /**
     * Check refresh token status
     */
    public function checkRefreshTokenStatus(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return $this->unauthorizedResponse('Invalid token');
            }

            $jti = $request->query('jti');
            if (!$jti) {
                return $this->errorResponse('jti parameter is required', 400);
            }

            // Validate JTI is UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $jti)) {
                return $this->errorResponse('Invalid JTI format. Expected UUID', 400);
            }

            $sql = "
                SELECT
                    CONVERT(VARCHAR(36), id_refresh_token) as jti,
                    waktu_create as created_at,
                    waktu_expired as expires_at,
                    is_revoked,
                    revoked_at,
                    revoked_reason,
                    CASE
                        WHEN is_revoked = 1 THEN 0
                        WHEN waktu_expired < GETDATE() THEN 0
                        ELSE 1
                    END as is_active
                FROM man_akses.refresh_token
                WHERE id_refresh_token = ?
            ";

            $tokenData = DB::selectOne($sql, [$jti]);

            if (!$tokenData) {
                return $this->notFoundResponse('Refresh token not found in database');
            }

            return $this->successResponse([
                'jti' => $tokenData->jti,
                'created_at' => $tokenData->created_at,
                'expires_at' => $tokenData->expires_at,
                'is_revoked' => (bool) $tokenData->is_revoked,
                'is_active' => (bool) $tokenData->is_active,
                'status' => (bool) $tokenData->is_active ? 'ACTIVE' :
                           ((bool) $tokenData->is_revoked ? 'REVOKED' : 'EXPIRED'),
            ], 'Refresh token status retrieved');
        } catch (\Exception $e) {
            Log::error('Check refresh token error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to check refresh token status');
        }
    }

    /**
     * Get all active sessions
     */
    public function getAllActiveSessions(Request $request): JsonResponse
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return $this->unauthorizedResponse('Invalid token');
            }

            $userId = $decoded->sub;

            $sql = "
                SELECT
                    CONVERT(VARCHAR(36), id_log_login) as session_id,
                    username,
                    ip_address,
                    browser,
                    os,
                    device_type,
                    platform,
                    location,
                    waktu_login as login_at,
                    waktu_logout as logout_at,
                    a_sesi_aktif as is_active
                FROM logger.log_login
                WHERE id_pengguna = ?
                ORDER BY waktu_login DESC
            ";

            $sessions = DB::select($sql, [$userId]);

            return $this->successResponse([
                'user_id' => $userId,
                'total_sessions' => count($sessions),
                'sessions' => $sessions,
            ], 'Active sessions retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Get sessions error: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to get active sessions');
        }
    }
}
