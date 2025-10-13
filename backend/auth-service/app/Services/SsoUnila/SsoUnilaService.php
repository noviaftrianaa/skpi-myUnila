<?php

namespace App\Services\SsoUnila;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * SSO Unila Service
 * Handles CAS SSO authentication with Unila's SSO system
 */
class SsoUnilaService
{
    private string $ssoBaseUrl;
    private string $jwtSecret;
    private string $appKey;
    private string $callbackUrl;

    public function __construct()
    {
        $this->ssoBaseUrl = config('sso.unila.base_url', 'https://akses.unila.ac.id');
        $this->jwtSecret = config('sso.unila.jwt_secret', env('JWT_SECRET'));
        $this->appKey = config('sso.unila.app_key', env('APP_KEY'));
        $this->callbackUrl = config('sso.unila.callback_url');
    }

    /**
     * Generate SSO login URL for redirect.
     *
     * @param string|null $returnUrl URL to return after successful login
     * @return string
     */
    public function getLoginUrl(?string $returnUrl = null): string
    {
        $appKey = $this->appKey;

        // Handle base64 encoded app key
        if (strpos($appKey, 'base64:') === 0) {
            $rawKey = substr($appKey, 7);
            $appKey = 'base64:' . urlencode($rawKey);
        }

        $url = "{$this->ssoBaseUrl}/api/live/v1/auth/login/sso?app_key={$appKey}";

        // Add return URL if provided
        if ($returnUrl) {
            $url .= '&return_url=' . urlencode($returnUrl);
        }

        return $url;
    }

    /**
     * Validate and decode SSO token from callback.
     *
     * @param string $token JWT token from SSO callback
     * @return object Decoded token payload
     * @throws Exception
     */
    public function validateToken(string $token): object
    {
        $tokenParts = explode('.', $token);

        if (count($tokenParts) !== 3) {
            throw new Exception("Invalid token format", 400);
        }

        [$headerEncoded, $payloadEncoded, $signatureProvided] = $tokenParts;

        // Decode header and payload
        $header = base64_decode($headerEncoded);
        $payload = base64_decode($payloadEncoded);
        $signatureProvided = str_replace(' ', '+', $signatureProvided);

        $payloadDecoded = json_decode($payload);

        if (!is_object($payloadDecoded)) {
            throw new Exception("Invalid token payload", 400);
        }

        // Validate required claims
        $requiredClaims = [
            'id_aplikasi',
            'url_aplikasi',
            'id_pengguna',
            'username',
            'nm_pengguna',
            'peran_pengguna',
            'id_sdm_pengguna',
            'id_pd_pengguna',
            'email',
            'token_dibuat',
            'token_kadarluwasa',
            'asal_domain',
            'ip_address',
            'sso'
        ];

        foreach ($requiredClaims as $claim) {
            if (!property_exists($payloadDecoded, $claim)) {
                throw new Exception("Missing required claim: {$claim}", 400);
            }
        }

        // Validate SSO flag
        if (!isset($payloadDecoded->sso) || $payloadDecoded->sso != 1) {
            throw new Exception("Invalid SSO token", 401);
        }

        // Check token expiration
        $expiration = $payloadDecoded->token_kadarluwasa;
        $isExpired = ($expiration - time()) < 0;

        if ($isExpired) {
            throw new Exception("Token expired", 401);
        }

        // Validate signature
        $base64UrlHeader = base64_encode($header);
        $base64UrlPayload = base64_encode($payload);
        $signature = hash_hmac('SHA256', "{$base64UrlHeader}.{$base64UrlPayload}", $this->jwtSecret, true);
        $base64UrlSignature = base64_encode($signature);

        if ($base64UrlSignature !== $signatureProvided) {
            throw new Exception("Invalid token signature", 401);
        }

        return $payloadDecoded;
    }

