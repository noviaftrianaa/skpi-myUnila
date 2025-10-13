<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\TokenBlacklist;
use App\Models\User;
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
     */
    public function generateTokens(User $user, array $metadata = []): array
    {
        $accessToken = $this->generateAccessToken($user);
        $refreshToken = $this->generateRefreshToken($user, $metadata);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken['token'],
            'token_type' => 'Bearer',
            'expires_in' => $this->accessTtl,
        ];
    }

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
     */
    public function generateAccessToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'iat' => $now,
            'exp' => $now + $this->accessTtl,
            'nbf' => $now,
            'sub' => $user->id,
            'jti' => Str::uuid()->toString(),
            'type' => 'access',
            'user' => [
                'id' => $user->id,
                'sso_id' => $user->sso_id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'npm' => $user->npm,
                'nip' => $user->nip,
            ],
        ];

        $token = JWT::encode($payload, $this->secret, $this->algo);

        // Store token metadata in Redis for quick validation
        $this->storeTokenMetadata($payload['jti'], [
            'user_id' => $user->id,
            'type' => 'access',
            'expires_at' => $payload['exp'],
        ], $this->accessTtl);

        return $token;
    }

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
     */
    public function generateRefreshToken(User $user, array $metadata = []): array
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
            'sub' => $user->id,
            'jti' => $tokenId,
            'type' => 'refresh',
        ];

        $token = JWT::encode($payload, $this->secret, $this->algo);

        // Store refresh token in database
        RefreshToken::create([
            'user_id' => $user->id,
            'token_id' => $tokenId,
            'token_hash' => $tokenHash,
            'device_name' => $metadata['device_name'] ?? null,
            'device_type' => $metadata['device_type'] ?? 'web',
            'ip_address' => $metadata['ip_address'] ?? request()->ip(),
            'user_agent' => $metadata['user_agent'] ?? request()->userAgent(),
            'expires_at' => now()->addSeconds($this->refreshTtl),
        ]);

        // Store in Redis for quick validation
        $this->storeTokenMetadata($tokenId, [
            'user_id' => $user->id,
            'type' => 'refresh',
            'token_hash' => $tokenHash,
            'expires_at' => $payload['exp'],
        ], $this->refreshTtl);

        return [
            'token' => $token,
            'raw_token' => $rawToken, // Only for cookie storage
            'token_id' => $tokenId,
        ];
    }

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
     */
    public function generateMfaTempToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'iat' => $now,
            'exp' => $now + $this->mfaTempTtl,
            'nbf' => $now,
            'sub' => $user->id,
            'jti' => Str::uuid()->toString(),
            'type' => 'mfa_temp',
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    /**
     * Validate and decode token.
     */
    public function validateToken(string $token): ?object
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algo));

            // Check if token is blacklisted
            if ($this->isBlacklisted($decoded->jti)) {
                return null;
            }

            // Verify token exists in Redis/Database
            if (!$this->tokenExists($decoded->jti)) {
                return null;
            }

            return $decoded;
        } catch (\Exception $e) {
            \Log::error('Token validation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Refresh access token using refresh token.
     */
    public function refreshAccessToken(string $refreshToken, string $rawToken): ?array
    {
        $decoded = $this->validateToken($refreshToken);

        if (!$decoded || $decoded->type !== 'refresh') {
            return null;
        }

        // Verify raw token hash matches
        $tokenHash = hash('sha256', $rawToken);
        $storedToken = RefreshToken::where('token_id', $decoded->jti)
            ->where('is_revoked', false)
            ->first();

        if (!$storedToken || $storedToken->token_hash !== $tokenHash) {
            return null;
        }

        if ($storedToken->isExpired()) {
            return null;
        }

        // Get user
        $user = User::find($decoded->sub);
        if (!$user || !$user->is_active) {
            return null;
        }

        // Mark refresh token as used
        $storedToken->markAsUsed();

        // Rotate refresh token (optional but recommended)
        $oldTokenId = $decoded->jti;
        $newTokens = $this->generateTokens($user, [
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Revoke old refresh token
        $storedToken->revoke('rotated');

        // Log rotation in history
        \DB::table('refresh_token_history')->insert([
            'user_id' => $user->id,
            'old_token_id' => $oldTokenId,
            'new_token_id' => $this->extractTokenId($newTokens['refresh_token']),
            'ip_address' => request()->ip(),
            'rotated_at' => now(),
        ]);

        return $newTokens;
    }

    /**
     * Revoke all tokens for a user.
     */
    public function revokeAllTokens(User $user, string $reason = 'logout'): void
    {
        // Revoke all refresh tokens
        RefreshToken::where('user_id', $user->id)
            ->where('is_revoked', false)
            ->update([
                'is_revoked' => true,
                'revoked_at' => now(),
                'revoked_reason' => $reason,
            ]);

        // Clear Redis cache for user tokens
        $this->clearUserTokensFromCache($user->id);
    }

    /**
     * Blacklist a token.
     */
    public function blacklistToken(string $tokenId, ?int $userId = null, string $reason = null): void
    {
        $decoded = $this->validateToken($tokenId);
        if (!$decoded) {
            return;
        }

        TokenBlacklist::create([
            'token_id' => $decoded->jti,
            'user_id' => $userId,
            'blacklisted_at' => now(),
            'expires_at' => now()->addSeconds($decoded->exp - time()),
            'reason' => $reason,
        ]);

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

        // Check database
        return TokenBlacklist::isBlacklisted($tokenId);
    }

    /**
     * Store token metadata in Redis.
     */
    private function storeTokenMetadata(string $tokenId, array $metadata, int $ttl): void
    {
        Redis::setex(
            "token:{$tokenId}",
            $ttl,
            json_encode($metadata)
        );
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
        // Delete expired refresh tokens
        RefreshToken::expired()->delete();

        // Delete expired blacklist entries
        TokenBlacklist::expired()->delete();
    }
}
