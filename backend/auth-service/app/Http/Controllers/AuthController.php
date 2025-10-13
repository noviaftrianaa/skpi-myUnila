<?php

namespace App\Http\Controllers;

use App\Helpers\DeviceDetector;
use App\Services\TokenService;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private TokenService $tokenService,
        private \App\Repositories\TokenRepository $tokenRepo,
        private CacheService $cache
    ) {}

    public function login(Request $request): JsonResponse
    {
        // Step 1: Validasi input
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $username = $request->input('username');
        $password = $request->input('password');

        // Step 2: Cari pengguna berdasarkan username
        $pengguna = $this->tokenRepo->findUserByUsername($username);

        if (!$pengguna) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Step 3: Verify password dengan SHA1 Rehashing Strategy
        [$passwordValid] = $this->tokenRepo->verifyPasswordRehashed($pengguna, $password);

        if (!$passwordValid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Step 4: Get user roles
        $roles = $this->tokenRepo->getUserRoles($pengguna->id_pengguna);

        if (empty($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'User has no assigned roles',
            ], 403);
        }

        // Step 5: Get active role (last_active terbaru)
        $activeRole = $this->tokenRepo->getActiveRole($pengguna->id_pengguna);

        // Step 6: Get user detail dengan role aktif
        $userDetail = $this->tokenRepo->getUserDetail($pengguna->id_pengguna);

        // Step 7: Generate JWT token
        $userData = [
            'id' => $pengguna->id_pengguna,
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'name' => $pengguna->nm_pengguna,
            'role' => $activeRole,
            'roles' => $roles,
        ];

        $metadata = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        $token = $this->tokenService->generateAccessTokenFromArray($userData, $metadata);

        // Step 8: Log successful login
        $this->logSuccessfulLogin($pengguna, $request);

        // Step 9: Format user response sesuai TypeScript interface
        $user = [
            'id' => $userDetail->id_pengguna ?? $pengguna->id_pengguna,
            'username' => $userDetail->username ?? $pengguna->username,
            'name' => $userDetail->nm_pengguna ?? $pengguna->nm_pengguna,
            'email' => $userDetail->email ?? $pengguna->email,
            'role' => $userDetail->nm_peran ?? $activeRole,
            'roles' => $roles,
            'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
            'fakultas' => $userDetail->nm_fakultas ?? null,
            'jurusan' => $userDetail->nm_jurusan ?? null,
            'prodi' => $userDetail->nm_prodi_jenjang ?? null,
            'id_pd_pengguna' => $pengguna->id_pd_pengguna ?? null,
            'id_sdm_pengguna' => $pengguna->id_sdm_pengguna ?? null,
            'id_user_sikep' => $pengguna->id_user_sikep ?? null,
            'id_lembaga' => null, // TODO: Add if needed
            'kode_organisasi' => null, // TODO: Add if needed
            'a_aktif' => 1,
        ];

        // Step 10: Return response sesuai LoginResponse interface
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'tokens' => [
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') ?? 3600,
                ],
            ],
        ]);
    }

    /**
     * Verify MFA code (not implemented yet).
     */
    public function verifyMfa(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'MFA not implemented yet',
        ], 501);
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $validator = Validator::make($request->all(), [
                'refresh_token' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token is required',
                ], 422);
            }

            $refreshToken = $request->input('refresh_token');
            $newTokenData = $this->tokenService->refreshAccessToken($refreshToken, $token);

            if (!$newTokenData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired refresh token',
                ], 401);
            }

            // Return response sesuai RefreshTokenResponse interface
            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'access_token' => $newTokenData['access_token'] ?? null,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') ?? 3600,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh token',
                'error' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Logout current session.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            // Expire the access token
            $this->tokenRepo->expireAccessToken($token);

            // Update login log
            $this->tokenRepo->updateLoginLogoutTime($decoded->sub, config('app.aplikasi_id'));

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout from all devices.
     */
    public function logoutAllDevices(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $userId = $decoded->sub;

            // Revoke all tokens for this user
            $this->tokenRepo->revokeAllUserTokens($userId, 'Logout from all devices');

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all devices successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout all devices failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current user information.
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $userId = $decoded->sub;

            // Get user detail
            $userDetail = $this->tokenRepo->getUserDetail($userId);
            $roles = $this->tokenRepo->getUserRoles($userId);

            // Get pengguna untuk additional fields
            $pengguna = $this->tokenRepo->findUserById($userId);

            // Format user response sesuai TypeScript interface
            $user = [
                'id' => $userDetail->id_pengguna ?? $userId,
                'username' => $userDetail->username ?? $decoded->username,
                'name' => $userDetail->nm_pengguna ?? $decoded->name,
                'email' => $userDetail->email ?? $decoded->email,
                'role' => $userDetail->nm_peran ?? $decoded->role,
                'roles' => $roles,
                'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
                'fakultas' => $userDetail->nm_fakultas ?? null,
                'jurusan' => $userDetail->nm_jurusan ?? null,
                'prodi' => $userDetail->nm_prodi_jenjang ?? null,
                'id_pd_pengguna' => $pengguna->id_pd_pengguna ?? null,
                'id_sdm_pengguna' => $pengguna->id_sdm_pengguna ?? null,
                'id_user_sikep' => $pengguna->id_user_sikep ?? null,
                'id_lembaga' => null, // TODO: Add if needed
                'kode_organisasi' => null, // TODO: Add if needed
                'a_aktif' => 1,
            ];

            // Return response sesuai UserResponse interface
            return response()->json([
                'success' => true,
                'message' => 'User information retrieved successfully',
                'data' => [
                    'user' => $user,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Switch user role and update last_active.
     */
    public function switchRole(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

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
            $roleName = $request->input('role_name');

            // Get role ID by name for this user
            $roleId = $this->tokenRepo->getRoleIdByName($userId, $roleName);

            if (!$roleId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found or not authorized',
                ], 404);
            }

            // Switch role (update last_active)
            $switched = $this->tokenRepo->switchUserRole($userId, $roleId);

            if (!$switched) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to switch role',
                ], 500);
            }

            // Get updated user detail with new active role
            $userDetail = $this->tokenRepo->getUserDetail($userId);
            $roles = $this->tokenRepo->getUserRoles($userId);

            // Get pengguna untuk additional fields
            $pengguna = $this->tokenRepo->findUserById($userId);

            // Format user response sesuai TypeScript interface
            $user = [
                'id' => $userDetail->id_pengguna ?? $userId,
                'username' => $userDetail->username ?? $decoded->username,
                'name' => $userDetail->nm_pengguna ?? $decoded->name,
                'email' => $userDetail->email ?? $decoded->email,
                'role' => $userDetail->nm_peran ?? $roleName,
                'roles' => $roles,
                'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
                'fakultas' => $userDetail->nm_fakultas ?? null,
                'jurusan' => $userDetail->nm_jurusan ?? null,
                'prodi' => $userDetail->nm_prodi_jenjang ?? null,
                'id_pd_pengguna' => $pengguna->id_pd_pengguna ?? null,
                'id_sdm_pengguna' => $pengguna->id_sdm_pengguna ?? null,
                'id_user_sikep' => $pengguna->id_user_sikep ?? null,
                'id_lembaga' => null, // TODO: Add if needed
                'kode_organisasi' => null, // TODO: Add if needed
                'a_aktif' => 1,
            ];

            // Log role switch
            Log::info('User switched role', [
                'user_id' => $userId,
                'role_name' => $roleName,
                'role_id' => $roleId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Role switched successfully',
                'data' => [
                    'user' => $user,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Switch role error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while switching role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active sessions.
     */
    public function activeSessions(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $userId = $decoded->sub;

            // Get active session
            $activeSession = $this->tokenRepo->getActiveLoginLog($userId, config('app.aplikasi_id'));

            return response()->json([
                'success' => true,
                'message' => 'Active sessions retrieved successfully',
                'data' => [
                    'session' => $activeSession,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active sessions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get token information.
     */
    public function tokenInfo(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token information retrieved successfully',
                'data' => [
                    'token' => [
                        'user_id' => $decoded->sub ?? null,
                        'username' => $decoded->username ?? null,
                        'email' => $decoded->email ?? null,
                        'role' => $decoded->role ?? null,
                        'roles' => $decoded->roles ?? [],
                        'issued_at' => $decoded->iat ?? null,
                        'expires_at' => $decoded->exp ?? null,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve token information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke a specific token.
     */
    public function revokeToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token_id' => 'required|string|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided',
            ], 401);
        }

        try {
            $decoded = $this->tokenService->validateToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token',
                ], 401);
            }

            $tokenId = $request->input('token_id');

            // Revoke the specific refresh token
            $this->tokenRepo->revokeRefreshToken($tokenId, 'Token revoked by user');

            return response()->json([
                'success' => true,
                'message' => 'Token revoked successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log successful login.
     */
    private function logSuccessfulLogin($pengguna, Request $request): void
    {
        $deviceInfo = DeviceDetector::parse($request->userAgent());
        $ipAddress = $request->ip();

        try {
            $sql = "
                INSERT INTO logger.log_login (
                    id_log_login, id_aplikasi, id_pengguna, username, email,
                    status, ip_address, user_agent,
                    browser, os, device_type, platform, location,
                    mfa_verified, a_sesi_aktif, waktu_login
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, GETDATE()
                )
            ";

            \DB::insert($sql, [
                Str::uuid()->toString(),
                config('app.aplikasi_id'),
                $pengguna->id_pengguna,
                $pengguna->username,
                $pengguna->email,
                'success',
                $ipAddress,
                $request->userAgent(),
                $deviceInfo['browser'],
                $deviceInfo['os'],
                $deviceInfo['device_type'],
                $deviceInfo['platform'],
                DeviceDetector::getLocationFromIp($ipAddress),
                0, // mfa_verified
                1, // a_sesi_aktif
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the login
            Log::warning('Failed to log successful login: ' . $e->getMessage(), [
                'user_id' => $pengguna->id_pengguna ?? null,
                'username' => $pengguna->username ?? null,
            ]);
        }
    }

    /**
     * Log login attempt (for MFA - not used in current implementation).
     */
    private function logLoginAttempt($user, string $status, bool $mfaVerified = false): void
    {
        // Not implemented yet
    }
}
