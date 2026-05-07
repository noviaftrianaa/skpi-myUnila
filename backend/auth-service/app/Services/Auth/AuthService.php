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
            // Pesan error generik (jangan beda dgn 'password salah') untuk
            // cegah username enumeration via timing/error-message difference.
            throw new \Exception('Username atau password salah', 401);
        }

        // Cek lockout state — kalau akun masih lock, tolak sebelum verify password.
        $lockedUntil = $this->userRepo->getLockoutUntil($user);
        if ($lockedUntil !== null) {
            $minutesLeft = max(1, (int) ceil(($lockedUntil->getTimestamp() - time()) / 60));
            Log::warning('Login attempt on locked account', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
                'locked_until' => $lockedUntil->format('Y-m-d H:i:s'),
                'ip_address' => $ipAddress,
            ]);
            throw new \Exception(
                "Akun sementara dikunci karena terlalu banyak percobaan login gagal. Coba lagi dalam {$minutesLeft} menit.",
                423   // 423 Locked (WebDAV)
            );
        }

        // Verify password
        if (!$this->userRepo->verifyPassword($user, $password)) {
            // Increment failed_login_attempts; bila tembus threshold, set lockout.
            $result = $this->userRepo->recordFailedLogin($user->id_pengguna);

            $remaining = \App\Repositories\UserRepository::MAX_FAILED_ATTEMPTS - $result['attempts'];

            Log::warning('Failed login attempt', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
                'attempts' => $result['attempts'],
                'remaining' => $remaining,
                'locked_until' => $result['locked_until'],
                'ip_address' => $ipAddress,
            ]);

            // Kalau attempt terakhir tembus threshold → locked sekarang
            if ($result['locked_until'] !== null) {
                throw new \Exception(
                    'Akun dikunci selama ' . \App\Repositories\UserRepository::LOCKOUT_MINUTES .
                    ' menit karena terlalu banyak percobaan login gagal.',
                    423
                );
            }

            // Kasih tahu sisa attempt (transparan supaya user tahu, defense-in-depth
            // sudah ada di rate-limit middleware level — info ini gak membantu attacker
            // selama akun masih bisa login dgn password benar)
            $msg = $remaining > 0 && $remaining <= 2
                ? "Username atau password salah. Sisa {$remaining} percobaan."
                : "Username atau password salah";
            throw new \Exception($msg, 401);
        }

        // Login sukses — reset failed_login_attempts kalau ada akumulasi sebelumnya.
        $this->userRepo->resetFailedLogin($user->id_pengguna);

        // Debug: Check MFA status
        Log::info('Login MFA Check', [
            'user_id' => $user->id_pengguna,
            'username' => $user->username,
            'google2fa_enabled' => $user->google2fa_enabled ?? 'null',
            'google2fa_enabled_type' => gettype($user->google2fa_enabled ?? null),
            'google2fa_secret' => !empty($user->google2fa_secret) ? 'EXISTS' : 'NULL',
        ]);

        // Check if MFA is enabled for this user
        // Must explicitly be 1 AND have a secret key
        if (
            isset($user->google2fa_enabled) &&
            ((int)$user->google2fa_enabled === 1) &&
            !empty($user->google2fa_secret)
        ) {
            // Return MFA required response instead of token
            Log::info('MFA Required for user', [
                'user_id' => $user->id_pengguna,
                'username' => $user->username,
            ]);

            return [
                'mfa_required' => true,
                'user_id' => $user->id_pengguna,
                'message' => 'MFA verification required',
            ];
        }

        // Get user roles
        $roles = $this->userRepo->getUserRoles($user->id_pengguna);

        if (empty($roles)) {
            throw new \Exception('User has no assigned roles', 403);
        }

        // Get active role
        $activeRole = $this->userRepo->getActiveRole($user->id_pengguna);

        // Get user detail (optional - skip if query is too slow to avoid timeout)
        try {
            $userDetail = $this->userRepo->getUserDetail($user->id_pengguna);
        } catch (\Exception $e) {
            Log::warning('getUserDetail query timeout, using basic user info', [
                'user_id' => $user->id_pengguna,
                'error' => $e->getMessage()
            ]);
            $userDetail = null;
        }

        // Generate tokens (access + refresh)
        $tokens = $this->tokenService->generateTokensFromArray(
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
                'device_name' => self::getDeviceName($userAgent),
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
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
                'token_type' => $tokens['token_type'],
                'expires_in' => $tokens['expires_in'],
            ],
        ];
    }

    /**
     * Login with MFA verification
     *
     * @return array ['user' => array, 'tokens' => array]
     * @throws \Exception
     */
    public function loginWithMfa(string $userId, string $mfaCode, string $ipAddress, string $userAgent): array
    {
        // Get user from repository
        $user = $this->userRepo->findById($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        // Check if MFA is enabled
        if (!$user->google2fa_enabled) {
            throw new \Exception('MFA not enabled for this user', 400);
        }

        // Verify MFA code
        $mfaService = app(MfaService::class);
        $isValid = $mfaService->verifyCode($user, $mfaCode);

        if (!$isValid) {
            Log::warning('MFA verification failed during login', [
                'user_id' => $userId,
                'ip_address' => $ipAddress,
            ]);
            throw new \Exception('Invalid MFA code', 401);
        }

        // Get user roles
        $roles = $this->userRepo->getUserRoles($user->id_pengguna);

        if (empty($roles)) {
            throw new \Exception('User has no assigned roles', 403);
        }

        // Get active role
        $activeRole = $this->userRepo->getActiveRole($user->id_pengguna);

        // Get user detail (optional - skip if query is too slow to avoid timeout)
        try {
            $userDetail = $this->userRepo->getUserDetail($user->id_pengguna);
        } catch (\Exception $e) {
            Log::warning('getUserDetail query timeout, using basic user info', [
                'user_id' => $user->id_pengguna,
                'error' => $e->getMessage()
            ]);
            $userDetail = null;
        }

        // Generate tokens (access + refresh)
        $tokens = $this->tokenService->generateTokensFromArray(
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
                'device_name' => self::getDeviceName($userAgent),
            ]
        );

        // Log successful login with MFA
        $this->logSuccessfulLoginWithMfa($user, $ipAddress, $userAgent);

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
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
                'token_type' => $tokens['token_type'],
                'expires_in' => $tokens['expires_in'],
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
     * Refresh access token using refresh token
     *
     * @param string $refreshToken Refresh token JWT
     * @return array ['access_token', 'refresh_token', 'token_type', 'expires_in', 'refresh_expires_in']
     * @throws \Exception
     */
    public function refresh(string $refreshToken): array
    {
        // Validate refresh token
        $decoded = $this->tokenService->validateToken($refreshToken);

        if (!$decoded) {
            throw new \Exception('Invalid or expired refresh token', 401);
        }

        // Verify this is a refresh token (not access token)
        if (!isset($decoded->type) || $decoded->type !== 'refresh') {
            throw new \Exception('Invalid token type. Expected refresh token', 401);
        }

        $tokenId = $decoded->jti;
        $userId = $decoded->sub;

        // Check if refresh token exists in database and not revoked
        $tokenInDb = $this->tokenRepo->getRefreshTokenById($tokenId);

        if (!$tokenInDb) {
            throw new \Exception('Refresh token not found', 401);
        }

        if ($tokenInDb->is_revoked) {
            Log::warning('Attempted to use revoked refresh token', [
                'token_id' => $tokenId,
                'user_id' => $userId,
                'ip_address' => request()->ip(),
            ]);
            throw new \Exception('Refresh token has been revoked', 401);
        }

        // Check if token is expired in database
        if (strtotime($tokenInDb->waktu_expired) < time()) {
            throw new \Exception('Refresh token has expired', 401);
        }

        // Get user
        $user = $this->userRepo->findById($userId);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        // Get user roles
        $roles = $this->userRepo->getUserRoles($user->id_pengguna);
        $activeRole = $this->userRepo->getActiveRole($user->id_pengguna);

        // Generate NEW access token
        $newAccessToken = $this->tokenService->generateAccessTokenFromArray(
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
                'url' => '/api/v1/auth/refresh',
            ]
        );

        // Generate NEW refresh token (token rotation for security)
        $newRefreshTokenData = $this->tokenService->generateRefreshTokenFromArray(
            [
                'id' => $user->id_pengguna,
                'username' => $user->username,
                'email' => $user->email,
            ],
            [
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'device_name' => DeviceDetector::parse(request()->userAgent())['browser'] ?? 'unknown',
            ]
        );

        // Revoke old refresh token (security best practice - token rotation)
        $this->tokenRepo->revokeRefreshToken($tokenId, 'refreshed');

        // Log refresh token usage
        Log::info('Token refreshed successfully', [
            'user_id' => $userId,
            'old_token_id' => $tokenId,
            'new_token_id' => $newRefreshTokenData['token_id'],
            'ip_address' => request()->ip(),
        ]);

        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshTokenData['token'],
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl', 15) * 60,
            'refresh_expires_in' => config('jwt.refresh_ttl', 10080) * 60,
        ];
    }

    /**
     * Get device name from user agent
     */
    private static function getDeviceName(?string $userAgent): string
    {
        if (empty($userAgent)) {
            return 'Unknown Device';
        }

        $deviceInfo = DeviceDetector::parse($userAgent);
        return sprintf('%s - %s', ucfirst($deviceInfo['device_type']), $deviceInfo['browser']);
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

        // Update last_login_at and last_login_ip in pengguna table
        $this->userRepo->updateLastLogin($user->id_pengguna, $ipAddress);
    }

    /**
     * Log successful login with MFA
     */
    private function logSuccessfulLoginWithMfa(object $user, string $ipAddress, string $userAgent): void
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
            'mfa_verified' => 1, // MFA verified!
            'a_sesi_aktif' => 1,
        ]);

        // Update last_login_at and last_login_ip in pengguna table
        $this->userRepo->updateLastLogin($user->id_pengguna, $ipAddress);
    }
}
