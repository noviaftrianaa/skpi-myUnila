<?php

namespace App\Services\Auth;

use App\Repositories\UserRepository;
use App\Repositories\TokenRepository;
use App\Services\TokenService;
use App\Helpers\DeviceDetector;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Auth Service
 * Handle authentication business logic
 */
class AuthService
{
    public function __construct(
        private UserRepository $userRepo,
        private TokenRepository $tokenRepo,
        private TokenService $tokenService
    ) {}

    /**
     * Login user
     *
     * @return array ['user' => array, 'tokens' => array]
     * @throws \Exception
     */
    public function login(string $username, string $password, string $ipAddress, string $userAgent): array
    {
        // Find user by username
        $user = $this->userRepo->findByUsername($username);

        if (!$user) {
            throw new \Exception('Invalid credentials', 401);
        }

        // Verify password
        if (!$this->userRepo->verifyPassword($user, $password)) {
            throw new \Exception('Invalid credentials', 401);
        }

        // Get user roles
        $roles = $this->userRepo->getUserRoles($user->id_pengguna);

        if (empty($roles)) {
            throw new \Exception('User has no assigned roles', 403);
        }

        // Get active role
        $activeRole = $this->userRepo->getActiveRole($user->id_pengguna);

        // Get user detail
        $userDetail = $this->userRepo->getUserDetail($user->id_pengguna);

        // Generate JWT token
        $token = $this->tokenService->generateAccessTokenFromArray(
            [
                'id' => $user->id_pengguna,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->nm_pengguna,
                'role' => $activeRole,
                'roles' => $roles,
            ],
            [
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]
        );

        // Log successful login
        $this->logSuccessfulLogin($user, $ipAddress, $userAgent);

        // Build response
        return [
            'user' => [
                'id' => $userDetail->id_pengguna ?? $user->id_pengguna,
                'username' => $userDetail->username ?? $user->username,
                'name' => $userDetail->nm_pengguna ?? $user->nm_pengguna,
                'email' => $userDetail->email ?? $user->email,
                'role' => $userDetail->nm_peran ?? $activeRole,
                'roles' => $roles,
                'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
                'fakultas' => $userDetail->nm_fakultas ?? null,
                'jurusan' => $userDetail->nm_jurusan ?? null,
                'prodi' => $userDetail->nm_prodi_jenjang ?? null,
                'id_pd_pengguna' => $user->id_pd_pengguna ?? null,
                'id_sdm_pengguna' => $user->id_sdm_pengguna ?? null,
                'id_user_sikep' => $user->id_user_sikep ?? null,
                'id_lembaga' => null,
                'kode_organisasi' => null,
                'a_aktif' => 1,
            ],
            'tokens' => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl', 15) * 60,
            ],
        ];
    }

    /**
     * Logout user
     *
     * @throws \Exception
     */
    public function logout(string $token): void
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        // Expire the access token
        $this->tokenRepo->expireAccessToken($token);

        // Update login log
        $this->tokenRepo->updateLoginLogoutTime(
            $decoded->sub,
            config('app.aplikasi_id')
        );
    }

    /**
     * Logout from all devices
     *
     * @throws \Exception
     */
    public function logoutAllDevices(string $token): void
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        // Revoke all tokens
        $this->tokenRepo->revokeAllUserTokens($decoded->sub);

        // Update all active sessions
        $this->tokenRepo->updateLoginLogoutTime(
            $decoded->sub,
            config('app.aplikasi_id')
        );
    }

    /**
     * Get current user information
     *
     * @return array
     * @throws \Exception
     */
    public function getCurrentUser(string $token): array
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        $userId = $decoded->sub;

        // Get user detail
        $userDetail = $this->userRepo->getUserDetail($userId);
        $roles = $this->userRepo->getUserRoles($userId);
        $user = $this->userRepo->findById($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        return [
            'id' => $userDetail->id_pengguna ?? $userId,
            'username' => $userDetail->username ?? $user->username,
            'name' => $userDetail->nm_pengguna ?? $user->nm_pengguna,
            'email' => $userDetail->email ?? $user->email,
            'role' => $userDetail->nm_peran ?? $roles[0] ?? 'user',
            'roles' => $roles,
            'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
            'fakultas' => $userDetail->nm_fakultas ?? null,
            'jurusan' => $userDetail->nm_jurusan ?? null,
            'prodi' => $userDetail->nm_prodi_jenjang ?? null,
            'id_pd_pengguna' => $user->id_pd_pengguna ?? null,
            'id_sdm_pengguna' => $user->id_sdm_pengguna ?? null,
            'id_user_sikep' => $user->id_user_sikep ?? null,
            'id_lembaga' => null,
            'kode_organisasi' => null,
            'a_aktif' => 1,
        ];
    }

    /**
     * Switch user role
     *
     * @return array
     * @throws \Exception
     */
    public function switchRole(string $token, string $roleName): array
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        $userId = $decoded->sub;

        // Get role ID by name for this user
        $roleId = $this->userRepo->getRoleIdByName($userId, $roleName);

        if (!$roleId) {
            throw new \Exception('Role not found or not authorized', 404);
        }

        // Switch role (update last_active)
        $switched = $this->userRepo->switchRole($userId, $roleId);

        if (!$switched) {
            throw new \Exception('Failed to switch role', 500);
        }

        // Log role switch
        Log::info('User switched role', [
            'user_id' => $userId,
            'role_name' => $roleName,
            'role_id' => $roleId,
        ]);

        // Get updated user info
        return $this->getCurrentUser($token);
    }

    /**
     * Get active sessions
     *
     * @return object|null
     * @throws \Exception
     */
    public function getActiveSessions(string $token): ?object
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        return $this->tokenRepo->getActiveLoginLog(
            $decoded->sub,
            config('app.aplikasi_id')
        );
    }

    /**
     * Get token information
     *
     * @return array
     * @throws \Exception
     */
    public function getTokenInfo(string $token): array
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid token', 401);
        }

        return [
            'user_id' => $decoded->sub ?? null,
            'username' => $decoded->username ?? null,
            'email' => $decoded->email ?? null,
            'role' => $decoded->role ?? null,
            'roles' => $decoded->roles ?? [],
            'issued_at' => $decoded->iat ?? null,
            'expires_at' => $decoded->exp ?? null,
        ];
    }

    /**
     * Refresh access token
     *
     * @return array ['tokens' => array]
     * @throws \Exception
     */
    public function refresh(string $token): array
    {
        $decoded = $this->tokenService->validateToken($token);

        if (!$decoded) {
            throw new \Exception('Invalid or expired token', 401);
        }

        $userId = $decoded->sub;

        // Get user
        $user = $this->userRepo->findById($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        // Get user roles
        $roles = $this->userRepo->getUserRoles($user->id_pengguna);
        $activeRole = $this->userRepo->getActiveRole($user->id_pengguna);

        // Generate new access token
        $newToken = $this->tokenService->generateAccessTokenFromArray(
            [
                'id' => $user->id_pengguna,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->nm_pengguna,
                'role' => $activeRole,
                'roles' => $roles,
            ],
            [
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]
        );

        return [
            'tokens' => [
                'access_token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl', 15) * 60,
            ],
        ];
    }

    /**
     * Log successful login
     */
    private function logSuccessfulLogin(object $user, string $ipAddress, string $userAgent): void
    {
        $deviceInfo = DeviceDetector::parse($userAgent);

        $this->tokenRepo->logLogin([
            'id_log_login' => Str::uuid()->toString(),
            'id_aplikasi' => config('app.aplikasi_id'),
            'id_pengguna' => $user->id_pengguna,
            'username' => $user->username,
            'email' => $user->email,
            'status' => 'success',
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'browser' => $deviceInfo['browser'],
            'os' => $deviceInfo['os'],
            'device_type' => $deviceInfo['device_type'],
            'platform' => $deviceInfo['platform'],
            'location' => DeviceDetector::getLocationFromIp($ipAddress),
            'mfa_verified' => 0,
            'a_sesi_aktif' => 1,
        ]);
    }
}
