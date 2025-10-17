<?php

namespace App\Services;

use App\Repositories\TokenRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class TokenService
{
    private string $secret;
    private string $algo;
    private int $accessTtl;
    private int $refreshTtl;
    private int $mfaTempTtl;
    private TokenRepository $tokenRepo;

    public function __construct(TokenRepository $tokenRepo)
    {
        $this->secret = config('jwt.secret');
        $this->algo = config('jwt.algo', 'HS256');
        $this->accessTtl = config('jwt.ttl', 15) * 60; // Convert to seconds
        $this->refreshTtl = config('jwt.refresh_ttl', 10080) * 60; // Convert to seconds
        $this->mfaTempTtl = config('jwt.mfa_temp_ttl', 5) * 60; // Convert to seconds
        $this->tokenRepo = $tokenRepo;
    }

    /**
     * Generate access and refresh tokens for a user.
     * NOTE: User model removed - use generateTokensFromArray instead
     */
    // public function generateTokens(User $user, array $metadata = []): array
    // {
    //     $accessToken = $this->generateAccessToken($user);
    //     $refreshToken = $this->generateRefreshToken($user, $metadata);
    //
    //     return [
    //         'access_token' => $accessToken,
    //         'refresh_token' => $refreshToken['token'],
    //         'token_type' => 'Bearer',
    //         'expires_in' => $this->accessTtl,
    //     ];
    // }

    /**
     * Generate tokens from array data (without User model).
     */
    public function generateTokensFromArray(array $userData, array $metadata = []): array
    {
        $accessToken = $this->generateAccessTokenFromArray($userData);
        $refreshToken = $this->generateRefreshTokenFromArray($userData, $metadata);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken['token'],
            'token_type' => 'Bearer',
            'expires_in' => $this->accessTtl,
        ];
    }

    /**
     * Generate access token (JWT).
     * NOTE: User model removed - use generateAccessTokenFromArray instead
     */
    // public function generateAccessToken(User $user): string
    // {
    //     ...
    // }

    /**
     * Generate access token from array data (without User model).
     */
    public function generateAccessTokenFromArray(array $userData, array $metadata = []): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'iat' => $now,
            'exp' => $now + $this->accessTtl,
            'nbf' => $now,
            'sub' => $userData['id'],
            'jti' => Str::uuid()->toString(),
            'type' => 'access',
            'user' => [
                'id' => $userData['id'],
                'username' => $userData['username'] ?? null,
                'email' => $userData['email'] ?? null,
                'name' => $userData['name'] ?? null,
                'role' => $userData['role'] ?? 'user',
            ],
        ];

        $token = JWT::encode($payload, $this->secret, $this->algo);

        // Store token metadata in Redis for quick validation
        $this->storeTokenMetadata($payload['jti'], [
            'user_id' => $userData['id'],
            'type' => 'access',
            'expires_at' => $payload['exp'],
        ], $this->accessTtl);

        // Log JWT token ke database (logger.log_jwt)
        $this->tokenRepo->logJWT([
            'id_pengguna' => $userData['id'],
            'id_aplikasi' => config('app.aplikasi_id'),
            'token_value' => $token,
            'url' => $metadata['url'] ?? '/api/v1/auth/login',
            'ip_address' => $metadata['ip_address'] ?? request()->ip(),
            'waktu_expired' => date('Y-m-d H:i:s', $payload['exp']),
        ]);

        return $token;
    }

    /**
     * Generate refresh token.
     * NOTE: User model removed - use generateRefreshTokenFromArray instead
     */
    // public function generateRefreshToken(User $user, array $metadata = []): array
    // {
    //     ...
    // }

    /**
     * Generate refresh token from array data (without User model).
     */
    public function generateRefreshTokenFromArray(array $userData, array $metadata = []): array
    {
        $now = time();
        $tokenId = Str::uuid()->toString();
        $rawToken = Str::random(64);
        $tokenHash = hash('sha256', $rawToken);

        $payload = [
            'iss' => config('app.url'),
            'iat' => $now,
            'exp' => $now + $this->refreshTtl,
            'nbf' => $now,
            'sub' => $userData['id'],
            'jti' => $tokenId,
            'type' => 'refresh',
        ];

        $token = JWT::encode($payload, $this->secret, $this->algo);

        // Store in Redis for quick validation
        $this->storeTokenMetadata($tokenId, [
            'user_id' => $userData['id'],
            'type' => 'refresh',
            'token_hash' => $tokenHash,
            'expires_at' => $payload['exp'],
            'device_name' => $metadata['device_name'] ?? null,
            'ip_address' => $metadata['ip_address'] ?? request()->ip(),
        ], $this->refreshTtl);

        // Store refresh token in database (man_akses.refresh_token)
        $this->tokenRepo->createRefreshToken([
            'id_refresh_token' => $tokenId, // JTI
            'token_value' => $token,
            'waktu_expired' => date('Y-m-d H:i:s', $payload['exp']),
        ]);

        return [
            'token' => $token,
            'raw_token' => $rawToken,
            'token_id' => $tokenId,
        ];
    }

    /**
     * Generate temporary token for MFA verification.
     * NOTE: User model removed - not currently used
     */
    // public function generateMfaTempToken(User $user): string
    // {
    //     ...
    // }

    /**
     * Validate and decode token.
     */
    public function validateToken(string $token): ?object
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algo));

            // Check if token is blacklisted (only if Redis available)
            try {
                if ($this->isBlacklisted($decoded->jti)) {
                    return null;
                }
            } catch (\Exception $e) {
                // Redis not available, skip blacklist check
                \Log::warning('Redis blacklist check failed: ' . $e->getMessage());
            }

            // Check token exists in database (fallback if Redis not available)
            $tokenInDb = $this->tokenRepo->getActiveToken($decoded->sub, config('app.aplikasi_id'));

            // If token not found in DB or expired, still allow if JWT is valid
            // This allows stateless JWT without Redis dependency

            return $decoded;
        } catch (\Exception $e) {
            \Log::error('Token validation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Refresh access token using refresh token.
     * NOTE: User and RefreshToken models removed - not currently used
     */
    // public function refreshAccessToken(string $refreshToken, string $rawToken): ?array
    // {
    //     ...
    // }

    /**
     * Revoke all tokens for a user.
     * NOTE: User and RefreshToken models removed - not currently used
     */
    // public function revokeAllTokens(User $user, string $reason = 'logout'): void
    // {
    //     ...
    // }

    /**
     * Blacklist a token.
     */
    public function blacklistToken(string $tokenId, ?int $userId = null, string $reason = null): void
    {
        $decoded = $this->validateToken($tokenId);
        if (!$decoded) {
            return;
        }

        // TokenBlacklist model removed - only use Redis
        // Add to Redis blacklist
        Redis::setex(
            "blacklist:{$decoded->jti}",
            $decoded->exp - time(),
            '1'
        );
    }

    /**
     * Check if token is blacklisted.
     */
    public function isBlacklisted(string $tokenId): bool
    {
        // Check Redis first (faster)
        if (Redis::exists("blacklist:{$tokenId}")) {
            return true;
        }

        // TokenBlacklist model removed - only use Redis for now
        return false;
    }

    /**
     * Store token metadata in Redis.
     */
    private function storeTokenMetadata(string $tokenId, array $metadata, int $ttl): void
    {
        try {
            Redis::setex(
                "token:{$tokenId}",
                $ttl,
                json_encode($metadata)
            );
        } catch (\Exception $e) {
            // Redis not available, log warning but don't fail
            \Log::warning('Failed to store token in Redis: ' . $e->getMessage());
        }
    }

    /**
     * Check if token exists in cache.
     */
    private function tokenExists(string $tokenId): bool
    {
        return Redis::exists("token:{$tokenId}") > 0;
    }

    /**
     * Clear all tokens for a user from cache.
     */
    private function clearUserTokensFromCache(int $userId): void
    {
        $pattern = "token:*";
        $keys = Redis::keys($pattern);

        foreach ($keys as $key) {
            $data = Redis::get($key);
            if ($data) {
                $metadata = json_decode($data, true);
                if (isset($metadata['user_id']) && $metadata['user_id'] == $userId) {
                    Redis::del($key);
                }
            }
        }
    }

    /**
     * Extract token ID from JWT token.
     */
    private function extractTokenId(string $token): string
    {
        $decoded = $this->validateToken($token);
        return $decoded->jti ?? '';
    }

    /**
     * Clean up expired tokens from database.
     */
    public function cleanupExpiredTokens(): void
    {
        // TokenBlacklist and RefreshToken models removed
        // Redis handles TTL automatically for blacklisted tokens
        // Cleanup is not needed for Redis-based token management
    }
}