    /**
     * Find or create user from SSO token data.
     *
     * @param object $tokenData Decoded SSO token
     * @return User|null
     */
    public function findOrCreateUser(object $tokenData): ?User
    {
        try {
            // Try to find existing user by SSO ID (id_pengguna from SSO)
            $user = User::where('sso_id', $tokenData->id_pengguna)
                ->where('is_active', true)
                ->first();

            if ($user) {
                // Update user data from SSO
                $user->update([
                    'name' => $tokenData->nm_pengguna,
                    'email' => $tokenData->email,
                    'username' => $tokenData->username,
                    'role' => $this->mapSsoRole($tokenData->peran_pengguna),
                    'npm' => $tokenData->id_pd_pengguna ?? null,
                    'nip' => $tokenData->id_sdm_pengguna ?? null,
                ]);

                return $user;
            }

            // Check if user exists in legacy database (man_akses.pengguna)
            $legacyUser = $this->findLegacyUser($tokenData->username);

            if ($legacyUser) {
                // Migrate legacy user to new system
                return $this->migrateLegacyUser($legacyUser, $tokenData);
            }

            // Create new user
            return $this->createNewUser($tokenData);

        } catch (Exception $e) {
            Log::error('SSO User Creation Error: ' . $e->getMessage(), [
                'token_data' => $tokenData,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Find user in legacy database.
     *
     * @param string $username
     * @return object|null
     */
    private function findLegacyUser(string $username): ?object
    {
        try {
            return DB::connection('sqlsrv') // Adjust connection name
                ->table('man_akses.pengguna')
                ->where('username', $username)
                ->where('soft_delete', 0)
                ->where('a_sso', 1)
                ->first();
        } catch (Exception $e) {
            Log::warning('Legacy user lookup failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Migrate legacy user to new system.
     *
     * @param object $legacyUser
     * @param object $tokenData
     * @return User
     */
    private function migrateLegacyUser(object $legacyUser, object $tokenData): User
    {
        return User::create([
            'sso_id' => $tokenData->id_pengguna,
            'username' => $tokenData->username,
            'name' => $tokenData->nm_pengguna,
            'email' => $tokenData->email,
            'role' => $this->mapSsoRole($tokenData->peran_pengguna),
            'npm' => $tokenData->id_pd_pengguna ?? null,
            'nip' => $tokenData->id_sdm_pengguna ?? null,
            'is_active' => $legacyUser->approval_pengguna == 1,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Create new user from SSO data.
     *
     * @param object $tokenData
     * @return User
     */
    private function createNewUser(object $tokenData): User
    {
        return User::create([
            'sso_id' => $tokenData->id_pengguna,
            'username' => $tokenData->username,
            'name' => $tokenData->nm_pengguna,
            'email' => $tokenData->email,
            'role' => $this->mapSsoRole($tokenData->peran_pengguna),
            'npm' => $tokenData->id_pd_pengguna ?? null,
            'nip' => $tokenData->id_sdm_pengguna ?? null,
            'is_active' => true, // Default active for new SSO users
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Map SSO role to application role.
     *
     * @param string|array $ssoRole
     * @return string
     */
    private function mapSsoRole($ssoRole): string
    {
        // If array, get first role
        if (is_array($ssoRole)) {
            $ssoRole = $ssoRole[0] ?? 'user';
        }

        // Map SSO roles to app roles
        $roleMap = [
            'mahasiswa' => 'mahasiswa',
            'dosen' => 'dosen',
            'tendik' => 'tendik',
            'alumni' => 'alumni',
            'admin' => 'admin',
        ];

        return $roleMap[strtolower($ssoRole)] ?? 'user';
    }

    /**
     * Get user data from SSO token.
     *
     * @param object $tokenData
     * @return array
     */
    public function extractUserData(object $tokenData): array
    {
        return [
            'sso_id' => $tokenData->id_pengguna,
            'username' => $tokenData->username,
            'name' => $tokenData->nm_pengguna,
            'email' => $tokenData->email,
            'role' => $this->mapSsoRole($tokenData->peran_pengguna),
            'npm' => $tokenData->id_pd_pengguna ?? null,
            'nip' => $tokenData->id_sdm_pengguna ?? null,
            'id_aplikasi' => $tokenData->id_aplikasi,
            'ip_address' => $tokenData->ip_address,
            'asal_domain' => $tokenData->asal_domain,
        ];
    }

    /**
     * Verify user is approved/active in legacy system.
     *
     * @param string $username
     * @return bool
     */
    public function isUserApproved(string $username): bool
    {
        $legacyUser = $this->findLegacyUser($username);

        if (!$legacyUser) {
            return true; // New users are approved by default
        }

        return $legacyUser->approval_pengguna == 1;
    }
}
