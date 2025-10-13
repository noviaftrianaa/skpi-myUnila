<?php

namespace App\Http\Controllers;

use App\Repositories\TokenRepository;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Debug Controller - Development Only
 * Untuk debugging token management
 */
class DebugController extends Controller
{
    public function __construct(
        private TokenRepository $tokenRepo,
        private TokenService $tokenService
    ) {}

    /**
     * Get recent JWT logs from logger.log_jwt
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getJwtLogs(Request $request): JsonResponse
    {
        try {
            // Get token from Authorization header
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not provided',
                ], 401);
            }

            // Decode JWT to get user ID
            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $userId = $decoded->sub;
            $limit = (int) $request->query('limit', 10);

            // Get JWT logs from database (native SQL)
            $sql = "
                SELECT TOP (?)
                    CONVERT(VARCHAR(36), id_log_jwt) as id,
                    CONVERT(VARCHAR(36), id_pengguna) as user_id,
                    CONVERT(VARCHAR(36), id_aplikasi) as app_id,
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

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => count($logs),
                    'logs' => $logs,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Get JWT logs error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get JWT logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check refresh token status
     * Accept either full refresh token JWT or JTI UUID
     *
     * Usage:
     * - ?refresh_token=<full_jwt> → will decode and get JTI
     * - ?jti=<uuid> → direct JTI lookup
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkRefreshTokenStatus(Request $request): JsonResponse
    {
        try {
            // Get token from Authorization header
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access token not provided in Authorization header',
                ], 401);
            }

            // Decode JWT to verify user
            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid access token',
                ], 401);
            }

            // Get either refresh_token (full JWT) or jti (UUID)
            $refreshToken = $request->query('refresh_token');
            $jtiParam = $request->query('jti');

            if (!$refreshToken && !$jtiParam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Either refresh_token or jti parameter is required',
                    'usage' => [
                        'option1' => '?refresh_token=<full_jwt_token>',
                        'option2' => '?jti=<uuid>',
                    ],
                ], 400);
            }

            $jti = null;

            // If full refresh token provided, decode it
            if ($refreshToken) {
                try {
                    // Decode without validation (just to extract JTI)
                    $parts = explode('.', $refreshToken);
                    if (count($parts) !== 3) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid JWT format',
                        ], 400);
                    }

                    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])));
                    if (!$payload || !isset($payload->jti)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'JWT payload does not contain JTI',
                        ], 400);
                    }

                    $jti = $payload->jti;
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to decode refresh token: ' . $e->getMessage(),
                    ], 400);
                }
            } else {
                // Use JTI parameter directly
                $jti = $jtiParam;
            }

            // Validate JTI is UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $jti)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid JTI format. Expected UUID',
                    'received' => substr($jti, 0, 100),
                ], 400);
            }

            // Check refresh token status (native SQL)
            $sql = "
                SELECT
                    CONVERT(VARCHAR(36), id_refresh_token) as jti,
                    LEFT(token_value, 50) + '...' as token_preview,
                    waktu_create as created_at,
                    waktu_expired as expires_at,
                    is_revoked,
                    revoked_at,
                    revoked_reason,
                    CASE
                        WHEN is_revoked = 1 THEN 0
                        WHEN waktu_expired < GETDATE() THEN 0
                        ELSE 1
                    END as is_active,
                    CASE
                        WHEN waktu_expired < GETDATE() THEN 1
                        ELSE 0
                    END as is_expired,
                    DATEDIFF(SECOND, GETDATE(), waktu_expired) as seconds_remaining
                FROM man_akses.refresh_token
                WHERE id_refresh_token = ?
            ";

            $tokenData = DB::selectOne($sql, [$jti]);

            if (!$tokenData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token not found in database',
                    'data' => [
                        'exists' => false,
                        'jti_searched' => $jti,
                        'hint' => 'This token may never have been created or was deleted',
                    ],
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'exists' => true,
                    'jti' => $tokenData->jti,
                    'token_preview' => $tokenData->token_preview,
                    'created_at' => $tokenData->created_at,
                    'expires_at' => $tokenData->expires_at,
                    'is_revoked' => (bool) $tokenData->is_revoked,
                    'revoked_at' => $tokenData->revoked_at,
                    'revoked_reason' => $tokenData->revoked_reason,
                    'is_expired' => (bool) $tokenData->is_expired,
                    'is_active' => (bool) $tokenData->is_active,
                    'seconds_remaining' => max(0, $tokenData->seconds_remaining),
                    'status' => (bool) $tokenData->is_active ? 'ACTIVE' :
                               ((bool) $tokenData->is_revoked ? 'REVOKED' : 'EXPIRED'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Check refresh token status error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to check refresh token status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active sessions for debugging
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllActiveSessions(Request $request): JsonResponse
    {
        try {
            // Get token from Authorization header
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not provided',
                ], 401);
            }

            // Decode JWT to get user ID
            $decoded = $this->tokenService->validateToken($token);
            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $userId = $decoded->sub;

            // Get all login sessions (native SQL)
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

            // Get refresh tokens count
            $sql = "
                SELECT COUNT(*) as count
                FROM man_akses.refresh_token rt
                WHERE EXISTS (
                    SELECT 1 FROM logger.log_jwt lj
                    WHERE lj.token_value LIKE '%' + CONVERT(VARCHAR(36), rt.id_refresh_token) + '%'
                      AND lj.id_pengguna = ?
                )
                  AND rt.is_revoked = 0
                  AND rt.waktu_expired > GETDATE()
            ";

            $tokenCount = DB::selectOne($sql, [$userId]);

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'total_sessions' => count($sessions),
                    'active_tokens' => $tokenCount->count,
                    'sessions' => array_map(function($session) {
                        return [
                            'session_id' => $session->session_id,
                            'username' => $session->username,
                            'ip_address' => $session->ip_address,
                            'browser' => $session->browser,
                            'os' => $session->os,
                            'device_type' => $session->device_type,
                            'platform' => $session->platform,
                            'location' => $session->location,
                            'login_at' => $session->login_at,
                            'logout_at' => $session->logout_at,
                            'is_active' => (bool) $session->is_active,
                        ];
                    }, $sessions),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Get all active sessions error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get active sessions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
