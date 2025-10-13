<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

/**
 * Redis Cache Service untuk Auth System
 *
 * Best Practice untuk caching:
 * 1. Cache data yang sering diakses (user sessions, active tokens)
 * 2. Set TTL sesuai kebutuhan (jangan permanent)
 * 3. Invalidate cache saat data berubah (logout, revoke)
 * 4. Fallback ke database jika cache miss
 * 5. Use key patterns untuk easy cleanup
 */
class CacheService
{
    // Cache Key Prefixes
    const PREFIX_USER_SESSION = 'auth:user:session:';
    const PREFIX_USER_TOKENS = 'auth:user:tokens:';
    const PREFIX_JWT_LOG = 'auth:jwt:log:';
    const PREFIX_REFRESH_TOKEN = 'auth:refresh:';
    const PREFIX_TOKEN_META = 'token:';
    const PREFIX_BLACKLIST = 'blacklist:';

    // Cache TTL (in seconds)
    const TTL_USER_SESSION = 900;      // 15 minutes
    const TTL_USER_TOKENS = 900;       // 15 minutes
    const TTL_JWT_LOG = 300;           // 5 minutes
    const TTL_REFRESH_TOKEN = 604800;  // 7 days

    /**
     * Cache user active sessions
     *
     * @param string $userId
     * @param array $sessions
     * @param int|null $ttl
     * @return bool
     */
    public function cacheUserSessions(string $userId, array $sessions, ?int $ttl = null): bool
    {
        try {
            $key = self::PREFIX_USER_SESSION . $userId;
            $ttl = $ttl ?? self::TTL_USER_SESSION;

            Redis::setex($key, $ttl, json_encode($sessions));

            Log::debug("Cached user sessions", [
                'user_id' => $userId,
                'session_count' => count($sessions),
                'ttl' => $ttl
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to cache user sessions: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get cached user sessions
     *
     * @param string $userId
     * @return array|null
     */
    public function getUserSessions(string $userId): ?array
    {
        try {
            $key = self::PREFIX_USER_SESSION . $userId;
            $cached = Redis::get($key);

            if ($cached) {
                Log::debug("Cache HIT for user sessions", ['user_id' => $userId]);
                return json_decode($cached, true);
            }

            Log::debug("Cache MISS for user sessions", ['user_id' => $userId]);
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get cached sessions: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Cache user active tokens count
     *
     * @param string $userId
     * @param int $tokenCount
     * @param int|null $ttl
     * @return bool
     */
    public function cacheUserTokensCount(string $userId, int $tokenCount, ?int $ttl = null): bool
    {
        try {
            $key = self::PREFIX_USER_TOKENS . $userId;
            $ttl = $ttl ?? self::TTL_USER_TOKENS;

            Redis::setex($key, $ttl, $tokenCount);

            Log::debug("Cached user tokens count", [
                'user_id' => $userId,
                'count' => $tokenCount,
                'ttl' => $ttl
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to cache tokens count: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get cached user tokens count
     *
     * @param string $userId
     * @return int|null
     */
    public function getUserTokensCount(string $userId): ?int
    {
        try {
            $key = self::PREFIX_USER_TOKENS . $userId;
            $cached = Redis::get($key);

            if ($cached !== null && $cached !== false) {
                Log::debug("Cache HIT for tokens count", ['user_id' => $userId]);
                return (int) $cached;
            }

            Log::debug("Cache MISS for tokens count", ['user_id' => $userId]);
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get cached tokens count: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Cache JWT logs for user
     *
     * @param string $userId
     * @param array $logs
     * @param int|null $ttl
     * @return bool
     */
    public function cacheJwtLogs(string $userId, array $logs, ?int $ttl = null): bool
    {
        try {
            $key = self::PREFIX_JWT_LOG . $userId;
            $ttl = $ttl ?? self::TTL_JWT_LOG;

            Redis::setex($key, $ttl, json_encode($logs));

            Log::debug("Cached JWT logs", [
                'user_id' => $userId,
                'log_count' => count($logs),
                'ttl' => $ttl
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to cache JWT logs: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get cached JWT logs
     *
     * @param string $userId
     * @return array|null
     */
    public function getJwtLogs(string $userId): ?array
    {
        try {
            $key = self::PREFIX_JWT_LOG . $userId;
            $cached = Redis::get($key);

            if ($cached) {
                Log::debug("Cache HIT for JWT logs", ['user_id' => $userId]);
                return json_decode($cached, true);
            }

            Log::debug("Cache MISS for JWT logs", ['user_id' => $userId]);
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get cached JWT logs: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Cache refresh token status
     *
     * @param string $jti
     * @param array $tokenData
     * @param int|null $ttl
     * @return bool
     */
    public function cacheRefreshToken(string $jti, array $tokenData, ?int $ttl = null): bool
    {
        try {
            $key = self::PREFIX_REFRESH_TOKEN . $jti;
            $ttl = $ttl ?? self::TTL_REFRESH_TOKEN;

            Redis::setex($key, $ttl, json_encode($tokenData));

            Log::debug("Cached refresh token", [
                'jti' => $jti,
                'ttl' => $ttl
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to cache refresh token: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get cached refresh token
     *
     * @param string $jti
     * @return array|null
     */
    public function getRefreshToken(string $jti): ?array
    {
        try {
            $key = self::PREFIX_REFRESH_TOKEN . $jti;
            $cached = Redis::get($key);

            if ($cached) {
                Log::debug("Cache HIT for refresh token", ['jti' => $jti]);
                return json_decode($cached, true);
            }

            Log::debug("Cache MISS for refresh token", ['jti' => $jti]);
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get cached refresh token: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Invalidate all caches for a user
     * (Called on logout, token revoke, etc.)
     *
     * @param string $userId
     * @return bool
     */
    public function invalidateUserCache(string $userId): bool
    {
        try {
            $keys = [
                self::PREFIX_USER_SESSION . $userId,
                self::PREFIX_USER_TOKENS . $userId,
                self::PREFIX_JWT_LOG . $userId,
            ];

            foreach ($keys as $key) {
                Redis::del($key);
            }

            Log::info("Invalidated all caches for user", ['user_id' => $userId]);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to invalidate user cache: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Invalidate refresh token cache
     * (Called when token is revoked)
     *
     * @param string $jti
     * @return bool
     */
    public function invalidateRefreshToken(string $jti): bool
    {
        try {
            $key = self::PREFIX_REFRESH_TOKEN . $jti;
            Redis::del($key);

            Log::info("Invalidated refresh token cache", ['jti' => $jti]);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to invalidate refresh token: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get cache statistics (for monitoring)
     *
     * @return array
     */
    public function getCacheStats(): array
    {
        try {
            $patterns = [
                'user_sessions' => self::PREFIX_USER_SESSION . '*',
                'user_tokens' => self::PREFIX_USER_TOKENS . '*',
                'jwt_logs' => self::PREFIX_JWT_LOG . '*',
                'refresh_tokens' => self::PREFIX_REFRESH_TOKEN . '*',
                'token_meta' => self::PREFIX_TOKEN_META . '*',
                'blacklist' => self::PREFIX_BLACKLIST . '*',
            ];

            $stats = [];
            foreach ($patterns as $name => $pattern) {
                $keys = Redis::keys($pattern);
                $stats[$name] = count($keys);
            }

            // Get Redis memory info
            $info = Redis::info('memory');
            $stats['memory_used'] = $info['used_memory_human'] ?? 'unknown';

            return $stats;
        } catch (\Exception $e) {
            Log::error("Failed to get cache stats: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Clear all auth-related caches (DANGER - use with caution!)
     *
     * @return bool
     */
    public function clearAllAuthCache(): bool
    {
        try {
            $patterns = [
                self::PREFIX_USER_SESSION . '*',
                self::PREFIX_USER_TOKENS . '*',
                self::PREFIX_JWT_LOG . '*',
                self::PREFIX_REFRESH_TOKEN . '*',
            ];

            $totalDeleted = 0;
            foreach ($patterns as $pattern) {
                $keys = Redis::keys($pattern);
                if (!empty($keys)) {
                    Redis::del(...$keys);
                    $totalDeleted += count($keys);
                }
            }

            Log::warning("Cleared ALL auth caches", ['keys_deleted' => $totalDeleted]);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to clear auth cache: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if Redis is available
     *
     * @return bool
     */
    public function isRedisAvailable(): bool
    {
        try {
            Redis::ping();
            return true;
        } catch (\Exception $e) {
            Log::error("Redis not available: " . $e->getMessage());
            return false;
        }
    }
}
